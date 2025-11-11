// --- backend/index.js (VERSÃO FINAL - Conectado ao TiDB Cloud) ---

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // <-- 1. ADICIONADO PARA LER O .env

// 1. Configuração do Servidor Express
const app = express();
const PORT = 3001;

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Configuração da Conexão com o TiDB Cloud (MySQL)
// ================================================================
// Este bloco agora lê os dados do seu arquivo .env
// ================================================================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    // Comece com 'false' para facilitar o teste inicial
    rejectUnauthorized: false 
  }
}).promise();

// ================================================================
// O SEGREDO JWT TAMBÉM PODERIA IR PARA O .env,
// mas vamos deixar como está por simplicidade.
// ================================================================
const JWT_SECRET = 'meu-projeto-de-engenharia-e-top';

/*
 * ================================================================
 * O RESTANTE DO SEU CÓDIGO (ROTAS) CONTINUA IDÊNTICO
 * ================================================================
 */

/*
 * ================================================================
 * NOVA ROTA: Registrar Usuário (POST /api/register)
 * ================================================================
 */
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar se email e senha foram enviados
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Verificar se o email já existe no banco
    const [userExists] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (userExists.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado.' });
    }

    // 3. Criptografar a senha (NUNCA salvar senha em texto puro)
    const salt = await bcrypt.genSalt(10); // Gera o "sal" da criptografia
    const hashedPassword = await bcrypt.hash(password, salt); // Criptografa

    // 4. Salvar o novo usuário no banco
    // (Note que 'nome' fica 'NULL', como planejamos)
    await db.query(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
      [email, hashedPassword]
    );

    console.log(`Novo usuário registrado: ${email}`);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao tentar registrar.' });
  }
});


/*
 * ================================================================
 * NOVA ROTA: Login de Usuário (POST /api/login)
 * ================================================================
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar se email e senha foram enviados
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    // 2. Buscar o usuário pelo email
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    // 3. Se o usuário não for encontrado
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const user = users[0];

    // 4. Comparar a senha enviada com a senha criptografada do banco
    const isPasswordMatch = await bcrypt.compare(password, user.senha);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    // 5. Se chegou aqui, o login está CORRETO!
    // Gerar um token JWT (JSON Web Token)
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Dados que vão dentro do token
      JWT_SECRET,                          // O segredo para assinar o token
      { expiresIn: '1h' }                  // Token expira em 1 hora
    );

    console.log(`Usuário logado: ${email}`);
    // 6. Enviar o token para o frontend
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao tentar logar.' });
  }
});

/*
 * ================================================================
 * NOVA ROTA: Cadastrar Livro (POST /api/books)
 * ================================================================
 */
app.post('/api/books', async (req, res) => {
  try {
    // 1. Pega os dados que o frontend (apiService) enviou no "body"
    const { titulo, autor, isbn } = req.body;

    // 2. Validação simples
    if (!titulo || !autor || !isbn) {
      return res.status(400).json({ message: 'Todos os campos (título, autor, isbn) são obrigatórios.' });
    }

    // 3. Inserir os dados na tabela 'livros'
    // (Note que ano_publicacao será NULL e quantidade_estoque será 1, como definimos no SQL)
    const [result] = await db.query(
      'INSERT INTO livros (titulo, autor, isbn) VALUES (?, ?, ?)',
      [titulo, autor, isbn]
    );

    // 4. Devolve uma resposta de sucesso
    res.status(201).json({
      message: 'Livro cadastrado com sucesso!',
      bookId: result.insertId // Retorna o ID do livro que acabou de ser criado
    });

  } catch (error) {
    console.error('Erro ao cadastrar livro:', error);

    // Tratar erro de ISBN duplicado (código 1062)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Erro: Já existe um livro com este ISBN cadastrado.' });
    }

    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

/*
 * ROTA DE TESTE DA CONEXÃO COM O BANCO (ainda útil)
 */
app.get('/api/test-connection', async (req, res) => {
  try {
    const [results] = await db.query('SELECT 1 + 1 AS solution');
    res.status(200).json({
      success: true,
      message: 'Conexão com o banco de dados bem-sucedida!',
      data: `O resultado de 1+1 é: ${results[0].solution}`
    });
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
    res.status(500).json({
      success: false,
      message: 'Falha ao conectar com o banco de dados.',
      error: error.message
    });
  }
});

/*
 * ROTA DE TESTE DO SERVIDOR (só para ver se está no ar)
 */
app.get('/', (req, res) => {
  res.send('Servidor Backend da Biblioteca está rodando!');
});

// 6. Inicia o Servidor e fica "ouvindo"
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em http://localhost:${PORT}`);
});