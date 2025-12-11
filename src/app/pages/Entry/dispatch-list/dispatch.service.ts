import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DispatchService {
  private base = 'https://localhost:44361/api/dispatch';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<any[]>(this.base);
  }

  getNextVoucherNo() {
    return this.http.get<number>(`${this.base}/next-voucher`);
  }

  create(payload: any) {
    return this.http.post(this.base, payload);
  }

  update(id: number, payload: any) {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  exportPdf(id: number) {
    return this.http.get(`${this.base}/export-pdf/${id}`, { responseType: 'blob' });
  }

  // Add this method to get a single dispatch by ID
  getById(id: number) {
    return this.http.get<any>(`${this.base}/${id}`);
  }
}