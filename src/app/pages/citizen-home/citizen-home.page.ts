import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Reports, Report } from '../../services/reports';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonRefresher, IonRefresherContent,
  IonCard, IonCardContent, IonBadge, IonFab, IonFabButton,
} from '@ionic/angular';
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
export class CitizenHomePage implements OnInit {
  private auth = inject(Auth);
  private reportsService = inject(Reports);
  private router = inject(Router);

  reports: Report[] = [];

  ngOnInit(){
    this.loadReports();
  }

  loadReports(event?: any) {
    this.reportsService.getReports().subscribe({
      next: (data) => {
        //stops spinner after getting the data
        this.reports = data;
        event?.target.complete();
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
