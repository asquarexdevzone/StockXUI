import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transport } from '../model/transport.model';

@Injectable({ providedIn: 'root' })
export class TransportService {

  private http = inject(HttpClient);
  private base = 'https://localhost:44361/api/transports';

  list(q: string = ''): Observable<Transport[]> {
    return this.http.get<Transport[]>(`${this.base}?q=${q}`);
  }

  getById(id: number): Observable<Transport> {
    return this.http.get<Transport>(`${this.base}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.base, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
