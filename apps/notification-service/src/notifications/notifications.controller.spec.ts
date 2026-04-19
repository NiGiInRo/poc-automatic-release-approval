import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { MailService } from './mail.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mailService: jest.Mocked<MailService>;

  const dto = {
    equipo: 'Equipo Pagos',
    aprobadorEmail: 'aprobador@empresa.com',
    tipo: 'rs',
    descripcion: 'Agrega módulo de pagos',
    reglasFallidas: ['cobertura insuficiente (60 < 80)'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: MailService,
          useValue: { sendNotification: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    mailService = module.get(MailService);
  });

  it('devuelve el resultado de MailService cuando el envío es exitoso', async () => {
    mailService.sendNotification.mockResolvedValue({
      enviado: true,
      mensaje: 'Correo enviado a aprobador@empresa.com',
    });

    const result = await controller.notify(dto);

    expect(mailService.sendNotification).toHaveBeenCalledWith({
      to: dto.aprobadorEmail,
      equipo: dto.equipo,
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      reglasFallidas: dto.reglasFallidas,
    });
    expect(result.enviado).toBe(true);
  });

  it('devuelve modo degradado si MailService falla', async () => {
    mailService.sendNotification.mockResolvedValue({
      enviado: false,
      mensaje: 'Modo degradado: correo no enviado, ver logs',
    });

    const result = await controller.notify(dto);

    expect(result.enviado).toBe(false);
  });
});
