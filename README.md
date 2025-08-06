
# 🏥 Painel de Chamadas de Consultas - Clínica Médica

Sistema simples de gerenciamento de fila e chamada de pacientes para consultórios, com painel de visualização e controle. Ideal para clínicas, consultórios e unidades básicas de saúde.

---

## 🚀 Funcionalidades

- ✅ Cadastro de pacientes em fila de espera
- ✅ Chamada de próximo paciente para o consultório
- ✅ Visualização de lista de espera em tempo real
- ✅ Exibição do paciente atual em atendimento
- ✅ Histórico de últimas chamadas
- ✅ Backend com API REST usando MySQL

---

## 🛠️ Tecnologias Utilizadas
- [Next.js 14+ (App Router)](https://nextjs.org/)
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [mysql2/promise](https://www.npmjs.com/package/mysql2)
- TailwindCSS para estilização
- Server-Sent Events (SSE) para comunicação em tempo real

## 📦 Instalação Local

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/)
- [Git](https://git-scm.com/)
- Um gerenciador de pacotes: `npm` ou `yarn`

### 1. Clone o repositório

git clone https://github.com/seu-usuario/nome-do-repo.git
cd nome-do-repo

### 2. Instale as dependências
npm install

### 3. Configure as variáveis de ambiente
Crie um arquivo .env.local na raiz do projeto com as seguintes variáveis:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco


### 4. Crie a tabela no MySQL
CREATE TABLE pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
);

### 5. Inicie o projeto
npm run dev
O sistema estará disponível em: http://localhost:3000

### 📂 Estrutura do Projeto

/app
  /api/pacientes          ← Endpoints de API
  page.tsx                ← Página principal com painel
.env.local                ← Configurações do banco
README.md                 ← Este arquivo

### 📌 Melhorias Futuras
📡 Atualização em tempo real com WebSocket

📲 Interface para recepção

📢 Suporte a chamada por áudio

🛡️ Autenticação de usuários

🗂️ Gerenciamento por consultório específico


### 🤝 Contribuições
Contribuições são bem-vindas! Basta:

Forkar o projeto

Criar uma branch (git checkout -b minha-feature)

Commitar as alterações (git commit -m 'feat: nova funcionalidade')

Enviar um Pull Request 🚀


=======
# clinica-consultas
Sistema de painel de chamadas para clínicas e consultórios, com cadastro de pacientes, controle de fila e direcionamento para o consultório.
>>>>>>> fbd1854ac3443beaa11b76512043bf00a1142e35
