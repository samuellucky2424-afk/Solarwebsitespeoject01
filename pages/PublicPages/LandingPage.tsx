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
  const { inventory, packages, packagesLoading } = useAdmin();
  const { isAuthenticated } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);

  // Showcase all gallery images in the hero slider if available, else default placeholders
  const heroImages = images.length > 0 ? images : [
    { id: 'h1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZorIbyrZ5OLhbDy634lXDn9Pdhc4stIeZqUjuHMAlvZJ5w2PS4Y9M_5znVvIV3C0VY89GZ2tgBtf5dZvyH2G0EcUxS9p6AQY3U0j8pQ5diSochratuVXWrfyfRe6btjNtAboqC8xaWFwSPmf-pMSac0YoENe0aosNNcg4K9kp00_IdL181Tx0iKpQ_oramQeJe4Rmn6RqceeMdHieJ5m3Dlh02kFdme_pXcHuCwKTYiWGcI64M_uBE1frQTxYva44niSL5tnIr84', title: 'Clean Energy', description: 'Sustainable solar solutions.' }
  ];

  // Featured Products: Show all products marked as featured
  const featuredProducts = inventory;
  const featuredPackages = packages.slice(0, 3);

  // Gallery Carousel State
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const galleryAutoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Testimonials Carousel State
  const [testiIndex, setTestiIndex] = useState(0);
  const swipeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [serviceIndex, setServiceIndex] = useState(0);
  const servicesCarouselRef = useRef<HTMLDivElement>(null);

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

  const services = [
    { icon: "solar_power", title: "Expert Installation", text: "Precision residential and commercial solar panel installation.", bg: "bg-primary/10", textCol: "text-primary", onClick: () => navigate('/installers') },
    { icon: "shopping_cart", title: "Premium Products", text: "High-efficiency Tier 1 panels, smart inverters, and battery storage.", bg: "bg-accent-yellow/10", textCol: "text-accent-yellow", onClick: () => navigate('/products') },
    { icon: "build", title: "Maintenance", text: "Proactive monitoring and maintenance.", bg: "bg-primary/10", textCol: "text-primary", onClick: handleMaintenanceClick },
    { icon: "package_2", title: "Solar Packages", text: "Curated energy bundles for homes and businesses.", bg: "bg-accent-yellow/10", textCol: "text-accent-yellow", onClick: () => navigate('/packages') }
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

  useEffect(() => {
    if (services.length <= 1) return;

    const interval = setInterval(() => {
      if (window.innerWidth >= 768) return;
      setServiceIndex(prev => (prev + 1) % services.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [services.length]);

  useEffect(() => {
    const container = servicesCarouselRef.current;
    if (!container || window.innerWidth >= 768) return;

    const cards = container.querySelectorAll<HTMLElement>('[data-service-card]');
    const activeCard = cards[serviceIndex];
    if (!activeCard) return;

    container.scrollTo({
      left: activeCard.offsetLeft,
      behavior: 'smooth'
    });
  }, [serviceIndex]);


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

    // Stats, Services, Gallery, Products, Packages Animations...
    const sections = [".stats-item", ".service-card", ".homepage-package-card", ".gallery-track-container", ".product-card", ".cta-container"];
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

  }, { scope: container, dependencies: [inventory, packages, packagesLoading] });

  return (
    <div ref={container} className="min-h-screen flex flex-col overflow-x-hidden">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative w-full px-0 py-2 md:py-4 max-w-none mx-0">
          <div className="relative overflow-hidden min-h-[58vh] sm:min-h-[58vh] md:min-h-[60vh] flex items-center">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent z-10"></div>
              {/* Dynamic Hero Image */}
              <div className="w-full h-full bg-cover bg-center transition-all duration-1000"
                style={{ backgroundImage: `url('${heroImages[currentSlide]?.url || heroImages[0].url}')` }}></div>
            </div>
            <div className="relative z-20 px-5 sm:px-8 md:px-12 pt-8 pb-16 sm:py-10 md:py-12 max-w-3xl flex flex-col gap-3 md:gap-4">
              <div className="hero-badge inline-flex w-fit items-center gap-2 px-2.5 py-1 sm:px-3 bg-primary/20 text-primary border border-primary/30 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">verified</span> Eco-Certified Excellence
              </div>
              <h1 className="hero-title text-white text-[2rem] sm:text-4xl md:text-6xl font-bold leading-[1.05] md:leading-[1.1] tracking-tight">
                Powering Your Future with <span className="text-primary">Clean Energy</span>
              </h1>
              <p className="hero-desc text-white/80 text-sm sm:text-base md:text-xl font-normal leading-relaxed max-w-2xl">
                {heroImages[currentSlide]?.description || "Sustainable solar solutions for modern homes and businesses. Save money while saving the planet."}
              </p>
              <div className="hero-actions flex flex-col sm:flex-row sm:flex-wrap items-start gap-3 pt-1 md:pt-2">
                <button onClick={() => navigate('/consultation')} className="w-full sm:w-auto justify-center bg-primary hover:bg-primary/90 text-forest px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl text-sm sm:text-base md:text-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
                  Get a Free Quote <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
                <button onClick={() => navigate('/gallery')} className="w-full sm:w-auto inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl text-sm sm:text-base md:text-lg font-bold transition-all hover:scale-105 active:scale-95">
                  View Our Work
                </button>
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-5 right-5 md:bottom-10 md:right-10 z-20 flex gap-2 md:gap-4">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative size-9 md:size-12 flex items-center justify-center transition-all ${currentSlide === idx ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                >
                  <span className="text-white text-xs md:text-sm font-black">{idx + 1}</span>
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
        <section className="stats-section max-w-[1600px] mx-auto px-6 lg:px-8 -mt-12 relative z-30 mb-16">
          <div className="bg-white dark:bg-forest border border-forest/10 dark:border-white/10 rounded-2xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 shadow-xl shadow-forest/5 backdrop-blur-lg">
            {[
              { label: "Installations", value: "2K+" },
              { label: "Energy Produced", value: "20MW" },
              { label: "Warranty", value: "3yrs" },
              { label: "Saved by Clients", value: "NGN 23M" }
            ].map((stat, idx) => (
              <div key={idx} className="stats-item text-center">
                <p className="text-primary text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-forest/60 dark:text-white/60 text-xs md:text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section max-w-[1600px] mx-auto px-6 lg:px-8 py-8" id="services">
          {/* ... (Keeping Services Section Static as it describes core business) ... */}
          {/* ... (Previous code for services cards) ... */}
          <div
            ref={servicesCarouselRef}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-6 px-6 lg:mx-0 lg:px-0 pb-2 scroll-smooth"
          >
            {services.map((service, idx) => (
              <div
                key={idx}
                data-service-card
                onClick={service.onClick}
                className="service-card group relative min-w-[85vw] sm:min-w-[340px] md:min-w-0 p-6 md:p-8 rounded-3xl border border-forest/10 dark:border-white/10 bg-white dark:bg-forest/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 cursor-pointer transition-all duration-300 snap-center"
              >
                {/* ... (Card decoration logic) ... */}
                <div className="relative z-10">
                  <div className={`size-12 md:size-14 rounded-xl md:rounded-2xl ${service.bg} ${service.textCol} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{service.title}</h4>
                  <p className="text-forest/60 dark:text-white/60 leading-relaxed text-sm md:text-base">{service.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
            {services.map((service, idx) => (
              <button
                key={service.title}
                onClick={() => setServiceIndex(idx)}
                className={`h-2 rounded-full transition-all ${serviceIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-forest/20 dark:bg-white/20'}`}
                aria-label={`Show ${service.title}`}
              />
            ))}
          </div>
        </section>

        <section className="packages-section max-w-[1600px] mx-auto px-6 lg:px-8 py-12" id="packages">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-xs mb-2 md:mb-3">Package Plans</h2>
              <h3 className="text-2xl md:text-4xl font-bold text-forest dark:text-white leading-tight">Supabase-powered solar packages, straight from the dashboard</h3>
              <p className="text-forest/60 dark:text-white/60 mt-3 text-sm md:text-base">
                The landing page is now reading the same package records as the user dashboard, including package images, power capacity, pricing, and appliance coverage.
              </p>
            </div>
            <Link to="/packages" className="inline-flex items-center gap-2 text-forest dark:text-white font-bold hover:text-primary transition-colors">
              Browse all packages
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {packagesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((card) => (
                <div key={card} className="homepage-package-card overflow-hidden rounded-[2rem] bg-[#10311f] border border-white/5 animate-pulse">
                  <div className="aspect-[4/3] bg-white/5"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 w-28 bg-white/10 rounded"></div>
                    <div className="h-8 w-2/3 bg-white/10 rounded"></div>
                    <div className="h-4 w-full bg-white/10 rounded"></div>
                    <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-9 bg-white/10 rounded-xl"></div>
                      <div className="h-9 bg-white/10 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredPackages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/packages/${pkg.id}`}
                  className="homepage-package-card group overflow-hidden rounded-[2rem] bg-[#10311f] text-white border border-forest/10 shadow-xl shadow-forest/5 hover:-translate-y-2 transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0b2417]">
                    {pkg.img ? (
                      <img
                        src={pkg.img}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <span className="material-symbols-outlined text-6xl">solar_power</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10311f] via-[#10311f]/20 to-transparent"></div>
                    <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-forest">
                      <span className="material-symbols-outlined text-sm">bolt</span>
                      {pkg.powerCapacity || 'Custom build'}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.25em] mb-2">Solar Package</p>
                        <h4 className="text-2xl font-bold leading-tight">{pkg.name}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Starting at</p>
                        <p className="text-xl font-black text-primary mt-1">NGN {pkg.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-sm text-white/70 line-clamp-3 min-h-[60px]">{pkg.description}</p>

                    <div className="grid grid-cols-2 gap-2">
                      {pkg.appliances.slice(0, 4).map((appliance, idx) => (
                        <div key={idx} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                          {appliance}
                        </div>
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-2 text-primary font-bold pt-2">
                      Request Package
                      <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-forest/15 dark:border-white/10 p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-primary/70">inventory_2</span>
              <p className="text-forest/70 dark:text-white/70 mt-4">No package data is available on the homepage yet.</p>
            </div>
          )}
        </section>

        {/* Enhanced Gallery Section (Dynamic) */}
        <section className="gallery-section w-full py-16 bg-gradient-to-b from-transparent to-forest/5 dark:to-white/5 overflow-hidden" id="gallery">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 mb-8 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-widest uppercase text-[10px] md:text-xs mb-2 md:mb-3">Our Projects</h2>
              <h3 className="text-2xl md:text-4xl font-bold text-forest dark:text-white leading-tight">Recent Installations</h3>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => handleGalleryNav('prev')} className="size-14 rounded-full border border-forest/10 dark:border-white/10 bg-white dark:bg-[#152a17] hover:bg-primary transition-all"><span className="material-symbols-outlined">arrow_back</span></button>
              <button onClick={() => handleGalleryNav('next')} className="size-14 rounded-full border border-forest/10 dark:border-white/10 bg-white dark:bg-[#152a17] hover:bg-primary transition-all"><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </div>

          <div className="gallery-track-container w-full overflow-hidden">
            {images.length > 0 ? (
              <div ref={galleryTrackRef} className="flex gap-6 px-6 lg:px-8 w-max">
                {images.map((img) => (
                  <div key={img.id} onClick={() => navigate('/gallery')} className="group relative bg-white dark:bg-[#152a17] rounded-3xl overflow-hidden shadow-lg cursor-pointer w-[80vw] md:w-[350px] lg:w-[400px] aspect-[4/3] shrink-0 transform transition-all duration-500 hover:scale-[1.02]">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90"></div>
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-white/10">{img.category}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start">
                      <h4 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{img.title}</h4>
                      <p className="text-white/70 text-xs md:text-sm line-clamp-2 mb-4 max-w-sm">{img.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full text-center py-12 text-gray-500 text-sm">No projects to display yet.</div>
            )}
          </div>
        </section>

        {/* Featured Products (Dynamic) */}
        <section className="products-section bg-forest dark:bg-black/20 py-16 my-16" id="products">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
            <SectionHeader sub="Product Showcase" title="Advanced Solar Technology" dark={true} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="product-card flex flex-col gap-3 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-full aspect-square bg-cover bg-center rounded-xl overflow-hidden" style={{ backgroundImage: `url('${prod.img}')` }}></div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">{prod.category}</p>
                    <h4 className="text-white text-lg font-bold mb-1 line-clamp-1">{prod.name}</h4>
                    <p className="text-white/60 mb-3 text-xs md:text-sm line-clamp-2 flex-1">{prod.description || `${prod.brand} ${prod.series} - ${prod.spec}`}</p>
                    <Link to={`/product/${prod.id}`} className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-xs md:text-sm mt-auto">
                      Learn More <span className="material-symbols-outlined text-[10px] md:text-sm">arrow_right_alt</span>
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
        <section className="cta-section max-w-[1600px] mx-auto px-6 lg:px-8 py-8 mb-16">
          {/* ... (Keeping existing CTA) ... */}
          <div className="cta-container bg-primary rounded-[2.5rem] p-8 md:p-16 text-center flex flex-col items-center gap-6 relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* ... */}
            <h2 className="text-3xl md:text-5xl font-bold text-forest max-w-3xl leading-tight relative z-10">Ready to switch?</h2>
            <button onClick={() => navigate('/consultation')} className="bg-forest text-white px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-transform shadow-2xl">Claim Quote</button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default LandingPage;
