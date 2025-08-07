// app/api/pacientes/route.ts
import mysql from "mysql2/promise";
import { NextResponse } from "next/server";
import { broadcast, Paciente } from "@/lib/sse";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  // somente para desenvolvimento local
  dotenv.config();
}

// Cria (ou reusa) um pool global para não criar múltiplas conexões em ambientes serverless
declare global {
  // eslint-disable-next-line no-var
  var __MYSQL_POOL__: mysql.Pool | undefined;
}

function getPool(): mysql.Pool {
  if (global.__MYSQL_POOL__) return global.__MYSQL_POOL__;

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 5,
    queueLimit: 0,
    // opcional: debug: true,
  });

  global.__MYSQL_POOL__ = pool;
  return pool;
}

// Tipagem simples para os resultados (mysql2 retorna RowDataPacket / OkPacket, etc.)
interface ResultSetHeader {
  insertId?: number;
  affectedRows?: number;
}

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM pacientes");
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

    const pool = getPool();
    const [result] = await pool.query("INSERT INTO pacientes (nome) VALUES (?)", [nome]);
    const insertId = (result as ResultSetHeader).insertId ?? null;

    // busca lista atualizada
    const [rows] = await pool.query("SELECT * FROM pacientes");

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

    const pool = getPool();
    const pacienteId = Number(id);
    const [result] = await pool.query("DELETE FROM pacientes WHERE id = ?", [pacienteId]);

    if (((result as ResultSetHeader).affectedRows ?? 0) === 0) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }

    // busca lista atualizada
    const [rows] = await pool.query("SELECT * FROM pacientes");
    const pacientes = rows as Paciente[];
    broadcast({ type: "deletou_paciente", pacientes });

    return NextResponse.json({ message: "Paciente deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar paciente:", error);
    return NextResponse.json({ error: "Erro ao deletar paciente" }, { status: 500 });
  }
}
