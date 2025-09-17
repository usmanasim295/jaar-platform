import {Request} from '../../../requestHandler/requestHandler';
import {Auth} from '../../endpoints/auth';

export const ChangePasswordApi = (handleLoading, token, data) => {
  return Request({
    method: 'POST',
    url: Auth.changePassword,
    token,
    data,
    handleLoading,
  });
};
