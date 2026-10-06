import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../components/common/AppText';
import { colors, fonts, spacing } from '../../core/theme';

interface Props {
  title: string;
  body: string;
}

export function SimpleTabScreen({ title, body }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <AppText variant="h1" style={styles.heading}>
        {title}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.body}>
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  heading: {
    fontSize: 36,
    lineHeight: 44,
    color: colors.navy,
    fontFamily: fonts.semibold,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 26,
  },
});
