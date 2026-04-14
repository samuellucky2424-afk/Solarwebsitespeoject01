export const DEFAULT_ADMIN_EMAIL = 'infogreenlifetechnology@gmail.com';

export interface SendEmailRequestPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
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
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        return {
          success: false,
          error: `Email API returned invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
          status: response.status,
        };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: getErrorMessage(responseData, `Email API request failed with status ${response.status}`),
        status: response.status,
      };
    }

    if (!responseData || responseData.success !== true || typeof responseData.id !== 'string') {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while calling the email API',
    };
  }
}
