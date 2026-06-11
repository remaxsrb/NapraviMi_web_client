import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
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
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ImageModule, RatingModule],
  templateUrl: './product-page.html',
  styleUrl: './product-page.css',
})
export class ProductPage implements OnInit {
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  product: Product = new Product();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    const cachedProduct = this.productService.getPreviewProduct();
    if (cachedProduct) {
      this.product = cachedProduct;
      this.isLoading = false;
    } else {
      this.router.navigate(['/']);
    }
  }
}
