import NativeCalendarService from '../infra/calendar/nativeCalendarService';
import MockAppointmentRepository from '../infra/repository/mockAppointmentRepository';
import AcceptAppointmentToCalendarUseCase from '../usecase/calendar/acceptAppointmentToCalendarUseCase';
import CancelAppointmentFromCalendarUseCase from '../usecase/calendar/cancelAppointmentFromCalendarUseCase';

export const calendarService = new NativeCalendarService();
export const appointmentRepository = new MockAppointmentRepository();

export const acceptAppointmentToCalendarUseCase = new AcceptAppointmentToCalendarUseCase(
  calendarService,
  appointmentRepository
);
export const cancelAppointmentFromCalendarUseCase = new CancelAppointmentFromCalendarUseCase(
  calendarService,
  appointmentRepository
);//
