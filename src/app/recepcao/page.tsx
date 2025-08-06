"use client";
import { useEffect, useState } from "react";
export default function Recepcao() {

  type Paciente = { id: number; nome: string };
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [novoPaciente, setNovoPaciente] = useState("");



  useEffect(() => {
    fetch("/api/pacientes")
    .then((res) => res.json())
    .then((data) => setPacientes(data))
    .catch((error) => console.error("Erro ao buscar pacientes:", error));
  }, []);

  
async function handleChamarProximo(id: number) {
  if (!id) {
    alert("Nenhum paciente na fila.");
    return;
  }
  // Adiciona o paciente removido à lista de chamados
  const pacienteRemovido = pacientes.find(p => p.id === id);
  if (pacienteRemovido) {

  }
  const res = await fetch(`/api/pacientes?id=${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (res.ok) {
    const novaLista = await fetch("/api/pacientes").then((res) => res.json());
    setPacientes(novaLista);
  } else {
    const data = await res.json();
    alert("Erro ao deletar paciente: " + (data.error || "Erro desconhecido"));
    console.error("Erro ao deletar paciente:", data.error);
  }

}

  async function handleEnviar() {
    if(!novoPaciente.trim()){
      alert("Por favor, digite o nome do paciente."); 
      return;
    }

  const res = await fetch("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: novoPaciente }), // Substitua pelo valor do input
  });


  const data = await res.json();
  console.log("Paciente criado:", data);

  if(res.ok){
    console.log("Paciente adicionado com sucesso:", data);
    setNovoPaciente("");
    const novaLista = await fetch("/api/pacientes").then((res) => res.json());
    setPacientes(novaLista);
  } else {
    alert ("Erro ao adicionar paciente: " + data.error);
    console.error("Erro ao adicionar paciente:", data.error);
  }
}


  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-green-600/50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <form className="flex flex-col sm:flex-row items-center gap-4">
            <input onChange={(e) => setNovoPaciente(e.target.value)}
              type="text"
              placeholder="Digite o nome do paciente!"
              className="flex-1 px-4 py-3 rounded-md text-black border border-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleEnviar} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition cursor-pointer">
              Enviar
            </button>
          </form>
        </div>
      </header>

      {/* Botão Chamar Próximo */}
      <div className="flex justify-center py-6 bg-green-600/50">
        <button
          onClick={() => handleChamarProximo(pacientes[0]?.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-lg transition cursor-pointer shadow-lg"
     
        >
          Chamar próximo
        </button>
      </div>

    
    </div>
  );
}
