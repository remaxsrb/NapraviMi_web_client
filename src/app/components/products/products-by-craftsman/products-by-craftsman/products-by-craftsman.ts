import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
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

interface ApiProduct {
  id: number;
  name: string;
  description: string;
  materialPrice: number;
  laborPrice: number;
  rating: number | null;
  numberOfRatings: number | null;
  available: boolean;
  images: string[];
  videos: string[];
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
export class ProductsByCraftsman implements OnInit {
  @Input() username: string = '';

  products: Product[] = [];
  isLoading = false;
  first = 0;
  pageSize = 9;
  totalRecords = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    if (!this.username) {
      const routeUsername = this.route.snapshot.paramMap.get('username');
      if (!routeUsername) {
        this.router.navigate(['/']);
        return;
      }
      this.username = routeUsername;
    }
    this.loadProducts();
  }

  onPage(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productService.all(this.username, this.first, this.pageSize).subscribe({
      next: (response: any) => {
        this.products = response?.data?.products ?? response?.data ?? [];
        this.totalRecords = response?.data?.total ?? this.products.length;
        this.isLoading = false;
              this.cdr.markForCheck();

      },
      error: () => {
        this.products = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  getFirstImage(product: Product): string {
    return product.images?.[0] ?? '';
  }

  onSelectProduct(product: Product): void {
    this.productService.setPreviewProduct(product);
  }

}
