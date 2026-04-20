import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReleasesService } from '../../core/services/releases.service';
import { ReleaseResult } from '../../core/models/release.model';

@Component({
  selector: 'app-releases-form',
  standalone: false,
  templateUrl: './releases-form.html',
  styleUrl: './releases-form.css',
})
export class ReleasesForm {
  form: FormGroup;
  submitting = false;
  result: ReleaseResult | null = null;
  error = '';

  constructor(private fb: FormBuilder, private releasesService: ReleasesService, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      fecha: ['', Validators.required],
      equipo: ['', Validators.required],
      tipo: ['rs', Validators.required],
      descripcion: ['', Validators.required],
      pr_o_jira: ['', Validators.required],
      cobertura: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      stack: ['', Validators.required],
      aprobadorEmail: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.result = null;
    this.error = '';

    this.releasesService.create(this.form.value).subscribe({
      next: res => {
        this.result = res;
        this.submitting = false;
        this.form.reset({ tipo: 'rs' });
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo conectar con el servidor.';
        this.submitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
