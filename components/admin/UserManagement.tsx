import React, { useEffect, useMemo, useState } from 'react';
import { adminListUsers, adminUserDetails } from '../../src/lib/supabaseFunctions';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);

    // Modal State
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [details, setDetails] = useState<any | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoadingUsers(true);
            setUsersError(null);
            try {
                const res = await adminListUsers();
                setUsers(res);
            } catch (err: any) {
                console.error('Failed to load users:', err);
                setUsersError(err?.message || 'Failed to load users');
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        const loadDetails = async () => {
            if (!selectedUser?.id) {
                setDetails(null);
                return;
            }

            setLoadingDetails(true);
            setDetailsError(null);
            try {
                const data = await adminUserDetails(selectedUser.id);
                setDetails(data);
            } catch (err: any) {
                console.error('Failed to load user details:', err);
                setDetailsError(err?.message || 'Failed to load user details');
                setDetails(null);
            } finally {
                setLoadingDetails(false);
            }
        };

        loadDetails();
    }, [selectedUser?.id]);

    const filteredUsers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return users;
        return users.filter((u: any) =>
            String(u.full_name || '').toLowerCase().includes(q) ||
            String(u.email || '').toLowerCase().includes(q)
        );
    }, [searchQuery, users]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">User Management</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white dark:bg-[#152a17] rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#cfe7d1] dark:border-[#2a3d2c]">
                    <h3 className="font-bold">Active Customer Database ({filteredUsers.length})</h3>
                </div>
                <div className="p-4">
                    <div className="grid gap-4 max-h-[600px] overflow-y-auto">
                        {usersError && (
                            <div className="text-center py-6 text-red-500 text-sm font-bold">{usersError}</div>
                        )}
                        {loadingUsers ? (
                            <div className="text-center py-8 text-gray-500">Loading users...</div>
                        ) : filteredUsers.length > 0 ? filteredUsers.map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-background-light dark:bg-white/5 rounded-lg border border-[#e7f3eb] dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-cover" style={{ backgroundImage: `url('${user.avatar_url || ''}')` }}></div>
                                    <div>
                                        <p className="font-bold">{user.full_name || 'User'}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(user)} className="px-4 py-2 bg-primary text-forest text-sm font-bold rounded-lg hover:brightness-105 transition-colors">
                                    Manage
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500">No users found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* User Management Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
                    <div className="relative bg-white dark:bg-[#152a17] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Manage: {selectedUser.full_name || selectedUser.email}</h2>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 space-y-8">
                            {detailsError && (
                                <div className="text-red-500 text-sm font-bold">{detailsError}</div>
                            )}

                            {loadingDetails ? (
                                <div className="text-center py-8 text-gray-500">Loading user details...</div>
                            ) : (
                                <>
                                    <section className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Profile</h3>
                                        <div className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-background-light dark:bg-black/20">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div><span className="font-bold">Name:</span> {details?.profile?.full_name || ''}</div>
                                                <div><span className="font-bold">Email:</span> {details?.profile?.email || ''}</div>
                                                <div><span className="font-bold">Phone:</span> {details?.profile?.phone || ''}</div>
                                                <div><span className="font-bold">Address:</span> {details?.profile?.address || ''}</div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Systems</h3>
                                        <div className="grid gap-3">
                                            {(details?.systems || []).length === 0 ? (
                                                <div className="text-xs text-gray-500">No systems</div>
                                            ) : (details?.systems || []).map((s: any) => (
                                                <div key={s.id} className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-bold">{s.name || 'Solar System'}</div>
                                                            <div className="text-xs text-gray-500">Capacity: {s.capacity || 'N/A'}</div>
                                                            <div className="text-xs text-gray-500">Installed: {s.installation_date || ''}</div>
                                                        </div>
                                                        <div className="text-xs font-bold uppercase text-gray-500">{s.status || ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Requests</h3>
                                        <div className="grid gap-3">
                                            {(details?.requests || []).length === 0 ? (
                                                <div className="text-xs text-gray-500">No requests</div>
                                            ) : (details?.requests || []).map((r: any) => (
                                                <div key={r.id} className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="min-w-0">
                                                            <div className="font-bold truncate">{r.title || 'Request'}</div>
                                                            <div className="text-xs text-gray-500">Type: {r.metadata?.type || ''}</div>
                                                            <div className="text-xs text-gray-500">Created: {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
                                                        </div>
                                                        <div className="text-xs font-bold uppercase text-gray-500">{r.status || ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Service Bookings</h3>
                                        <div className="grid gap-3">
                                            {(details?.service_bookings || []).length === 0 ? (
                                                <div className="text-xs text-gray-500">No service bookings</div>
                                            ) : (details?.service_bookings || []).map((b: any) => (
                                                <div key={b.id} className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="min-w-0">
                                                            <div className="font-bold truncate">{b.service_type || 'Service'}</div>
                                                            <div className="text-xs text-gray-500">Booking date: {b.booking_date || ''}</div>
                                                            <div className="text-xs text-gray-500">Created: {b.created_at ? new Date(b.created_at).toLocaleString() : ''}</div>
                                                        </div>
                                                        <div className="text-xs font-bold uppercase text-gray-500">{b.status || ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="space-y-2">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Orders</h3>
                                        <div className="grid gap-4">
                                            {(details?.orders || []).length === 0 ? (
                                                <div className="text-xs text-gray-500 py-2">No orders found.</div>
                                            ) : (details?.orders || []).map((o: any) => {
                                                const snapshot = o.item_snapshot || {};
                                                const lineItems: any[] = snapshot.items || [];
                                                const isPackage = o.kind === 'package';
                                                const statusColor =
                                                    (o.status || '').toLowerCase() === 'paid' || (o.status || '').toLowerCase() === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : (o.status || '').toLowerCase() === 'pending'
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300';

                                                return (
                                                    <div key={o.id} className="rounded-xl border border-[#cfe7d1] dark:border-[#2a3d2c] bg-white dark:bg-black/20 overflow-hidden shadow-sm">
                                                        {/* Order header */}
                                                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#f0faf1] dark:bg-[#1a331c] border-b border-[#cfe7d1] dark:border-[#2a3d2c]">
                                                            <div>
                                                                <p className="text-xs font-mono text-gray-400">#{String(o.id).slice(0, 16).toUpperCase()}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{o.created_at ? new Date(o.created_at).toLocaleString() : ''}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isPackage && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase">Package</span>
                                                                )}
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                                                                    {o.status || 'unknown'}
                                                                </span>
                                                                <span className="text-sm font-black text-primary">
                                                                    ₦{Number(o.amount || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Product items */}
                                                        <div className="divide-y divide-gray-50 dark:divide-white/5">
                                                            {lineItems.length > 0 ? (
                                                                lineItems.map((item: any, idx: number) => {
                                                                    const qty = Number(item.quantity || 1);
                                                                    const unitPrice = Number(item.price || item.price_per_unit || 0);
                                                                    const subtotal = qty * unitPrice;
                                                                    return (
                                                                        <div key={idx} className="flex items-center gap-3 px-4 py-3">
                                                                            {/* Product image */}
                                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                                                                                {(item.img || item.image_url) ? (
                                                                                    <img
                                                                                        src={item.img || item.image_url}
                                                                                        alt={item.name || 'Product'}
                                                                                        className="w-full h-full object-cover"
                                                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                                        <span className="material-symbols-outlined text-gray-400 text-xl">inventory_2</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* Product info */}
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-semibold text-sm truncate">{item.name || 'Product'}</p>
                                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                                    Qty: <span className="font-bold text-gray-700 dark:text-gray-300">{qty}</span>
                                                                                    {' × '}
                                                                                    <span className="font-bold text-gray-700 dark:text-gray-300">₦{unitPrice.toLocaleString()}</span>
                                                                                </p>
                                                                            </div>

                                                                            {/* Subtotal */}
                                                                            <div className="text-right shrink-0">
                                                                                <p className="text-sm font-bold text-primary">₦{subtotal.toLocaleString()}</p>
                                                                                <p className="text-[10px] text-gray-400">subtotal</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : isPackage ? (
                                                                /* Package order without line items */
                                                                <div className="flex items-center gap-3 px-4 py-3">
                                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                                        <span className="material-symbols-outlined text-primary text-xl">solar_power</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-sm">{snapshot.name || snapshot.packageName || 'Solar Package'}</p>
                                                                        <p className="text-xs text-gray-500 mt-0.5">Package order</p>
                                                                        {snapshot.appliances && (
                                                                            <p className="text-[10px] text-gray-400 mt-1 truncate">
                                                                                Includes: {Array.isArray(snapshot.appliances) ? snapshot.appliances.join(', ') : snapshot.appliances}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <p className="text-sm font-bold text-primary">₦{Number(o.amount || 0).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* Legacy order with no snapshot */
                                                                <div className="px-4 py-3 text-xs text-gray-400 italic">
                                                                    Product details not available for this order.
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Order footer — customer info if available */}
                                                        {snapshot.customer?.name && (
                                                            <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                                                                <p className="text-[10px] text-gray-400">
                                                                    Customer: <span className="font-semibold text-gray-600 dark:text-gray-300">{snapshot.customer.name}</span>
                                                                    {snapshot.customer.phone && <span> · {snapshot.customer.phone}</span>}
                                                                    {snapshot.customer.city && <span> · {snapshot.customer.city}, {snapshot.customer.state}</span>}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
