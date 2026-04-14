import React, { useState, useRef } from 'react';
import { PublicHeader, PublicFooter } from '../../components/SharedComponents';
import TermsAndConditions from '../../components/TermsAndConditions';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getQuoteRecommendations, QuoteSelectionInput, QuoteRecommendation, EXTRA_APPLIANCE_OPTIONS } from '../../data/consultationQuotes';
import { useAdmin } from '../../context/AdminContext';
import { sendConsultationEmails } from '../../src/lib/sendConsultationEmail';

interface ConsultationFormProps {
  isEmbedded?: boolean;
}

type ConsultationFieldErrors = Partial<
  Record<
    'address' | 'roofType' | 'housingType' | 'firstName' | 'lastName' | 'email' | 'phone',
    string
  >
>;

const ConsultationForm: React.FC<ConsultationFormProps> = ({ isEmbedded = false }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tcAgreed, setTcAgreed] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ConsultationFieldErrors>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { addRequest } = useAdmin();

  // Form data state
  const [propertyData, setPropertyData] = useState({
    address: '',
    roofType: '',
    housingType: '' as 'bungalow' | 'upstairs' | 'duplex' | '',
  });

  const [applianceData, setApplianceData] = useState<QuoteSelectionInput>({
    bedroomCount: 1,
    housingType: 'bungalow',
    fans: 1,
    tvs: 1,
    fridges: 0,
    fridgeType: 'none',
    acCount: 0,
    acType: 'none',
    washingMachineCount: 0,
    washingMachineType: 'none',
    washingMachineSize: 'none',
    additionalAppliances: [],
  });

  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [quoteRecommendations, setQuoteRecommendations] = useState<QuoteRecommendation[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRecommendation | null>(null);

  const clearFieldError = (field: keyof ConsultationFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  };

  const validateCurrentStep = (currentStep: number): ConsultationFieldErrors => {
    const errors: ConsultationFieldErrors = {};

    if (currentStep === 1) {
      if (!propertyData.address.trim()) {
        errors.address = 'Property address is required.';
      }
      if (!propertyData.roofType) {
        errors.roofType = 'Please select your roof type.';
      }
      if (!propertyData.housingType) {
        errors.housingType = 'Please select your housing type.';
      }
    }

    if (currentStep === 4) {
      if (!contactData.firstName.trim()) {
        errors.firstName = 'First name is required.';
      }
      if (!contactData.lastName.trim()) {
        errors.lastName = 'Last name is required.';
      }
      if (!contactData.email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!validateEmail(contactData.email)) {
        errors.email = 'Enter a valid email address.';
      }
      if (!contactData.phone.trim()) {
        errors.phone = 'Phone number is required.';
      } else if (!validatePhone(contactData.phone)) {
        errors.phone = 'Enter a valid phone number.';
      }
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateCurrentStep(step);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);

    if (isEmbedded) {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (step === 2) {
      const recommendations = getQuoteRecommendations(applianceData);
      setQuoteRecommendations(recommendations);
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setFieldErrors({});
    setSubmitError(null);
    if (isEmbedded) {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateCurrentStep(4);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError('Please complete all required contact details before submitting your request.');
      return;
    }
    if (!selectedQuote) {
      setSubmitError('Please select a quote package before submitting your consultation request.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const customerName = `${contactData.firstName} ${contactData.lastName}`.trim();
      const requestDescription = `
Consultation Request for ${selectedQuote.quote.title}

Property Details:
- Address: ${propertyData.address}
- Roof Type: ${propertyData.roofType}
- Housing Type: ${propertyData.housingType}

Selected Package: ${selectedQuote.quote.title} (${selectedQuote.quote.tagline})
- Price: ₦${selectedQuote.quote.price.toLocaleString()}
- Inverter: ${selectedQuote.quote.inverter}
- Battery: ${selectedQuote.quote.battery}
- Panels: ${selectedQuote.quote.panels}
- Load: ${selectedQuote.quote.loadText}

Appliance Configuration:
- Bedrooms: ${applianceData.bedroomCount}
- Fans: ${applianceData.fans}
- TVs: ${applianceData.tvs}
- Fridges: ${applianceData.fridges} (${applianceData.fridgeType})
- ACs: ${applianceData.acCount} (${applianceData.acType})
- Washing Machines: ${applianceData.washingMachineCount} (${applianceData.washingMachineType}, ${applianceData.washingMachineSize})
- Additional Appliances: ${applianceData.additionalAppliances.join(', ') || 'None'}
      `.trim();

      const request = {
        id: `consultation-${Date.now()}`,
        title: `Consultation: ${selectedQuote.quote.title} for ${customerName}`,
        type: 'Consultation Request' as const,
        customer: customerName,
        address: propertyData.address,
        date: new Date().toISOString(),
        status: 'New' as const,
        priority: 'Normal' as const,
        description: requestDescription,
        phone: contactData.phone,
        email: contactData.email,
        packageId: selectedQuote.quote.id,
      };

      // Save to database
      const dbSuccess = await addRequest(request);
      if (!dbSuccess) {
        throw new Error('Failed to save request to database');
      }

      // Send emails
      const emailResult = await sendConsultationEmails({
        customerName,
        customerEmail: contactData.email,
        customerPhone: contactData.phone,
        propertyAddress: propertyData.address,
        roofType: propertyData.roofType,
        housingType: propertyData.housingType,
        bedroomCount: applianceData.bedroomCount,
        fans: applianceData.fans,
        tvs: applianceData.tvs,
        fridges: applianceData.fridges,
        fridgeType: applianceData.fridgeType,
        acCount: applianceData.acCount,
        acType: applianceData.acType,
        washingMachineCount: applianceData.washingMachineCount,
        washingMachineType: applianceData.washingMachineType,
        washingMachineSize: applianceData.washingMachineSize,
        additionalAppliances: applianceData.additionalAppliances,
        selectedQuote,
        adminEmail: 'infogreenlifetechnology@gmail.com',
      });

      if (!emailResult.success) {
        console.warn('Email sending failed:', emailResult.error);
        // Don't fail the entire submission if emails fail
      }

      setTimeout(() => {
        setIsSubmitting(false);
        handleNext();
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting your request');
      setIsSubmitting(false);
    }
  };

  useGSAP(() => {
    gsap.fromTo(
      '.step-content',
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
    );

    gsap.to('.progress-fill', {
      width: step === 1 ? '20%' : step === 2 ? '40%' : step === 3 ? '60%' : step === 4 ? '80%' : '100%',
      duration: 0.5,
      ease: 'power2.inOut',
    });
  }, { scope: containerRef, dependencies: [step] });

  const renderProgressBar = () => {
    let progress = 20;
    let label = 'Step 1: Property Details';
    let nextLabel = 'Next: Appliance Selection';

    if (step === 2) {
      progress = 40;
      label = 'Step 2: Appliance Selection';
      nextLabel = 'Next: Quote Recommendations';
    } else if (step === 3) {
      progress = 60;
      label = 'Step 3: Quote Recommendations';
      nextLabel = 'Next: Contact Information';
    } else if (step === 4) {
      progress = 80;
      label = 'Step 4: Contact Information';
      nextLabel = 'Next: Submit Request';
    } else if (step === 5) {
      progress = 100;
      label = 'Step 5: Request Submitted';
      nextLabel = 'Complete';
    }

    if (step === 5) return null;

    return (
      <div className="bg-white dark:bg-[#152a17] p-6 rounded-xl border border-[#e7f3e8] dark:border-[#1a351c] shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex gap-6 justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 bg-primary text-forest text-xs font-bold rounded-full">
                {step}
              </span>
              <p className="text-[#0d1b0f] dark:text-white text-base font-semibold leading-normal">{label}</p>
            </div>
            <p className="text-[#0d1b0f] dark:text-white text-sm font-medium leading-normal">{progress}% Complete</p>
          </div>
          <div className="rounded-full bg-[#cfe7d1] dark:bg-[#1a351c] h-2.5 overflow-hidden">
            <div className="progress-fill h-full bg-primary" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[#4c9a52] dark:text-[#7ed484] text-sm font-normal leading-normal italic flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span> {nextLabel}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`${
        isEmbedded
          ? 'w-full'
          : 'bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-body overflow-x-hidden'
      }`}
    >
      {!isEmbedded && <PublicHeader />}
      <main className={`flex-grow flex flex-col ${isEmbedded ? '' : ''}`}>
        <div className={`${isEmbedded ? 'w-full py-6' : 'max-w-[1200px] mx-auto w-full px-6 py-12'}`}>
          <div className="mb-10">
            <h1 className="text-[#0d1b0f] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
              Consultation Request Form
            </h1>
            <p className="text-[#4c9a52] dark:text-[#7ed484] text-lg font-normal">
              Complete the steps below for your personalized solar savings report.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {renderProgressBar()}

              <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#e7f3e8] dark:border-[#1a351c] shadow-md overflow-hidden min-h-[400px]">
                {/* Step 1: Property Details */}
                {step === 1 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">
                          Property Details
                        </h3>
                        <div className="group relative cursor-help">
                          <span className="material-symbols-outlined text-gray-400 text-lg">info</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            We use this information to calculate your roof's solar potential and sunlight exposure.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                            Property Address
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 md:left-4 top-3 md:top-4 text-[#4c9a52] text-xl">
                              location_on
                            </span>
                            <input
                              className={`form-input flex w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 pl-10 md:pl-12 pr-4 text-sm md:text-base text-[#0d1b0f] dark:text-white placeholder:text-[#4c9a52]/60 focus:ring-primary focus:border-primary transition-all ${
                                fieldErrors.address
                                  ? 'border-red-400 dark:border-red-500'
                                  : 'border-[#cfe7d1] dark:border-[#1a351c]'
                              }`}
                              placeholder="Enter your street address, city, and zip code"
                              type="text"
                              value={propertyData.address}
                              onChange={(e) => {
                                setPropertyData((prev) => ({ ...prev, address: e.target.value }));
                                clearFieldError('address');
                              }}
                              aria-invalid={Boolean(fieldErrors.address)}
                            />
                          </div>
                          {fieldErrors.address && (
                            <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                              Roof Type
                            </label>
                            <select
                              className={`form-input flex w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none ${
                                fieldErrors.roofType
                                  ? 'border-red-400 dark:border-red-500'
                                  : 'border-[#cfe7d1] dark:border-[#1a351c]'
                              }`}
                              value={propertyData.roofType}
                              onChange={(e) => {
                                setPropertyData((prev) => ({ ...prev, roofType: e.target.value }));
                                clearFieldError('roofType');
                              }}
                              aria-invalid={Boolean(fieldErrors.roofType)}
                            >
                              <option disabled value="">
                                Select roof type
                              </option>
                              <option value="tile">Asphalt Shingle / Tile</option>
                              <option value="metal">Metal</option>
                              <option value="flat">Flat Roof (Concrete/EPDM)</option>
                              <option value="other">Other</option>
                            </select>
                            {fieldErrors.roofType && (
                              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.roofType}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                              Housing Type
                            </label>
                            <select
                              className={`form-input flex w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none ${
                                fieldErrors.housingType
                                  ? 'border-red-400 dark:border-red-500'
                                  : 'border-[#cfe7d1] dark:border-[#1a351c]'
                              }`}
                              value={propertyData.housingType}
                              onChange={(e) => {
                                const value = e.target.value as 'bungalow' | 'upstairs' | 'duplex';
                                setPropertyData((prev) => ({ ...prev, housingType: value }));
                                setApplianceData((prev) => ({ ...prev, housingType: value }));
                                clearFieldError('housingType');
                              }}
                              aria-invalid={Boolean(fieldErrors.housingType)}
                            >
                              <option disabled value="">
                                Select housing type
                              </option>
                              <option value="bungalow">Bungalow</option>
                              <option value="upstairs">Upstairs Apartment</option>
                              <option value="duplex">Duplex</option>
                            </select>
                            {fieldErrors.housingType && (
                              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.housingType}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Appliance Selection */}
                {step === 2 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">
                          Appliance Selection
                        </h3>
                        <div className="group relative cursor-help">
                          <span className="material-symbols-outlined text-gray-400 text-lg">info</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-80 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            Select all appliances you currently own or plan to add. This helps us recommend the best solar package for your needs.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                            Number of Bedrooms
                          </label>
                          <select
                            className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                            value={applianceData.bedroomCount}
                            onChange={(e) =>
                              setApplianceData((prev) => ({ ...prev, bedroomCount: parseInt(e.target.value) }))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num} bedroom{num > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                              Number of Fans
                            </label>
                            <select
                              className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                              value={applianceData.fans}
                              onChange={(e) => setApplianceData((prev) => ({ ...prev, fans: parseInt(e.target.value) }))}
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                              Number of TVs
                            </label>
                            <select
                              className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                              value={applianceData.tvs}
                              onChange={(e) => setApplianceData((prev) => ({ ...prev, tvs: parseInt(e.target.value) }))}
                            >
                              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                Number of Fridges
                              </label>
                              <select
                                className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                value={applianceData.fridges}
                                onChange={(e) =>
                                  setApplianceData((prev) => ({ ...prev, fridges: parseInt(e.target.value) }))
                                }
                              >
                                {[0, 1, 2, 3].map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {applianceData.fridges > 0 && (
                              <div className="flex flex-col gap-2">
                                <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                  Fridge Type
                                </label>
                                <select
                                  className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                  value={applianceData.fridgeType}
                                  onChange={(e) =>
                                    setApplianceData((prev) => ({ ...prev, fridgeType: e.target.value as any }))
                                  }
                                >
                                  <option value="mini">Mini Fridge</option>
                                  <option value="single-door">Single Door</option>
                                  <option value="double-door">Double Door</option>
                                  <option value="side-by-side">Side by Side</option>
                                  <option value="chest-freezer">Chest Freezer</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                Number of Air Conditioners
                              </label>
                              <select
                                className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                value={applianceData.acCount}
                                onChange={(e) =>
                                  setApplianceData((prev) => ({ ...prev, acCount: parseInt(e.target.value) }))
                                }
                              >
                                {[0, 1, 2, 3].map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {applianceData.acCount > 0 && (
                              <div className="flex flex-col gap-2">
                                <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                  AC Type
                                </label>
                                <select
                                  className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                  value={applianceData.acType}
                                  onChange={(e) =>
                                    setApplianceData((prev) => ({ ...prev, acType: e.target.value as any }))
                                  }
                                >
                                  <option value="1hp">1 HP</option>
                                  <option value="1.5hp">1.5 HP</option>
                                  <option value="2hp">2 HP</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                Washing Machines
                              </label>
                              <select
                                className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                value={applianceData.washingMachineCount}
                                onChange={(e) =>
                                  setApplianceData((prev) => ({
                                    ...prev,
                                    washingMachineCount: parseInt(e.target.value),
                                  }))
                                }
                              >
                                {[0, 1, 2].map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {applianceData.washingMachineCount > 0 && (
                              <>
                                <div className="flex flex-col gap-2">
                                  <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                    Type
                                  </label>
                                  <select
                                    className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                    value={applianceData.washingMachineType}
                                    onChange={(e) =>
                                      setApplianceData((prev) => ({
                                        ...prev,
                                        washingMachineType: e.target.value as any,
                                      }))
                                    }
                                  >
                                    <option value="semi-automatic">Semi-Automatic</option>
                                    <option value="fully-automatic">Fully Automatic</option>
                                    <option value="front-loader">Front Loader</option>
                                    <option value="top-loader">Top Loader</option>
                                  </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                                    Size
                                  </label>
                                  <select
                                    className="form-input flex w-full rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base text-[#0d1b0f] dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none"
                                    value={applianceData.washingMachineSize}
                                    onChange={(e) =>
                                      setApplianceData((prev) => ({
                                        ...prev,
                                        washingMachineSize: e.target.value as any,
                                      }))
                                    }
                                  >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                  </select>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[#0d1b0f] dark:text-white text-sm md:text-base font-semibold leading-normal">
                            Are you planning to add any other appliances?
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {EXTRA_APPLIANCE_OPTIONS.map((appliance) => (
                              <label
                                key={appliance}
                                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-[#cfe7d1] dark:border-[#1a351c] hover:bg-[#f8fcf8] dark:hover:bg-[#0d1b0f] transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={applianceData.additionalAppliances.includes(appliance)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setApplianceData((prev) => ({
                                        ...prev,
                                        additionalAppliances: [...prev.additionalAppliances, appliance],
                                      }));
                                    } else {
                                      setApplianceData((prev) => ({
                                        ...prev,
                                        additionalAppliances: prev.additionalAppliances.filter(
                                          (a) => a !== appliance
                                        ),
                                      }));
                                    }
                                  }}
                                />
                                <span className="text-sm text-[#0d1b0f] dark:text-white">{appliance}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Quote Recommendations */}
                {step === 3 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">
                          Recommended Quotes
                        </h3>
                        <div className="group relative cursor-help">
                          <span className="material-symbols-outlined text-gray-400 text-lg">info</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-80 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            Based on your appliance selections, here are the best matching solar packages. Select one to
                            continue with your consultation request.
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {quoteRecommendations.map((recommendation) => (
                          <div
                            key={recommendation.quote.id}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                              selectedQuote?.quote.id === recommendation.quote.id
                                ? 'border-primary bg-primary/5'
                                : 'border-[#cfe7d1] dark:border-[#1a351c] hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedQuote(recommendation)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-[#0d1b0f] dark:text-white mb-1">
                                  {recommendation.quote.title}
                                </h4>
                                <p className="text-sm text-[#4c9a52] dark:text-[#7ed484] mb-2">
                                  {recommendation.quote.tagline}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">bolt</span>
                                    {recommendation.quote.inverter}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">battery_4_bar</span>
                                    {recommendation.quote.battery}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">solar_power</span>
                                    {recommendation.quote.panels}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-black text-primary mb-1">
                                  ₦{recommendation.quote.price.toLocaleString()}
                                </div>
                                {recommendation.isStrongMatch && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Strong Match
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-[#0d1b0f] dark:text-white mb-3">
                              <strong>Load:</strong> {recommendation.quote.loadText}
                            </p>
                            <p className="text-sm text-[#0d1b0f] dark:text-white mb-3">
                              <strong>Suitable for:</strong> {recommendation.quote.recommendedProperty}
                            </p>

                            {recommendation.notes.length > 0 && (
                              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Notes:</p>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                  {recommendation.notes.map((note, i) => (
                                    <li key={i}>• {note}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="selectedQuote"
                                  checked={selectedQuote?.quote.id === recommendation.quote.id}
                                  onChange={() => setSelectedQuote(recommendation)}
                                  className="text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-[#0d1b0f] dark:text-white">
                                  Select this package
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">Match Score: {recommendation.score}/100</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {!selectedQuote && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Please select a quote package to continue with your consultation request.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Info */}
                {step === 4 && (
                  <div className="step-content">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-6">
                        <h3 className="text-[#0d1b0f] dark:text-white tracking-tight text-2xl font-bold leading-tight">
                          Final Details
                        </h3>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="font-bold text-sm md:text-base">First Name</label>
                            <input
                              className={`form-input w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary ${
                                fieldErrors.firstName
                                  ? 'border-red-400 dark:border-red-500'
                                  : 'border-[#cfe7d1] dark:border-[#1a351c]'
                              }`}
                              placeholder="John"
                              type="text"
                              value={contactData.firstName}
                              onChange={(e) => {
                                setContactData((prev) => ({ ...prev, firstName: e.target.value }));
                                clearFieldError('firstName');
                              }}
                              aria-invalid={Boolean(fieldErrors.firstName)}
                            />
                            {fieldErrors.firstName && (
                              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.firstName}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 md:gap-2">
                            <label className="font-bold text-sm md:text-base">Last Name</label>
                            <input
                              className={`form-input w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary ${
                                fieldErrors.lastName
                                  ? 'border-red-400 dark:border-red-500'
                                  : 'border-[#cfe7d1] dark:border-[#1a351c]'
                              }`}
                              placeholder="Doe"
                              type="text"
                              value={contactData.lastName}
                              onChange={(e) => {
                                setContactData((prev) => ({ ...prev, lastName: e.target.value }));
                                clearFieldError('lastName');
                              }}
                              aria-invalid={Boolean(fieldErrors.lastName)}
                            />
                            {fieldErrors.lastName && (
                              <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.lastName}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="font-bold text-sm md:text-base">Email Address</label>
                          <input
                            className={`form-input w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary ${
                              fieldErrors.email
                                ? 'border-red-400 dark:border-red-500'
                                : 'border-[#cfe7d1] dark:border-[#1a351c]'
                            }`}
                            placeholder="john@example.com"
                            type="email"
                            value={contactData.email}
                            onChange={(e) => {
                              setContactData((prev) => ({ ...prev, email: e.target.value }));
                              clearFieldError('email');
                            }}
                            aria-invalid={Boolean(fieldErrors.email)}
                          />
                          {fieldErrors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 md:gap-2">
                          <label className="font-bold text-sm md:text-base">Phone Number</label>
                          <input
                            className={`form-input w-full rounded-lg bg-[#f8fcf8] dark:bg-[#0d1b0f] h-11 md:h-14 px-3 md:px-4 text-sm md:text-base focus:ring-primary focus:border-primary ${
                              fieldErrors.phone
                                ? 'border-red-400 dark:border-red-500'
                                : 'border-[#cfe7d1] dark:border-[#1a351c]'
                            }`}
                            placeholder="(555) 123-4567"
                            type="tel"
                            value={contactData.phone}
                            onChange={(e) => {
                              setContactData((prev) => ({ ...prev, phone: e.target.value }));
                              clearFieldError('phone');
                            }}
                            aria-invalid={Boolean(fieldErrors.phone)}
                          />
                          {fieldErrors.phone && (
                            <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.phone}</p>
                          )}
                        </div>

                        <TermsAndConditions
                          onAgreedChange={setTcAgreed}
                          onPaymentConfirmedChange={setPaymentConfirmed}
                          showPaymentConfirmation={true}
                        />

                        {submitError && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-800 dark:text-red-200">
                              <strong>Error:</strong> {submitError}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Success */}
                {step === 5 && (
                  <div className="step-content flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                    <div className="size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-5xl">check_circle</span>
                    </div>
                    <h3 className="text-3xl font-black mb-4">Consultation Request Submitted!</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mb-8">
                      Thank you for choosing Greenlife Solar. Your consultation request for the{' '}
                      <strong>{selectedQuote?.quote.title}</strong> package has been received. Our team will review your
                      appliance requirements and contact you within 24 hours to discuss your personalized solar solution.
                      You'll receive confirmation emails at <strong>{contactData.email}</strong>.
                    </p>
                    <button
                      onClick={() => (window.location.href = '/')}
                      className="bg-primary text-forest px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95"
                    >
                      Return to Home
                    </button>
                  </div>
                )}

                {/* Form Navigation */}
                {step < 5 && (
                  <div className="px-6 md:px-8 py-4 md:py-6 bg-[#f8fcf8] dark:bg-[#102212] border-t border-[#e7f3e8] dark:border-[#1a351c] flex items-center justify-between">
                    <button
                      onClick={handleBack}
                      className={`text-[#4c9a52] text-sm md:text-base font-semibold flex items-center gap-1.5 md:gap-2 hover:text-[#0d1b0f] transition-colors ${
                        step === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={step === 1}
                    >
                      <span className="material-symbols-outlined text-base md:text-xl">arrow_back</span> Back
                    </button>

                    {step < 4 ? (
                      <button
                        onClick={handleNext}
                        className={`bg-primary text-forest px-6 md:px-10 py-2.5 md:py-3 text-sm md:text-base rounded-lg font-bold hover:bg-opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5 md:gap-2 active:scale-95 ${
                          step === 3 && !selectedQuote ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={step === 3 && !selectedQuote}
                      >
                        Next Step <span className="material-symbols-outlined text-base md:text-xl">arrow_forward</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !tcAgreed || !paymentConfirmed}
                        className="bg-forest text-white px-6 md:px-10 py-2.5 md:py-3 text-sm md:text-base rounded-lg font-bold hover:bg-opacity-90 shadow-lg transition-all flex items-center gap-1.5 md:gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="animate-spin material-symbols-outlined text-base md:text-xl">
                            progress_activity
                          </span>
                        ) : (
                          <>
                            Submit Request{' '}
                            <span className="material-symbols-outlined text-base md:text-xl">send</span>
                          </>
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
                    {
                      icon: 'home_pin',
                      title: 'Free Site Assessment',
                      desc: "A professional on-site review of your property's solar capacity.",
                    },
                    {
                      icon: 'bar_chart',
                      title: 'Personalized Savings Report',
                      desc: 'Custom ROI projection based on your energy consumption habits.',
                    },
                    {
                      icon: 'support_agent',
                      title: 'Expert Technical Advice',
                      desc: 'Get answers to technical questions from our certified engineers.',
                    },
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
                    <p className="text-xs font-medium text-[#4c9a52] dark:text-[#7ed484]">
                      Your data is protected. We never share your details with third parties.
                    </p>
                  </div>
                </div>
              </div>
              {step === 1 && (
                <div className="rounded-xl overflow-hidden h-48 relative shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU7uVdcCm0kXjHes7ZT0BeqnJUSq4eke4vXvI-DZPMxrV4SDZnXNYV3d_0F5_jnTICdM3WprFui3n7tWbQQSoNPTZs69lw0DNEojKaOBgqXc1xUg7L2J_vfY8CvpfQqlMK5He9M_fD18lNStUsi6N604UmX-4lCxrjXDz2Ars1UuGiSY8gEgtVFIT8gxXUL42FkMWtKB4AzGgfxdYhFJxl4iw0Qjk8WWyUsvF8sWbChVg8td7wSh36njhT5AqpoITrdGFB9shLJAQ"
                    alt="Map"
                  />
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
