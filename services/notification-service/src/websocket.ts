import { WebSocket } from 'ws';

export function handleWsConnection(ws: WebSocket, clients: Set<WebSocket>) {
  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('message', (msg) => {
    console.log('Message from client:', msg.toString());
  });
}


export function broadcastMessageToUser(
  clientsByUser: Map<string, Set<WebSocket>>,
  userId: string,
  message: any
) {
  const userClients = clientsByUser.get(userId);
  if (!userClients || userClients.size === 0) {
    console.log(`No clients found for userId: ${userId}`);
    return;
  }

  const json = JSON.stringify(message);
  console.log(`Sending to ${userClients.size} clients for userId: ${userId}`);

  for (const client of userClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}