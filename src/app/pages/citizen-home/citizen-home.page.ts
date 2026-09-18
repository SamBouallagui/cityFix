import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Reports, Report } from '../../services/reports';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonRefresher, IonRefresherContent,
  IonCard, IonCardContent, IonBadge, IonFab, IonFabButton,
  ModalController,
} from '@ionic/angular';
import { ReportDetailModalComponent } from '../../components/report-detail-modal/report-detail-modal.component';

import { addIcons } from 'ionicons';
import {
  logOutOutline, documentTextOutline, add,
  constructOutline, bulbOutline, trashOutline, alertCircleOutline,
} from 'ionicons/icons';
addIcons({ logOutOutline, documentTextOutline, add, constructOutline, bulbOutline, trashOutline, alertCircleOutline });
@Component({
  selector: 'app-citizen-home',
  templateUrl: './citizen-home.page.html',
  styleUrls: ['./citizen-home.page.scss'],
  imports: [
      CommonModule, RouterLink,
      IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
      IonContent, IonRefresher, IonRefresherContent,
      IonCard, IonCardContent, IonBadge, IonFab, IonFabButton,
    ]
})
export class CitizenHomePage {
  private auth = inject(Auth);
  private reportsService = inject(Reports);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private cdr = inject(ChangeDetectorRef);
  reports: Report[] = [];

  // Ionic lifecycle fires every time this tab becomes Visible

  ionViewWillEnter(){
    this.loadReports();
  }
  async openReport(report: Report) {
    const modal = await this.modalCtrl.create({
      component: ReportDetailModalComponent,
      componentProps: { report, readOnly: true },
      breakpoints: [0, 0.6, 0.9],
      initialBreakpoint: 0.6,
    });
    await modal.present();
  }
  loadReports(event?: any) {
    this.reportsService.getReports().subscribe({
      next: (data) => {
        //stops spinner after getting the data
        this.reports = data;
        event?.target.complete();

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('failed to load reports', err);
        event?.target.complete();
      },
    });
  }

  iconFor(category: string): string {
      switch (category) {
        case 'pothole': return 'construct-outline';
        case 'streetlight': return 'bulb-outline';
        case 'garbage': return 'trash-outline';
        default: return 'alert-circle-outline';
      }
  }

  badgeColor(status: string): string {
      switch (status) {
        case 'pending': return 'warning';
        case 'in_progress': return 'primary';
        case 'resolved': return 'success';
        default: return 'medium';
      }
    }
    statusLabel(status: string): string {
        switch (status) {
          case 'pending': return 'Pending';
          case 'in_progress': return 'In Progress';
          case 'resolved': return 'Resolved';
          default: return status;
        }
      }

    async logout() {
      await this.auth.logout();
      this.router.navigateByUrl('/login');
    }
}
