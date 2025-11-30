// --- backend/index.js ---

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const app = express();
const PORT = 3001;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexão com TiDB Cloud
const db = mysql.createPool({
  host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  user: 'Zb6tk6aCtzWtwgi.root',
  password: 'a5iUyKPEguu8hwSa',
  database: 'test',
  port: 4000,
  ssl: { rejectUnauthorized: false }
}).promise();

const JWT_SECRET = 'meu-projeto-de-engenharia-e-top';

/* ==========================================================
 *  🛠 ALTERNATIVA 1 — CRIA AUTOMATICAMENTE A COLUNA
 * ========================================================== */
async function ensureDatabaseStructure() {
  try {
    await db.query(`
      ALTER TABLE emprestimos
      ADD COLUMN data_devolvido DATETIME NULL;
    `);
    console.log("✔ Coluna data_devolvido criada.");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("✔ Coluna data_devolvido já existia.");
    } else {
      console.error("Erro ao ajustar estrutura:", err);
    }
  }
}

// Executa ao iniciar o servidor
ensureDatabaseStructure();

/*
 * ==========================================================
 * ROTA 1 — REGISTRO DE USUÁRIO (ATUALIZADA COM NOME)
 * ==========================================================
 */
app.post('/api/register', async (req, res) => {
  try {
    // 1. Agora esperamos o 'nome' também
    const { nome, email, password } = req.body;

    if (!nome || !email || !password)
      return res.status(400).json({ message: 'Dados incompletos. Nome, email e senha são obrigatórios.' });

    const [exists] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (exists.length > 0)
      return res.status(409).json({ message: 'Email já cadastrado.' });

    const hash = await bcrypt.hash(password, 10);

    // 2. Inserimos o nome no banco
    await db.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );

    res.status(201).json({ message: 'Usuário registrado!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

/*
 * ==========================================================
 * ROTA 2 — LOGIN
 * ==========================================================
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (users.length === 0)
      return res.status(401).json({ message: 'Email ou senha inválidos.' });

    const user = users[0];

    const ok = await bcrypt.compare(password, user.senha);
    if (!ok)
      return res.status(401).json({ message: 'Email ou senha inválidos.' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login realizado!',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro interno.' });
  }
});

/*
 * ==========================================================
 * ROTA 3 — CADASTRO DE LIVRO
 * ==========================================================
 */
app.post('/api/books', async (req, res) => {
  try {
    const { titulo, autor, isbn } = req.body;

    if (!titulo || !autor || !isbn)
      return res.status(400).json({ message: 'Dados incompletos.' });

    const [result] = await db.query(
      "INSERT INTO livros (titulo, autor, isbn) VALUES (?, ?, ?)",
      [titulo, autor, isbn]
    );

    res.status(201).json({ message: 'Livro criado!', bookId: result.insertId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar livro.' });
  }
});

/*
 * ==========================================================
 * ROTA 4 — CRIAR EMPRÉSTIMO
 * ==========================================================
 */
app.post('/api/loans', async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId)
      return res.status(400).json({ message: 'Dados incompletos.' });

    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataDevolucao.getDate() + 15);

    await db.query(
      `INSERT INTO emprestimos (id_usuario, id_livro, data_devolucao_prevista)
       VALUES (?, ?, ?)`,
      [userId, bookId, dataDevolucao]
    );

    res.status(201).json({ message: 'Empréstimo realizado!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar empréstimo.' });
  }
});

/*
 * ==========================================================
 * ROTA 5 — LISTAR EMPRÉSTIMOS (100% compatível com seu frontend)
 * ==========================================================
 */
app.get('/api/loans', async (req, res) => {
  try {

    const query = `
      SELECT
        e.id,
        e.data_emprestimo,
        e.data_devolucao_prevista,
        e.data_devolvido,
        COALESCE(u.nome, u.email) AS nome_usuario,
        u.email AS email_usuario,
        l.titulo AS titulo_livro
      FROM emprestimos e
      INNER JOIN usuarios u ON e.id_usuario = u.id
      INNER JOIN livros l ON e.id_livro = l.id
      ORDER BY e.data_emprestimo DESC
    `;

    const [loans] = await db.query(query);

    res.status(200).json(loans);

  } catch (error) {
    console.error("Erro ao listar empréstimos:", error);
    res.status(500).json({ message: 'Erro ao listar empréstimos.' });
  }
});

/*
 * ==========================================================
 * ROTA 6 — DEVOLVER LIVRO
 * ==========================================================
 */
app.put('/api/loans/:id/devolver', async (req, res) => {
  try {
    const emprestimoId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM emprestimos WHERE id = ?",
      [emprestimoId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Empréstimo não encontrado." });

    await db.query(
      "UPDATE emprestimos SET data_devolvido = NOW() WHERE id = ?",
      [emprestimoId]
    );

    res.status(200).json({ message: "Livro devolvido com sucesso!" });

  } catch (error) {
    console.error("Erro na devolução:", error);
    res.status(500).json({ message: "Erro ao devolver livro." });
  }
});

/*
 * ==========================================================
 * ROTA RAIZ
 * ==========================================================
 */
app.get('/', (req, res) => {
  res.send("Backend ON!");
});

// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
