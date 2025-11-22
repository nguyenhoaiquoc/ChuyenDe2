// ChatContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { path } from "../config";

type ChatContextType = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  socketRef: React.MutableRefObject<Socket | null>;
  markRoomAsRead: (roomId: number) => void;
};

const ChatContext = createContext<ChatContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  socketRef: { current: null } as React.MutableRefObject<Socket | null>,
  markRoomAsRead: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connectSocket = async () => {
      if (!isMounted) return;

      // Đã có socket và đang connected thì không tạo thêm
      if (socketRef.current && socketRef.current.connected) {
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // console.log("[ChatContext] ⛔ Chưa có token, chưa connect socket");
        return;
      }

      // console.log("[ChatContext] 🔄 Tạo socket mới với token");
      const socket = io(path, {
        auth: { token }, // backend tự decode userId từ token
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        // console.log("[ChatContext] ✅ socket connected:", socket.id);
        // Hỏi tổng unread lần đầu
        socket.emit("getUnreadCount", {});
      });

      socket.on("connect_error", (err) => {
        // console.log("[ChatContext] ⚠️ connect_error:", err?.message);
      });

      // Server gửi tổng unread về
      socket.on("unreadCount", (data: any) => {
        const count = Number(data?.count ?? 0);
        // console.log("🔔 [ChatContext] WS unreadCount =", count);
        setUnreadCount(count);
      });

      socket.on("disconnect", (reason) => {
        // console.log("[ChatContext] 🔌 socket disconnected:", reason);
      });
    };

    // Gọi 1 lần khi mount
    connectSocket();

    // Lặp lại vài giây 1 lần để nếu lúc trước chưa có token thì sau khi login sẽ tự connect
    const intervalId = setInterval(connectSocket, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (socketRef.current) {
        // console.log("[ChatContext] 🧹 Cleanup: disconnect socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const markRoomAsRead = (roomId: number) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      // console.log("[ChatContext] markRoomAsRead: socket chưa connect");
      return;
    }
    // console.log("[ChatContext] ▶️ emit markAsRead roomId=", roomId);
    socket.emit("markAsRead", { roomId });

    // ❌ Không setUnreadCount(0) ở đây
    // ✅ Để backend tự tính lại và emit 'unreadCount' → FE chỉ nghe và cập nhật
  };

  return (
    <ChatContext.Provider
      value={{ unreadCount, setUnreadCount, socketRef, markRoomAsRead }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
