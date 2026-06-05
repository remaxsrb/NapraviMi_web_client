import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CraftsmanApplicationService {
  private apiUrl = 'http://localhost:8080/craftsman-applications';
  

  constructor(private http: HttpClient) {}

  all(data: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, { params: data });
  }

  
  approveCA(data:any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/approve`, data);
  }

  rejectCA(data:any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reject`, data);
  }


}
