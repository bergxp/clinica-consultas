// app/api/pacientes/route.ts
import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { broadcast, Paciente } from "@/lib/sse";
import dotenv from "dotenv";

dotenv.config();

interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

async function ConnectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306, // porta padrão do MySQL
    });
    return connection;
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    throw new Error("Não foi possível conectar ao banco de dados");
  }
}

export async function GET() {
  try {
    const db = await ConnectDB();
    const [rows] = await db.query("SELECT * FROM pacientes");
    await db.end();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json({ error: "Erro ao buscar pacientes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome } = body;
    if (!nome) {
      return NextResponse.json({ error: "Nome do paciente é obrigatório" }, { status: 400 });
    }
    const db = await ConnectDB();
    const [result] = await db.query("INSERT INTO pacientes (nome) VALUES (?)", [nome]);
    const { insertId } = result as ResultSetHeader;

    // busca lista atualizada
    const [rows] = await db.query("SELECT * FROM pacientes");
    await db.end();

    // broadcast — aqui tipado como Paciente[]
    const pacientes = rows as Paciente[];
    broadcast({ type: "novo_paciente", pacientes });

    return NextResponse.json({ message: "Paciente criado", id: insertId });
  } catch (error) {
    console.error("Erro ao adicionar paciente:", error);
    return NextResponse.json({ error: "Erro ao adicionar paciente" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID do paciente é obrigatório" }, { status: 400 });
    }
    const db = await ConnectDB();
    const pacienteId = Number(id);
    const [result] = await db.query("DELETE FROM pacientes WHERE id = ?", [pacienteId]);
    if ((result as ResultSetHeader).affectedRows === 0) {
      await db.end();
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }

    // busca lista atualizada
    const [rows] = await db.query("SELECT * FROM pacientes");
    await db.end();

    const pacientes = rows as Paciente[];
    broadcast({ type: "deletou_paciente", pacientes });

    return NextResponse.json({ message: "Paciente deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar paciente:", error);
    return NextResponse.json({ error: "Erro ao deletar paciente" }, { status: 500 });
  }
}
