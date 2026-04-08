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
      stagger: 0.15,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
      <PublicHeader />

      <main className="w-full max-w-[1920px] mx-auto px-4 lg:px-12 py-12 flex-1">
        <div className="text-center mb-16">
          <SectionHeader sub="Solar Solutions" title="Curated Energy Packages" />
          <p className="text-forest/70 dark:text-white/70 max-w-3xl mx-auto text-lg mt-4">
            Browse the same Supabase-backed package records used on the dashboard, with full pricing, capacity, imagery, and appliance coverage.
          </p>
        </div>

        {packagesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className="package-card overflow-hidden rounded-[2rem] bg-white dark:bg-[#152a17] shadow-xl border border-forest/5 dark:border-white/5 animate-pulse">
                <div className="aspect-[4/3] bg-forest/10 dark:bg-white/10"></div>
                <div className="p-6 space-y-4">
                  <div className="h-5 w-28 bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-9 w-3/4 bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-4 w-full bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="h-4 w-5/6 bg-forest/10 dark:bg-white/10 rounded"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-9 bg-forest/10 dark:bg-white/10 rounded-xl"></div>
                    <div className="h-9 bg-forest/10 dark:bg-white/10 rounded-xl"></div>
                    <div className="h-9 bg-forest/10 dark:bg-white/10 rounded-xl"></div>
                    <div className="h-9 bg-forest/10 dark:bg-white/10 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                to={`/packages/${pkg.id}`}
                className="package-card group overflow-hidden rounded-[2rem] bg-white dark:bg-[#152a17] shadow-xl border border-forest/5 dark:border-white/5 hover:border-primary/50 hover:-translate-y-2 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-black/20">
                  {pkg.img ? (
                    <img
                      src={pkg.img}
                      alt={pkg.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <span className="material-symbols-outlined text-6xl">solar_power</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
                  <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-forest">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    {pkg.powerCapacity || 'Custom build'}
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2">Solar Package</p>
                      <h3 className="text-2xl font-black text-forest dark:text-white leading-tight">{pkg.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-forest/50 dark:text-white/50 font-bold uppercase tracking-[0.2em]">Starting at</span>
                      <div className="text-2xl font-black text-primary mt-1">NGN {pkg.price.toLocaleString()}</div>
                    </div>
                  </div>

                  <p className="text-forest/60 dark:text-white/60 text-sm line-clamp-3 min-h-[60px]">{pkg.description}</p>

                  <div className="rounded-[1.5rem] bg-gray-50 dark:bg-black/20 p-5">
                    <p className="font-bold text-xs sm:text-sm mb-3 flex items-center gap-2 text-forest dark:text-white">
                      <span className="material-symbols-outlined text-primary">bolt</span>
                      What it powers
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {pkg.appliances.slice(0, 4).map((app, i) => (
                        <div key={i} className="rounded-xl border border-forest/5 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs sm:text-sm text-forest/80 dark:text-white/80">
                          {app}
                        </div>
                      ))}
                    </div>
                    {pkg.appliances.length > 4 && (
                      <p className="text-xs font-bold text-primary mt-3">+ {pkg.appliances.length - 4} more appliances</p>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 text-primary font-bold">
                    View details
                    <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </div>
                </div>
              </Link>
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
