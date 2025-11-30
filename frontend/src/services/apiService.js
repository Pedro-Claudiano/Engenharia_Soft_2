const BASE_URL = 'http://localhost:3001/api';

async function register(nome, email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, password }),
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

async function createBook(bookData) {
  const { titulo, autor, isbn, quantidade } = bookData;

  const response = await fetch(`${BASE_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, autor, isbn, quantidade }),
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

// Atualize esta função
async function createLoan(clientId, bookId) { // <--- Recebe clientId
  const response = await fetch(`${BASE_URL}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, bookId }), // <--- Envia clientId
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao realizar empréstimo.');
  return data;
}
async function getLoans() {
  const response = await fetch(`${BASE_URL}/loans`);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Erro ao buscar empréstimos.');
  return data;
}

async function devolverLoan(id) {
  const response = await fetch(`${BASE_URL}/loans/${id}/devolver`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao devolver livro.');
  return data;
}

async function searchBooks(query) {
  const url = query 
    ? `${BASE_URL}/books?q=${encodeURIComponent(query)}`
    : `${BASE_URL}/books`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Erro ao buscar livros.');
  return data;
}

async function getBookById(id) {
  const response = await fetch(`${BASE_URL}/books/${id}`);
  const data = await response.json();

  if (!response.ok) throw new Error(data.message || 'Livro não encontrado.');
  return data;
}

async function forgotPassword(email) {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { message: "Email enviado com sucesso." };
}


/* ============================
   CLIENTES (LEITORES)
============================ */

async function getClients() {
  const response = await fetch(`${BASE_URL}/clients`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao buscar clientes.');
  return data;
}

async function createClient(clientData) {
  const response = await fetch(`${BASE_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao cadastrar cliente.');
  return data;
}

async function updateClient(id, clientData) {
  const response = await fetch(`${BASE_URL}/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao atualizar cliente.');
  return data;
}

async function deleteClient(id) {
  const response = await fetch(`${BASE_URL}/clients/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao deletar cliente.');
  return data;
}

export const apiService = {
  login,
  register,
  forgotPassword,
  createBook,
  updateBook,
  deleteBook,
  createLoan,
  getLoans,
  devolverLoan,
  searchBooks,
  getBookById,
  getClients,
  createClient,
  updateClient,
  deleteClient,
};