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
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order History</h2>
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                    Loading your orders...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-in fade-in">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order History</h2>
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between mb-4 md:mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">Order History</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Track the latest fulfillment status for every order.
                    </p>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {orders.length} order{orders.length === 1 ? '' : 's'}
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                    You have not placed any orders yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map((order) => (
                        <button
                            key={order.id}
                            type="button"
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="rounded-3xl border border-gray-100 bg-white p-5 text-left transition hover:border-primary/40 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                        #{order.id.slice(0, 12).toUpperCase()}
                                    </p>
                                    <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                                        {getProductName(order)}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getFulfillmentBadgeClasses(order.fulfillment_status)}`}>
                                            {formatFulfillmentStatus(order.fulfillment_status)}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${getPaymentStatusBadgeClasses(order.status)}`}>
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
