import { AdministratorSession, Prisma } from '@prisma/client';

export const administratorSessionFilterableFields: (keyof AdministratorSession)[] =
  [
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
export const administratorSessionSearchableFields: (keyof AdministratorSession)[] =
  ['ip', 'user_agent', 'device', 'platform', 'browser'];

// ------------------------------------
// select fields
// ------------------------------------

type AdministratorSessionSelectedFields = {
  [key in keyof Partial<
    Prisma.AdministratorSessionGetPayload<object>
  >]: boolean;
};

export const administratorSessionSelectedFields: AdministratorSessionSelectedFields =
  {
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
