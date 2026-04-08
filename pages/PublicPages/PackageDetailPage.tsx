import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PublicHeader, PublicFooter, Toast } from '../../components/SharedComponents';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';

const PackageDetailPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { packages, packagesLoading, addRequest, activeUser } = useAdmin();
  const { isAuthenticated, user } = useAuth();
  const [toast, setToast] = React.useState<{ msg: string } | null>(null);
  const [isRequesting, setIsRequesting] = React.useState(false);

  const packageDetails = packages.find((pkg) => pkg.id === packageId);

  if (packagesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-4 size-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <h1 className="text-2xl font-bold text-forest dark:text-white">Loading package details</h1>
            <p className="text-forest/70 dark:text-white/70 mt-2">Fetching the latest package data from Supabase.</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!packageDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-forest dark:text-white">Package not found</h1>
            <p className="text-forest/70 dark:text-white/70 mt-2">The package you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const handleRequestPackage = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setIsRequesting(true);

    try {
      const success = await addRequest({
        id: `REQ-${Date.now()}`,
        type: 'Package Request',
        title: `Package request for ${packageDetails.name}`,
        customer: activeUser?.fullName || user?.user_metadata?.full_name || user?.email || 'Greenlife customer',
        email: activeUser?.email || user?.email || '',
        phone: activeUser?.phone || user?.phone || user?.user_metadata?.phone || '',
        address: activeUser?.address || user?.user_metadata?.address || 'Address to be confirmed',
        date: new Date().toLocaleDateString(),
        status: 'New',
        priority: 'Normal',
        description: `Requested package: ${packageDetails.name}${packageDetails.powerCapacity ? ` (${packageDetails.powerCapacity})` : ''}.`,
        packageId: packageDetails.id
      });

      setToast({
        msg: success
          ? `Package request sent for ${packageDetails.name}`
          : `Unable to submit request for ${packageDetails.name}`
      });
    } catch (error) {
      console.error('Failed to submit package request:', error);
      setToast({ msg: `Unable to submit request for ${packageDetails.name}` });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      {toast && <Toast message={toast.msg} onClose={() => setToast(null)} />}

      <main className="flex-1 w-full">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-12">
          <div className="bg-white dark:bg-[#152a17] rounded-lg p-8 shadow-lg">
            <h1 className="text-4xl font-bold text-forest dark:text-white mb-4">{packageDetails.name}</h1>
            <p className="text-forest/70 dark:text-white/70 text-lg mb-6">{packageDetails.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {packageDetails.img && (
                <img
                  src={packageDetails.img}
                  alt={packageDetails.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-3xl font-bold text-primary mb-4">NGN {packageDetails.price.toLocaleString()}</p>

                {packageDetails.powerCapacity && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-forest dark:text-white mb-2">Power Capacity</h3>
                    <p className="text-forest/70 dark:text-white/70">{packageDetails.powerCapacity}</p>
                  </div>
                )}

                {packageDetails.appliances && packageDetails.appliances.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-forest dark:text-white mb-2">Included Appliances</h3>
                    <ul className="space-y-2">
                      {packageDetails.appliances.map((appliance, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-forest/70 dark:text-white/70">
                          <span className="material-symbols-outlined text-primary">check_circle</span>
                          {appliance}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleRequestPackage}
                    disabled={isRequesting}
                    className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold transition-all w-full flex items-center justify-center gap-2 hover:bg-primary hover:text-forest disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">
                      {isRequesting ? 'progress_activity' : 'shopping_bag'}
                    </span>
                    {isRequesting ? 'Submitting...' : 'Request Package'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default PackageDetailPage;
