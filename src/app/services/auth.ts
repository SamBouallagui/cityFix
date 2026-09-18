import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable, tap } from 'rxjs';
import { inject } from '@angular/core';
//describe the shape of the auth response
export interface AuthResponse{
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'citizen' | 'agent';
  };
}
//just one instance available across the app
@Injectable({providedIn: 'root'})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';
  private storageInstance: Storage | null = null;
  private storageReady: Promise<void>;
  private http = inject(HttpClient);
  private storage = inject(Storage);
  constructor() {
      this.storageReady = this.initStorage();
    }
  //initialize ionic storage
  private async initStorage() {
    this.storageInstance = await this.storage.create();
  }
  register(name:string,email:string,password:string):Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }
  login(email:string,password:string):Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      //saves the token without modifying the data
      tap((res) => {
              // wait for storage before writing
              this.storageReady.then(() => {
                this.storageInstance?.set('token', res.token);
                this.storageInstance?.set('user', res.user);
              });
            })
          );
        }
  async logout() {
    await this.storageInstance?.remove('token');
    await this.storageInstance?.remove('user');
  }
  async getToken(): Promise<string | null> {
    await this.storageReady;
    return (await this.storageInstance?.get('token'))??null;
  }
  async getUser(): Promise<any | null> {
    await this.storageReady;
    return (await this.storageInstance?.get('user'))??null;
  }
  async isLoggedIn(): Promise<boolean>{
    const token = await this.getToken();
    return !!token;
  }
}
