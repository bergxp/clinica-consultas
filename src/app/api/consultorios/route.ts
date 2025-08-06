import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";


        // result is of type ResultSetHeader when using mysql2/promise
        interface ResultSetHeader {
            insertId: number;
            affectedRows: number;
            // add other properties if needed
        }

//Função auxiliar para conectar ao banco de dados

async function ConnectDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        return connection;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw new Error("Não foi possível conectar ao banco de dados");
    }
}

// GET /api/pacientes -> Listar todos os pacientes
export async function GET() {
    try {
        const db = await ConnectDB();
        const [rows] = await db.query("SELECT * FROM consultorios");
        await db.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Erro ao buscar consultarios:", error);
        return NextResponse.json ({ error: "Erro ao buscar consultorios" },{status: 500})
    }
}

// POST /api/pacientes -> Adicionar um novo paciente

export async function POST(req: NextRequest) {
    try {
        const {consultorio } = await req.json();
        if(!consultorio) {
            return NextResponse.json ({ error: "Dados do consultorio são obrigatórios" }, { status: 400 });
        }
        const db = await ConnectDB();
        const [result] = await db.query("INSERT INTO consultorios (consultorio) VALUES (?)", [consultorio]);
        await db.end();
      
         const { insertId } = result as ResultSetHeader;
  
          return NextResponse.json({ message: "Consultorio criado", id: insertId });
    } catch (error) {
        console.error("Erro ao criar consultorio:", error);
        return NextResponse.json({ error: "Erro ao criar consultorio" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest) {

    try {
        // Se estiver usando fetch('/api/pacientes?id=123'), o id vem na query string
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        // Se estiver enviando o id no corpo da requisição (fetch com method DELETE e body), use:
        // const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID do consultorio é obrigatório" }, { status: 400 });
        }
        const db = await ConnectDB();
        const consultorioID = Number(id);
        const [result] = await db.query("DELETE FROM consultorios WHERE id = ?", [consultorioID]);
        await db.end();
        if ((result as ResultSetHeader).affectedRows === 0) {
            return NextResponse.json({ error: "Consultorio não encontrado" }, { status: 404 });
        }
        return NextResponse.json({ message: "Consultorio deletado com sucesso" });

    } catch (error) {
        console.error("Erro ao deletar Consultorio:", error);
        return NextResponse.json({ error: "Erro ao deletar Consultorio" }, { status: 500 });
    }
}