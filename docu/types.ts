export type RootStackParamList = {
  Home: undefined;
  AllCategories: undefined;
  CategoryIndex: { categoryId: string; categoryName?: string } | undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  VerifyAccountScreen: undefined;
  ForgotPasswordScreen: undefined;
  NewPasswordScreen: undefined;
  ChatListScreen: undefined;
  ChatRoomScreen: undefined;
  OTPVerifyScreen: undefined;
  ProductDetail: { product: ProductType }; 
  ManagePostsScreen: undefined;
  ChooseCategoryScreen: undefined;
  ChooseSubCategoryScreen: { category: string } | undefined;
  PostFormScreen: { category: string } | undefined;
  UnreadMessageScreen: undefined;
  SearchScreen: undefined;
  ViewHistory: undefined;
  SavedSearchScreen: undefined;
  SavedPosts: undefined;
  FeedbackScreen: undefined;
  UserScreen: undefined;
  // TestApi: undefined;
};

export type ProductType = {
  id: string;
  image: any;
  title: string;
  price: string;
  location: string;
  time: string;
  tag: string;
  imageCount: number;
  isFavorite: boolean;
};

