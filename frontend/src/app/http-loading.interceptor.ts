import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { ApiStatusService } from './api-status.service';
import { HttpLoadingService } from './http-loading.service';

export const httpLoadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loading = inject(HttpLoadingService);
  const apiStatus = inject(ApiStatusService);
  loading.startRequest();

  return next(request).pipe(
    tap(() => apiStatus.setStatus('connected')),
    catchError(error => {
      apiStatus.setStatus('offline');
      return throwError(() => error);
    }),
    finalize(() => loading.finishRequest())
  );
};
