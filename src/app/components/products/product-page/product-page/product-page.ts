import { Component, inject, isDevMode, OnInit, signal } from '@angular/core';import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product/product-service';
import { AuthService } from '../../../../services/utils/auth-service';
import { Product } from '../../../../models/product';
import { Header } from '../../../common/header/header/header';
import { CartService } from '../../../../services/cart/cart-service';
import { User } from '../../../../models/user';
import { firstValueFrom, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RatingResponse } from '../../../../interfaces/rating';
import { extractErrorMessage } from '../../../../services/utils/response-envelope';
import { ProductCommentService } from '../../../../services/product-comment/product-comment-service';
import { FileService } from '../../../../services/utils/file-service';
import { CommentResponse, CreateCommentRequest } from '../../../../interfaces/comment';

interface ProductPageState {
  product: Product | null;
  isLoading: boolean;
  isOwner: boolean;
  isCustomer: boolean;
}

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ImageModule,
    RatingModule,
    ButtonModule,
    TextareaModule,
    PaginatorModule,
    Header,
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.css',
})
export class ProductPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private productCommentService = inject(ProductCommentService);
  private fileService = inject(FileService);

  readonly state$: Observable<ProductPageState> = this.buildState();

  ratingValue: number = 0;
  readonly hasRated = signal<boolean>(false);
  readonly ratingError = signal<string>('');
  readonly ratingSuccess = signal<boolean>(false);

  readonly COMMENTS_PAGE_SIZE = 5;

  readonly comments = signal<CommentResponse[]>([]);
  readonly commentsLoading = signal<boolean>(false);
  readonly commentsTotal = signal<number>(0);
  readonly commentsPage = signal<number>(1);

  commentText: string = '';
  readonly commentFiles = signal<File[]>([]);
  readonly isSubmittingComment = signal<boolean>(false);
  readonly commentError = signal<string>('');
  readonly commentSuccess = signal<boolean>(false);

  private productId: number | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productId = id;
      this.loadComments(1);
    }
  }

  onCommentsPageChange(event: PaginatorState): void {
    const rows = event.rows ?? this.COMMENTS_PAGE_SIZE;
    const page = Math.floor((event.first ?? 0) / rows) + 1;
    this.loadComments(page);
  }

  onRateProduct(product: Product): void {
    if (!product || !this.ratingValue) return;

    this.ratingSuccess.set(false);

    this.productService.rate(product.id!, this.ratingValue).subscribe({
      next: (response: RatingResponse) => {
        product.rating = response.averageRating;
        product.numberOfRatings = response.numberOfRatings;
        this.productService.setPreviewProduct(product);
        this.ratingError.set('');
        this.hasRated.set(true);
        this.ratingSuccess.set(true);
      },
      error: (error: any) => {
        this.ratingError.set(extractErrorMessage(error, 'Дошло је до грешке приликом оцењивања производа.'));
      },
    });
  }

  onCommentFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const incoming = Array.from(input.files ?? []).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    this.commentFiles.set([...this.commentFiles(), ...incoming]);
    input.value = '';
  }

  removeCommentFile(index: number): void {
    this.commentFiles.set(this.commentFiles().filter((_, i) => i !== index));
  }

  async onSubmitComment(product: Product): Promise<void> {
    if (!product || !this.commentText.trim()) return;

    this.isSubmittingComment.set(true);
    this.commentError.set('');
    this.commentSuccess.set(false);

    try {
      const { photoLinks, videoLinks } = await this.uploadCommentFiles(this.commentFiles());

      const request: CreateCommentRequest = {
        productID: product.id!,
        text: this.commentText.trim(),
        photoLinks,
        videoLinks,
      };

      await firstValueFrom(this.productCommentService.create(request));

      this.commentText = '';
      this.commentFiles.set([]);
      this.commentSuccess.set(true);
      this.loadComments(1);
    } catch (error) {
      this.commentError.set(
        extractErrorMessage(error, 'Дошло је до грешке приликом додавања коментара.'),
      );
    } finally {
      this.isSubmittingComment.set(false);
    }
  }

  private async uploadCommentFiles(
    files: File[],
  ): Promise<{ photoLinks: string[]; videoLinks: string[] }> {
    const photoLinks: string[] = [];
    const videoLinks: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const purpose = isImage ? 'product_comment_photo' : 'product_comment_video';
      const result = await firstValueFrom(this.fileService.uploadFile(file, purpose));
      const url = result?.data?.url ?? result?.url ?? '';
      if (!url) continue;
      if (isImage) {
        photoLinks.push(url);
      } else {
        videoLinks.push(url);
      }
    }

    return { photoLinks, videoLinks };
  }

  private loadComments(page: number): void {
    if (!this.productId) return;

    this.commentsLoading.set(true);
    const skip = (page - 1) * this.COMMENTS_PAGE_SIZE;

    this.productCommentService.getByProduct(this.productId, skip, this.COMMENTS_PAGE_SIZE).subscribe({
      next: (response) => {
        this.comments.set(response?.comments ?? []);
        this.commentsTotal.set(response?.total ?? 0);
        this.commentsPage.set(page);
        this.commentsLoading.set(false);
      },
      error: () => {
        this.commentsLoading.set(false);
      },
    });
  }

  mediaUrl(url: string): string {
    if (!url) {
      return '';
    }
    // In development the backend may return media URLs without a scheme
    // (e.g. "localhost:8080/api/...") which the browser rejects with
    // ERR_UNKNOWN_URL_SCHEME. Prefix a protocol-relative scheme so it resolves
    // against the current page protocol.
    if (
      isDevMode() &&
      !/^https?:\/\//i.test(url) &&
      !url.startsWith('//') &&
      !url.startsWith('/')
    ) {
      return `//${url}`;
    }
    return url;
  }

  addToCart(): void {
    const cachedProduct = this.productService.getPreviewProduct();
    if (!cachedProduct) return;

    const payload = {
      cart_id: Number(this.authService.get_id()),
      product_id: cachedProduct.id,
      quantity: 1,
    };

    this.cartService.addToCart(payload).subscribe({
      next: (cart: any) => {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) return;

        const user: User = JSON.parse(userDataString);
        user.cart = cart;
        localStorage.setItem('userData', JSON.stringify(user));
      },
    });
  }

  deleteProduct(): void {
    const cachedProduct = this.productService.getPreviewProduct();
    if (!cachedProduct) return;

    this.productService.delete(cachedProduct.id!).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => {},
    });
  }

  private buildState(): Observable<ProductPageState> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const cachedProduct = this.productService.getPreviewProduct();
    const isCustomer = this.authService.get_role() === 'user';

    if (!id || !cachedProduct) {
      this.router.navigate(['/']);
      return new Observable((observer) => {
        observer.next({
          product: null,
          isLoading: false,
          isOwner: false,
          isCustomer,
        });
      });
    }

    const isOwner =
      this.authService.get_role() === 'craftsman' &&
      Number(this.authService.get_craftsman_id()) === cachedProduct.craftsmanID;

    return new Observable((observer) => {
      observer.next({
        product: cachedProduct,
        isLoading: false,
        isOwner,
        isCustomer,
      });
      observer.complete();
    });
  }
}
