import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { Reports, Report } from '../../services/reports';

import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonImg, IonSegment, IonSegmentButton, IonLabel,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
addIcons({ closeOutline });

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  templateUrl: './report-detail-modal.component.html',
  styleUrls: ['./report-detail-modal.component.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonImg, IonSegment, IonSegmentButton, IonLabel,
  ],
})

export class ReportDetailModalComponent {
  @Input() report!: Report;
  private modalCtrl = inject(ModalController);
  private reportsService = inject(Reports);
  close() {
    this.modalCtrl.dismiss({ updated: false });
  }

  updateStatus(newStatus: string | number | undefined) {
    if (newStatus === undefined) return;

    const status = String(newStatus);
    if (status === this.report.status) return;

    this.reportsService.updateStatus(this.report.id, status).subscribe({
      next: (updated) => {
        this.report = updated;
        this.modalCtrl.dismiss({ updated: true });
      },
    });
  }
}
