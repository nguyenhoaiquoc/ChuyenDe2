import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import axios from 'axios';
import { path } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

// Định nghĩa những gì Context sẽ cung cấp
type NotificationContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
};

// Tạo Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Biến lưu socket (để nó không bị tạo lại mỗi lần render)
let socket: Socket | null = null;

// Tạo Provider (cái bọc)
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Hàm gọi API để lấy số lượng (dùng khi app mới mở)
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
      console.error("Lỗi fetch unread count (HTTP):", error);
      setUnreadCount(0); // Đặt về 0 nếu lỗi
    }
  }, []);

  // ✅ LOGIC KẾT NỐI SOCKET.IO (REAL-TIME)
  useEffect(() => {
    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        // Nếu không có user, không kết nối socket
        return;
      }

      // 1. Kết nối tới server
      if (!socket) {
        socket = io(path); 
        console.log(`Đang kết nối Socket.IO tới ${path}...`);

        // 2. Khi kết nối thành công, gửi "định danh"
        socket.on('connect', () => {
          // ✅ SỬA LỖI Ở ĐÂY: Thêm 'if (socket)'
          if (socket) { 
            console.log(`✅ Socket đã kết nối: ${socket.id}`);
            socket.emit('identify', { userId });
          }
        });

        // 3. LẮNG NGHE SỰ KIỆN PUSH TỪ SERVER
        socket.on('unread_count_update', (data: { count: number }) => {
          console.log(`🔥 Nhận được PUSH 'unread_count_update':`, data.count);
          setUnreadCount(data.count);
        });

        // (Các hàm log lỗi/ngắt kết nối)
        socket.on('disconnect', () => {
          console.log("Socket đã ngắt kết nối.");
        });
        
        socket.on('connect_error', (err) => {
            console.error("Lỗi kết nối Socket.IO:", err.message);
        });
      }
    };

    setupSocket();

    // Cleanup khi component bị hủy (ví dụ: logout)
    return () => {
      if (socket) {
        console.log("Đang ngắt kết nối socket...");
        socket.disconnect();
        socket = null;
      }
    };
  }, []); // Chỉ chạy 1 lần khi Provider được tạo

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