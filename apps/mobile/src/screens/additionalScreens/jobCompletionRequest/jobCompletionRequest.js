import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {GetJobsCompletionRequestApi} from '../../../services/apis/jobs/jobsCompletionRequest';
import {styles} from './styles/styles';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';

const JobCompletionRequest = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(false);

  const handleLoading = loading => {
    setLoading(loading);
  };
  const getJobsCompletionRequestFunc = async () => {
    const response = await GetJobsCompletionRequestApi(handleLoading);
    if (response) {
      console.log('response', response);
      setRequests(response);
    }
  };
  useEffect(() => {
    getJobsCompletionRequestFunc();
  }, []);
  return (
    <>
      <NestedHeader screen={'Requests'} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {loading ? (
          <ActivityIndicator style={{marginTop: HEIGHT_BASE_RATIO(290)}} />
        ) : (
          requests &&
          requests?.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                // onPress={() => {
                //   navigation.navigate(
                //     RootStackConfig.nestedStacks.additionalScreensStack.route,
                //     {
                //       screen:
                //         AdditionalScreensStack.nestedScreens.contractDetails
                //           .route,
                //       params: item,
                //     },
                //   );
                // }}
              >
                <View style={styles.tab}>
                  <Text style={styles.title}>
                    {item?.serviceProvider?.name}
                  </Text>
                  <Text style={styles.subtitle}>
                    {item?.serviceProvider?.reviewNotes}
                  </Text>
                  <Text>Total Jobs: {item?.serviceProvider?.totalJobs}</Text>
                  <Text>
                    Total Earnings:{item?.serviceProvider?.totalEarnings}
                  </Text>
                  <View style={styles.viewPosition}>
                    <Text style={styles.time}>
                      {item?.createdAt?.split('T')[0] || 'N/A'}
                    </Text>
                    {/* 
                    <Text style={styles.proposal}>
                      {item?.serviceProvider?.rating}
                    </Text> */}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </>
  );
};

export default JobCompletionRequest;
