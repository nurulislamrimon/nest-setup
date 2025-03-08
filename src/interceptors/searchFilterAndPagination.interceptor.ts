import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { booleanFields, dateFields, numberFields } from '../constants';
import { IModelMappingsForWhere } from '../interfaces/modelMapping.interfaces';
import { pick } from 'src/utils/pick.utils';

@Injectable()
export class SearchFilterAndPaginationInterceptor<
  T extends keyof IModelMappingsForWhere,
> implements NestInterceptor
{
  constructor(
    private readonly searchableFields: Array<keyof IModelMappingsForWhere[T]>,
    private readonly filterableFields: Array<keyof IModelMappingsForWhere[T]>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const {
      searchTerm,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder,
      ...filterQuery
    } = request.query;

    // Pick filter fields from query
    const filterFields = pick(filterQuery, this.filterableFields.map(String));

    const where: IModelMappingsForWhere[T] = {};

    // ------------------------------------
    // Filtering format for searchTerm
    // ------------------------------------
    if (typeof searchTerm === 'string') {
      function removeNumberFields(
        arr1: (keyof IModelMappingsForWhere[T])[],
        arr2: string[],
      ) {
        return arr1.filter((item) => {
          return typeof item === 'string' && !arr2.includes(item);
        });
      }
      where.OR = removeNumberFields(this.searchableFields, [
        ...numberFields,
        ...dateFields,
      ]).map((field) => ({
        [field]: {
          contains: searchTerm,
        },
      }));
    }
    // -----------------------------------
    // Filtering format for filterFields
    // -----------------------------------
    if (Object.keys(filterFields).length > 0) {
      where.AND = Object.entries(filterFields).map(([key, value]) => {
        // ---------------------------------------- for number fields
        if (numberFields.includes(key)) {
          if (typeof value === 'object' && value !== null) {
            const parsedValues: { [key: string]: number } = Object.entries(
              value,
            ).reduce(
              (acc, [k, v]) => {
                acc[k] = parseFloat(v as string);
                return acc;
              },
              {} as { [key: string]: number },
            );
            return { [key]: parsedValues };
          }

          return {
            [key as keyof IModelMappingsForWhere[T]]: {
              equals: typeof value === 'string' ? parseFloat(value) : value,
            },
          };
        }

        // ------------------------------------------ for date fields
        if (dateFields.includes(key)) {
          if (typeof value === 'object' && value !== null) {
            const parsedValues: { [key: string]: Date } = Object.entries(
              value,
            ).reduce(
              (acc, [k, v]) => {
                acc[k] = new Date(v as string);
                return acc;
              },
              {} as { [key: string]: Date },
            );
            return { [key]: parsedValues };
          }
          const parsedDate =
            typeof value === 'string' ? new Date(value) : value;
          return {
            [key as keyof IModelMappingsForWhere[T]]: {
              equals: parsedDate,
            },
          };
        }
        // ------------------------------------------ for boolean fields
        if (booleanFields.includes(key)) {
          if (typeof value === 'object' && value !== null) {
            const parsedValues: { [key: string]: boolean } = Object.entries(
              value,
            ).reduce(
              (acc, [k, v]) => {
                acc[k] = v === 'true';
                return acc;
              },
              {} as { [key: string]: boolean },
            );
            return { [key]: parsedValues };
          }
          const parsedBoolean = value === 'true';
          return {
            [key as keyof IModelMappingsForWhere[T]]: parsedBoolean,
          };
        }

        // ---------------------------------------- without number, date and boolean fields
        return {
          [key as keyof IModelMappingsForWhere[T]]: value,
        };
      });
    }

    // Validate sortBy
    const validatedSortBy: keyof IModelMappingsForWhere[T] =
      this.searchableFields.includes(sortBy as keyof IModelMappingsForWhere[T])
        ? (sortBy as keyof IModelMappingsForWhere[T])
        : ('created_at' as keyof IModelMappingsForWhere[T]);

    // Validate sortOrder
    const validatedSortOrder: 'asc' | 'desc' =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';

    // Convert pagination values to string for query params
    request['pagination'] = {
      page: typeof page === 'object' ? page : String(page),
      limit: typeof limit === 'object' ? limit : String(limit),
      skip: String((Number(page) - 1) * Number(limit)),
      sortBy: String(validatedSortBy),
      sortOrder: validatedSortOrder,
    };

    request['where'] = where;

    // Continue to the next handler
    return next.handle();
  }
}
