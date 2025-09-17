import {Request} from '../../../requestHandler/requestHandler';
import {Jobs} from '../../endpoints/jobs';

export const UpdateBidStatusApi = (handleLoading, data, id) => {
  return Request({
    method: 'PATCH',
    url: Jobs.bid + `/${id}/` + Jobs.status,
    handleLoading,
    data,
  });
};
