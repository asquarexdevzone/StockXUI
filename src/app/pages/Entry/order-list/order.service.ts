// /src/app/pages/Entry/order/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = 'https://localhost:44361/api/order';

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<any[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  getNextVoucherNo() {
    return this.http.get<number>(`${this.base}/next-voucher`);
  }

  create(payload: any) {
    return this.http.post(`${this.base}/create`, payload);
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
}