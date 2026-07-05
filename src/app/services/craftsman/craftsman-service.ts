import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SortDirection } from '../../interfaces/sort';
import { API_ADMIN_URL, API_BASE_URL } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class CraftsmanService {
  private apiUrl = `${API_BASE_URL}/craftsmen`;
  private adminUrl = `${API_ADMIN_URL}/craftsmen`;

  constructor(private http: HttpClient) {}

  createCraftsman(data: any): Observable<any> {
    return this.http.post<any>(`${this.adminUrl}/create`, data);
  }

  all(data: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, { params: data });
  }

  getByCraft(craft: string, skip: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/craft/${craft}?skip=${skip}&limit=${limit}`);
  }

  sortByRating(direction: SortDirection, skip: number, limit: number): Observable<any> {
    return this.http.request<any>('GET', `${this.apiUrl}/sort/${direction}`, {
      body: { skip, limit },
    });
  }

  rateCraftsman(craftsmanId: number, rating: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rate`, { craftsmanId, rating });
  }

  setBiography(craftsmanId: number, biography: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/set-biography`, { craftsmanId, biography });
  }
}
