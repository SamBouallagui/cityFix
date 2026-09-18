import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Zone {
  id: number;
  name: string;
  color: string;
  boundary: { type: string; coordinates: number[][][] }; // GeoJSON Polygon
  report_count: number;
}

@Injectable({ providedIn: 'root' })
export class Zones {
  private apiUrl = 'http://localhost:3000/api/zones';
  private http = inject(HttpClient);

  getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.apiUrl);
  }
}
