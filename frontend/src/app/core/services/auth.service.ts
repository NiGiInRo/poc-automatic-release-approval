import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'poc-realm';
const CLIENT_ID = 'poc-client';
const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<void> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', CLIENT_ID);
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<{ access_token: string }>(
        `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
        body.toString(),
        { headers },
      )
      .pipe(
        map((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }
}
