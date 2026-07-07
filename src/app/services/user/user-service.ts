import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { unwrapEnvelope } from '../utils/response-envelope';
import { User } from '../../models/user';
import { API_BASE_URL } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

    private apiUrl = `${API_BASE_URL}/users`;

  // Store the user here right before navigating
  setPreviewUser(user: any) {
    sessionStorage.setItem('previewUser', JSON.stringify(user));
  }

  getPreviewUser() {
    const user = sessionStorage.getItem('previewUser');
    if (!user) return null;
    return JSON.parse(user);
  }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(map(unwrapEnvelope));
  }

  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(map(unwrapEnvelope));
  }

  changePassword(data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/change-password`, data);
  }

  setProfilePicture(data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/set-profile-picture`, data);
  }

  all(data: any): Observable<{ users: any[]; total: number }> {
    let params = new HttpParams();

    if (data.limit !== undefined && data.limit !== null) {
      params = params.set('limit', data.limit.toString());
    }

    if (data.skip !== undefined && data.skip !== null) {
      params = params.set('skip', data.skip.toString());
    }

    return this.http
      .get<any>(`${this.apiUrl}/all`, {
        params,
      })
      .pipe(map((response) => this.normalizeUserListResponse(response)));
  }

  private normalizeUserListResponse(response: any): { users: any[]; total: number } {
    const payload = response?.data ?? response;
    const users = Array.isArray(payload?.users) ? payload.users : [];

    return {
      users,
      total: typeof payload?.total === 'number' ? payload.total : 0,
    };
  }

  setRole(data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/set-role`, data);
  }

  getByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/username/${username}`);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/`);
  }

  getRegisteredCount(from: string, to: string): Observable<{ data: { total: number } }> {
    return this.http.get<{ data: { total: number } }>(`${this.apiUrl}/registered`, {
      params: { from, to },
    });
  }
}
