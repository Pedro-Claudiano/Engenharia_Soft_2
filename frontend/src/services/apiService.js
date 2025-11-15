// --- frontend/src/services/apiService.js (VERSÃO ATUALIZADA) ---

// Define o endereço do nosso backend.
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
    headers: {
      'Content-Type': 'application/json',
    },
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
 * @param {object} bookData - Dados do livro { titulo, autor, isbn }
 */
async function createBook(bookData) {
  const { titulo, autor, isbn } = bookData;

  const response = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ titulo, autor, isbn }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar livro.');
  }

  return data;
}

// =================================================================
// FUNÇÕES ABAIXO AINDA SÃO SIMULADAS (MOCK)
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
  console.log(`Simulando envio de email de recuperação para: ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: "Email enviado com sucesso." };
}

/**
 * Busca livros no acervo (simulação).
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

// --- 1. NOVA FUNÇÃO ADICIONADA ---
/**
 * Busca um livro específico pelo ID (simulação).
 * @param {string} id - O ID do livro.
 * @returns {Promise<object>} - O livro encontrado.
 */
async function getBookById(id) {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Usamos '==' para comparar string (da URL) com número (do mock)
  const book = MOCK_DB.find(livro => livro.id == id); 
  if (book) {
    return book;
  } else {
    throw new Error("Livro não encontrado.");
  }
}

// --- 2. NOVA FUNÇÃO ADICIONADA ---
/**
 * Atualiza um livro (CONECTADO AO BACKEND REAL).
 * @param {string} id - O ID do livro a ser atualizado.
 * @param {object} bookData - Os dados atualizados { titulo, autor, isbn }
 * @returns {Promise<object>} - O livro atualizado.
 */
async function updateBook(id, bookData) {
  const { titulo, autor, isbn } = bookData;
  
  const response = await fetch(`${BASE_URL}/books/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({ titulo, autor, isbn }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Falha ao atualizar livro.");
  }
  
  // Atualiza também o MOCK_DB para consistência da simulação
  const bookIndex = MOCK_DB.findIndex(livro => livro.id == id);
  if (bookIndex !== -1) {
    MOCK_DB[bookIndex] = { ...MOCK_DB[bookIndex], ...bookData };
  }

  return data;
}


/**
 * Exporta um objeto (a "Fachada") com todos os métodos da API.
 */
export const apiService = {
  login,
  register,
  forgotPassword,
  createBook,     // <-- REAL (Comentário corrigido)
  searchBooks,    // <-- SIMULADO
  getBookById,    // <-- 3. ADICIONADO AQUI
  updateBook,     // <-- 4. ADICIONADO AQUI
};