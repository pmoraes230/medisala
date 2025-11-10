// === RELÓGIO EM TEMPO REAL ===
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
    document.getElementById('current-time').textContent = `${date} • ${time}`;
}
updateClock();
setInterval(updateClock, 1000);

// === MODAL FUNCTIONS ===
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

function showModal(type, title, message) {
    // Configura tipo
    if (type === 'success') {
        modalIcon.innerHTML = '<i class="fas fa-check"></i>';
        modalIcon.className = 'modal-icon success';
    } else if (type === 'error') {
        modalIcon.innerHTML = '<i class="fas fa-times"></i>';
        modalIcon.className = 'modal-icon error';
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Fechar ao clicar fora
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// === LOGIN COM MODAL ===
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input[type="text"]').value.trim();
    const senha = this.querySelector('input[type="password"]').value;

    if (email && senha) {
        showModal('success', 'Login Realizado!', 'Bem-vindo ao GestSala!');
        setTimeout(() => {
            closeModal();
            window.location.href = 'dashboard.html';
        }, 2000);
    } else {
        showModal('error', 'Erro de Login', 'Por favor, preencha todos os campos.');
    }
});