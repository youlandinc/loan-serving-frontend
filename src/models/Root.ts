import { Instance, types } from 'mobx-state-tree';
import { createContext, useContext } from 'react';

import { portfolioModel } from '@/models/gridModel';
import {
  DelinquentTimeRangeEnum,
  MaturityTimeRangeEnum,
  PipelineMode,
  PortfolioGridTypeEnum,
} from '@/types/enum';

import { URL_LOGOUT_REDIRECTION } from '@/constant';

import { User } from '@/types/user';

import { UserSetting } from './base';

export const RootModel = {
  session: types.maybe(types.frozen<UserSession>()),
  userSetting: UserSetting,
  userProfile: types.maybe(types.frozen<ClientUserProfile>()),
  portfolio: portfolioModel,
};

const RootStore = types.model(RootModel).actions((self) => {
  return {
    injectCognitoUserSession(session: User.UserRefreshTokenRequest) {
      self.session = {
        accessToken: {
          jwtToken: session.accessToken,
        },
        idToken: {
          jwtToken: session.accessToken,
        },
        refreshToken: {
          token: session.refreshToken,
        },
      };
    },
    injectCognitoUserProfile(profile: User.UserSignInRequest) {
      self.userProfile = profile.userProfile;
    },
    logout() {
      self.userSetting.initState();
      localStorage.clear();
      window.location.href = URL_LOGOUT_REDIRECTION;
    },
  };
});

const initialState = {
  session: void 0,
  userProfile: void 0,
  userSetting: {
    initialized: false,
    loading: false,
    licensedProduct: [],
    accountId: '',
    setting: {
      id: '',
      tenantId: '',
      appId: '',
      account: '',
      userId: '',
      accountType: '',
      loginType: '',
      source: '',
      parentAccountId: '',
      userInfo: {
        isFinished: true,
        firstName: '',
        lastName: '',
        name: '',
        birthDay: '',
        gender: '',
        maritalStatus: '',
        age: 0,
        email: '',
        phone: '',
        ssn: '',
        companyName: '',
        title: '',
        avatar: '',
        addressInfo: {
          isFinished: true,
          address: '',
          aptNumber: '',
          city: '',
          state: '',
          statename: '',
          postcode: '',
          countyFIPS: '',
        },
        residencyStatus: '',
      },
      inviteCode: '',
      lastLoginTime: '',
      paymentMethod: null,
      billingAddress: null,
      organizationInfo: null,
      notificationRule: null,
      tenantConfig: null,
      referrers: undefined,
      enabled: 0,
      roles: undefined,
      gmtCreate: '',
      gmtModified: '',
      creator: '',
      editor: '',
      userName: '',
      channel: '',
      losSettings: {
        custom: null,
      },
    },
  },
  userType: void 0,
  loginType: void 0,
  portfolio: {
    displayType: PortfolioGridTypeEnum.YOULAND,
    youlandGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumnsModel: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
    cashFlowGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumnsModel: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
    alamedaGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumnsModel: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
    allLoansGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumnsModel: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
    investorGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumns: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
    delinquentGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
          delinquentDays: DelinquentTimeRangeEnum.ALL,
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumns: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
    maturityGridModel: {
      queryModel: {
        size: 50,
        page: 0,
        sort: [],
        searchCondition: {
          investors: [],
          keyword: '',
          maturityStartDate: '',
          maturityEndDate: '',
          repaymentStatusList: [],
          maturityDays: MaturityTimeRangeEnum.ALREADY_END,
        },
        pipelineMode: PipelineMode.INITIAL_APPROVAL,
      },
      orderColumns: [],
      pinLeftColumns: [],
      expandedColumns: [],
    },
  },
};

export const rootStore = RootStore.create(initialState);

export type IRoot = Instance<typeof RootStore>;
const RootStoreContext = createContext<null | IRoot>(null);

export const Provider = RootStoreContext.Provider;

export const useMst = () => {
  const store = useContext(RootStoreContext);

  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
};
