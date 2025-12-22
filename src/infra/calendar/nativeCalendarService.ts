import RNCalendarEvents from 'react-native-calendar-events';
import {
  ICalendarService,
  CalendarPermissionStatus,
  CreateEventInput,
} from '../../model/services/iCalendarService';
import { CalendarNoWritableCalendarError, CalendarPermissionError } from '../../model/errors/calendarError';

export default class NativeCalendarService implements ICalendarService {
  private cachedCalendarId: string | null = null;

  async ensurePermissions(): Promise<CalendarPermissionStatus> {
    const status = (await RNCalendarEvents.checkPermissions()) as CalendarPermissionStatus;
    if (status === 'authorized') return status;

    const requested = (await RNCalendarEvents.requestPermissions()) as CalendarPermissionStatus;
    return requested;
  }

  private async getWritableCalendarId(): Promise<string> {
    if (this.cachedCalendarId) return this.cachedCalendarId;

    const calendars = await RNCalendarEvents.findCalendars();

    const isGoogleCalendar = (c: any) => {
      const source = String(c.source ?? '').toLowerCase();
      const owner = String(c.ownerAccount ?? '').toLowerCase();
      return (
        c.isPrimary === true ||
        source.includes('google') ||
        source.includes('com.google') ||
        owner.includes('@gmail.com')
      );
    };

    const primary = calendars.find(
      (c: any) => c.isPrimary && c.allowsModifications
    );

    const googleWritable = calendars.find(
      (c: any) => isGoogleCalendar(c) && c.allowsModifications
    );

    const fallback = calendars.find((c: any) => c.allowsModifications);

    const chosen = primary ?? googleWritable ?? fallback;

    if (!chosen?.id) {
      throw new CalendarNoWritableCalendarError();
    }

    this.cachedCalendarId = String(chosen.id);
    return this.cachedCalendarId;
  }

  async createEvent(input: CreateEventInput): Promise<string> {
    const perm = await this.ensurePermissions();
    if (perm !== 'authorized') throw new CalendarPermissionError();

    const calendarId = await this.getWritableCalendarId();

    const eventId = await RNCalendarEvents.saveEvent(input.title, {
      calendarId,
      startDate: input.startDateISO,
      endDate: input.endDateISO,
      notes: input.notes,
      alarms: input.alarms,
    });

    return String(eventId);
  }

  async deleteEvent(eventId: string): Promise<void> {
    const perm = await this.ensurePermissions();
    if (perm !== 'authorized') throw new CalendarPermissionError();

    await RNCalendarEvents.removeEvent(eventId);
  }
}
