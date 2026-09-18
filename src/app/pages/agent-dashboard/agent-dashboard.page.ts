import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Reports, Report } from '../../services/reports';
import { ModalController } from '@ionic/angular';
import { ReportDetailModalComponent } from '../../components/report-detail-modal/report-detail-modal.component';
import * as L from 'leaflet';

import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { Zones } from '../../services/zones'
addIcons({ logOutOutline });

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  templateUrl: './agent-dashboard.page.html',
  styleUrls: ['./agent-dashboard.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent],
})
export class AgentDashboardPage {
  private auth = inject(Auth);
  private reportsService = inject(Reports);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private zonesService = inject(Zones);
  private zonesLayer = L.layerGroup();

  @ViewChild('map') mapContainer?: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private markers: L.CircleMarker[] = [];
  // Called when the view is entered to load the reports
  ionViewDidEnter() {
    this.loadReports();
    this.loadZones();
  }

  private loadReports() {
    this.reportsService.getReports().subscribe({
      next: (data) => {
        if (!this.map) this.initMap();
        this.renderMarkers(data);
      },
      error: (err) => console.error('failed to load reports:', err),
    });
  }

  private initMap() {
      if (!this.mapContainer) return;

      this.map = L.map(this.mapContainer.nativeElement).setView([36.8, 10.18], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);
    }
    private loadZones() {
      if (!this.map) return;

      this.zonesService.getZones().subscribe({
        next: (zones) => {
          this.zonesLayer.clearLayers();

          zones.forEach((zone) => {
            const latLngs = zone.boundary.coordinates[0].map(
              ([lng, lat]) => [lat, lng] as L.LatLngTuple
            );

            const polygon = L.polygon(latLngs, {
              color: zone.color,
              weight: 2,
              fillColor: zone.color,
              fillOpacity: 0.15,
            });

            polygon.bindTooltip(
              `${zone.name}: ${zone.report_count} report${zone.report_count !== 1 ? 's' : ''}`,
              { sticky: true }
            );

            polygon.addTo(this.zonesLayer);
          });

          this.zonesLayer.addTo(this.map!);
        },
      });
    }
  private renderMarkers(reports: Report[]) {
      if (!this.map) return;

      //clears last markers to not stack every refresh
      this.markers.forEach((m) => m.remove());
      this.markers = [];

      const bounds: L.LatLngExpression[] = [];

      reports.forEach((report) => {
        const [lng, lat] = report.location.coordinates;

        const marker = L.circleMarker([lat, lng], {
          radius: 10,
          color: '#fff',
          weight: 2,
          fillColor: this.colorFor(report.status),
          fillOpacity: 1,
        }).addTo(this.map!);

        marker.bindTooltip(report.title, { direction: 'top' });
        marker.on('click', () => this.openReportDetail(report));

        this.markers.push(marker);
        bounds.push([lat, lng]);
      });

      if (bounds.length > 0) {
        // zooms to fit all markers on screen
        this.map.fitBounds(bounds as any, { padding: [40, 40] });
      }
    }

    private colorFor(status: string): string {
      switch (status) {
        case 'pending': return '#ffc409';
        case 'in_progress': return '#2563eb';
        case 'resolved': return '#2dd36f';
        default: return '#92949c';
      }
    }
    async openReportDetail(report: Report) {
        const modal = await this.modalCtrl.create({
          component: ReportDetailModalComponent,
          componentProps: { report },
          // between 0% and 90% width, with 60% as the initial size
          breakpoints: [0, 0.6, 0.9],
          initialBreakpoint: 0.6,
        });

        await modal.present();

        const { data } = await modal.onWillDismiss();
        if (data?.updated) {
          this.loadReports(); // refetch so the marker color reflects the new status
        }
    }
    async logout() {
        await this.auth.logout();
        this.router.navigateByUrl('/login');
    }
}
