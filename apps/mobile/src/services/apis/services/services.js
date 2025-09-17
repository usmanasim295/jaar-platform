import {Request} from '../../../requestHandler/requestHandler';
import {Services} from '../../endpoints/services';

export const GetAllServicesApi = handleLoading => {
  return Request({
    method: 'GET',
    url: Services.allServices,
    handleLoading,
  });
};
