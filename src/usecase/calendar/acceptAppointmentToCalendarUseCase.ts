import Appointment from '../../model/entities/appointment';
import { ICalendarService } from '../../model/services/iCalendarService';
import { IAppointmentRepository } from '../../model/repositories/iAppointmentRepository';

function toLocalISO(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
}

export interface IAcceptAppointmentToCalendarUseCase {
  execute(appointment: Appointment): Promise<Appointment>;
}

export default class AcceptAppointmentToCalendarUseCase implements IAcceptAppointmentToCalendarUseCase {
  constructor(
    private calendarService: ICalendarService,
    private appointmentRepository: IAppointmentRepository
  ) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    // idempotência básica
    if (appointment.status === 'accepted' && appointment.calendarEventId) {
      return appointment;
    }

    const startISO = toLocalISO(appointment.date, appointment.timeStart);
    const endISO = toLocalISO(appointment.date, appointment.timeEnd);

    const title = `Consulta • ${appointment.patientId}`;
    const notes = appointment.observations;

    const eventId = await this.calendarService.createEvent({
      title,
      startDateISO: startISO,
      endDateISO: endISO,
      notes,
      alarms: [{ date: -60 }], // Notificação 1 hora antes
    });

    const updatedAppointment: Appointment = {
      ...appointment,
      status: 'accepted',
      calendarEventId: eventId,
      updatedAt: new Date(),
    };


    await this.appointmentRepository.saveAppointment(updatedAppointment);

    return updatedAppointment;
  }
}
