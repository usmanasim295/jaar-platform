import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Layout} from '../../../generalStyles/layout';
import BottomTab from '../../../components/bottomTab/bottomTab';
import {styles} from './styles/styles';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Colors} from '../../../generalStyles/theme';
import {Options} from '../../../assets/icons';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {useSelector} from 'react-redux';
import {roles} from '../../../constants/roles';
import {useTranslation} from 'react-i18next';
import {GetAllMyJobsApi} from '../../../services/apis/jobs/getAllMyJobs';
import {ApproveCommunityJobApi} from '../../../services/apis/jobs/approveJobs';

const Services = () => {
  const navigation = useNavigation();
  const {role} = useSelector(state => state.auth);
  const {t} = useTranslation();

  const tabs = [t('requestedServices'), t('pastServices')];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const [inactiveJobs, setInActiveJobs] = useState([]);

  const activeStatuses = [
    'IN_PROGRESS',
    'OPEN',
    'POSTED_BY_LEADER',
    'SENT_TO_LEADER',
  ];
  const inactiveStatuses = ['COMPLETED', 'CANCELLED'];
  const separateJobs = jobs => {
    const activeJobs = [];
    const inactiveJobs = [];

    jobs.forEach(job => {
      if (activeStatuses.includes(job.status)) {
        activeJobs.push(job);
      } else if (inactiveStatuses.includes(job.status)) {
        inactiveJobs.push(job);
      }
    });

    return {activeJobs, inactiveJobs};
  };
  const handleLoading = loading => {
    setLoading(loading);
  };
  const getAllPostedJobs = async handleLoading => {
    const response = await GetAllMyJobsApi(handleLoading);
    if (response) {
      const {activeJobs, inactiveJobs} = separateJobs(response);
      setActiveJobs(activeJobs);
      setInActiveJobs(inactiveJobs);
      console.log('response', inactiveJobs);
    }
  };
  const approveCommunityJob = async id => {
    console.log('id', id);
    const response = await ApproveCommunityJobApi(handleLoading, id);
    if (response) {
      console.log('response', response);
      getAllPostedJobs(() => {});
    }
  };
  useFocusEffect(
    useCallback(() => {
      getAllPostedJobs(handleLoading);
    }, []),
  );

  // pick jobs based on selected tab
  const jobsToRender =
    selectedTab === t('requestedServices') ? activeJobs : inactiveJobs;

  return (
    <ScrollView
      style={[Layout.container]}
      contentContainerStyle={styles.containerPadding}
      showsVerticalScrollIndicator={false}>
      <View style={styles.tabContainer}>
        {tabs.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={() => setSelectedTab(item)}
              key={index}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    selectedTab == item ? Colors.Greyish : Colors.White,
                },
              ]}>
              <Text style={Fonts.Jakarta_Sans_SemiBold_14_Primary}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.services}>
        {jobsToRender.map((item, index) => {
          return (
            <TouchableOpacity style={styles.serviceCard} key={index}>
              <View style={styles.serviceTopContainer}>
                <Text style={Fonts.Jakarta_Sans_SemiBold_16_Black}>
                  {item?.title}
                </Text>
                <TouchableOpacity>
                  <Options />
                </TouchableOpacity>
              </View>
              <Text style={styles.description}>{item?.description}</Text>
              <Text style={Fonts.Jakarta_Sans_Medium_14_Black}>
                {t('time&Date')}
              </Text>
              <View style={styles.dateTimeAndStatusContainer}>
                <View style={styles.timeAndDateContainer}>
                  <View style={styles.timeAndDate}>
                    <Text>{item?.timeSlot || 'N/A'}</Text>
                  </View>
                  <View style={styles.timeAndDate}>
                    <Text>{item?.startDate?.split('T')[0] || 'N/A'}</Text>
                  </View>
                </View>
                {role == roles.leader && item?.status !== 'POSTED_BY_LEADER' ? (
                  <TouchableOpacity
                    style={styles.postJobBtn}
                    onPress={() => approveCommunityJob(item?.id)}>
                    <Text style={Fonts.Jakarta_Sans_Medium_12_White}>
                      {t('postJob')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.statusContainer}>
                    <Text style={Fonts.Jakarta_Sans_Regular_12_Black}>
                      {t('status')} :{' '}
                    </Text>
                    <Text
                      style={[
                        Fonts.Jakarta_Sans_SemiBold_12_Orange,
                        {
                          color:
                            item?.status === 'COMPLETED'
                              ? Colors.Green
                              : Colors.Red,
                        },
                      ]}>
                      {item?.status}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        {loading ? (
          <ActivityIndicator style={{marginTop: HEIGHT_BASE_RATIO(180)}} />
        ) : (
          jobsToRender.length == 0 && (
            <Text
              style={{
                ...Fonts.Jakarta_Sans_Medium_16_Black,
                marginTop: HEIGHT_BASE_RATIO(180),
                alignSelf: 'center',
              }}>
              {t('No')} {selectedTab}
            </Text>
          )
        )}
      </View>
    </ScrollView>
  );
};

export default Services;
