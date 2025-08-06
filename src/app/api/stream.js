// pages/api/stream.js
import { addClient, removeClient } from "../../lib/sse";

export default function handler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // envia um ping inicial para abrir a conexão
  res.write(': connected\n\n');

  const id = addClient(res);

  req.on('close', () => {
    removeClient(id);
  });
}
