import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { AppText } from '../../components/common/AppText';
import { GradientButton } from '../../components/common/GradientButton';
import { colors, fonts, radius, spacing } from '../../core/theme';
import { findHome } from '../../data/homes';
import { findOwner } from '../../data/owners';
import type { TenantStackScreenProps } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth.store';
import { useVisit, useVisitStore } from '../../stores/visit.store';

const times = ['Morning', 'Afternoon', 'Evening'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatVisitDay(id: string) {
  const [year, month, day] = id.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  if (Number.isNaN(date.getTime())) {
    return id;
  }
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === today.getTime()) {
    return 'Today';
  }
  if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

function monthCells(year: number, month: number) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export default function VisitRequestScreen({ navigation, route }: TenantStackScreenProps<'VisitRequest'>) {
  const insets = useSafeAreaInsets();
  const home = findHome(route.params.homeId);
  const owner = home ? findOwner(home.ownerId) : undefined;
  const phone = useAuthStore(state => state.session?.phone ?? '');
  const sent = useVisit(phone, route.params.homeId);
  const today = useMemo(() => startOfDay(new Date()), []);
  const latest = useMemo(() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() + 6);
    return date;
  }, [today]);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState(() => isoDate(today));
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const cells = useMemo(() => monthCells(month.getFullYear(), month.getMonth()), [month]);
  const canGoBack = month.getFullYear() > today.getFullYear() || month.getMonth() > today.getMonth();
  const canGoForward =
    month.getFullYear() < latest.getFullYear() ||
    (month.getFullYear() === latest.getFullYear() && month.getMonth() < latest.getMonth());

  if (!home) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + spacing.lg }]}>
        <Back onPress={() => navigation.goBack()} />
        <AppText style={styles.heading}>This home is not available.</AppText>
      </View>
    );
  }

  const dayLabel = formatVisitDay(sent?.day ?? day);

  if (sent) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl }]}>
        <Back onPress={() => navigation.goBack()} />
        <View style={styles.sent}>
          <AppText style={styles.heading}>Visit requested</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {owner ? `${owner.name} has this request.` : 'The owner has this request.'} Nothing is booked until they reply.
          </AppText>
          <View style={styles.summary}>
            <AppText style={styles.summaryTitle}>{home.title}</AppText>
            <AppText color={colors.textSecondary}>
              {home.area}, {home.city}
            </AppText>
            <AppText style={styles.when}>
              {dayLabel} · {sent.time}
            </AppText>
            {sent.note ? <AppText color={colors.textSecondary}>{sent.note}</AppText> : null}
          </View>
        </View>
        <GradientButton label="Back to the home" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Back onPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.lg }}>
        <View style={styles.copy}>
          <AppText style={styles.heading}>Ask for a visit</AppText>
          <AppText color={colors.textSecondary} style={styles.sub}>
            {home.title} · {home.area}
          </AppText>
        </View>

        <View style={styles.block}>
          <AppText style={styles.label}>Date</AppText>
          <View style={styles.calendar}>
            <View style={styles.monthRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                disabled={!canGoBack}
                hitSlop={8}
                onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                style={styles.monthButton}>
                <ChevronLeft color={canGoBack ? colors.navy : colors.border} size={22} />
              </Pressable>
              <AppText style={styles.monthLabel}>
                {month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                disabled={!canGoForward}
                hitSlop={8}
                onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                style={styles.monthButton}>
                <ChevronRight color={canGoForward ? colors.navy : colors.border} size={22} />
              </Pressable>
            </View>
            <View style={styles.weekRow}>
              {weekdays.map(item => (
                <AppText key={item} color={colors.textSecondary} style={styles.weekday}>
                  {item}
                </AppText>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }
                const id = isoDate(date);
                const open = date >= today && date <= latest;
                const selected = id === day;
                const isToday = date.getTime() === today.getTime();
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: !open }}
                    disabled={!open}
                    onPress={() => setDay(id)}
                    style={styles.dayCell}>
                    <View style={[styles.dayFace, selected && styles.dayOn, isToday && !selected && styles.dayToday]}>
                      <AppText
                        variant="label"
                        color={!open ? colors.border : selected ? colors.white : isToday ? colors.greenDark : colors.navy}>
                        {date.getDate()}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.block}>
          <AppText style={styles.label}>Time</AppText>
          <View style={styles.chips}>
            {times.map(item => (
              <Chip key={item} label={item} selected={item === time} onPress={() => setTime(item)} />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <AppText style={styles.label}>Note for the owner</AppText>
          <TextInput
            value={note}
            onChangeText={value => setNote(value.slice(0, 140))}
            placeholder="Optional. For example, I can come after 5."
            placeholderTextColor={colors.textSecondary}
            multiline
            style={styles.input}
          />
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <GradientButton
          label="Send request"
          disabled={!time}
          onPress={() => {
            if (!time) {
              return;
            }
            useVisitStore.getState().save({ phone, homeId: home.id, day, time, note: note.trim() });
          }}
        />
      </View>
    </View>
  );
}

function Back({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} onPress={onPress} style={styles.back}>
      <ChevronLeft color={colors.navy} size={26} />
    </Pressable>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}>
      <AppText variant="label" color={selected ? colors.white : colors.navy}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  copy: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  block: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  calendar: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.navy,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayFace: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: {
    backgroundColor: colors.greenDark,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.greenDark,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.greenDark,
    borderColor: colors.greenDark,
  },
  input: {
    minHeight: 96,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  footer: {
    paddingTop: spacing.md,
  },
  sent: {
    flex: 1,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  summary: {
    backgroundColor: colors.greenSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  summaryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.navy,
  },
  when: {
    marginTop: spacing.xs,
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.greenDark,
  },
});
