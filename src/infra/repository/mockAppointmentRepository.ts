import AsyncStorage from '@react-native-async-storage/async-storage';
import Appointment from '../../model/entities/appointment';
import { IAppointmentRepository } from '../../model/repositories/iAppointmentRepository';

const STORAGE_KEY = '@vitta_mock_appointments_v2';

export default class MockAppointmentRepository implements IAppointmentRepository {
  
  private makeNewMockList(): Appointment[] {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    // Mock 1: Pendente (Amanhã 10h)
    const d1 = new Date(now);
    d1.setDate(d1.getDate() + 1);
    const mock1: Appointment = {
      id: 'appt-1',
      patientId: 'João Silva',
      nutritionistId: 'nutri-1',
      date: d1.toISOString().split('T')[0],
      timeStart: '10:00',
      timeEnd: '11:00',
      status: 'pending',
      observations: 'Primeira consulta - Avaliação inicial.',
      createdAt: new Date(),
      updatedAt: new Date(),
      calendarEventId: null,
    };

    // Mock 2: Pendente (Amanhã 14h)
    const mock2: Appointment = {
      id: 'appt-2',
      patientId: 'Maria Oliveira',
      nutritionistId: 'nutri-1',
      date: d1.toISOString().split('T')[0],
      timeStart: '14:00',
      timeEnd: '15:00',
      status: 'pending',
      observations: 'Retorno - Foco em hipertrofia.',
      createdAt: new Date(),
      updatedAt: new Date(),
      calendarEventId: null,
    };

    // Mock 3: Aceito (Depois de amanhã 09h) - Simular um já integrado
    const d2 = new Date(now);
    d2.setDate(d2.getDate() + 2);
    const mock3: Appointment = {
      id: 'appt-3',
      patientId: 'Carlos Souza',
      nutritionistId: 'nutri-1',
      date: d2.toISOString().split('T')[0],
      timeStart: '09:00',
      timeEnd: '09:30',
      status: 'accepted',
      observations: 'Acompanhamento mensal.',
      createdAt: new Date(),
      updatedAt: new Date(),
      calendarEventId: 'mock-event-id-existing', // Simulado
    };

    return [mock1, mock2, mock3];
  }

  async getAppointments(): Promise<Appointment[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json) as any[];
        return parsed.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      }
    } catch (e) {
      console.warn('Erro ao ler storage', e);
    }
    
    // Se não existir, cria lista nova e salva
    const newList = this.makeNewMockList();
    await this.saveList(newList);
    return newList;
  }

  private async saveList(list: Appointment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar storage', e);
    }
  }

  async saveAppointment(appointment: Appointment): Promise<void> {
    const currentList = await this.getAppointments();
    const index = currentList.findIndex(a => a.id === appointment.id);
    
    if (index >= 0) {
      currentList[index] = appointment;
    } else {
      currentList.push(appointment);
    }
    
    await this.saveList(currentList);
  }

  async resetAppointments(): Promise<Appointment[]> {
    const newList = this.makeNewMockList();
    await this.saveList(newList);
    return newList;
  }
}
