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
function openAddInsumoModal() {
  document.getElementById('add-insumo-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
  document.getElementById('insumo-form').reset();
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

// === SALVAR INSUMO ===
function saveInsumo() {
  const form = document.getElementById('insumo-form');
  const data = Object.fromEntries(new FormData(form));

  if (!data.nome_insumo || !data.unidade_medida_insumo || !data.quantidade_estoq_insumo || !data.validade_insumo) {
    showSuccessModal('Preencha todos os campos obrigatórios!', null);
    return;
  }

  const insumo = {
    id_insumos: Date.now(),
    ...data,
    quantidade_estoq_insumo: parseFloat(data.quantidade_estoq_insumo).toFixed(3)
  };

  let insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  insumos.push(insumo);
  localStorage.setItem('insumos', JSON.stringify(insumos));

  closeModal('add-insumo-modal');
  showSuccessModal('Insumo cadastrado com sucesso!', loadInsumos);
}

// === CARREGAR TABELA ===
function loadInsumos() {
  const tbody = document.getElementById('insumos-tbody');
  const insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  const search = document.getElementById('search-insumo').value.toLowerCase();
  const unidade = document.getElementById('filter-unidade').value;

  tbody.innerHTML = '';

  const filtered = insumos.filter(i => {
    const matchSearch = i.nome_insumo.toLowerCase().includes(search) || 
                       (i.especificacao_tec_insumo && i.especificacao_tec_insumo.toLowerCase().includes(search));
    const matchUnidade = !unidade || i.unidade_medida_insumo === unidade;
    return matchSearch && matchUnidade;
  });

  filtered.forEach(insumo => {
    const hoje = new Date();
    const validade = new Date(insumo.validade_insumo);
    const vencido = validade < hoje;
    const estoque = parseFloat(insumo.quantidade_estoq_insumo);
    const baixo = estoque < 5;

    const statusClass = vencido ? 'status-vencido' : (baixo ? 'status-baixo' : 'status-active');
    const statusText = vencido ? 'Vencido' : (baixo ? 'Baixo' : 'Normal');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${insumo.nome_insumo}</strong></td>
      <td><small>${insumo.especificacao_tec_insumo || '-'}</small></td>
      <td><span class="badge badge-${insumo.unidade_medida_insumo.toLowerCase()}">${insumo.unidade_medida_insumo}</span></td>
      <td><strong>${estoque}</strong></td>
      <td class="${vencido ? 'text-danger' : ''}">${validade.toLocaleDateString('pt-BR')}</td>
      <td><span class="${statusClass}">${statusText}</span></td>
      <td class="actions">
        <button class="action-btn" onclick="openInsumoMenu(${insumo.id_insumos}, this)">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        <div class="action-menu" id="menu-${insumo.id_insumos}">
          <button onclick="editInsumo(${insumo.id_insumos})"><i class="fas fa-edit"></i> Editar</button>
          <button onclick="deleteInsumo(${insumo.id_insumos})" class="delete"><i class="fas fa-trash-alt"></i> Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateStats();
}

// === ESTATÍSTICAS ===
function updateStats() {
  const insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
  const total = insumos.length;
  const totalEstoque = insumos.reduce((s, i) => s + parseFloat(i.quantidade_estoq_insumo), 0).toFixed(3);
  const vencidos = insumos.filter(i => new Date(i.validade_insumo) < new Date()).length;
  const baixos = insumos.filter(i => parseFloat(i.quantidade_estoq_insumo) < 5).length;

  document.getElementById('total-insumos').textContent = total;
  document.getElementById('total-estoque').textContent = `${totalEstoque} itens`;
  document.getElementById('vencidos').textContent = vencidos;
  document.getElementById('baixa-estoque').textContent = baixos;
}

// === MENU AÇÕES ===
function openInsumoMenu(id, btn) {
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

// === EXCLUIR ===
function deleteInsumo(id) {
  if (confirm('Tem certeza que deseja excluir este insumo?')) {
    let insumos = JSON.parse(localStorage.getItem('insumos') || '[]');
    insumos = insumos.filter(i => i.id_insumos != id);
    localStorage.setItem('insumos', JSON.stringify(insumos));
    loadInsumos();
    showSuccessModal('Insumo excluído!', updateStats);
  }
}

// === EDITAR (placeholder) ===
function editInsumo(id) {
  alert(`Editar insumo ID: ${id} (em desenvolvimento)`);
}

// === BUSCA E FILTRO ===
document.getElementById('search-insumo').addEventListener('input', loadInsumos);
document.getElementById('filter-unidade').addEventListener('change', loadInsumos);

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
  loadInsumos();
  updateStats();
});