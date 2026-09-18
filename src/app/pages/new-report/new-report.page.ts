import { Component, inject,ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Reports } from '../../services/reports';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Camera} from '@capacitor/camera';

import { addIcons } from 'ionicons';
import { locateOutline, cameraOutline } from 'ionicons/icons';
import { Ui } from '../../services/ui';

import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonItem, IonLabel, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonButton, IonIcon, IonImg,
  IonSpinner, IonText,  ActionSheetController
} from '@ionic/angular';

addIcons({ locateOutline, cameraOutline });

@Component({
  selector: 'app-new-report',
  standalone: true,
  templateUrl: './new-report.page.html',
  styleUrls: ['./new-report.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonItem, IonLabel, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonButton, IonIcon, IonImg,
    IonSpinner, IonText,
  ],
})
export class NewReportPage {
  private reportsService = inject(Reports);
  private router = inject(Router);
  private actionSheetCtrl = inject(ActionSheetController);
  title = '';
  category = '';
  description = '';
  location: { lat: number; lng: number } | null = null;
  photoDataUrl: string | null = null;
  submitting = false;
  errorMessage = '';
  @ViewChild('locationMap') mapContainer?: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;

  //captures the user's location and asks for permission first time
  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      //wait for the map container to be available before rendering
      setTimeout(() => this.renderMap(), 0);
    } catch (err) {
      this.errorMessage = 'problem getting location, allow access';
    }
  }
  private marker: L.Marker | null = null;
  private renderMap() {
    if (!this.location || !this.mapContainer) return;
    const { lat, lng } = this.location;

    if (!this.map) {
      this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 16);


      // OpenStreetMap's free map data
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      // problem with icon so i used the original leaflet icon
      const pin = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      this.marker = L.marker([lat, lng], { icon: pin, draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
            const pos = this.marker!.getLatLng();
            this.location = { lat: pos.lat, lng: pos.lng };
          });

          // tapping amywhere else on the map moves the pin there
          this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.marker!.setLatLng(e.latlng);
            this.location = { lat: e.latlng.lat, lng: e.latlng.lng };
          });
        } else {
          this.map.setView([lat, lng], 16);
          this.marker?.setLatLng([lat, lng]);
        }
      }

  //creates choise between taking camera photo and choosing from galery because the camera api doesnt offer chice
  async takePhoto() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Add a photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => this.capturePhoto('camera'),
        },
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => this.capturePhoto('gallery'),
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private async capturePhoto(mode: 'camera' | 'gallery') {
    try {
      let webPath: string | undefined;

      if (mode === 'camera') {
        const result = await Camera.takePhoto({ quality: 70 });
        webPath = result.webPath;
      } else {
        // picks first photo even from array of multiple selection
        const { results } = await Camera.chooseFromGallery({ quality: 70 });
        webPath = results[0]?.webPath;
      }

      if (!webPath) return;

      // accounts for both camera and gallery modes
      const response = await fetch(webPath);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        this.photoDataUrl = reader.result as string;
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      // user backed out of the camera/gallery picker
    }
  }
  private ui = inject(Ui);
  async submit() {
    this.errorMessage = '';

    if (!this.title || !this.category) {
      this.errorMessage = 'Please fill in a title and category.';
      return;
    }
    if (!this.location) {
      this.errorMessage = 'Please capture your location before submitting.';
      return;
    }
    this.submitting = true;
    await this.ui.showLoading('Submitting report...');
    //create report and
    this.reportsService.createReport({
      title: this.title,
      description: this.description,
      category: this.category,
      latitude: this.location.lat,
      longitude: this.location.lng,
      photoUrl: this.photoDataUrl ?? undefined,
    }).subscribe({
      next: async () => {
        await this.ui.hideLoading();
        await this.ui.showToast('Report submitted successfully!', 'success');
        this.router.navigateByUrl('/tabs/my-reports');
      },
      error: async (err) => {
        await this.ui.hideLoading();
        this.submitting = false;
        this.errorMessage = err.error?.error || 'Could not submit report.';
      },
    });
  }
}
