import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ProductService } from '../../../services/product/product-service';
import { FileService } from '../../../services/utils/file-service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface ApiProduct {
  name: string;
  craftsmanId: number;
  description: string;
  materialPrice: number;
  laborPrice: number;
  images: string[];
  videos: string[];
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
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  name = '';
  description = '';
  materialPrice: number | null = null;
  laborPrice: number | null = null;
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;
  isDragging = false;

  allFiles: File[] = [];

  get selectedImages(): File[] { return this.allFiles.filter(f => f.type.startsWith('image/')); }
  get selectedVideos(): File[] { return this.allFiles.filter(f => f.type.startsWith('video/')); }

  constructor(
    private productService: ProductService,
    private fileService: FileService,
  ) {}

  openFilePicker(): void {
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  private addFiles(incoming: File[]): void {
    const valid = incoming.filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    const rejected = incoming.length - valid.length;
    if (rejected > 0) {
      this.errorMessage = `${rejected} fajl(a) je odbačeno — dozvoljene su samo slike i videi.`;
      setTimeout(() => { this.errorMessage = ''; }, 4000);
    }
    // deduplicate by name + size + type
    const newFiles = valid.filter(
      incoming => !this.allFiles.some(
        existing => existing.name === incoming.name &&
          existing.size === incoming.size &&
          existing.type === incoming.type,
      ),
    );
    this.allFiles = [...this.allFiles, ...newFiles];
  }

  removeFile(index: number): void {
    this.allFiles = this.allFiles.filter((_, i) => i !== index);
  }

  onSubmit(): void {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const craftsmanId = Number(userData?.craftsman_id);
    if (!craftsmanId) {
      console.error('Craftsman ID not found in localStorage');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const images = this.selectedImages;
    const videos = this.selectedVideos;

    const imageUploads$ = images.map(f => this.fileService.uploadFile(f, 'product_image'));
    const videoUploads$ = videos.map(f => this.fileService.uploadFile(f, 'product_video'));

    const allUploads$ = [...imageUploads$, ...videoUploads$];
    const uploads$ = allUploads$.length > 0 ? forkJoin(allUploads$) : of([]);

    uploads$.pipe(
      switchMap((uploadResults: any[]) => {
        const imageUrls = uploadResults
          .slice(0, imageUploads$.length)
          .map(r => r?.data?.url ?? r?.url ?? '');
        const videoUrls = uploadResults
          .slice(imageUploads$.length)
          .map(r => r?.data?.url ?? r?.url ?? '');

        const newProduct: ApiProduct = {
          name: this.name,
          craftsmanId,
          description: this.description,
          materialPrice: this.materialPrice ?? 0,
          laborPrice: this.laborPrice ?? 0,
          images: imageUrls,
          videos: videoUrls,
        };
        return this.productService.create(newProduct);
      }),
    ).subscribe({
      next: () => {
        this.successMessage = 'Proizvod je uspešno dodat.';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.clearForm();
        setTimeout(() => { this.successMessage = ''; }, 5000);
      },
      error: () => {
        this.errorMessage = 'Greška pri dodavanju proizvoda. Pokušajte ponovo.';
        this.successMessage = '';
        this.isSubmitting = false;
      },
    });
  }

  clearForm(): void {
    this.name = '';
    this.description = '';
    this.materialPrice = null;
    this.laborPrice = null;
    this.allFiles = [];
  }
}
