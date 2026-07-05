import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ProductCategory, ProductCategoryOption } from '../../interfaces/product-category';
import { API_BASE_URL } from '../../env';


@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private apiUrl = `${API_BASE_URL}/product-categories`;

  private categoriesByUsername = new Map<string, Observable<ProductCategoryOption[]>>();

  constructor(private http: HttpClient) {}

  getProductCategoryOptions(username: string): Observable<ProductCategoryOption[]> {
    let categories$ = this.categoriesByUsername.get(username);

    if (!categories$) {
      categories$ = this.http
        .get<ProductCategory[]>(`${this.apiUrl}/craftsman/${username}`)
        .pipe(
          map((categories) =>
            categories.map((c): ProductCategoryOption => ({
              label: c.name,
              value: c.name,
              keywords: [...(c.Keywords || []), ...(c.SearchKeywords || [])],
            })),
          ),
          shareReplay(1),
        );
      this.categoriesByUsername.set(username, categories$);
    }

    return categories$;
  }
}
