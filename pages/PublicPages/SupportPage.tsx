import React, { useRef } from 'react';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const SupportPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".support-header", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .from(".notice-banner", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    }, "-=0.4")
    .from(".location-card", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: "power3.out"
    }, "-=0.3");

  }, { scope: containerRef });

  const locations = [
    {
      type: "Headquarter",
      address: "12, Ajuebor street by decency close Agbor, Delta state",
      lines: [
        { title: "Greenlife sales", phone: "+234 816 727 8613" },
        { title: "Greenlife operations", phone: "+234 903 307 1034" }
      ],
      coordinates: { lat: 5.6035, lng: 6.1893 },
      city: "Agbor"
    },
    {
      type: "Branch",
      branchName: "Total Plaza",
      address: "No 78, Shop 30 Total plaza opposite Total filling station, along Lagos-Asaba road Agbor, Delta State",
      lines: [
        { title: "Greenlife sales Total plaza", phone: "+234 913 255 4987" }
      ],
      coordinates: { lat: 5.6050, lng: 6.1920 },
      city: "Agbor"
    },
    {
      type: "Branch",
      branchName: "Auchi",
      address: "No 32, bode road jattu by hausa quarter, Edo State",
      lines: [
        { title: "Greenlife sales Auchi", phone: "+234 707 834 5991" }
      ],
      coordinates: { lat: 6.7739, lng: 6.3689 },
      city: "Auchi"
    }
  ];

  const getGoogleMapsUrl = (lat: number, lng: number, label: string) => {
    return `https://www.google.com/maps?q=${lat},${lng}&z=16&t=m`;
  };

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden">
      <PublicHeader />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 lg:px-10 py-12 w-full">
        {/* Header Section */}
        <div className="support-header mb-12 text-center max-w-3xl mx-auto">
          <SectionHeader sub="Get In Touch" title="Support & Locations" />
          <p className="text-forest/70 dark:text-white/70 text-lg mt-4">
            Find our headquarters and branches across Nigeria. We're here to assist you with sales, operations, logistics, and technical support.
          </p>
        </div>

        {/* Notice Banner */}
        <div className="notice-banner bg-primary/10 dark:bg-primary/20 border-l-4 border-primary rounded-xl p-6 mb-12 max-w-3xl mx-auto">
          <div className="flex gap-4">
            <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 font-bold text-sm">
              !
            </div>
            <div>
              <h3 className="font-bold text-forest dark:text-white mb-2">Important Notice</h3>
              <p className="text-forest/70 dark:text-white/70 text-sm leading-relaxed">
                <span className="font-semibold">Greenlife operations</span> is in charge of quotations, logistics, and returns or repair of faulty goods. 
                <br className="mt-2" />
                <span className="text-xs italic">The numbers below are not for sales of goods or products.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {locations.map((location, index) => (
            <div key={index} className="location-card group">
              <div className="bg-white dark:bg-[#152a17] rounded-3xl border border-forest/5 dark:border-white/5 shadow-xl shadow-forest/5 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-8 py-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-white text-2xl">location_on</span>
                    <div>
                      <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                        {location.type}
                      </h3>
                      {location.branchName && (
                        <p className="text-white/90 text-sm">{location.branchName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col">
                  {/* Address */}
                  <div className="mb-8">
                    <p className="text-forest/60 dark:text-white/60 text-sm mb-4 leading-relaxed">
                      {location.address}
                    </p>
                    
                    {/* Google Maps Link */}
                    <a 
                      href={getGoogleMapsUrl(location.coordinates.lat, location.coordinates.lng, location.city)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm transition-colors group/link"
                    >
                      <span className="material-symbols-outlined text-base">map</span>
                      View on Google Maps
                      <span className="material-symbols-outlined text-base group-hover/link:translate-x-1 transition-transform">
                        arrow_outward
                      </span>
                    </a>
                  </div>

                  {/* Contact Lines */}
                  <div className="space-y-4 border-t border-forest/5 dark:border-white/5 pt-6">
                    {location.lines.map((line, lineIdx) => (
                      <div key={lineIdx} className="flex flex-col gap-2">
                        <p className="text-forest dark:text-white font-semibold text-sm">
                          {line.title}
                        </p>
                        <a 
                          href={`tel:${line.phone.replace(/\s/g, '')}`}
                          className="text-primary hover:text-primary/80 font-bold transition-colors flex items-center gap-2 group/phone"
                        >
                          <span className="material-symbols-outlined text-sm">phone</span>
                          {line.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Departments Info */}
        <div className="bg-white dark:bg-[#152a17] rounded-3xl border border-forest/5 dark:border-white/5 shadow-xl shadow-forest/5 p-8 lg:p-12 max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-forest dark:text-white mb-8 text-center">
            How We Can Help
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sales */}
            <div className="flex gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">shopping_cart</span>
              </div>
              <div>
                <h3 className="font-bold text-forest dark:text-white mb-2">Sales Inquiries</h3>
                <p className="text-forest/60 dark:text-white/60 text-sm">
                  Contact our sales team for product information, pricing, and quotations.
                </p>
              </div>
            </div>

            {/* Operations */}
            <div className="flex gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div>
                <h3 className="font-bold text-forest dark:text-white mb-2">Operations Support</h3>
                <p className="text-forest/60 dark:text-white/60 text-sm">
                  For logistics, returns, repairs, and operational assistance.
                </p>
              </div>
            </div>

            {/* Logistics */}
            <div className="flex gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div>
                <h3 className="font-bold text-forest dark:text-white mb-2">Logistics & Delivery</h3>
                <p className="text-forest/60 dark:text-white/60 text-sm">
                  Track shipments and coordinate deliveries across Nigeria.
                </p>
              </div>
            </div>

            {/* Technical */}
            <div className="flex gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div>
                <h3 className="font-bold text-forest dark:text-white mb-2">Technical Support</h3>
                <p className="text-forest/60 dark:text-white/60 text-sm">
                  Get help with product installation and technical issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-8">
          <p className="text-forest/60 dark:text-white/60 mb-6">
            Can't find what you're looking for?
          </p>
          <a 
            href="#/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">mail</span>
            Send us a Message
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default SupportPage;
