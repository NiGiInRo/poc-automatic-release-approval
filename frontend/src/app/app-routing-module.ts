import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReleasesList } from './pages/releases-list/releases-list';
import { ReleasesForm } from './pages/releases-form/releases-form';
import { LoginComponent } from './pages/login/login';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'list', component: ReleasesList, canActivate: [AuthGuard] },
  { path: 'new', component: ReleasesForm, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
