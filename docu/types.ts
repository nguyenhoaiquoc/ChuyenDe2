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
  ManagerGroupsScreen: undefined;
  UserInforScreen: undefined;
  EditProfileScreen: undefined;
  SellProductScreen: undefined;
  PurchaseRequestScreen: undefined;
  NotificationScreen: undefined;
  CreateGroupScreen: undefined;
  // Trong types.ts, thêm vào cuối RootStackParamList:
  ChatRoomScreen: {
    roomId: string | number;
    product?: Product;
    otherUserId: string | number;
    otherUserName?: string;
    otherUserAvatar?: string; // ✅ thêm
    currentUserId: string | number;
    currentUserName: string;
    token: string;
  };

  UserDetail: {
    userId: number | string;
    productId: string;
    product: Product;
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
export type SubCategory = {
  id: string | number;
  name: string;
  parent_category_id?: number | null; // (Trường này API có gửi)
  source_table?: string | null;       // (Trường này API có gửi)
  source_id?: number | null;          // (Trường này API có gửi)
};
export type ProductType = {
  id: string | number;
  name: string;
};
export type Origin = {
  id: string | number;
  name: string;
};
export type Material = {
  id: string | number;
  name: string;
};
export type Size = {
  id: string | number;
  name: string;
};
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
  dealType: DealType | null;
  category: Category | undefined;
  subCategory: SubCategory | null;
  sub_category_id?: string | null;
  category_change?: Category | null;
  sub_category_change?: { id: string; name: string } | null;
  postType: PostType | null;

  productType: ProductType | null;
  origin: Origin | null;
  material: Material | null;
  size: Size | null;

  condition: Condition | null;
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
  file?: FileResult;
  author: string | null;
  year: number | null;
  created_at: string;
  updated_at?: string;
  user_id: string | number;

  user?: {
    id?: string | number;
    name?: string;
    avatar?: string;
    image?: string;
  };
  seller?: {
    id?: string | number;
    name?: string;
    avatar?: string;
    image?: string;
  };
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
// notification
export type Notification = {
  id: number;
  is_read: boolean;
  createdAt: string; // Hoặc Date nếu ông parse
  target_id: number;

  // Quan hệ: Người gây ra hành động
  actor: {
    id: number;
    fullName: string;
    image?: string;
  };

  // Quan hệ: Hành động là gì?
  action: {
    id: number;
    name: string; // 'post_success', 'admin_new_post', 'comment', v.v.
  };

  // Quan hệ: Loại đối tượng là gì?
  targetType: {
    id: number;
    name: string; // 'product', 'user', v.v.
  };

  // Quan hệ: Sản phẩm liên quan (có thể có hoặc không)
  product?: {
    id: number;
    name: string;
    // Thêm các trường khác của Product nếu ông cần
  };
};
