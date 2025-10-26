import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * HTTP interceptor that adds authentication tokens to outgoing requests.
 * Implements Angular's HttpInterceptor interface to modify HTTP requests before they are sent.
 *
 * @remarks
 * This interceptor automatically adds the JWT token to the Authorization header
 * of all HTTP requests if a token is available. It handles both regular JSON requests
 * and FormData requests differently to ensure proper header configuration.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      if (request.body instanceof FormData) {
        // For FormData requests, don't set Content-Type to let the browser set it with proper boundary
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
      } else {
        // For regular JSON requests, set Content-Type to application/json
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
      }
    }

    return next.handle(request);
  }
}