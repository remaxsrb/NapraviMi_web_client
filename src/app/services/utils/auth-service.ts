import { Injectable } from '@angular/core';
import { UserService } from '../user/user-service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly TOKEN_KEY = 'authToken';

  private authState$: BehaviorSubject<boolean>;
  readonly authChanged$;

  constructor(
    private router: Router,
    private userService: UserService,
    private jwtHelper: JwtHelperService,
  ) {
    this.authState$ = new BehaviorSubject<boolean>(this.is_LoggedIn());
    this.authChanged$ = this.authState$.asObservable();
  }

  login(loginData: any) {
    return this.userService.login(loginData);
  }

  setSession(token: string, userData: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('userData', JSON.stringify(userData));
    this.authState$.next(true);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('userData');
    this.authState$.next(false);
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
    return decodedToken.uid ?? decodedToken.sub ?? '';
  }

  get_craftsman_id(): string {
    const token = this.get_token();
    if (!token) return '';
    const decodedToken = this.decode_token(token);
    return decodedToken.craftsman_id ?? '';
  }

  decode_token(token: string): any {
    return this.jwtHelper.decodeToken(token);
  }
}
