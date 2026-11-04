import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ApiStatus = 'checking' | 'connected' | 'offline';

@Injectable({ providedIn: 'root' })
export class ApiStatusService {
  private readonly statusSubject = new BehaviorSubject<ApiStatus>('checking');
  readonly status$ = this.statusSubject.asObservable();

  setStatus(status: ApiStatus): void {
    this.statusSubject.next(status);
  }
}
