import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicHeader, PublicFooter, SectionHeader } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGallery } from '../../context/GalleryContext';
import { useAuth } from '../../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const { images } = useGallery();
  const { isAuthenticated } = useAuth();
  
  const [currentSlide, setCurrentSlide] = useState(0); 
  
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

  // Testimonials Data
  const testimonials = [
    { name: "Sarah Jenkins", role: "Residential Client", quote: "My energy bills dropped by 80% immediately. The installation team was professional, clean, and fast.", rating: 5 },
    { name: "Marcus Chen", role: "Eco-Architect", quote: "I recommend Greenlife to all my clients. Their engineering precision is unmatched in the solar industry.", rating: 5 },
    { name: "Elena Rodriguez", role: "TechCorp CEO", quote: "Converting our headquarters to solar was seamless. The ROI analysis was spot on.", rating: 5 },
    { name: "David Okonkwo", role: "Small Business Owner", quote: "The best investment for my factory. Consistent power supply has improved our productivity by 40%.", rating: 5 }
  ];

  // --- Hero Slider Logic ---
  // Auto-advance slider with GSAP synchronization
  useEffect(() => {
    if (images.length === 0) return;

    const ctx = gsap.context(() => {
        // Reset progress
        gsap.set(".progress-ring-circle", { strokeDashoffset: 126 }); // 2 * PI * r (approx r=20)
        
        // Animate progress
        gsap.to(".progress-ring-circle", {
          strokeDashoffset: 0,
          duration: 8,
          ease: "none",
          onComplete: () => setCurrentSlide(prev => (prev + 1) % images.length)
        });
    });

    return () => ctx.revert();
  }, [currentSlide, images.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
  };


  // --- Gallery Carousel Logic ---
  const startGalleryAutoPlay = () => {
    if (galleryAutoPlayRef.current) clearInterval(galleryAutoPlayRef.current);
    galleryAutoPlayRef.current = setInterval(() => {
      setGalleryIndex(prev => (prev + 1) % Math.max(1, images.length));
    }, 5000); // 5 seconds per slide
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
    
    // Calculate movement based on card width + gap
    // Assuming card min-width is set in CSS. 
    // We can use percentage or relative units for smoother response.
    // However, specifically targeting child width is more precise.
    const firstCard = galleryTrackRef.current.children[0] as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 32; // gap-8 is 2rem = 32px
    const moveX = -(galleryIndex * (cardWidth + gap));

    gsap.to(galleryTrackRef.current, {
      x: moveX,
      duration: 1.5, // Slow motion feel
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
    tl.fromTo(".hero-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
      .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .fromTo(".hero-actions > button", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");

    // Stats Bar Animation
    gsap.fromTo(".stats-item", 
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 85%",
        }
      }
    );

    // Services Animation
    gsap.fromTo(".service-card", 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".services-section",
          start: "top 80%",
        }
      }
    );

    // Gallery Entrance (Track Fade In)
    gsap.fromTo(".gallery-track-container", 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gallery-section",
          start: "top 80%",
        }
      }
    );

    // Products Animation
    gsap.fromTo(".product-card", 
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".products-section",
          start: "top 80%",
        }
      }
    );

    // CTA Animation
    gsap.fromTo(".cta-container", 
      { scale: 0.95, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1, 0.75)",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 85%",
        }
      }
    );

  }, { scope: container });

  // Animation for Hero Slide Change
  useGSAP(() => {
    if (images.length > 0) {
      gsap.fromTo(`.slide-img-${currentSlide}`, 
        { scale: 1.15 },
        { scale: 1, duration: 10, ease: "power1.out", overwrite: true }
      );
      
      const tl = gsap.timeline();
      tl.fromTo(`.slide-content-${currentSlide}`,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );
      
      tl.fromTo(`.slide-title-${currentSlide}`,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
        "-=0.8"
      );
    }
  }, [currentSlide, images]);

  return (
    <div ref={container} className="min-h-screen flex flex-col overflow-x-hidden">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative w-full px-4 lg:px-8 py-6 max-w-[1920px] mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] min-h-[70vh] flex items-center shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent z-10"></div>
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZorIbyrZ5OLhbDy634lXDn9Pdhc4stIeZqUjuHMAlvZJ5w2PS4Y9M_5znVvIV3C0VY89GZ2tgBtf5dZvyH2G0EcUxS9p6AQY3U0j8pQ5diSochratuVXWrfyfRe6btjNtAboqC8xaWFwSPmf-pMSac0YoENe0aosNNcg4K9kp00_IdL181Tx0iKpQ_oramQeJe4Rmn6RqceeMdHieJ5m3Dlh02kFdme_pXcHuCwKTYiWGcI64M_uBE1frQTxYva44niSL5tnIr84')" }}></div>
            </div>
            <div className="relative z-20 px-8 md:px-16 max-w-3xl flex flex-col gap-6">
              <div className="hero-badge inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">verified</span> Eco-Certified Excellence
              </div>
              <h1 className="hero-title text-white text-5xl md:text-8xl font-bold leading-[1.1] tracking-tight">
                Powering Your Future with <span className="text-primary">Clean Energy</span>
              </h1>
              <p className="hero-desc text-white/80 text-lg md:text-2xl font-normal leading-relaxed max-w-2xl">
                Sustainable solar solutions for modern homes and businesses. Save money while saving the planet with our expert solar installations.
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
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Our Expertise</h2>
              <h3 className="text-3xl md:text-6xl font-bold text-forest dark:text-white leading-tight">Comprehensive Solar Energy Solutions</h3>
            </div>
            <p className="text-forest/60 dark:text-white/60 max-w-lg text-xl">
              We handle everything from initial consultation to final grid connection, ensuring a seamless transition to renewable energy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: "solar_power", 
                title: "Expert Installation", 
                text: "Precision residential and commercial solar panel installation by certified technicians.", 
                bg: "bg-primary/10", 
                textCol: "text-primary",
                onClick: () => navigate('/installers') 
              },
              { 
                icon: "shopping_cart", 
                title: "Premium Products", 
                text: "High-efficiency Tier 1 panels, smart inverters, and lithium-ion battery storage.", 
                bg: "bg-accent-yellow/10", 
                textCol: "text-accent-yellow",
                onClick: () => navigate('/products?filter=best-seller') 
              },
              { 
                icon: "build", 
                title: "Maintenance", 
                text: "Proactive monitoring and maintenance to ensure your system performs at peak efficiency.", 
                bg: "bg-primary/10", 
                textCol: "text-primary",
                onClick: handleMaintenanceClick 
              },
              { 
                icon: "package_2", 
                title: "Solar Packages", 
                text: "Curated energy bundles designed for specific home and business power requirements.", 
                bg: "bg-accent-yellow/10", 
                textCol: "text-accent-yellow",
                onClick: () => navigate('/packages') 
              }
            ].map((service, idx) => (
              <div key={idx} onClick={service.onClick} className="service-card group relative p-10 rounded-3xl border border-forest/10 dark:border-white/10 bg-white dark:bg-forest/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 cursor-pointer transition-all duration-300">
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[3px] border-l-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-tl-2xl z-0 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[3px] border-r-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-tr-2xl z-0 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[3px] border-l-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-bl-2xl z-0 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[3px] border-r-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-br-2xl z-0 opacity-0 group-hover:opacity-100"></div>

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

        {/* Engineer Feature Section */}
        <section className="engineer-section max-w-[1600px] mx-auto px-6 lg:px-12 py-10 mb-10">
           <div className="engineer-card relative w-full h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group border border-white/10">
              <div className="absolute inset-0 bg-gray-900">
                <img 
                  src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop" 
                  alt="Solar Engineer" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent flex flex-col justify-center px-8 md:px-24">
                 <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="size-10 rounded-full bg-primary text-forest flex items-center justify-center shadow-lg shadow-primary/20">
                          <span className="material-symbols-outlined">engineering</span>
                       </span>
                       <span className="text-primary font-bold tracking-widest uppercase text-sm drop-shadow-md">World-Class Engineering</span>
                    </div>
                    <h2 className="text-white text-4xl md:text-7xl font-bold leading-tight mb-6 drop-shadow-xl">Built by Experts, Designed for Efficiency</h2>
                    <p className="text-white/90 text-xl leading-relaxed mb-10 drop-shadow-md font-medium">
                       Our certified engineers don't just install solar panels; they architect energy solutions tailored to your property's unique profile, ensuring maximum output and longevity.
                    </p>
                    <button onClick={() => navigate('/installers')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-xl font-bold text-lg transition-all flex items-center gap-2 w-fit group-hover:bg-white/20 group-hover:border-white/40">
                       Meet Our Team <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* Stylish Testimonials Carousel */}
        <section className="testimonials-section bg-background-light dark:bg-background-dark py-20 overflow-hidden relative">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
             <SectionHeader sub="Client Stories" title="Trusted by Community" />
             
             <div className="testimonials-content relative">
               <div className="overflow-hidden rounded-[3rem] bg-white dark:bg-forest/50 border border-forest/5 dark:border-white/5 shadow-2xl relative h-[500px]">
                 <div 
                   className="flex h-full transition-transform duration-[1500ms] ease-in-out will-change-transform"
                   style={{ transform: `translateX(-${testiIndex * 100}%)` }}
                 >
                    {testimonials.map((testi, idx) => (
                      <div key={idx} className="min-w-full h-full p-8 md:p-16 flex flex-col items-center justify-center text-center">
                         <div className="mb-8 bg-white dark:bg-forest p-4 rounded-full shadow-lg text-primary inline-flex">
                            <span className="material-symbols-outlined text-5xl">format_quote</span>
                         </div>
                         <div className="max-w-4xl">
                            <div className="flex items-center justify-center gap-1 text-accent-yellow mb-8">
                               {[...Array(testi.rating)].map((_, i) => (
                                  <span key={i} className="material-symbols-outlined filled-icon text-2xl">star</span>
                               ))}
                            </div>
                            <h3 className="text-2xl md:text-4xl font-medium leading-relaxed italic text-forest dark:text-white mb-10">
                               "{testi.quote}"
                            </h3>
                            <div>
                               <h4 className="text-2xl font-bold text-forest dark:text-white">{testi.name}</h4>
                               <p className="text-base font-bold text-primary uppercase tracking-wider mt-2">{testi.role}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Manual Controls */}
                 <button 
                    onClick={() => manualTestiSlide('prev')}
                    className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-forest/10 dark:border-white/10 flex items-center justify-center text-forest dark:text-white hover:bg-primary hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 z-20"
                    aria-label="Previous testimonial"
                 >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                 </button>
                 <button 
                    onClick={() => manualTestiSlide('next')}
                    className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 size-16 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-forest/10 dark:border-white/10 flex items-center justify-center text-forest dark:text-white hover:bg-primary hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 z-20"
                    aria-label="Next testimonial"
                 >
                    <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                 </button>

                 {/* Indicators */}
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {testimonials.map((_, idx) => (
                       <button
                          key={idx}
                          onClick={() => {
                             stopTestiTimer();
                             setTestiIndex(idx);
                             startTestiTimer();
                          }}
                          className={`h-3 rounded-full transition-all duration-500 ${idx === testiIndex ? 'w-10 bg-primary shadow-lg shadow-primary/50' : 'w-3 bg-forest/20 dark:bg-white/20 hover:bg-forest/40 dark:hover:bg-white/40'}`}
                          aria-label={`Go to testimonial ${idx + 1}`}
                       />
                    ))}
                 </div>
               </div>
               
               <div className="absolute -top-10 -right-10 size-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
               <div className="absolute -bottom-10 -left-10 size-64 bg-accent-yellow/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
             </div>
          </div>
        </section>

        {/* Enhanced Gallery Section (Horizontal Auto Swipe) */}
        <section className="gallery-section w-full py-20 bg-gradient-to-b from-transparent to-forest/5 dark:to-white/5 overflow-hidden" id="gallery">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
             <div className="max-w-2xl">
               <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Our Projects</h2>
               <h3 className="text-3xl md:text-5xl font-bold text-forest dark:text-white leading-tight">Recent Installations</h3>
             </div>
             
             {/* Manual Controls */}
             <div className="flex items-center gap-4">
               <button 
                 onClick={() => handleGalleryNav('prev')}
                 className="size-14 rounded-full border border-forest/10 dark:border-white/10 bg-white dark:bg-[#152a17] text-forest dark:text-white flex items-center justify-center hover:bg-primary hover:text-forest transition-all"
               >
                 <span className="material-symbols-outlined">arrow_back</span>
               </button>
               <button 
                 onClick={() => handleGalleryNav('next')}
                 className="size-14 rounded-full border border-forest/10 dark:border-white/10 bg-white dark:bg-[#152a17] text-forest dark:text-white flex items-center justify-center hover:bg-primary hover:text-forest transition-all"
               >
                 <span className="material-symbols-outlined">arrow_forward</span>
               </button>
             </div>
          </div>
          
          <div className="gallery-track-container w-full overflow-hidden">
            {images.length > 0 ? (
              <div 
                ref={galleryTrackRef} 
                className="flex gap-8 px-6 lg:px-12 w-max"
              >
                 {/* Render images twice to ensure visual continuity logic or just render once if using index scrolling */}
                 {images.map((img) => (
                    <div 
                      key={img.id} 
                      onClick={() => navigate('/gallery')} 
                      className="group relative bg-white dark:bg-[#152a17] rounded-3xl overflow-hidden shadow-lg border border-forest/5 dark:border-white/5 cursor-pointer w-[85vw] md:w-[450px] lg:w-[500px] aspect-[4/3] shrink-0 transform transition-all duration-500 hover:scale-[1.02]"
                    >
                       <img 
                          src={img.url} 
                          alt={img.title} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
                       
                       <div className="absolute top-6 right-6 z-10">
                          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-white/10">
                             {img.category}
                          </span>
                       </div>

                       <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start">
                          <h4 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{img.title}</h4>
                          {img.description && (
                             <p className="text-white/70 text-sm line-clamp-2 mb-6 max-w-sm">
                                {img.description}
                             </p>
                          )}
                          <span className="bg-primary text-forest font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                             View Project <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
            ) : (
              <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-400">
                 <span className="material-symbols-outlined text-4xl mb-2">photo_library</span>
                 <p>No recent projects to display</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
             <button onClick={() => navigate('/gallery')} className="inline-flex items-center gap-2 text-forest/70 dark:text-white/70 font-bold hover:text-primary transition-colors text-sm uppercase tracking-widest border-b-2 border-transparent hover:border-primary pb-1">
                Explore Full Gallery
             </button>
          </div>
        </section>

        {/* Featured Products */}
        <section className="products-section bg-forest dark:bg-black/20 py-24 my-20" id="products">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <SectionHeader sub="Product Showcase" title="Advanced Solar Technology" dark={true} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Monocrystalline Panels", sub: "High Efficiency", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeVJOVAEcn2TC5LANFimRUWMhIN1Fbg-T_bpf2XYA413sZwSDYiLJF4tbkshKq0s8soG27g-Wza1A8rYfblgtmY8hqjnItF5Hn0W_rgBHM4_1qF2SaLsG6Nbq4U8F6mBvQeMSg7X3d4h_D9xYCzk91j3L2P8WB1u7btZhBcAzPSnJsxf8rFp0sHsYXEEfHYWuh5PyvPH3BazC0XxSqJ2HT_7QCGlgoA4jWZ94oKMQB11tTaQaPRdj8N1lzyLkAmBwGOLnKd0AQ6qg" },
                { title: "Lithium-ion Batteries", sub: "Smart Storage", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqRxBqnJx1hpehQb5DGOJJrL9TL5K27CSYdCS9eKZNtvCVg0d0WfG93cDU-nDtbhnqh0wYk1fjvJoR42Jme7omPmgD2T8603SvVrJ-sqL_hx-Y8NacvcDYm_qqDJggJxUmDrdRMWU0gz6In9yUz0uQ5PT17L-HLT8W8OyGKjjXhs6mowwQk9Jnnqng3YDTmokW6esOqufu6v43HoutXEtuRA05ArPQ1-ZFtrh45YWOlT8RouzkK45xFL100mO8e5BaGruaBMAVMH8" },
                { title: "Hybrid Inverters", sub: "Intelligent Flow", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP7iH6rE6-Ht0qjA7AZW-NjGvsQt0CRhAvVjOwKqTdP-ea2Yb_uZWVAeeXhHvhVYIfIKk-iRkRbwiM34HBJbhAfNhXLkj5-BvfjVR7lQSkIosy2Loo24Tmoq77kLIQefQTmW9oe00rN8p_aOeTW3KsUdnB7Dxw_7X841nAQB8tYtF3tCRMSP_ENogsoZRpw09Y6a6tPUvqhaIn44ENAbL5qSgc5mEMPLdwR2waDr5uRDFqIGyZWa7-kSRpVstEtLmdOabeuRPvEAo" }
              ].map((prod, idx) => (
                <div key={idx} className="product-card flex flex-col gap-6 bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors group">
                  <div className="w-full aspect-square bg-cover bg-center rounded-2xl overflow-hidden" style={{ backgroundImage: `url('${prod.img}')` }}></div>
                  <div>
                    <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">{prod.sub}</p>
                    <h4 className="text-white text-3xl font-bold mb-4">{prod.title}</h4>
                    <p className="text-white/60 mb-8 text-lg">Experience cutting-edge performance designed to last for decades.</p>
                    <Link to="/products" className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-lg">
                      Learn More <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section max-w-[1600px] mx-auto px-6 lg:px-12 py-10 mb-20">
          <div className="cta-container bg-primary rounded-[3rem] p-12 md:p-24 text-center flex flex-col items-center gap-8 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 size-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 size-64 bg-forest/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            <h2 className="text-4xl md:text-7xl font-bold text-forest max-w-4xl leading-tight relative z-10">
              Ready to switch to clean, renewable energy?
            </h2>
            <p className="text-forest/80 text-xl md:text-2xl max-w-2xl relative z-10">
              Get your personalized energy roadmap today. Our experts are ready to help you save.
            </p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <button onClick={() => navigate('/consultation')} className="bg-forest text-white px-12 py-6 rounded-2xl text-xl font-bold hover:scale-105 transition-transform shadow-2xl active:scale-95">
                Claim Your Free Quote
              </button>
              <button onClick={() => navigate('/contact')} className="bg-transparent border-2 border-forest text-forest px-12 py-6 rounded-2xl text-xl font-bold hover:bg-forest hover:text-white transition-all active:scale-95">
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