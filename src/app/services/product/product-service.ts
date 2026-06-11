import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  setPreviewProduct(product: any) {
    sessionStorage.setItem('previewProduct', JSON.stringify(product));
  }

  getPreviewProduct() {
    const product = sessionStorage.getItem('previewProduct');
    if (!product) return null;
    return JSON.parse(product);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  }

  all(username: string, skip: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/${username}?skip=${skip}&limit=${limit}`);
  }

  delete(id: number, craftsmanId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete`, { body: { id, craftsmanId } });
  }
}
