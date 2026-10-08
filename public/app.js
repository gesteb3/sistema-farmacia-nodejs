const state = {
  token: localStorage.getItem('farmacia_token'),
  user: null,
  view: 'dashboard',
};
const $ = (selector) => document.querySelector(selector);
const titles = {
  dashboard: 'Resumen',
  medications: 'Medicamentos',
  inventory: 'Inventario',
  suppliers: 'Proveedores',
  customers: 'Clientes',
  purchases: 'Compras',
  sales: 'Ventas',
};

const api = async (path, options = {}) => {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.message || 'No fue posible completar la operación.');
  return body.data;
};
const money = (value) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(
    Number(value),
  );
const date = (value) =>
  new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(
    new Date(value),
  );
const h = (value) =>
  String(value ?? '').replace(
    /[&<>"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character],
  );
const toast = (message) => {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  setTimeout(() => (el.hidden = true), 3000);
};

const showLogin = () => {
  $('#login-view').hidden = false;
  $('#app-view').hidden = true;
};
const showApp = () => {
  $('#login-view').hidden = true;
  $('#app-view').hidden = false;
  $('#user-name').textContent = state.user.name;
  $('#user-role').textContent =
    state.user.role === 'ADMIN' ? 'Administrador' : 'Cajero';
  $('#avatar').textContent = state.user.name[0].toUpperCase();
  document
    .querySelectorAll('[data-admin]')
    .forEach((el) => (el.hidden = state.user.role !== 'ADMIN'));
  loadView('dashboard');
};
const logout = () => {
  localStorage.removeItem('farmacia_token');
  state.token = null;
  state.user = null;
  showLogin();
};

const table = (headers, rows) =>
  `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.join('') : `<tr><td colspan="${headers.length}" class="empty">No hay registros disponibles.</td></tr>`}</tbody></table></div>`;
const renderDashboard = async () => {
  if (state.user.role !== 'ADMIN')
    return `<div class="card"><h3>Sesión de caja lista</h3><p class="muted">Use el menú para consultar medicamentos, clientes y registrar ventas.</p></div>`;
  const data = await api('/reports/dashboard');
  const s = data.summary;
  return `<div class="metrics">
    <article class="card metric"><small>Medicamentos activos</small><strong>${s.activeMedications}</strong></article>
    <article class="card metric"><small>Unidades en inventario</small><strong>${s.totalStock}</strong></article>
    <article class="card metric"><small>Ventas del mes</small><strong class="accent">${money(s.monthRevenue)}</strong></article>
    <article class="card metric"><small>Alertas activas</small><strong>${s.lowStockCount + s.expiringBatchCount}</strong></article>
  </div><div class="grid-2"><article class="card"><h3>Stock bajo</h3>${table(
    ['Código', 'Medicamento', 'Stock'],
    data.alerts.lowStock
      .slice(0, 8)
      .map(
        (x) =>
          `<tr><td>${h(x.code)}</td><td><strong>${h(x.name)}</strong></td><td><span class="badge ${x.stock === 0 ? 'danger' : 'warn'}">${x.stock}</span></td></tr>`,
      ),
  )}</article>
  <article class="card"><h3>Próximos a vencer</h3>${
    data.alerts.expiringBatches.length
      ? data.alerts.expiringBatches
          .slice(0, 6)
          .map(
            (x) =>
              `<p><strong>${h(x.medication.name)}</strong><br><span class="muted">${h(x.batchNumber)} · ${date(x.expirationDate)} · ${x.stock} uds.</span></p>`,
          )
          .join('')
      : '<p class="empty">Sin vencimientos próximos.</p>'
  }</article></div>`;
};
const listView = async (view) => {
  const config = {
    medications: {
      path: '/medications?limit=100',
      headers: [
        'Código',
        'Medicamento',
        'Principio activo',
        'Presentación',
        'Precio',
      ],
      row: (x) =>
        `<tr><td>${h(x.code)}</td><td><strong>${h(x.name)}</strong></td><td>${h(x.activeIngredient)}</td><td>${h(x.presentation)}</td><td>${money(x.salePrice)}</td></tr>`,
    },
    inventory: {
      path: '/inventory/batches?limit=100',
      headers: ['Medicamento', 'Lote', 'Vencimiento', 'Stock'],
      row: (x) =>
        `<tr><td><strong>${h(x.medication.name)}</strong><small>${h(x.medication.code)}</small></td><td>${h(x.batchNumber)}</td><td>${date(x.expirationDate)}</td><td><span class="badge ${x.stock <= 10 ? 'warn' : ''}">${x.stock}</span></td></tr>`,
    },
    suppliers: {
      path: '/suppliers?limit=100',
      headers: ['NIT', 'Proveedor', 'Contacto', 'Teléfono'],
      row: (x) =>
        `<tr><td>${h(x.nit)}</td><td><strong>${h(x.name)}</strong></td><td>${h(x.contactName ?? '—')}</td><td>${h(x.phone ?? '—')}</td></tr>`,
    },
    customers: {
      path: '/customers?limit=100',
      headers: ['NIT', 'Cliente', 'Teléfono', 'Correo'],
      row: (x) =>
        `<tr><td>${h(x.nit ?? 'CF')}</td><td><strong>${h(x.name)}</strong></td><td>${h(x.phone ?? '—')}</td><td>${h(x.email ?? '—')}</td></tr>`,
    },
    purchases: {
      path: '/purchases?limit=100',
      headers: ['Factura', 'Proveedor', 'Fecha', 'Total'],
      row: (x) =>
        `<tr><td><strong>${h(x.invoiceNumber)}</strong></td><td>${h(x.supplier.name)}</td><td>${date(x.purchaseDate)}</td><td>${money(x.total)}</td></tr>`,
    },
    sales: {
      path: '/sales?limit=100',
      headers: ['Factura', 'Cliente', 'Fecha', 'Total'],
      row: (x) =>
        `<tr><td><strong>${h(x.invoiceNumber)}</strong></td><td>${h(x.customer?.name ?? 'Consumidor final')}</td><td>${date(x.soldAt)}</td><td>${money(x.total)}</td></tr>`,
    },
  }[view];
  const result = await api(config.path);
  return `<div class="section-head"><h2>${titles[view]}</h2><a class="secondary docs-link" href="/api-docs/" target="_blank">Gestionar en Swagger ↗</a></div>${table(config.headers, result.map(config.row))}`;
};
const loadView = async (view) => {
  state.view = view;
  $('#page-title').textContent = titles[view];
  document
    .querySelectorAll('#navigation button')
    .forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  $('#page-content').innerHTML =
    '<div class="loading">Cargando información…</div>';
  try {
    $('#page-content').innerHTML =
      view === 'dashboard' ? await renderDashboard() : await listView(view);
  } catch (error) {
    if (error.message.includes('sesión') || error.message.includes('iniciar'))
      logout();
    else $('#page-content').innerHTML = `<p class="error">${error.message}</p>`;
  }
};

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('#login-error').hidden = true;
  try {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: $('#email').value,
        password: $('#password').value,
      }),
    });
    state.token = result.token;
    state.user = result.user;
    localStorage.setItem('farmacia_token', state.token);
    showApp();
  } catch (error) {
    $('#login-error').textContent = error.message;
    $('#login-error').hidden = false;
  }
});
$('#navigation').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-view]');
  if (button) loadView(button.dataset.view);
});
$('#refresh').addEventListener('click', () => {
  loadView(state.view);
  toast('Información actualizada');
});
$('#logout').addEventListener('click', logout);
$('#today').textContent = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'full',
}).format(new Date());

(async () => {
  if (!state.token) return showLogin();
  try {
    state.user = await api('/auth/me');
    showApp();
  } catch {
    logout();
  }
})();
