// src/middleware/ws-auth.ts
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { WebSocket } from 'ws';
import http from 'http';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.COOKIE_NAME || 'token';

export function authenticateSocketConnection(
  ws: WebSocket & { userId?: string },
  req: http.IncomingMessage
): boolean {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    ws.close(4001, 'Missing cookie header');
    return false;
  }


  try {
    const cookies = cookie.parse(cookieHeader);
    const token = cookies[COOKIE_NAME];

    if (!token) {
      ws.close(4001, 'Missing auth token');
      return false;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    ws.userId = decoded.id;
    return true;
  } catch (err) {
    console.warn('Invalid JWT:', err);
    ws.close(4001, 'Invalid token');
    return false;
  }
}
