import React from 'react';
import { useAdmin, ServiceRequest, SolarPackage } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { Toast } from '../../components/SharedComponents';

const DashboardPackages: React.FC = () => {
    const { packages, addRequest, activeUser } = useAdmin();
    const { user } = useAuth();
    const [toastMessage, setToastMessage] = React.useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = React.useState<SolarPackage | null>(null);
    const [requestingPackageId, setRequestingPackageId] = React.useState<string | null>(null);

    const buildPackageRequest = (pkg: SolarPackage): ServiceRequest => ({
        id: `REQ-${Date.now()}`,
        type: 'Package Request',
        title: `Package request for ${pkg.name}`,
        customer: activeUser?.fullName || user?.user_metadata?.full_name || user?.email || 'Greenlife customer',
        email: activeUser?.email || user?.email || '',
        phone: activeUser?.phone || user?.phone || user?.user_metadata?.phone || '',
        address: activeUser?.address || user?.user_metadata?.address || 'Address to be confirmed',
        date: new Date().toLocaleDateString(),
        status: 'New',
        priority: 'Normal',
        description: `Requested package: ${pkg.name}${pkg.powerCapacity ? ` (${pkg.powerCapacity})` : ''}.`,
        packageId: pkg.id
    });

    const handleRequestPackage = async (pkg: SolarPackage, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        setRequestingPackageId(pkg.id);
        const success = await addRequest(buildPackageRequest(pkg));

        setToastMessage(
            success
                ? `Package request sent for ${pkg.name}`
                : `Unable to submit request for ${pkg.name}`
        );

        if (success) {
            setSelectedPackage(null);
        }

        setRequestingPackageId(null);
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
                    packages.map((pkg) => {
                        const isSubmitting = requestingPackageId === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all group cursor-pointer"
                            >
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

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold">Price</p>
                                            <p className="text-lg font-bold text-forest dark:text-white">NGN {pkg.price.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleRequestPackage(pkg, e)}
                                            disabled={isSubmitting}
                                            className="bg-primary text-forest px-4 py-2 rounded-lg font-bold text-sm hover:brightness-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                {isSubmitting ? 'progress_activity' : 'assignment_add'}
                                            </span>
                                            {isSubmitting ? 'Submitting...' : 'Request Package'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">package</span>
                        <p className="text-gray-500">No packages defined yet.</p>
                    </div>
                )}
            </div>

            {selectedPackage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedPackage(null)}
                    ></div>
                    <div className="relative bg-white dark:bg-[#152a17] rounded-3xl p-6 md:p-10 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedPackage(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors z-10"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 dark:bg-black/20 rounded-2xl overflow-hidden relative min-h-[300px]">
                                {selectedPackage.img ? (
                                    <img
                                        src={selectedPackage.img}
                                        alt={selectedPackage.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <span className="material-symbols-outlined text-6xl">inventory_2</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-primary text-forest text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    {selectedPackage.powerCapacity || 'Custom'}
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2">
                                    Solar Package
                                </span>
                                <h2 className="text-3xl font-black text-forest dark:text-white mb-4 line-clamp-3">
                                    {selectedPackage.name}
                                </h2>

                                <div className="text-2xl font-bold text-forest dark:text-white mb-6">
                                    NGN {selectedPackage.price.toLocaleString()}
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-forest dark:text-white mb-2">Description</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-line">
                                        {selectedPackage.description || "No description available."}
                                    </p>

                                    <div className="mb-6">
                                        <h4 className="font-bold text-forest dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">power</span>
                                            Supported Appliances
                                        </h4>
                                        <ul className="space-y-2 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                                            {selectedPackage.appliances.map((appliance, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
                                                    <span>{appliance}</span>
                                                </li>
                                            ))}
                                            {selectedPackage.appliances.length === 0 && (
                                                <li className="text-sm text-gray-500 italic">No appliances specified</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRequestPackage(selectedPackage)}
                                    disabled={requestingPackageId === selectedPackage.id}
                                    className="w-full bg-primary text-forest py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">
                                        {requestingPackageId === selectedPackage.id ? 'progress_activity' : 'assignment_add'}
                                    </span>
                                    {requestingPackageId === selectedPackage.id ? 'Submitting...' : 'Request Package'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPackages;
