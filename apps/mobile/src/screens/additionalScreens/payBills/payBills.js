import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
import React, {useState, useRef} from 'react';
import {styles} from './styles/styles';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {Colors} from '../../../generalStyles/theme';
import {ApplePay, GoooglePay, VisaLogo, BillIcon} from '../../../assets/icons';
import {Fonts} from '../../../generalStyles/fontStyles';
import SwipeToPay from '../../../components/swipeToPay/swipeToPay';
import ToggleSwitch from '../../../components/toggleSwitch/toggleSwitch';
import {useNavigation} from '@react-navigation/native';
import {Chat} from '../../../assets/images';
import PaymentBottomSheet from '../../../components/paymentBottomSheet/paymentBottomSheet';
import AddPaymentBottomSheet from '../../../components/addPayment/addPaymentBottomSheet';
import {useTranslation} from 'react-i18next';

const PayBills = ({route}) => {
  const navigation = useNavigation();
  const params = route.params;
  const {bill} = params;
  const {t} = useTranslation();

  const [autoPay, setAutoPay] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState({
    id: 'apple',
    icon: <ApplePay />,
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'row1',
      type: 'row',
      items: [
        {id: 'apple', label: '', icon: <ApplePay />},
        {id: 'google', label: '', icon: <GoooglePay />},
      ],
    },
    {
      id: '1',
      icon: <VisaLogo />,
      data: 'XXXX XXXX XXXX 5232',
    },
  ]);

  const refRBSheet = useRef();
  const refAddPaymentSheet = useRef();

  const billLabelsAndValues = [
    {label: t('currentBill'), value: 800, type: 'amount'},
    {label: t('platformFee'), value: 0.01, type: 'percentage'},
    {label: t('currentBill'), value: 800, type: 'amount'},
  ];

  const item = {
    id: '1',
    status: 'Paid',
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
  };

  return (
    <>
      <NestedHeader screen={bill} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainerPadding}>
        {/* ✅ Payment Method Row */}
        <View style={styles.paymentMethod}>
          <View style={styles.iconContainer}>
            {selectedMethod.icon}
            {selectedMethod.label ? (
              <Text style={Fonts.Jakarta_Sans_SemiBold_16_Black}>
                {selectedMethod.label}
              </Text>
            ) : (
              <Text style={Fonts.Jakarta_Sans_SemiBold_24_Black}></Text>
            )}
          </View>
          <TouchableOpacity onPress={() => refRBSheet.current.open()}>
            <Text style={Fonts.Jakarta_Sans_SemiBold_12_Green}>
              {t('changePaymentMethod')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Contract or Non-contract bill rendering */}
        {params.contract ? (
          <View style={styles.billContractCard}>
            <View style={styles.cardTopContainer}>
              <View>
                <Text style={Fonts.Jakarta_Sans_Regular_12_Black}>
                  {t('status')}:{' '}
                  <Text
                    style={{
                      color: item.status === 'Paid' ? Colors.Green : Colors.Red,
                    }}>
                    {item.status}
                  </Text>
                </Text>
                <Text style={styles.dueDate}>
                  {' '}
                  {t('dueDate')}: {item.dueDate}
                  {item.dueDate}
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
                  {t('duration')}:{item.duration}
                </Text>
              </View>
              <View style={styles.tag}>
                <Text style={Fonts.Jakarta_Sans_Medium_12_Black}>
                  {t('type')}: {item.type}
                </Text>
              </View>
            </View>

            {/* ✅ Bill Summary */}
            <View style={styles.textContainer}>
              {billLabelsAndValues.map((item, index) => (
                <View style={styles.paymentLabelContainer} key={index}>
                  <Text style={styles.paymentLabel}>{item.label}</Text>
                  {item.type === 'amount' ? (
                    <Text style={styles.paymentValue}>${item?.value}</Text>
                  ) : (
                    <Text style={styles.paymentValue}>{item?.value}%</Text>
                  )}
                </View>
              ))}
            </View>

            {/* ✅ AutoPay */}
            <View style={styles.switch}>
              <Text style={Fonts.Jakarta_Sans_Regular_14_Black}>
                {t('  Automatically pay every month')}
              </Text>
              <ToggleSwitch isOn={autoPay} onToggle={setAutoPay} />
            </View>
            {autoPay && (
              <View style={styles.warningCard}>
                <Text style={Fonts.Jakarta_Sans_Regular_14_Grey}>
                  By selecting automatic billing will be done automatically
                  every month for this bill you can change it from this screen
                  later.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.textContainer}>
              {billLabelsAndValues.map((item, index) => (
                <View style={styles.paymentLabelContainer} key={index}>
                  <Text style={styles.paymentLabel}>{item.label}</Text>
                  {item.type === 'amount' ? (
                    <Text style={styles.paymentValue}>${item?.value}</Text>
                  ) : (
                    <Text style={styles.paymentValue}>{item?.value}%</Text>
                  )}
                </View>
              ))}
            </View>
            <View style={styles.switch}>
              <Text style={Fonts.Jakarta_Sans_Regular_14_Black}>
                {t(' automaticallyPayEveryMonth')}
              </Text>
              <ToggleSwitch isOn={autoPay} onToggle={setAutoPay} />
            </View>
            {autoPay && (
              <View style={styles.warningCard}>
                <Text style={Fonts.Jakarta_Sans_Regular_14_Grey}>
                  By selecting automatic billing will be done automatically
                  every month for this bill you can change it from this screen
                  later.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ✅ Swipe to Pay */}
      <View style={styles.swipeToPayContainer}>
        <SwipeToPay onPay={() => navigation.goBack()} />
      </View>

      {/* ✅ Bottom Sheets */}
      <PaymentBottomSheet
        ref={refRBSheet}
        methods={paymentMethods}
        onSelect={item => {
          setSelectedMethod(item);
          refRBSheet.current.close();
        }}
        onAddPress={() => {
          refRBSheet.current.close();
          refAddPaymentSheet.current.open();
        }}
      />

      <AddPaymentBottomSheet
        ref={refAddPaymentSheet}
        onAdd={() => {
          refAddPaymentSheet.current.close();
          // Example: Add a new card dynamically
          setPaymentMethods(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              icon: <VisaLogo />,
              data: 'XXXX XXXX XXXX 1111',
            },
          ]);
        }}
      />
    </>
  );
};

export default PayBills;
