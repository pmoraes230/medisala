let fontSizeLevel = 0;
const fontSizes = ['Padrão', 'Grande', 'Maior'];

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('accessibility-toggle');
  const menu = document.getElementById('accessibility-menu');
  const darkCheck = document.getElementById('dark-check');
  const fontLevel = document.getElementById('font-level');

  // ABRIR MENU
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('show');
  });
  document.addEventListener('click', () => menu.classList.remove('show'));
  menu.addEventListener('click', e => e.stopPropagation());

  // CARREGAR CONFIGURAÇÕES
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkCheck.textContent = 'On';
  }
  fontSizeLevel = parseInt(localStorage.getItem('fontSize') || '0');
  if (fontSizeLevel > 0) {
    document.body.classList.add(fontSizeLevel === 1 ? 'font-large' : 'font-larger');
    fontLevel.textContent = fontSizes[fontSizeLevel];
  }
});

// FUNÇÕES GLOBAIS
window.toggleDarkMode = () => {
  const isDark = document.body.classList.toggle('dark-mode');
  document.getElementById('dark-check').textContent = isDark ? 'On' : 'Off';
  localStorage.setItem('darkMode', isDark);
};

window.increaseFont = () => {
  fontSizeLevel = (fontSizeLevel + 1) % 3;
  document.body.classList.remove('font-large', 'font-larger');
  if (fontSizeLevel === 1) document.body.classList.add('font-large');
  if (fontSizeLevel === 2) document.body.classList.add('font-larger');
  document.getElementById('font-level').textContent = fontSizes[fontSizeLevel];
  localStorage.setItem('fontSize', fontSizeLevel);
};

window.resetAccessibility = () => {
  document.body.classList.remove('dark-mode', 'font-large', 'font-larger');
  fontSizeLevel = 0;
  document.getElementById('dark-check').textContent = 'Off';
  document.getElementById('font-level').textContent = 'Padrão';
  localStorage.removeItem('darkMode');
  localStorage.removeItem('fontSize');
};