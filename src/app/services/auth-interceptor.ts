import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { inject } from '@angular/core';

// Interceptor to add Authorization header with Bearer token from Storage before calling next
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(Storage);
  //storage.get returns a promise but the interceptor returns an observable, so from() converts it
  return from(storage.get('token')).pipe(
    switchMap((token) => {
      const cloned = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(cloned).pipe(
        catchError((error) => {
          if (error.status === 401) {
            // clear the stale session; the calling code still receives the error and can react
            storage.remove('token');
            storage.remove('user');
          }
          //rethrow error so the original calling code sees it too
          return throwError(() => error);
        })
      );
    })
  );
};