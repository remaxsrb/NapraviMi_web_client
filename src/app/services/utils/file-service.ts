import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../../env';

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

    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

}
