import { Injectable } from '@angular/core';
import { UserService } from '../user/user-service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly TOKEN_KEY = 'authToken';

  constructor(
    private router: Router,
    private userService: UserService,
    private jwtHelper: JwtHelperService,
  ) {}

  login(loginData: any) {
    return this.userService.login(loginData);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('userData');
    this.router.navigate(['']);
  }

    is_LoggedIn(): boolean {
    const token = this.get_token();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  get_token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get_role(): string {
    const token = this.get_token();
    if (!token) return '';
    const decodedToken = this.decode_token(token);
    return decodedToken.role;
  }

  get_id(): string {
    const token = this.get_token();
    if (!token) return '';
    const decodedToken = this.decode_token(token);
    return decodedToken.id ?? decodedToken.sub ?? '';
  }

  decode_token(token: string): any {
    return this.jwtHelper.decodeToken(token);
  }
}
