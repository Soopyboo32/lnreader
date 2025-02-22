import { StyleSheet, View } from 'react-native';
import { Button } from '@components';
import { remoteReader } from '@screens/reader/remote/remoteReader';

export const ReaderExternalButton = () => {
  return (
    <View style={styles.row}>
      <Button
        title={'Read on other device'}
        mode="contained"
        onPress={() => {
          remoteReader.enable();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
});
