import React, { useState } from 'react';
import { useGallery } from '../../context/GalleryContext';
import { uploadImage } from '../../config/supabaseClient';
import { Toast } from '../../components/SharedComponents';

const GalleryManagement: React.FC = () => {
    const { images, addImage, removeImage } = useGallery();

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Residential');
    const [newDescription, setNewDescription] = useState('');

    // Upload State
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [newUrl, setNewUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        if (!newTitle) return;

        let finalImageUrl = newUrl;

        if (imageMode === 'upload' && imageFile) {
            const uploadResult = await uploadImage(imageFile, 'greenlife-assets', 'gallery');
            if (uploadResult.url) {
                finalImageUrl = uploadResult.url;
            } else {
                setToastMsg(uploadResult.error || "Failed to upload image. Please try again.");
                setUploading(false);
                return;
            }
        }

        if (!finalImageUrl) {
            setToastMsg("Please provide an image URL or upload a file.");
            setUploading(false);
            return;
        }

        const success = await addImage({
            url: finalImageUrl,
            title: newTitle,
            category: newCategory,
            description: newDescription
        });

        if (success) {
            setNewUrl('');
            setNewTitle('');
            setNewDescription('');
            setImageFile(null);
            setToastMsg('Image added to gallery successfully');
        } else {
            setToastMsg('Failed to add image. Check console.');
        }
        setUploading(false);
    };

    const handleRemove = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this image?')) {
            const success = await removeImage(id);
            if (success) {
                setToastMsg('Image removed');
            } else {
                setToastMsg('Failed to remove image.');
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Gallery Management</h2>
                <p className="text-[#4c9a52]">Showcase your projects</p>
            </div>

            {/* Upload Section */}
            <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Add New Image</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Project Title</label>
                            <input
                                type="text"
                                required
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. Sunnyvale Installation"
                                className="w-full bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Category</label>
                            <select
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="w-full bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option>Residential</option>
                                <option>Commercial</option>
                                <option>Industrial</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload/URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Project Image</label>
                            <div className="flex gap-4 mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="galImgMode" checked={imageMode === 'url'} onChange={() => setImageMode('url')} className="text-primary focus:ring-primary" />
                                    <span className="text-sm font-medium">Image URL</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="galImgMode" checked={imageMode === 'upload'} onChange={() => setImageMode('upload')} className="text-primary focus:ring-primary" />
                                    <span className="text-sm font-medium">Upload File</span>
                                </label>
                            </div>
                            {imageMode === 'url' ? (
                                <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="https://..." />
                            ) : (
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" />
                            )}
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={uploading} className="w-full bg-primary text-forest font-bold py-2 px-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                {uploading && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                                Upload Project
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-[#4c9a52] mb-1">Description</label>
                        <textarea
                            value={newDescription}
                            onChange={e => setNewDescription(e.target.value)}
                            placeholder="Briefly describe the project..."
                            rows={3}
                            className="w-full bg-background-light dark:bg-black/20 border border-[#e7f3eb] dark:border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                        ></textarea>
                    </div>
                </form>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map(img => (
                    <div key={img.id} className="group relative bg-white dark:bg-[#152a17] rounded-xl overflow-hidden border border-[#cfe7d1] dark:border-[#2a3d2c] shadow-sm flex flex-col">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <a href={img.url} target="_blank" rel="noreferrer" className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40 transition-colors">
                                    <span className="material-symbols-outlined">visibility</span>
                                </a>
                                <button onClick={() => handleRemove(img.id)} className="p-2 bg-red-500/80 backdrop-blur rounded-full text-white hover:bg-red-600 transition-colors">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm truncate pr-2">{img.title}</h4>
                                <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-background-light dark:bg-white/5 text-[#4c9a52] px-1.5 py-0.5 rounded shrink-0">
                                    {img.category}
                                </span>
                            </div>
                            {img.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                                    {img.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GalleryManagement;
