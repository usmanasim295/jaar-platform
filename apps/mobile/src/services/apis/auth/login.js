import {Request} from '../../../requestHandler/requestHandler';
import {Auth} from '../../endpoints/auth';

export const LoginApi = (handleLoading, token, data) => {
  return Request({method: 'POST', url: Auth.login, token, data, handleLoading});
};
