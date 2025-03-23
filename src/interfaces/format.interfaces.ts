export interface IPagination {
  orderBy: {
    [key: string]: 'asc' | 'desc';
  };
  skip: number;
  take: number;
}
