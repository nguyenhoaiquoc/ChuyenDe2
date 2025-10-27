export type RootStackParamList = {
  Home: undefined;
  CategoryIndex: { categoryId: string; categoryName?: string } | undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  VerifyAccountScreen: { email: string };
  ForgotPasswordScreen: undefined;
  NewPasswordScreen: { email: string; token: string };
  ChatListScreen: undefined;
  ChatRoomScreen: { product: ProductType; otherUserId: number; otherUserName?: string; currentUserId: number; currentUserName: string; token: string;  }; 
   OTPVerifyScreen: { email: string,
 };
  ChatRoomScreen: {
    product: ProductType;
    otherUserId: number;
    otherUserName?: string;
    currentUserId: number;
    currentUserName: string;
    token: string;
  };
  OTPVerifyScreen: { email: string };
  ProductDetail: { product?: ProductType } | undefined;
  ManagePostsScreen: undefined;
  ChooseCategoryScreen: undefined;
  ChooseSubCategoryScreen:
    | { category: { id: string; name: string } }
    | undefined;
  PostFormScreen:
    | {
        category: { id: string; name: string };
        subCategory: { id: string; name: string };
      }
    | undefined;
  UnreadMessageScreen: undefined;
  SearchScreen: undefined;
  ViewHistory: undefined;
  SavedSearchScreen: undefined;
  SavedPosts: undefined;
  FeedbackScreen: undefined;
  UserScreen: undefined;
  ChooseExchangeCategoryScreen: undefined;
  ChooseExchangeSubCategoryScreen: undefined;
  HomeAdminScreen: undefined;
  UserDetail: undefined;
  ManagerGroupsScreen: undefined;
  UserInforScreen: undefined;
  EditProfileScreen: undefined;
  SellProductScreen: undefined; 
  PurchaseRequestScreen: undefined;
  CreateGroupScreen: undefined;
  // TestApi: undefined;
};

export type ProductType = {
  id: string;
  image: any;
  name: string;
  authorName?: string;
  price: string;
  location: string;
  time: string;
  tag: string;
  category?: string;
  subCategory?: {
    id?: number;
    name?: string;
    source_table?: string;
    source_detail?: any;
  };
  imageCount: number;
  isFavorite: boolean;

  groupName?: string;
  groupImage?: string;
};

export type CategoryType = {
  id: string;
  name: string;
};
