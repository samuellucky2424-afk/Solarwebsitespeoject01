import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';

interface ServiceRequestFormProps {
  isEmbedded?: boolean;
  requestType?: 'maintenance' | 'survey';
  onSuccess?: () => void;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ isEmbedded = false, requestType, onSuccess }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addRequest, activeUser } = useAdmin();
  const { user: authUser } = useAuth();

  // Use prop type if embedded, otherwise read from URL
  const type = requestType || searchParams.get('type') || 'maintenance';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    issueType: 'Inverter',
    description: ''
  });

  // Pre-fill from user profile if available
  useEffect(() => {
    if (activeUser) {
      setFormData(prev => ({
        ...prev,
        name: activeUser.fullName || prev.name,
        email: activeUser.email || prev.email,
        phone: activeUser.phone || prev.phone,
        address: activeUser.address || prev.address,
      }));
    }
  }, [activeUser]);

  const isMaintenance = type === 'maintenance';
  const title = isMaintenance ? 'Maintenance Request' : 'House & Load Survey';
  const subTitle = isMaintenance
    ? 'Report technical issues with your system.'
    : 'Schedule a professional site assessment.';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requestTypeLabel = isMaintenance ? 'Maintenance Request' : 'Site Survey Request';

    const newRequest = {
      id: `REQ-${Date.now()}`,
      type: requestTypeLabel as any,
      title: isMaintenance ? `${formData.issueType} Issue` : 'New Site Survey',
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      date: new Date().toLocaleDateString(),
      status: 'New' as any,
      description: isMaintenance ? formData.description : `Site survey request — Preferred: ${formData.date} at ${formData.time}`,
      priority: isMaintenance ? 'High' as any : 'Normal' as any,
    };

    await addRequest(newRequest);

    setIsSubmitting(false);
    setToast({ msg: "Request submitted successfully!" });

    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else if (!isEmbedded) {
        navigate('/dashboard');
      }
    }, 1500);
  };

  // --- Form Content (shared between embedded and standalone) ---
  const formContent = (
    <>
      {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-forest dark:text-white">{title}</h2>
        <p className="text-forest/60 dark:text-white/60">{subTitle}</p>
      </div>

      <div className="bg-white dark:bg-[#152a17] p-6 md:p-8 rounded-2xl border border-forest/5 dark:border-white/5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
              <input
                required name="name" value={formData.name} onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500">Phone Number</label>
              <input
                required name="phone" type="tel" value={formData.phone} onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                placeholder="08012345678"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
            <input
              required name="email" type="email" value={formData.email} onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-gray-500">House Address</label>
            <input
              required name="address" value={formData.address} onChange={handleChange}
              className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
              placeholder="123 Solar Street, Lagos"
            />
          </div>

          {/* Maintenance Specific Fields */}
          {isMaintenance && (
            <div className="space-y-5 pt-4 border-t border-forest/5 dark:border-white/5">
              <h3 className="font-bold text-sm text-forest dark:text-white">Issue Details</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500">Problem Type</label>
                <select
                  name="issueType" value={formData.issueType} onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                >
                  <option value="Inverter">Inverter Failure</option>
                  <option value="Battery">Battery Issue</option>
                  <option value="Camera">Security Camera / Monitoring</option>
                  <option value="Panels">Solar Panels</option>
                  <option value="Wiring">Wiring / Connection</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500">Description of Problem</label>
                <textarea
                  required name="description" rows={3} value={formData.description} onChange={handleChange}
                  className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
                  placeholder="Please describe what you are experiencing..."
                />
              </div>
            </div>
          )}

          {/* Scheduling */}
          <div className="space-y-4 pt-4 border-t border-forest/5 dark:border-white/5">
            <h3 className="font-bold text-sm text-forest dark:text-white">Preferred Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500">Preferred Date</label>
                <input
                  required name="date" type="date" value={formData.date} onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500">Preferred Time</label>
                <input
                  required name="time" type="time" value={formData.time} onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-background-light dark:bg-background-dark border border-forest/10 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-forest h-12 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>Submit Request <span className="material-symbols-outlined">send</span></>
            )}
          </button>
        </form>
      </div>
    </>
  );

  // --- Embedded mode: just the form content, no wrapper ---
  if (isEmbedded) {
    return <div className="max-w-3xl mx-auto animate-in fade-in">{formContent}</div>;
  }

  // --- Standalone mode: full page with header/footer ---
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body">
      <PublicHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary font-bold flex items-center gap-2 mb-4 hover:underline">
            <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
          </button>
        </div>
        {formContent}
      </main>
      <PublicFooter />
    </div>
  );
};

export default ServiceRequestForm;