// --- Dados Fictícios (Mock) ---
// Em um app real, isso viria de um banco de dados.
const MOCK_DB = [
  { id: 1, titulo: 'O Senhor dos Anéis: A Sociedade do Anel', autor: 'J.R.R. Tolkien', isbn: '978-0618640157', status: 'Disponível' },
  { id: 2, titulo: '1984', autor: 'George Orwell', isbn: '978-0451524935', status: 'Emprestado' },
  { id: 3, titulo: 'O Hobbit', autor: 'J.R.R. Tolkien', isbn: '978-0618260300', status: 'Disponível' },
  { id: 4, titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', isbn: '978-1451673319', status: 'Disponível' },
];
// ------------------------------

/**
 * Tenta fazer login do usuário (simulação).
 */
async function login(email, password) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (email === "leitor@email.com" && password === "senha123") {
    return { success: true, user: { name: "Leitor" } };
  } else {
    throw new Error('Email ou senha inválidos.');
  }
}

/**
 * Tenta enviar um email de recuperação de senha (simulação).
 */
async function forgotPassword(email) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { message: "Email enviado com sucesso." };
}

/**
 * Tenta registrar um novo usuário (simulação).
 */
async function register(email, password) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Usuário registrado (simulado):', { email });
  return { success: true, message: "Conta criada com sucesso" };
}

/**
 * Tenta cadastrar um novo livro (simulação).
 * @param {object} bookData - Dados do livro { titulo, autor, isbn }
 * @returns {Promise<object>} - O livro criado.
 */
async function createBook(bookData) {
  // A lógica de simulação do seu componente está aqui
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newBook = { 
    id: MOCK_DB.length + 1, 
    ...bookData, 
    status: 'Disponível' 
  };
  MOCK_DB.push(newBook); // Adiciona ao nosso "banco de dados"
  
  console.log("Livro adicionado (simulado):", newBook);
  console.log("Acervo atual:", MOCK_DB);
  
  return newBook;
}

/**
 * Busca livros no acervo (simulação).
 * @param {string} query - O termo de busca (título ou autor).
 * @returns {Promise<Array>} - Uma lista de livros que correspondem à busca.
 */
async function searchBooks(query) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!query) {
    return []; 
  }

  const lowerCaseQuery = query.toLowerCase();
  
  const results = MOCK_DB.filter(livro => 
    livro.titulo.toLowerCase().includes(lowerCaseQuery) ||
    livro.autor.toLowerCase().includes(lowerCaseQuery)
  );
  
  console.log("Busca por:", query, "Resultados:", results);
  return results;
}

/**
 * Exporta um objeto (a "Fachada") com todos os métodos da API.
 */
export const apiService = {
  login,
  forgotPassword,
  register,
  createBook,   // Adicionado
  searchBooks,  // Adicionado
};

