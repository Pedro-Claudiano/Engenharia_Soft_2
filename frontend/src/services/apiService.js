// --- frontend/src/services/apiService.js (VERSÃO FINAL COMPLETA) ---

// Define o endereço do nosso backend.
const BASE_URL = 'http://localhost:3001/api';

/**
 * Tenta registrar um novo usuário (CONECTADO AO BACKEND REAL).
 */
async function register(email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao registrar.');
  }
  return data;
}

/**
 * Tenta fazer login do usuário (CONECTADO AO BACKEND REAL).
 */
async function login(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao logar.');
  }
  return data;
}

/**
 * Tenta cadastrar um novo livro (CONECTADO AO BACKEND REAL).
 */
async function createBook(bookData) {
  const { titulo, autor, isbn } = bookData;
  const response = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, autor, isbn }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar livro.');
  }
  return data;
}

/**
 * Cria um novo empréstimo (CONECTADO AO BACKEND REAL).
 */
async function createLoan(userId, bookId) {
  const response = await fetch(`${BASE_URL}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, bookId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao realizar empréstimo.');
  }
  return data;
}

/**
 * Busca a lista de todos os empréstimos (CONECTADO AO BACKEND REAL).
 */
async function getLoans() {
  const response = await fetch(`${BASE_URL}/loans`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao buscar empréstimos.');
  }
  return data;
}

/**
 * Atualiza um livro (CONECTADO AO BACKEND REAL).
 * Nota: Mantém lógica de Mock para 'searchBooks' funcionar temporariamente.
 */
async function updateBook(id, bookData) {
  const { titulo, autor, isbn } = bookData;
  const response = await fetch(`${BASE_URL}/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, autor, isbn }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Falha ao atualizar livro.");
  }
  
  // Atualiza também o MOCK_DB para consistência da simulação de busca
  const bookIndex = MOCK_DB.findIndex(livro => livro.id == id);
  if (bookIndex !== -1) {
    MOCK_DB[bookIndex] = { ...MOCK_DB[bookIndex], ...bookData };
  }
  return data;
}

/**
 * Deleta um livro (CONECTADO AO BACKEND REAL).
 */
async function deleteBook(id) {
  const response = await fetch(`${BASE_URL}/books/${id}`, {
    method: 'DELETE',
    headers: {},
  });
  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Falha ao deletar livro.");
  }
  
  // Remove do MOCK_DB local para consistência da busca simulada
  const bookIndex = MOCK_DB.findIndex(livro => livro.id == id);
  if (bookIndex !== -1) {
    MOCK_DB.splice(bookIndex, 1);
  }
  
  return data;
}

// =================================================================
// FUNÇÕES AINDA SIMULADAS (MOCK)
// (Mantidas para não quebrar a busca e recuperação de senha enquanto não migramos tudo)
// =================================================================

// --- Dados Fictícios (Mock) ---
// Usado apenas pela função searchBooks e getBookById temporariamente
const MOCK_DB = [
  { id: 1, titulo: 'O Senhor dos Anéis: A Sociedade do Anel', autor: 'J.R.R. Tolkien', isbn: '978-0618640157', status: 'Disponível' },
  { id: 2, titulo: '1984', autor: 'George Orwell', isbn: '978-0451524935', status: 'Emprestado' },
  { id: 3, titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', isbn: '978-0618260300', status: 'Disponível' },
  { id: 4, titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', isbn: '978-1451673319', status: 'Disponível' },
];

/**
 * Tenta enviar um email de recuperação de senha (simulação).
 */
async function forgotPassword(email) {
  console.log(`Simulando envio de email de recuperação para: ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: "Email enviado com sucesso." };
}

/**
 * Busca livros no acervo (Ainda simulada usando MOCK_DB).
 * Idealmente, no futuro, você criará uma rota GET /api/books?q=... no backend.
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
 * Busca um livro específico pelo ID (Ainda simulada).
 */
async function getBookById(id) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const book = MOCK_DB.find(livro => livro.id == id); 
  if (book) {
    return book;
  } else {
    throw new Error("Livro não encontrado.");
  }
}

/**
 * Exporta um objeto (a "Fachada") com todos os métodos da API.
 */
export const apiService = {
  login,
  register,
  forgotPassword,
  createBook,
  updateBook,
  deleteBook,
  createLoan, // NOVO: Empréstimos
  getLoans,   // NOVO: Empréstimos
  searchBooks, // (Simulado)
  getBookById, // (Simulado)
};