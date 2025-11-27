import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FinishStockService {
  private base = 'https://localhost:7249/api/finishstock';

  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }
}
