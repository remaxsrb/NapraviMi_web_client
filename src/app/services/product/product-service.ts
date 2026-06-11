import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  private cachedProduct: any = null;

  // Store the product here right before navigating
  setPreviewProduct(product: any) {
    this.cachedProduct = product;
  }

  getPreviewProduct() {
    const product = this.cachedProduct;
    this.cachedProduct = null; // Clear it after reading
    return product;
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  }

  all(username: string, skip: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/${username}?skip=${skip}&limit=${limit}`);
  }
}
