import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CraftsmanService {

  private apiUrl = 'http://localhost:8080/craftsman';

  constructor(private http: HttpClient) {}


  createCraftsman(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  }


}
