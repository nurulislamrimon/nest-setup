import { SellerSession, Prisma } from '@prisma/client';

export const sellerSessionFilterableFields: (keyof SellerSession)[] = [
  'id',
  'ip',
  'user_agent',
  'device',
  'platform',
  'browser',
  'is_active',
  'created_at',
  'updated_at',
  'deleted_at',
];
export const sellerSessionSearchableFields: (keyof SellerSession)[] = [
  'ip',
  'user_agent',
  'device',
  'platform',
  'browser',
];

// ------------------------------------
// select fields
// ------------------------------------

type SellerSessionSelectedFields = {
  [key in keyof Partial<Prisma.SellerSessionGetPayload<object>>]: boolean;
};

export const sellerSessionSelectedFields: SellerSessionSelectedFields = {
  id: true,
  ip: true,
  user_agent: true,
  device: true,
  platform: true,
  browser: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
};
