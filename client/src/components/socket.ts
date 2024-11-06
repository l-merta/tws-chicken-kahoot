// src/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL;

const socket: Socket = io(SOCKET_URL);

export default socket;
