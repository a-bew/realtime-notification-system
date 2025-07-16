import { WebSocket } from 'ws';

export function handleWsConnection(ws: WebSocket, clients: Set<WebSocket>) {
  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('message', (msg) => {
    console.log('Message from client:', msg.toString());
  });
}

export function broadcastMessage(clients: Set<WebSocket>, message: any) {
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
