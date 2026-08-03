import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../env';
import { unwrapEnvelope } from '../utils/response-envelope';
import { CreateCommentRequest, GetCommentsResponse } from '../../interfaces/comment';

@Injectable({
  providedIn: 'root',
})
export class ProductCommentService {
  private apiUrl = `${API_BASE_URL}/products/comment`;

  constructor(private http: HttpClient) {}

  create(data: CreateCommentRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data).pipe(map(unwrapEnvelope));
  }

  getByProduct(productID: number, skip: number, limit: number): Observable<GetCommentsResponse> {
    return this.http
      .get<any>(`${this.apiUrl}/${productID}?skip=${skip}&limit=${limit}`)
      .pipe(map(unwrapEnvelope));
  }
}
