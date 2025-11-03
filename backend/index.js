// --- backend/index.js ---

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// 1. Configuração do Servidor Express
const app = express();
const PORT = 3001; // Porta que o backend vai rodar (diferente do frontend)

// 2. Middlewares (Plugins)
app.use(cors()); // Permite que o frontend acesse este backend
app.use(express.json()); // Permite que o servidor entenda requisições com JSON

// 3. Configuração da Conexão com o MySQL
// ================================================================
// !! ATENÇÃO: Troque 'SUA_SENHA_ROOT' pela senha do seu MySQL !!
// ================================================================
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',                 // ou o usuário que você usa
  password: 'root',   // <<<<<<< MUDE AQUI
  database: 'biblioteca_db'
}).promise(); // .promise() é crucial para usarmos async/await

/*
 * ROTA DE TESTE DA CONEXÃO COM O BANCO
 */
app.get('/api/test-connection', async (req, res) => {
  console.log('Recebida requisição em /api/test-connection');
  try {
    // Tenta fazer uma consulta simples no banco (1+1)
    const [results] = await db.query('SELECT 1 + 1 AS solution');
    
    // Se funcionar, manda sucesso
    res.status(200).json({
      success: true,
      message: 'Conexão com o banco de dados bem-sucedida!',
      data: `O resultado de 1+1 é: ${results[0].solution}` // Deve ser 2
    });
    console.log('Conexão com BD OK.');

  } catch (error) {
    // Se der erro, manda o erro
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
  console.log('Teste a conexão com o banco em: http://localhost:3001/api/test-connection');
});