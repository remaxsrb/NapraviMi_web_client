import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private http: HttpClient
  ) { }

  private apiUrl = 'http://localhost:8080/api/files';

   uploadFile(file:File, purpose: string) {

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('purpose', purpose);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

}
