import axios from 'axios';
import {base_url} from '@env';
import {Alert} from 'react-native';
import {store} from '../redux/store';

const apiClient = axios.create({
  baseURL: base_url,
  // timeout: 15000,
});

export const Request = async ({
  method = 'GET',
  url,
  data = null,
  params = null,
  handleLoading = () => {},
}) => {
  try {
    handleLoading(true);
    const state = store.getState();
    const {lang} = state.auth;
    const {token} = state.auth;
    const paramsWithLang = {...params, lang: lang};
    console.log('token', token);
    console.log('base_url', base_url);

    const isFormData = data instanceof FormData;

    const headers = {
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(method !== 'GET' &&
        (isFormData
          ? {'Content-Type': 'multipart/form-data'}
          : {'Content-Type': 'application/json'})),
    };
    const config = {
      method,
      url,
      headers,
      params: paramsWithLang,
    };
    console.log('config', config, base_url + url);

    if (data !== null) {
      config.data = data;
    }

    const response = await apiClient.request(config);
    return response.data;
  } catch (e) {
    console.log(`API error [${method} ${url}]`, e?.response || e);

    Alert.alert(
      'Error Occurred',
      e?.response?.data?.message || e.message || 'Something went wrong',
    );
    throw e;
  } finally {
    handleLoading(false);
  }
};
