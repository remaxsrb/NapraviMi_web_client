export interface ProductCategory {
  id: number;
  name: string;
  Keywords: string[];
  SearchKeywords: string[];
}

export interface ProductCategoryOption {
  label: string;
  value: string;
  keywords: string[];
}
