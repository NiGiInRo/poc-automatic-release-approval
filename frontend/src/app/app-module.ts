import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AppLayout } from './layout/app-layout/app-layout';
import { StatusBadge } from './shared/components/status-badge/status-badge';
import { ReleasesList } from './pages/releases-list/releases-list';
import { ReleasesForm } from './pages/releases-form/releases-form';

@NgModule({
  declarations: [App, AppLayout, StatusBadge, ReleasesList, ReleasesForm],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
