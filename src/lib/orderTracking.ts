export const ORDER_FULFILLMENT_STEPS = [
  'pending',
  'confirmed',
  'in_transit',
  'delivered',
] as const;

export type FulfillmentStatus = (typeof ORDER_FULFILLMENT_STEPS)[number];

const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

const FULFILLMENT_DESCRIPTIONS: Record<FulfillmentStatus, string> = {
  pending: 'Awaiting team review',
  confirmed: 'Order approved for processing',
  in_transit: 'Package is on the way',
  delivered: 'Order reached the customer',
};

const FULFILLMENT_BADGE_CLASSES: Record<FulfillmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40',
  in_transit: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/40',
  delivered: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/40',
};

const FULFILLMENT_CARD_CLASSES: Record<FulfillmentStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-100',
  confirmed: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-700/40 dark:bg-blue-900/20 dark:text-blue-100',
  in_transit: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-700/40 dark:bg-purple-900/20 dark:text-purple-100',
  delivered: 'border-green-200 bg-green-50 text-green-900 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-100',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Pending Payment',
  paid: 'Paid',
  successful: 'Paid',
  failed: 'Failed',
};

const PAYMENT_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40',
  successful: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40',
  failed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/40',
};

export function normalizeFulfillmentStatus(status?: string | null): FulfillmentStatus {
  if (status === 'confirmed' || status === 'in_transit' || status === 'delivered') {
    return status;
  }

  return 'pending';
}

export function formatFulfillmentStatus(status?: string | null): string {
  return FULFILLMENT_LABELS[normalizeFulfillmentStatus(status)];
}

export function getFulfillmentDescription(status: FulfillmentStatus): string {
  return FULFILLMENT_DESCRIPTIONS[status];
}

export function getFulfillmentBadgeClasses(status?: string | null): string {
  return FULFILLMENT_BADGE_CLASSES[normalizeFulfillmentStatus(status)];
}

export function getFulfillmentCardClasses(status?: string | null): string {
  return FULFILLMENT_CARD_CLASSES[normalizeFulfillmentStatus(status)];
}

export function getFulfillmentProgressIndex(status?: string | null): number {
  return ORDER_FULFILLMENT_STEPS.indexOf(normalizeFulfillmentStatus(status));
}

export function formatPaymentStatus(status?: string | null): string {
  const normalized = String(status || 'pending').toLowerCase();
  return PAYMENT_LABELS[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getPaymentStatusBadgeClasses(status?: string | null): string {
  const normalized = String(status || 'pending').toLowerCase();
  return PAYMENT_BADGE_CLASSES[normalized] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10';
}
