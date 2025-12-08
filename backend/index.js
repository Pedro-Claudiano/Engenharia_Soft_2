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
 * ROTA 3 — CADASTRO DE LIVRO (Atualizada com Estoque)
 * ==========================================================
 */
app.post('/api/books', async (req, res) => {
  try {
    // 1. Agora aceitamos 'quantidade' também
    // Se o frontend não mandar quantidade, assumimos 1
    const { titulo, autor, isbn, quantidade } = req.body;
    const qtdEstoque = quantidade ? parseInt(quantidade) : 1;

    if (!titulo || !autor || !isbn)
      return res.status(400).json({ message: 'Dados incompletos.' });

    // 2. Inserimos na coluna 'quantidade_estoque'
    const [result] = await db.query(
      "INSERT INTO livros (titulo, autor, isbn, quantidade_estoque) VALUES (?, ?, ?, ?)",
      [titulo, autor, isbn, qtdEstoque]
    );

    res.status(201).json({ message: 'Livro criado!', bookId: result.insertId });

  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Erro: Já existe um livro com este ISBN.' });
    }
    res.status(500).json({ message: 'Erro ao criar livro.' });
  }
});

/* * ==========================================================
 * ROTA 4 — CRIAR EMPRÉSTIMO (ATUALIZADO PARA CLIENTE)
 * ==========================================================
 */
app.post('/api/loans', async (req, res) => {
  try {
    const { clientId, bookId } = req.body; // <--- AGORA É clientId

    // 1. Verificar estoque
    const [livro] = await db.query('SELECT quantidade_estoque FROM livros WHERE id = ?', [bookId]);
    
    if (livro.length === 0) return res.status(404).json({ message: 'Livro não encontrado.' });
    if (livro[0].quantidade_estoque <= 0) {
      return res.status(400).json({ message: 'Livro indisponível no estoque.' });
    }

    // 2. Verificar se o cliente existe
    const [cliente] = await db.query('SELECT id FROM clientes WHERE id = ?', [clientId]);
    if (cliente.length === 0) return res.status(404).json({ message: 'Cliente não encontrado.' });

    // 3. Criar o empréstimo
    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataDevolucao.getDate() + 15);

    // Repare que usamos id_cliente agora
    await db.query(
      'INSERT INTO emprestimos (id_cliente, id_livro, data_devolucao_prevista) VALUES (?, ?, ?)',
      [clientId, bookId, dataDevolucao]
    );

    // 4. Diminuir estoque
    await db.query('UPDATE livros SET quantidade_estoque = quantidade_estoque - 1 WHERE id = ?', [bookId]);

    res.status(201).json({ message: 'Empréstimo realizado com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar empréstimo.' });
  }
});

/*
 * ==========================================================
 * ROTA 5 — LISTAR EMPRÉSTIMOS (ATUALIZADO PARA CLIENTE)
 * ==========================================================
 */
app.get('/api/loans', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, 
        e.data_emprestimo, 
        e.data_devolucao_prevista, 
        e.data_devolucao_real AS data_devolvido,
        c.nome AS nome_cliente,
        c.cpf AS cpf_cliente,
        l.titulo AS titulo_livro
      FROM emprestimos e
      INNER JOIN clientes c ON e.id_cliente = c.id  /* <--- JOIN COM CLIENTES */
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
 * ROTA 6 — DEVOLVER LIVRO (IGUAL, SÓ MANTENDO AQUI PRA GARANTIR)
 * ==========================================================
 */
app.put('/api/loans/:id/devolver', async (req, res) => {
  try {
    const emprestimoId = req.params.id;

    // A lógica de devolução é a mesma, só verifica se já foi devolvido
    const [emprestimo] = await db.query('SELECT id_livro, data_devolucao_real FROM emprestimos WHERE id = ?', [emprestimoId]);

    if (emprestimo.length === 0) return res.status(404).json({ message: "Empréstimo não encontrado." });
    if (emprestimo[0].data_devolucao_real !== null) return res.status(400).json({ message: "Este livro já foi devolvido." });

    // Atualiza data_devolucao_real
    await db.query("UPDATE emprestimos SET data_devolucao_real = NOW() WHERE id = ?", [emprestimoId]);

    // Devolve estoque
    await db.query('UPDATE livros SET quantidade_estoque = quantidade_estoque + 1 WHERE id = ?', [emprestimo[0].id_livro]);

    res.status(200).json({ message: "Livro devolvido e estoque atualizado!" });

  } catch (error) {
    console.error("Erro na devolução:", error);
    res.status(500).json({ message: "Erro ao devolver livro." });
  }
});

/*
 * ==========================================================
 * ROTA 7 — BUSCAR LIVROS (Faltava isso!)
 * ==========================================================
 */
app.get('/api/books', async (req, res) => {
  try {
    const searchTerm = req.query.q || ''; // Pega o termo da URL (ex: ?q=Harry)

    let query = `
      SELECT id, titulo, autor, isbn, quantidade_estoque 
      FROM livros
    `;
    
    let params = [];

    // Se tiver termo de busca, filtra. Se não, traz tudo.
    if (searchTerm) {
      query += ' WHERE titulo LIKE ? OR autor LIKE ?';
      params = [`%${searchTerm}%`, `%${searchTerm}%`];
    }

    const [rows] = await db.query(query, params);

    // TRUQUE: O Frontend espera um campo "status", mas o banco tem "quantidade_estoque".
    // Vamos converter isso aqui antes de enviar.
    const resultados = rows.map(livro => ({
      ...livro,
      status: livro.quantidade_estoque > 0 ? 'Disponível' : 'Indisponível' 
    }));

    res.status(200).json(resultados);

  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({ message: 'Erro ao buscar livros.' });
  }
});

/*
 * ==========================================================
 * ROTA 8 — DELETAR LIVRO (Adicione isto ao index.js)
 * ==========================================================
 */
app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Tenta deletar o livro
    const [result] = await db.query('DELETE FROM livros WHERE id = ?', [id]);

    // Se nenhuma linha foi afetada, o livro não existia
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }

    res.status(200).json({ message: 'Livro deletado com sucesso.' });

  } catch (error) {
    console.error("Erro ao deletar:", error);

    // DICA DE OURO: Se o livro já foi emprestado, o banco vai bloquear a exclusão
    // por causa da "Foreign Key". Vamos tratar esse erro para o usuário entender.
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'Não é possível deletar este livro pois ele está vinculado a empréstimos (histórico).' 
      });
    }

    res.status(500).json({ message: 'Erro ao deletar livro.' });
  }
});

/*
 * ==========================================================
 * ROTA 9 — PEGAR UM ÚNICO LIVRO (Para a tela de Edição)
 * ==========================================================
 */
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM livros WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Erro ao buscar livro:", error);
    res.status(500).json({ message: 'Erro ao buscar dados do livro.' });
  }
});

/*
 * ==========================================================
 * ROTA 10 — ATUALIZAR LIVRO (Para salvar a edição)
 * ==========================================================
 */
app.put('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, isbn } = req.body;

    // Atualiza os dados no banco
    const [result] = await db.query(
      'UPDATE livros SET titulo = ?, autor = ?, isbn = ? WHERE id = ?',
      [titulo, autor, isbn, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Livro não encontrado para atualizar.' });
    }

    res.status(200).json({ message: 'Livro atualizado com sucesso!' });

  } catch (error) {
    console.error("Erro ao atualizar:", error);
    res.status(500).json({ message: 'Erro ao atualizar livro.' });
  }
});

/* * ==========================================================
 * ROTA 11 — LISTAR USUÁRIOS (Simples)
 * ==========================================================
 */

app.get('clients', async (req, res) => {
  try {
    // Busca na tabela 'clientes'
    const [clientes] = await db.query('SELECT id, nome, email FROM clientes ORDER BY nome ASC'); 
    res.status(200).json(clientes);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
});

/* * ==========================================================
 * ROTAS DE CLIENTES (LEITORES) - ADICIONE ISTO!
 * ==========================================================
 */

// 1. Listar Clientes
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY nome ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    res.status(500).json({ message: 'Erro ao buscar clientes.' });
  }
});

// 2. Cadastrar Cliente
app.post('/api/clients', async (req, res) => {
  try {
    const { nome, cpf } = req.body;
    if (!nome || !cpf) return res.status(400).json({ message: 'Nome e CPF são obrigatórios.' });

    await db.query('INSERT INTO clientes (nome, cpf) VALUES (?, ?)', [nome, cpf]);
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'CPF já cadastrado.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar cliente.' });
  }
});

// 3. Atualizar Cliente
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf } = req.body;
    
    await db.query('UPDATE clientes SET nome = ?, cpf = ? WHERE id = ?', [nome, cpf, id]);
    res.status(200).json({ message: 'Cliente atualizado!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar cliente.' });
  }
});

// 4. Deletar Cliente
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM clientes WHERE id = ?', [id]);
    res.status(200).json({ message: 'Cliente removido.' });
  } catch (error) {
    // Se o cliente tiver empréstimos, vai dar erro de FK (isso é bom)
    res.status(500).json({ message: 'Não é possível excluir este cliente (provavelmente possui histórico).' });
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
