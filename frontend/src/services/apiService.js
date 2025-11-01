/**
 * Tenta fazer login do usuário (simulação).
 * @param {string} email - O email do usuário.
 * @param {string} password - A senha do usuário.
 * @returns {Promise<object>} - Os dados do usuário em caso de sucesso.
 * @throws {Error} - Lança um erro com a mensagem de falha.
 */
async function login(email, password) {
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (email === "leitor@email.com" && password === "senha123") {
    return { success: true, user: { name: "Leitor" } };
  } else {
    throw new Error('Email ou senha inválidos.');
  }
}

/**
 * Tenta enviar um email de recuperação de senha (simulação).
 * @param {string} email - O email para o qual enviar a recuperação.
 * @returns {Promise<object>} - Uma mensagem de sucesso.
 * @throws {Error} - Lança um erro em caso de falha.
 */
async function forgotPassword(email) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { message: "Email enviado com sucesso." };
}

/**
 * Tenta registrar um novo usuário (simulação).
 * @param {string} email - O email do novo usuário.
 * @param {string} password - A senha do novo usuário.
 * @returns {Promise<object>} - Uma mensagem de sucesso.
 * @throws {Error} - Lança um erro em caso de falha (simulação).
 */
async function register(email, password) {
  // 1. A lógica de simulação foi movida para cá
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 2. Apenas simula sucesso. Você pode adicionar lógicas de erro aqui.
  // if (email === "jaexiste@email.com") {
  //   throw new Error("Este email já está cadastrado.");
  // }
  
  console.log('Usuário registrado (simulado):', { email });
  return { success: true, message: "Conta criada com sucesso" };
}

/**
 * Exporta um objeto (a "Fachada") com todos os métodos da API.
 */
export const apiService = {
  login,
  forgotPassword,
  register, // 3. ADICIONADO AQUI
  // createBook,
};

