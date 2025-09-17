import {Request} from '../../../requestHandler/requestHandler';
import {Jobs} from '../../endpoints/jobs';

export const CreateJobApi = (handleLoading, data) => {
  return Request({
    method: 'POST',
    url: Jobs.job,
    handleLoading,
    data,
  });
};
