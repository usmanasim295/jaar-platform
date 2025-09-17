import {Request} from '../../../requestHandler/requestHandler';
import {Jobs} from '../../endpoints/jobs';

export const ApproveCommunityJobApi = (handleLoading, id) => {
  return Request({
    method: 'PATCH',
    url: Jobs.job + `/${id}` + Jobs.approveCommunityJob,
    handleLoading,
  });
};
