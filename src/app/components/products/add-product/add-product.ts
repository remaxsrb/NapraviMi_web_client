import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ProductService } from '../../../services/product/product-service';

interface ApiProduct {
  name: string;
  craftsmanId: number;
  description: string;
  materialPrice: number;
  laborPrice: number;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    MessageModule,
  ],

  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {
  name = '';
  description = '';
  materialPrice: number | null = null;
  laborPrice: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private productService: ProductService) {}

  onSubmit(): void {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const craftsmanId = Number(userData?.craftsman_id);
    if (!craftsmanId) {
      console.error('Craftsman ID not found in localStorage');
      return;
    }

    const newProduct: ApiProduct = {
      name: this.name,
      craftsmanId,
      description: this.description,
      materialPrice: this.materialPrice || 0,
      laborPrice: this.laborPrice || 0,
    };

    this.productService.create(newProduct).subscribe({
      next: (response) => {
        this.successMessage = 'Proizvod je uspešno dodat.';
        this.errorMessage = '';
        this.clearForm();
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = 'Greška pri dodavanju proizvoda. Pokušajte ponovo.';
        this.successMessage = '';
      },
    });
  }

  clearForm(): void {
    this.name = '';
    this.description = '';
    this.materialPrice = null;
    this.laborPrice = null;
  }
}
