import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
    formatFulfillmentStatus,
    formatPaymentStatus,
    getFulfillmentBadgeClasses,
    getPaymentStatusBadgeClasses,
} from '../../src/lib/orderTracking';

interface Order {
    id: string;
    amount: number;
    status: string;
    fulfillment_status?: string;
    fulfillment_updated_at?: string;
    created_at: string;
    tx_ref: string;
    kind: string;
    item_snapshot?: {
        customer?: {
            name?: string;
        };
        items?: Array<{
            name: string;
            quantity: number;
            price: number;
            image_url?: string;
        }>;
    };
}

const OrderHistory: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) {
                setOrders([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const { data, error: queryError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (queryError) throw queryError;
                setOrders(data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('We could not load your orders right now.');
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchOrders();
    }, [user?.id]);

    const formatOrderDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const getProductName = (order: Order) => {
        const items = order.item_snapshot?.items || [];
        if (items.length === 0) return 'Order';
        if (items.length === 1) return items[0].name;
        return `${items[0].name} + ${items.length - 1} more`;
    };

    if (loading) {
        return (
            <div className="animate-in fade-in">
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b0f] dark:text-white mb-2">Order History</h2>
                    <p className="text-[#4c9a66] dark:text-gray-400 text-base">Review your orders and fulfillment status</p>
                </div>
                <div className="rounded-2xl border border-[#d0e5d5] dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-5xl text-primary/40 animate-spin font-light">progress_activity</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-in fade-in">
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b0f] dark:text-white mb-2">Order History</h2>
                    <p className="text-[#4c9a66] dark:text-gray-400 text-base">Review your orders and fulfillment status</p>
                </div>
                <div className="rounded-2xl border border-red-300/50 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-red-600/60 font-light">error_outline</span>
                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0d1b0f] dark:text-white mb-2">Order History</h2>
                    <p className="text-[#4c9a66] dark:text-gray-400 text-base font-medium">Review your orders and fulfillment status</p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold text-sm">
                    <span className="material-symbols-outlined text-base font-light">receipt_long</span>
                    {orders.length} order{orders.length === 1 ? '' : 's'}
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-2xl border border-[#d0e5d5] dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-6xl text-gray-400/60 font-light">shopping_cart</span>
                        <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">No orders yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start shopping to see your orders here</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:gap-6">
                    {orders.map((order) => (
                        <button
                            key={order.id}
                            type="button"
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="rounded-2xl border border-[#d0e5d5] dark:border-white/10 bg-white dark:bg-[#152a17] p-6 md:p-8 text-left transition-all hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/10 dark:hover:bg-white/10 active:scale-95"
                        >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs md:text-sm font-mono font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                                        Order #{order.id.slice(0, 12).toUpperCase()}
                                    </p>
                                    <h3 className="mt-2 text-xl md:text-2xl font-bold text-[#0d1b0f] dark:text-white">
                                        {getProductName(order)}
                                    </h3>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider ${getFulfillmentBadgeClasses(order.fulfillment_status)}`}>
                                            {formatFulfillmentStatus(order.fulfillment_status)}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider ${getPaymentStatusBadgeClasses(order.status)}`}>
                                            {formatPaymentStatus(order.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3 text-sm text-gray-500 dark:text-gray-400 sm:grid-cols-3 lg:min-w-[320px]">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Order Date</p>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                                            {formatOrderDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Tracking</p>
                                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                                            {formatFulfillmentStatus(order.fulfillment_status)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Total</p>
                                        <p className="mt-1 font-semibold text-primary">
                                            NGN {Number(order.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
