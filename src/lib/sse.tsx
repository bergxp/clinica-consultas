// lib/sse.ts
// Tipos nativos do DOM usados para ReadableStream controllers.
// Em ambientes Node + TS, certifique-se de ter lib: ["DOM", "ES2020"] no tsconfig (se der problema,
// veja alternativa com `any`, mas aqui tentamos evitar `any`).

export type Paciente = { id: number; nome: string };

export type BroadcastData =
  | { type: "novo_paciente"; pacientes: Paciente[] }
  | { type: "deletou_paciente"; pacientes: Paciente[] }
  | { type: string; pacientes?: Paciente[] };

type SSEClient = {
  id: number;
  controller: ReadableStreamDefaultController<Uint8Array>;
};

let clients: SSEClient[] = [];
let clientId = 0;

export function addClient(controller: ReadableStreamDefaultController<Uint8Array>) {
  clientId += 1;
  const id = clientId;
  clients.push({ id, controller });
  return id;
}

export function removeClient(id: number) {
  clients = clients.filter((c) => c.id !== id);
}

export function broadcast(data: BroadcastData, eventName = "message") {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = new TextEncoder().encode(payload);

  // percorre cópia do array para evitar problemas se removeClient for chamada durante o loop
  for (const client of [...clients]) {
    try {
      client.controller.enqueue(encoded);
    } catch (err) {
      // se falhar, remove o cliente
      removeClient(client.id);
    }
  }
}
