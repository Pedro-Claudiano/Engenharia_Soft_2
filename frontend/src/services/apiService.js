// --- frontend/src/services/apiService.js (VERSÃO FINAL COMPLETA) ---

const BASE_URL = 'http://localhost:3001/api';

/* ============================
   USUÁRIO
============================ */

async function register(email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Falha ao registrar.');
  return data;
}

async function login(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Falha ao logar.');
  return data;
}

/* ============================
   LIVROS
============================ */

async function createBook(bookData) {
  const { titulo, autor, isbn } = bookData;

  const response = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, autor, isbn }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Falha ao cadastrar livro.');
  return data;
}

async function updateBook(id, bookData) {
  const { titulo, autor, isbn } = bookData;

  const response = await fetch(`${BASE_URL}/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, autor, isbn }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Falha ao atualizar livro.');

  return data;
}

async function deleteBook(id) {
  const response = await fetch(`${BASE_URL}/books/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Falha ao deletar livro.');

  return data;
}

/* ============================
   EMPRÉSTIMOS
============================ */

// Criar empréstimo
async function createLoan(userId, bookId) {
  const response = await fetch(`${BASE_URL}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, bookId }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao realizar empréstimo.');
  return data;
}

// Buscar empréstimos
async function getLoans() {
  const response = await fetch(`${BASE_URL}/loans`);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Erro ao buscar empréstimos.');
  return data;
}

// DEVOLVER LIVRO — AGORA FUNCIONANDO!
async function returnLoan(id) {
  const response = await fetch(`${BASE_URL}/loans/${id}/devolver`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao devolver livro.');
  return data;
}

/* ============================
   MOCKS TEMPORÁRIOS (AINDA USADOS PELO BUSCADOR)
============================ */

const MOCK_DB = [
  { id: 1, titulo: 'O Senhor dos Anéis: A Sociedade do Anel', autor: 'J.R.R. Tolkien', isbn: '978-0618640157', status: 'Disponível' },
  { id: 2, titulo: '1984', autor: 'George Orwell', isbn: '978-0451524935', status: 'Emprestado' },
  { id: 3, titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', isbn: '978-0618260300', status: 'Disponível' },
  { id: 4, titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', isbn: '978-1451673319', status: 'Disponível' },
];

async function forgotPassword(email) {
  console.log(`Simulando envio de e-mail para: ${email}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: "Email enviado com sucesso." };
}

async function searchBooks(query) {
  await new Promise(resolve => setTimeout(resolve, 800));
  if (!query) return [];
  return MOCK_DB.filter(l =>
    l.titulo.toLowerCase().includes(query.toLowerCase()) ||
    l.autor.toLowerCase().includes(query.toLowerCase())
  );
}

async function getBookById(id) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const book = MOCK_DB.find(l => l.id == id);
  if (book) return book;
  throw new Error("Livro não encontrado.");
}

/* ============================
   EXPORTAÇÃO FINAL
============================ */

export const apiService = {
  login,
  register,
  forgotPassword,
  createBook,
  updateBook,
  deleteBook,
  createLoan,
  getLoans,
  returnLoan,  // ← AGORA EXISTE AQUI
  searchBooks,
  getBookById,
};
