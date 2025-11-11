// === RELÓGIO ===
function updateClock() {
  const now = new Date();
  const options = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: true };
  const time = now.toLocaleTimeString('pt-BR', options);
  const date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('current-time').textContent = `${date} • ${time}`;
}
updateClock();
setInterval(updateClock, 1000);

// === HEADER ===
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

// === DADOS ===
const currentUser = { id_usuario: 1, nome_usuario: "Admin" }; // Simulação
let selectedInsumos = [];

// === CARREGAR SALAS E INSUMOS ===
function loadSalas() {
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const select = document.getElementById('select-sala');
  select.innerHTML = '<option value="">Selecione uma sala...</option>';
  salas.forEach(sala => {
    const opt = document.createElement('option');
    opt.value = sala.id_sala;
    opt.textContent = `${sala.nome_sala} (${sala.capacidade_sala} pessoas)`;
    select.appendChild(opt);
  });
}

function loadInsumos() {
  const insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  const container = document.getElementById('insumo-options');
  container.innerHTML = '';
  insumos.forEach(insumo => {
    const div = document.createElement('div');
    div.className = 'insumo-option';
    div.innerHTML = `
      <div>
        <strong>${insumo.nome_insumo}</strong><br>
        <small>Estoque: ${insumo.quantidade_estoq_insumo} ${insumo.unidade_medida_insumo}</small>
      </div>
      <button type="button" onclick="addInsumo(${insumo.id_insumos})" class="btn-small">Adicionar</button>
    `;
    container.appendChild(div);
  });
}

// === ADICIONAR INSUMO ===
function addInsumo(id) {
  const insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  const insumo = insumos.find(i => i.id_insumos == id);
  if (!insumo || parseFloat(insumo.quantidade_estoq_insumo) <= 0) return;

  if (selectedInsumos.find(i => i.id_insumos == id)) {
    showSuccessModal('Insumo já adicionado!', null);
    return;
  }

  selectedInsumos.push({
    id_insumos: insumo.id_insumos,
    nome_insumo: insumo.nome_insumo,
    unidade_medida_insumo: insumo.unidade_medida_insumo,
    quantidade_utilizada: 0,
    estoque_disponivel: parseFloat(insumo.quantidade_estoq_insumo)
  });

  renderSelectedInsumos();
  closeModal('insumo-selector-modal');
}

function renderSelectedInsumos() {
  const container = document.getElementById('insumos-list');
  container.innerHTML = '';
  selectedInsumos.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'insumo-item';
    div.innerHTML = `
      <span>${item.nome_insumo} (${item.unidade_medida_insumo})</span>
      <input type="number" min="0.001" max="${item.estoque_disponivel}" step="0.001" 
             value="1" onchange="updateInsumoQty(${index}, this.value)">
      <button type="button" onclick="removeInsumo(${index})" style="color:var(--danger);background:none;border:none;">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

function updateInsumoQty(index, value) {
  const qty = parseFloat(value) || 0;
  if (qty > selectedInsumos[index].estoque_disponivel) {
    showSuccessModal('Quantidade maior que o estoque!', null);
    return;
  }
  selectedInsumos[index].quantidade_utilizada = qty;
}

function removeInsumo(index) {
  selectedInsumos.splice(index, 1);
  renderSelectedInsumos();
}

function openInsumoSelector() {
  loadInsumos();
  document.getElementById('insumo-selector-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

// === SALVAR RESERVA ===
document.getElementById('reserva-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  // Validação
  if (data.hora_inicio_reserva >= data.hora_termino_reserva) {
    showSuccessModal('Hora de término deve ser após o início!', null);
    return;
  }

  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const conflito = reservas.some(r => 
    r.id_sala == data.id_sala &&
    r.data_reserva === data.data_reserva &&
    ((data.hora_inicio_reserva >= r.hora_inicio_reserva && data.hora_inicio_reserva < r.hora_termino_reserva) ||
     (data.hora_termino_reserva > r.hora_inicio_reserva && data.hora_termino_reserva <= r.hora_termino_reserva))
  );

  if (conflito) {
    showSuccessModal('Conflito de horário! Esta sala já está reservada.', null);
    return;
  }

  // Salvar reserva
  const reserva = {
    id_reserva: Date.now(),
    ...data,
    id_usuario: currentUser.id_usuario,
    insumos: selectedInsumos.map(i => ({
      id_insumos: i.id_insumos,
      quantidade_utilizada: i.quantidade_utilizada
    }))
  };

  reservas.push(reserva);
  localStorage.setItem('reservas', JSON.stringify(reservas));

  // Atualizar estoque
  const insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  reserva.insumos.forEach(item => {
    const insumo = insumos.find(i => i.id_insumos == item.id_insumos);
    if (insumo) {
      insumo.quantidade_estoq_insumo = (parseFloat(insumo.quantidade_estoq_insumo) - item.quantidade_utilizada).toFixed(3);
    }
  });
  localStorage.setItem('insumos', JSON.stringify(insumos));

  showSuccessModal('Reserva realizada com sucesso!', () => {
    resetForm();
    loadReservas();
    updateStats();
  });
});

function resetForm() {
  document.getElementById('reserva-form').reset();
  selectedInsumos = [];
  renderSelectedInsumos();
}

// === CARREGAR RESERVAS ===
function loadReservas() {
  const tbody = document.getElementById('reservas-tbody');
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');

  tbody.innerHTML = '';
  reservas.forEach(reserva => {
    const usuario = usuarios.find(u => u.id_usuario == reserva.id_usuario);
    const sala = salas.find(s => s.id_sala == reserva.id_sala);
    const insumosText = reserva.insumos.length > 0 
      ? reserva.insumos.map(i => `${i.quantidade_utilizada}`).join(', ')
      : 'Nenhum';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(reserva.data_reserva).toLocaleDateString('pt-BR')} ${reserva.hora_inicio_reserva} - ${reserva.hora_termino_reserva}</td>
      <td><strong>${sala?.nome_sala || '—'}</strong></td>
      <td>${usuario?.nome_usuario || '—'}</td>
      <td><small>${insumosText}</small></td>
      <td><span class="badge badge-reservado">Reservado</span></td>
      <td class="actions">
        <button class="action-btn" onclick="cancelReserva(${reserva.id_reserva})">
          <i class="fas fa-times"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function cancelReserva(id) {
  if (!confirm('Cancelar esta reserva?')) return;
  let reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  reservas = reservas.filter(r => r.id_reserva != id);
  localStorage.setItem('reservas', JSON.stringify(reservas));
  loadReservas();
  showSuccessModal('Reserva cancelada!', updateStats);
}

// === ESTATÍSTICAS ===
function updateStats() {
  const hoje = new Date().toISOString().split('T')[0];
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const salas = JSON.parse(localStorage.getItem('salas') || '[]');
  const agora = new Date();
  const em2h = new Date(agora.getTime() + 2*60*60*1000);

  const hojeReservas = reservas.filter(r => r.data_reserva === hoje).length;
  const proximas = reservas.filter(r => {
    const dataHora = new Date(`${r.data_reserva}T${r.hora_inicio_reserva}`);
    return dataHora > agora && dataHora <= em2h;
  }).length;

  const salasReservadas = [...new Set(reservas.filter(r => r.data_reserva === hoje).map(r => r.id_sala))];
  const livres = salas.length - salasReservadas.length;

  document.getElementById('total-reservas').textContent = hojeReservas;
  document.getElementById('proximas-reservas').textContent = proximas;
  document.getElementById('salas-livres').textContent = livres;
}

// === MODAL SUCESSO + FECHAR ===
function showSuccessModal(msg, cb) {
  const modal = document.getElementById('success-modal');
  document.getElementById('success-message').textContent = msg;
  modal.classList.add('show');
  setTimeout(() => {
    modal.classList.remove('show');
    if (cb) cb();
  }, 1500);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = 'auto';
}

// === INICIAR ===
document.addEventListener('DOMContentLoaded', () => {
  loadSalas();
  loadReservas();
  updateStats();

  // Data mínima (hoje)
  const hoje = new Date().toISOString().split('T')[0];
  document.querySelector('input[name="data_reserva"]').min = hoje;
});