import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Size } from '../model/size.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SizeService {
  private base = 'https://localhost:7249/api/sizes';

  constructor(private http: HttpClient) {}

  list(q: string) {
    return this.http.get<Size[]>(`${this.base}?q=${q}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.base, payload);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
