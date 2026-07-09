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
      const isAuthUrl = req.url.includes('/auth/');

      if ((error.status === 401 || error.status === 403) && !isAuthUrl) {
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
