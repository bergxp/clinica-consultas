"use client";
import { useEffect, useState } from "react";

type Paciente = { id: number; nome: string };

type SSEPayload =
  | { type: "novo_paciente"; pacientes: Paciente[] }
  | { type: "deletou_paciente"; pacientes: Paciente[] }
  | { type?: string; pacientes?: Paciente[] };

export default function Home() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.json())
      .then(setPacientes)
      .catch(console.error);

    const es = new EventSource("/api/stream");

    function handleEvent(e: MessageEvent) {
      try {
        // e.data pode ser string ou outro tipo; forçamos para string
        const text = typeof e.data === "string" ? e.data : JSON.stringify(e.data);

        // parse com tipagem depois
        const parsed = JSON.parse(text) as SSEPayload;

        if (parsed.pacientes && Array.isArray(parsed.pacientes)) {
          // opcional: validar que cada item tem id e nome
          const ok = parsed.pacientes.every(
            (p) => typeof p.id === "number" && typeof p.nome === "string"
          );
          if (ok) {
            setPacientes(parsed.pacientes);
          } else {
            console.warn("Payload de pacientes inválido:", parsed.pacientes);
          }
        } else {
          // se quiser, lidamos com outros tipos de eventos
          console.log("Evento SSE recebido:", parsed.type);
        }
      } catch (err) {
        console.error("Erro ao processar evento SSE:", err);
      }
    }

    // escuta eventos nomeados
    es.addEventListener("novo_paciente", handleEvent as EventListener);
    es.addEventListener("deletou_paciente", handleEvent as EventListener);

    // também lida com mensagens 'message' (padrão)
es.onmessage = handleEvent as (this: EventSource, ev: MessageEvent) => void;
    // e erros
    es.onerror = (err) => { 
      console.error("SSE error", err);
    };

    return () => {
      es.close();
    };
  }, []);

  return (
    <div>
      <h1>Painel de chamadas</h1>
      <ul>
        {Array.isArray(pacientes) && pacientes.map((p) => (
          <li key={p.id}>
            {p.id} - {p.nome}
          </li>
        ))}
      </ul>
    </div>
  );
}
