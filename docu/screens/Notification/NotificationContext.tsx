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
import { path } from "../../config"; // Đảm bảo đường dẫn config đúng
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

// 1. Định nghĩa kiểu dữ liệu cho Context
type NotificationContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
};

// 2. Tạo Context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// 3. Provider Component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Sử dụng useRef để quản lý socket instance theo vòng đời của Provider
  // Giúp tránh việc biến toàn cục gây xung đột khi reload app hoặc logout/login
  const socketRef = useRef<Socket | null>(null);

  // Hàm lấy số lượng thông báo chưa đọc từ API (REST)
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
      console.error("❌ Lỗi fetch unread count (API):", error);
      // Không set về 0 ở đây để tránh trải nghiệm người dùng bị nháy số nếu mạng lỗi nhẹ
    }
  }, []);

  // ✅ LOGIC KẾT NỐI SOCKET.IO (REAL-TIME)
  useEffect(() => {
    let currentSocket: Socket | null = null;

    const setupSocket = async () => {
      const userId = await AsyncStorage.getItem("userId");
      
      // Nếu chưa đăng nhập thì không kết nối socket
      if (!userId) return;

      // Cleanup socket cũ nếu tồn tại trước khi tạo mới (tránh duplicate connections)
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      console.log(`🔌 Đang khởi tạo Socket tới: ${path}/notification`);

      // Khởi tạo Socket với các cấu hình tối ưu cho mạng di động
      currentSocket = io(`${path}/notification`, {
        transports: ["websocket"],      // Bắt buộc dùng websocket để nhanh hơn polling
        autoConnect: true,
        reconnection: true,             // Tự động kết nối lại
        reconnectionAttempts: 10,       // Thử lại 10 lần
        reconnectionDelay: 1000,        // Đợi 1s giữa các lần thử
        forceNew: true,                 // Đảm bảo tạo connection mới hoàn toàn
      });

      socketRef.current = currentSocket;

      // Hàm gửi định danh (Tách ra để tái sử dụng khi reconnect)
      const sendIdentity = () => {
        if (userId) {
          console.log(`🚀 Gửi định danh (Identify) cho User ID: ${userId}`);
          currentSocket?.emit("identify", { userId });
        }
      };

      // --- CÁC SỰ KIỆN SOCKET ---

      // 1. Khi kết nối thành công
      currentSocket.on("connect", () => {
        console.log(`✅ Socket Connected ID: ${currentSocket?.id}`);
        sendIdentity();
      });

      // 2. Xử lý Race Condition: Nếu socket kết nối quá nhanh trước khi gán .on('connect')
      if (currentSocket.connected) {
        sendIdentity();
      }

      // 3. Quan trọng: Khi mạng rớt và có lại (Reconnect) -> Phải gửi lại định danh
      // Nếu thiếu cái này, server sẽ không biết socket mới này thuộc về user nào
      currentSocket.io.on("reconnect", () => {
         console.log("🔄 Socket Reconnected -> Gửi lại định danh...");
         sendIdentity();
      });

      // 4. Lắng nghe sự kiện cập nhật số lượng tin chưa đọc từ Server
      currentSocket.on("unread_count_update", (data: { count: number }) => {
        console.log(`🔔 REALTIME UPDATE: Số thông báo mới = ${data.count}`);
        setUnreadCount(data.count);
      });

      // 5. Các sự kiện lỗi/ngắt kết nối để debug
      currentSocket.on("disconnect", (reason) => {
        console.warn("⚠️ Socket Disconnected:", reason);
      });

      currentSocket.on("connect_error", (err) => {
        console.error("❌ Socket Connection Error:", err.message);
      });
    };

    setupSocket();

    // Cleanup function: Chạy khi component bị hủy (VD: User logout thoát app)
    return () => {
      if (socketRef.current) {
        console.log("🛑 Cleanup: Ngắt kết nối socket để giải phóng tài nguyên.");
        socketRef.current.removeAllListeners(); // Xóa hết các listener để tránh memory leak
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần khi Mount

  return (
    <NotificationContext.Provider
      value={{ unreadCount, setUnreadCount, fetchUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// 4. Custom Hook để sử dụng Context dễ dàng
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification phải được dùng bên trong NotificationProvider"
    );
  }
  return context;
};