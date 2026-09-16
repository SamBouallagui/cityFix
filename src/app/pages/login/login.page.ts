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

  onLogin() {
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        // redirect based on user role
        if (res.user.role === 'agent') {
          this.router.navigateByUrl('/agent-dashboard');
        } else {
          this.router.navigateByUrl('/citizen-home');
        }
      },
      error: (err) => {
        // err.error is the JSON body Express API sent back
        this.errorMessage = err.error?.error || 'Login failed. pplease try again.';
      },
    });
  }
}
