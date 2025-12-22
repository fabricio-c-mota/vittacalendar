import Appointment from '../../model/entities/appointment';
import { ICalendarService } from '../../model/services/iCalendarService';
import { IAppointmentRepository } from '../../model/repositories/iAppointmentRepository';

export interface ICancelAppointmentFromCalendarUseCase {
  execute(appointment: Appointment): Promise<Appointment>;
}

export default class CancelAppointmentFromCalendarUseCase implements ICancelAppointmentFromCalendarUseCase {
  constructor(
    private calendarService: ICalendarService,
    private appointmentRepository: IAppointmentRepository
  ) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    if (appointment.calendarEventId) {
      await this.calendarService.deleteEvent(appointment.calendarEventId);
    }

    const updatedAppointment: Appointment = {
      ...appointment,
      status: 'cancelled',
      calendarEventId: null,
      updatedAt: new Date(),
    };

    // Persistindo a mudança
    await this.appointmentRepository.saveAppointment(updatedAppointment);

    return updatedAppointment;
  }
}
