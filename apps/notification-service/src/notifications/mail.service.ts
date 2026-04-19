import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  async sendNotification(params: {
    to: string;
    equipo: string;
    tipo: string;
    descripcion: string;
    reglasFallidas: string[];
  }): Promise<{ enviado: boolean; mensaje: string }> {
    try {
      const transporter = await this.getTransporter();
      if (!transporter) {
        return this.degradedMode(params);
      }

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM ?? '"Release Notifier" <notifier@local>',
        to: params.to,
        subject: `[Release Fallido] ${params.equipo} — ${params.tipo}`,
        html: this.buildHtml(params),
      });

      // Ethereal genera una URL para ver el correo en el navegador
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Correo de prueba visible en: ${previewUrl}`);
      }

      return { enviado: true, mensaje: `Correo enviado a ${params.to}` };
    } catch (err) {
      this.logger.error('Error enviando correo, activando modo degradado', err);
      return this.degradedMode(params);
    }
  }

  private async getTransporter(): Promise<Transporter | null> {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log(`Usando SMTP: ${process.env.SMTP_HOST}`);
    } else {
      // Sin configuración → cuenta Ethereal automática
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Usando Ethereal (${testAccount.user}) — los correos no salen a internet`);
    }

    return this.transporter;
  }

  private degradedMode(params: { to: string; reglasFallidas: string[] }) {
    this.logger.warn(
      `[MODO DEGRADADO] Notificación para ${params.to} — reglas fallidas: ${params.reglasFallidas.join(', ')}`,
    );
    return { enviado: false, mensaje: 'Modo degradado: correo no enviado, ver logs' };
  }

  private buildHtml(params: {
    equipo: string;
    tipo: string;
    descripcion: string;
    reglasFallidas: string[];
  }): string {
    const reglas = params.reglasFallidas.map((r) => `<li>${r}</li>`).join('');
    return `
      <h2>Release rechazado — ${params.equipo}</h2>
      <p><strong>Tipo:</strong> ${params.tipo}</p>
      <p><strong>Descripción:</strong> ${params.descripcion}</p>
      <h3>Reglas que fallaron:</h3>
      <ul>${reglas}</ul>
    `;
  }
}
