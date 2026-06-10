import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  }

  all(craftsmanId: number, skip: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/${craftsmanId}?skip=${skip}&limit=${limit}`);
  }
}
