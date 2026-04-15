import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { PublicHeader, Toast } from '../../components/SharedComponents';
import TermsAndConditions from '../../components/TermsAndConditions';
import { supabase, getConfig } from '../../config/supabaseClient';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { sendOrderEmails } from '../../src/lib/sendOrderEmail';

declare global {
    interface Window {
        FlutterwaveCheckout?: (options: any) => void;
    }
}

async function getFunctionErrorMessage(error: any) {
    const fallback = error?.message || 'Server error';
    const context = error?.context;

    if (!context) {
        return fallback;
    }

    try {
        const response = typeof context.clone === 'function' ? context.clone() : context;
        const data = await response.json();
        if (data?.error) {
            return data.error;
        }
        if (data?.message) {
            return data.message;
        }
    } catch {
        // Fall through to text parsing.
    }

    try {
        const response = typeof context.clone === 'function' ? context.clone() : context;
        const text = await response.text();
        if (text) {
            return text;
        }
    } catch {
        // Use the original error message.
    }

    return fallback;
}

// These are read at render time - by then loadConfig() has resolved.
const getFLWPublicKey = () => getConfig()?.flutterwavePublicKey || import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
const isValidFLWPublicKey = (key: string) => /^FLWPUBK-[A-Za-z0-9-]+$/i.test(key.trim());
const NAIRA_SYMBOL = "\u20A6";
const getFunctionsBaseUrl = () =>
    getConfig()?.supabaseFunctionUrl ||
    import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
    'https://xqvapaavywmqswtccfqu.functions.supabase.co';

const CheckoutPage: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart } = useCart();
    const { activeUser } = useAdmin();
    const { user, session } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ msg: string } | null>(null);
    const [tcAgreed, setTcAgreed] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        notes: ''
    });

    React.useEffect(() => {
        if (activeUser) {
            setFormData(prev => ({
                ...prev,
                name: activeUser.fullName || prev.name,
                email: activeUser.email || prev.email,
                phone: activeUser.phone || prev.phone,
                address: activeUser.street || activeUser.address || prev.address,
                city: activeUser.city || prev.city,
                state: activeUser.state || prev.state
            }));
        }
    }, [activeUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Guard: empty cart
        if (cartItems.length === 0) {
            setToast({ msg: "Your cart is empty!" });
            return;
        }

        if (!user || !session?.access_token) {
            setToast({ msg: "Please sign in before checking out." });
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        const flutterwavePublicKey = getFLWPublicKey().trim();

        // Guard: Flutterwave key missing
        if (!flutterwavePublicKey) {
            setToast({ msg: "Payment not configured. Flutterwave public key is missing. Contact support." });
            return;
        }

        if (!isValidFLWPublicKey(flutterwavePublicKey)) {
            setToast({ msg: "Payment not configured. Flutterwave public key is invalid. It should start with FLWPUBK-." });
            return;
        }

        // Guard: Flutterwave SDK not loaded
        if (!window.FlutterwaveCheckout) {
            setToast({ msg: "Payment gateway failed to load. Please refresh the page and try again." });
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1 - Create order record in database
            const { data: createOrderData, error: createOrderError } = await supabase.functions.invoke('create-order', {
                headers: session?.access_token
                    ? { Authorization: `Bearer ${session.access_token}` }
                    : undefined,
                body: {
                    amount: totalPrice,
                    currency: 'NGN',
                    kind: 'product',
                    item_id: null,
                    item_snapshot: {
                        customer: formData,
                        items: cartItems
                    }
                }
            });

            if (createOrderError) {
                console.error("Create order error:", createOrderError);
                const message = await getFunctionErrorMessage(createOrderError);
                setToast({ msg: `Order creation failed: ${message}. Please try again.` });
                setIsSubmitting(false);
                return;
            }

            if (!createOrderData?.order_id || !createOrderData?.tx_ref) {
                console.error("Invalid order response:", createOrderData);
                setToast({ msg: "Order creation returned invalid data. Please try again." });
                setIsSubmitting(false);
                return;
            }

            const { order_id, tx_ref } = createOrderData;

            // Step 2 - Open Flutterwave payment modal
            window.FlutterwaveCheckout({
                public_key: flutterwavePublicKey,
                tx_ref,
                amount: totalPrice,
                currency: "NGN",
                customer: {
                    email: formData.email,
                    phone_number: formData.phone.replace(/[^0-9]/g, '') || '00000000000',
                    name: formData.name.replace(/[^a-zA-Z\s]/g, '').trim() || 'Customer',
                },
                customizations: {
                    title: "GreenLife Solar Solutions",
                    description: `Order payment for ${cartItems.length} item(s)`,
                    logo: "/logo.png",
                },
                callback: async (response: any) => {
                    try {
                        if (!response?.transaction_id) {
                            throw new Error('No transaction ID returned from Flutterwave');
                        }

                        // Step 3 - Verify payment
                        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-flutterwave', {
                            headers: { Authorization: `Bearer ${session.access_token}` },
                            body: {
                                transaction_id: response.transaction_id,
                                tx_ref
                            }
                        });

                        if (verifyError) {
                            console.error("Verification error:", verifyError);
                            const message = await getFunctionErrorMessage(verifyError);
                            throw new Error(`Verification failed: ${message}`);
                        }

                        if (!verifyData || verifyData.status !== 'success') {
                            console.warn("Verification returned non-success:", verifyData);
                            throw new Error(verifyData?.error || 'Payment could not be verified');
                        }

                        // Step 4 - Log order request in greenlife_hub for admin visibility
                        const { error: hubError } = await supabase.from('greenlife_hub').insert([{
                            type: 'request',
                            title: `Paid order from ${formData.name}`,
                            status: 'Completed',
                            description: `Order contains ${cartItems.length} item(s). Total: ${NAIRA_SYMBOL}${totalPrice.toLocaleString()}`,
                            user_id: user.id,
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
                                tx_ref,
                                tcAgreed: true,
                                tcAgreedAt: new Date().toISOString(),
                                paymentConfirmed: true
                            },
                            address: {
                                street: formData.address,
                                city: formData.city,
                                state: formData.state,
                                phone: formData.phone,
                                email: formData.email
                            }
                        }]);

                        if (hubError) {
                            console.warn("Non-critical: Could not log order to hub:", hubError);
                        }

                        const emailResult = await sendOrderEmails({
                            customerName: formData.name,
                            customerEmail: formData.email,
                            customerPhone: formData.phone,
                            orderId: order_id,
                            transactionRef: tx_ref,
                            items: cartItems.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                            })),
                            totalAmount: totalPrice,
                            orderDate: new Date().toISOString()
                        });

                        if (emailResult.success) {
                            setToast({ msg: "Payment successful! Your order has been placed. Check your email for confirmation." });
                        } else {
                            console.warn("Order placed, but one or more emails failed to send:", emailResult);
                            setToast({ msg: "Payment successful! Your order has been placed, but the email confirmation could not be sent right now." });
                        }
                        clearCart();
                        setTimeout(() => navigate(isEmbedded ? '/dashboard?view=orders' : '/'), 2000);
                    } catch (err: any) {
                        console.error("Payment callback error:", err);
                        setToast({ msg: err.message || 'Payment verification failed. Contact support.' });
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                onclose: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (err: any) {
            console.error("Checkout error:", err);
            setToast({ msg: err.message || 'Checkout failed. Please try again.' });
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        const EmptyContent = (
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">production_quantity_limits</span>
                <h2 className="text-2xl font-bold text-forest dark:text-white mb-2">Your cart is empty</h2>
                <p className="text-forest/60 dark:text-white/60 mb-6">Looks like you haven't added any solar solutions yet.</p>
                <button onClick={() => navigate(isEmbedded ? '/dashboard?view=shop' : '/products')} className="px-6 py-3 bg-primary text-forest font-bold rounded-xl hover:scale-105 transition-transform">
                    Browse Products
                </button>
            </main>
        );

        if (isEmbedded) return EmptyContent;

        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
                <PublicHeader />
                {EmptyContent}
            </div>
        );
    }

    if (!user) {
        const LoginRequiredContent = (
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">lock</span>
                <h2 className="text-2xl font-bold text-forest dark:text-white mb-2">Sign in before checkout</h2>
                <p className="text-forest/60 dark:text-white/60 mb-6">
                    We now require an authenticated account to protect orders and payment verification.
                </p>
                <button
                    onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                    className="px-6 py-3 bg-primary text-forest font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    Go to Login
                </button>
            </main>
        );

        if (isEmbedded) return LoginRequiredContent;

        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
                <PublicHeader />
                {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}
                {LoginRequiredContent}
            </div>
        );
    }

    const MainContent = (
        <main className={`flex-1 w-full ${isEmbedded ? '' : 'px-6 py-12'} grid grid-cols-1 lg:grid-cols-2 gap-12`}>
            {/* Order Summary */}
            <div className="order-2 lg:order-1">
                <h2 className="text-2xl font-bold text-forest dark:text-white mb-6">Order Summary</h2>
                <div className="bg-white dark:bg-[#152a17] rounded-3xl p-6 shadow-xl border border-forest/5 dark:border-white/5 space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <div className="size-16 rounded-xl bg-gray-100 dark:bg-black/20 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.img}')` }}></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-forest dark:text-white line-clamp-1">{item.name}</h4>
                                <p className="text-sm text-forest/60 dark:text-white/60">Qty: {item.quantity} x {NAIRA_SYMBOL}{item.price.toLocaleString()}</p>
                            </div>
                            <div className="font-bold text-primary">{NAIRA_SYMBOL}{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    ))}
                    <div className="border-t border-dashed border-forest/10 dark:border-white/10 pt-4 mt-4">
                        <div className="flex justify-between items-center text-xl font-black text-forest dark:text-white">
                            <span>Total</span>
                            <span>{NAIRA_SYMBOL}{totalPrice.toLocaleString()}</span>
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

                    {/* Terms & Conditions */}
                    <TermsAndConditions
                        onAgreedChange={setTcAgreed}
                        onPaymentConfirmedChange={setPaymentConfirmed}
                        showPaymentConfirmation={true}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting || !tcAgreed || !paymentConfirmed}
                        className="w-full bg-primary text-forest h-14 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Place Order"}
                    </button>
                </form>
            </div>
        </main>
    );

    if (isEmbedded) {
        return (
            <div className="relative">
                {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}
                {MainContent}
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
            <PublicHeader />
            {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}
            {MainContent}
        </div>
    );
};

export default CheckoutPage;
