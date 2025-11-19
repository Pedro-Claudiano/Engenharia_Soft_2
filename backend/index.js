// --- backend/index.js (VERSÃO COMPLETA COM EMPRÉSTIMOS) ---

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Lê o arquivo .env

// 1. Configuração do Servidor Express
const app = express();
const PORT = 3001;

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Configuração da Conexão com o TiDB Cloud (MySQL)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Necessário para o TiDB Cloud
  }
}).promise();

// Segredo para assinar o token (Idealmente estaria no .env também)
const JWT_SECRET = 'meu-projeto-de-engenharia-e-top';

/*
 * ================================================================
 * ROTA 1: Registrar Usuário (POST /api/register)
 * ================================================================
 */
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // Verifica se já existe
    const [userExists] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }

    // Criptografa senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Salva no banco
    await db.query(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
      [email, hashedPassword]
    );

    console.log(`Novo usuário registrado: ${email}`);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

/*
 * ================================================================
 * ROTA 2: Login de Usuário (POST /api/login)
 * ================================================================
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // Busca usuário
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const user = users[0];

    // Verifica senha
    const isPasswordMatch = await bcrypt.compare(password, user.senha);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // Gera Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`Usuário logado: ${email}`);
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: { id: user.id, email: user.email, nome: user.nome }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

/*
 * ================================================================
 * ROTA 3: Cadastrar Livro (POST /api/books)
 * ================================================================
 */
app.post('/api/books', async (req, res) => {
  try {
    const { titulo, autor, isbn } = req.body;

    if (!titulo || !autor || !isbn) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const [result] = await db.query(
      'INSERT INTO livros (titulo, autor, isbn) VALUES (?, ?, ?)',
      [titulo, autor, isbn]
    );

    res.status(201).json({
      message: 'Livro cadastrado com sucesso!',
      bookId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao cadastrar livro:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Erro: Já existe um livro com este ISBN.' });
    }
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

/*
 * ================================================================
 * ROTA 4: Criar Empréstimo (POST /api/loans)  <-- NOVO
 * ================================================================
 */
app.post('/api/loans', async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: 'Erro: ID do usuário e ID do livro são obrigatórios.' });
    }

    // Define data de devolução para daqui a 15 dias
    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataDevolucao.getDate() + 15);

    await db.query(
      'INSERT INTO emprestimos (id_usuario, id_livro, data_devolucao_prevista) VALUES (?, ?, ?)',
      [userId, bookId, dataDevolucao]
    );

    res.status(201).json({ message: 'Empréstimo realizado com sucesso!' });

  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    res.status(500).json({ message: 'Erro ao processar empréstimo.' });
  }
});

/*
 * ================================================================
 * ROTA 5: Listar Empréstimos (GET /api/loans) <-- NOVO
 * ================================================================
 */
app.get('/api/loans', async (req, res) => {
  try {
    // Faz o JOIN para pegar os nomes do Usuário e do Livro em vez de só os IDs
    const query = `
      SELECT 
        emprestimos.id,
        emprestimos.data_emprestimo,
        emprestimos.data_devolucao_prevista,
        usuarios.nome AS nome_usuario,
        usuarios.email AS email_usuario,
        livros.titulo AS titulo_livro
      FROM emprestimos
      INNER JOIN usuarios ON emprestimos.id_usuario = usuarios.id
      INNER JOIN livros ON emprestimos.id_livro = livros.id
      ORDER BY emprestimos.data_emprestimo DESC
    `;

    const [loans] = await db.query(query);
    res.status(200).json(loans);

  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    res.status(500).json({ message: 'Erro ao listar empréstimos.' });
  }
});

/*
 * ROTA DE TESTE DA CONEXÃO
 */
app.get('/api/test-connection', async (req, res) => {
  try {
    const [results] = await db.query('SELECT 1 + 1 AS solution');
    res.status(200).json({
      success: true,
      message: 'Conexão com o banco TiDB Cloud bem-sucedida!',
      data: `1 + 1 = ${results[0].solution}`
    });
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/*
 * ROTA RAIZ
 */
app.get('/', (req, res) => {
  res.send('Servidor Backend da Biblioteca está rodando e conectado à Nuvem!');
});

// Inicia o Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});