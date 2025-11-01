import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { path } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa những gì Context sẽ cung cấp
type NotificationContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
};

// Tạo Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Tạo Provider (cái bọc)
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Hàm gọi API để lấy số lượng
  const fetchUnreadCount = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setUnreadCount(0); // Nếu chưa đăng nhập, count = 0
        return;
      }
      
      const response = await axios.get(`${path}/notifications/user/${userId}/unread-count`);
      if (response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Lỗi fetch unread count:", error);
      setUnreadCount(0); // Đặt về 0 nếu lỗi
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Tạo Hook (để dễ sử dụng)
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification phải được dùng bên trong NotificationProvider');
  }
  return context;
};