import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReleasesList } from './pages/releases-list/releases-list';
import { ReleasesForm } from './pages/releases-form/releases-form';

const routes: Routes = [
  { path: 'list', component: ReleasesList },
  { path: 'new', component: ReleasesForm },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
