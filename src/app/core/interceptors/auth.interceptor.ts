import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError(error => {
      const isRefreshUrl = req.url.includes('/auth/refresh');

      if (error.status === 401 && !isRefreshUrl) {
        return auth.refresh().pipe(
          switchMap(() => next(authReq)),
          catchError(refreshError => {
            auth.logout().subscribe();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};