export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export default interface Appointment {
  id: string;
  patientId: string;
  nutritionistId: string;
  date: string;       // YYYY-MM-DD
  timeStart: string;  // HH:mm
  timeEnd: string;    // HH:mm
  status: AppointmentStatus;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;

  // necessário pro calendário (pra remover depois)
  calendarEventId?: string | null;
}
