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

// === MODAIS ===
let tempUserData = null;

function openAddUserModal() {
  document.getElementById('add-user-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
  document.getElementById('add-user-form').reset();
  // Reset da foto
  document.getElementById('preview-img').style.display = 'none';
  document.getElementById('placeholder').style.display = 'flex';
}

function openLogoutModal() {
  document.getElementById('logout-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
  document.body.style.overflow = 'auto';
}

// === MÁSCARA DE CPF ===
function applyCPFMask(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  input.value = value.substring(0, 14);
}

// === UPLOAD DE FOTO ===
document.getElementById('upload-area').addEventListener('click', () => {
  document.getElementById('foto_usuario').click();
});

document.getElementById('foto_usuario').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showSuccessModal('Imagem muito grande! Máx. 2MB.', null);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = document.getElementById('preview-img');
    img.src = event.target.result;
    img.style.display = 'block';
    document.getElementById('placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// === ATUALIZAR ESTATÍSTICAS DINÂMICAS ===
function updateStats() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const total = usuarios.length;
  const professores = usuarios.filter(u => u.id_perfil === 2).length;
  const admins = usuarios.filter(u => u.id_perfil === 1).length;
  const ativos = Math.floor(total * 0.95); // 95% ativos (simulação)
  const professorPercent = total > 0 ? Math.round((professores / total) * 100) : 0;
  const adminPercent = total > 0 ? Math.round((admins / total) * 100) : 0;

  // Total de Usuários
  document.getElementById('total-value').textContent = total;
  document.getElementById('total-active').textContent = `${ativos} ativos`;

  // Professores
  document.getElementById('teacher-value').textContent = professores;
  document.getElementById('teacher-percent').textContent = `${professorPercent}% do total`;

  // Administradores
  document.getElementById('admin-value').textContent = admins;
  document.getElementById('admin-percent').textContent = `${adminPercent}% do total`;
}

// === SALVAR USUÁRIO (PRÉ-CONFIRMAÇÃO) ===
function saveNewUser() {
  const form = document.getElementById('add-user-form');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validação
  if (!data.nome_usuario || !data.email_usuario || !data.senha_usuario || !data.CPF_usuario || !data.id_perfil) {
    showSuccessModal('Preencha todos os campos!', null);
    return;
  }

  const cpfLimpo = data.CPF_usuario.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    showSuccessModal('CPF deve ter 11 dígitos!', null);
    return;
  }

  // Obter foto
  const fotoInput = document.getElementById('foto_usuario');
  let fotoBase64 = null;
  if (fotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      fotoBase64 = e.target.result;
      prepararConfirmacao(fotoBase64);
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    prepararConfirmacao(null);
  }

  function prepararConfirmacao(foto) {
    tempUserData = {
      nome_usuario: data.nome_usuario,
      email_usuario: data.email_usuario,
      senha_usuario: data.senha_usuario,
      CPF_usuario: data.CPF_usuario,
      id_perfil: parseInt(data.id_perfil),
      foto_usuario: foto
    };

    const perfis = { 1: 'Administrador', 2: 'Professor', 3: 'Aluno' };
    const preview = `
      <div style="text-align:center; margin-bottom:1rem;">
        ${foto
        ? `<img src="${foto}" style="width:60px; height:60px; border-radius:50%; object-fit:cover;">`
        : `<div style="width:60px; height:60px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; margin:0 auto;">
               <i class="fas fa-user" style="color:#94a3b8; font-size:1.5rem;"></i>
             </div>`
      }
      </div>
      <strong>Nome:</strong> ${tempUserData.nome_usuario}<br>
      <strong>E-mail:</strong> ${tempUserData.email_usuario}<br>
      <strong>CPF:</strong> ${tempUserData.CPF_usuario}<br>
      <strong>Perfil:</strong> ${perfis[tempUserData.id_perfil]}
    `;

    document.getElementById('preview-user').innerHTML = preview;

    closeModal('add-user-modal');
    document.getElementById('confirm-user-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// === CONFIRMAR E SALVAR ===
document.getElementById('confirm-save-btn').addEventListener('click', function () {
  if (!tempUserData) return;

  const id = Date.now();
  const novoUsuario = {
    id_usuario: id,
    nome_usuario: tempUserData.nome_usuario,
    email_usuario: tempUserData.email_usuario,
    senha_usuario: btoa(tempUserData.senha_usuario),
    CPF_usuario: tempUserData.CPF_usuario,
    id_perfil: tempUserData.id_perfil,
    foto_usuario: tempUserData.foto_usuario,
    data_cadastro: new Date().toLocaleDateString('pt-BR')
  };

  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  closeModal('confirm-user-modal');
  showSuccessModal('Usuário cadastrado com sucesso!', loadUsersTable);
  tempUserData = null;
});

// === CARREGAR TABELA ===
function loadUsersTable() {
  const tbody = document.querySelector('.table-container tbody');
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

  tbody.innerHTML = '';

  const perfis = { 1: 'Administrador', 2: 'Professor', 3: 'Aluno' };
  const cores = { 1: 'badge-admin', 2: 'badge-teacher', 3: 'badge-student' };

  usuarios.forEach(user => {
    // Garantir status (padrão: ativo)
    if (!user.status) user.status = 'ativo';

    const inicial = user.nome_usuario.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const avatarHTML = user.foto_usuario
      ? `<img src="${user.foto_usuario}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">`
      : `<div class="user-avatar-small">${inicial}</div>`;

    const statusClass = user.status === 'inativo' ? 'status-inactive' : 'status-active';
    const statusText = user.status === 'inativo' ? 'Inativo' : 'Ativo';

    const tr = document.createElement('tr');
    if (user.status === 'inativo') tr.style.opacity = '0.6';

    tr.innerHTML = `
      <td class="user-cell">
        ${avatarHTML}
        <div>
          <div class="user-name">${user.nome_usuario}</div>
          <div class="user-email">${user.email_usuario}</div>
        </div>
      </td>
      <td>${user.email_usuario}</td>
      <td><span class="badge ${cores[user.id_perfil]}">${perfis[user.id_perfil]}</span></td>
      <td><span class="${statusClass}">${statusText}</span></td>
      <td class="date">${user.data_cadastro}</td>
      <td class="actions">
        <button class="action-btn" onclick="openActionMenu(${user.id_usuario}, this)">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        <div class="action-menu" id="menu-${user.id_usuario}">
          <button onclick="openEditModal(${user.id_usuario})">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="toggleUserStatus(${user.id_usuario}, this)" class="${user.status === 'inativo' ? 'reactivate' : 'deactivate'}">
              <i class="fas fa-${user.status === 'inativo' ? 'check' : 'ban'}"></i>
                ${user.status === 'inativo' ? 'Reativar' : 'Desativar'}
          </button>
          <button onclick="openDeleteModal(${user.id_usuario})" class="delete">
            <i class="fas fa-trash-alt"></i> Excluir
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  updateStats();
}

// === ABRIR MENU DE AÇÕES ===
function openActionMenu(userId, button) {
  // Fechar todos os menus
  document.querySelectorAll('.action-menu').forEach(menu => {
    menu.classList.remove('show');
  });

  const menu = document.getElementById(`menu-${userId}`);
  menu.classList.toggle('show');

  // Fechar ao clicar fora
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!menu.contains(e.target) && e.target !== button) {
        menu.classList.remove('show');
        document.removeEventListener('click', close);
      }
    });
  }, 0);
}

// === ALTERAR STATUS DO USUÁRIO ===
function toggleUserStatus(userId, button) {
  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const user = usuarios.find(u => u.id_usuario == userId);

  if (user) {
    user.status = user.status === 'inativo' ? 'ativo' : 'inativo';
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    loadUsersTable();
    showSuccessModal(
      user.status === 'inativo' ? 'Usuário desativado!' : 'Usuário reativado!',
      updateStats
    );
  }
}

// === ABRIR MODAL DE EDIÇÃO (placeholder) ===
function openEditModal(userId) {
  alert(`Editar usuário ID: ${userId} (funcionalidade em desenvolvimento)`);
  // Futuro: abrir modal com dados do usuário
}

// === MODAL SUCESSO ===
function showSuccessModal(message, callback) {
  const modal = document.getElementById('success-modal');
  document.getElementById('success-message').textContent = message;
  modal.classList.add('show');
  setTimeout(() => {
    modal.classList.remove('show');
    if (callback) callback();
    updateStats();
  }, 1500);
}

// === LOGOUT ===
function confirmLogout() {
  localStorage.removeItem('userPhoto');
  localStorage.removeItem('usuarios');
  closeModal('logout-modal');
  showSuccessModal('Sessão encerrada com sucesso!', () => {
    window.location.href = 'index.html';
  });
}

// === FECHAR AO CLICAR FORA ===
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// === VARIÁVEL GLOBAL PARA EXCLUSÃO ===
let userToDelete = null;

// === ABRIR MODAL DE EXCLUSÃO ===
function openDeleteModal(userId) {
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const user = usuarios.find(u => u.id_usuario == userId);

  if (!user) return;

  userToDelete = user;

  const perfis = { 1: 'Administrador', 2: 'Professor', 3: 'Aluno' };
  const avatar = user.foto_usuario 
    ? `<img src="${user.foto_usuario}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; float:left; margin-right:0.75rem;">`
    : `<div style="width:50px; height:50px; border-radius:50%; background:#e2e8f0; display:flex; align-items:center; justify-content:center; float:left; margin-right:0.75rem;">
         <span style="color:#94a3b8; font-weight:600;">${user.nome_usuario.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</span>
       </div>`;

  document.getElementById('delete-preview').innerHTML = `
    ${avatar}
    <strong>${user.nome_usuario}</strong><br>
    <small>${user.email_usuario} • ${perfis[user.id_perfil]}</small>
  `;

  closeModal('delete-user-modal'); // garante que não fique aberto
  document.getElementById('delete-user-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// === CONFIRMAR EXCLUSÃO ===
document.getElementById('confirm-delete-btn').addEventListener('click', function () {
  if (!userToDelete) return;

  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  usuarios = usuarios.filter(u => u.id_usuario !== userToDelete.id_usuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  closeModal('delete-user-modal');
  showSuccessModal('Usuário excluído com sucesso!', () => {
    loadUsersTable();
    updateStats();
  });

  userToDelete = null;
});

// === CARREGAR TABELA AO INICIAR ===
document.addEventListener('DOMContentLoaded', () => {
  loadUsersTable();
  updateStats()
});