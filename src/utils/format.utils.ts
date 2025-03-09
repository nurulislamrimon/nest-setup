import { IPagination } from 'src/interfaces/format.interfaces';

export const formatPagination = (
  pagination: Record<string, string | number>,
): IPagination => {
  const { sortBy, sortOrder, page, limit } = pagination;
  const skip = (Number(page) - 1) * Number(limit);
  return {
    orderBy: {
      [sortBy]: sortOrder === 'asc' ? ('asc' as const) : ('desc' as const),
    },
    skip,
    take: Number(limit),
  };
};
