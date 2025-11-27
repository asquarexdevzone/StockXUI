import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = "https://localhost:7249/api/auth"; // CHANGE if your API port differs

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }

  getRole(): string {
    return localStorage.getItem("role") || "";
  }

  getToken(): string {
    return localStorage.getItem("token") || "";
  }
}
