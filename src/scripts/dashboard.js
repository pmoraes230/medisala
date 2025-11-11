// === RELÓGIO EM TEMPO REAL (11/11/2025 11:39) ===
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
  showSuccessModal('Sessão encerrada com sucesso!', () => {
    window.location.href = 'index.html';
  });
}

// === MODAL SUCESSO ===
function showSuccessModal(message, callback) {
  const modal = document.getElementById('success-modal');
  document.getElementById('success-message').textContent = message;
  modal.classList.add('show');
  setTimeout(() => {
    modal.classList.remove('show');
    if (callback) callback();
  }, 1500);
}

// === CALENDÁRIO DINÂMICO ===
function renderCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  document.getElementById('mes-ano').textContent = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += '<div class="calendar-day empty"></div>';
  }

  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const hojeStr = today.toISOString().split('T')[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === hojeStr;
    const hasReserva = reservas.some(r => r.data_reserva === dateStr);

    const className = `calendar-day ${isToday ? 'today' : ''} ${hasReserva ? 'has-reserva' : ''}`;
    grid.innerHTML += `<div class="${className}">${day}</div>`;
  }
}

// === MÉTRICAS DINÂMICAS ===
function updateMetrics() {
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

  const hoje = new Date().toISOString().split('T')[0];
  const reservasHoje = reservas.filter(r => r.data_reserva === hoje);
  const salasReservadasHoje = [...new Set(reservasHoje.map(r => r.id_sala))];
  const salasLivres = salas.length - salasReservadasHoje.length;

  const usuariosAtivos = usuarios.filter(u => u.status !== 'inativo').length;

  let percentInsumos = 100;
  if (insumos.length > 0) {
    const estoques = insumos.map(i => parseFloat(i.quantidade_estoq_insumo));
    const totalAtual = estoques.reduce((a, b) => a + b, 0);
    const totalMax = insumos.reduce((a, i) => a + parseFloat(i.quantidade_estoq_insumo || 0), 0);
    percentInsumos = totalMax > 0 ? Math.round((totalAtual / totalMax) * 100) : 0;
  }

  document.getElementById('salas-disponiveis').textContent = salasLivres;
  document.getElementById('agendamentos-hoje').textContent = reservasHoje.length;
  document.getElementById('percent-insumos').textContent = `${percentInsumos}%`;
  document.getElementById('usuarios-ativos').textContent = usuariosAtivos;
}

// === SALAS DISPONÍVEIS HOJE ===
function renderRooms() {
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const hoje = new Date().toISOString().split('T')[0];
  const agora = new Date().toTimeString().slice(0, 5);

  const container = document.getElementById('rooms-grid');
  container.innerHTML = '';

  if (salas.length === 0) {
    container.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 1rem;">Nenhuma sala cadastrada.</p>';
    return;
  }

  salas.forEach(sala => {
    const reservaAtiva = reservas.find(r => 
      r.id_sala == sala.id_sala && 
      r.data_reserva === hoje &&
      r.hora_inicio_reserva <= agora &&
      r.hora_termino_reserva > agora
    );

    const status = reservaAtiva 
      ? `Ocupada até ${reservaAtiva.hora_termino_reserva}h`
      : 'Disponível agora';
    const statusClass = reservaAtiva ? 'ocupada' : '';

    const icon = sala.nome_sala.toLowerCase().includes('lab') ? 'fa-microscope' :
                 sala.nome_sala.toLowerCase().includes('anatomia') ? 'fa-user-graduate' :
                 sala.nome_sala.toLowerCase().includes('simulação') ? 'fa-procedures' :
                 'fa-stethoscope';

    container.innerHTML += `
      <div class="room-card">
        <div class="room-icon"><i class="fas ${icon}"></i></div>
        <div class="room-name">${sala.nome_sala}</div>
        <div class="room-status ${statusClass}">${status}</div>
      </div>
    `;
  });
}

// === INICIAR ===
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  updateMetrics();
  renderRooms();
});