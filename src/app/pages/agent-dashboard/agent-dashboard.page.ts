import { Component, inject, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Reports, Report } from '../../services/reports';
import { ModalController, AlertController } from '@ionic/angular';
import { ReportDetailModalComponent } from '../../components/report-detail-modal/report-detail-modal.component';
import * as L from 'leaflet';
// Leaflet.draw plugin: provides the drag-to-draw polygon tool (npm i leaflet-draw).
// NOTE: its stylesheet only styles the optional toolbar UI and references sprite
// PNGs that this bundler can't inline, so we skip it -- drawing works without it.
import 'leaflet-draw';
import { Ui } from '../../services/ui';
import { IonSegment, IonSegmentButton, IonLabel,IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline, addCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { Zones } from '../../services/zones'
addIcons({ logOutOutline, addCircleOutline, closeCircleOutline });

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  templateUrl: './agent-dashboard.page.html',
  styleUrls: ['./agent-dashboard.page.scss'],
  imports: [IonSegment, IonSegmentButton, IonLabel,IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent],
})
export class AgentDashboardPage {
  private auth = inject(Auth);
  private reportsService = inject(Reports);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private zonesService = inject(Zones);
  private zonesLayer = L.layerGroup();
  private ui = inject(Ui);
  private ngZone = inject(NgZone);

  @ViewChild('map') mapContainer?: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;
  private markers: L.CircleMarker[] = [];
  private fitted = false;
  private allReports: Report[] = []; // the full unfiltered set,so switching the filter doesn't need refetch
  selectedCategory = 'all';
  statusCounts = { pending: 0, in_progress: 0, resolved: 0 };

  // ---------- zone drawing state ----------
  drawingZone = false;            // public: the template button shows its state
  private drawnLayer: L.Polygon | null = null;
  private highlightLayer = L.layerGroup(); // holds the red markers during analysis

  // Called when the view is entered to load the reports.
  // Zones load right after the reports (inside loadReports().next) so the map
  // exists before we try to draw/analyze on it -- no duplicate loadZones here.
  ionViewDidEnter() {
    this.loadReports();
  }

  private loadReports() {
    this.reportsService.getReports().subscribe({
      next: (data) => {
        this.allReports = data;
        if (!this.map) this.initMap();
        this.applyFilter();
        this.loadZones();
      },
      error: async () => {
        await this.ui.showToast('Could not load reports.', 'danger');
      },
    });
  }

  onCategoryChange(category: string | number | undefined) {
    if (category === undefined) return;
    this.selectedCategory = String(category);
    this.applyFilter();
  }

  private applyFilter() {
    const filtered = this.selectedCategory === 'all'
      ? this.allReports
      : this.allReports.filter((r) => r.category === this.selectedCategory);

    this.renderMarkers(filtered);
    this.updateStatusCounts(filtered);
  }


  private updateStatusCounts(reports: Report[]) {
    this.statusCounts = {
      pending: reports.filter((r) => r.status === 'pending').length,
      in_progress: reports.filter((r) => r.status === 'in_progress').length,
      resolved: reports.filter((r) => r.status === 'resolved').length,
    };
  }

  private initMap() {
      if (!this.mapContainer) return;

      this.map = L.map(this.mapContainer.nativeElement, { zoomControl: false }).setView([36.8, 10.18], 12);
      L.control.zoom({ position: 'bottomright' }).addTo(this.map);

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

            // clicking a zone polygon runs the "analyze points inside this zone" feature
            polygon.on('click', () => this.analyzeZone(zone.id, zone.name));

            polygon.addTo(this.zonesLayer);
          });

          this.zonesLayer.addTo(this.map!);
        },
        error: async () => {
          await this.ui.showToast('Could not load zones.', 'danger');
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

          const coords = report.location?.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) return;

          const [lng, lat] = coords;
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

      if (bounds.length > 0 && !this.fitted) {
        // zooms to fit all markers on screen, once
        this.fitted = true;
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
        await modal.onWillDismiss();

        this.loadReports();
    }

    // ---------- Zone drawing (Leaflet.draw) ----------
    toggleDraw() {
      if (!this.map) return;
      this.drawingZone = !this.drawingZone;

      if (!this.drawingZone) {
        // second click = cancel any in-progress polygon
        this.drawnLayer?.remove();
        this.drawnLayer = null;
        return;
      }

      // activate Leaflet.draw's polygon tool
      const draw = new L.Draw.Polygon(this.map as L.DrawMap, {
        shapeOptions: { color: '#dc2626', weight: 2, fillOpacity: 0.2 },
      });
      draw.enable();


      this.map!.once(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer as L.Polygon;          // the freshly drawn polygon
        const boundary = layer.toGeoJSON().geometry; // GeoJSON Polygon for the API

        this.ngZone.run(async () => {
          this.drawingZone = false;
          const name = await this.promptZoneName();
          if (name) await this.saveZone(name, boundary);
          else layer.remove(); // cancelled: don't leave a stray polygon on the map
        });
      });
    }

    // small input alert to name the zone before saving it
    private async promptZoneName(): Promise<string | null> {
      const alert = await this.alertCtrl.create({
        header: 'Save zone',
        inputs: [{ name: 'name', type: 'text', placeholder: 'Zone name (e.g. Tunis Centre)' }],
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Save',
            handler: (inputs: any) => {
              const name = (inputs?.name ?? '').trim();
              if (!name) return false; // keep the alert open if the name is empty
              return { name };         // becomes alert.data when the alert dismisses
            },
          },
        ],
      });
      await alert.present();
      const { data } = await alert.onDidDismiss();
      return data?.name ? String(data.name).trim() : null;
    }

    // POST the drawn polygon to the API, then refresh the zone layer
    private saveZone(name: string, boundary: any) {
      this.zonesService.createZone({ name, color: '#dc2626', boundary }).subscribe({
        next: async () => {
          await this.ui.showToast('Zone saved.', 'success');
          this.loadZones(); // re-fetch zones so the new polygon appears
        },
        error: async () => {
          await this.ui.showToast('Could not save zone.', 'danger');
        },
      });
    }


    // Fetch the reports inside a zone
    private analyzeZone(zoneId: number, zoneName: string) {
      this.zonesService.getZoneReports(zoneId).subscribe({
        next: async (reports) => this.renderZoneAnalysis(zoneName, reports),
        error: async () => {
          await this.ui.showToast('Could not analyze zone.', 'danger');
        },
      });
    }

    private async renderZoneAnalysis(zoneName: string, reports: Report[]) {
      // clear the previous analysis markers
      this.highlightLayer.clearLayers();
      this.highlightLayer.addTo(this.map!);

      // red markers for each report located inside the selected zone
      reports.forEach((r) => {
        const [lng, lat] = r.location.coordinates;
        const marker = L.circleMarker([lat, lng], {
          radius: 10,
          color: '#fff',
          weight: 2,
          fillColor: '#dc2626',
          fillOpacity: 1,
        }).addTo(this.highlightLayer);
        marker.bindTooltip(r.title);
      });

      const titles = reports.map((r) => r.title).join('\n') || 'No reports inside this zone yet.';
      const alert = await this.alertCtrl.create({
        header: `${zoneName} — ${reports.length} report${reports.length === 1 ? '' : 's'}`,
        message: titles,
        buttons: ['OK'],
      });
      await alert.present();
    }

    async logout() {
        await this.auth.logout();
        this.router.navigateByUrl('/login');
    }
}
