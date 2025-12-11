import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpeningStockService {

  private apiUrl = "https://localhost:44361/api/openingstock";

  constructor(private http: HttpClient) { }

  list(search: string = '') {
    return this.http.get<any[]>(`${this.apiUrl}?q=${search}`);
  }


  getDropdownData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dropdowns`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

}
