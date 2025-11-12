// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from './screens/home/HomeScreen';
import CategoryIndex from './screens/categories/CategoryIndex';
import ProductDetail from './screens/products/ProductDetailScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import VerifyAccountScreen from './screens/auth/VerifyAccountScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from './screens/auth/NewPasswordScreen';
import ChatListScreen from './screens/chat/ChatListScreen';
import SearchScreen from './screens/chat/SearchScreen';
import OTPVerifyScreen from './screens/auth/OTPVerifyScreen';
import ChatRoomScreen from './screens/chat/ChatRoomScreen';
import UnreadMessageScreen from './screens/chat/UnreadMessageScreen';
import ManagePostsScreen from './screens/post/ManagePostsScreen';
import ChooseCategoryScreen from './screens/post/ChooseCategoryScreen';
import ChooseSubCategoryScreen from './screens/post/ChooseSubCategoryScreen';
import PostFormScreen from './screens/post/PostFormScreen';
import ViewHistory from './screens/profile/ViewHistory';
import SavedSearchScreen from './screens/profile/SavedSearchScreen';
import SavedPosts from './screens/profile/SavedPosts';
import FeedbackScreen from './screens/profile/FeedbackScreen';
import UserScreen from './screens/profile/UserScreen';
import ChooseExchangeCategoryScreen from './screens/post/ChooseExchangeCategoryScreen';
import ChooseExchangeSubCategoryScreen from './screens/post/ChooseExchangeSubCategoryScreen';
import HomeAdminScreen from './screens/admin/HomeAdminScreen';
import UserDetail from './screens/profile/UserDetail';
import ManagerGroupsScreen from './screens/groups/ManagerGroupsScreen';
import UserInforScreen from './screens/profile/UserInforScreen';
import EditProfileScreen from './screens/profile/EditProfileScreen';
import PurchaseRequestScreen from './screens/products/PurchaseRequestScreen';
import SellProductScreen from './screens/products/SellProductScreen';
import CreateGroupScreen from './screens/groups/CreateGroupScreen';
import GroupDetailScreen from './screens/groups/GroupDetailScreen';
import NotificationScreen from './screens/Notification/NotificationScreen';
import { NotificationProvider } from './screens/Notification/NotificationContext';
import SavedPostsScreen from './screens/profile/SavedPostsScreen';
import { StatusBar } from 'expo-status-bar';
import ManageProductsScreen from './screens/admin/ManageProductsScreen';
import PostGroupFormScreen from './screens/groups/PostGroupFormScreen';
import TrashScreen from './screens/products/TrashScreen';
import MyGroupPostsScreen from './screens/groups/crud/MyGroupPostsScreen';
import GroupMembersScreen from './screens/groups/crud/GroupMembersScreen';
import ApprovePostsScreen from './screens/groups/crud/ApprovePostsScreen';
import EditGroupScreen from './screens/groups/crud/EditGroupScreen';
import React from 'react';
import FollowListScreen from './screens/profile/FollowListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NotificationProvider>
      <NavigationContainer>
        <StatusBar hidden />
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          {/* <Stack.Screen name="TestApi" component={TestApi} /> */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CategoryIndex" component={CategoryIndex} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="VerifyAccountScreen" component={VerifyAccountScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="NewPasswordScreen" component={NewPasswordScreen} />
          <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="OTPVerifyScreen" component={OTPVerifyScreen} />
          <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} />
          <Stack.Screen name="UnreadMessageScreen" component={UnreadMessageScreen} />
          <Stack.Screen name="ManagePostsScreen" component={ManagePostsScreen} />
          <Stack.Screen name="ChooseCategoryScreen" component={ChooseCategoryScreen} />
          <Stack.Screen name="ChooseSubCategoryScreen" component={ChooseSubCategoryScreen} />
          <Stack.Screen name="PostFormScreen" component={PostFormScreen} />
          <Stack.Screen name="ViewHistory" component={ViewHistory} />
          <Stack.Screen name="SavedSearchScreen" component={SavedSearchScreen} />
          <Stack.Screen name="SavedPosts" component={SavedPosts} />
          <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
          <Stack.Screen name="UserScreen" component={UserScreen} />
          <Stack.Screen name="ChooseExchangeCategoryScreen" component={ChooseExchangeCategoryScreen} />
          <Stack.Screen name="ChooseExchangeSubCategoryScreen" component={ChooseExchangeSubCategoryScreen} />
          <Stack.Screen name="HomeAdminScreen" component={HomeAdminScreen} />
          <Stack.Screen name="ManageProductsScreen" component={ManageProductsScreen} />
          <Stack.Screen name="UserDetail" component={UserDetail} />
          <Stack.Screen name="ManagerGroupsScreen" component={ManagerGroupsScreen} />
          <Stack.Screen name="UserInforScreen" component={UserInforScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="SellProductScreen" component={SellProductScreen} />
          <Stack.Screen name="PurchaseRequestScreen" component={PurchaseRequestScreen} />
          <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
          <Stack.Screen name="SavedPostsScreen" component={SavedPostsScreen} />
          <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} />
           <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="PostGroupFormScreen" component={PostGroupFormScreen} />
        <Stack.Screen name="TrashScreen" component={TrashScreen} />
        <Stack.Screen name="MyGroupPostsScreen" component={MyGroupPostsScreen} />
        <Stack.Screen name="GroupMembersScreen" component={GroupMembersScreen} />
        <Stack.Screen name="ApprovePostsScreen" component={ApprovePostsScreen} />
        <Stack.Screen name="EditGroupScreen" component={EditGroupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
}
