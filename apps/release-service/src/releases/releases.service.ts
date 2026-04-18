import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Release, EstadoRelease, AprobacionRelease, TipoRelease } from './release.entity';
import { CreateReleaseDto } from './create-release.dto';

@Injectable()
export class ReleasesService {
  constructor(
    @InjectRepository(Release)
    private readonly releasesRepository: Repository<Release>,
  ) {}

  async create(dto: CreateReleaseDto): Promise<Release> {
    const isFxOrCv = dto.tipo === TipoRelease.FX || dto.tipo === TipoRelease.CV;

    const release = this.releasesRepository.create({
      ...dto,
      estado: isFxOrCv ? EstadoRelease.APROBADO : EstadoRelease.PENDIENTE,
      aprobacion: isFxOrCv ? AprobacionRelease.NA : AprobacionRelease.MANUAL,
    });

    return this.releasesRepository.save(release);
  }

  async findAll(): Promise<Release[]> {
    return this.releasesRepository.find();
  }
}
