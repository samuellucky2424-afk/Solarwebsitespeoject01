import React from 'react';

const DashboardSupport: React.FC = () => {
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-forest dark:text-white mb-2">Support & Locations</h2>
        <p className="text-forest/60 dark:text-white/60 text-sm">Find our headquarters and branches. Reach out for sales, operations, or technical support.</p>
      </div>

      {/* Notice Banner */}
      <div className="bg-primary/10 dark:bg-primary/20 border-l-4 border-primary rounded-xl p-5">
        <div className="flex gap-3">
          <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0 font-bold text-sm">
            !
          </div>
          <div>
            <h3 className="font-bold text-forest dark:text-white text-sm mb-1">Important Notice</h3>
            <p className="text-forest/70 dark:text-white/70 text-xs leading-relaxed">
              <span className="font-semibold">Greenlife operations</span> is in charge of quotations, logistics, and returns or repair of faulty goods.
              <br className="mt-1" />
              <span className="text-[10px] italic">The numbers below are not for sales of goods or products.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {locations.map((location, index) => (
          <div key={index} className="group bg-white dark:bg-[#152a17] rounded-2xl border border-forest/5 dark:border-white/5 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-white text-xl">location_on</span>
                <div>
                  <h3 className="text-white font-bold text-xs uppercase tracking-wide">
                    {location.type}
                  </h3>
                  {location.branchName && (
                    <p className="text-white/90 text-sm">{location.branchName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col">
              {/* Address */}
              <div className="mb-5">
                <p className="text-forest/60 dark:text-white/60 text-xs mb-3 leading-relaxed">
                  {location.address}
                </p>
                
                {/* Google Maps Link */}
                <a 
                  href={getGoogleMapsUrl(location.coordinates.lat, location.coordinates.lng, location.city)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-semibold text-xs transition-colors group/link"
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  View on Maps
                  <span className="material-symbols-outlined text-sm group-hover/link:translate-x-0.5 transition-transform">
                    arrow_outward
                  </span>
                </a>
              </div>

              {/* Contact Lines */}
              <div className="space-y-3 border-t border-forest/5 dark:border-white/5 pt-4">
                {location.lines.map((line, lineIdx) => (
                  <div key={lineIdx} className="flex flex-col gap-1.5">
                    <p className="text-forest dark:text-white font-semibold text-xs">
                      {line.title}
                    </p>
                    <a 
                      href={`tel:${line.phone.replace(/\s/g, '')}`}
                      className="text-primary hover:text-primary/80 font-bold text-xs transition-colors flex items-center gap-1.5 group/phone"
                    >
                      <span className="material-symbols-outlined text-xs">phone</span>
                      {line.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Departments Info */}
      <div className="bg-white dark:bg-[#152a17] rounded-2xl border border-forest/5 dark:border-white/5 shadow-sm p-6">
        <h3 className="text-lg font-bold text-forest dark:text-white mb-5">How We Can Help</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "shopping_cart", title: "Sales", desc: "Product info" },
            { icon: "settings", title: "Operations", desc: "Logistics & repairs" },
            { icon: "local_shipping", title: "Logistics", desc: "Deliveries" },
            { icon: "support_agent", title: "Technical", desc: "Installation help" }
          ].map((dept, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 text-center">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">{dept.icon}</span>
              </div>
              <p className="font-semibold text-forest dark:text-white text-xs">{dept.title}</p>
              <p className="text-forest/60 dark:text-white/60 text-[10px]">{dept.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSupport;
