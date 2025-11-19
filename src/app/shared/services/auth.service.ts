import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@shared/interfaces';
import { Admin, Privilege, User, UserAuthenticated } from '@shared/interfaces';
import { PrivilegeAccess } from '@shared/enums';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: any | undefined;
  private user_privileges: { adminPrivileges: Privilege[] } | undefined;

  API_URL = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login(admin: any, cb = () => {}, errCb = (err: Error) => {}) {
    return this.http
      .post<ApiResponse<UserAuthenticated>>(
        `${this.API_URL}/admin/login`,
        admin,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          let results = res.results;

          if (!results.accessToken) return;
          this.currentUser = admin;
          if (cb) {
            this.setAccessToken(results.accessToken);
            cb();
          }
        },
        error: (err: Error) => {
          if (errCb) errCb(err);
          console.log(err);
        },
      });
  }

  logout() {
    return this.http
      .post<ApiResponse<null>>(`${this.API_URL}/auth-admin/logout`, null)
      .pipe(
        tap(() => {
          this.currentUser = undefined;
          this.user_privileges = undefined;
        })
      );
  }

  setAccessToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getAccessToken() {
    return localStorage.getItem('access_token') || false;
  }

  refreshToken() {
    return this.http
      .post<ApiResponse<UserAuthenticated>>(
        `${this.API_URL}/auth-admin/refresh-token`,
        null,
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          let results = res.results;
          this.currentUser = results.admin;
          this.setAccessToken(results.accessToken);
        })
      );
  }

  getPrivileges() {
    return this.http
      .get<ApiResponse<{ adminPrivileges: Privilege[] }>>(
        `${this.API_URL}/privilege`
      )
      .pipe(
        tap(
          (response: ApiResponse<{ adminPrivileges: Privilege[] }>) =>
            (this.user_privileges = response.results)
        ),
        map(
          (response: ApiResponse<{ adminPrivileges: Privilege[] }>) =>
            response.results.adminPrivileges
        )
      );
  }

  hasPrivilege(function_key: string, access: PrivilegeAccess) {
    if (!this.user_privileges?.adminPrivileges) return false;
    const privilege = this.user_privileges.adminPrivileges.filter(
      (privilege: Privilege) =>
        privilege.functionlist.functionName === function_key
    )[0];
    return privilege && privilege[access];
  }

  get isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');

    if (!token) {
      return false;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;

      if (Date.now() >= expirationTime) {
        localStorage.removeItem('access_token');
        return false;
      }

      return true;
    } catch (error) {
      localStorage.removeItem('access_token');
      return false;
    }
  }
}
