import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { path } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

type NotificationContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // 1. Dùng useRef thay vì biến toàn cục để quản lý vòng đời theo Component
  const socketRef = useRef<Socket | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setUnreadCount(0);
        return;
      }
      const response = await axios.get(
        `${path}/notifications/user/${userId}/unread-count`
      );
      if (response.data && typeof response.data.count === "number") {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Lỗi fetch unread count:", error);
    }
  }, []);

  // ✅ LOGIC KẾT NỐI SOCKET.IO (REAL-TIME)
  useEffect(() => {
    let currentSocket: Socket | null = null;

    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      // Nếu đã có socket cũ đang chạy, ngắt nó đi để tạo cái mới sạch sẽ
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      console.log(`🔌 Đang kết nối Socket tới: ${path}/notification`);

      // 2. Khởi tạo Socket
      // Lưu ý: Namespace phải khớp với Backend (@WebSocketGateway({ namespace: '/notification' }))
      currentSocket = io(`${path}/notification`, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,       // Tự động kết nối lại khi rớt mạng
        reconnectionAttempts: 5,  // Thử lại 5 lần
        reconnectionDelay: 1000,
      });

      socketRef.current = currentSocket;

      // Hàm gửi định danh (Tách ra để tái sử dụng)
      const sendIdentity = () => {
        console.log(`🚀 Gửi định danh cho User ID: ${userId}`);
        currentSocket?.emit("identify", { userId });
      };

      // 3. Lắng nghe sự kiện CONNECT
      currentSocket.on("connect", () => {
        console.log(`✅ Socket Connected: ${currentSocket?.id}`);
        sendIdentity();
      });

      // 🔥 SỬA LỖI RACE CONDITION: 
      // Nếu socket kết nối quá nhanh trước khi .on('connect') kịp chạy,
      // thì thuộc tính .connected sẽ là true. Lúc này ta gọi hàm luôn.
      if (currentSocket.connected) {
        sendIdentity();
      }

      // 4. Lắng nghe sự kiện RECONNECT (khi mạng chập chờn rồi có lại)
      // Quan trọng: Khi reconnect, socket id đổi, phải gửi lại identify
      currentSocket.io.on("reconnect", () => {
         console.log("🔄 Socket Reconnected -> Gửi lại định danh");
         sendIdentity();
      });

      // 5. Nhận PUSH từ Server
      currentSocket.on("unread_count_update", (data: { count: number }) => {
        console.log(`🔔 REALTIME UPDATE: ${data.count}`);
        setUnreadCount(data.count);
      });

      currentSocket.on("disconnect", (reason) => {
        console.log("⚠️ Socket Disconnected:", reason);
      });

      currentSocket.on("connect_error", (err) => {
        console.log("❌ Socket Error:", err.message);
      });
    };

    setupSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        console.log("🛑 Cleanup: Ngắt kết nối socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); 

  return (
    <NotificationContext.Provider
      value={{ unreadCount, setUnreadCount, fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification phải được dùng bên trong NotificationProvider"
    );
  }
  return context;
};