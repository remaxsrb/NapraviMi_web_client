import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8080/users';


  register(user: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/register`,
      user,
    );
  }

    login(user: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/login`,
      user,
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/change-password`,
      data
    );
  }

  applyForCraftsman(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/apply-for-craftsman`,
      data
    );
  }

}
