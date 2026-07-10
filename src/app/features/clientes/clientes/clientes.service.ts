import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ClienteRequest,
  ClienteAtualizarRequest,
  ClienteResponse,
} from '../models/clientes.models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http    = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clientes`;

  getClientes(): Observable<ClienteResponse[]> {
    return this.http.get<{ data:ClienteResponse[] }>(this.baseUrl).pipe(map(r => r.data));
  }

  getClienteById(id: string): Observable<ClienteResponse> {
    return this.http.get<{ data:ClienteResponse }>(`${this.baseUrl}/${id}`).pipe(map(r => r.data));
  }

  criar(request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<{ data:ClienteResponse }>(this.baseUrl, request).pipe(map(r => r.data));
  }

  atualizar(id: string, request: ClienteAtualizarRequest): Observable<ClienteResponse> {
    return this.http.put<{ data:ClienteResponse }>(`${this.baseUrl}/${id}`, request).pipe(map(r => r.data));
  }

  inativar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
