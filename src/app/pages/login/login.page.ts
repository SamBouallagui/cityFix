import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { IonCard, IonCardContent, IonIcon } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, location } from 'ionicons/icons';
import { Ui } from '../../services/ui';

addIcons({ mailOutline, lockClosedOutline, location });
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    IonContent, IonCard, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonText, IonIcon,
  ]})
export class LoginPage {
  private auth = inject(Auth);
  private router = inject(Router);
  email = '';
  password = '';
  errorMessage = '';
  private ui = inject(Ui);

  // if a session already exists, skip the login screen and jump straight to
  // the right dashboard (prevents getting dumped back to login on app restart)
  async ionViewWillEnter() {
    if (await this.auth.isLoggedIn()) {
      const user = await this.auth.getUser();
      this.router.navigateByUrl(
        user?.role === 'agent' ? '/agent-dashboard' : '/tabs/my-reports',
        { replaceUrl: true } // so the back button can't return to login
      );
    }
  }

  async onLogin() {
    this.errorMessage = '';
    await this.ui.showLoading('Logging in...');
    this.auth.login(this.email, this.password).subscribe({
      next: async(res) => {
        await this.ui.hideLoading();
        // redirect based on user role
        if (res.user.role === 'agent') {
          this.router.navigateByUrl('/agent-dashboard');
        } else {
              this.router.navigateByUrl('/tabs/my-reports');
          }
      },
      error: async(err) => {
        await this.ui.hideLoading();
        // err.error is the JSON body Express API sent back
        this.errorMessage = err.error?.error || 'Login failed. pplease try again.';
      },
    });
  }
}
