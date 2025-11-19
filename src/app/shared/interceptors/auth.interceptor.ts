// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
// import { AuthService } from '../services/auth.service';
// import { Credentials } from '@shared/interfaces/credentials';

// @Injectable({ providedIn: 'root' })
// export class AuthInterceptor implements HttpInterceptor {
//     constructor(private authService: AuthService) { }

//     intercept(request: HttpRequest<Credentials>, next: HttpHandler) {
//         const accessToken = this.authService.getAccessToken();
//         request = request.clone({
//             setHeaders: {
//                 Authorization: `Bearer ${accessToken}`
//             }
//         });
//         return next.handle(request);
//     }
// }
