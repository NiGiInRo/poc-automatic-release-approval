import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const GATEWAY_URL = 'http://localhost:3000';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo inyectar token en requests al gateway
    if (!req.url.startsWith(GATEWAY_URL)) {
      return next.handle(req);
    }

    const token = this.authService.getToken();

    // Token expirado o ausente → redirigir al login
    if (!token || !this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Sesión expirada'));
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      }),
    );
  }
}
