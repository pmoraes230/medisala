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

// === FOTO DO HEADER E PERFIL ===
const savedPhoto = localStorage.getItem('userPhoto');
const headerImg = document.getElementById('header-img');
const headerInitials = document.getElementById('header-initials');
const profileImg = document.getElementById('profile-img');
const profileAvatar = document.getElementById('profile-avatar');

if (savedPhoto) {
    headerImg.src = savedPhoto;
    profileImg.src = savedPhoto;
    headerImg.style.display = 'block';
    profileImg.style.display = 'block';
    headerInitials.style.display = 'none';
    profileAvatar.querySelector('i').style.display = 'none';
}

// === UPLOAD DE FOTO ===
const fileInput = document.getElementById('upload-photo');
const saveBtn = document.getElementById('save-btn');

fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            const imgData = ev.target.result;
            profileImg.src = imgData;
            headerImg.src = imgData;
            profileImg.style.display = 'block';
            headerImg.style.display = 'block';
            profileAvatar.querySelector('i').style.display = 'none';
            headerInitials.style.display = 'none';
            saveBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

// === SALVAR FOTO (MODAL INDEPENDENTE) ===
saveBtn.addEventListener('click', function () {
    const currentSrc = profileImg.src;
    localStorage.setItem('userPhoto', currentSrc);
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Salvo!';

    showSuccessModal('Foto salva com sucesso!', () => {
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Salvar Alterações';
    });
});

// === MODAL: LOGOUT ===
function openLogoutModal() {
    document.getElementById('logout-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// === MODAL: SUCESSO ===
function showSuccessModal(message, callback) {
    const modal = document.getElementById('success-modal');
    document.getElementById('success-message').textContent = message;
    modal.classList.add('show');

    setTimeout(() => {
        modal.classList.remove('show');
        if (callback) callback();
    }, 1500);
}

// === CONFIRMAR LOGOUT ===
function confirmLogout() {
    localStorage.removeItem('userPhoto');
    closeModal('logout-modal');
    showSuccessModal('Sessão encerrada com sucesso!', () => {
        window.location.href = 'login.html';
    });
}

// === FECHAR MODAL ===
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Fechar ao clicar fora
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});