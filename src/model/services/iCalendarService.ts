export type CalendarPermissionStatus = 'authorized' | 'denied' | 'restricted' | 'undetermined';

export interface CreateEventInput {
  title: string;
  startDateISO: string;
  endDateISO: string;
  notes?: string;
  alarms?: Array<{
    date: number; 
  }>;
}

export interface ICalendarService {
  ensurePermissions(): Promise<CalendarPermissionStatus>;
  createEvent(input: CreateEventInput): Promise<string>;
  deleteEvent(eventId: string): Promise<void>;
}
