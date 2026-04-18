import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TipoRelease {
  RS = 'rs',
  FX = 'fx',
  CV = 'cv',
}

export enum EstadoRelease {
  APROBADO = 'APROBADO',
  PENDIENTE = 'PENDIENTE',
}

export enum AprobacionRelease {
  AUTOMATICA = 'AUTOMATICA',
  MANUAL = 'MANUAL',
  NA = 'N/A',
}

@Entity()
export class Release {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fecha: string;

  @Column()
  equipo: string;

  @Column({ type: 'simple-enum', enum: TipoRelease })
  tipo: TipoRelease;

  @Column()
  descripcion: string;

  @Column()
  pr_o_jira: string;

  @Column('float')
  cobertura: number;

  @Column()
  stack: string;

  @Column({ type: 'simple-enum', enum: EstadoRelease })
  estado: EstadoRelease;

  @Column({ type: 'simple-enum', enum: AprobacionRelease })
  aprobacion: AprobacionRelease;

  @CreateDateColumn()
  createdAt: Date;
}
