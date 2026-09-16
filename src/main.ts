import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { authInterceptor } from './app/services/auth-interceptor';

//for dependencies injection
bootstrapApplication(AppComponent, {
  //provider is anthing can be injected with angulars dependency injection when used in constructors
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    //registers ionic angular services and web componenets
    provideIonicAngular(),
    //registers the router using route list in app.route.ts, preload means all modules will be preloaded in bakcground
    //with componentinputbinding allows dynamic router paramaters like :id
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    //this is how to import an old angular module in standalone app and set it up globally
    importProvidersFrom(IonicStorageModule.forRoot()),
    //provides http client globally for making http requests
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
