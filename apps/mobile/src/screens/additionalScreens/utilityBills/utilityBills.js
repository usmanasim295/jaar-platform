import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
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
import {useTranslation} from 'react-i18next';
import {t} from 'i18next';

const icons = {
  utility: <Bills width={40} height={40} />,
  internet: <InternetCharges width={40} height={40} />,
  community: <Bills width={40} height={40} />,
  service: <ServiceCharges width={40} height={40} />,
  water: <Water width={40} height={40} />,
  electricity: <Electricity width={40} height={40} />,
};

export default function UtilityBills() {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const paidBills = [
    {id: '1', title: t('waterBill'), price: '$800', icon: icons.water},
    {
      id: '2',
      title: t('electricityBill'),
      price: '$1000',
      icon: icons.electricity,
    },
  ];
  return (
    <>
      <NestedHeader screen={t('utilitybills')} />
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
                    params: {bill: item.title, contract: false},
                  },
                );
              }}>
              <View style={styles.billIcon}>{item.icon}</View>
              <Text style={styles.billText}>{item.title}</Text>
              <Text style={styles.billPrice}>{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
}
