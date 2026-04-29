import dynamicImport from 'next/dynamic';
export const dynamic = 'force-dynamic';

export const STEPS = [
  dynamicImport(() => import('@/app/profile-setup/Steps/FirstStep'), { ssr: false }),
  dynamicImport(() => import('@/app/profile-setup/Steps/SecondStep'), { ssr: false }),
  dynamicImport(() => import('@/app/profile-setup/Steps/ThirdStep'), { ssr: false }),
  dynamicImport(() => import('@/app/profile-setup/Steps/FourthStep'), { ssr: false }),
  dynamicImport(() => import('@/app/profile-setup/Steps/FifthStep'), { ssr: false }),
  dynamicImport(() => import('@/app/profile-setup/Steps/SixthStep'), { ssr: false }),
  dynamicImport(() => import('@/app/profile-setup/Steps/SevenStep'), { ssr: false }),
];

export const INITIAL_STEP_DATA = {
  first: {},
  second: {},
  third: {},
  fourth: {},
  fifth: {},
  sixth: {},
  seven: {},
};