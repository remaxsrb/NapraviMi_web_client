export interface Craft {
  id: number;
  name: string;
  Keywords: string[];
  SearchKeywords: string[];
}

export interface CraftOption {
  label: string;
  value: string;
  keywords: string[];
}
