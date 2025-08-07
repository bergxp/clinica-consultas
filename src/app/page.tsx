  "use client";
  import { useEffect, useState } from "react";

  type Paciente = { id: number; nome: string };

  type SSEPayload =
    | { type: "novo_paciente"; pacientes: Paciente[] }
    | { type: "deletou_paciente"; pacientes: Paciente[] }
    | { type?: string; pacientes?: Paciente[] };

  export default function Home() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [pacientesChamados, setPacientesChamados] = useState<Paciente[]>([]);
    const [listpacientes, setListPacientes] = useState<Paciente[]>([]);

    useEffect(() => {
      fetch("/api/pacientes")
        .then((r) => r.json())
        .then(setPacientes)
        .catch(console.error);

      const es = new EventSource("/api/stream");

      function handleEvent(e: MessageEvent) {
        try {
          // e.data pode ser string ou outro tipo; forçamos para string
          const text =
            typeof e.data === "string" ? e.data : JSON.stringify(e.data);

          // parse com tipagem depois
          const parsed = JSON.parse(text) as SSEPayload;
          if ("deletou_paciente" === parsed.type) {
            setPacientesChamados((prev) => { 
              if (parsed.pacientes && Array.isArray(parsed.pacientes)) {
                const chamadosIds = new Set(prev.map((p) => p.id));
                const novosChamados = parsed.pacientes.filter(
                  (p) => !chamadosIds.has(p.id)
                );
                return [novosChamados[0], ...prev]; // mantém apenas os 4 mais recentes
              }
              return prev;
            });
          } 


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
        <div className="bg-green-400 text-white p-12 text-center">
          <span className="font-bold text-white text-3xl">
            Painel de chamadas
          </span>
        </div>
        <div className="container mx-auto p-4 flex gap-4 justify-between">
          <div className="bg-white shadow-md rounded p-6 border-r border-black/25 w-[380px]">
            <p className="mb-4 font-bold text-2xl text-green-500">
              Lista de espera
            </p>
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Total de pacientes: {pacientes.length}
              </span>
            </div>
            <ul className="space-y-2 max-h-[400px] overflow-y-auto flex flex-col gap-2">
              {pacientes.length === 0 ? (
                <span className="italic">Nenhum paciente na lista de espera</span>
              ) : (
                Array.isArray(pacientes) &&
                pacientes.map((p) => (
                  <li className="border-b py-2 border-black/25" key={p.id}>
                    <span>{p.nome}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="bg-white shadow-md rounded flex-1 flex flex-col justify-between text-center">
            <div className="flex gap-4 mt-8 justify-center shadow-md rounded p-6">
              <div className="flex flex-col items-center gap-3 w-[200px] border-r border-black/25 pr-4">
                <span className="font-bold text-4xl text-red-600 mb-5">
                  Consultorio
                </span>
                <span className="font-bold text-3xl text-blue-600">02</span>
              </div>
              <div className="flex flex-col items-center gap-3 justify-center w-full">
                <span className="font-bold text-4xl text-red-600 mb-5">
                  Paciente
                </span>
                <span className="font-bold text-3xl text-blue-600">
                  {pacientes.length > 0 ? pacientes[0].nome : "Nenhum paciente na fila"}
                </span>
              </div>
            </div>

            <div className="bg-green-400 text-white p-4 mt-8 rounded flex flex-col items-center gap-2 shadow-md">
              <span className="font-bold text-3xl">Ultimas chamadas</span>
              <ul className="flex flex-col gap-2 mt-5 w-full max-h-[200px] overflow-y-auto text-center">
                {pacientes.length === 0 || pacientesChamados.length === 0  ? (
                  <span className="italic">Nenhuma chamada recente</span>
                ) : (
                  pacientesChamados.slice(0, 4).map((p) => (
                    <li key={p.id} className="border-b py-2 border-black/25">
                      <span>{p.nome}</span>
                    </li>
                  ))
                )}
          
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
