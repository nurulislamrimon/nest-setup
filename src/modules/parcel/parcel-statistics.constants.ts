import { Parcel_statistics, Prisma } from '@prisma/client';

export const parcelStatisticsFilterableFields: (keyof Parcel_statistics)[] = [
  'id',
  'phone_number',
  'request_no',
  'seller_id',
  'created_at',
  'updated_at',
  'deleted_at',
];
export const parcelStatisticsSearchableFields: (keyof Parcel_statistics)[] = [
  'phone_number',
];

// ------------------------------------
// select fields
// ------------------------------------

type Parcel_statisticsSelectedFields = {
  [key in keyof Partial<Prisma.Parcel_statisticsGetPayload<object>>]: boolean;
};

export const parcelStatisticsSelectedFields: Parcel_statisticsSelectedFields = {
  id: true,
  phone_number: true,
  request_no: true,
  seller_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
};
