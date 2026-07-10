import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Subject, switchMap, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

let isRefreshing = false;
let refreshSubject = new Subject<void>();

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError(error => {
      // Evita loop infinito: não tenta refresh se o erro veio do próprio refresh,
      // do login ou do register. /auth/me é um endpoint protegido normal — deve sim
      // disparar o refresh quando o access token expirar.
      const skipRefresh =
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register');

      if ((error.status === 401 || error.status === 403) && !skipRefresh) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshSubject = new Subject<void>();

          return auth.refresh().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshSubject.next();
              refreshSubject.complete();
              return next(authReq);
            }),
            catchError(refreshError => {
              isRefreshing = false;
              refreshSubject.error(refreshError);
              auth.logout().subscribe();
              router.navigate(['/auth/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          // Outra requisição já está fazendo o refresh — aguarda e repete
          return refreshSubject.pipe(
            switchMap(() => next(authReq))
          );
        }
      }

      return throwError(() => error);
    })
  );
};
