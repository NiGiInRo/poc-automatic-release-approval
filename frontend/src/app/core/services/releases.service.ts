import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Release, ReleaseResult } from '../models/release.model';

@Injectable({ providedIn: 'root' })
export class ReleasesService {
  private readonly apiUrl = 'http://localhost:3000/gateway/releases';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Release[]> {
    return this.http.get<Release[]>(this.apiUrl);
  }

  create(release: Release): Observable<ReleaseResult> {
    return this.http.post<ReleaseResult>(this.apiUrl, release);
  }
}
