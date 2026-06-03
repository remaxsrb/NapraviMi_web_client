import { HttpInterceptorFn } from '@angular/common/http';


export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authToken = localStorage.getItem('authToken');

    const url = req.url;

    const isRoleRequest = url.includes('/admin') || url.includes('/craftsman') || url.includes('/user');

   if (authToken && isRoleRequest) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`),
      });
      return next(cloned);
    } else {
      return next(req);
    }

};
