import {Request} from '../../../requestHandler/requestHandler';
import {Auth} from '../../endpoints/auth';

export const SignupApi = (handleLoading, data) => {
  return Request({
    method: 'POST',
    url: Auth.signup,
    data,
    handleLoading,
  });
};
