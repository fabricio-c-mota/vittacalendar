import { useCallback, useEffect, useState } from 'react';
import Appointment from '../../model/entities/appointment';
import { CalendarPermissionError } from '../../model/errors/calendarError';
import { IAcceptAppointmentToCalendarUseCase } from '../../usecase/calendar/acceptAppointmentToCalendarUseCase';
import { ICancelAppointmentFromCalendarUseCase } from '../../usecase/calendar/cancelAppointmentFromCalendarUseCase';
import { IAppointmentRepository } from '../../model/repositories/iAppointmentRepository';

export interface CalendarIntegrationState {
  appointments: Appointment[];
  loading: boolean;
  message: { type: 'success' | 'error' | 'info'; text: string } | null;
}

export interface CalendarIntegrationActions {
  accept: (appt: Appointment) => Promise<void>;
  cancel: (appt: Appointment) => Promise<void>;
  clearMessage: () => void;
  resetMock: () => Promise<void>;
}

export default function useCalendarIntegrationViewModel(
  acceptUseCase: IAcceptAppointmentToCalendarUseCase,
  cancelUseCase: ICancelAppointmentFromCalendarUseCase,
  appointmentRepository: IAppointmentRepository
): CalendarIntegrationState & CalendarIntegrationActions {
  // List of appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true); // Start loading
  const [message, setMessage] = useState<CalendarIntegrationState['message']>(null);

  // Load appointments on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await appointmentRepository.getAppointments();
        if (mounted) {
          setAppointments(data);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load appointments', e);
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [appointmentRepository]);

  const clearMessage = useCallback(() => setMessage(null), []);

  const updateLocalList = useCallback((updated: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
  }, []);

  const accept = useCallback(async (appt: Appointment) => {
    if (appt.status !== 'pending') return;
    
    setLoading(true);
    setMessage(null);
    try {
      const updated = await acceptUseCase.execute(appt);
      updateLocalList(updated);
      setMessage({ type: 'success', text: `Consulta de ${appt.patientId} aceita!` });
    } catch (e: any) {
      if (e instanceof CalendarPermissionError) {
        setMessage({ type: 'error', text: 'Permissão de calendário negada.' });
      } else {
        setMessage({ type: 'error', text: e?.message ?? 'Falha ao aceitar consulta.' });
      }
    } finally {
      setLoading(false);
    }
  }, [acceptUseCase, updateLocalList]);

  const cancel = useCallback(async (appt: Appointment) => {
    if (appt.status !== 'accepted') return;

    setLoading(true);
    setMessage(null);
    try {
      const updated = await cancelUseCase.execute(appt);
      updateLocalList(updated);
      setMessage({ type: 'info', text: `Consulta de ${appt.patientId} cancelada.` });
    } catch (e: any) {
      if (e instanceof CalendarPermissionError) {
        setMessage({ type: 'error', text: 'Permissão de calendário negada.' });
      } else {
        setMessage({ type: 'error', text: e?.message ?? 'Falha ao cancelar consulta.' });
      }
    } finally {
      setLoading(false);
    }
  }, [cancelUseCase, updateLocalList]);

  const resetMock = useCallback(async () => {
    setLoading(true);
    try {
      const freshList = await appointmentRepository.resetAppointments();
      setAppointments(freshList);
      setMessage({ type: 'info', text: 'Lista de agendamentos resetada.' });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Falha ao resetar mock.' });
    } finally {
      setLoading(false);
    }
  }, [appointmentRepository]);

  return {
    appointments,
    loading,
    message,
    accept,
    cancel,
    clearMessage,
    resetMock,
  };
}
