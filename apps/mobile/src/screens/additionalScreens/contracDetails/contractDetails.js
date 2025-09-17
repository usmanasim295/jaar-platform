import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderComponent from '../../../components/header/header';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {Colors} from '../../../generalStyles/theme';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Layout} from '../../../generalStyles/layout';
import {Man} from '../../../assets/images';
import {Cancel, Medal, Star} from '../../../assets/icons';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import styles from './styles/styles';
import {useSelector} from 'react-redux';
import {roles} from '../../../constants/roles';
import {useTranslation} from 'react-i18next';
import {GetBidsAgainstJobApi} from '../../../services/apis/jobs/getBidsAgainstJob';
import {
  GetUpdateBidStatusApi,
  UpdateBidStatusApi,
} from '../../../services/apis/jobs/updateBidStatus';

const ContractDetails = () => {
  const navigation = useNavigation();
  const {role} = useSelector(state => state.auth);
  const {t} = useTranslation();
  const {params} = useRoute();
  const {id} = params;

  const [tab, selectTab] = useState('Recommendations');
  const [loading, setLoading] = useState(false);
  const [bids, setBids] = useState(false);

  const handleLoading = loading => {
    setLoading(loading);
  };
  const getBidsAgainstJobFunc = async () => {
    console.log('params', id);
    const params = {jobId: id};
    const response = await GetBidsAgainstJobApi(handleLoading, params);
    if (response) {
      console.log('response', response);
      setBids(response);
    }
  };

  const updateBidStatusFunc = async (id, status) => {
    const data = JSON.stringify({status: status});
    console.log('params and data', data);
    const response = await UpdateBidStatusApi(handleLoading, data, id);
    if (response) {
      console.log('response', response);
      getBidsAgainstJobFunc();
      // setBids(response);
    }
  };

  const contracts = [1, 2, 3, 4];

  useEffect(() => {
    getBidsAgainstJobFunc();
  }, []);
  return (
    <>
      <NestedHeader screen={'Details'} />
      <ScrollView
        style={Layout.container}
        contentContainerStyle={[
          Layout.generalPaddingHorizontal,
          styles.contentContainerPaddingBottom,
        ]}>
        {/* {role == roles.leader && (
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => selectTab('Recommendations')}
              style={[
                styles.tabBtn,
                {
                  backgroundColor:
                    tab == 'Recommendations'
                      ? Colors.FoundationBlue
                      : Colors.White,
                },
              ]}>
              <Text
                style={
                  tab == 'Recommendations'
                    ? Fonts.Jakarta_Sans_Regular_14_Primary
                    : Fonts.Jakarta_Sans_Regular_14_Black
                }>
                {t('recommendations')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => selectTab('Bid On Job')}
              style={[
                styles.tabBtn,
                {
                  backgroundColor:
                    tab == 'Bid On Job' ? Colors.FoundationBlue : Colors.White,
                },
              ]}>
              <Text
                style={
                  tab == 'Bid On Job'
                    ? Fonts.Jakarta_Sans_Regular_14_Primary
                    : Fonts.Jakarta_Sans_Regular_14_Black
                }>
                {t('bidOnJob')}
              </Text>
            </TouchableOpacity>
          </View>
        )} */}
        <Text style={styles.rfqBadgeText}>{params?.title}</Text>
        {bids && !loading ? (
          bids?.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  navigation.navigate(
                    RootStackConfig.nestedStacks.additionalScreensStack.route,
                    {
                      screen:
                        AdditionalScreensStack.nestedScreens
                          .singleContractDetails.route,
                      params: {
                        bid: item,
                      },
                    },
                  );
                }}
                style={styles.card}>
                {console.log('bid', item)}
                <View style={styles.textContainer}>
                  <Image source={Man} />
                  <View style={styles.namedetail}>
                    <Text style={styles.name}>
                      {item?.serviceProvider?.name}
                    </Text>
                    <Text style={styles.role}>{t('contractor')}</Text>
                  </View>
                </View>
                <Text style={styles.date}>{item?.createdAt.split('T')[0]}</Text>
                <Text style={styles.description}>{item?.coverLetter}</Text>
                {role == roles.leader && (
                  <Text style={styles.moneyText}>
                    {t('avgPriceRange') + item?.totalPrice}
                  </Text>
                )}
                <View style={styles.viewPosition}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.medal}>
                      <Medal source={Medal} style={styles.medalIcon} />
                      <Text style={styles.medalText}>{t('verified')}</Text>
                    </View>
                    <View style={styles.star}>
                      <Star source={Star} style={styles.starIcon} />
                      <Text style={styles.starText}>
                        {item?.serviceProvider?.rating}
                      </Text>
                    </View>
                  </View>
                  {role == roles.leader && item?.status == 'PENDING' ? (
                    <>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => {
                            updateBidStatusFunc(item?.id, 'REJECTED');
                          }}>
                          <Cancel />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.hireBtn}
                          onPress={() => {
                            updateBidStatusFunc(item?.id, 'ACCEPTED');
                          }}>
                          <Text style={Fonts.Jakarta_Sans_Medium_12_White}>
                            {t('hire')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.bidText}>
                      {t('bid')}: {'SAR ' + item?.totalPrice}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <ActivityIndicator style={{marginTop: HEIGHT_BASE_RATIO(250)}} />
        )}
        {bids && bids?.length == 0 && (
          <Text style={styles.noBids}>No bids right now!</Text>
        )}
      </ScrollView>
    </>
  );
};

export default ContractDetails;
