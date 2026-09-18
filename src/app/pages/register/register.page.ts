import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Ui } from '../../services/ui';

import { addIcons } from 'ionicons';
import { personAdd, personOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
} from '@ionic/angular';

addIcons({ personAdd, personOutline, mailOutline, lockClosedOutline });

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    IonContent, IonCard, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon,
  ],
})
export class RegisterPage {
  private auth = inject(Auth);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  private ui = inject(Ui);
  async onRegister() {
    this.errorMessage = '';

    // fields validation before the API
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    await this.ui.showLoading('Creating your account...');

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: async () => {
            await this.ui.hideLoading();
            await this.ui.showToast('Account created! Please log in.', 'success');
            this.router.navigateByUrl('/login');
          },
          error: async (err) => {
            await this.ui.hideLoading();
            this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
          },
        });
    }
}
