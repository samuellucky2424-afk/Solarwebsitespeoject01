import React, { useState, useRef } from 'react';
import { PublicHeader, PublicFooter } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ConsultationFormProps {
  isEmbedded?: boolean;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ isEmbedded = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    // If embedded, scroll dashboard container instead of window
    if (isEmbedded) {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    if (isEmbedded) {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      handleNext();
    }, 1500);
  };

  useGSAP(() => {
    // Animate the step content entrance whenever step changes
    gsap.fromTo(".step-content",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
    );

    // Animate progress bar fill
    gsap.to(".progress-fill", {
      width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
      duration: 0.5,
      ease: "power2.inOut"
    });
  }, { scope: containerRef, dependencies: [step] });

  const renderProgressBar = () => {
    let progress = 33;
    let label = "Step 1: Property Details";
    let nextLabel = "Next: Energy Needs Assessment";

    if (step === 2) {
      progress = 66;
      label = "Step 2: Energy Analysis";
      nextLabel = "Next: Contact Information";
    } else if (step === 3) {
      progress = 100;
      label = "Step 3: Final Details";
      nextLabel = "Finish";
    }

    if (step === 4) return null;

    return (
      <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#e7f3e8] dark:border-[#1a351c] shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex gap-6 justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 bg-primary text-forest text-xs font-bold rounded-full">{step}</span>
              <p className="text-[#0d1b0f] dark:text-white text-base font-semibold leading-normal">{label}</p>
            </div>
            <p className="text-[#0d1b0f] dark:text-white text-sm font-medium leading-normal">{progress}% Complete</p>
          </div>
          <div className="rounded-full bg-[#cfe7d1] dark:bg-[#1a351c] h-2.5 overflow-hidden">
            <div className="progress-fill h-full bg-primary" style={{ width: `33%` }}></div>
          </div>
          <p className="text-[#4c9a52] dark:text-[#7ed484] text-sm font-normal leading-normal italic flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span> {nextLabel}
          </p>
        </div>
      </div>
    );
  };
  return (
    <div ref={containerRef} className={`${isEmbedded ? 'w-full' : 'bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden'}`}>
      {!isEmbedded && <PublicHeader />}
      <main className={`flex-grow flex flex-col ${isEmbedded ? '' : ''}`}>
        <div className={`${isEmbedded ? 'w-full py-6' : 'max-w-[1200px] mx-auto w-full px-6 py-12'}`}>
          {/* Page Heading */}
          <div className="mb-10">
            <h1 className="text-[#0d1b0f] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">Consultation Request Form</h1>
            <p className="text-[#4c9a52] dark:text-[#7ed484] text-lg font-normal">Complete the steps below for your personalized solar savings report.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-8">
              {renderProgressBar()}

              {/* Form Content Card */}
              <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#e7f3e8] dark:border-[#1a351c] shadow-md overflow-hidden min-h-[400px]">

                {/* Step 1: Property Details */}
                {step === 1 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">Property Details</h3>
                        <div className="group relative cursor-help">
                          <span className="material-symbols-outlined text-gray-400 text-lg">info</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            We use this information to calculate your roof's solar potential and sunlight exposure.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">Property Address</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 md:left-4 top-3 md:top-4 text-[#4c9a52] text-xl">location_on</span>
                            <input className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 pl-10 md:pl-12 pr-4 text-sm md:text-base text-[#0d1b0f] dark:text-white placeholder:text-[#4c9a52]/60 focus:ring-primary focus:border-primary transition-all" placeholder="Enter your street address, city, and zip code" type="text" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">Roof Type</label>
                            <select className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none" defaultValue="">
                              <option disabled value="">Select roof type</option>
                              <option value="tile">Asphalt Shingle / Tile</option>
                              <option value="metal">Metal</option>
                              <option value="flat">Flat Roof (Concrete/EPDM)</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">Primary Orientation</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['North', 'South', 'East', 'West'].map(dir => (
                                <label key={dir} className="relative cursor-pointer">
                                  <input className="peer sr-only" name="orientation" type="radio" value={dir.toLowerCase()} />
                                  <div className="h-11 md:h-14 border border-[#cfe7d1] dark:border-[#1a351c] rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] flex items-center justify-center text-xs md:text-sm font-medium peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary transition-all hover:bg-primary/5 dark:hover:bg-white/5">{dir}</div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Energy Analysis */}
                {step === 2 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">Energy Analysis</h3>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal flex justify-between">
                            <span>Average Monthly Electric Bill</span>
                            <span className="text-primary font-bold">₦250</span>
                          </label>
                          <input type="range" min="50" max="1000" defaultValue="250" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" />
                          <div className="flex justify-between text-[10px] md:text-xs text-gray-500 font-medium">
                            <span>₦50</span>
                            <span>₦1000+</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">Utility Provider</label>
                            <select className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none">
                              <option>PG&E</option>
                              <option>SCE</option>
                              <option>SDGE</option>
                              <option>Other / Municipal</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">Home Size (Sq Ft)</label>
                            <input className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all" placeholder="e.g. 2500" type="number" />
                          </div>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                          <p className="font-bold mb-3">Do you own or plan to add:</p>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" className="size-5 rounded border-gray-300 text-primary focus:ring-primary" />
                              <span className="text-sm">Electric Vehicle (EV)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" className="size-5 rounded border-gray-300 text-primary focus:ring-primary" />
                              <span className="text-sm">Swimming Pool / Hot Tub</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" className="size-5 rounded border-gray-300 text-primary focus:ring-primary" />
                              <span className="text-sm">Central Air Conditioning</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Info */}
                {step === 3 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">Final Details</h3>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="font-bold text-sm md:text-base">First Name</label>
                            <input className="form-input w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary" placeholder="John" type="text" />
                          </div>
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="font-bold text-sm md:text-base">Last Name</label>
                            <input className="form-input w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary" placeholder="Doe" type="text" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="font-bold text-sm md:text-base">Email Address</label>
                          <input className="form-input w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary" placeholder="john@example.com" type="email" />
                        </div>

                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="font-bold text-sm md:text-base">Phone Number</label>
                          <input className="form-input w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary" placeholder="(555) 123-4567" type="tel" />
                        </div>

                        <div className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-xs md:text-sm text-gray-500">
                          <input type="checkbox" className="mt-1 size-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                          <p>By clicking submit, I authorize Greenlife Solar to contact me via email or phone. I agree to the <a href="#" className="underline hover:text-primary">Privacy Policy</a>.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                  <div className="step-content flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                    <div className="size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <h3 className="text-3xl font-black mb-4">Request Received!</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mb-8">
                      Thank you for trusting Greenlife Solar. Our engineering team is reviewing your property details. You will receive your personalized report within 24 hours.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="bg-primary text-forest px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95">
                      Return to Home
                    </button>
                  </div>
                )}

                {/* Form Navigation */}
                {step < 4 && (
                  <div className="px-6 md:px-8 py-4 md:py-6 bg-[#f8fcf8] dark:bg-[#102212] border-t border-[#e7f3e8] dark:border-[#1a351c] flex items-center justify-between">
                    <button
                      onClick={handleBack}
                      className={`text-[#4c9a52] text-sm md:text-base font-semibold flex items-center gap-1.5 md:gap-2 hover:text-[#0d1b0f] transition-colors ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={step === 1}
                    >
                      <span className="material-symbols-outlined text-base md:text-xl">arrow_back</span> Back
                    </button>

                    {step < 3 ? (
                      <button onClick={handleNext} className="bg-primary text-forest px-6 md:px-10 py-2.5 md:py-3 text-sm md:text-base rounded-lg font-bold hover:bg-opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5 md:gap-2 active:scale-95">
                        Next Step <span className="material-symbols-outlined text-base md:text-xl">arrow_forward</span>
                      </button>
                    ) : (
                      <button onClick={handleSubmit} disabled={isSubmitting} className="bg-forest text-white px-6 md:px-10 py-2.5 md:py-3 text-sm md:text-base rounded-lg font-bold hover:bg-opacity-90 shadow-lg transition-all flex items-center gap-1.5 md:gap-2 active:scale-95">
                        {isSubmitting ? (
                          <span className="animate-spin material-symbols-outlined text-base md:text-xl">progress_activity</span>
                        ) : (
                          <>Submit Request <span className="material-symbols-outlined text-base md:text-xl">send</span></>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel Benefits */}
            <aside className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 p-8 rounded-xl sticky top-24">
                <h4 className="text-[#0d1b0f] dark:text-white text-xl font-bold mb-6">Why Request a Consultation?</h4>
                <ul className="space-y-6">
                  {[
                    { icon: "home_pin", title: "Free Site Assessment", desc: "A professional on-site review of your property's solar capacity." },
                    { icon: "bar_chart", title: "Personalized Savings Report", desc: "Custom ROI projection based on your energy consumption habits." },
                    { icon: "support_agent", title: "Expert Technical Advice", desc: "Get answers to technical questions from our certified engineers." }
                  ].map((benefit, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="bg-primary size-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-forest">{benefit.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-[#0d1b0f] dark:text-white">{benefit.title}</p>
                        <p className="text-sm text-[#4c9a52] dark:text-[#7ed484] mt-1">{benefit.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-8 border-t border-primary/20">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    <p className="text-xs font-medium text-[#4c9a52] dark:text-[#7ed484]">Your data is protected. We never share your details with third parties.</p>
                  </div>
                </div>
              </div>
              {step === 1 && (
                <div className="rounded-xl overflow-hidden h-48 relative shadow-md">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU7uVdcCm0kXjHes7ZT0BeqnJUSq4eke4vXvI-DZPMxrV4SDZnXNYV3d_0F5_jnTICdM3WprFui3n7tWbQQSoNPTZs69lw0DNEojKaOBgqXc1xUg7L2J_vfY8CvpfQqlMK5He9M_fD18lNStUsi6N604UmX-4lCxrjXDz2Ars1UuGiSY8gEgtVFIT8gxXUL42FkMWtKB4AzGgfxdYhFJxl4iw0Qjk8WWyUsvF8sWbChVg8td7wSh36njhT5AqpoITrdGFB9shLJAQ" alt="Map" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-medium">Serving over 5,000 households nationwide</p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      {!isEmbedded && <PublicFooter />}
    </div>
  );
};

export default ConsultationForm;