import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AppLayout } from './layout/app-layout/app-layout';
import { StatusBadge } from './shared/components/status-badge/status-badge';
import { ReleasesList } from './pages/releases-list/releases-list';
import { ReleasesForm } from './pages/releases-form/releases-form';
import { LoginComponent } from './pages/login/login';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [App, AppLayout, StatusBadge, ReleasesList, ReleasesForm, LoginComponent],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, FormsModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [App],
})
export class AppModule {}
