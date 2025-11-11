// === RELÓGIO (11/11/2025 11:22) ===
function updateClock() {
  const now = new Date();
  const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: true };
  const time = now.toLocaleTimeString('pt-BR', options);
  const date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('current-time').textContent = `${date} • ${time}`;
}
updateClock();
setInterval(updateClock, 1000);

// === HEADER (foto + dropdown) ===
const savedPhoto = localStorage.getItem('userPhoto');
if (savedPhoto) {
  document.getElementById('header-img').src = savedPhoto;
  document.getElementById('header-img').style.display = 'block';
  document.getElementById('header-initials').style.display = 'none';
}
document.getElementById('user-dropdown').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('user-dropdown').classList.toggle('open');
});
document.addEventListener('click', () => document.getElementById('user-dropdown').classList.remove('open'));
document.getElementById('dropdown-menu').addEventListener('click', e => e.stopPropagation());

// === MODAIS ===
function openAddSalaModal() {
  document.getElementById('add-sala-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
  document.getElementById('sala-form').reset();
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = 'auto';
}

// === LOGOUT (CORRIGIDO) ===
function openLogoutModal() {
  document.getElementById('logout-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function confirmLogout() {
  localStorage.removeItem('userPhoto');
  localStorage.removeItem('isLoggedIn');
  showSuccessModal('Sessão encerrada!', () => {
    window.location.href = 'index.html';
  });
}

// === SALVAR SALA ===
function saveSala() {
  const form = document.getElementById('sala-form');
  const data = Object.fromEntries(new FormData(form));

  if (!data.nome_sala || !data.capacidade_sala) {
    showSuccessModal('Preencha todos os campos obrigatórios!', null);
    return;
  }

  const sala = {
    id_sala: Date.now(),
    nome_sala: data.nome_sala.trim(),
    capacidade_sala: parseInt(data.capacidade_sala),
    status_sala: data.status_sala || 'Livre'
  };

  let salas = JSON.parse(localStorage.getItem('salas') || '[]');
  salas.push(sala);
  localStorage.setItem('salas', JSON.stringify(salas));

  closeModal('add-sala-modal');
  showSuccessModal('Sala cadastrada com sucesso!', loadSalas);
}

// === CARREGAR TABELA ===
function loadSalas() {
  const tbody = document.getElementById('salas-tbody');
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const search = document.getElementById('search-sala').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;

  tbody.innerHTML = '';

  const filtered = salas.filter(s => {
    const matchSearch = s.nome_sala.toLowerCase().includes(search);
    const matchStatus = !statusFilter || s.status_sala === statusFilter;
    return matchSearch && matchStatus;
  });

  filtered.forEach(sala => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${sala.nome_sala}</strong></td>
      <td><i class="fas fa-users"></i> ${sala.capacidade_sala}</td>
      <td><span class="badge badge-${sala.status_sala.toLowerCase()}">${sala.status_sala}</span></td>
      <td class="actions">
        <button class="action-btn" onclick="openSalaMenu(${sala.id_sala}, this)">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        <div class="action-menu" id="menu-${sala.id_sala}">
          <button onclick="editSala(${sala.id_sala})"><i class="fas fa-edit"></i> Editar</button>
          <button onclick="openDeleteSalaModal(${sala.id_sala})" class="delete"><i class="fas fa-trash-alt"></i> Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateStats();
}

// === ESTATÍSTICAS ===
function updateStats() {
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const total = salas.length;
  const capacidadeTotal = salas.reduce((s, sala) => s + sala.capacidade_sala, 0);
  const livres = salas.filter(s => s.status_sala === 'Livre').length;
  const reservadas = salas.filter(s => s.status_sala === 'Reservado').length;
  const manutencao = salas.filter(s => s.status_sala === 'Manutenção').length;

  document.getElementById('total-salas').textContent = total;
  document.getElementById('total-capacidade').textContent = `${capacidadeTotal} lugares`;
  document.getElementById('salas-livres').textContent = livres;
  document.getElementById('salas-reservadas').textContent = reservadas;
  document.getElementById('salas-manutencao').textContent = manutencao;
}

// === MENU AÇÕES ===
function openSalaMenu(id, btn) {
  document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));
  const menu = document.getElementById(`menu-${id}`);
  menu.classList.toggle('show');
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!menu.contains(e.target) && e.target !== btn) {
        menu.classList.remove('show');
        document.removeEventListener('click', close);
      }
    });
  }, 0);
}

// === EXCLUIR SALA ===
let salaToDelete = null;
function openDeleteSalaModal(id) {
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const sala = salas.find(s => s.id_sala == id);
  if (!sala) return;

  salaToDelete = sala;
  document.getElementById('delete-sala-preview').innerHTML = `
    <strong>${sala.nome_sala}</strong><br>
    <small>Capacidade: ${sala.capacidade_sala} pessoas • Status: ${sala.status_sala}</small>
  `;

  document.getElementById('delete-sala-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

document.getElementById('confirm-delete-sala').addEventListener('click', () => {
  if (!salaToDelete) return;

  let salas = JSON.parse(localStorage.getItem('salas') || '[]');
  salas = salas.filter(s => s.id_sala !== salaToDelete.id_sala);
  localStorage.setItem('salas', JSON.stringify(salas));

  closeModal('delete-sala-modal');
  showSuccessModal('Sala excluída com sucesso!', loadSalas);
  salaToDelete = null;
});

// === EDITAR (placeholder) ===
function editSala(id) {
  alert(`Editar sala ID: ${id} (em desenvolvimento)`);
}

// === BUSCA E FILTRO ===
document.getElementById('search-sala').addEventListener('input', loadSalas);
document.getElementById('filter-status').addEventListener('change', loadSalas);

// === MODAL SUCESSO ===
function showSuccessModal(msg, cb) {
  const modal = document.getElementById('success-modal');
  document.getElementById('success-message').textContent = msg;
  modal.classList.add('show');
  setTimeout(() => {
    modal.classList.remove('show');
    if (cb) cb();
  }, 1500);
}

// === INICIAR ===
document.addEventListener('DOMContentLoaded', () => {
  loadSalas();
  updateStats();
});