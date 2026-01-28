import React, { useState, useRef } from 'react';
import { PublicHeader, PublicFooter, SectionHeader, Toast } from '../../components/SharedComponents';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const ContactPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setToast({ msg: "Message sent! We'll get back to you shortly." });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(".contact-header", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .from(".contact-info-card", {
      x: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.4")
    .from(".contact-form-card", {
      x: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.6");

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden">
      <PublicHeader />
      {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}

      <main className="flex-1 max-w-[1280px] mx-auto px-6 lg:px-10 py-12 w-full">
        <div className="contact-header mb-12 text-center max-w-2xl mx-auto">
          <SectionHeader sub="Get In Touch" title="We're Here to Help" />
          <p className="text-forest/70 dark:text-white/70 text-lg mt-4">
            Have a question about our products, support, or partnership opportunities? Send us a message and our team will respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info Side */}
          <div className="lg:col-span-2 contact-info-card space-y-8">
            <div className="bg-white dark:bg-[#152a17] p-8 rounded-3xl border border-forest/5 dark:border-white/5 shadow-xl shadow-forest/5">
              <h3 className="text-2xl font-bold text-forest dark:text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-forest dark:text-white">Headquarters</h4>
                    <p className="text-forest/60 dark:text-white/60 text-sm mt-1">
                      Total plaza, 78 Old Lagos -Asaba Rd<br />
                      Boji Boji, Agbor 321103, Delta
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">phone</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-forest dark:text-white">Phone Support</h4>
                    <p className="text-forest/60 dark:text-white/60 text-sm mt-1">
                      Mon-Fri 8am-6pm PST
                    </p>
                    <a href="tel:09036570294" className="text-forest dark:text-white font-bold hover:text-primary transition-colors">
                      0903 657 0294
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-forest dark:text-white">Email Us</h4>
                    <p className="text-forest/60 dark:text-white/60 text-sm mt-1">
                      General inquiries & support
                    </p>
                    <a href="mailto:infogreenlifetechnology@gmail.com" className="text-forest dark:text-white font-bold hover:text-primary transition-colors">
                      infogreenlifetechnology@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-forest/5 dark:border-white/5">
                 <h4 className="font-bold text-forest dark:text-white mb-4">Connect with us</h4>
                 <div className="flex gap-4">
                    {[
                      { name: 'facebook', url: 'https://www.facebook.com/GreenlifeSolarsolution' },
                      { name: 'instagram', url: 'https://www.instagram.com/greenlife_solarsolution?igsh=YjFiZHk0ajc3b2Yx' }
                    ].map((social) => (
                       <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-forest/5 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-forest dark:text-white">
                          <img src={`https://cdn.simpleicons.org/${social.name}`} className="w-4 h-4 opacity-60 hover:opacity-100 dark:invert" alt={social.name} />
                       </a>
                    ))}
                 </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden h-64 relative shadow-lg border border-forest/5 dark:border-white/5">
               <img className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU7uVdcCm0kXjHes7ZT0BeqnJUSq4eke4vXvI-DZPMxrV4SDZnXNYV3d_0F5_jnTICdM3WprFui3n7tWbQQSoNPTZs69lw0DNEojKaOBgqXc1xUg7L2J_vfY8CvpfQqlMK5He9M_fD18lNStUsi6N604UmX-4lCxrjXDz2Ars1UuGiSY8gEgtVFIT8gxXUL42FkMWtKB4AzGgfxdYhFJxl4iw0Qjk8WWyUsvF8sWbChVg8td7wSh36njhT5AqpoITrdGFB9shLJAQ" alt="Map Location" />
               <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
               <div className="absolute bottom-4 left-4 bg-white dark:bg-forest px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-forest dark:text-white">Open Now</span>
               </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3 contact-form-card">
            <div className="bg-white dark:bg-[#152a17] p-8 md:p-12 rounded-[2.5rem] border border-forest/5 dark:border-white/5 shadow-2xl shadow-primary/5">
               <h3 className="text-3xl font-bold text-forest dark:text-white mb-8">Send a Message</h3>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-forest/80 dark:text-white/80">Your Name</label>
                        <input 
                           name="name"
                           value={formData.name}
                           onChange={handleChange}
                           required
                           className="w-full h-14 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                           placeholder="John Doe"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-forest/80 dark:text-white/80">Email Address</label>
                        <input 
                           name="email"
                           type="email"
                           value={formData.email}
                           onChange={handleChange}
                           required
                           className="w-full h-14 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                           placeholder="john@example.com"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-forest/80 dark:text-white/80">Subject</label>
                     <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full h-14 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                     >
                        <option value="" disabled>Select a topic</option>
                        <option value="sales">Sales Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-sm font-bold text-forest/80 dark:text-white/80">Message</label>
                     <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        placeholder="How can we help you today?"
                     ></textarea>
                  </div>

                  <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full bg-primary text-forest h-14 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                     {isSubmitting ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                     ) : (
                        <>Send Message <span className="material-symbols-outlined">send</span></>
                     )}
                  </button>
               </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ContactPage;