# Greenlife Solar Solutions

React + Vite storefront for Greenlife Solar Solutions with Supabase for data/auth and Flutterwave for payments.

## Run locally

Prerequisites:
- Node.js
- A Supabase project
- Flutterwave public and secret keys

1. Install dependencies:
   `npm install`
2. Fill the frontend env in [.env](.env)
3. Add the server-side secrets from [supabase/.env.example](supabase/.env.example) to your Supabase Edge Functions environment
4. Start the app:
   `npm run dev`

## Frontend env

The Vite app reads these values from [.env](.env):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_FUNCTION_URL`
- `VITE_FLUTTERWAVE_PUBLIC_KEY`

## Vercel env

If you deploy this project on Vercel, add the variables from [.env.vercel.example](.env.vercel.example) in Vercel Project Settings. These are runtime server variables, so they do not use the `VITE_` prefix.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_FUNCTION_URL`
- `FLUTTERWAVE_PUBLIC_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_EMAIL`
- `SUPPORT_EMAIL`
- `APP_URL`

## Supabase function secrets

These are required by the Edge Functions used for orders, admin access, and Flutterwave payment verification:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_WEBHOOK_SECRET_HASH`

Optional:

- `FLUTTERWAVE_ENCRYPTION_KEY`

Live-mode note:

- Keep the Flutterwave public key and secret key in the same Flutterwave mode/account. A live public key with a test secret key will make verification fail.
- If you enable the webhook, copy the live webhook secret hash from Flutterwave into `FLUTTERWAVE_WEBHOOK_SECRET_HASH`.
- The current Standard Checkout flow in this repo does not use the encryption key directly, but you can still store it in Supabase for future server-side Flutterwave API work.

## Payment flow

- The frontend opens the Flutterwave checkout modal with `VITE_FLUTTERWAVE_PUBLIC_KEY` in local Vite development, or `FLUTTERWAVE_PUBLIC_KEY` via `/api/config` in Vercel
- `create-order` creates a pending order in Supabase
- `verify-flutterwave` confirms the transaction with Flutterwave using `FLUTTERWAVE_SECRET_KEY`
- `flutterwave-webhook` can also confirm payments asynchronously with `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
- Flutterwave backend secrets belong in Supabase Edge Functions, not in Vercel
