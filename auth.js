'use strict';

function switchTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.auth-panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('tab-' + tabName).classList.add('active');
  document.getElementById('panel-' + tabName).classList.add('active');
  document.querySelectorAll('.form-alert').forEach(function(a) { a.className = 'form-alert'; a.textContent = ''; });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAlert(id, msg, type) {
  var el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'form-alert ' + type;
}

function getUsers() {
  return JSON.parse(localStorage.getItem('ifx_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('ifx_users', JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem('ifx_session', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
}

window.logout = function() {
  localStorage.removeItem('ifx_session');
  window.location.href = 'login.html';
};

document.getElementById('tab-login').addEventListener('click', function() { switchTab('login'); });
document.getElementById('tab-register').addEventListener('click', function() { switchTab('register'); });

document.getElementById('form-register').addEventListener('submit', function(e) {
  e.preventDefault();
  var name  = document.getElementById('reg-name').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var pass  = document.getElementById('reg-password').value;
  var pass2 = document.getElementById('reg-password2').value;
  if (!name)                 return showAlert('alert-register', 'Preencha seu nome.', 'error');
  if (!validateEmail(email)) return showAlert('alert-register', 'E-mail inválido.', 'error');
  if (pass.length < 6)       return showAlert('alert-register', 'Senha mínimo 6 caracteres.', 'error');
  if (pass !== pass2)        return showAlert('alert-register', 'As senhas não coincidem.', 'error');
  var users = getUsers();
  if (users.find(function(u) { return u.email === email; })) return showAlert('alert-register', 'E-mail já cadastrado.', 'error');
  var newUser = { id: Date.now(), name: name, email: email, password: btoa(pass) };
  users.push(newUser);
  saveUsers(users);
  setSession(newUser);
  showAlert('alert-register', '✓ Conta criada! Redirecionando...', 'success');
  setTimeout(function() { window.location.href = 'index.html'; }, 1400);
});

document.getElementById('form-login').addEventListener('submit', function(e) {
  e.preventDefault();
  var email = document.getElementById('login-email').value.trim();
  var pass  = document.getElementById('login-password').value;
  if (!validateEmail(email)) return showAlert('alert-login', 'E-mail inválido.', 'error');
  if (!pass)                 return showAlert('alert-login', 'Digite sua senha.', 'error');
  var users = getUsers();
  var user  = users.find(function(u) { return u.email === email && u.password === btoa(pass); });
  if (!user) return showAlert('alert-login', 'E-mail ou senha incorretos.', 'error');
  setSession(user);
  showAlert('alert-login', '✓ Bem-vindo, ' + user.name + '!', 'success');
  setTimeout(function() { window.location.href = 'index.html'; }, 1200);
});

var tabParam = new URLSearchParams(location.search).get('tab');
if (tabParam === 'register') switchTab('register');

var session = JSON.parse(localStorage.getItem('ifx_session') || 'null');
if (session) window.location.href = 'index.html';
