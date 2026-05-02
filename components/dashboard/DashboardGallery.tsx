import React, { useState } from 'react';
import { useGallery } from '../../context/GalleryContext';
import ReviewsSection from '../ReviewsSection';

const DashboardGallery: React.FC = () => {
    const { images } = useGallery();
    const [selected, setSelected] = useState<typeof images[number] | null>(null);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Project Gallery</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Explore our latest installations and projects.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.length > 0 ? (
                    images.map((image) => (
                        <div
                            key={image.id}
                            onClick={() => setSelected(image)}
                            className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-black/20 aspect-video shadow-sm cursor-pointer"
                        >
                            <img
                                src={image.url}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h3 className="text-white font-bold text-lg">{image.title}</h3>
                                <p className="text-gray-300 text-xs line-clamp-2">{image.description}</p>
                                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-forest/80 px-2 py-1 rounded w-fit">
                                    {image.category}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">image_not_supported</span>
                        <p className="text-gray-500">No gallery images available yet.</p>
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
                    <div className="relative bg-white dark:bg-[#152a17] rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors z-10"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="rounded-2xl overflow-hidden mb-4">
                            <img src={selected.url} alt={selected.title} className="w-full h-auto max-h-[60vh] object-cover" />
                        </div>
                        <span className="text-primary font-bold text-xs uppercase tracking-wider">{selected.category}</span>
                        <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-white mb-2">{selected.title}</h2>
                        {selected.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 whitespace-pre-line">{selected.description}</p>
                        )}

                        {/* Reviews */}
                        <ReviewsSection targetId={selected.id} targetType="gallery" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardGallery;
