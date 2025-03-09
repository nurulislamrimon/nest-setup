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

export const formatOrder = (value: string | number): 'asc' | 'desc' => {
  const numValue = Number(value);
  const isString = Number.isNaN(numValue);

  if (!isString && (numValue === 1 || numValue === -1)) {
    return numValue === 1 ? 'asc' : 'desc';
  } else {
    return value === 'asc' || value === 'ascending' ? 'asc' : 'desc';
  }
};
