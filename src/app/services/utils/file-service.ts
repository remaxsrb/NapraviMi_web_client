import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  constructor(
    private http: HttpClient
  ) { }

  private apiUrl = 'http://localhost:8080/files';

   uploadFile(file:any) {

    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

}
