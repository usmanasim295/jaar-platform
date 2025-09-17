import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import {JAR, Notification, Headphone} from '../../assets/svgs/index';
import {Icon} from 'react-native-paper';
import {Colors} from '../../generalStyles/theme';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';
import {useSelector} from 'react-redux';
import {Fonts} from '../../generalStyles/fontStyles';
import {roles} from '../../constants/roles';
import {MessageIcon} from '../../assets/icons';

const HeaderComponent = () => {
  const {activeScreen} = useSelector(state => state.main);
  const {role} = useSelector(state => state.auth);

  return (
    <>
      <StatusBar translucent barStyle={'dark-content'} />
      <View style={styles.header}>
        {activeScreen == 'Home' ? (
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={styles.jar}>
              <JAR width={41} height={44} left={40} />
            </View>
            <View style={styles.Icons}>
              <TouchableOpacity
                onPress={() => console.log('Notification pressed')}>
                <Notification width={40} height={40} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => console.log('Headphone pressed')}>
                {role == roles.owner ? (
                  <Headphone width={40} height={40} />
                ) : (
                  <MessageIcon />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text
            style={{
              ...Fonts.Jakarta_Sans_SemiBold_18_Black,
              alignSelf: 'center',
              textAlign: 'center',
            }}>
            {activeScreen}
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.White,
    // flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.Stroke,
    paddingVertical: HEIGHT_BASE_RATIO(18),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
  },
  jar: {flex: 2, alignItems: 'center'},

  Icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(8),
  },
});

export default HeaderComponent;
