import React, { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../../config/supabaseClient';
import { adminListDealerVerifications } from '../../src/lib/supabaseFunctions';
import { Toast } from '../SharedComponents';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface VerificationRequest {
    id: string;
    user_id: string;
    role_requested: 'installer' | 'retailer';
    applicant_full_name?: string | null;
    applicant_email?: string | null;
    applicant_phone?: string | null;
    applicant_address?: string | null;
    applicant_metadata?: Record<string, any> | null;
    business_name: string;
    business_address: string;
    cac_document_url: string;
    id_document_url: string;
    store_photo_url?: string | null;
    store_video_url?: string | null;
    work_photo_url?: string | null;
    work_video_url?: string | null;
    status: VerificationStatus;
    admin_note?: string | null;
    reviewed_at?: string | null;
    created_at: string;
    profile?: VerificationProfile | null;
}

interface VerificationProfile {
    id: string;
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    role?: string | null;
    created_at?: string | null;
    metadata?: Record<string, any> | null;
    suspended?: boolean | null;
    failed_login_attempts?: number | null;
    suspended_at?: string | null;
    suspension_reason?: string | null;
}

const fileLabels: Array<[keyof VerificationRequest, string]> = [
    ['cac_document_url', 'CAC'],
    ['id_document_url', 'ID'],
    ['store_photo_url', 'Store Photo'],
    ['store_video_url', 'Store Video'],
    ['work_photo_url', 'Work Photo'],
    ['work_video_url', 'Work Video'],
];

const displayValue = (value?: string | null) => value?.trim() || 'Not provided';

const formatDateTime = (value?: string | null) => {
    if (!value) return 'Not provided';
    return new Date(value).toLocaleString();
};

const DetailItem: React.FC<{ label: string; value?: string | null; wide?: boolean }> = ({ label, value, wide }) => (
    <div className={`min-w-0 border-l-2 border-primary/40 pl-3 ${wide ? 'md:col-span-2' : ''}`}>
        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-forest dark:text-white">{displayValue(value)}</dd>
    </div>
);

const isSensitiveMetadataKey = (key: string) => {
    const normalized = key.toLowerCase();
    return normalized.includes('password') ||
        normalized.includes('token') ||
        normalized.includes('secret') ||
        normalized.includes('captcha');
};

const stringifyDetail = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(stringifyDetail).join(', ');
    return JSON.stringify(value, null, 2);
};

const MetadataDetails: React.FC<{ metadata?: Record<string, any> | null }> = ({ metadata }) => {
    const entries = Object.entries(metadata || {}).filter(([key]) => !isSensitiveMetadataKey(key));
    if (entries.length === 0) return null;

    return (
        <section className="mt-4 rounded-lg border border-[#dbe8df] bg-[#f8faf7] p-4 dark:border-white/10 dark:bg-black/15">
            <h4 className="text-sm font-black text-forest dark:text-white">Additional Submitted Details</h4>
            <dl className="mt-3 grid gap-3 md:grid-cols-2">
                {entries.map(([key, value]) => (
                    <div key={key} className="min-w-0 rounded-lg bg-white p-3 dark:bg-white/5">
                        <dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">{key.replace(/_/g, ' ')}</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-xs font-semibold text-forest dark:text-white">
                            {stringifyDetail(value)}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};

const DealerVerificationManagement: React.FC = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [profilesById, setProfilesById] = useState<Record<string, VerificationProfile>>({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const rows = (await adminListDealerVerifications()) as VerificationRequest[];
            setRequests(rows);
            setNotes(Object.fromEntries(rows.map(row => [row.id, row.admin_note || ''])));

            setProfilesById(Object.fromEntries(rows
                .filter(row => row.profile?.id)
                .map(row => [row.profile!.id, row.profile as VerificationProfile])
            ));
        } catch (err: any) {
            console.error('Failed to load verification requests:', err);
            setToast(err?.message || 'Failed to load verification requests.');
            setRequests([]);
            setProfilesById({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        if (statusFilter === 'all') return requests;
        return requests.filter(request => request.status === statusFilter);
    }, [requests, statusFilter]);

    const openVerificationFile = async (pathOrUrl: string) => {
        if (!pathOrUrl) return;

        if (/^https?:\/\//i.test(pathOrUrl)) {
            window.open(pathOrUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        const { data, error } = await getSupabase()
            .storage
            .from('greenlife-verifications')
            .createSignedUrl(pathOrUrl, 5 * 60);

        if (error || !data?.signedUrl) {
            console.error('Could not create signed verification URL:', error);
            setToast(error?.message || 'Could not open verification file.');
            return;
        }

        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    };

    const reviewRequest = async (request: VerificationRequest, nextStatus: 'approved' | 'rejected') => {
        setBusyId(request.id);
        try {
            const note = notes[request.id]?.trim() || null;
            const supabase = getSupabase();
            const { data: sessionData } = await supabase.auth.getSession();
            const reviewerId = sessionData.session?.user.id || null;

            const { error: requestError } = await supabase
                .from('role_verification_requests')
                .update({
                    status: nextStatus,
                    admin_note: note,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: reviewerId,
                })
                .eq('id', request.id);

            if (requestError) throw requestError;

            const profile = profilesById[request.user_id] || {};
            const nextMetadata = {
                ...(profile.metadata || {}),
                role_requested: request.role_requested,
                verification_status: nextStatus,
                dealer_verification_request_id: request.id,
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    role: nextStatus === 'approved' ? request.role_requested : (profile.role || 'user'),
                    metadata: nextMetadata,
                })
                .eq('id', request.user_id);

            if (profileError) throw profileError;

            setToast(nextStatus === 'approved' ? 'Dealer role approved.' : 'Verification rejected.');
            await loadRequests();
        } catch (err: any) {
            console.error('Verification review failed:', err);
            setToast(err?.message || 'Could not update verification request.');
        } finally {
            setBusyId(null);
        }
    };

    const updateDealerSuspension = async (request: VerificationRequest, suspend: boolean) => {
        const profile = profilesById[request.user_id];
        if (!profile) {
            setToast('Could not find this dealer profile.');
            return;
        }

        const actionLabel = suspend ? 'suspend' : 'unsuspend';
        if (!window.confirm(`${suspend ? 'Suspend' : 'Unsuspend'} ${profile.full_name || request.business_name}?`)) return;

        setBusyId(request.id);
        try {
            const { error } = await getSupabase()
                .from('profiles')
                .update({
                    suspended: suspend,
                    suspended_at: suspend ? new Date().toISOString() : null,
                    suspension_reason: suspend ? 'Suspended by admin from dealer verification dashboard' : null,
                    failed_login_attempts: suspend ? profile.failed_login_attempts || 0 : 0,
                })
                .eq('id', request.user_id);

            if (error) throw error;

            setProfilesById(prev => ({
                ...prev,
                [request.user_id]: {
                    ...profile,
                    suspended: suspend,
                    suspended_at: suspend ? new Date().toISOString() : null,
                    suspension_reason: suspend ? 'Suspended by admin from dealer verification dashboard' : null,
                    failed_login_attempts: suspend ? profile.failed_login_attempts || 0 : 0,
                },
            }));
            setToast(`Dealer ${actionLabel}ed successfully.`);
        } catch (err: any) {
            console.error('Dealer suspension update failed:', err);
            setToast(err?.message || `Could not ${actionLabel} dealer.`);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Dealer Verification</h2>
                    <p className="text-[#4c9a52]">Review installer and retailer account requests</p>
                </div>
                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as any)}
                    className="px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 outline-none"
                >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                </select>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-white/5 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c]">Loading verification requests...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-white/5 rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c]">No verification requests found.</div>
                ) : filteredRequests.map(request => {
                    const profile: VerificationProfile = profilesById[request.user_id] || { id: request.user_id };
                    const submittedDetails = {
                        ...(request.applicant_metadata || {}),
                        full_name: request.applicant_full_name || request.applicant_metadata?.full_name,
                        email: request.applicant_email || request.applicant_metadata?.email,
                        phone: request.applicant_phone || request.applicant_metadata?.phone,
                        address: request.applicant_address || request.applicant_metadata?.address,
                    };
                    const solarDetails = profile.metadata?.solar_details;
                    const solarSummary = solarDetails
                        ? [
                            profile.metadata?.systemName,
                            solarDetails.size,
                            solarDetails.inverter,
                            solarDetails.battery,
                        ].filter(Boolean).join(' | ')
                        : profile.metadata?.systemName;

                    return (
                        <div key={request.id} className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] p-5 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-black">{request.business_name}</h3>
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">{request.role_requested}</span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' : request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {request.status}
                                        </span>
                                        {profile.suspended && (
                                            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">Suspended</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{request.business_address}</p>
                                    <div className="text-xs text-gray-500">
                                        <span className="font-bold text-forest dark:text-white">{profile.full_name || 'User'}</span>
                                        {profile.email && <span> | {profile.email}</span>}
                                        {profile.phone && <span> | {profile.phone}</span>}
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Submitted {new Date(request.created_at).toLocaleString()}</p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {fileLabels.map(([key, label]) => {
                                        const url = request[key] as string | null | undefined;
                                        if (!url) return null;
                                        return (
                                            <button key={key} type="button" onClick={() => openVerificationFile(url)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background-light dark:bg-black/20 text-xs font-bold hover:text-primary">
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <section className="mt-5 rounded-lg border border-[#dbe8df] bg-white p-4 dark:border-white/10 dark:bg-black/10">
                                <h4 className="text-sm font-black text-forest dark:text-white">Applicant Identity And Business Details</h4>
                                <dl className="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                                    <DetailItem label="Full Name" value={submittedDetails.full_name || profile.full_name || profile.metadata?.full_name} />
                                    <DetailItem label="Email Address" value={submittedDetails.email || profile.email || profile.metadata?.email} />
                                    <DetailItem label="Phone Number" value={submittedDetails.phone || profile.phone || profile.metadata?.phone} />
                                    <DetailItem label="Full Address" value={submittedDetails.address || profile.address || profile.metadata?.address} wide />
                                    <DetailItem label="Business Name" value={request.business_name} />
                                    <DetailItem label="Business Address" value={request.business_address} wide />
                                    <DetailItem label="Requested Role" value={request.role_requested} />
                                    <DetailItem label="Current Account Role" value={profile.role || 'user'} />
                                    <DetailItem label="Verification Status" value={request.status} />
                                    <DetailItem label="Account Status" value={profile.suspended ? 'Suspended' : 'Active'} />
                                    {profile.suspended && <DetailItem label="Suspension Reason" value={profile.suspension_reason} wide />}
                                    {profile.suspended_at && <DetailItem label="Suspended At" value={formatDateTime(profile.suspended_at)} />}
                                    <DetailItem label="User ID" value={request.user_id} wide />
                                    <DetailItem label="Account Created" value={formatDateTime(profile.created_at)} />
                                    <DetailItem label="Submitted" value={formatDateTime(request.created_at)} />
                                    {solarSummary && <DetailItem label="Solar Details" value={solarSummary} wide />}
                                </dl>
                            </section>

                            <MetadataDetails metadata={{ ...(profile.metadata || {}), ...(request.applicant_metadata || {}) }} />

                            <div className="mt-4 grid gap-3">
                                <textarea
                                    rows={2}
                                    value={notes[request.id] || ''}
                                    onChange={(event) => setNotes(prev => ({ ...prev, [request.id]: event.target.value }))}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Admin note"
                                />
                                {request.status === 'pending' && (
                                    <div className="flex flex-wrap justify-end gap-3">
                                        <button
                                            type="button"
                                            disabled={busyId === request.id}
                                            onClick={() => reviewRequest(request, 'rejected')}
                                            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 disabled:opacity-60"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busyId === request.id}
                                            onClick={() => reviewRequest(request, 'approved')}
                                            className="px-4 py-2 rounded-lg bg-primary text-forest font-bold text-sm hover:brightness-105 disabled:opacity-60"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                                {request.status === 'approved' && (
                                    <div className="flex flex-wrap justify-end gap-3">
                                        {profile.suspended ? (
                                            <button
                                                type="button"
                                                disabled={busyId === request.id}
                                                onClick={() => updateDealerSuspension(request, false)}
                                                className="px-4 py-2 rounded-lg bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100 disabled:opacity-60"
                                            >
                                                Unsuspend Dealer
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={busyId === request.id}
                                                onClick={() => updateDealerSuspension(request, true)}
                                                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 disabled:opacity-60"
                                            >
                                                Suspend Dealer
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DealerVerificationManagement;
