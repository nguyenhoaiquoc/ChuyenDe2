// src/libs/socket.ts (chỉ dùng frontend)

import { io, Socket } from "socket.io-client";
import { path } from "../../config";

let socket: Socket | null = null;

type InitOpts = {
  token: string;
  userId?: string | number;
};

// Khởi tạo socket nếu chưa có
export function initSocket({ token, userId }: InitOpts) {
  if (!socket) {
    socket = io(`${path}/chat_user`, {
      auth: { token, userId: userId ? String(userId) : undefined },
      transports: ["websocket"], // Chỉ dùng WebSocket cho ổn định
      reconnection: false,        // Tắt tự động reconnect khi logout
    });
  }
  return socket;
}

// Lấy socket hiện tại
export function getSocket() {
  return socket;
}

// Ngắt kết nối socket
export function disconnectSocket() {
  if (socket) {
    console.log("🛑 Đang ngắt kết nối socket...");
    socket.removeAllListeners();  // Xóa các sự kiện
    socket.disconnect();          // Ngắt kết nối
    console.log("✅ Socket đã ngắt kết nối!");
    socket = null;                // Xóa socket instance
  }
}
