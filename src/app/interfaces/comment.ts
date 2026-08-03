export interface CreateCommentRequest {
  productID: number;
  text: string;
  photoLinks: string[];
  videoLinks: string[];
}

export interface CommentResponse {
  username: string;
  productId: number;
  text: string;
  photoLinks: string[] | null;
  videoLinks: string[] | null;
  createdAt: string;
}

export interface GetCommentsResponse {
  comments: CommentResponse[];
  total: number;
}
