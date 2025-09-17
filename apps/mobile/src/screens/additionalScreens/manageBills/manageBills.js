import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, Image} from 'react-native';
import {
  Bills,
  Electricity,
  InternetCharges,
  ServiceCharges,
  Water,
} from '../../../assets/svgs/index';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Colors} from '../../../generalStyles/theme';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {useSelector} from 'react-redux';
import {Chat} from '../../../assets/images';
import {BillIcon} from '../../../assets/icons';
import {styles} from './styles/styles';
import {roles} from '../../../constants/roles';
import {useTranslation} from 'react-i18next';

const icons = {
  utility: <Bills width={40} height={40} />,
  internet: <InternetCharges width={40} height={40} />,
  community: <Bills width={40} height={40} />,
  service: <ServiceCharges width={40} height={40} />,
  water: <Water width={40} height={40} />,
  electricity: <Electricity width={40} height={40} />,
};

export default function BillsScreen() {
  const navigation = useNavigation();
  const {role} = useSelector(state => state.auth);
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

  const billTabs = [t('allBills'), t('unpaidBills'), t('paidBills')];

  const [selectedTab, setSelectedTab] = useState(billTabs[0]);

  const categories = [
    {
      id: '1',
      title: t('utilityBills'),
      icon: icons.utility,
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.utilityBills.route,
          },
        );
      },
    },
    {
      id: '2',
      title: t('internetCharges'),
      icon: icons.internet,
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.utilityBills.route,
          },
        );
      },
    },
    {
      id: '3',
      title: t('communityCharges'),
      icon: icons.community,
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.communityCharges.route,
          },
        );
      },
    },
    {
      id: '4',
      title: t('serviceCharges'),
      icon: icons.service,
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.utilityBills.route,
          },
        );
      },
    },
  ];

  const contracts = [
    {
      id: '1',
      status: t('paid'),
      dueDate: '09/09/25',
      name: 'Darrell Steward',
      apartment: 'Apartment 3',
      contractTitle: 'Plumbing Contract',
      description:
        'consectetur adipiscing elit. Proin molestie consectetur adipiscing elit. Proin molestie',
      amount: 'SAR 850',
      duration: '1 Year',
      type: 'Monthly',
      image: Chat,
    },
    {
      id: '2',
      status: t('unpaid'),
      dueDate: '09/09/25',
      name: 'Laura Levy',
      apartment: 'Apartment 5',
      contractTitle: 'Plumbing Contract',
      description:
        'consectetur adipiscing elit. Proin molestie consectetur adipiscing elit. Proin molestie',
      amount: 'SAR 850',
      duration: '1 Year',
      type: 'Monthly',
      image: Chat,
    },
  ];

  const ContractCard = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.billContractCard}
        onPress={() =>
          navigation.navigate(
            RootStackConfig.nestedStacks.additionalScreensStack.route,
            {
              screen: AdditionalScreensStack.nestedScreens.payBills.route,
              params: {bill: item.contractTitle, contract: true},
            },
          )
        }>
        <View style={styles.cardTopContainer}>
          <View>
            <Text style={Fonts.Jakarta_Sans_Regular_12_Black}>
              {t('status')}:{' '}
              <Text
                style={{
                  color: item.status === t('paid') ? Colors.Green : Colors.Red,
                }}>
                {item.status}
              </Text>
            </Text>
            <Text style={styles.dueDate}>
              {t('dueDate')}: {item.dueDate}
            </Text>
          </View>
          <BillIcon />
        </View>
        <View style={styles.line} />
        <View style={styles.userRow}>
          <Image source={item.image} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.apartment}>{item.apartment}</Text>
          </View>
        </View>

        <Text style={styles.contractTitle}>{item.contractTitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.amount}>{item.amount}</Text>

        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={Fonts.Jakarta_Sans_Medium_12_Black}>
              {t('duration')}: {item.duration}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={Fonts.Jakarta_Sans_Medium_12_Black}>
              {t('type')}: {item.type}
            </Text>
          </View>
          {item.status === t('unpaid') && (
            <TouchableOpacity style={styles.reminderBtn}>
              <Text style={Fonts.Jakarta_Sans_Medium_12_White}>
                {t('sendReminder')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <NestedHeader screen={t('manageBills')} />
      <View style={styles.container}>
        {role == roles.owner ? (
          <>
            <View style={styles.grid}>
              {categories.map(item => (
                <TouchableOpacity
                  onPress={item.onPress}
                  key={item.id}
                  style={styles.card}>
                  {item.icon}
                  <Text style={styles.cardText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.header}>{t('recentlyPaidBills')}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>{t('viewAll')}</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={paidBills}
              keyExtractor={item => item.id}
              style={styles.billsContainer}
              renderItem={({item}) => (
                <View style={styles.billItem}>
                  <View style={styles.billIcon}>{item.icon}</View>
                  <Text style={styles.billText}>{item.title}</Text>
                  <Text style={styles.billPrice}>{item.price}</Text>
                </View>
              )}
            />
          </>
        ) : (
          <>
            <View style={styles.tabsContainer}>
              {billTabs.map((item, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTab(item);
                    }}
                    key={index}
                    style={[
                      styles.tab,
                      {
                        backgroundColor:
                          selectedTab == item
                            ? Colors.FoundationBlue
                            : Colors.White,
                      },
                    ]}>
                    <Text style={Fonts.Jakarta_Sans_SemiBold_14_Primary}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <FlatList
              data={contracts}
              keyExtractor={item => item.id}
              renderItem={({item}) => <ContractCard item={item} />}
              contentContainerStyle={styles.billContractContainer}
            />
          </>
        )}
      </View>
    </>
  );
}
