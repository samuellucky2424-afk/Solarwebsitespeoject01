import React, { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../../config/supabaseClient';
import { Toast } from '../SharedComponents';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface VerificationRequest {
    id: string;
    user_id: string;
    role_requested: 'installer' | 'retailer';
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
}

const fileLabels: Array<[keyof VerificationRequest, string]> = [
    ['cac_document_url', 'CAC'],
    ['id_document_url', 'ID'],
    ['store_photo_url', 'Store Photo'],
    ['store_video_url', 'Store Video'],
    ['work_photo_url', 'Work Photo'],
    ['work_video_url', 'Work Video'],
];

const DealerVerificationManagement: React.FC = () => {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [profilesById, setProfilesById] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('pending');
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await getSupabase()
                .from('role_verification_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const rows = (data || []) as VerificationRequest[];
            setRequests(rows);
            setNotes(Object.fromEntries(rows.map(row => [row.id, row.admin_note || ''])));

            const userIds = Array.from(new Set(rows.map(row => row.user_id)));
            if (userIds.length > 0) {
                const { data: profiles, error: profilesError } = await getSupabase()
                    .from('profiles')
                    .select('id, full_name, email, phone, role, metadata')
                    .in('id', userIds);

                if (profilesError) throw profilesError;
                setProfilesById(Object.fromEntries((profiles || []).map((profile: any) => [profile.id, profile])));
            } else {
                setProfilesById({});
            }
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
                    const profile = profilesById[request.user_id] || {};
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
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DealerVerificationManagement;
