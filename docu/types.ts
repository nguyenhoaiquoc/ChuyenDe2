export type RootStackParamList = {
  Home: undefined;
  AllCategories: undefined;
  CategoryIndex: { categoryId: string; categoryName?: string } | undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  VerifyAccountScreen: { email: string };
  ForgotPasswordScreen: undefined;
  NewPasswordScreen: { token: string }; 
  ChatListScreen: undefined;
  ChatRoomScreen: undefined;
   OTPVerifyScreen: { email: string }; 
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
  HomeAdminScreen: undefined;
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

