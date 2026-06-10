import { Product } from '../data/products';

export type DealerRole = 'installer' | 'retailer';

export const isDealerRole = (role: string | null | undefined): role is DealerRole =>
  role === 'installer' || role === 'retailer';

const parsePrice = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const getProductDisplayPrice = (product: Product, role: string | null | undefined): number => {
  if (role === 'installer') {
    return parsePrice(product.installerPrice) ?? product.price;
  }

  if (role === 'retailer') {
    return parsePrice(product.retailerPrice) ?? product.price;
  }

  return product.price;
};

export const getProductPriceLabel = (product: Product, role: string | null | undefined): string => {
  if (role === 'installer' && parsePrice(product.installerPrice)) {
    return 'Installer price';
  }

  if (role === 'retailer' && parsePrice(product.retailerPrice)) {
    return 'Retailer price';
  }

  return 'Standard price';
};

export const getPricedProduct = (product: Product, role: string | null | undefined): Product => {
  const normalPrice = product.normalPrice ?? product.price;
  return {
    ...product,
    normalPrice,
    price: getProductDisplayPrice({ ...product, price: normalPrice }, role),
  };
};

export const formatNaira = (amount: number, options?: Intl.NumberFormatOptions) =>
  `\u20a6${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  })}`;
