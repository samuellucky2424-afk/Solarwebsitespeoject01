import React, { useRef, useState, useEffect } from 'react';
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
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const slideDuration = 8; // seconds for slow motion feel

  // Testimonials Carousel State
  const [testiIndex, setTestiIndex] = useState(0);
  const swipeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length);
  };

  // Testimonials Data - Added a 4th for better carousel feel
  const testimonials = [
    { name: "Sarah Jenkins", role: "Residential Client", quote: "My energy bills dropped by 80% immediately. The installation team was professional, clean, and fast.", rating: 5, img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Marcus Chen", role: "Eco-Architect", quote: "I recommend Greenlife to all my clients. Their engineering precision is unmatched in the solar industry.", rating: 5, img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Elena Rodriguez", role: "TechCorp CEO", quote: "Converting our headquarters to solar was seamless. The ROI analysis was spot on.", rating: 5, img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "David Okonkwo", role: "Small Business Owner", quote: "The best investment for my factory. Consistent power supply has improved our productivity by 40%.", rating: 5, img: "https://randomuser.me/api/portraits/men/45.jpg" }
  ];

  // Auto-advance slider with GSAP synchronization
  useEffect(() => {
    if (images.length === 0) return;

    const ctx = gsap.context(() => {
      if (!isHovering) {
        // Reset progress
        gsap.set(".progress-ring-circle", { strokeDashoffset: 126 }); // 2 * PI * r (approx r=20)
        
        // Animate progress
        gsap.to(".progress-ring-circle", {
          strokeDashoffset: 0,
          duration: slideDuration,
          ease: "none",
          onComplete: nextSlide
        });
      } else {
        gsap.killTweensOf(".progress-ring-circle");
        gsap.to(".progress-ring-circle", { strokeDashoffset: 126, duration: 0.3 });
      }
    });

    return () => ctx.revert();
  }, [currentSlide, isHovering, images.length]);

  // Testimonial Auto Swipe Logic
  useEffect(() => {
    startTestiTimer();
    return () => stopTestiTimer();
  }, [testimonials.length]);

  const startTestiTimer = () => {
    stopTestiTimer();
    swipeTimer.current = setInterval(() => {
      setTestiIndex(prev => (prev + 1) % testimonials.length);
    }, 5000); // 5 seconds interval
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
    // Hero Animation - Multi-step Action
    const tl = gsap.timeline();
    tl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.6, ease: "power2.out" })
      .from(".hero-title", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
      .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .from(".hero-actions > button", { y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.7)" }, "-=0.4");

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

    // Engineer Section Animation
    gsap.from(".engineer-card", {
      scrollTrigger: {
        trigger: ".engineer-section",
        start: "top 75%",
      },
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    });

    // Testimonials Animation
    gsap.from(".testimonials-content", {
      scrollTrigger: {
        trigger: ".testimonials-section",
        start: "top 75%",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });

    // Gallery Entrance
    gsap.from(".gallery-container", {
      scrollTrigger: {
        trigger: ".gallery-section",
        start: "top 70%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
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

  }, { scope: container });

  // Animation for slide change
  useGSAP(() => {
    if (images.length > 0) {
      // Animate the image (Ken Burns effect) - smooth slow motion
      gsap.fromTo(`.slide-img-${currentSlide}`, 
        { scale: 1.15 },
        { scale: 1, duration: 10, ease: "power1.out", overwrite: true }
      );
      
      // Animate content entrance with a staggered reveal
      const tl = gsap.timeline();
      tl.fromTo(`.slide-content-${currentSlide}`,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.2 }
      );
      
      // Parallax effect on text elements inside
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
        <section className="relative w-full px-6 lg:px-10 py-10 max-w-[1280px] mx-auto">
          <div className="relative overflow-hidden rounded-3xl min-h-[600px] flex items-center shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent z-10"></div>
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZorIbyrZ5OLhbDy634lXDn9Pdhc4stIeZqUjuHMAlvZJ5w2PS4Y9M_5znVvIV3C0VY89GZ2tgBtf5dZvyH2G0EcUxS9p6AQY3U0j8pQ5diSochratuVXWrfyfRe6btjNtAboqC8xaWFwSPmf-pMSac0YoENe0aosNNcg4K9kp00_IdL181Tx0iKpQ_oramQeJe4Rmn6RqceeMdHieJ5m3Dlh02kFdme_pXcHuCwKTYiWGcI64M_uBE1frQTxYva44niSL5tnIr84')" }}></div>
            </div>
            <div className="relative z-20 px-8 md:px-16 max-w-2xl flex flex-col gap-6">
              <div className="hero-badge inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                <span className="material-symbols-outlined text-sm">verified</span> Eco-Certified Excellence
              </div>
              <h1 className="hero-title text-white text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Powering Your Future with <span className="text-primary">Clean Energy</span>
              </h1>
              <p className="hero-desc text-white/80 text-lg md:text-xl font-normal leading-relaxed">
                Sustainable solar solutions for modern homes and businesses. Save money while saving the planet with our expert solar installations and premium components.
              </p>
              <div className="hero-actions flex flex-wrap gap-4 pt-4">
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
              <div key={idx} className="service-card group relative p-8 rounded-3xl border border-forest/10 dark:border-white/10 bg-white dark:bg-forest/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 cursor-pointer transition-all duration-300">
                {/* Corner Reveal Effects */}
                <div className="absolute top-0 left-0 w-0 h-0 border-t-[3px] border-l-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-tl-2xl z-0 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[3px] border-r-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-tr-2xl z-0 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[3px] border-l-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-bl-2xl z-0 opacity-0 group-hover:opacity-100"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[3px] border-r-[3px] border-primary transition-all duration-300 ease-out group-hover:w-16 group-hover:h-16 rounded-br-2xl z-0 opacity-0 group-hover:opacity-100"></div>

                <div className="relative z-10">
                  <div className={`size-14 rounded-2xl ${service.bg} ${service.textCol} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3">{service.title}</h4>
                  <p className="text-forest/60 dark:text-white/60 leading-relaxed">{service.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Engineer Feature Section */}
        <section className="engineer-section max-w-[1280px] mx-auto px-6 lg:px-10 py-10 mb-10">
           <div className="engineer-card relative w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10">
              <div className="absolute inset-0 bg-gray-900">
                <img 
                  src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop" 
                  alt="Solar Engineer" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/40 to-transparent flex flex-col justify-center px-8 md:px-16">
                 <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="size-10 rounded-full bg-primary text-forest flex items-center justify-center shadow-lg shadow-primary/20">
                          <span className="material-symbols-outlined">engineering</span>
                       </span>
                       <span className="text-primary font-bold tracking-widest uppercase text-sm drop-shadow-md">World-Class Engineering</span>
                    </div>
                    <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-xl">Built by Experts, Designed for Efficiency</h2>
                    <p className="text-white/90 text-lg leading-relaxed mb-8 drop-shadow-md font-medium">
                       Our certified engineers don't just install solar panels; they architect energy solutions tailored to your property's unique profile, ensuring maximum output and longevity.
                    </p>
                    <button onClick={() => navigate('/consultation')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 w-fit group-hover:bg-white/20 group-hover:border-white/40">
                       Meet Our Team <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                 </div>
              </div>
           </div>
        </section>

        {/* Stylish Testimonials Carousel */}
        <section className="testimonials-section bg-background-light dark:bg-background-dark py-20 overflow-hidden relative">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10">
             <SectionHeader sub="Client Stories" title="Trusted by Community" />
             
             <div className="testimonials-content relative">
               {/* Main Slider Container */}
               <div className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-forest/50 border border-forest/5 dark:border-white/5 shadow-2xl relative h-[500px] md:h-[400px]">
                 
                 {/* Moving Track */}
                 <div 
                   className="flex h-full transition-transform duration-[1500ms] ease-in-out will-change-transform"
                   style={{ transform: `translateX(-${testiIndex * 100}%)` }}
                 >
                    {testimonials.map((testi, idx) => (
                      <div key={idx} className="min-w-full h-full p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-16 justify-center">
                         {/* Image Side */}
                         <div className="relative shrink-0">
                            <div className="size-32 md:size-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                               <img src={testi.img} alt={testi.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-forest p-3 rounded-full shadow-lg text-primary">
                               <span className="material-symbols-outlined text-3xl">format_quote</span>
                            </div>
                         </div>
                         
                         {/* Content Side */}
                         <div className="max-w-2xl text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-1 text-accent-yellow mb-6">
                               {[...Array(testi.rating)].map((_, i) => (
                                  <span key={i} className="material-symbols-outlined filled-icon text-xl">star</span>
                               ))}
                            </div>
                            <h3 className="text-xl md:text-3xl font-medium leading-relaxed italic text-forest dark:text-white mb-8">
                               "{testi.quote}"
                            </h3>
                            <div>
                               <h4 className="text-xl font-bold text-forest dark:text-white">{testi.name}</h4>
                               <p className="text-sm font-bold text-primary uppercase tracking-wider mt-1">{testi.role}</p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Manual Controls */}
                 <button 
                    onClick={() => manualTestiSlide('prev')}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-forest/10 dark:border-white/10 flex items-center justify-center text-forest dark:text-white hover:bg-primary hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 z-20"
                    aria-label="Previous testimonial"
                 >
                    <span className="material-symbols-outlined">arrow_back</span>
                 </button>
                 <button 
                    onClick={() => manualTestiSlide('next')}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 size-12 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-forest/10 dark:border-white/10 flex items-center justify-center text-forest dark:text-white hover:bg-primary hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95 z-20"
                    aria-label="Next testimonial"
                 >
                    <span className="material-symbols-outlined">arrow_forward</span>
                 </button>

                 {/* Indicators */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {testimonials.map((_, idx) => (
                       <button
                          key={idx}
                          onClick={() => {
                             stopTestiTimer();
                             setTestiIndex(idx);
                             startTestiTimer();
                          }}
                          className={`h-2 rounded-full transition-all duration-500 ${idx === testiIndex ? 'w-8 bg-primary shadow-lg shadow-primary/50' : 'w-2 bg-forest/20 dark:bg-white/20 hover:bg-forest/40 dark:hover:bg-white/40'}`}
                          aria-label={`Go to testimonial ${idx + 1}`}
                       />
                    ))}
                 </div>

               </div>
               
               {/* Decor Elements */}
               <div className="absolute -top-10 -right-10 size-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
               <div className="absolute -bottom-10 -left-10 size-64 bg-accent-yellow/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
             </div>
          </div>
        </section>

        {/* Enhanced Gallery Section */}
        <section className="gallery-section max-w-[1280px] mx-auto px-6 lg:px-10 py-20" id="gallery">
          <SectionHeader sub="Our Projects" title="Recent Installations" />
          
          <div 
            className="gallery-container relative w-full h-[500px] md:h-[650px] rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white dark:border-white/5"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {images.length > 0 ? images.map((img, index) => (
               <div 
                 key={img.id} 
                 className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
               >
                 {/* Image with Ken Burns Effect */}
                 <img 
                   src={img.url} 
                   alt={img.title} 
                   className={`slide-img-${index} w-full h-full object-cover origin-center`}
                 />
                 
                 {/* Aesthetic Gradient Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/40 to-transparent opacity-90"></div>
                 
                 {/* Content */}
                 <div className={`slide-content-${index} absolute bottom-0 left-0 w-full p-8 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8`}>
                    <div className="max-w-3xl">
                       <div className="overflow-hidden mb-4">
                          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest backdrop-blur-md hover:bg-white/20 transition-colors">
                            {img.category} Project
                          </span>
                       </div>
                       <h3 className={`slide-title-${index} text-white text-4xl md:text-6xl font-bold leading-[1.1] mb-6 tracking-tight drop-shadow-lg`}>
                         {img.title}
                       </h3>
                       <p className="text-white/80 text-lg md:text-xl font-light max-w-xl leading-relaxed">
                         Delivering superior energy efficiency with our state-of-the-art solar configurations tailored for {img.category.toLowerCase()} needs.
                       </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/products')} className="h-14 px-8 rounded-2xl bg-white text-forest font-bold text-lg hover:bg-primary hover:text-forest transition-all flex items-center gap-2 shadow-xl shadow-black/20">
                           View Details
                        </button>
                    </div>
                 </div>
               </div>
            )) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400">
                <span className="material-symbols-outlined text-6xl mb-4">photo_library</span>
                <p>No images in gallery</p>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="absolute bottom-8 right-8 z-20 flex items-center gap-6">
               {/* Progress Indicators */}
               <div className="hidden md:flex gap-3 bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10">
                 {images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-primary shadow-[0_0_10px_rgba(19,236,91,0.5)]' : 'w-2 bg-white/40 hover:bg-white/80'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                 ))}
               </div>

               <div className="flex gap-4">
                 <button 
                   onClick={prevSlide}
                   className="size-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
                   aria-label="Previous slide"
                 >
                   <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                 </button>
                 
                 <div className="relative size-14 flex items-center justify-center">
                    {/* Progress Ring SVG */}
                    <svg className="absolute inset-0 size-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
                      <circle 
                        cx="22" cy="22" r="20" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.2)" 
                        strokeWidth="2" 
                      />
                      <circle 
                        className="progress-ring-circle"
                        cx="22" cy="22" r="20" 
                        fill="none" 
                        stroke="#13ec5b" 
                        strokeWidth="2"
                        strokeDasharray="126"
                        strokeDashoffset="126"
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <button 
                      onClick={nextSlide}
                      className="size-10 rounded-full bg-white text-forest flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg relative z-10"
                      aria-label="Next slide"
                    >
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                 </div>
               </div>
            </div>
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
              <button onClick={() => navigate('/contact')} className="bg-transparent border-2 border-forest text-forest px-10 py-5 rounded-2xl text-xl font-bold hover:bg-forest hover:text-white transition-all active:scale-95">
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