import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGallery } from '../../context/GalleryContext';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const { images } = useGallery();
  const { inventory } = useAdmin(); // Get inventory from Admin Context
  const { isAuthenticated } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);

  // Showcase all gallery images in the hero slider if available, else default placeholders
  const heroImages = images.length > 0 ? images : [
    { id: 'h1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZorIbyrZ5OLhbDy634lXDn9Pdhc4stIeZqUjuHMAlvZJ5w2PS4Y9M_5znVvIV3C0VY89GZ2tgBtf5dZvyH2G0EcUxS9p6AQY3U0j8pQ5diSochratuVXWrfyfRe6btjNtAboqC8xaWFwSPmf-pMSac0YoENe0aosNNcg4K9kp00_IdL181Tx0iKpQ_oramQeJe4Rmn6RqceeMdHieJ5m3Dlh02kFdme_pXcHuCwKTYiWGcI64M_uBE1frQTxYva44niSL5tnIr84', title: 'Clean Energy', description: 'Sustainable solar solutions.' }
  ];

  // Featured Products: Show all products marked as featured
  const featuredProducts = inventory;

  // Gallery Carousel State
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const galleryAutoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Testimonials Carousel State
  const [testiIndex, setTestiIndex] = useState(0);
  const swipeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleMaintenanceClick = () => {
    if (isAuthenticated) {
      navigate('/service-request?type=maintenance');
    } else {
      navigate('/login', { state: { from: '/service-request?type=maintenance' } });
    }
  };

  // Testimonials Data (Static for now, could be dynamic later)
  const testimonials = [
    { name: "Sarah Jenkins", role: "Residential Client", quote: "My energy bills dropped by 80% immediately. The installation team was professional, clean, and fast.", rating: 5 },
    { name: "Marcus Chen", role: "Eco-Architect", quote: "I recommend Greenlife to all my clients. Their engineering precision is unmatched in the solar industry.", rating: 5 },
    { name: "Elena Rodriguez", role: "TechCorp CEO", quote: "Converting our headquarters to solar was seamless. The ROI analysis was spot on.", rating: 5 },
    { name: "David Okonkwo", role: "Small Business Owner", quote: "The best investment for my factory. Consistent power supply has improved our productivity by 40%.", rating: 5 }
  ];

  // --- Hero Slider Logic ---
  useEffect(() => {
    if (heroImages.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(".progress-ring-circle", { strokeDashoffset: 126 });

      gsap.to(".progress-ring-circle", {
        strokeDashoffset: 0,
        duration: 8,
        ease: "none",
        onComplete: () => setCurrentSlide(prev => (prev + 1) % heroImages.length)
      });
    });

    return () => ctx.revert();
  }, [currentSlide, heroImages.length]);


  // --- Gallery Carousel Logic ---
  const startGalleryAutoPlay = () => {
    if (galleryAutoPlayRef.current) clearInterval(galleryAutoPlayRef.current);
    galleryAutoPlayRef.current = setInterval(() => {
      setGalleryIndex(prev => (prev + 1) % Math.max(1, images.length));
    }, 5000);
  };

  const stopGalleryAutoPlay = () => {
    if (galleryAutoPlayRef.current) clearInterval(galleryAutoPlayRef.current);
  };

  useEffect(() => {
    startGalleryAutoPlay();
    return () => stopGalleryAutoPlay();
  }, [images.length]);

  const handleGalleryNav = (direction: 'prev' | 'next') => {
    stopGalleryAutoPlay();
    if (direction === 'next') {
      setGalleryIndex(prev => (prev + 1) % images.length);
    } else {
      setGalleryIndex(prev => (prev - 1 + images.length) % images.length);
    }
    startGalleryAutoPlay();
  };

  useGSAP(() => {
    if (!galleryTrackRef.current || images.length === 0) return;
    const firstCard = galleryTrackRef.current.children[0] as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 32;
    const moveX = -(galleryIndex * (cardWidth + gap));

    gsap.to(galleryTrackRef.current, {
      x: moveX,
      duration: 1.5,
      ease: "power3.inOut"
    });
  }, { dependencies: [galleryIndex, images] });


  // --- Testimonials Logic ---
  useEffect(() => {
    startTestiTimer();
    return () => stopTestiTimer();
  }, [testimonials.length]);

  const startTestiTimer = () => {
    stopTestiTimer();
    swipeTimer.current = setInterval(() => {
      setTestiIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
  };

  const stopTestiTimer = () => {
    if (swipeTimer.current) clearInterval(swipeTimer.current);
  };

  const manualTestiSlide = (direction: 'next' | 'prev') => {
    stopTestiTimer();
    if (direction === 'next') {
      setTestiIndex(prev => (prev + 1) % testimonials.length);
    } else {
      setTestiIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    }
    startTestiTimer();
  };


  useGSAP(() => {
    // Hero Animation
    const tl = gsap.timeline();
    const heroBadge = document.querySelector(".hero-badge");
    if (heroBadge) {
      tl.fromTo(".hero-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
        .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
        .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
        .fromTo(".hero-actions > button", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");
    }

    // Stats, Services, Gallery, Products Animations...
    const sections = [".stats-item", ".service-card", ".gallery-track-container", ".product-card", ".cta-container"];
    sections.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        gsap.fromTo(selector,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: selector, start: "top 85%" }
          }
        );
      }
    });

  }, { scope: container, dependencies: [inventory] }); // Re-run when inventory changes to catch product cards

  return (
    <div ref={container} className="min-h-screen flex flex-col overflow-x-hidden">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative w-full px-4 lg:px-8 py-6 max-w-[1920px] mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] min-h-[70vh] flex items-center shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent z-10"></div>
              {/* Dynamic Hero Image */}
              <div className="w-full h-full bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url('${heroImages[currentSlide]?.url || heroImages[0].url}')` }}></div>
            </div>
            <div className="relative z-20 px-8 md:px-16 max-w-3xl flex flex-col gap-6">
              <div className="hero-badge inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">verified</span> Eco-Certified Excellence
              </div>
              <h1 className="hero-title text-white text-5xl md:text-8xl font-bold leading-[1.1] tracking-tight">
                Powering Your Future with <span className="text-primary">Clean Energy</span>
              </h1>
              <p className="hero-desc text-white/80 text-lg md:text-2xl font-normal leading-relaxed max-w-2xl">
                {heroImages[currentSlide]?.description || "Sustainable solar solutions for modern homes and businesses. Save money while saving the planet."}
              </p>
              <div className="hero-actions flex flex-wrap gap-4 pt-4">
                <button onClick={() => navigate('/consultation')} className="bg-primary hover:bg-primary/90 text-forest px-10 py-5 rounded-xl text-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
                  Get a Free Quote <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button onClick={() => navigate('/gallery')} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-10 py-5 rounded-xl text-xl font-bold transition-all hover:scale-105 active:scale-95">
                  View Our Work
                </button>
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-10 right-10 z-20 flex gap-4">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative size-12 flex items-center justify-center transition-all ${currentSlide === idx ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                >
                  <span className="text-white text-sm font-black">{idx + 1}</span>
                  {currentSlide === idx && (
                    <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="126"
                        className="progress-ring-circle text-primary"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="stats-section max-w-[1600px] mx-auto px-6 lg:px-12 -mt-16 relative z-30 mb-20">
          <div className="bg-white dark:bg-forest border border-forest/10 dark:border-white/10 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 shadow-xl shadow-forest/5 backdrop-blur-lg">
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
        <section className="services-section max-w-[1600px] mx-auto px-6 lg:px-12 py-10" id="services">
          {/* ... (Keeping Services Section Static as it describes core business) ... */}
          {/* ... (Previous code for services cards) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "solar_power", title: "Expert Installation", text: "Precision residential and commercial solar panel installation.", bg: "bg-primary/10", textCol: "text-primary", onClick: () => navigate('/installers') },
              { icon: "shopping_cart", title: "Premium Products", text: "High-efficiency Tier 1 panels, smart inverters, and battery storage.", bg: "bg-accent-yellow/10", textCol: "text-accent-yellow", onClick: () => navigate('/products') },
              { icon: "build", title: "Maintenance", text: "Proactive monitoring and maintenance.", bg: "bg-primary/10", textCol: "text-primary", onClick: handleMaintenanceClick },
              { icon: "package_2", title: "Solar Packages", text: "Curated energy bundles for homes and businesses.", bg: "bg-accent-yellow/10", textCol: "text-accent-yellow", onClick: () => navigate('/packages') }
            ].map((service, idx) => (
              <div key={idx} onClick={service.onClick} className="service-card group relative p-10 rounded-3xl border border-forest/10 dark:border-white/10 bg-white dark:bg-forest/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 cursor-pointer transition-all duration-300">
                {/* ... (Card decoration logic) ... */}
                <div className="relative z-10">
                  <div className={`size-16 rounded-2xl ${service.bg} ${service.textCol} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-4xl">{service.icon}</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{service.title}</h4>
                  <p className="text-forest/60 dark:text-white/60 leading-relaxed text-lg">{service.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Gallery Section (Dynamic) */}
        <section className="gallery-section w-full py-20 bg-gradient-to-b from-transparent to-forest/5 dark:to-white/5 overflow-hidden" id="gallery">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Our Projects</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-forest dark:text-white leading-tight">Recent Installations</h3>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => handleGalleryNav('prev')} className="size-14 rounded-full border border-forest/10 dark:border-white/10 bg-white dark:bg-[#152a17] hover:bg-primary transition-all"><span className="material-symbols-outlined">arrow_back</span></button>
              <button onClick={() => handleGalleryNav('next')} className="size-14 rounded-full border border-forest/10 dark:border-white/10 bg-white dark:bg-[#152a17] hover:bg-primary transition-all"><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </div>

          <div className="gallery-track-container w-full overflow-hidden">
            {images.length > 0 ? (
              <div ref={galleryTrackRef} className="flex gap-8 px-6 lg:px-12 w-max">
                {images.map((img) => (
                  <div key={img.id} onClick={() => navigate('/gallery')} className="group relative bg-white dark:bg-[#152a17] rounded-3xl overflow-hidden shadow-lg cursor-pointer w-[85vw] md:w-[450px] aspect-[4/3] shrink-0 transform transition-all duration-500 hover:scale-[1.02]">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90"></div>
                    <div className="absolute top-6 right-6 z-10">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-white/10">{img.category}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start">
                      <h4 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{img.title}</h4>
                      <p className="text-white/70 text-sm line-clamp-2 mb-6 max-w-sm">{img.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full text-center py-20 text-gray-500">No projects to display yet.</div>
            )}
          </div>
        </section>

        {/* Featured Products (Dynamic) */}
        <section className="products-section bg-forest dark:bg-black/20 py-24 my-20" id="products">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <SectionHeader sub="Product Showcase" title="Advanced Solar Technology" dark={true} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="product-card flex flex-col gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-full aspect-square bg-cover bg-center rounded-xl overflow-hidden" style={{ backgroundImage: `url('${prod.img}')` }}></div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">{prod.category}</p>
                    <h4 className="text-white text-xl font-bold mb-2 line-clamp-1">{prod.name}</h4>
                    <p className="text-white/60 mb-4 text-sm line-clamp-2 flex-1">{prod.description || `${prod.brand} ${prod.series} - ${prod.spec}`}</p>
                    <Link to={`/product/${prod.id}`} className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-sm mt-auto">
                      Learn More <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                    </Link>
                  </div>
                </div>
              ))}
              {featuredProducts.length === 0 && <p className="text-white/50 text-center col-span-3">No products available.</p>}
            </div>
            <div className="mt-12 text-center">
              <Link to="/products" className="inline-block px-8 py-3 bg-primary text-forest font-bold rounded-xl hover:scale-105 transition-transform">View All Products</Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section max-w-[1600px] mx-auto px-6 lg:px-12 py-10 mb-20">
          {/* ... (Keeping existing CTA) ... */}
          <div className="cta-container bg-primary rounded-[3rem] p-12 md:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* ... */}
            <h2 className="text-4xl md:text-7xl font-bold text-forest max-w-4xl leading-tight relative z-10">Ready to switch?</h2>
            <button onClick={() => navigate('/consultation')} className="bg-forest text-white px-12 py-6 rounded-2xl text-xl font-bold hover:scale-105 transition-transform shadow-2xl">Claim Quote</button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default LandingPage;