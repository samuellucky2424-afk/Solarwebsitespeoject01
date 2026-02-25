import React, { useState } from 'react';

interface TermsAndConditionsProps {
    onAgreedChange: (agreed: boolean) => void;
    onPaymentConfirmedChange?: (confirmed: boolean) => void;
    showPaymentConfirmation?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
    onAgreedChange,
    onPaymentConfirmedChange,
    showPaymentConfirmation = false,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    const handleAgreedChange = (checked: boolean) => {
        setAgreed(checked);
        onAgreedChange(checked);
    };

    const handlePaymentChange = (checked: boolean) => {
        setPaymentConfirmed(checked);
        onPaymentConfirmedChange?.(checked);
    };

    return (
        <div className="rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] overflow-hidden bg-white dark:bg-[#152a17]">
            {/* Collapsible Header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-[#f8fcf8] dark:hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                    <span className="text-sm md:text-base font-bold text-forest dark:text-white">Terms & Conditions</span>
                </div>
                <span className={`material-symbols-outlined text-[#4c9a52] text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Collapsible Content */}
            {expanded && (
                <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-[#e7f3e8] dark:border-[#2a3d2c] animate-in fade-in duration-200">
                    <div className="mt-4 space-y-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {/* Call Up Fee */}
                        <div>
                            <h4 className="font-bold text-forest dark:text-white mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary text-base">engineering</span>
                                Call Up – Charge Fee
                            </h4>
                            <ul className="space-y-1.5 pl-5 list-disc marker:text-primary">
                                <li>When requesting the Engineering Team to visit site after installation is completed and working perfectly.</li>
                                <li>Requesting the Engineering team for inspection, either for an existing or new installation.</li>
                                <li>Requesting the Engineering team for repair.</li>
                            </ul>
                            <div className="mt-2 space-y-1 pl-5">
                                <p className="font-semibold text-forest dark:text-white">• Repair costs are not included in call-up fee.</p>
                                <p className="font-semibold text-forest dark:text-white">• Fee paid to company account, not engineering team.</p>
                                <p className="font-semibold text-primary">• Minimum fee: ₦2,000.00 depending on location and nature of request.</p>
                            </div>
                        </div>

                        {/* Installations */}
                        <div>
                            <h4 className="font-bold text-forest dark:text-white mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary text-base">solar_power</span>
                                Installations
                            </h4>
                            <ul className="space-y-1.5 pl-5 list-disc marker:text-primary">
                                <li><strong>Within Delta State:</strong> 24–96 hours after payment confirmation.</li>
                                <li><strong>Outside Delta State:</strong> Agreed date, minimum 48 hours after payment confirmation.</li>
                                <li>100% payment required; receipt issued upon confirmation.</li>
                            </ul>
                        </div>

                        {/* Payment */}
                        <div>
                            <h4 className="font-bold text-forest dark:text-white mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-primary text-base">payments</span>
                                Payment Policy
                            </h4>
                            <p className="pl-5 font-semibold text-red-600 dark:text-red-400">No refunds after payment is confirmed.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkboxes — always visible */}
            <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                {!expanded && <div className="border-t border-[#e7f3e8] dark:border-[#2a3d2c] mb-3" />}
                <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => handleAgreedChange(e.target.checked)}
                        className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                    />
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 group-hover:text-forest dark:group-hover:text-white transition-colors">
                        I have read and agree to the <button type="button" onClick={() => setExpanded(true)} className="text-primary font-bold underline underline-offset-2 hover:text-primary/80">Terms & Conditions</button> of Greenlife Solar Solutions LTD.
                    </span>
                </label>

                {showPaymentConfirmation && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={paymentConfirmed}
                            onChange={(e) => handlePaymentChange(e.target.checked)}
                            className="mt-0.5 size-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
                        />
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 group-hover:text-forest dark:group-hover:text-white transition-colors">
                            I confirm that I understand the payment terms, including that <strong className="text-red-600 dark:text-red-400">no refunds</strong> will be issued after payment is confirmed.
                        </span>
                    </label>
                )}
            </div>
        </div>
    );
};

export default TermsAndConditions;
