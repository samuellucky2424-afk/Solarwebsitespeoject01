import { getSupabase, loadConfig } from '../../config/supabaseClient';

export type DealerVerificationRole = 'installer' | 'retailer';

type DealerVerificationFiles = {
  cacDocument: File | null;
  idDocument: File | null;
  storePhoto: File | null;
  storeVideo: File | null;
  workPhoto: File | null;
  workVideo: File | null;
};

type DealerVerificationPayload = {
  userId: string;
  roleRequested: DealerVerificationRole;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  businessName: string;
  businessAddress: string;
  metadata?: Record<string, unknown>;
  files: DealerVerificationFiles;
};

async function getFunctionErrorDetails(error: any) {
  const fallback = { error: error?.message || 'Could not submit dealer verification.' };
  const context = error?.context;

  if (!context) return fallback;

  try {
    const response = typeof context.clone === 'function' ? context.clone() : context;
    const data = await response.json();
    return {
      ...data,
      error: data?.error || data?.message || fallback.error,
    };
  } catch {
    return fallback;
  }
}

function appendFile(formData: FormData, field: keyof DealerVerificationFiles, file: File | null) {
  if (file) {
    formData.append(field, file, file.name);
  }
}

export async function submitDealerVerificationSignup(payload: DealerVerificationPayload) {
  await loadConfig();

  const formData = new FormData();
  formData.append('userId', payload.userId);
  formData.append('roleRequested', payload.roleRequested);
  formData.append('fullName', payload.fullName);
  formData.append('email', payload.email);
  formData.append('phone', payload.phone);
  formData.append('address', payload.address);
  formData.append('businessName', payload.businessName);
  formData.append('businessAddress', payload.businessAddress);
  formData.append('metadata', JSON.stringify(payload.metadata || {}));

  appendFile(formData, 'cacDocument', payload.files.cacDocument);
  appendFile(formData, 'idDocument', payload.files.idDocument);
  appendFile(formData, 'storePhoto', payload.files.storePhoto);
  appendFile(formData, 'storeVideo', payload.files.storeVideo);
  appendFile(formData, 'workPhoto', payload.files.workPhoto);
  appendFile(formData, 'workVideo', payload.files.workVideo);

  const { data, error } = await getSupabase().functions.invoke('submit-dealer-verification', {
    method: 'POST',
    body: formData,
  });

  if (error) {
    const details = await getFunctionErrorDetails(error);
    throw new Error(details.error || 'Could not submit dealer verification.');
  }

  return data;
}
