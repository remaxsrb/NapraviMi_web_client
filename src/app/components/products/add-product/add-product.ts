import {
  Component,
  ElementRef,
  ViewChild,
  inject,
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
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../../services/utils/auth-service';
import { Product } from '../../../models/product';
import { ProductCategoryOption } from '../../../interfaces/product-category';
import { CreateProductRequest } from '../../../interfaces/product';
import { ProductCategoryService } from '../../../services/product_category/product-category-service';
import { SelectModule } from 'primeng/select';

interface AddProductState {
  successMessage: string;
  errorMessage: string;
  isSubmitting: boolean;
  isDragging: boolean;
  allFiles: File[];
  productCategories: ProductCategoryOption[];
}

interface UiState {
  successMessage: string;
  errorMessage: string;
  isSubmitting: boolean;
  isDragging: boolean;
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
export class AddProduct {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private productService = inject(ProductService);
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private pcService = inject(ProductCategoryService);

  private uiStateSubject$ = new BehaviorSubject<UiState>({
    successMessage: '',
    errorMessage: '',
    isSubmitting: false,
    isDragging: false,
  });

  private allFilesSubject$ = new BehaviorSubject<File[]>([]);

  private categories$: Observable<ProductCategoryOption[]> = this.pcService
    .getProductCategoryOptions(this.getUsername())
    .pipe(
      startWith([] as ProductCategoryOption[]),
      catchError(() => of([] as ProductCategoryOption[]))
    );

  readonly state$: Observable<AddProductState> = combineLatest([
    this.uiStateSubject$,
    this.allFilesSubject$,
    this.categories$,
  ]).pipe(
    map(([ui, allFiles, productCategories]) => ({
      successMessage: ui.successMessage,
      errorMessage: ui.errorMessage,
      isSubmitting: ui.isSubmitting,
      isDragging: ui.isDragging,
      allFiles,
      productCategories,
    }))
  );

  product: Product = new Product();

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
    this.patchUiState({ isDragging: true });
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.patchUiState({ isDragging: false });
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.patchUiState({ isDragging: false });
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  private addFiles(incoming: File[]): void {
    const existingFiles = this.allFilesSubject$.value;
    const valid = incoming.filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    const rejected = incoming.length - valid.length;
    if (rejected > 0) {
      this.patchUiState({
        errorMessage: `${rejected} фајл(а) је одбачено - дозвољене су само слике и видеи.`,
      });
      setTimeout(() => {
        this.patchUiState({ errorMessage: '' });
      }, 4000);
    }

    const newFiles = valid.filter(
      (incomingFile) =>
        !existingFiles.some(
          (existing) =>
            existing.name === incomingFile.name &&
            existing.size === incomingFile.size &&
            existing.type === incomingFile.type,
        ),
    );

    this.allFilesSubject$.next([...existingFiles, ...newFiles]);
  }

  removeFile(index: number): void {
    this.allFilesSubject$.next(this.allFilesSubject$.value.filter((_, i) => i !== index));
  }

  private getUsername(): string {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData).username : '';
  }

  async onSubmit(): Promise<void> {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.patchUiState({ errorMessage: 'Нисте пријављени.' });
      return;
    }

    const username = JSON.parse(userData).username;

    this.patchUiState({
      isSubmitting: true,
      successMessage: '',
      errorMessage: '',
    });
 
    try {
      const tagged = await this.uploadFiles(this.allFilesSubject$.value);

      const newProduct: CreateProductRequest = {
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
      this.patchUiState({
        successMessage: 'Производ је успешно додат.',
      });

      setTimeout(() => {
        this.patchUiState({ successMessage: '' });
      }, 5000);
    } catch {
      this.patchUiState({ errorMessage: 'Грешка при додавању производа. Покушајте поново.' });
    } finally {
      this.patchUiState({ isSubmitting: false });
    }
  }

  private async uploadFiles(files: File[]) {
    const selectedImages = files.filter((f) => f.type.startsWith('image/'));
    const selectedVideos = files.filter((f) => f.type.startsWith('video/'));

    const tagged = [
      ...selectedImages.map((f) => ({
        file: f,
        kind: 'image' as const,
        type: 'product_image' as const,
      })),
      ...selectedVideos.map((f) => ({
        file: f,
        kind: 'video' as const,
        type: 'product_video' as const,
      })),
    ];

    if (tagged.length === 0) {
      return [] as { kind: 'image' | 'video'; url: string }[];
    }

    const results: { kind: 'image' | 'video'; url: string }[] = [];
    const pool = Array.from({ length: MAX_CONCURRENT_UPLOADS }, async () => {
      while (tagged.length > 0) {
        const { file, kind, type } = tagged.shift()!;
        const result = await firstValueFrom(this.fileService.uploadFile(file, type));
        const url = result?.data?.url ?? result?.url ?? '';
        if (url) {
          results.push({ kind, url });
        }
      }
    });

    await Promise.all(pool);
    return results;
  }

  clearForm(): void {
    this.product.name = '';
    this.product.description = '';
    this.product.price = null;
    this.product.category = '';
    this.allFilesSubject$.next([]);
  }

  private patchUiState(patch: Partial<UiState>): void {
    this.uiStateSubject$.next({
      ...this.uiStateSubject$.value,
      ...patch,
    });
  }
}
