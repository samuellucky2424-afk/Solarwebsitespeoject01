import React from 'react';
import { getSupportEmail as getConfiguredSupportEmail, loadConfig } from '../../config/supabaseClient';

export function getSupportEmail(): string {
  return getConfiguredSupportEmail();
}

export function useSupportEmail(): string {
  const [supportEmail, setSupportEmail] = React.useState(() => getSupportEmail());

  React.useEffect(() => {
    if (supportEmail) {
      return;
    }

    let isCancelled = false;

    loadConfig()
      .then(() => {
        if (!isCancelled) {
          setSupportEmail(getSupportEmail());
        }
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [supportEmail]);

  return supportEmail;
}
