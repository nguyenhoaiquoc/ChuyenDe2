export interface ProductResponseDto {
  id: number;
  image: string | null;
  name: string;
  price: string;
  location: string;
  time: string;
  tag: string;
  category: string | null;
  subCategory: {
    id: number | null;
    name: string | null;
    source_table: string | null;
    source_detail: any;
  };
  condition: string;
  imageCount: number;
  isFavorite: boolean;
}
