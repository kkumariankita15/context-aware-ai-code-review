import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { HttpLoadingService } from './http-loading.service';

export const httpLoadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loading = inject(HttpLoadingService);
  loading.startRequest();

  return next(request).pipe(finalize(() => loading.finishRequest()));
};
