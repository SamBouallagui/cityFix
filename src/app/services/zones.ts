import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Report } from './reports';

export interface Zone {
  id: number;
  name: string;
  color: string;
  boundary: { type: string; coordinates: number[][][] }; // GeoJSON Polygon
  report_count: number;
}

@Injectable({ providedIn: 'root' })
export class Zones {
  private apiUrl = `${environment.apiUrl}/zones`;
  private http = inject(HttpClient);

  getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.apiUrl);
  }

  // POST /api/zones (agents only)
  createZone(data: { name: string; color: string; boundary: any }): Observable<Zone> {
    return this.http.post<Zone>(this.apiUrl, data);
  }

  // GET /api/zones/:id/reports -- every report located inside that zone
  getZoneReports(zoneId: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/${zoneId}/reports`);
  }
}
