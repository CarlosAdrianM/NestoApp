import { Injectable } from '@angular/core';
import { Geolocation as CapacitorGeolocation, Position } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class Geolocation {
  async getCurrentPosition(options?: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number }): Promise<Position> {
    try {
      await CapacitorGeolocation.requestPermissions();
    } catch {
      // ignore - getCurrentPosition will throw if still no permission
    }
    return CapacitorGeolocation.getCurrentPosition(options);
  }
}
