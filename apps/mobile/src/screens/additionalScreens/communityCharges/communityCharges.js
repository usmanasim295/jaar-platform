import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {
  Bills,
  Electricity,
  InternetCharges,
  ServiceCharges,
  Water,
} from '../../../assets/svgs/index';
import HeaderComponent from '../../../components/header/header';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Colors} from '../../../generalStyles/theme';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {Layout} from '../../../generalStyles/layout';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {styles} from './styles/styles';
import {Chat} from '../../../assets/images';
import {useTranslation} from 'react-i18next';

const paidBills = [
  {id: '1', title: 'plumbingContract', price: '$800'},
  {id: '2', title: 'acCleaning', price: '$1000'},
];

const CommunityCharges = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <>
      <NestedHeader screen={t('communityCharges')} />
      <View style={styles.container}>
        <FlatList
          data={paidBills}
          keyExtractor={item => item.id}
          style={styles.billsContainer}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.billItem}
              onPress={() => {
                navigation.navigate(
                  RootStackConfig.nestedStacks.additionalScreensStack.route,
                  {
                    screen: AdditionalScreensStack.nestedScreens.payBills.route,
                    params: {bill: t(item.title)},
                  },
                );
              }}>
              <Image
                source={Chat}
                style={styles.contractImage}
                borderRadius={30}
              />
              <Text style={styles.billText}>{item.title}</Text>
              <Text style={styles.billPrice}>{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
};

export default CommunityCharges;
