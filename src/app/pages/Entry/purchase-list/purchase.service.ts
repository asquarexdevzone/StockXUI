import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PurchaseItemDto {
  itemId: number;
  sizeId: number;
  gradeId: number;
  boxQty: number;
  breakageBox?: number;
  sqmt: number;
}

export interface PurchaseDto {
  date: string; // yyyy-MM-dd
  voucherNo: number;
  partyId: number;
  remark?: string;
  transportNo?: string;
  items: PurchaseItemDto[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private base = 'https://localhost:7249/api/purchase'; // change if your backend path differs

  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  getNextVoucherNo(): Observable<number> {
    return this.http.get<number>(`${this.base}/next-voucher`);
  }

  create(payload: PurchaseDto) {
    return this.http.post(this.base, payload);
  }

  update(id: number, payload: PurchaseDto) {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
