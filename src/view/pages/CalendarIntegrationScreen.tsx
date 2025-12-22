import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useCalendarIntegrationViewModel from '../../viewmodel/calendar/useCalendarIntegrationViewModel';
import {
  acceptAppointmentToCalendarUseCase,
  cancelAppointmentFromCalendarUseCase,
  appointmentRepository
} from '../../di/container';
import { Colors } from '../themes/colors';
import Appointment from '../../model/entities/appointment';

function Banner({
  type,
  text,
  onClose,
}: {
  type: 'success' | 'error' | 'info';
  text: string;
  onClose: () => void;
}) {
  const bg =
    type === 'success' ? Colors.primaryLight
    : type === 'error' ? Colors.errorLight
    : Colors.infoLight;

  const fg =
    type === 'success' ? Colors.primaryDark
    : type === 'error' ? Colors.errorDark
    : Colors.infoDark;

  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={[styles.bannerText, { color: fg }]}>{text}</Text>
      <TouchableOpacity onPress={onClose} style={styles.bannerBtn}>
        <Text style={styles.bannerBtnText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const color = 
    status === 'accepted' ? Colors.primary 
    : status === 'cancelled' ? Colors.error 
    : Colors.text.tertiary;

  const label = 
    status === 'accepted' ? 'ACEITO' 
    : status === 'cancelled' ? 'CANCELADO' 
    : 'PENDENTE';

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export default function CalendarIntegrationScreen() {
  const insets = useSafeAreaInsets();

  const {
    appointments,
    loading,
    message,
    accept,
    cancel,
    clearMessage,
    resetMock
  } = useCalendarIntegrationViewModel(
    acceptAppointmentToCalendarUseCase,
    cancelAppointmentFromCalendarUseCase,
    appointmentRepository
  );

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => clearMessage(), 3000);
    return () => clearTimeout(t);
  }, [message, clearMessage]);

  const renderItem: ListRenderItem<Appointment> = ({ item }) => {
    const isPending = item.status === 'pending';
    const isAccepted = item.status === 'accepted';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.patientId}</Text>
          <StatusBadge status={item.status} />
        </View>

        <Row label="Data" value={item.date} />
        <Row label="Horário" value={`${item.timeStart} – ${item.timeEnd}`} />
        <Row label="Nutricionista" value={item.nutritionistId} />

        {!!item.observations && (
          <View style={styles.note}>
            <Text style={styles.noteText}>{item.observations}</Text>
          </View>
        )}

        {item.calendarEventId ? (
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>ID Evento: {item.calendarEventId}</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {isPending && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.btnPrimary]} 
              onPress={() => accept(item)}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>Aceitar</Text>
            </TouchableOpacity>
          )}

          {isAccepted && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.btnDestructive]} 
              onPress={() => cancel(item)}
              disabled={loading}
            >
              <Text style={styles.actionBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {!isPending && !isAccepted && (
            <Text style={styles.noActionText}>Nenhuma ação disponível</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading && appointments.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.text.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <Text style={styles.subtitle}>
          Gerencie suas solicitações de consulta
        </Text>
      </View>

      <View style={styles.listContainer}>
        {message ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            <Banner type={message.type} text={message.text} onClose={clearMessage} />
          </View>
        ) : null}

        <FlatList
          data={appointments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: Colors.text.tertiary, marginTop: 40 }}>
                Nenhum agendamento encontrado.
              </Text>
            </View>
          }
          ListFooterComponent={
            <TouchableOpacity onPress={resetMock} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Resetar Lista (Mock)</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  value: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  note: {
    marginTop: 12,
    backgroundColor: Colors.note.background,
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: Colors.note.text,
    fontStyle: 'italic',
  },
  metaBox: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  cardActions: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnDestructive: {
    backgroundColor: Colors.errorLight,
  },
  actionBtnText: {
    color: Colors.text.inverted,
    fontWeight: '600',
    fontSize: 14,
  },
  noActionText: {
    color: Colors.text.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  bannerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text.primary,
    opacity: 0.5,
  },
  resetBtn: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 16,
  },
  resetBtnText: {
    color: Colors.text.tertiary,
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
