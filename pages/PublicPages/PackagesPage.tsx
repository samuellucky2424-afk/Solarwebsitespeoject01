import React, { useRef } from 'react';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import { useAdmin } from '../../context/AdminContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

const PackagesPage: React.FC = () => {
  const { packages, packagesLoading } = useAdmin();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".package-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
      <PublicHeader />
      
      <main className="w-full max-w-[1920px] mx-auto px-4 lg:px-12 py-12 flex-1">
        <div className="text-center mb-16">
          <SectionHeader sub="Solar Solutions" title="Curated Energy Packages" />
          <p className="text-forest/70 dark:text-white/70 max-w-2xl mx-auto text-lg mt-4">
            Choose from our expertly designed solar packages tailored to meet diverse energy needs, from basic backup to full home independence.
          </p>
        </div>

        {packagesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 xl:gap-8">
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className="package-card flex flex-col bg-white dark:bg-[#152a17] rounded-none p-4 sm:p-8 shadow-xl border border-forest/5 dark:border-white/5 animate-pulse">
                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="space-y-3 flex-1">
                    <div className="h-6 sm:h-8 w-2/3 bg-forest/10 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-full bg-forest/10 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-4/5 bg-forest/10 dark:bg-white/10 rounded"></div>
                  </div>
                  <div className="size-10 sm:size-12 bg-primary/10 rounded-full shrink-0"></div>
                </div>

                <div className="mb-6 sm:mb-8 space-y-3">
                  <div className="h-4 w-24 bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-8 sm:h-10 w-24 sm:w-32 bg-forest/10 dark:bg-white/10 rounded"></div>
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-none p-4 sm:p-6 space-y-3">
                  <div className="h-4 w-28 bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-4 w-full bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-4 w-5/6 bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-4 w-3/4 bg-forest/10 dark:bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 xl:gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="package-card relative flex flex-col bg-white dark:bg-[#152a17] rounded-none p-4 sm:p-8 shadow-xl border border-forest/5 dark:border-white/5 hover:border-primary/50 transition-all hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-4 sm:p-8">
                   <div className="size-10 sm:size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl sm:text-2xl">solar_power</span>
                   </div>
                </div>
                
                <h3 className="text-lg md:text-xl xl:text-2xl font-black text-forest dark:text-white mb-2 pr-10 sm:pr-12 leading-tight">{pkg.name}</h3>
                <p className="text-forest/60 dark:text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 min-h-[40px] line-clamp-3">{pkg.description}</p>
                
                <div className="mb-6 sm:mb-8">
                   <span className="text-[10px] sm:text-sm text-forest/50 dark:text-white/50 font-bold uppercase tracking-wider">Starting at</span>
                   <div className="text-2xl md:text-3xl xl:text-4xl font-black text-primary mt-1">₦{pkg.price.toLocaleString()}</div>
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-none p-4 sm:p-6 mb-6 sm:mb-8">
                   <p className="font-bold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">bolt</span> What it powers:
                   </p>
                   <ul className="space-y-2 sm:space-y-3">
                      {pkg.appliances.map((app, i) => (
                         <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-forest/80 dark:text-white/80">
                            <span className="size-1.5 rounded-full bg-primary shrink-0"></span>
                            {app}
                         </li>
                      ))}
                   </ul>
                </div>

                <Link to={`/packages/${pkg.id}`} className="absolute inset-0 z-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
             <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
             <p className="text-xl">No packages currently available from the database.</p>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PackagesPage;
