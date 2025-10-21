export type TabsParamList = {
  Home: undefined;
  History: undefined;
  Routine: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  // 추후 세션 화면 등 추가 예정
  // Session: { sessionId?: string } | undefined;
};