(() => {
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const entrarBtn = document.getElementById('entrar');
  const erro = document.getElementById('erro');
  const toggleSenha = document.getElementById('toggleSenha');

  const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbx33kwB_uKur1d12uVrWrBPkcEM8m9-NhgL6RTzso9TPGb5wsHWV7S9OrfkAxeiAnnz0g/exec";

  // ==========================
  // Função de Login
  // ==========================
  function validarLogin() {
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    erro.textContent = '';

    if (!email || !senha) {
      erro.textContent = 'Preencha e-mail e senha';
      return;
    }

    const url = `${SHEET_API_URL}?email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          // redireciona direto para a página principal
          window.location.href = "tradeWR/"; // aqui você já pode usar só a pasta
        } else {
          erro.textContent = 'E-mail ou senha inválidos';
        }
      })
      .catch(err => {
        console.error('Erro na requisição ->', err);
        erro.textContent = 'Erro ao validar login';
      });
  }

  // ==========================
  // Eventos
  // ==========================
  entrarBtn.addEventListener('click', validarLogin);

  emailInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') senhaInput.focus();
  });

  senhaInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') validarLogin();
  });

  toggleSenha.addEventListener('click', () => {
    senhaInput.type = senhaInput.type === "password" ? "text" : "password";
  });
})();
