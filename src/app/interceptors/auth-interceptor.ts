import { HttpInterceptorFn } from '@angular/common/http';

const publicEndpoints = ['/users/login', '/users/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('authToken');
  const isPublic = publicEndpoints.some((url) => req.url.endsWith(url));

  if (!authToken || isPublic) {
    return next(req);
  }

  return next(
    req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    }),
  );
};
