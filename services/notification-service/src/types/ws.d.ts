// src/types/ws.d.ts
import 'ws';

export {};

declare module 'ws' {
  interface WebSocket {
    userId?: string;
  }
}

