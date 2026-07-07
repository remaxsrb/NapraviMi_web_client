import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_BASE_URL } from '../../env';
import { unwrapEnvelope } from './response-envelope';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private http: HttpClient
  ) { }

  private apiUrl = `${API_BASE_URL}/files`;

   uploadFile(file:File, purpose: string) {

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('purpose', purpose);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData).pipe(map(unwrapEnvelope));
  }

}
