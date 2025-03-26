import { Prisma } from '@prisma/client';

export interface IModelMappingsForWhere {
  Administrator: Prisma.AdministratorWhereInput;
  Administrator_session: Prisma.AdministratorSessionWhereInput;
  Seller: Prisma.SellerWhereInput;
  Seller_session: Prisma.SellerSessionWhereInput;
}
