import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useCart } from '../../context/CartContext';
import { Toast } from '../../components/SharedComponents';

const DashboardPackages: React.FC = () => {
    const { packages } = useAdmin();
    const { addToCart } = useCart();
    const [toastMessage, setToastMessage] = React.useState<string | null>(null);

    const handleAddToCart = (pkg: any) => {
        // Map package to a product-like structure for the cart
        const cartItem: any = {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            img: pkg.img || 'https://via.placeholder.com/150?text=Package',
            category: 'Solar Package',
            brand: 'Greenlife', // Default brand
            series: 'Package', // Default series
            eff: 'High', // Default
            spec: pkg.description // Use desc as spec
        };
        addToCart(cartItem, 1);
        setToastMessage(`Added ${pkg.name} to cart`);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Solar Packages</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">All-in-one solutions for your energy needs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.length > 0 ? (
                    packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="h-48 bg-gray-50 dark:bg-black/20 relative overflow-hidden">
                                {pkg.img ? (
                                    <img src={pkg.img} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="material-symbols-outlined text-4xl">inventory_2</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-primary text-forest text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    {pkg.powerCapacity || 'Custom'}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold dark:text-white mb-2">{pkg.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{pkg.description}</p>

                                <div className="space-y-2 mb-6">
                                    {pkg.appliances.slice(0, 3).map((appliance, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                                            {appliance}
                                        </div>
                                    ))}
                                    {pkg.appliances.length > 3 && (
                                        <p className="text-xs text-primary font-bold pl-6">+ {pkg.appliances.length - 3} more items</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Price</p>
                                        <p className="text-lg font-bold text-forest dark:text-white">₦{pkg.price.toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(pkg)}
                                        className="bg-primary text-forest px-4 py-2 rounded-lg font-bold text-sm hover:brightness-105 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">package</span>
                        <p className="text-gray-500">No packages defined yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPackages;
