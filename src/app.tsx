// Copyright (c) 2026 @SilvinoR
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

import { StyleSheet, View } from 'react-native';

import { COPYRIGHT_NOTICE } from './core/copyright-notice';
import { copyrightNoticeStyle, startupBackground } from './core/theme';
import { Icon } from './ui/platform/icon';
import { Text } from './ui/platform/text';

export default function App() {
  return (
    <View style={styles.container}>
      <Text
        leading={
          <Icon name="copyright" size={copyrightNoticeStyle.fontSize} color={copyrightNoticeStyle.color} copyText="©" />
        }
        accessibilityLabel={`Copyright ${COPYRIGHT_NOTICE}`}
        webCss="sticky-bottom mt-auto pb-2 text-center text-white small"
        webStyle={webNoticeStyle}
        nativeContainerStyle={styles.nativeNotice}
        nativeStyle={styles.nativeNoticeText}
      >
        {COPYRIGHT_NOTICE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: startupBackground,
  },
  nativeNotice: {
    alignSelf: 'center',
    marginTop: 'auto',
    paddingBottom: copyrightNoticeStyle.paddingBottom,
  },
  nativeNoticeText: {
    color: copyrightNoticeStyle.color,
    fontSize: copyrightNoticeStyle.fontSize,
    textAlign: 'center',
  },
});

const webNoticeStyle = {
  position: 'sticky' as const,
  bottom: 0,
  marginTop: 'auto',
  color: copyrightNoticeStyle.color,
  fontSize: copyrightNoticeStyle.fontSize,
  paddingBottom: copyrightNoticeStyle.paddingBottom,
  textAlign: 'center' as const,
};
