import { Injectable, inject } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class Ui {
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  // HTMLIonLoadingElement is the type for the loading elements properties
  private loadingElement: HTMLIonLoadingElement | null = null;

  async showLoading(message: string = 'Please wait...') {
    this.loadingElement = await this.loadingCtrl.create({ message });
    //presents the loading overlay after it's been created
    await this.loadingElement.present();
  }

  async hideLoading() {
    // dismisses the loading overlay if it exists
    await this.loadingElement?.dismiss();
    this.loadingElement = null;
  }
  //
  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
