// app/api/stream/route.ts
import { addClient, removeClient } from "@/lib/sse";

export const GET = async (req: Request) => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // envia um comentário inicial (opcional) para abrir a conexão
      controller.enqueue(new TextEncoder().encode(": connected\n\n"));

      // registra o cliente na lista global
      const id = addClient(controller);

      // quando o browser fechar a aba ou a conexão abortar:
      // Request.signal é ligado ao evento de cancelamento
  const signal: AbortSignal | undefined = (req as Request).signal;
        if (signal) {
            signal.addEventListener("abort", () => {
            removeClient(id);
            try {
                controller.close();
            } catch (e) {}
            });
        }
      if (signal) {
        const onAbort = () => {
          removeClient(id);
          try {
            controller.close();
          } catch (e) {}
        };
        signal.addEventListener("abort", onAbort);

        // se quiser, remova o listener quando fechar o stream
        // (não estritamente necessário aqui porque o processo termina)
      }
    },
    cancel() {
      // Nota: aqui não temos o id do cliente — remoção já é feita no abort handler acima.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};
