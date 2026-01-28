import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGallery } from '../../context/GalleryContext';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const { images } = useGallery();

  useGSAP(() => {
    // Hero Animation
    const tl = gsap.timeline();
    tl.from(".hero-content > *", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out"
    });

    // Stats Bar Animation
    gsap.from(".stats-item", {
      scrollTrigger: {
        trigger: ".stats-section",
        start: "top 80%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.7)"
    });

    // Services Animation
    gsap.from(".service-card", {
      scrollTrigger: {
        trigger: ".services-section",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out"
    });

    // Gallery Animation
    gsap.from(".gallery-item", {
      scrollTrigger: {
        trigger: ".gallery-section",
        start: "top 70%",
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });

    // Products Animation
    gsap.from(".product-card", {
      scrollTrigger: {
        trigger: ".products-section",
        start: "top 70%",
      },
      scale: 0.9,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });

    // CTA Animation
    gsap.from(".cta-container", {
      scrollTrigger: {
        trigger: ".cta-section",
        start: "top 80%",
      },
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.75)"
    });

  }, { scope: container, dependencies: [images] });

  return (
    <div ref={container} className="min-h-screen flex flex-col overflow-x-hidden">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative w-full px-6 lg:px-10 py-10 max-w-[1280px] mx-auto">
          <div className="relative overflow-hidden rounded-3xl min-h-[600px] flex items-center shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent z-10"></div>
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZorIbyrZ5OLhbDy634lXDn9Pdhc4stIeZqUjuHMAlvZJ5w2PS4Y9M_5znVvIV3C0VY89GZ2tgBtf5dZvyH2G0EcUxS9p6AQY3U0j8pQ5diSochratuVXWrfyfRe6btjNtAboqC8xaWFwSPmf-pMSac0YoENe0aosNNcg4K9kp00_IdL181Tx0iKpQ_oramQeJe4Rmn6RqceeMdHieJ5m3Dlh02kFdme_pXcHuCwKTYiWGcI64M_uBE1frQTxYva44niSL5tnIr84')" }}></div>
            </div>
            <div className="hero-content relative z-20 px-8 md:px-16 max-w-2xl flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">verified</span> Eco-Certified Excellence
              </div>
              <h1 className="text-white text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Powering Your Future with <span className="text-primary">Clean Energy</span>
              </h1>
              <p className="text-white/80 text-lg md:text-xl font-normal leading-relaxed">
                Sustainable solar solutions for modern homes and businesses. Save money while saving the planet with our expert solar installations and premium components.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={() => navigate('/consultation')} className="bg-primary hover:bg-primary/90 text-forest px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
                  Get a Free Quote <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button onClick={() => navigate('/products')} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 active:scale-95">
                  View Our Work
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="stats-section max-w-[1280px] mx-auto px-6 lg:px-10 -mt-12 relative z-30 mb-20">
          <div className="bg-white dark:bg-forest border border-forest/10 dark:border-white/10 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-xl shadow-forest/5">
            {[
              { label: "Installations", value: "12k+" },
              { label: "Energy Produced", value: "15MW" },
              { label: "Warranty", value: "25yrs" },
              { label: "Saved by Clients", value: "$40M" }
            ].map((stat, idx) => (
              <div key={idx} className="stats-item text-center">
                <p className="text-primary text-3xl font-bold">{stat.value}</p>
                <p className="text-forest/60 dark:text-white/60 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section max-w-[1280px] mx-auto px-6 lg:px-10 py-10" id="services">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Our Expertise</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-forest dark:text-white leading-tight">Comprehensive Solar Energy Solutions</h3>
            </div>
            <p className="text-forest/60 dark:text-white/60 max-w-md text-lg">
              We handle everything from initial consultation to final grid connection, ensuring a seamless transition to renewable energy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "solar_power", title: "Expert Installation", text: "Precision residential and commercial solar panel installation by certified technicians.", bg: "bg-primary/10", textCol: "text-primary" },
              { icon: "shopping_cart", title: "Premium Products", text: "High-efficiency Tier 1 panels, smart inverters, and lithium-ion battery storage.", bg: "bg-accent-yellow/10", textCol: "text-accent-yellow" },
              { icon: "build", title: "Maintenance", text: "Proactive monitoring and maintenance to ensure your system performs at peak efficiency.", bg: "bg-primary/10", textCol: "text-primary" },
              { icon: "query_stats", title: "Energy Audits", text: "Detailed analysis of your energy usage to design the perfect custom roadmap for savings.", bg: "bg-accent-yellow/10", textCol: "text-accent-yellow" }
            ].map((service, idx) => (
              <div key={idx} className="service-card group p-8 rounded-3xl border border-forest/10 dark:border-white/10 bg-white dark:bg-forest/50 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
                <div className={`size-14 rounded-2xl ${service.bg} ${service.textCol} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                </div>
                <h4 className="text-xl font-bold mb-3">{service.title}</h4>
                <p className="text-forest/60 dark:text-white/60 leading-relaxed">{service.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="gallery-section max-w-[1280px] mx-auto px-6 lg:px-10 py-20" id="gallery">
          <SectionHeader sub="Our Projects" title="Recent Installations" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {images.map((img) => (
               <div key={img.id} className="gallery-item group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                 <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-primary text-xs font-bold uppercase tracking-widest mb-1">{img.category}</span>
                    <h3 className="text-white text-xl font-bold">{img.title}</h3>
                 </div>
               </div>
             ))}
             {/* Add a "See More" placeholder if needed, or link to full portfolio */}
          </div>
        </section>

        {/* Featured Products */}
        <section className="products-section bg-forest dark:bg-black/20 py-24 my-20" id="products">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
            <SectionHeader sub="Product Showcase" title="Advanced Solar Technology" dark={true} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Monocrystalline Panels", sub: "High Efficiency", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeVJOVAEcn2TC5LANFimRUWMhIN1Fbg-T_bpf2XYA413sZwSDYiLJF4tbkshKq0s8soG27g-Wza1A8rYfblgtmY8hqjnItF5Hn0W_rgBHM4_1qF2SaLsG6Nbq4U8F6mBvQeMSg7X3d4h_D9xYCzk91j3L2P8WB1u7btZhBcAzPSnJsxf8rFp0sHsYXEEfHYWuh5PyvPH3BazC0XxSqJ2HT_7QCGlgoA4jWZ94oKMQB11tTaQaPRdj8N1lzyLkAmBwGOLnKd0AQ6qg" },
                { title: "Lithium-ion Batteries", sub: "Smart Storage", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqRxBqnJx1hpehQb5DGOJJrL9TL5K27CSYdCS9eKZNtvCVg0d0WfG93cDU-nDtbhnqh0wYk1fjvJoR42Jme7omPmgD2T8603SvVrJ-sqL_hx-Y8NacvcDYm_qqDJggJxUmDrdRMWU0gz6In9yUz0uQ5PT17L-HLT8W8OyGKjjXhs6mowwQk9Jnnqng3YDTmokW6esOqufu6v43HoutXEtuRA05ArPQ1-ZFtrh45YWOlT8RouzkK45xFL100mO8e5BaGruaBMAVMH8" },
                { title: "Hybrid Inverters", sub: "Intelligent Flow", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP7iH6rE6-Ht0qjA7AZW-NjGvsQt0CRhAvVjOwKqTdP-ea2Yb_uZWVAeeXhHvhVYIfIKk-iRkRbwiM34HBJbhAfNhXLkj5-BvfjVR7lQSkIosy2Loo24Tmoq77kLIQefQTmW9oe00rN8p_aOeTW3KsUdnB7Dxw_7X841nAQB8tYtF3tCRMSP_ENogsoZRpw09Y6a6tPUvqhaIn44ENAbL5qSgc5mEMPLdwR2waDr5uRDFqIGyZWa7-kSRpVstEtLmdOabeuRPvEAo" }
              ].map((prod, idx) => (
                <div key={idx} className="product-card flex flex-col gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-full aspect-square bg-cover bg-center rounded-2xl overflow-hidden" style={{ backgroundImage: `url('${prod.img}')` }}></div>
                  <div>
                    <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">{prod.sub}</p>
                    <h4 className="text-white text-2xl font-bold mb-2">{prod.title}</h4>
                    <p className="text-white/60 mb-6">Experience cutting-edge performance designed to last for decades.</p>
                    <Link to="/products" className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Learn More <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section max-w-[1280px] mx-auto px-6 lg:px-10 py-10 mb-20">
          <div className="cta-container bg-primary rounded-[3rem] p-12 md:p-20 text-center flex flex-col items-center gap-8 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 size-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 size-64 bg-forest/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <h2 className="text-4xl md:text-6xl font-bold text-forest max-w-3xl leading-tight relative z-10">
              Ready to switch to clean, renewable energy?
            </h2>
            <p className="text-forest/80 text-xl max-w-xl relative z-10">
              Get your personalized energy roadmap today. Our experts are ready to help you save.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <button onClick={() => navigate('/consultation')} className="bg-forest text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-transform shadow-2xl active:scale-95">
                Claim Your Free Quote
              </button>
              <button onClick={() => navigate('/consultation')} className="bg-transparent border-2 border-forest text-forest px-10 py-5 rounded-2xl text-xl font-bold hover:bg-forest hover:text-white transition-all active:scale-95">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default LandingPage;