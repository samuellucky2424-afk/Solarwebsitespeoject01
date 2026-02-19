import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';
import { supabase } from '../../config/supabaseClient';

declare global {
    interface Window {
        FlutterwaveCheckout?: (options: any) => void;
    }
}

const FLW_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string | undefined;

const FUNCTIONS_BASE_URL =
    import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
    'https://xqvapaavywmqswtccfqu.functions.supabase.co';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ msg: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!FLW_PUBLIC_KEY) {
            setToast({ msg: "Payment is not configured. Please contact support." });
            return;
        }
        if (!window.FlutterwaveCheckout) {
            setToast({ msg: "Unable to load payment gateway. Please retry." });
            return;
        }

        setIsSubmitting(true);

        if (cartItems.length === 0) {
            setToast({ msg: "Your cart is empty!" });
            setIsSubmitting(false);
            return;
        }

        try {
            // 1) Create an order via Supabase Edge Function
            const createOrderRes = await fetch(`${FUNCTIONS_BASE_URL}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: totalPrice,
                    currency: 'NGN',
                    kind: 'product',
                    item_id: null,
                    item_snapshot: {
                        customer: formData,
                        items: cartItems
                    }
                })
            });

            if (!createOrderRes.ok) {
                throw new Error('Could not create order');
            }

            const { order_id, tx_ref } = await createOrderRes.json();

            // 2) Open Flutterwave Standard Checkout
            window.FlutterwaveCheckout({
                public_key: FLW_PUBLIC_KEY,
                tx_ref,
                amount: totalPrice,
                currency: "NGN",
                customer: {
                    email: formData.email,
                    phonenumber: formData.phone,
                    name: formData.name,
                },
                customizations: {
                    title: "GreenLife Solar Solutions",
                    description: `Order payment for ${cartItems.length} item(s)`,
                    logo: "/logo.png",
                },
                callback: async (response: any) => {
                    try {
                        // 3) Verify payment via Supabase function
                        const verifyRes = await fetch(`${FUNCTIONS_BASE_URL}/verify-flutterwave`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                transaction_id: response.transaction_id,
                                tx_ref
                            })
                        });

                        if (!verifyRes.ok) {
                            throw new Error('Payment verification failed');
                        }

                        // 4) Create an admin-facing request entry for the order
                        const { error } = await supabase.from('greenlife_hub').insert([{
                            type: 'request',
                            title: `Paid order from ${formData.name}`,
                            status: 'Completed',
                            description: `Order contains ${cartItems.length} items. Total: ₦${totalPrice.toLocaleString()}`,
                            metadata: {
                                type: 'Order',
                                customer: {
                                    name: formData.name,
                                    email: formData.email,
                                    phone: formData.phone,
                                    address: `${formData.address}, ${formData.city}, ${formData.state}`
                                },
                                items: cartItems.map(item => ({
                                    id: item.id,
                                    name: item.name,
                                    quantity: item.quantity,
                                    price: item.price
                                })),
                                totalAmount: totalPrice,
                                notes: formData.notes,
                                orderId: order_id,
                                tx_ref
                            },
                            address: {
                                street: formData.address,
                                city: formData.city,
                                state: formData.state,
                                phone: formData.phone,
                                email: formData.email
                            }
                        }]);

                        if (error) {
                            console.error("Order request insert error:", error);
                        }

                        setToast({ msg: "Payment successful! Your order has been placed." });
                        clearCart();
                        setTimeout(() => navigate('/'), 2000);
                    } catch (err) {
                        console.error("Payment verification error:", err);
                        setToast({ msg: "Payment could not be verified. Please contact support." });
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                onclose: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (err) {
            console.error("Checkout error:", err);
            setToast({ msg: "Failed to start payment. Please try again." });
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
                <PublicHeader />
                <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">production_quantity_limits</span>
                    <h2 className="text-2xl font-bold text-forest dark:text-white mb-2">Your cart is empty</h2>
                    <p className="text-forest/60 dark:text-white/60 mb-6">Looks like you haven't added any solar solutions yet.</p>
                    <button onClick={() => navigate('/products')} className="px-6 py-3 bg-primary text-forest font-bold rounded-xl hover:scale-105 transition-transform">
                        Browse Products
                    </button>
                </main>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
            <PublicHeader />
            {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Order Summary */}
                <div className="order-2 lg:order-1">
                    <h2 className="text-2xl font-bold text-forest dark:text-white mb-6">Order Summary</h2>
                    <div className="bg-white dark:bg-[#152a17] rounded-3xl p-6 shadow-xl border border-forest/5 dark:border-white/5 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="size-16 rounded-xl bg-gray-100 dark:bg-black/20 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.img}')` }}></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-forest dark:text-white line-clamp-1">{item.name}</h4>
                                    <p className="text-sm text-forest/60 dark:text-white/60">Qty: {item.quantity} x ₦{item.price.toLocaleString()}</p>
                                </div>
                                <div className="font-bold text-primary">₦{(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                        ))}
                        <div className="border-t border-dashed border-forest/10 dark:border-white/10 pt-4 mt-4">
                            <div className="flex justify-between items-center text-xl font-black text-forest dark:text-white">
                                <span>Total</span>
                                <span>₦{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="order-1 lg:order-2">
                    <h2 className="text-2xl font-bold text-forest dark:text-white mb-6">Shipping Details</h2>
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#152a17] p-8 rounded-3xl shadow-xl border border-forest/5 dark:border-white/5 space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-forest/80 dark:text-white/80">Full Name</label>
                            <input required name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-forest/80 dark:text-white/80">Email</label>
                                <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-forest/80 dark:text-white/80">Phone</label>
                                <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="+234..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-forest/80 dark:text-white/80">Street Address</label>
                            <input required name="address" value={formData.address} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="123 Solar St" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-forest/80 dark:text-white/80">City</label>
                                <input required name="city" value={formData.city} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="Lagos" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-forest/80 dark:text-white/80">State</label>
                                <input required name="state" value={formData.state} onChange={handleChange} className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary" placeholder="Lagos State" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-forest/80 dark:text-white/80">Order Notes (Optional)</label>
                            <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Any special instructions..." />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-forest h-14 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Place Order"}
                        </button>
                    </form>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
};

export default CheckoutPage;
