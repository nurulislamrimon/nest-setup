import { Seller, Prisma } from '@prisma/client';

export const sellerFilterableFields: (keyof Seller)[] = [
  'id',
  'full_name',
  'phone_number',
  'email',
  'role',
  'address',
  'created_at',
  'updated_at',
  'deleted_at',
];
export const sellerSearchableFields: (keyof Seller)[] = [
  'full_name',
  'phone_number',
  'email',
  'address',
];

// ------------------------------------
// seller roles
// ------------------------------------
export const sellerRoles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

// ------------------------------------
// select fields
// ------------------------------------

type SellerSelectedFields = {
  [key in keyof Partial<Prisma.SellerGetPayload<object>>]: boolean;
};

export const sellerSelectedFields: SellerSelectedFields = {
  id: true,
  full_name: true,
  phone_number: true,
  email: true,
  role: true,
  profilePhoto: true,
  //   password:true,
  address: true,
  created_at: true,
  //   updated_at:true,
  //   deleted_at:true,
};
