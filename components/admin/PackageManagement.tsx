import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { uploadImage } from '../../config/supabaseClient';
import { Toast } from '../../components/SharedComponents';

const PackageManagement: React.FC = () => {
    const { packages, addPackage, deletePackage } = useAdmin();

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [appliancesStr, setAppliancesStr] = useState('');
    const [powerCapacity, setPowerCapacity] = useState('');

    // Upload State
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        if (!name || !price) return;

        let finalImageUrl = imageUrl;

        if (imageMode === 'upload' && imageFile) {
            const uploadedUrl = await uploadImage(imageFile, 'greenlife-assets', 'packages');
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            } else {
                setToastMsg("Failed to upload image. Please try again.");
                setUploading(false);
                return;
            }
        }

        const success = await addPackage({
            name,
            price: Number(price),
            description,
            appliances: appliancesStr.split(',').map(s => s.trim()).filter(s => s.length > 0),
            powerCapacity,
            img: finalImageUrl || 'https://placehold.co/600x400?text=Solar+Package'
        });

        if (success) {
            setName('');
            setPrice('');
            setDescription('');
            setAppliancesStr('');
            setPowerCapacity('');
            setImageUrl('');
            setImageFile(null);
            setToastMsg("Package added successfully!");
        } else {
            setToastMsg("Failed to add package.");
        }
        setUploading(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this package?")) {
            deletePackage(id);
            setToastMsg("Package deleted.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Package Management</h2>
                <p className="text-[#4c9a52]">Curated solar solutions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm sticky top-6">
                        <h3 className="font-bold mb-4">Create New Package</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Package Name</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none" placeholder="e.g. Starter Pack" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Price (₦)</label>
                                <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Power Capacity</label>
                                <input type="text" value={powerCapacity} onChange={e => setPowerCapacity(e.target.value)} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none" placeholder="e.g. 5kW Inverter + 10kWh Battery" />
                            </div>

                            {/* Image Upload/URL */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Package Image</label>
                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="pkgImgMode" checked={imageMode === 'url'} onChange={() => setImageMode('url')} className="text-primary focus:ring-primary" />
                                        <span className="text-xs">URL</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="pkgImgMode" checked={imageMode === 'upload'} onChange={() => setImageMode('upload')} className="text-primary focus:ring-primary" />
                                        <span className="text-xs">Upload</span>
                                    </label>
                                </div>
                                {imageMode === 'url' ? (
                                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none" placeholder="https://..." />
                                ) : (
                                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none" />
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Description</label>
                                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none resize-none" placeholder="Short summary..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Appliances (Comma Separated)</label>
                                <textarea required value={appliancesStr} onChange={e => setAppliancesStr(e.target.value)} rows={3} className="w-full p-2 rounded bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 text-sm focus:ring-primary focus:ring-2 outline-none resize-none" placeholder="5 Lights, 1 TV, 1 Fan..." />
                            </div>
                            <button type="submit" disabled={uploading} className="w-full bg-primary text-forest font-bold py-2 rounded-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {uploading && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                                Add Package
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] overflow-hidden flex flex-col relative group hover:shadow-lg transition-all">
                            {pkg.img && (
                                <div className="h-40 w-full bg-gray-100 dark:bg-black/20 relative">
                                    <img src={pkg.img} alt={pkg.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                            )}
                            <button onClick={() => handleDelete(pkg.id)} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100">
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>

                            <div className="p-6 flex-1 flex flex-col">
                                <h4 className="font-bold text-lg mb-1">{pkg.name}</h4>
                                <p className="text-primary font-bold text-xl mb-2">₦{pkg.price.toLocaleString()}</p>

                                {pkg.powerCapacity && (
                                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded mb-3 w-fit">
                                        {pkg.powerCapacity}
                                    </span>
                                )}

                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{pkg.description}</p>

                                <div className="mt-auto pt-4 border-t border-[#e7f3eb] dark:border-white/10">
                                    <p className="text-xs font-bold uppercase text-[#4c9a52] mb-2">What it powers</p>
                                    <div className="flex flex-wrap gap-2">
                                        {pkg.appliances.map((app, i) => (
                                            <span key={i} className="px-2 py-1 bg-background-light dark:bg-white/5 rounded text-[10px] font-medium truncate max-w-[100px]">{app}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PackageManagement;
