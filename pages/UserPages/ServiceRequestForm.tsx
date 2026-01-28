import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';

const ServiceRequestForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || 'maintenance'; // 'maintenance' or 'survey'
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    issueType: 'Inverter', // Only for maintenance
    description: '' // Only for maintenance
  });

  const isMaintenance = type === 'maintenance';
  const title = isMaintenance ? 'Maintenance Request' : 'House & Load Survey';
  const subTitle = isMaintenance 
    ? 'Report technical issues with your system.' 
    : 'Schedule a professional site assessment.';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create the request object
    const newRequest = {
      id: `#REQ-${Math.floor(Math.random() * 10000)}`,
      type: isMaintenance ? 'Maintenance' : 'Site Survey',
      title: isMaintenance ? `${formData.issueType} Issue` : 'New Site Survey',
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      date: new Date().toLocaleDateString(),
      scheduledDate: `${formData.date} at ${formData.time}`,
      status: 'Pending',
      description: isMaintenance ? formData.description : 'Site survey request',
      priority: isMaintenance ? 'High' : 'Normal'
    };

    // Simulate sending to Admin Dashboard (Local Storage)
    const existingRequests = JSON.parse(localStorage.getItem('greenlife_requests') || '[]');
    localStorage.setItem('greenlife_requests', JSON.stringify([newRequest, ...existingRequests]));

    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setToast({ msg: "Request sent to Admin Dashboard & Email!" });
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
      <PublicHeader />
      {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-primary font-bold flex items-center gap-2 mb-4 hover:underline">
            <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-forest dark:text-white">{title}</h1>
          <p className="text-forest/60 dark:text-white/60 text-lg">{subTitle}</p>
        </div>

        <div className="bg-white dark:bg-[#152a17] p-8 rounded-3xl border border-forest/5 dark:border-white/5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-forest/80 dark:text-white/80">Full Name</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-forest/80 dark:text-white/80">Phone Number</label>
                <input 
                  required
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-forest/80 dark:text-white/80">Email Address</label>
              <input 
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-forest/80 dark:text-white/80">House Address</label>
              <input 
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                placeholder="123 Solar Blvd, Sunnyville, CA"
              />
            </div>

            {/* Maintenance Specific Fields */}
            {isMaintenance && (
              <div className="space-y-6 pt-4 border-t border-forest/5 dark:border-white/5">
                <h3 className="font-bold text-lg text-forest dark:text-white">Issue Details</h3>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-forest/80 dark:text-white/80">Problem Type</label>
                  <select 
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Inverter">Inverter Failure</option>
                    <option value="Battery">Battery Issue</option>
                    <option value="Camera">Security Camera / Monitoring</option>
                    <option value="Panels">Solar Panels</option>
                    <option value="Wiring">Wiring / Connection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-forest/80 dark:text-white/80">Description of Problem</label>
                  <textarea 
                    required
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Please describe what you are experiencing..."
                  />
                </div>
              </div>
            )}

            {/* Scheduling */}
            <div className="space-y-6 pt-4 border-t border-forest/5 dark:border-white/5">
              <h3 className="font-bold text-lg text-forest dark:text-white">Preferred Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-forest/80 dark:text-white/80">Preferred Date</label>
                  <input 
                    required
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-forest/80 dark:text-white/80">Preferred Time</label>
                  <input 
                    required
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary text-forest h-14 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <>Submit Request <span className="material-symbols-outlined">send</span></>
              )}
            </button>
          </form>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ServiceRequestForm;