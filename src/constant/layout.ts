import { LayoutSideMenuItem, ServiceType } from '@/types/layout';

export const LAYOUT_SIDE_MENU: { [key in ServiceType]: LayoutSideMenuItem[] } =
  {
    [ServiceType.SAAS]: [
      {
        label: 'Organization',
        url: '',
        key: 'Organization',
        children: [
          {
            label: 'General',
            url: '/settings/organization/general',
            key: 'General',
          },
          {
            label: 'Users',
            url: '/settings/organization/team_user',
            key: 'Users',
          },
          {
            label: 'Roles',
            url: '/settings/organization/roles',
            key: 'Roles',
          },
          {
            label: 'Notifications',
            url: '/notifications',
            key: 'Notifications',
          },
          {
            label: 'Plan & Billing',
            url: '/settings/billing',
            key: 'billing',
          },
        ],
      },
      {
        label: 'Account settings',
        url: '/settings/account_settings',
        key: 'Account settings',
      },
    ],
    [ServiceType.WHITE_LABEL]: [
      {
        label: 'Organization',
        url: '',
        key: 'Organization',
        children: [
          {
            label: 'General',
            url: '/settings/organization/general',
            key: 'General',
          },
          {
            label: 'Users',
            url: '/settings/organization/team_user',
            key: 'Users',
          },
        ],
      },
      {
        label: 'Account settings',
        url: '/settings/account_settings',
        key: 'Account settings',
      },
    ],
  };

//export const LAYOUT_HEADER_PRODUCT = {};

export const LAYOUT_HEADER_TAB = [
  {
    label: 'Portfolio',
    key: 'Portfolio',
    url: '/portfolio',
  },
];

//export const LAYOUT_HEADER_USER = {};

export const URL_HOME = 'https://dashboard.youland.com/';

export const URL_POS = 'https://dashboard.youland.com/';
export const URL_LOS = 'https://los.youland.com/auth/sign_in';
export const URL_DOC = 'https://doc.youland.com/auth/sign_in';
export const URL_PRICING = 'https://pricing.youland.com';

export const URL_LOGOUT_REDIRECTION =
  'https://software.youland.com/auth/login/?reload=true&&origin=serving';
