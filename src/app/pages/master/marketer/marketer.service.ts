import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marketer } from '../model/marketer.model';

@Injectable({ providedIn: 'root' })
export class MarketerService {

  private api = 'https://localhost:44361/api/Marketer';

  constructor(private http: HttpClient) { }

  list(): Observable<Marketer[]> {
    return this.http.get<Marketer[]>(this.api);
  }
  
   create(model: Partial<Marketer>): Observable<any> {
    return this.http.post(this.api, model);
  }

  // ============================
  // PUT: Update Marketer
  // ============================
  update(id: number, model: Partial<Marketer>): Observable<any> {
    return this.http.put(`${this.api}/${id}`, model);
  }


  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
