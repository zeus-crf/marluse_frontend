import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

const PUBLIC_URLS = ['/api/auth/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const isPublic = PUBLIC_URLS.some(url => req.url.includes(url));

  const authReq = token && !isPublic
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

    return next(authReq).pipe(
        catchError(error =>{
            if(error.status == 401){
                localStorage.removeItem('token');
                router.navigate(['/login'])
            }
            return throwError(() => error)
        }));
    
    

}