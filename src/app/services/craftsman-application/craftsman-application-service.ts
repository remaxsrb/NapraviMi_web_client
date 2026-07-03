import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class CraftsmanApplicationService {
  private publicApiUrl = `${API_BASE_URL}/craftsman-applications`;
  private adminApiUrl = `${API_BASE_URL}/admin/craftsman-applications`;
  

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.publicApiUrl}/create`,
      data
    );
  }

  all(data: any): Observable<any> {
    return this.http.get<any>(`${this.adminApiUrl}/all`, { params: data });
  }

  
  approveCA(data:any): Observable<any> {
    return this.http.patch<any>(`${this.adminApiUrl}/approve`, data);
  }

  rejectCA(data:any): Observable<any> {
    return this.http.patch<any>(`${this.adminApiUrl}/reject`, data);
  }


}
