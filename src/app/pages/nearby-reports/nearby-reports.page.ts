import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Reports } from '../../services/reports';
import { Ui } from '../../services/ui';
import { NearbyReport } from '../../services/reports';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRange, IonLabel, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { navigateOutline } from 'ionicons/icons';
addIcons({ navigateOutline });

@Component({
  selector: 'app-nearby-reports',
  standalone: true,
  templateUrl: './nearby-reports.page.html',
  styleUrls: ['./nearby-reports.page.scss'],
  imports: [CommonModule,FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRange, IonLabel, IonIcon],
})
export class NearbyReportsPage {
  private reportsService = inject(Reports);
  private ui = inject(Ui);

  @ViewChild('map') mapContainer?: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private markers: L.CircleMarker[] = [];

  radiusKm = 2;
  reports: NearbyReport[] = [];
  loaded = false;
  private myLocation: { lat: number; lng: number } | null = null;

  // Fires every time this tab becomes visibl
  async ionViewDidEnter() {
    if (!this.myLocation) await this.getMyLocation();
    if (!this.map) {
      this.initMap();
    } else {
      setTimeout(() => this.map?.invalidateSize(), 100);
    }
    this.loadNearby();
  }

  private async getMyLocation() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      this.myLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      await this.ui.showToast('Could not get your location.', 'danger');
    }
  }

  private initMap() {
    if (!this.mapContainer || !this.myLocation) return;
    this.map = L.map(this.mapContainer.nativeElement).setView([this.myLocation.lat, this.myLocation.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  loadNearby() {
    if (!this.myLocation) return;
    const radiusMeters = this.radiusKm * 1000;

    this.reportsService.getNearby(this.myLocation.lat, this.myLocation.lng, radiusMeters).subscribe({
      next: async (data) => {
        this.reports = data;
        this.loaded = true;
        this.renderMarkers();

        if (data.length === 0) {
          await this.ui.showToast('No reports found nearby. Try a larger radius.', 'warning');
        } else {
          await this.ui.showToast(
            `${data.length} report${data.length > 1 ? 's' : ''} found nearby.`,
            'success'
          );
        }
      },
      error: async () => {
        await this.ui.showToast('Could not load nearby reports.', 'danger');
      },
    });
  }

  private renderMarkers() {
    if (!this.map) return;
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const bounds = L.latLngBounds([]); // empty bounds, extended with each report

    this.reports.forEach((r) => {
      const marker = L.circleMarker([r.latitude, r.longitude], {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: '#2563eb',
        fillOpacity: 1,
      }).addTo(this.map!);

      marker.bindPopup(`<strong>${r.title}</strong><br>${Math.round(r.distance_meters)}m away`);
      this.markers.push(marker);
      bounds.extend([r.latitude, r.longitude]); // add this report to the autozoom range
    });

    if (this.reports.length > 0) {

      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (this.myLocation) {
      // no reports in range: stay centered on the user
      this.map.setView([this.myLocation.lat, this.myLocation.lng], 13);
    }
  }
}
