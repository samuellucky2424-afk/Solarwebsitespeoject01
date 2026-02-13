import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient'; // Mock client for now if key missing
// We might need a separate table for orders or use greenlife_hub if mapped there.
// For now, let's assume we fetch from a 'orders' table or mock it if strictly following the 'greenlife_hub' instruction for everything?
// The prompt said: "Order History: Separate this from 'My Systems'. It should only show a list of past purchases"
// It didn't explicitly say Orders are in `greenlife_hub`, but generic items are.
// Let's assume orders might be in a separate table or we use local state/mock for now as per previous UserDashboard.

interface Order {
    id: string;
    product_name: string;
    amount: number;
    status: string;
    created_at: string;
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    // Mock data for initial display until DB connected
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mock fetch
        setOrders([
            { id: "ORD-001", product_name: "Smart Inverter Pro", created_at: "2024-06-12", status: "Shipped", amount: 1299000 },
            { id: "ORD-002", product_name: "Solar Cleaning Kit", created_at: "2024-05-20", status: "Delivered", amount: 89500 },
        ]);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Shipped': return 'text-green-500 font-bold';
            case 'Delivered': return 'text-blue-500 font-bold';
            case 'Processing': return 'text-amber-500 font-bold';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Order History</h2>
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/10">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Order ID</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Product</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Date</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500">Status</th>
                            <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-xs">{order.id}</td>
                                <td className="p-4 font-bold">{order.product_name}</td>
                                <td className="p-4 text-sm text-gray-500">{order.created_at}</td>
                                <td className={`p-4 text-sm ${getStatusColor(order.status)}`}>{order.status}</td>
                                <td className="p-4 text-right font-bold">₦{order.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderHistory;
