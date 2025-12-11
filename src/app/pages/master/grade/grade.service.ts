import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Grade } from '../model/grade.model';

@Injectable({ providedIn: 'root' })
export class GradeService {
  private http = inject(HttpClient);
  private base = 'http://stockxapi.vijman.com:82/api/grades';

  list(q: string) {
    return this.http.get<Grade[]>(this.base + '?q=' + q);
  }

  create(data: any) {
    return this.http.post<Grade>(this.base, data);
  }

  update(id: number, data: any) {
    return this.http.put(this.base + '/' + id, data);
  }

  delete(id: number) {
    return this.http.delete(this.base + '/' + id);
  }
}
