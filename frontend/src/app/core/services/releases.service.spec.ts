import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReleasesService } from './releases.service';
import { Release, ReleaseResult } from '../models/release.model';

describe('ReleasesService', () => {
  let service: ReleasesService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000/gateway/releases';

  const mockRelease: Release = {
    fecha: '2026-04-20',
    equipo: 'equipo-a',
    tipo: 'rs',
    descripcion: 'deploy de prueba',
    pr_o_jira: 'JIRA-123',
    cobertura: 85,
    stack: 'angular',
    aprobadorEmail: 'dev@test.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReleasesService],
    });
    service = TestBed.inject(ReleasesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should make GET request to the correct URL', () => {
      const mockList: Release[] = [{ ...mockRelease, id: 1, estado: 'APROBADO' }];

      service.getAll().subscribe(releases => {
        expect(releases.length).toBe(1);
        expect(releases[0].id).toBe(1);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should return an empty array when API returns []', () => {
      service.getAll().subscribe(releases => {
        expect(releases).toEqual([]);
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });
  });

  describe('create()', () => {
    it('should make POST request with the release body', () => {
      const mockResult: ReleaseResult = {
        estado: 'APROBADO',
        aprobacion: 'Aprobado automáticamente',
        release: { ...mockRelease, id: 2 },
      };

      service.create(mockRelease).subscribe(result => {
        expect(result.estado).toBe('APROBADO');
        expect(result.aprobacion).toBeTruthy();
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRelease);
      req.flush(mockResult);
    });

    it('should return PENDIENTE when approval is pending', () => {
      const mockResult: ReleaseResult = {
        estado: 'PENDIENTE',
        aprobacion: 'Requiere revisión manual',
        release: { ...mockRelease, id: 3 },
      };

      service.create(mockRelease).subscribe(result => {
        expect(result.estado).toBe('PENDIENTE');
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockResult);
    });
  });
});
