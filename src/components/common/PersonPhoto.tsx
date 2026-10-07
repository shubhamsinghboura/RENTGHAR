import { Image, StyleSheet, View } from 'react-native';

import { colors, fonts } from '../../core/theme';

import { AppText } from './AppText';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function PersonPhoto({ uri, name, size }: { uri?: string; name: string; size: number }) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    return <Image source={{ uri }} style={[styles.base, shape]} accessibilityLabel={name} />;
  }
  return (
    <View style={[styles.base, styles.empty, shape]} accessibilityLabel={name}>
      <AppText style={[styles.initials, { fontSize: size * 0.36, lineHeight: size * 0.44 }]}>{initials(name)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.navySoft,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy,
  },
  initials: {
    fontFamily: fonts.semibold,
    color: colors.white,
  },
});
