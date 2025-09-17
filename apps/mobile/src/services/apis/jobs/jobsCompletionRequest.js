import {Request} from '../../../requestHandler/requestHandler';
import {Jobs} from '../../endpoints/jobs';

export const GetJobsCompletionRequestApi = handleLoading => {
  return Request({
    method: 'GET',
    url: Jobs.jobCompletionRequest,
    handleLoading,
  });
};
