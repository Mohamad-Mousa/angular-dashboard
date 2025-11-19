import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '@shared/services/auth.service';
import { Credentials } from '@shared/interfaces/credentials';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  addAuthHeader(request: HttpRequest<Credentials>) {
    const accessToken = this.authService.getAccessToken();
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return request;
  }

  handleResponseError(
    error: HttpErrorResponse,
    request?: HttpRequest<Credentials>,
    next?: HttpHandler
  ) {
    // Invalid token error
    if (error.status === 401 || error.statusText === 'unauthorized') {
      localStorage.removeItem('access_token');
      window.location.reload();
    }
    return throwError(() => error);
  }

  intercept(
    request: HttpRequest<Credentials>,
    next: HttpHandler
  ): Observable<any> {
    return next.handle(request).pipe(
      catchError((error) => {
        return this.handleResponseError(error, request, next);
      })
    );
  }
}
