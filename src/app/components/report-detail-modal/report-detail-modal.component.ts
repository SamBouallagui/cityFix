import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { Reports, Report } from '../../services/reports';
import { Ui } from '../../services/ui';

import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonImg,IonBadge, IonSegment, IonSegmentButton, IonLabel,
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
    IonContent, IonImg,IonBadge, IonSegment, IonSegmentButton, IonLabel,
  ],
})

export class ReportDetailModalComponent {
  @Input() report!: Report;
  @Input() readOnly = false;
  private modalCtrl = inject(ModalController);
  private reportsService = inject(Reports);
  private ui = inject(Ui);
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
      error: async () => {
        // tell the user the update failed instead of failing silently
        await this.ui.showToast('Could not update status.', 'danger');
      },
    });
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
}
