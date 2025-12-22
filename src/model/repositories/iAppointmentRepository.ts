import Appointment from '../entities/appointment';

export interface IAppointmentRepository {
  getAppointments(): Promise<Appointment[]>;
  saveAppointment(appointment: Appointment): Promise<void>;
  resetAppointments(): Promise<Appointment[]>;
}
