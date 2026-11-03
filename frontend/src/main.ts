import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { httpLoadingInterceptor } from './app/http-loading.interceptor';
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([httpLoadingInterceptor]))]
}).catch(console.error);
