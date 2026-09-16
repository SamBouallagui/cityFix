import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, tap } from 'rxjs';

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

  constructor(private http: HttpClient, private storage: Storage) {
    this.initStorage();
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
        this.storageInstance?.set('token', res.token);
        this.storageInstance?.set('user', res.user);
      })
    );
  }
  async logout() {
    await this.storageInstance?.remove('token');
    await this.storageInstance?.remove('user');
  }
  async getToken(): Promise<string | null> {
    return (await this.storageInstance?.get('token'))??null;
  }
  async getUser(): Promise<any | null> {
    return (await this.storageInstance?.get('user'))??null;
  }
  async isLoggedIn(): Promise<boolean>{
    const token = await this.getToken();
    return !!token;
  }
}
