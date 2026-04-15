import { getSupabase } from '../../config/supabaseClient';

export interface SendEmailRequestPayload {
  to?: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  useAdminEmail?: boolean;
  tags?: Record<string, string | number | boolean | null | undefined>;
}

export interface SendEmailRequestResult {
  success: boolean;
  id?: string;
  error?: string;
  status?: number;
}

const getErrorMessage = (responseData: any, fallbackMessage: string) => {
  if (typeof responseData?.error === 'string' && responseData.error.trim()) {
    return responseData.error;
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  if (typeof responseData?.details?.message === 'string' && responseData.details.message.trim()) {
    return responseData.details.message;
  }

  return fallbackMessage;
};

export async function sendEmailRequest(
  payload: SendEmailRequestPayload
): Promise<SendEmailRequestResult> {
  try {
    const { data: sessionData } = await getSupabase().auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      return {
        success: false,
        error: 'You must be signed in to send email notifications.',
      };
    }

    // Use local API server in development, production endpoint in production
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001/api/send-email'  // Local development
      : '/api/send-email';  // Production (Vercel)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const contentType = response.headers.get('content-type') || '';

    let responseData: any = null;
    if (responseText && contentType.toLowerCase().includes('application/json')) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', responseText);
        return {
          success: false,
          error: `Email API returned invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
          status: response.status,
        };
      }
    }

    if (!response.ok) {
      const errorMsg = getErrorMessage(responseData, `Email API request failed with status ${response.status}`);
      console.error('❌ Email API Error:', errorMsg, responseData);
      return {
        success: false,
        error: errorMsg,
        status: response.status,
      };
    }

    if (!responseData || responseData.success !== true || typeof responseData.id !== 'string') {
      console.error('❌ Unexpected response from email API:', responseData);
      return {
        success: false,
        error: 'Email API returned an unexpected response. Confirm that /api/send-email is reachable in this environment.',
        status: response.status,
      };
    }

    return {
      success: true,
      id: responseData.id,
      status: response.status,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred while calling the email API';
    console.error('❌ Email request failed:', errorMsg, error);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
