import React, { useState, useRef, useMemo } from 'react';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import { useGallery } from '../../context/GalleryContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const GalleryPage: React.FC = () => {
  const { images } = useGallery();
  const [filter, setFilter] = useState('All');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredImages = useMemo(() => {
    return filter === 'All' ? images : images.filter(img => img.category === filter);
  }, [images, filter]);

  useGSAP(() => {
    // Reset any previous animations
    gsap.killTweensOf(".gallery-item");
    
    // Animate items whenever the filtered list changes
    gsap.fromTo(".gallery-item", 
      { opacity: 0, y: 30, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: "power2.out",
        clearProps: "all"
      }
    );
  }, { scope: containerRef, dependencies: [filteredImages] });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden">
      <PublicHeader />
      
      <main className="w-full max-w-[1920px] mx-auto px-4 lg:px-12 py-12 flex-1">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <SectionHeader sub="Our Portfolio" title="Excellence in Action" />
          <p className="text-forest/70 dark:text-white/70 max-w-2xl mx-auto text-lg mt-4">
            Browse through our recent installations and see how Greenlife Solar is transforming homes and businesses across the nation.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All', 'Residential', 'Commercial', 'Industrial'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                filter === cat 
                ? 'bg-primary text-forest shadow-lg shadow-primary/25 scale-105' 
                : 'bg-white dark:bg-white/5 text-forest/70 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((img) => (
              <div key={img.id} className="gallery-item group bg-white dark:bg-[#152a17] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-forest/5 dark:border-white/5 flex flex-col h-full">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={img.url} 
                    alt={img.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 dark:bg-black/70 backdrop-blur-sm text-forest dark:text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                      {img.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-forest dark:text-white mb-3 line-clamp-1">{img.title}</h3>
                  {img.description ? (
                    <p className="text-forest/60 dark:text-white/60 text-sm leading-relaxed mb-4 flex-1">
                      {img.description}
                    </p>
                  ) : (
                    <p className="text-forest/40 dark:text-white/40 text-sm italic mb-4 flex-1">No description provided.</p>
                  )}
                  <div className="pt-4 border-t border-forest/5 dark:border-white/5 flex items-center justify-between mt-auto">
                     <span className="text-primary font-bold text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Completed
                     </span>
                     <button className="text-forest dark:text-white hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">open_in_new</span>
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="material-symbols-outlined text-6xl mb-4">photo_library</span>
            <p className="text-xl font-bold">No projects found in this category.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 bg-primary/10 rounded-[2rem] p-12 text-center border border-primary/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
           <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-forest dark:text-white mb-4">Inspired by our work?</h2>
              <p className="text-forest/70 dark:text-white/70 max-w-xl mx-auto mb-8">
                 Let's create something amazing for your property. Our engineers are ready to design your custom solar solution.
              </p>
              <a href="#/consultation" className="inline-flex items-center gap-2 bg-primary text-forest px-8 py-3 rounded-xl font-bold hover:brightness-105 transition-all shadow-lg shadow-primary/20">
                 Start Your Project <span className="material-symbols-outlined">arrow_forward</span>
              </a>
           </div>
        </div>

      </main>
      <PublicFooter />
    </div>
  );
};

export default GalleryPage;