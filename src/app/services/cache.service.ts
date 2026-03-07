import { Injectable, NgModule, ModuleWithProviders } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
  data: any;
  expiry: number;
  group?: string;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 60 * 60; // 1 hour in seconds

  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  loadFromObservable<T>(key: string, observable: Observable<T>, group?: string, ttl?: number): Observable<T> {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) {
      return of(entry.data as T);
    }
    return observable.pipe(
      tap(data => {
        this.cache.set(key, {
          data,
          expiry: Date.now() + (ttl || this.defaultTTL) * 1000,
          group
        });
      })
    );
  }

  clearGroup(group: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.group === group) {
        this.cache.delete(key);
      }
    }
  }
}

@NgModule({})
export class CacheModule {
  static forRoot(config?: { keyPrefix?: string }): ModuleWithProviders<CacheModule> {
    return {
      ngModule: CacheModule,
      providers: [CacheService]
    };
  }
}
