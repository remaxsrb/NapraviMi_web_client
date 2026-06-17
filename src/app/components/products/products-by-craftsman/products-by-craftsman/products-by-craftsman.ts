import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product/product-service';
import { Product } from '../../../../models/product';
import { PaginationEvent } from '../../../../interfaces/pagination';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { map, switchMap, startWith, catchError } from 'rxjs/operators';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  totalRecords: number;
  first: number;
  rows: number;
}

@Component({
  selector: 'app-products-by-craftsman',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    TagModule,
    RatingModule,
    RouterLink,
  ],
  templateUrl: './products-by-craftsman.html',
  styleUrl: './products-by-craftsman.css',
})
export class ProductsByCraftsman {
  @Input() username: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  private paginationSubject$ = new BehaviorSubject<PaginationEvent>({
    first: 0,
    rows: 9,
  });

  private usernameSubject$ = new BehaviorSubject<string>('');

  readonly state$: Observable<ProductsState> = combineLatest([
    this.usernameSubject$,
    this.paginationSubject$,
  ]).pipe(
    switchMap(([username, pagination]) => {
      if (!username) {
        return EMPTY.pipe(
          startWith({
            products: [],
            isLoading: true,
            totalRecords: 0,
            first: pagination.first,
            rows: pagination.rows,
          })
        );
      }

      return this.productService.all(username, pagination.first, pagination.rows).pipe(
        map((response: any) => ({
          products: response?.data?.products ?? response?.data ?? [],
          isLoading: false,
          totalRecords: response?.data?.total ?? 0,
          first: pagination.first,
          rows: pagination.rows,
        })),
        startWith({
          products: [],
          isLoading: true,
          totalRecords: 0,
          first: pagination.first,
          rows: pagination.rows,
        }),
        catchError(() =>
          EMPTY.pipe(
            startWith({
              products: [],
              isLoading: false,
              totalRecords: 0,
              first: pagination.first,
              rows: pagination.rows,
            })
          )
        )
      );
    }),
    startWith({
      products: [],
      isLoading: true,
      totalRecords: 0,
      first: 0,
      rows: 9,
    })
  );

  ngOnInit(): void {
    if (this.username) {
      this.usernameSubject$.next(this.username);
    } else {
      const routeUsername = this.route.snapshot.paramMap.get('username');
      if (!routeUsername) {
        this.router.navigate(['/']);
        return;
      }
      this.usernameSubject$.next(routeUsername);
    }
  }

  onPage(event: any): void {
    this.paginationSubject$.next({
      first: event.first,
      rows: event.rows,
    });
  }

  getFirstImage(product: Product): string {
    return product.images?.[0] ?? '';
  }

  onSelectProduct(product: Product): void {
    this.productService.setPreviewProduct(product);
  }
}
