export class CalendarPermissionError extends Error {
  constructor(message = 'Permissão de calendário não concedida.') {
    super(message);
    this.name = 'CalendarPermissionError';
  }
}

export class CalendarNoWritableCalendarError extends Error {
  constructor(message = 'Nenhum calendário disponível para escrita.') {
    super(message);
    this.name = 'CalendarNoWritableCalendarError';
  }
}
