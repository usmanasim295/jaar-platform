import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';
import {Colors} from '../../../generalStyles/theme';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Layout} from '../../../generalStyles/layout';
import {useNavigation} from '@react-navigation/native';
import HeaderComponent from '../../../components/header/header';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {styles} from './styles/styles';
import {useTranslation} from 'react-i18next';
import {GetAllMyJobsApi} from '../../../services/apis/jobs/getAllMyJobs';
import {ActivityIndicator} from 'react-native-paper';
import CustomButton from '../../../components/customButton/customButton';
import {CommonStyles} from '../../authentication/commonStyles/commonStyles';

const Rfqs = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const handleLoading = loading => {
    setLoading(loading);
  };
  const getAllPostedJobs = async handleLoading => {
    const response = await GetAllMyJobsApi(handleLoading);
    if (response) {
      setJobs(response);
      console.log('response', response);
    }
  };
  const RfqsData = [
    {
      title: t('plumbingContract'),
      subtitle:
        'consectetur adipiscing elit. Proin molestie consectetur adipiscing elit. Proin molestie ',

      Time: 'Posted 2 hours ago',
      Proposal: 'Proposals: 03',
    },
  ];

  useEffect(() => {
    getAllPostedJobs(handleLoading);
  }, []);

  return (
    <>
      <NestedHeader screen={t('rFQs')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[Layout.container, Layout.generalPaddingHorizontal]}>
        <Text style={styles.rfqBadgeText}>{jobs && jobs?.length} RFQ</Text>

        {loading ? (
          <ActivityIndicator style={{marginTop: HEIGHT_BASE_RATIO(290)}} />
        ) : (
          jobs?.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate(
                    RootStackConfig.nestedStacks.additionalScreensStack.route,
                    {
                      screen:
                        AdditionalScreensStack.nestedScreens.contractDetails
                          .route,
                      params: item,
                    },
                  );
                }}>
                <View style={styles.tab}>
                  <Text style={styles.title}>{item?.title}</Text>
                  <Text style={styles.subtitle}>{item?.description}</Text>
                  <View style={styles.viewPosition}>
                    <Text style={styles.time}>
                      {item?.startDate?.split('T')[0] || 'N/A'}
                    </Text>
                    <Text style={styles.proposal}>{item?.bids?.length}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          bottom: 0,
          ...Layout.generalPaddingHorizontal,
        }}>
        <CustomButton
          text={'View Completed Jobs'}
          backgroundColor={Colors.GhostWhite}
          textStyle={[CommonStyles.buttonText, {color: Colors.Primary}]}
          additionalCommonStyles={CommonStyles.button}
          width="100%"
          height={HEIGHT_BASE_RATIO(60)}
          marginTop={HEIGHT_BASE_RATIO(32)}
          borderColor={Colors.White}
          onPress={() =>
            navigation.navigate(
              AdditionalScreensStack.nestedScreens.jobCompletionRequest.route,
            )
          }
          borderRadius={12}
        />
      </View>
    </>
  );
};

export default Rfqs;
