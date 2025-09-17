import {Request} from '../../../requestHandler/requestHandler';
import {Jobs} from '../../endpoints/jobs';

export const GetAllMyJobsApi = handleLoading => {
  return Request({
    method: 'GET',
    url: Jobs.myJobs,
    handleLoading,
  });
};
