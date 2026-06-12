import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { EMPTY, firstValueFrom, forkJoin, from, of, Subject } from 'rxjs';
import { catchError, finalize, mergeMap, switchMap, takeUntil, toArray } from 'rxjs/operators';
import { AuthService } from '../../../services/utils/auth-service';
import { Product } from '../../../models/product';
import { ProductCategoryOption } from '../../../interfaces/product-category-option';
import { ProductCategoryService } from '../../../services/product_category/product-category-service';
import { SelectModule } from 'primeng/select';

interface ApiProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  videos: string[];
  username?: string;
  category: string;
}

const MAX_CONCURRENT_UPLOADS = 3;

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
    SelectModule,
  ],
  providers: [ProductService, FileService],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnDestroy, OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();

  successMessage = '';
  errorMessage = '';
  isSubmitting = false;
  isDragging = false;

  allFiles: File[] = [];
  product: Product = new Product();
  productCategories: ProductCategoryOption[] = [];

  get selectedImages(): File[] {
    return this.allFiles.filter((f) => f.type.startsWith('image/'));
  }
  get selectedVideos(): File[] {
    return this.allFiles.filter((f) => f.type.startsWith('video/'));
  }

  constructor(
    private productService: ProductService,
    private fileService: FileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private pcService: ProductCategoryService,
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

  ngOnInit(): void {
    this.pcService.getProductCategoryOptions().subscribe((options) => {
      this.productCategories = options;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private addFiles(incoming: File[]): void {
    const valid = incoming.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    const rejected = incoming.length - valid.length;
    if (rejected > 0) {
      this.errorMessage = `${rejected} fajl(a) je odbačeno — dozvoljene su samo slike i videi.`;
      setTimeout(() => {
        this.errorMessage = '';
      }, 4000);
    }
    // deduplicate by name + size + type
    const newFiles = valid.filter(
      (incoming) =>
        !this.allFiles.some(
          (existing) =>
            existing.name === incoming.name &&
            existing.size === incoming.size &&
            existing.type === incoming.type,
        ),
    );
    this.allFiles = [...this.allFiles, ...newFiles];
  }

  removeFile(index: number): void {
    this.allFiles = this.allFiles.filter((_, i) => i !== index);
  }

  async onSubmit(): Promise<void> {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      this.errorMessage = 'Niste prijavljeni.';
      return;
    }
    const username = JSON.parse(userData).username;
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';
 
    try {
      const tagged = await this.uploadFiles();

      const newProduct: ApiProduct = {
        name: this.product.name,
        description: this.product.description,
        price: this.product.price ?? 0,
        images: tagged.filter((t) => t.kind === 'image').map((t) => t.url),
        videos: tagged.filter((t) => t.kind === 'video').map((t) => t.url),
        username: username,
        category: this.product.category,
      };

      await firstValueFrom(this.productService.create(newProduct));

      this.clearForm();
      this.successMessage = 'Proizvod je uspešno dodat.';
      this.cdr.markForCheck();

      setTimeout(() => {
        this.successMessage = '';
        this.cdr.markForCheck();
      }, 5000);
    } catch {
      this.errorMessage = 'Greška pri dodavanju proizvoda. Pokušajte ponovo.';
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  private async uploadFiles() {
    const tagged = [
      ...this.selectedImages.map((f) => ({
        file: f,
        kind: 'image' as const,
        type: 'product_image' as const,
      })),
      ...this.selectedVideos.map((f) => ({
        file: f,
        kind: 'video' as const,
        type: 'product_video' as const,
      })),
    ];

    // Still respects concurrency limit using a simple pool
    const results: { kind: 'image' | 'video'; url: string }[] = [];
    const pool = Array.from({ length: MAX_CONCURRENT_UPLOADS }, async () => {
      while (tagged.length > 0) {
        const { file, kind, type } = tagged.shift()!;
        const result = await firstValueFrom(this.fileService.uploadFile(file, type));
        results.push({ kind, url: result?.data?.url ?? result?.url ?? '' });
      }
    });

    await Promise.all(pool);
    return results;
  }

  clearForm(): void {
    this.product.name = '';
    this.product.description = '';
    this.product.price = null;
    this.allFiles = [];
  }
}
