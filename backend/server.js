import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'medagenda',
  password: '1234',
  port: 5432,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MedAgenda',
    message: 'Backend em execução com sucesso.'
  });
});

app.get('/api/appointments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  const { patient, doctor, specialty, date, time, status } = req.body;

  if (!patient || !doctor || !specialty || !date || !time) {
    return res.status(400).json({
      message: 'Preencha paciente, médico, especialidade, data e horário.'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO appointments 
      (patient, doctor, specialty, date, time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [patient, doctor, specialty, date, time, status || 'Aguardando']
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/api/ia', async (req, res) => {
  try {
    const { pergunta } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest"
    });

    const result = await model.generateContent(pergunta || "Teste de conexão");

    const resposta = result.response.text();

    res.json({
      sucesso: true,
      resposta
    });

  } catch (error) {
    console.error("ERRO IA:", error);

    res.status(500).json({
      sucesso: false,
      erro: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`MedAgenda backend iniciado na porta ${PORT}`);
});