import AdditionalScreensNavigation from '../navigation/additionalScreensStackNavigation';
import AuthNavigation from '../navigation/authNavigationStack';
import HomeStackNavigation from '../navigation/homeStackNavigation';
import RootStackNavigation from '../navigation/rootStackNavigation';
import AccountSetting from '../screens/additionalScreens/accountSetting/acountSetting';
import Announcements from '../screens/additionalScreens/announcements/announcements';
import ChooseServices from '../screens/additionalScreens/chooseServices/chooseServices';
import CommunityCharges from '../screens/additionalScreens/communityCharges/communityCharges';
import CommunityDiscussion from '../screens/additionalScreens/communityDiscussion/communityDiscussion';
import ContractDetails from '../screens/additionalScreens/contracDetails/contractDetails';
import CreateRfq from '../screens/additionalScreens/createRfq/createRfq';
import DirectMessages from '../screens/additionalScreens/directMessages/directMessages';
import RequestService from '../screens/additionalScreens/externalServices/requestService';
import JobCompletionRequest from '../screens/additionalScreens/jobCompletionRequest/jobCompletionRequest';
import BillsScreen from '../screens/additionalScreens/manageBills/manageBills';
import PayBills from '../screens/additionalScreens/payBills/payBills';
import PostServiceRequest from '../screens/additionalScreens/postServiceRequest/postServiceRequest';
import RfqQuestions from '../screens/additionalScreens/rfqQuestions/rfqQuestion';
import Rfqs from '../screens/additionalScreens/rfqs/rfqs';
import SingleContractDetails from '../screens/additionalScreens/singleContractDetails/singleContractDetails';
import UtilityBills from '../screens/additionalScreens/utilityBills/utilityBills';
import ApproveRequest from '../screens/authentication/approveRequest/approveRequest';
import CreatePassword from '../screens/authentication/createPassword/createPassword';
import EnterHOANumber from '../screens/authentication/enterHOANumber/enterHOANumber';
import SelectRole from '../screens/authentication/selectRole/selectRole';
import Signin from '../screens/authentication/signin/signin';
import Signup from '../screens/authentication/signup/signup';
import UploadDocuments from '../screens/authentication/uploadDocuments/uploadDocuments';
import Community from '../screens/main/community/community';
import Home from '../screens/main/home/home';
import Profile from '../screens/main/profile/profile';
import Services from '../screens/main/services/services';

export const AuthenticationStack = {
  route: 'authStack',
  component: AuthNavigation,
  initialRoute: 'signin',
  nestedScreens: {
    signUp: {
      route: 'signup',
      component: Signup,
    },
    signin: {
      route: 'signin',
      component: Signin,
    },
    approveRequest: {
      route: 'approveRequest',
      component: ApproveRequest,
    },
    selectRole: {
      route: 'selectRole',
      component: SelectRole,
    },
    enterHOANumber: {
      route: 'enterHOANumber',
      component: EnterHOANumber,
    },
    uploadDocuments: {
      route: 'uploadDocuments',
      component: UploadDocuments,
    },
    createPassword: {
      route: 'createPassword',
      component: CreatePassword,
    },
  },
};
export const HomeStack = {
  route: 'homeStack',
  component: HomeStackNavigation,
  initialRoute: 'home',
  nestedScreens: {
    home: {
      route: 'home',
      component: Home,
    },
    services: {
      route: 'services',
      component: Services,
    },

    community: {
      route: 'community',
      component: Community,
    },

    profile: {
      route: 'profile',
      component: Profile,
    },
  },
};
export const AdditionalScreensStack = {
  route: 'AdditionalScreensStack',
  component: AdditionalScreensNavigation,
  nestedScreens: {
    communityDiscussion: {
      route: 'communityDiscussion',
      component: CommunityDiscussion,
    },
    directMessages: {
      route: 'directMessages',
      component: DirectMessages,
    },
    announcements: {
      route: 'announcements',
      component: Announcements,
    },
    accountSettings: {
      route: 'accountSettings',
      component: AccountSetting,
    },
    contractDetails: {
      route: 'contractDetails',
      component: ContractDetails,
    },
    manageBills: {
      route: 'manageBills',
      component: BillsScreen,
    },
    rfqs: {
      route: 'rfqs',
      component: Rfqs,
    },
    singleContractDetails: {
      route: 'singleContractDetails',
      component: SingleContractDetails,
    },
    utilityBills: {
      route: 'utilityBills',
      component: UtilityBills,
    },
    payBills: {
      route: 'payBills',
      component: PayBills,
    },
    communityCharges: {
      route: 'communityCharges',
      component: CommunityCharges,
    },
    createRFQ: {
      route: 'createRFQ',
      component: CreateRfq,
    },
    externalServices: {
      route: 'externalServices',
      component: RequestService,
    },
    chooseServices: {
      route: 'chooseServices',
      component: ChooseServices,
    },
    postServiceRequest: {
      route: 'postServiceRequest',
      component: PostServiceRequest,
    },
    rfqQuestions: {
      route: 'rfqQuestions',
      component: RfqQuestions,
    },
    jobCompletionRequest: {
      route: 'jobCompletionRequest',
      component: JobCompletionRequest,
    },
  },
};
export const RootStackConfig = {
  route: 'RootStack',
  component: RootStackNavigation,
  nestedStacks: {
    authStack: {
      route: 'authStack',
      component: AuthNavigation,
    },
    homeStack: {
      route: 'homeStack',
      component: HomeStackNavigation,
    },
    additionalScreensStack: {
      route: 'additionalScreensStack',
      component: AdditionalScreensNavigation,
    },
  },
};
