import React from 'react';
import { useGallery } from '../../context/GalleryContext';

const DashboardGallery: React.FC = () => {
    const { images } = useGallery();

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
                        <div key={image.id} className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-black/20 aspect-video shadow-sm">
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
        </div>
    );
};

export default DashboardGallery;
