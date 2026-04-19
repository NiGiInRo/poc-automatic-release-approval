import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

const mockSendMail = jest.fn();
const mockCreateTransport = nodemailer.createTransport as jest.Mock;
const mockCreateTestAccount = nodemailer.createTestAccount as jest.Mock;

describe('MailService', () => {
  let service: MailService;

  const payload = {
    to: 'aprobador@empresa.com',
    equipo: 'Equipo Pagos',
    tipo: 'rs',
    descripcion: 'Agrega módulo de pagos',
    reglasFallidas: ['cobertura insuficiente (60 < 80)', 'PR no encontrado'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCreateTestAccount.mockResolvedValue({ user: 'test@ethereal.email', pass: 'pass' });
    mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
    jest.spyOn(nodemailer, 'getTestMessageUrl').mockReturnValue('https://ethereal.email/message/abc');

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('envía correo con Ethereal cuando no hay SMTP configurado', async () => {
    delete process.env.SMTP_HOST;
    mockSendMail.mockResolvedValue({ messageId: 'abc123' });

    const result = await service.sendNotification(payload);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(result.enviado).toBe(true);
    expect(result.mensaje).toContain('aprobador@empresa.com');
  });

  it('usa SMTP real cuando SMTP_HOST está configurado', async () => {
    process.env.SMTP_HOST = 'smtp.ejemplo.com';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';
    mockSendMail.mockResolvedValue({ messageId: 'xyz' });

    const result = await service.sendNotification(payload);

    expect(mockCreateTestAccount).not.toHaveBeenCalled();
    expect(result.enviado).toBe(true);

    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it('activa modo degradado si sendMail lanza error', async () => {
    delete process.env.SMTP_HOST;
    mockSendMail.mockRejectedValue(new Error('SMTP timeout'));

    const result = await service.sendNotification(payload);

    expect(result.enviado).toBe(false);
    expect(result.mensaje).toContain('degradado');
  });
});
