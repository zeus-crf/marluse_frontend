import { Injectable, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { environment } from "../../../environments/environment";

interface AuthData {
  token: string;
  nome: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY  = 'user';

  isAutheticated = signal<boolean>(this.hasToken());

  currentUser = signal<{ nome: string; email: string } | null>(this.loadUser());

  // Iniciais do nome para o avatar
  initials = computed(() => {
    const nome = this.currentUser()?.nome ?? '';
    return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ message: string; data: AuthData }>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(response => {
        this.saveSession(response.data);
      })
    );
  }

  register(nome: string, email: string, password: string) {
    return this.http.post<{ message: string; data: AuthData }>(
      `${environment.apiUrl}/auth/register`,
      { email, nome, password }
    ).pipe(
      tap(response => {
        this.saveSession(response.data);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAutheticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(data: AuthData): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ nome: data.nome, email: data.email }));
    this.isAutheticated.set(true);
    this.currentUser.set({ nome: data.nome, email: data.email });
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): { nome: string; email: string } | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
