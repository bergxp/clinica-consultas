"use client";
import { useEffect, useState } from "react";
export default function Home() {

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
    alert("ID do paciente é obrigatório.");
    return;
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

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Espera */}
        <section className="bg-white rounded-lg shadow p-6 h-fit">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Lista de Espera</h1>
          <ul className="space-y-3 text-gray-700 font-medium">
            {/* Renderizando pacientes da lista */}
            {pacientes.length === 0 ? (
              <li className="text-gray-500 italic">Loading ...</li>
            ) : (
              pacientes.map((p, index) => (
              <li key={index} className="border-b pb-2">
                {p.nome}
              </li>
              ))
            )}
            
          </ul>
        </section>

        {/* Painel Central */}
        <section className="md:col-span-2 bg-white rounded-lg shadow p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Consultório */}
            <div className="flex flex-col items-center justify-center p-4 border-r sm:border-r border-gray-300 w-[200px] text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-2">Consultório</h2>
              <ul className="text-2xl font-semibold text-blue-600">
                <li>05</li>
              </ul>
            </div>

            {/* Paciente Atual */}
            <div className="flex flex-col p-4 text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-2">Paciente</h2>
              <ul className="text-xl sm:text-2xl font-semibold text-blue-600">
                <li>
                  {pacientes.length > 0 ? pacientes[0].nome : <span className="text-gray-500 italic">Nenhum paciente</span>}
                </li>
              </ul>
            </div>
          </div>

          {/* Últimas Chamadas */}
          <div className="bg-green-600/40 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Últimas chamadas</h3>
            <div className="space-y-2 text-white text-lg">
              <p>Paciente 4</p>
              <p>Paciente 3</p>
              <p>Paciente 2</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
