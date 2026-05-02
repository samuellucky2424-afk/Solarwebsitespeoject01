import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useCart } from '../../context/CartContext';
import { Toast } from '../../components/SharedComponents';
import ReviewsSection from '../ReviewsSection';

const DashboardProductDetail: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { inventory } = useAdmin();
    const { addToCart } = useCart();
    const [toastMessage, setToastMessage] = React.useState<string | null>(null);

    // Find the product from inventory
    const product = useMemo(() => {
        if (!productId) return null;
        return inventory.find(p => p.id === productId);
    }, [productId, inventory]);

    // Related products - show 3-4 products from the same category
    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return inventory
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4);
    }, [product, inventory]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, 1);
            setToastMessage(`Added ${product.name} to cart`);
        }
    };

    if (!product) {
        return (
            <div className="space-y-4 md:space-y-6 animate-in fade-in">
                <button
                    onClick={() => navigate('/dashboard?view=shop')}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-6 font-medium"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    Back to Shop
                </button>

                <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Product not found</p>
                    <button
                        onClick={() => navigate('/dashboard?view=shop')}
                        className="bg-primary text-forest px-6 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard?view=shop')}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-medium"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                Back to Shop
            </button>

            {/* Product Details */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8">
                    {/* Product Image */}
                    <div className="bg-gray-50 dark:bg-black/20 rounded-lg p-6 md:p-8 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                        <img
                            src={product.img}
                            alt={product.name}
                            className="max-w-full max-h-[300px] md:max-h-[400px] object-contain"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <span className="text-primary font-bold text-xs md:text-sm uppercase tracking-wider mb-2 md:mb-3 inline-block w-fit">
                            {product.category}
                        </span>

                        <h1 className="text-3xl md:text-4xl font-black text-forest dark:text-white mb-3 md:mb-4">
                            {product.name}
                        </h1>

                        {product.tag && (
                            <span className="bg-primary text-forest text-sm font-bold px-3 py-1 rounded-full inline-block w-fit mb-4">
                                {product.tag}
                            </span>
                        )}

                        <div className="text-3xl md:text-4xl font-black text-primary mb-6 md:mb-8">
                            ₦{product.price.toLocaleString()}
                        </div>

                        {/* Description */}
                        <div className="mb-6 md:mb-8">
                            <h3 className="font-bold text-forest dark:text-white mb-2 md:mb-3 text-base md:text-lg">
                                Description
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                {product.description || "No description available for this product. Contact support for more detailed specifications."}
                            </p>
                        </div>

                        {/* Brand */}
                        {product.brand && (
                            <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200 dark:border-white/10">
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Brand</span>
                                <p className="text-forest dark:text-white font-bold text-base md:text-lg">{product.brand}</p>
                            </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-primary text-forest py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-lg md:text-xl">add_shopping_cart</span>
                                Add to Cart
                            </button>
                            <button
                                onClick={() => navigate('/dashboard?view=checkout')}
                                className="flex-1 bg-forest/10 dark:bg-white/10 text-forest dark:text-white py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-forest/20 dark:hover:bg-white/20 transition-colors"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <ReviewsSection targetId={product.id} targetType="product" />

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div>
                    <h2 className="text-xl md:text-2xl font-bold dark:text-white mb-4 md:mb-6">Related Products</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {relatedProducts.map(relatedProduct => (
                            <div
                                key={relatedProduct.id}
                                onClick={() => navigate(`/shop/${relatedProduct.id}`)}
                                className="bg-white dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10 overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
                            >
                                <div className="aspect-square bg-gray-50 dark:bg-black/20 relative p-3 flex items-center justify-center">
                                    <img
                                        src={relatedProduct.img}
                                        alt={relatedProduct.name}
                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                    />
                                    {relatedProduct.tag && (
                                        <span className="absolute top-2 right-2 bg-primary text-forest text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            {relatedProduct.tag}
                                        </span>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-xs md:text-sm text-forest dark:text-white mb-1 line-clamp-1">
                                        {relatedProduct.name}
                                    </h3>
                                    <p className="text-xs font-bold text-primary">
                                        ₦{relatedProduct.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardProductDetail;
