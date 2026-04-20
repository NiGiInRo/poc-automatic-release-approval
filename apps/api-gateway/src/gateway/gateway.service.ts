import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateReleaseDto, TipoRelease } from './dto/create-release.dto';

interface PrValidationResult {
  valido: boolean;
  detalle: string;
}

interface RulesEvaluationResult {
  aprobado: boolean;
  reglasFallidas: string[];
}

@Injectable()
export class GatewayService {
  private readonly releaseServiceUrl: string;
  private readonly rulesServiceUrl: string;
  private readonly integrationsServiceUrl: string;
  private readonly notificationServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.releaseServiceUrl = this.config.getOrThrow<string>('RELEASE_SERVICE_URL');
    this.rulesServiceUrl = this.config.getOrThrow<string>('RULES_SERVICE_URL');
    this.integrationsServiceUrl = this.config.getOrThrow<string>('INTEGRATIONS_SERVICE_URL');
    this.notificationServiceUrl = this.config.getOrThrow<string>('NOTIFICATION_SERVICE_URL');
  }

  async getReleases(): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.get(`${this.releaseServiceUrl}/releases`),
    );
    return response.data;
  }

  async createRelease(dto: CreateReleaseDto): Promise<unknown> {
    if (dto.tipo === TipoRelease.FX || dto.tipo === TipoRelease.CV) {
      return this.persistRelease(dto);
    }

    return this.handleRsFlow(dto);
  }

  private async handleRsFlow(dto: CreateReleaseDto): Promise<unknown> {
    const prResult = await this.validatePr(dto.pr_o_jira);
    const rulesResult = await this.evaluateRules(dto);

    const todoPaso = prResult.valido && rulesResult.aprobado;

    if (todoPaso) {
      return this.persistRelease(dto, 'APROBADO', 'AUTOMATICA');
    }

    const reglasFallidas = [
      ...(!prResult.valido ? [prResult.detalle] : []),
      ...rulesResult.reglasFallidas,
    ];

    await this.sendNotification(dto, reglasFallidas);
    return this.persistRelease(dto, 'PENDIENTE', 'MANUAL');
  }

  private async validatePr(pr_o_jira: string): Promise<PrValidationResult> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.integrationsServiceUrl}/validate-pr`, { pr_o_jira }),
      );
      return {
        valido: response.data?.valido === true,
        detalle: response.data?.detalle ?? 'PR inválido',
      };
    } catch {
      return { valido: false, detalle: 'integrations-service no disponible' };
    }
  }

  private async evaluateRules(dto: CreateReleaseDto): Promise<RulesEvaluationResult> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.rulesServiceUrl}/rules/evaluate`, {
          tipo: dto.tipo,
          cobertura: dto.cobertura,
          descripcion: dto.descripcion,
          pr_o_jira: dto.pr_o_jira,
          stack: dto.stack,
        }),
      );

      const reglas: Record<string, { aprobado: boolean; detalle: string }> =
        response.data?.reglas ?? {};

      const reglasFallidas = Object.values(reglas)
        .filter((r) => !r.aprobado)
        .map((r) => r.detalle);

      return { aprobado: response.data?.aprobado === true, reglasFallidas };
    } catch {
      return { aprobado: false, reglasFallidas: ['rules-service no disponible'] };
    }
  }

  private async sendNotification(dto: CreateReleaseDto, reglasFallidas: string[]): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.notificationServiceUrl}/notifications/notify`, {
          equipo: dto.equipo,
          aprobadorEmail: dto.aprobadorEmail,
          tipo: dto.tipo,
          descripcion: dto.descripcion,
          reglasFallidas,
        }),
      );
    } catch {
      // modo degradado: si el notification-service falla, el flujo continúa igual
    }
  }

  private async persistRelease(
    dto: CreateReleaseDto,
    estado?: string,
    aprobacion?: string,
  ): Promise<unknown> {
    try {
      const { aprobadorEmail: _, ...releaseData } = dto;
      const response = await firstValueFrom(
        this.http.post(`${this.releaseServiceUrl}/releases`, {
          ...releaseData,
          ...(estado && { estado }),
          ...(aprobacion && { aprobacion }),
        }),
      );
      return response.data;
    } catch {
      throw new HttpException('Error al persistir el release', HttpStatus.BAD_GATEWAY);
    }
  }
}
