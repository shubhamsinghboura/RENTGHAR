import { Image, StyleSheet, View } from 'react-native';
import { House } from 'lucide-react-native';

import { colors, radius, spacing } from '../../core/theme';

import { AppText } from './AppText';
import { ImageAssets } from '../ImageAssets';

export function BrandMark() {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Image source={ImageAssets.appIcon} style={styles.logoImg} resizeMode='contain'/>
      </View>
      <AppText variant="h2" color={colors.navy}>
        RENTGHAR
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 45,
    height: 45,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg:{
    width:30,height:30, borderRadius: 5
  }
});
