import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Item {
  id: number;
  name: string;
  isActive: boolean;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private api = 'https://localhost:7249/api/items'; // ✅ Update if port changes

  constructor(private http: HttpClient) { }

  list(q: string = ''): Observable<Item[]> {
    const params = new HttpParams().set('q', q);
    return this.http.get<Item[]>(this.api, { params }).pipe(
      catchError(err => {
        console.error('Failed to fetch items:', err);
        return throwError(() => err);
      })
    );
  }

  get(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.api}/${id}`);
  }

  create(data: FormData) {
    return this.http.post(this.api, data);
  }

  update(id: number, data: FormData) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
