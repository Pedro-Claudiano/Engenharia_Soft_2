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

const db = mysql.createPool({
  host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  user: 'Zb6tk6aCtzWtwgi.root',
  password: 'a5iUyKPEguu8hwSa',
  database: 'test',
  port: 4000,
  ssl: { rejectUnauthorized: false }
}).promise();

const JWT_SECRET = 'meu-projeto-de-engenharia-e-top';

// ROTAS
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Dados incompletos.' });

    const [userExists] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (userExists.length > 0) return res.status(409).json({ message: 'Email já cadastrado.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hashedPassword]);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Dados incompletos.' });

    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ message: 'Email ou senha inválidos.' });

    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user.senha);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Email ou senha inválidos.' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Sucesso!', token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno.' });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { titulo, autor, isbn } = req.body;
    if (!titulo || !autor || !isbn) return res.status(400).json({ message: 'Dados incompletos.' });

    const [result] = await db.query('INSERT INTO livros (titulo, autor, isbn) VALUES (?, ?, ?)', [titulo, autor, isbn]);
    res.status(201).json({ message: 'Livro criado!', bookId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar livro.' });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) return res.status(400).json({ message: 'Dados incompletos.' });

    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataDevolucao.getDate() + 15);
    
    await db.query('INSERT INTO emprestimos (id_usuario, id_livro, data_devolucao_prevista) VALUES (?, ?, ?)', [userId, bookId, dataDevolucao]);
    res.status(201).json({ message: 'Empréstimo realizado!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no empréstimo.' });
  }
});

app.get('/api/loans', async (req, res) => {
  try {
    const query = `SELECT e.id, e.data_emprestimo, e.data_devolucao_prevista, u.nome, u.email, l.titulo 
                   FROM emprestimos e 
                   INNER JOIN usuarios u ON e.id_usuario = u.id 
                   INNER JOIN livros l ON e.id_livro = l.id 
                   ORDER BY e.data_emprestimo DESC`;
    const [loans] = await db.query(query);
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar.' });
  }
});

app.get('/', (req, res) => res.send('Backend ON!'));

if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;