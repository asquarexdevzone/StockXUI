import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Party } from '../model/party.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PartyService {
  private base = 'http://stockxapi.vijman.com:82/api/parties';

  constructor(private http: HttpClient) {}

  list(q: string = ''): Observable<Party[]> {
    return this.http.get<Party[]>(`${this.base}?q=${q}`);
  }

  create(payload: any): Observable<Party> {
    return this.http.post<Party>(this.base, payload);
  }

  update(id: number, payload: any) {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
