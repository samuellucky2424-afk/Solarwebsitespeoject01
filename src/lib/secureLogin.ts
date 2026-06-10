import { getSupabase, loadConfig } from '../../config/supabaseClient';

export interface SecureLoginResponse {
  session?: {
    access_token?: string;
    refresh_token?: string;
    [key: string]: any;
  };
  failed_login_attempts?: number;
  attempts_remaining?: number;
  suspended?: boolean;
}

export type SecureLoginError = Error & {
  details?: {
    failed_login_attempts?: number;
    attempts_remaining?: number;
    suspended?: boolean;
    error?: string;
  };
};

async function getFunctionErrorDetails(error: any) {
  const fallback = { error: error?.message || 'Login failed' };
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

export async function securePasswordLogin(
  email: string,
  password: string,
  captchaToken: string
): Promise<SecureLoginResponse> {
  await loadConfig();

  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke('password-login', {
    method: 'POST',
    body: { email, password, captcha_token: captchaToken },
  });

  if (error) {
    const details = await getFunctionErrorDetails(error);
    const loginError = new Error(details.error || error.message || 'Login failed') as SecureLoginError;
    loginError.details = details;
    throw loginError;
  }

  return data as SecureLoginResponse;
}

export async function applySecureLoginSession(loginData: SecureLoginResponse) {
  const accessToken = loginData.session?.access_token;
  const refreshToken = loginData.session?.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not include a valid session.');
  }

  const { data, error } = await getSupabase().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;
  return data;
}
