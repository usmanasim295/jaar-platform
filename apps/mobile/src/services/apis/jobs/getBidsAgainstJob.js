import {Request} from '../../../requestHandler/requestHandler';
import {Jobs} from '../../endpoints/jobs';

export const GetBidsAgainstJobApi = (handleLoading, params) => {
  return Request({
    method: 'GET',
    url: Jobs.bid,
    handleLoading,
    params,
  });
};
