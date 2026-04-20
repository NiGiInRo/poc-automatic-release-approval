export type TipoRelease = 'rs' | 'fx' | 'cv';
export type EstadoRelease = 'APROBADO' | 'PENDIENTE' | 'N/A';

export interface Release {
  id?: number;
  fecha: string;
  equipo: string;
  tipo: TipoRelease;
  descripcion: string;
  pr_o_jira: string;
  cobertura: number;
  stack: string;
  aprobadorEmail: string;
  estado?: EstadoRelease;
  aprobacion?: string;
}

export interface ReleaseResult {
  estado: EstadoRelease;
  aprobacion: string;
  release: Release;
}
