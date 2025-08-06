
"use client";
import { useEffect, useState } from "react";
export default function Consultorio() {

  type Consultorio = { id: number; consultorio: number };
  const [consultorio, setConsultorio] = useState<Consultorio[]>([]);
  const [novoConsultorio, setNovoConsultorio] = useState("");



  useEffect(() => {
    fetch("/api/consultorios")
    .then((res) => res.json())
    .then((data) => setConsultorio(data))
    .catch((error) => console.error("Erro ao buscar consultorio:", error));
  }, []);


  async function handleCadastrar() {
    if(!novoConsultorio.trim()){
      alert("Por favor, digite o numero do consultorio."); 
      return;
    }

  const res = await fetch("/api/consultorios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consultorio: novoConsultorio }), // Substitua pelo valor do input
  });


  const data = await res.json();
  console.log("Consultorio criado:", data);

  if(res.ok){
    console.log("Consultorio adicionado com sucesso:", data);
    setNovoConsultorio("");
    const novaLista = await fetch("/api/consultorio").then((res) => res.json());
    setConsultorio(novaLista);
  } else {
    alert ("Erro ao adicionar consultorio: " + data.error);
    console.error("Erro ao adicionar consultorio:", data.error);
  }
}


  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-green-600/50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <form className="flex flex-col sm:flex-row items-center gap-4">
            <input onChange={(e) => setNovoConsultorio(e.target.value)}
              type="text"
              placeholder="Digite o numero do consultorio!"
              className="flex-1 px-4 py-3 rounded-md text-black border border-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleCadastrar} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition cursor-pointer">
              Cadastrar
            </button>
          </form>
        </div>
      </header>

     

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8 max-w-7xl flex justify-around md:flex-wrap gap-6">
        {/* Lista de Espera */}

        {/* Painel Central */}

        {/* Lista de Consultorios */}
        <section className="bg-white rounded-lg shadow p-6 h-fit flex flex-col w-full md:w-1/2 lg:w-1/3 justify-between">  
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Painel Central</h1>
          <p className="text-gray-700">Aqui você pode gerenciar os consultorios.</p>
            
            <h1 className="text-2xl font-bold text-blue-600 mb-4">Lista de Consultorios</h1>
            <ul className="space-y-3 text-gray-700 font-medium">
                {consultorio.length === 0 ? (<span>Nenhum consultorio cadastrado!</span>) : consultorio.map((c) => (
                <li key={c.id} className="border-b border-black/25 pb-2 flex justify-between items-center">
                    <span>Consultorio: {c.consultorio}</span>
                    <button
                    onClick={async () => {
                        const res = await fetch(`/api/consultorios?id=${c.id}`, {
                        method: "DELETE",
                        });
                        if (res.ok) {
                        setConsultorio(consultorio.filter((item) => item.id !== c.id));
                        } else {
                        alert("Erro ao deletar consultorio");
                        }
                    }}
                    className="text-white p-3 rounded-md bg-red-600 hover:bg-red-700 transition cursor-pointer"
                    >
                    Deletar
                    </button>
                </li>
                ))}
            </ul>
        </section>
      </main>
    </div>
  );
}
