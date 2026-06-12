import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { ProductCategoryOption } from '../../interfaces/product-category-option';

interface ProductCategory {
  id: number;
  name: string;
  Keywords: string[];
  SearchKeywords: string[];
}


@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {
  private apiUrl = 'http://localhost:8080/product-categories';

  private categories$;
  
    constructor(private http: HttpClient) {
      this.categories$ = this.http.get<ProductCategory[]>(`${this.apiUrl}/all`).pipe(shareReplay(1));
    }
  
    getProductCategoryOptions() {
      return this.categories$.pipe(
        map((categories) =>
          categories.map((c): ProductCategoryOption => ({
            label: c.name,
            value: c.name,
            keywords: [...(c.Keywords || []), ...(c.SearchKeywords || [])],
          })),
        ),
      );
    }
}
