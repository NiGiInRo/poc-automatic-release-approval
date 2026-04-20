import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReleasesService } from './releases.service';
import { Release, TipoRelease, EstadoRelease, AprobacionRelease } from './release.entity';
import { CreateReleaseDto } from './create-release.dto';

const mockRelease: Release = {
  id: 1,
  fecha: '2026-04-18',
  equipo: 'Equipo Pagos',
  tipo: TipoRelease.RS,
  descripcion: 'Nueva funcionalidad',
  pr_o_jira: 'https://github.com/org/repo/pull/1',
  cobertura: 85,
  stack: 'NestJS',
  estado: EstadoRelease.PENDIENTE,
  aprobacion: AprobacionRelease.MANUAL,
  createdAt: new Date(),
};

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('ReleasesService', () => {
  let service: ReleasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        {
          provide: getRepositoryToken(Release),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const baseDto: CreateReleaseDto = {
      fecha: '2026-04-18',
      equipo: 'Equipo Pagos',
      descripcion: 'Nueva funcionalidad',
      pr_o_jira: 'https://github.com/org/repo/pull/1',
      cobertura: 85,
      stack: 'NestJS',
      tipo: TipoRelease.RS,
    };

    it('guarda un rs con estado PENDIENTE y aprobacion MANUAL', async () => {
      const release = { ...mockRelease };
      mockRepository.create.mockReturnValue(release);
      mockRepository.save.mockResolvedValue(release);

      const result = await service.create({ ...baseDto, tipo: TipoRelease.RS });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: EstadoRelease.PENDIENTE,
          aprobacion: AprobacionRelease.MANUAL,
        }),
      );
      expect(result.estado).toBe(EstadoRelease.PENDIENTE);
      expect(result.aprobacion).toBe(AprobacionRelease.MANUAL);
    });

    it('guarda un fx con estado APROBADO y aprobacion N/A', async () => {
      const release = { ...mockRelease, tipo: TipoRelease.FX, estado: EstadoRelease.APROBADO, aprobacion: AprobacionRelease.NA };
      mockRepository.create.mockReturnValue(release);
      mockRepository.save.mockResolvedValue(release);

      const result = await service.create({ ...baseDto, tipo: TipoRelease.FX });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: EstadoRelease.APROBADO,
          aprobacion: AprobacionRelease.NA,
        }),
      );
      expect(result.estado).toBe(EstadoRelease.APROBADO);
      expect(result.aprobacion).toBe(AprobacionRelease.NA);
    });

    it('guarda un cv con estado APROBADO y aprobacion N/A', async () => {
      const release = { ...mockRelease, tipo: TipoRelease.CV, estado: EstadoRelease.APROBADO, aprobacion: AprobacionRelease.NA };
      mockRepository.create.mockReturnValue(release);
      mockRepository.save.mockResolvedValue(release);

      const result = await service.create({ ...baseDto, tipo: TipoRelease.CV });

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: EstadoRelease.APROBADO,
          aprobacion: AprobacionRelease.NA,
        }),
      );
      expect(result.estado).toBe(EstadoRelease.APROBADO);
      expect(result.aprobacion).toBe(AprobacionRelease.NA);
    });
  });

  describe('findAll', () => {
    it('devuelve un array de releases', async () => {
      mockRepository.find.mockResolvedValue([mockRelease]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].equipo).toBe('Equipo Pagos');
    });

    it('devuelve array vacío si no hay releases', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toHaveLength(0);
    });
  });
});
