import { Injectable,inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../environments/environment';

//model for report data
export interface Report {
  id: number;
  title: string;
  description: string;
  category: 'pothole' | 'streetlight' | 'garbage' | 'other';
  status: 'pending' | 'in_progress' | 'resolved';
  photoUrl: string | null;
  createdAt: string;
  location: { type: string; coordinates: [number, number] };
  reporter?: { id: number; name: string; email: string };
}
export interface NearbyReport {
  id: number;
  title: string;
  description: string | null;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
}
@Injectable({ providedIn: 'root' })
export class Reports{
  private apiUrl = `${environment.apiUrl}/reports`;
  private http = inject(HttpClient);
  //auth interceptor attached JWT automatically
  getReports(): Observable<Report[]>{
    return this.http.get<Report[]>(this.apiUrl);
  }

  createReport(data: {
    title: string;
    description?: string;
    category: string;
    latitude: number;
    longitude: number;
    photoUrl?: string; // base64 data URL
  }): Observable<Report>{
    return this.http.post<Report>(this.apiUrl, data);
  }

  updateStatus(id: number, status: string): Observable<Report> {
      return this.http.patch<Report>(`${this.apiUrl}/${id}/status`, { status });
  }

  getNearby(lat: number, lng: number, radiusMeters: number): Observable<NearbyReport[]> {
    return this.http.get<NearbyReport[]>(`${this.apiUrl}/nearby`, {
      params: { lat: lat.toString(), lng: lng.toString(), radius: radiusMeters.toString() },
    });
  }
}
