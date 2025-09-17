import {Dimensions, PixelRatio, Platform} from 'react-native';
// import Geolocation from 'react-native-geolocation-service';
// import {parsePhoneNumber} from 'libphonenumber-js';
// import axios from '../requests/axios';
// import {GOOGLE_API_KEY} from '@env';
// import {object} from 'yup';
// import {useSelector} from 'react-redux';
import {AuthSlice} from '../redux/slices/authSlice';
import {store} from '../redux/store';
// import messaging from '@react-native-firebase/messaging';

export const DEVICE_WIDTH = Dimensions.get('window').width;
export const DEVICE_HEIGHT = Dimensions.get('window').height;
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const MODAL_HEIGHT = DEVICE_HEIGHT / 1.2;
export const CONTENT_WIDTH = DEVICE_WIDTH - 30;
export const CONTENT_OFFSET = 15;
export const WIDTH_BASE_RATIO = value => {
  const DESIGN_WIDTH = 430;
  const WINDOW_WIDTH = DEVICE_WIDTH;
  const VALUE_IN_SCREEN_WDITH_RATIO = (WINDOW_WIDTH * value) / DESIGN_WIDTH;
  return VALUE_IN_SCREEN_WDITH_RATIO;
};
export const HEIGHT_BASE_RATIO = value => {
  const DESIGN_HEIGHT = 932;
  const WINDOW_HEIGHT = DEVICE_HEIGHT;
  const VALUE_IN_SCREEN_HEIGHT_RATIO = (WINDOW_HEIGHT * value) / DESIGN_HEIGHT;
  return VALUE_IN_SCREEN_HEIGHT_RATIO;
};
export const wp = widthPercent => {
  const elemWidth =
    typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((DEVICE_WIDTH * elemWidth) / 100);
};
export const hp = heightPercent => {
  const elemHeight =
    typeof heightPercent === 'number'
      ? heightPercent
      : parseFloat(heightPercent);

  return PixelRatio.roundToNearestPixel((DEVICE_HEIGHT * elemHeight) / 100);
};
const scale = DEVICE_WIDTH / 320;
export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
}
export const FONT_SIZE = value => {
  return HEIGHT_BASE_RATIO(value);
};
export const PhoneNumberValidate = phone_number => {
  const prefixMap = {
    '03': '+923',
    '0092': '+92',
    92: '+92',
    3: '+923',
  };
  for (const [prefix, value] of Object.entries(prefixMap)) {
    if (phone_number.startsWith(prefix)) {
      return value + phone_number.substring(prefix.length);
    }
  }
  return phone_number;
};
export const truncateText = (text, limit) => {
  if (text?.length <= limit) {
    return text;
  }
  return text?.slice(0, limit) + '...';
};
export const simpleTruncateText = (text, limit) => {
  if (text?.length <= limit) {
    return text;
  }
  return text?.slice(0, limit);
};
export const formatDate = dateString => {
  const date = new Date(dateString);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = days[date.getUTCDay()];
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';

  const formattedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
  const formattedMinutes = minutes.toString().padStart(2, '0'); // Ensure 2 digits for minutes

  const datePart = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${formattedHours}:${formattedMinutes} ${ampm}, ${datePart} ${month} ${year}`;
};
export const calculateAverageRating = reviews => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce(
    (sum, review) => sum + (review.rating || 0),
    0,
  );
  const averageRating = totalRating / reviews.length;

  return averageRating.toFixed(2);
};
export const converToThousands = value => {
  let calculatedValue = value / 1000 + 'k';
  return calculatedValue;
};
export const findProductFromFavourites = (favourites = [], id) => {
  return favourites.includes(id);
};

// export const locationPermission = () =>
//   new Promise(async (resolve, reject) => {
//     if (Platform.OS === 'ios') {
//       try {
//         const permissionStatus = await Geolocation.requestAuthorization(
//           'whenInUse',
//         );
//         if (permissionStatus === 'granted') {
//           return resolve('granted');
//         }
//         reject('Permission not granted');
//       } catch (error) {
//         return reject(error);
//       }
//     }
//     return PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//     )
//       .then(granted => {
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           resolve('granted');
//         }
//         return reject('Location Permission denied');
//       })
//       .catch(error => {
//         console.log('Ask Location permission error: ', error);
//         return reject(error);
//       });
//   });
// export const getCountryInfo = phoneNumber => {
//   try {
//     const parsedNumber = parsePhoneNumber(phoneNumber);

//     if (!parsedNumber || !parsedNumber.country) {
//       throw new Error('Invalid phone number');
//     }

//     return {
//       countryCode: parsedNumber.country, // e.g., 'PK' for Pakistan
//       nationalNumber: parsedNumber.nationalNumber, // e.g., '3420081275'
//       countryCodeNumber: parsedNumber.countryCallingCode,
//     };
//   } catch (error) {
//     return {error: 'Invalid phone number format'};
//   }
// };

export const getDifferences = (obj1, obj2) => {
  const differences = {};

  Object.keys(obj2).forEach(key => {
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      const nestedDiff = getDifferences(obj1[key], obj2[key]); // Recursively check nested objects
      if (nestedDiff && Object.keys(nestedDiff).length > 0) {
        differences[key] = nestedDiff;
      }
    } else if (obj1[key] !== obj2[key]) {
      differences[key] = obj2[key]; // Store the new value from obj2
    }
  });

  return Object.keys(differences).length > 0 ? differences : false;
};

// export const translateText = async (text, targetLang = 'ar', limit = null) => {
//   if (!text) return '';

//   try {
//     const response = await axios.get(
//       `https://translation.googleapis.com/language/translate/v2`,
//       {
//         params: {
//           q: text,
//           target: targetLang,
//           format: 'text',
//           key: GOOGLE_API_KEY,
//         },
//       },
//     );

//     let translatedText = response.data.data.translations[0].translatedText;

//     // Apply truncation if a limit is provided
//     if (limit && translatedText.length > limit) {
//       translatedText = translatedText.substring(0, limit) + '...';
//     }

//     return translatedText;
//   } catch (error) {
//     console.error('Translation Error:', error.response?.data || error.message);
//     return text; // Return original text if translation fails
//   }
// };

export const handleLangChange = (langObj, state) => {
  return state == 'ar' ? langObj?.ar : langObj?.en;
};

export const getColorForInitials = initials => {
  const colors = ['#DA70D6', '#90EE90', '#FFD700', '#FF33A1', '#FFA07A'];
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    const char = initials.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
};
export const shortenName = name => {
  return name
    ?.split(' ')
    ?.map(n => n[0])
    ?.join('')
    ?.substring(0, 2)
    ?.toUpperCase();
};
export const getInitials = fullName => {
  if (typeof fullName !== 'string' || fullName.trim() === '') {
    return '';
  }

  const words = fullName.trim().split(' ');
  const first = words[0]?.charAt(0).toUpperCase() || '';
  const last = words[1]?.charAt(0).toUpperCase() || '';
  return `${first}${last}`;
};

export const logout = () => {
  store.dispatch(AuthSlice.actions.log_out());
};

// export async function requestUserPermission() {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//   if (enabled) {
//     console.log('FCM Permission status:', authStatus);
//   }
// }
