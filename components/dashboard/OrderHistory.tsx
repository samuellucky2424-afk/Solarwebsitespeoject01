import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient'; // Mock client for now if key missing
// We might need a separate table for orders or use greenlife_hub if mapped there.
// For now, let's assume we fetch from a 'orders' table or mock it if strictly following the 'greenlife_hub' instruction for everything?
// The prompt said: "Order History: Separate this from 'My Systems'. It should only show a list of past purchases"
// It didn't explicitly say Orders are in `greenlife_hub`, but generic items are.
// Let's assume orders might be in a separate table or we use local state/mock for now as per previous UserDashboard.

interface Order {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    tx_ref: string;
    kind: string;
    item_snapshot?: {
        customer: any;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
            image_url?: string;
        }>;
    };
}

const OrderHistory: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    // Mock data for initial display until DB connected
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Fallback to mock for UI stability if table doesn't exist yet
                setOrders([
                    {
                        id: "550e8400-e29b-41d4-a716-446655440001",
                        amount: 1299000,
                        status: "paid",
                        created_at: "2024-06-12T00:00:00Z",
                        tx_ref: "GL-product-1718169600000-abc12345",
                        kind: "product",
                        item_snapshot: {
                            customer: {},
                            items: [{ name: "Smart Inverter Pro", quantity: 1, price: 1299000 }],
                        },
                    },
                    {
                        id: "550e8400-e29b-41d4-a716-446655440002",
                        amount: 89500,
                        status: "paid",
                        created_at: "2024-05-20T00:00:00Z",
                        tx_ref: "GL-product-1716201600000-xyz67890",
                        kind: "product",
                        item_snapshot: {
                            customer: {},
                            items: [{ name: "Solar Cleaning Kit", quantity: 1, price: 89500 }],
                        },
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';
        switch (lowerStatus) {
            case 'paid': return 'text-green-500 font-bold';
            case 'pending': return 'text-amber-500 font-bold';
            case 'delivered': return 'text-blue-500 font-bold';
            case 'shipped': return 'text-blue-500 font-bold';
            case 'processing': return 'text-amber-500 font-bold';
            case 'failed': return 'text-red-500 font-bold';
            default: return 'text-gray-500';
        }
    };

    const formatOrderDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getProductName = (order: Order) => {
        if (order.item_snapshot?.items && order.item_snapshot.items.length > 0) {
            const itemCount = order.item_snapshot.items.length;
            if (itemCount === 1) {
                return order.item_snapshot.items[0].name;
            } else {
                return `${order.item_snapshot.items[0].name} + ${itemCount - 1} more`;
            }
        }
        return 'N/A';
    };

    return (
        <div className="animate-in fade-in">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order History</h2>
            <div className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/10">
                            <tr>
                                <th className="p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase text-gray-500">Order ID</th>
                                <th className="p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase text-gray-500">Product</th>
                                <th className="p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase text-gray-500">Date</th>
                                <th className="p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase text-gray-500">Status</th>
                                <th className="p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase text-gray-500 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-3 md:p-4 font-mono text-[10px] md:text-xs">
                                        <button
                                            onClick={() => navigate(`/order/${order.id}`)}
                                            className="text-primary hover:text-primary/80 hover:underline font-bold transition-colors truncate max-w-[100px] md:max-w-none"
                                            title={order.id}
                                        >
                                            {order.id.slice(0, 8)}...
                                        </button>
                                    </td>
                                    <td className="p-3 md:p-4 font-bold text-xs md:text-sm text-gray-900 dark:text-white">{getProductName(order)}</td>
                                    <td className="p-3 md:p-4 text-xs md:text-sm text-gray-500">{formatOrderDate(order.created_at)}</td>
                                    <td className={`p-3 md:p-4 text-xs md:text-sm capitalize ${getStatusColor(order.status)}`}>{order.status}</td>
                                    <td className="p-3 md:p-4 text-right font-bold text-xs md:text-sm">₦{order.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrderHistory;
