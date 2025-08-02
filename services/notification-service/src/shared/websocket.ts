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


export function broadcastMessageToUser(clientsByUser: Map<string, Set<WebSocket>>, userId: string, message: any) {
  const userClients = clientsByUser.get(userId);
  if (!userClients) return;

  const json = JSON.stringify(message);
  for (const client of userClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

export function broadcastMessageToChannel(clientsByChannel: Map<string, Set<WebSocket>>, channel: string, message: any) {
  const channelClients = clientsByChannel.get(channel);
  if (!channelClients) return;

  const json = JSON.stringify(message);
  for (const client of channelClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
} 

export function broadcastMessageToAllClients(clients: Set<WebSocket>, message: any) {
  const json = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

