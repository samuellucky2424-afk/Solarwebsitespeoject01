import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { PublicHeader } from '../../components/SharedComponents';

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
}

interface OrderDetail {
    id: string;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    kind: string;
    item_snapshot?: {
        customer: {
            name: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            notes?: string;
        };
        items: OrderItem[];
    };
}

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!orderId) {
                setError('Order ID not provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data, error: queryError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (queryError) throw queryError;
                if (!data) {
                    setError('Order not found');
                    return;
                }

                setOrder(data);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'processing':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
            case 'pending':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <>
                <PublicHeader />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Order not found'}</p>
                        <button
                            onClick={() => navigate('/dashboard?view=orders')}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 md:py-12 px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/dashboard?view=orders')}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-6 font-medium"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        Back to Orders
                    </button>

                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Order Details
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 font-mono text-xs md:text-sm break-all">ID: {order.id}</p>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                                        order.status
                                    )}`}
                                >
                                    {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Order Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    Order Date
                                </p>
                                <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    Transaction Ref
                                </p>
                                <p className="text-sm md:text-base font-mono text-gray-900 dark:text-white break-all">
                                    {order.tx_ref}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    Currency
                                </p>
                                <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">
                                    {order.currency}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                                    Total Amount
                                </p>
                                <p className="text-sm md:text-base font-bold text-primary">
                                    ₦{order.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Order Items ({items.length})
                        </h2>

                        {items.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {/* Product Image */}
                                        <div className="bg-gray-100 dark:bg-gray-700 aspect-square flex items-center justify-center overflow-hidden">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/placeholder.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full">
                                                    <span className="material-symbols-outlined text-gray-400 text-5xl">
                                                        image
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm md:text-base">
                                                {item.name}
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Unit Price
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        ₦{item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Quantity
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                                                        Subtotal
                                                    </span>
                                                    <span className="font-bold text-primary text-lg">
                                                        ₦{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                                No items in this order
                            </p>
                        )}
                    </div>

                    {/* Customer Information */}
                    {customer && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Delivery Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">
                                        Customer Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                                Full Name
                                            </p>
                                            <p className="text-sm md:text-base text-gray-900 dark:text-white">
                                                {customer.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                                Email
                                            </p>
                                            <p className="text-sm md:text-base text-gray-900 dark:text-white break-all">
                                                {customer.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                                Phone
                                            </p>
                                            <p className="text-sm md:text-base text-gray-900 dark:text-white">
                                                {customer.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">
                                        Delivery Address
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                                Street Address
                                            </p>
                                            <p className="text-sm md:text-base text-gray-900 dark:text-white">
                                                {customer.address}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                                    City
                                                </p>
                                                <p className="text-sm md:text-base text-gray-900 dark:text-white">
                                                    {customer.city}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                                                    State
                                                </p>
                                                <p className="text-sm md:text-base text-gray-900 dark:text-white">
                                                    {customer.state}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {customer.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">
                                        Order Notes
                                    </p>
                                    <p className="text-sm md:text-base text-gray-900 dark:text-white">
                                        {customer.notes}
                                    </p>
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
