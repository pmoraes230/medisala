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
    document.getElementById('current-time').textContent = `${date} • ${time} -03`;
}
updateClock();
setInterval(updateClock, 1000);

// === DROPDOWN ===
const userDropdown = document.getElementById('user-dropdown');
const dropdownMenu = document.getElementById('dropdown-menu');

userDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    userDropdown.classList.remove('open');
});

dropdownMenu.addEventListener('click', (e) => e.stopPropagation());

// === FOTO DO HEADER ===
const savedPhoto = localStorage.getItem('userPhoto');
const headerImg = document.getElementById('header-img');
const headerInitials = document.getElementById('header-initials');

if (savedPhoto) {
    headerImg.src = savedPhoto;
    headerImg.style.display = 'block';
    headerInitials.style.display = 'none';
}

// === MODAL FUNCTIONS ===
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

function openLogoutModal() {
    modalIcon.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    modalIcon.className = 'modal-icon warning';
    modalTitle.textContent = 'Sair do Sistema';
    modalMessage.textContent = 'Tem certeza que deseja encerrar a sessão?';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function confirmLogout() {
    localStorage.removeItem('userPhoto');
    showSuccessModal('Sessão encerrada com sucesso!', () => {
        window.location.href = 'login.html';
    });
}

function showSuccessModal(message, callback) {
    modalIcon.innerHTML = '<i class="fas fa-check"></i>';
    modalIcon.className = 'modal-icon success';
    modalTitle.textContent = 'Sucesso!';
    modalMessage.textContent = message;
    modal.classList.add('show');
    setTimeout(() => {
        closeModal();
        if (callback) callback();
    }, 1500);
}

// Fechar ao clicar fora
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});