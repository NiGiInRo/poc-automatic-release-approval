import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { GatewayService } from './gateway.service';
import { CreateReleaseDto, TipoRelease } from './dto/create-release.dto';

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => `http://${key.toLowerCase().replace(/_url$/, '')}`),
};

const baseDto: CreateReleaseDto = {
  fecha: '2026-04-19',
  equipo: 'Equipo Pagos',
  tipo: TipoRelease.RS,
  descripcion: 'Nueva funcionalidad',
  pr_o_jira: 'https://github.com/org/repo/pull/1',
  cobertura: 85,
  stack: 'NestJS 11',
  aprobadorEmail: 'aprobador@empresa.com',
};

describe('GatewayService', () => {
  let service: GatewayService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
  });

  describe('getReleases', () => {
    it('retorna la lista del release-service', async () => {
      const releases = [{ id: 1, tipo: 'fx' }];
      mockHttpService.get.mockReturnValue(of({ data: releases }));

      const result = await service.getReleases();

      expect(result).toEqual(releases);
      expect(mockHttpService.get).toHaveBeenCalledWith(expect.stringContaining('/releases'));
    });
  });

  describe('createRelease — tipo fx/cv', () => {
    it('persiste directamente sin llamar a integrations ni rules', async () => {
      const dto = { ...baseDto, tipo: TipoRelease.FX };
      const saved = { id: 1, ...dto, estado: 'APROBADO', aprobacion: 'N/A' };
      mockHttpService.post.mockReturnValue(of({ data: saved }));

      const result = await service.createRelease(dto);

      expect(result).toEqual(saved);
      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/releases'),
        expect.objectContaining({ tipo: TipoRelease.FX }),
      );
    });
  });

  describe('createRelease — tipo rs', () => {
    it('persiste APROBADO/AUTOMATICA cuando PR y reglas pasan', async () => {
      const saved = { id: 2, ...baseDto, estado: 'APROBADO', aprobacion: 'AUTOMATICA' };

      mockHttpService.post
        .mockReturnValueOnce(of({ data: { valido: true, detalle: 'PR mergeado' } }))
        .mockReturnValueOnce(of({ data: { aprobado: true, reglas: {} } }))
        .mockReturnValueOnce(of({ data: saved }));

      const result = await service.createRelease(baseDto);

      expect(result).toEqual(saved);
      expect(mockHttpService.post).toHaveBeenCalledTimes(3);
      expect(mockHttpService.post).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('/releases'),
        expect.objectContaining({ estado: 'APROBADO', aprobacion: 'AUTOMATICA' }),
      );
    });

    it('notifica y persiste PENDIENTE/MANUAL cuando el PR falla', async () => {
      const saved = { id: 3, ...baseDto, estado: 'PENDIENTE', aprobacion: 'MANUAL' };

      mockHttpService.post
        .mockReturnValueOnce(of({ data: { valido: false, detalle: 'PR no encontrado' } }))
        .mockReturnValueOnce(of({ data: { aprobado: true, reglas: {} } }))
        .mockReturnValueOnce(of({ data: {} }))
        .mockReturnValueOnce(of({ data: saved }));

      const result = await service.createRelease(baseDto);

      expect(result).toEqual(saved);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/notify'),
        expect.objectContaining({ reglasFallidas: ['PR no encontrado'] }),
      );
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/releases'),
        expect.objectContaining({ estado: 'PENDIENTE', aprobacion: 'MANUAL' }),
      );
    });

    it('notifica y persiste PENDIENTE/MANUAL cuando las reglas fallan', async () => {
      const saved = { id: 4, ...baseDto, estado: 'PENDIENTE', aprobacion: 'MANUAL' };

      mockHttpService.post
        .mockReturnValueOnce(of({ data: { valido: true, detalle: 'ok' } }))
        .mockReturnValueOnce(of({
          data: {
            aprobado: false,
            reglas: {
              cobertura: { aprobado: false, detalle: 'cobertura insuficiente (60 < 80)' },
            },
          },
        }))
        .mockReturnValueOnce(of({ data: {} }))
        .mockReturnValueOnce(of({ data: saved }));

      const result = await service.createRelease(baseDto);

      expect(result).toEqual(saved);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/notify'),
        expect.objectContaining({
          reglasFallidas: ['cobertura insuficiente (60 < 80)'],
        }),
      );
    });

    it('persiste PENDIENTE/MANUAL aunque el notification-service falle', async () => {
      const saved = { id: 5, ...baseDto, estado: 'PENDIENTE', aprobacion: 'MANUAL' };

      mockHttpService.post
        .mockReturnValueOnce(of({ data: { valido: false, detalle: 'PR inválido' } }))
        .mockReturnValueOnce(of({ data: { aprobado: true, reglas: {} } }))
        .mockReturnValueOnce(throwError(() => new Error('notification-service caído')))
        .mockReturnValueOnce(of({ data: saved }));

      const result = await service.createRelease(baseDto);

      expect(result).toEqual(saved);
    });

    it('lanza 502 si el release-service falla al persistir', async () => {
      mockHttpService.post
        .mockReturnValueOnce(of({ data: { valido: true, detalle: 'ok' } }))
        .mockReturnValueOnce(of({ data: { aprobado: true, reglas: {} } }))
        .mockReturnValueOnce(throwError(() => new Error('release-service caído')));

      await expect(service.createRelease(baseDto)).rejects.toThrow(HttpException);
    });
  });
});
