import { HttpInterceptorFn } from "@angular/common/http";
import { from, switchMap } from "rxjs";
import { Storage } from "@ionic/storage-angular";
import { inject } from "@angular/core";

// Interceptor to add Authorization header with Bearer token from Storage before calling next
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  //sotrage.get returns promize but interceptor returns observable so i use from() to convert it
  return from(storage.get('token')).pipe(
    switchMap((token) => {
      if (token) {
        // Clone the request and set the Authorization header because we cant modify the original request
        const cloned = req.clone({
          setHeaders:{Authorization: `Bearer ${token}`}
        })
        return next(cloned);
      }
      //if no token, return the original request
      return next(req);
    })
  )

};
