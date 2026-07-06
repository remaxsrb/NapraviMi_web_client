export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  images: string[];
  videos: string[];
  category: string;
}
