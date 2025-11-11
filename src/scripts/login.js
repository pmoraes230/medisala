// === RELÓGIO EM TEMPO REAL (11/11/2025 11:02) ===
function updateClock() {
  const now = new Date();
  const options = {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const formatted = now.toLocaleString('pt-BR', options);
  const [date, time] = formatted.split(', ');
  document.getElementById('current-time').textContent = `${date} • ${time} -03`;
}
updateClock();
setInterval(updateClock, 1000);

// === MODAL ===
const modal = document.getElementById('modal');
function openModal(title, message, icon = 'check', type = 'success') {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;
  const iconEl = document.getElementById('modal-icon');
  iconEl.innerHTML = `<i class="fas fa-${icon}"></i>`;
  iconEl.className = `modal-icon ${type}`;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// === LOGIN SIMULADO ===
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const login = document.getElementById('login-input').value.trim();
  const senha = document.getElementById('senha-input').value;

  // Simulação: qualquer email/CPF + senha "123" entra
  if (senha === '123') {
    localStorage.setItem('isLoggedIn', 'true');
    openModal('Bem-vindo!', 'Login realizado com sucesso!', 'user-check', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  } else {
    openModal('Erro de Login', 'Credenciais inválidas. Tente: qualquer coisa + senha 123', 'times', 'warning');
  }
});

// === INICIAR ===
document.addEventListener('DOMContentLoaded', () => {
  // Se já estiver logado, vai direto pro dashboard
  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'dashboard.html';
  }
});