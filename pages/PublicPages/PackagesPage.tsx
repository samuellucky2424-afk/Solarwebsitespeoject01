import React, { useRef } from 'react';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import { useAdmin } from '../../context/AdminContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

const PackagesPage: React.FC = () => {
  const { packages } = useAdmin();
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

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <div key={pkg.id} className="package-card relative flex flex-col bg-white dark:bg-[#152a17] rounded-[2rem] p-8 shadow-xl border border-forest/5 dark:border-white/5 hover:border-primary/50 transition-all hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-8">
                   <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">solar_power</span>
                   </div>
                </div>
                
                <h3 className="text-2xl font-black text-forest dark:text-white mb-2 pr-12">{pkg.name}</h3>
                <p className="text-forest/60 dark:text-white/60 text-sm mb-6 min-h-[40px]">{pkg.description}</p>
                
                <div className="mb-8">
                   <span className="text-sm text-forest/50 dark:text-white/50 font-bold uppercase tracking-wider">Starting at</span>
                   <div className="text-4xl font-black text-primary mt-1">₦{pkg.price.toLocaleString()}</div>
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-2xl p-6 mb-8">
                   <p className="font-bold text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">bolt</span> What it powers:
                   </p>
                   <ul className="space-y-3">
                      {pkg.appliances.map((app, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-forest/80 dark:text-white/80">
                            <span className="size-1.5 rounded-full bg-primary shrink-0"></span>
                            {app}
                         </li>
                      ))}
                   </ul>
                </div>

                <Link to="/consultation" className="w-full py-4 rounded-xl bg-forest text-white dark:bg-white dark:text-forest font-bold text-center hover:opacity-90 transition-opacity shadow-lg">
                   Get This Package
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
             <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
             <p className="text-xl">No packages currently available.</p>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
};

export default PackagesPage;