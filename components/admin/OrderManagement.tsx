import React, { useEffect, useMemo, useState } from 'react';
import OrderFulfillmentTracker from '../order/OrderFulfillmentTracker';
import {
    AdminOrderRecord,
    adminListOrders,
    adminUpdateOrderFulfillmentStatus,
} from '../../src/lib/supabaseFunctions';
import {
    ORDER_FULFILLMENT_STEPS,
    type FulfillmentStatus,
    formatFulfillmentStatus,
    formatPaymentStatus,
    getFulfillmentBadgeClasses,
    getPaymentStatusBadgeClasses,
    normalizeFulfillmentStatus,
} from '../../src/lib/orderTracking';

const STATUS_BUTTON_STYLES: Record<FulfillmentStatus, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300',
    confirmed: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-700/40 dark:bg-blue-900/20 dark:text-blue-300',
    in_transit: 'border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 dark:border-purple-700/40 dark:bg-purple-900/20 dark:text-purple-300',
    delivered: 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300',
};

const formatMoney = (amount: number, currency?: string) =>
    `${currency || 'NGN'} ${Number(amount || 0).toLocaleString()}`;

const formatDateTime = (value?: string | null) =>
    value
        ? new Date(value).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'N/A';

const getCustomerName = (order: AdminOrderRecord) =>
    order.item_snapshot?.customer?.name || 'Guest customer';

const getCustomerEmail = (order: AdminOrderRecord) =>
    order.item_snapshot?.customer?.email || 'No email provided';

const OrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [draftStatus, setDraftStatus] = useState<FulfillmentStatus>('pending');
    const [saving, setSaving] = useState(false);
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    const loadOrders = async (preserveSelection = true) => {
        setLoading(true);
        setError(null);

        try {
            const data = await adminListOrders();
            setOrders(data);

            setSelectedOrderId((prev) => {
                if (preserveSelection && prev && data.some((order) => order.id === prev)) {
                    return prev;
                }

                return data[0]?.id || null;
            });
        } catch (err: any) {
            console.error('Failed to load orders:', err);
            setError(err?.message || 'Failed to load orders');
            setOrders([]);
            setSelectedOrderId(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadOrders(false);
    }, []);

    const filteredOrders = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return orders;

        return orders.filter((order) => {
            const customer = order.item_snapshot?.customer;
            return [
                order.id,
                order.tx_ref,
                customer?.name,
                customer?.email,
                customer?.phone,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query));
        });
    }, [orders, searchQuery]);

    const selectedOrder = useMemo(
        () => orders.find((order) => order.id === selectedOrderId) || null,
        [orders, selectedOrderId]
    );

    useEffect(() => {
        if (!selectedOrder) return;
        setDraftStatus(normalizeFulfillmentStatus(selectedOrder.fulfillment_status));
    }, [selectedOrder]);

    const pendingCount = orders.filter((order) => normalizeFulfillmentStatus(order.fulfillment_status) === 'pending').length;
    const transitCount = orders.filter((order) => normalizeFulfillmentStatus(order.fulfillment_status) === 'in_transit').length;
    const deliveredCount = orders.filter((order) => normalizeFulfillmentStatus(order.fulfillment_status) === 'delivered').length;

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        setSaving(true);
        setError(null);
        setFlashMessage(null);

        try {
            const updatedOrder = await adminUpdateOrderFulfillmentStatus(selectedOrder.id, draftStatus);

            setOrders((prev) =>
                prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
            );
            setFlashMessage(`Tracking status updated to ${formatFulfillmentStatus(updatedOrder.fulfillment_status)}.`);
        } catch (err: any) {
            console.error('Failed to update order status:', err);
            setError(err?.message || 'Failed to update order status');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#cfe7d1] bg-white p-4 shadow-sm dark:border-[#2a3d2c] dark:bg-[#152a17]">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">All Orders</p>
                    <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-700/40 dark:bg-amber-900/20">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Pending Review</p>
                    <p className="mt-3 text-3xl font-black text-amber-900 dark:text-amber-100">{pendingCount}</p>
                </div>
                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 shadow-sm dark:border-purple-700/40 dark:bg-purple-900/20">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">In Transit</p>
                    <p className="mt-3 text-3xl font-black text-purple-900 dark:text-purple-100">{transitCount}</p>
                    <p className="mt-1 text-xs text-purple-700/80 dark:text-purple-300/80">{deliveredCount} delivered</p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
                <section className="rounded-3xl border border-[#cfe7d1] bg-white shadow-sm dark:border-[#2a3d2c] dark:bg-[#152a17]">
                    <div className="flex flex-col gap-3 border-b border-[#cfe7d1] p-5 dark:border-[#2a3d2c] md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Tracking</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select an order to update its backend fulfillment status.</p>
                        </div>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search order, customer, or ref..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-black/20 md:w-80"
                            />
                            <button
                                type="button"
                                onClick={() => void loadOrders()}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No orders found.</div>
                    ) : (
                        <div className="max-h-[720px] overflow-y-auto p-4">
                            <div className="grid gap-3">
                                {filteredOrders.map((order) => {
                                    const isSelected = order.id === selectedOrderId;
                                    const customer = order.item_snapshot?.customer;

                                    return (
                                        <button
                                            key={order.id}
                                            type="button"
                                            onClick={() => setSelectedOrderId(order.id)}
                                            className={`rounded-2xl border p-4 text-left transition ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-primary/40 hover:bg-gray-50 dark:border-white/10 dark:bg-black/10 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                        #{order.id.slice(0, 12).toUpperCase()}
                                                    </p>
                                                    <h3 className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">
                                                        {customer?.name || 'Guest customer'}
                                                    </h3>
                                                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                                        {customer?.email || order.tx_ref}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getFulfillmentBadgeClasses(order.fulfillment_status)}`}>
                                                        {formatFulfillmentStatus(order.fulfillment_status)}
                                                    </span>
                                                    <p className="mt-2 text-sm font-black text-primary">
                                                        {formatMoney(order.amount, order.currency)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <span>{formatDateTime(order.created_at)}</span>
                                                <span>{order.item_snapshot?.items?.length || 0} item(s)</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-3xl border border-[#cfe7d1] bg-white shadow-sm dark:border-[#2a3d2c] dark:bg-[#152a17]">
                    {!selectedOrder ? (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Select an order to view details.
                        </div>
                    ) : (
                        <div className="space-y-6 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Selected Order</p>
                                    <h2 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                                        {getCustomerName(selectedOrder)}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {selectedOrder.tx_ref}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getPaymentStatusBadgeClasses(selectedOrder.status)}`}>
                                        {formatPaymentStatus(selectedOrder.status)}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getFulfillmentBadgeClasses(selectedOrder.fulfillment_status)}`}>
                                        {formatFulfillmentStatus(selectedOrder.fulfillment_status)}
                                    </span>
                                </div>
                            </div>

                            <OrderFulfillmentTracker
                                status={selectedOrder.fulfillment_status}
                                updatedAt={selectedOrder.fulfillment_updated_at}
                            />

                            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-black/20">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Update Tracking Status</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {ORDER_FULFILLMENT_STEPS.map((status) => {
                                        const active = draftStatus === status;
                                        return (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setDraftStatus(status)}
                                                className={`rounded-2xl border px-4 py-3 text-left transition ${STATUS_BUTTON_STYLES[status]} ${active ? 'ring-2 ring-offset-2 ring-offset-white ring-primary dark:ring-offset-[#152a17]' : ''}`}
                                            >
                                                <p className="text-sm font-bold">{formatFulfillmentStatus(status)}</p>
                                                <p className="mt-1 text-xs opacity-80">
                                                    {status === 'pending'
                                                        ? 'Awaiting confirmation'
                                                        : status === 'confirmed'
                                                            ? 'Ready for dispatch'
                                                            : status === 'in_transit'
                                                                ? 'Customer package is moving'
                                                                : 'Final customer delivery'}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => void handleUpdateStatus()}
                                        disabled={saving || draftStatus === normalizeFulfillmentStatus(selectedOrder.fulfillment_status)}
                                        className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving ? 'Saving...' : 'Save Status'}
                                    </button>
                                    {flashMessage && (
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {flashMessage}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Customer</p>
                                    <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p><span className="font-bold">Name:</span> {getCustomerName(selectedOrder)}</p>
                                        <p><span className="font-bold">Email:</span> {getCustomerEmail(selectedOrder)}</p>
                                        <p><span className="font-bold">Phone:</span> {selectedOrder.item_snapshot?.customer?.phone || 'N/A'}</p>
                                        <p><span className="font-bold">Address:</span> {selectedOrder.item_snapshot?.customer?.address || 'N/A'}</p>
                                        <p><span className="font-bold">City/State:</span> {selectedOrder.item_snapshot?.customer?.city || 'N/A'}{selectedOrder.item_snapshot?.customer?.state ? `, ${selectedOrder.item_snapshot?.customer?.state}` : ''}</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Order Meta</p>
                                    <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                        <p><span className="font-bold">Order ID:</span> {selectedOrder.id}</p>
                                        <p><span className="font-bold">Transaction Ref:</span> {selectedOrder.tx_ref}</p>
                                        <p><span className="font-bold">Created:</span> {formatDateTime(selectedOrder.created_at)}</p>
                                        <p><span className="font-bold">Last Tracking Update:</span> {formatDateTime(selectedOrder.fulfillment_updated_at)}</p>
                                        <p><span className="font-bold">Total:</span> {formatMoney(selectedOrder.amount, selectedOrder.currency)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-200 p-4 dark:border-white/10">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Items</p>
                                <div className="mt-4 space-y-3">
                                    {(selectedOrder.item_snapshot?.items || []).length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No items recorded for this order.</p>
                                    ) : (
                                        (selectedOrder.item_snapshot?.items || []).map((item, index) => (
                                            <div
                                                key={`${selectedOrder.id}-${index}`}
                                                className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-white/5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                        {item.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Qty {item.quantity} x {formatMoney(item.price, selectedOrder.currency)}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-black text-primary">
                                                    {formatMoney(item.quantity * item.price, selectedOrder.currency)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="border-t border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default OrderManagement;
