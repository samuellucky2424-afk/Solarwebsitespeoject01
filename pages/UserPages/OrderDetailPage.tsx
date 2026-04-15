import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { PublicHeader } from '../../components/SharedComponents';
import { useAuth } from '../../context/AuthContext';
import OrderFulfillmentTracker from '../../components/order/OrderFulfillmentTracker';
import {
    formatFulfillmentStatus,
    formatPaymentStatus,
    getFulfillmentBadgeClasses,
    getPaymentStatusBadgeClasses,
} from '../../src/lib/orderTracking';

interface OrderItem {
    id?: string;
    name: string;
    quantity: number;
    price: number;
    img?: string;
    image_url?: string;
}

interface OrderDetail {
    id: string;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
    fulfillment_status?: string;
    fulfillment_updated_at?: string;
    created_at: string;
    kind: string;
    item_snapshot?: {
        customer?: {
            name?: string;
            email?: string;
            phone?: string;
            address?: string;
            city?: string;
            state?: string;
            notes?: string;
        };
        items?: OrderItem[];
    };
}

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchOrderDetail = async () => {
            if (!orderId) {
                setError('Order ID not provided');
                setLoading(false);
                return;
            }

            if (!user?.id) {
                setError('Please sign in to view this order.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data, error: queryError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .eq('user_id', user.id)
                    .single();

                if (queryError) throw queryError;
                if (!data) {
                    setError('Order not found');
                    return;
                }

                if (isMounted) {
                    setOrder(data);
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                if (isMounted) {
                    setError('Failed to load order details');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void fetchOrderDetail();

        const intervalId = window.setInterval(() => {
            void fetchOrderDetail();
        }, 15000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, [orderId, user?.id]);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    if (loading) {
        return (
            <>
                <PublicHeader />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading order details...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error || !order) {
        return (
            <>
                <PublicHeader />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                    <div className="text-center">
                        <p className="mb-4 text-red-600 dark:text-red-400">{error || 'Order not found'}</p>
                        <button
                            onClick={() => navigate('/dashboard?view=orders')}
                            className="rounded-lg bg-primary px-6 py-2 text-white transition hover:bg-primary/90"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const items = order.item_snapshot?.items || [];
    const customer = order.item_snapshot?.customer;

    return (
        <>
            <PublicHeader />
            <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-900 md:px-6 md:py-12">
                <div className="mx-auto max-w-6xl">
                    <button
                        onClick={() => navigate('/dashboard?view=orders')}
                        className="mb-6 flex items-center gap-2 font-medium text-primary transition hover:text-primary/80"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Back to Orders
                    </button>

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                    Order Details
                                </p>
                                <h1 className="mt-2 text-2xl font-black text-gray-900 dark:text-white md:text-3xl">
                                    #{order.id.slice(0, 12).toUpperCase()}
                                </h1>
                                <p className="mt-2 break-all font-mono text-xs text-gray-500 dark:text-gray-400">
                                    Transaction Ref: {order.tx_ref}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${getFulfillmentBadgeClasses(order.fulfillment_status)}`}>
                                    {formatFulfillmentStatus(order.fulfillment_status)}
                                </span>
                                <span className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${getPaymentStatusBadgeClasses(order.status)}`}>
                                    {formatPaymentStatus(order.status)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Order Date</p>
                                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Tracking Status</p>
                                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{formatFulfillmentStatus(order.fulfillment_status)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Payment</p>
                                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{formatPaymentStatus(order.status)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Total</p>
                                <p className="mt-2 text-sm font-black text-primary">
                                    {order.currency} {Number(order.amount || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <OrderFulfillmentTracker
                        status={order.fulfillment_status}
                        updatedAt={order.fulfillment_updated_at}
                        className="mb-6"
                    />

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                            Order Items ({items.length})
                        </h2>

                        {items.length > 0 ? (
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {items.map((item, index) => (
                                    <div
                                        key={`${item.id || item.name}-${index}`}
                                        className="overflow-hidden rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg dark:border-gray-700"
                                    >
                                        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            {item.image_url || item.img ? (
                                                <img
                                                    src={item.image_url || item.img}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform hover:scale-105"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <span className="material-symbols-outlined text-5xl text-gray-400">
                                                        inventory_2
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white md:text-base">
                                                {item.name}
                                            </h3>
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Unit Price</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {order.currency} {Number(item.price || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">Quantity</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                                                    <span className="font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                                                    <span className="text-lg font-bold text-primary">
                                                        {order.currency} {Number((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-gray-600 dark:text-gray-400">No items found for this order.</p>
                        )}
                    </div>

                    {customer && (
                        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                                Delivery Information
                            </h2>
                            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                        Customer Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Full Name</p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{customer.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="mt-1 break-all text-sm text-gray-900 dark:text-white">{customer.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Phone</p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{customer.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                        Delivery Address
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Street Address</p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{customer.address || 'N/A'}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">City</p>
                                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{customer.city || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">State</p>
                                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{customer.state || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {customer.notes && (
                                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Order Notes</p>
                                    <p className="mt-2 text-sm text-gray-900 dark:text-white">{customer.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderDetailPage;
