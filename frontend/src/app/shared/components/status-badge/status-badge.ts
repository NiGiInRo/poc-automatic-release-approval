import { Component, Input } from '@angular/core';
import { EstadoRelease } from '../../../core/models/release.model';

@Component({
  selector: 'app-status-badge',
  standalone: false,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  @Input() estado: EstadoRelease | undefined;

  get cssClass(): string {
    if (this.estado === 'APROBADO') return 'aprobado';
    if (this.estado === 'PENDIENTE') return 'pendiente';
    return '';
  }
}
