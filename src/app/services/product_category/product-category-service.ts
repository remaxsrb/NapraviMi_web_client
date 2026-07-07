import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ProductCategory, ProductCategoryOption } from '../../interfaces/product-category';
import { API_BASE_URL } from '../../env';
import { unwrapArray } from '../utils/response-envelope';


@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private apiUrl = `${API_BASE_URL}/product-categories`;

  private categories$?: Observable<ProductCategoryOption[]>;

  constructor(private http: HttpClient) {}

  getProductCategoryOptions(): Observable<ProductCategoryOption[]> {
    if (!this.categories$) {
      this.categories$ = this.http
        .get<{ data: ProductCategory[] } | ProductCategory[]>(`${this.apiUrl}/craftsman/me`)
        .pipe(
          map((response) => {
            const categories = unwrapArray(response);
            return categories.map((c): ProductCategoryOption => ({
              label: c.name,
              value: c.name,
              keywords: [...(c.Keywords || []), ...(c.SearchKeywords || [])],
            }));
          }),
          shareReplay(1),
        );
    }

    return this.categories$;
  }
}
