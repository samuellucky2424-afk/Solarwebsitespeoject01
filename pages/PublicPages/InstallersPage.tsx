import React, { useRef } from 'react';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const InstallersPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const installers = [
    { name: "David Okonjo", role: "Senior Engineer", exp: "12 Years", img: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?q=80&w=2070&auto=format&fit=crop", spec: "Large Commercial Systems" },
    { name: "Sarah Williams", role: "Installation Lead", exp: "8 Years", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop", spec: "Residential Roofing" },
    { name: "Michael Chen", role: "Electrical Specialist", exp: "15 Years", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop", spec: "Battery Integration" },
    { name: "Amara Diop", role: "Site Surveyor", exp: "6 Years", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop", spec: "Energy Auditing" },
    { name: "James Wilson", role: "Safety Officer", exp: "10 Years", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1887&auto=format&fit=crop", spec: "Compliance & Safety" },
    { name: "Elena Rodriguez", role: "Design Engineer", exp: "9 Years", img: "https://images.unsplash.com/photo-1598550832205-d07f4273030d?q=80&w=1887&auto=format&fit=crop", spec: "CAD System Design" },
  ];

  useGSAP(() => {
    gsap.from(".installer-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".grid-container",
        start: "top 80%"
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
      <PublicHeader />
      
      <main className="w-full max-w-[1920px] mx-auto px-4 lg:px-12 py-12 flex-1">
        <div className="text-center mb-16">
          <SectionHeader sub="Our Team" title="Meet The Experts" />
          <p className="text-forest/70 dark:text-white/70 max-w-2xl mx-auto text-lg mt-4">
            Our certified professionals are dedicated to delivering precision, safety, and efficiency in every installation.
          </p>
        </div>

        <div className="grid-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {installers.map((person, idx) => (
            <div key={idx} className="installer-card bg-white dark:bg-[#152a17] rounded-3xl overflow-hidden shadow-lg border border-forest/5 dark:border-white/5 group hover:shadow-2xl transition-all duration-300">
              <div className="h-80 overflow-hidden relative">
                <img 
                  src={person.img} 
                  alt={person.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                   <p className="text-white font-bold text-lg">Specialization</p>
                   <p className="text-primary">{person.spec}</p>
                </div>
              </div>
              <div className="p-6 text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-forest px-4 py-1 rounded-full text-xs font-bold shadow-md">
                  {person.exp} Experience
                </div>
                <h3 className="text-xl font-bold text-forest dark:text-white mt-2">{person.name}</h3>
                <p className="text-forest/60 dark:text-white/60 font-medium text-sm uppercase tracking-wider mt-1">{person.role}</p>
                
                <div className="mt-6 pt-6 border-t border-forest/5 dark:border-white/5 flex justify-center gap-4">
                   <button className="size-10 rounded-full bg-forest/5 dark:bg-white/5 flex items-center justify-center text-forest dark:text-white hover:bg-primary hover:text-forest transition-colors">
                      <img src="https://cdn.simpleicons.org/linkedin" className="size-4 dark:invert opacity-70" alt="linkedin" />
                   </button>
                   <button className="size-10 rounded-full bg-forest/5 dark:bg-white/5 flex items-center justify-center text-forest dark:text-white hover:bg-primary hover:text-forest transition-colors">
                      <span className="material-symbols-outlined text-lg">mail</span>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
           <h3 className="text-2xl font-bold mb-6 text-forest dark:text-white">Want to join our team?</h3>
           <button className="bg-transparent border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-forest transition-all">
              View Careers
           </button>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default InstallersPage;