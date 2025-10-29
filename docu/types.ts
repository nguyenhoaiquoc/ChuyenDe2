import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  CategoryIndex: { categoryId: string; categoryName?: string } | undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  VerifyAccountScreen: { email: string };
  ForgotPasswordScreen: undefined;
  NewPasswordScreen: { email: string; token: string };
  ChatListScreen: undefined;
  OTPVerifyScreen: { email: string };
  ProductDetail: { product?: Product } | undefined;
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
  // Trong types.ts, thêm vào cuối RootStackParamList:
  ChatRoomScreen: {
    roomId: string | number;
    product?: Product;
    otherUserId: string | number;
    otherUserName?: string;
    currentUserId: string | number;
    currentUserName: string;
    token: string;
  };

  // TestApi: undefined;
};

export type CategoryType = {
  id: string;
  name: string;
};

export type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetail"
>;
export type ProductDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;

export type PurchaseRequestScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PurchaseRequestScreen"
>;

export type SellProductScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SellProductScreen"
>;

export type ChatRoomRouteProp = RouteProp<RootStackParamList, "ChatRoomScreen">;

export type ChatRoomNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ChatRoomScreen"
>;
export type ProductImage = {
  id: string;
  product_id: string;
  name: string;
  image_url: string;
  created_at: string;
};

export type Condition = { id: string; name: string };
export type PostType = { id: string; name: string };
export type DealType = { id: string; name: string };
export type Category = { id: string; name: string; image?: string };

export type AddressJson = {
  full: string;
  province?: string;
  district?: string;
  ward?: string;
  village?: string;
};

export type Product = {
  id: string;
  authorName: string;
  name: string;
  description: string;
  phone?: string;
  price: string;
  thumbnail_url?: string;
  images: ProductImage[];
  dealType: DealType;
  category: Category  | undefined;
  sub_category_id?: string | null;
  category_change?: Category;
  sub_category_change?: { id: string; name: string };
  postType: PostType;
  productType: PostType;
  condition: Condition;
  address_json?: AddressJson;
  status_id?: string;
  visibility_type?: string;
  group_id?: string | null;
  is_approved?: boolean;
  image?: any;
  location?: string;
  time?: string;
  tag?: string;
  imageCount?: number;
  isFavorite?: boolean;
  user_id: string | number;
  file?: FileResult;
  author: string;
  year: number;
  created_at: string;
  updated_at?: string;
};

export type Comment = {
  id: string | number;
  content: string;
  created_at: string;
  user?: {
    fullName?: string;
    image?: string;
  };
};

export type User = {
  id: number;
  name: string;
};

export type FileResult = {
  uri: string;
  name: string;
  type: string;
};
