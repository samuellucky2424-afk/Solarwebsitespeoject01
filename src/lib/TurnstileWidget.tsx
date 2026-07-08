import React, { useEffect, useRef } from 'react';
import { getConfig } from '../../config/supabaseClient';

const DEFAULT_TURNSTILE_SITE_KEY = '0x4AAAAAADiJrhjagKqG4hua';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileTheme = 'auto' | 'light' | 'dark';
type TurnstileSize = 'normal' | 'flexible' | 'compact';

type TurnstileApi = {
  render: (
    container: HTMLElement | string,
    options: Record<string, unknown>
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function getTurnstileSiteKey() {
  return (
    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
    getConfig()?.turnstileSiteKey ||
    DEFAULT_TURNSTILE_SITE_KEY
  ).trim();
}

function loadTurnstileScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile="true"]');

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Could not load Turnstile.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load Turnstile.'));

      document.head.appendChild(script);
    });
  }

  return turnstileScriptPromise;
}

interface TurnstileWidgetProps {
  action: string;
  className?: string;
  resetSignal?: number;
  size?: TurnstileSize;
  theme?: TurnstileTheme;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errorCode: string) => void;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  action,
  className = '',
  resetSignal = 0,
  size = 'flexible',
  theme = 'auto',
  onVerify,
  onExpire,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);
  const callbacksRef = useRef({ onVerify, onExpire, onError });

  callbacksRef.current = { onVerify, onExpire, onError };

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const siteKey = getTurnstileSiteKey();

    if (!siteKey) {
      callbacksRef.current.onError?.('missing-site-key');
      return;
    }

    const renderWidget = () => {
      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;

          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          }

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            size,
            theme,
            callback: (token: string) => {
              retryCountRef.current = 0;
              callbacksRef.current.onVerify(token);
            },
            'expired-callback': () => callbacksRef.current.onExpire?.(),
            'timeout-callback': () => callbacksRef.current.onExpire?.(),
            'error-callback': (errorCode: string) => {
              if (!cancelled && retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current += 1;
                retryTimer = setTimeout(renderWidget, RETRY_DELAY_MS);
              } else {
                callbacksRef.current.onError?.(String(errorCode));
              }
            },
          });
        })
        .catch((error) => {
          if (!cancelled) {
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current += 1;
              retryTimer = setTimeout(renderWidget, RETRY_DELAY_MS);
            } else {
              callbacksRef.current.onError?.(error?.message || 'turnstile-load-failed');
            }
          }
        });
    };

    renderWidget();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, resetSignal, size, theme]);

  return <div ref={containerRef} className={className} />;
};

export default TurnstileWidget;
