import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router} from "@angular/router";
import { tap } from "rxjs";
import { environment } from "../../../environments/environment";


@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly TOKEN_KEY = 'token';
    isAutheticated = signal<boolean>(this.hasToken())

    constructor(private http: HttpClient, private router: Router){}

    login(email: string, password: string){
        return this.http.post<{ data: { token: string } }>(
            `${environment.apiUrl}/auth/login`,
            {email, password}
        ).pipe(
            tap(response =>{
                localStorage.setItem(this.TOKEN_KEY, response.data.token);
                this.isAutheticated.set(true);
            })
        )
    }



    logout(){
        localStorage.removeItem(this.TOKEN_KEY);
        this.isAutheticated.set(false);
        this.router.navigate(['/login'])
    }

    getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

    private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}