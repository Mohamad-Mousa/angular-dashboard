import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@shared/interfaces';
import { User, UserPaginatedResponse } from '@shared/interfaces/admin';

@Injectable({ providedIn: 'root' })
export class UserService {
  API_URL = environment.ApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of users
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param search - Search term (optional)
   * @param sortBy - Field name to sort by (optional)
   * @param sortDirection - Sort direction: 'asc' or 'desc' (optional)
   * @param filters - Filter object with column keys and values (optional)
   * @returns Observable with paginated user data
   */
  findMany(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortDirection?: 'asc' | 'desc',
    filters?: Record<string, string>
  ): Observable<UserPaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('term', search.trim());
    }

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    // Add filters as query parameters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (value && value.trim()) {
          params = params.set(key, value.trim());
        }
      });
    }

    return this.http
      .get<ApiResponse<UserPaginatedResponse>>(
        `${this.API_URL}/admin/users`,
        { params }
      )
      .pipe(
        map((res) => {
          if (!res.results || !res.results.data) {
            throw new Error('Invalid response from server');
          }
          return res.results;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Create a new user
   * @param userData - User data to create
   * @param imageFile - Optional image file to upload
   * @returns Observable with created user data
   */
  create(userData: Partial<User>, imageFile?: File): Observable<User> {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      const value = userData[key];
      if (value !== null && value !== undefined) {
        // Handle phone object specially
        if (key === 'phone' && typeof value === 'object' && !(value instanceof File)) {
          const phone = value as { code: number; number: number };
          if (phone.code !== undefined && phone.code !== null) {
            formData.append('phone[code]', phone.code.toString());
          }
          if (phone.number !== undefined && phone.number !== null) {
            formData.append('phone[number]', phone.number.toString());
          }
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .post<ApiResponse<User>>(`${this.API_URL}/admin/users`, formData)
      .pipe(
        map((res) => {
          if (!res.results) {
            throw new Error('Invalid response from server');
          }
          return res.results;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Update an existing user
   * @param userData - User data to update (must include _id)
   * @param imageFile - Optional image file to upload
   * @returns Observable with updated user data
   */
  update(userData: Partial<User>, imageFile?: File): Observable<User> {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      const value = userData[key];
      if (value !== null && value !== undefined) {
        // Handle phone object specially
        if (key === 'phone' && typeof value === 'object' && !(value instanceof File)) {
          const phone = value as { code: number; number: number };
          if (phone.code !== undefined && phone.code !== null) {
            formData.append('phone[code]', phone.code.toString());
          }
          if (phone.number !== undefined && phone.number !== null) {
            formData.append('phone[number]', phone.number.toString());
          }
        } else if (typeof value === 'object' && !(value instanceof File)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .put<ApiResponse<User>>(`${this.API_URL}/admin/users/update`, formData)
      .pipe(
        map((res) => {
          if (res.error === false && res.results === null) {
            return userData as User;
          }
          if (res.results) {
            return res.results;
          }
          if (res.error === true) {
            throw new Error(String(res.message || 'Update failed'));
          }
          return userData as User;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Delete one or more users
   * @param ids - Single ID string or array of ID strings
   * @returns Observable with deletion result
   */
  delete(ids: string | string[]): Observable<any> {
    const idsParam = Array.isArray(ids) ? ids.join(',') : ids;

    return this.http
      .delete<ApiResponse<any>>(
        `${this.API_URL}/admin/users/delete/${idsParam}`
      )
      .pipe(
        map((res) => {
          if (res.error === false && res.results === null) {
            return {
              success: true,
              message: String(res.message || 'Successfully deleted'),
              deletedIds: idsParam,
            };
          }
          if (res.results) {
            return res.results;
          }
          if (res.error === true) {
            throw new Error(String(res.message || 'Delete failed'));
          }
          return {
            success: true,
            message: String(res.message || 'Successfully deleted'),
            deletedIds: idsParam,
          };
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(() => err);
        })
      );
  }
}

