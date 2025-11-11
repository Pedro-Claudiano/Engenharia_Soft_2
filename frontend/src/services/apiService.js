// --- frontend/src/services/apiService.js (VERSÃO ATUALIZADA) ---

// Define o endereço do nosso backend.
// O frontend roda em uma porta (ex: 5173) e o backend em outra (3001).
const BASE_URL = 'http://localhost:3001/api';

/**
 * Tenta registrar um novo usuário (CONECTADO AO BACKEND REAL).
 */
async function register(email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Se o backend retornar um erro (ex: "Email já existe"),
    // nós "lançamos" esse erro para o componente (Register.jsx) pegar.
    throw new Error(data.message || 'Falha ao registrar.');
  }

  return data; // Retorna { message: 'Usuário registrado com sucesso!' }
}

/**
 * Tenta fazer login do usuário (CONECTADO AO BACKEND REAL).
 */
async function login(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Lança o erro (ex: "Email ou senha inválidos.")
    throw new Error(data.message || 'Falha ao logar.');
  }

  // Retorna { message: '...', token: '...', user: {...} }
  return data;
}

// =================================================================
// FUNÇÕES ABAIXO AINDA SÃO SIMULADAS (MOCK)
// Vamos mantê-las assim por enquanto para o app não quebrar.
// =================================================================

// --- Dados Fictícios (Mock) ---
const MOCK_DB = [
  { id: 1, titulo: 'O Senhor dos Anéis: A Sociedade do Anel', autor: 'J.R.R. Tolkien', isbn: '978-0618640157', status: 'Disponível' },
  { id: 2, titulo: '1984', autor: 'George Orwell', isbn: '978-0451524935', status: 'Emprestado' },
  { id: 3, titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', isbn: '978-0618260300', status: 'Disponível' },
  { id: 4, titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', isbn: '978-1451673319', status: 'Disponível' },
];
// ------------------------------

/**
 * Tenta enviar um email de recuperação de senha (simulação).
 */
async function forgotPassword(email) {
  // ADICIONE ESTA LINHA para "usar" a variável email
  console.log(`Simulando envio de email de recuperação para: ${email}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: "Email enviado com sucesso." };
}

/**
 * Tenta cadastrar um novo livro (CONECTADO AO BACKEND REAL).
 * @param {object} bookData - Dados do livro { titulo, autor, isbn }
 */
async function createBook(bookData) {
  const { titulo, autor, isbn } = bookData;

  const response = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // NOTA: Em um app real, enviaríamos o token de autenticação aqui
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ titulo, autor, isbn }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Lança o erro (ex: "ISBN duplicado")
    throw new Error(data.message || 'Falha ao cadastrar livro.');
  }

  return data; // Retorna { message: 'Livro cadastrado...', bookId: ... }
}

/**
 * Busca livros no acervo (simulação).
 * @param {string} query - O termo de busca (título ou autor).
 * @returns {Promise<Array>} - Uma lista de livros que correspondem à busca.
 */
async function searchBooks(query) {
  await new Promise(resolve => setTimeout(resolve, 800));
  if (!query) return []; 
  const lowerCaseQuery = query.toLowerCase();
  const results = MOCK_DB.filter(livro => 
    livro.titulo.toLowerCase().includes(lowerCaseQuery) ||
    livro.autor.toLowerCase().includes(lowerCaseQuery)
  );
  return results;
}

/**
 * Exporta um objeto (a "Fachada") com todos os métodos da API.
 */
export const apiService = {
  login,          // <-- REAL
  register,       // <-- REAL
  forgotPassword, // <-- SIMULADO
  createBook,     // <-- SIMULADO
  searchBooks,    // <-- SIMULADO
};