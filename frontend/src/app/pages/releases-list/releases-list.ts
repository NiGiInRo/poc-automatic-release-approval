import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReleasesService } from '../../core/services/releases.service';
import { Release } from '../../core/models/release.model';

@Component({
  selector: 'app-releases-list',
  standalone: false,
  templateUrl: './releases-list.html',
  styleUrl: './releases-list.css',
})
export class ReleasesList implements OnInit {
  releases: Release[] = [];
  loading = true;
  error = '';

  constructor(private releasesService: ReleasesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.releasesService.getAll().subscribe({
      next: data => {
        this.releases = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo conectar con el servidor.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
