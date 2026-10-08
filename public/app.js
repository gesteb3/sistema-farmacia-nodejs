const state = {
  token: localStorage.getItem('farmacia_token'),
  user: null,
  view: 'dashboard',
  medications: [],
  suppliers: [],
  customers: [],
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
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const nullable = (value) => String(value ?? '').trim() || null;
const values = (form) => Object.fromEntries(new FormData(form).entries());
const today = () => new Date().toISOString().slice(0, 10);
const nextYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};
const toast = (message, error = false) => {
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('toast-error', error);
  el.hidden = false;
  setTimeout(() => (el.hidden = true), 3500);
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
  `<div class="table-wrap"><table><thead><tr>${headers.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.join('') : `<tr><td colspan="${headers.length}" class="empty">No hay registros disponibles.</td></tr>`}</tbody></table></div>`;
const field = (label, name, type = 'text', extra = '') =>
  `<label>${label}<input name="${name}" type="${type}" ${extra} /></label>`;
const select = (label, name, options, extra = '') =>
  `<label>${label}<select name="${name}" ${extra}>${options}</select></label>`;
const options = (items, label, empty = '') =>
  `${empty ? `<option value="">${empty}</option>` : ''}${items.map((x) => `<option value="${x.id}">${h(label(x))}</option>`).join('')}`;
const cardForm = (title, id, fields, button = 'Guardar') =>
  `<details class="card form-card"><summary>${title}</summary><form id="${id}"><div class="form-grid">${fields}</div><div class="form-actions"><button class="primary compact" type="submit">${button}</button></div></form></details>`;

const renderDashboard = async () => {
  if (state.user.role !== 'ADMIN')
    return '<div class="card"><h3>Sesión de caja lista</h3><p class="muted">Use el menú para consultar medicamentos, clientes y registrar ventas.</p></div>';
  const data = await api('/reports/dashboard');
  const s = data.summary;
  return `<div class="metrics"><article class="card metric"><small>Medicamentos activos</small><strong>${s.activeMedications}</strong></article><article class="card metric"><small>Unidades en inventario</small><strong>${s.totalStock}</strong></article><article class="card metric"><small>Ventas del mes</small><strong class="accent">${money(s.monthRevenue)}</strong></article><article class="card metric"><small>Alertas activas</small><strong>${s.lowStockCount + s.expiringBatchCount}</strong></article></div><div class="grid-2"><article class="card"><h3>Stock bajo</h3>${table(
    ['Código', 'Medicamento', 'Stock'],
    data.alerts.lowStock
      .slice(0, 8)
      .map(
        (x) =>
          `<tr><td>${h(x.code)}</td><td><strong>${h(x.name)}</strong></td><td><span class="badge ${x.stock === 0 ? 'danger' : 'warn'}">${x.stock}</span></td></tr>`,
      ),
  )}</article><article class="card"><h3>Próximos a vencer</h3>${
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

const medicationForm = () =>
  cardForm(
    '＋ Registrar medicamento',
    'medication-form',
    field('Código', 'code', 'text', 'required maxlength="30"') +
      field('Nombre', 'name', 'text', 'required') +
      field('Principio activo', 'activeIngredient', 'text', 'required') +
      field('Presentación', 'presentation', 'text', 'required') +
      field('Concentración', 'concentration') +
      field(
        'Precio de compra',
        'purchasePrice',
        'number',
        'required min="0.01" step="0.01"',
      ) +
      field(
        'Precio de venta',
        'salePrice',
        'number',
        'required min="0.01" step="0.01"',
      ) +
      '<label class="check"><input name="requiresPrescription" type="checkbox" /> Requiere receta</label>',
  );
const supplierForm = () =>
  cardForm(
    '＋ Registrar proveedor',
    'supplier-form',
    field('NIT', 'nit', 'text', 'required') +
      field('Nombre', 'name', 'text', 'required') +
      field('Persona de contacto', 'contactName') +
      field('Teléfono', 'phone', 'tel') +
      field('Correo', 'email', 'email') +
      field('Dirección', 'address'),
  );
const customerForm = () =>
  cardForm(
    '＋ Registrar cliente',
    'customer-form',
    field('NIT (opcional)', 'nit') +
      field('Nombre', 'name', 'text', 'required') +
      field('Teléfono', 'phone', 'tel') +
      field('Correo', 'email', 'email') +
      field('Dirección', 'address'),
  );
const purchaseItem = () =>
  `<div class="line-item">${select(
    'Medicamento',
    'medicationId',
    options(state.medications, (x) => `${x.code} — ${x.name}`),
    'required',
  )}${field('Lote', 'batchNumber', 'text', 'required')}${field('Vencimiento', 'expirationDate', 'date', `required min="${today()}" value="${nextYear()}"`)}${field('Cantidad', 'quantity', 'number', 'required min="1" value="1"')}${field('Costo unitario', 'unitCost', 'number', 'required min="0.01" step="0.01"')}<button type="button" class="remove-line">×</button></div>`;
const saleItem = () =>
  `<div class="line-item sale-line">${select(
    'Medicamento',
    'medicationId',
    options(state.medications, (x) => `${x.code} — ${x.name}`),
    'required',
  )}${field('Cantidad', 'quantity', 'number', 'required min="1" value="1"')}<button type="button" class="remove-line">×</button></div>`;
const purchaseForm = () =>
  cardForm(
    '＋ Registrar compra y aumentar inventario',
    'purchase-form',
    select(
      'Proveedor',
      'supplierId',
      options(state.suppliers, (x) => `${x.nit} — ${x.name}`),
      'required',
    ) +
      field('Número de factura', 'invoiceNumber', 'text', 'required') +
      field(
        'Fecha de compra',
        'purchaseDate',
        'date',
        `required value="${today()}"`,
      ) +
      `<div class="full"><h4>Medicamentos comprados</h4><div id="purchase-items">${purchaseItem()}</div><button type="button" class="secondary add-line" data-kind="purchase">＋ Agregar medicamento</button></div>`,
    'Registrar compra',
  );
const saleForm = () =>
  cardForm(
    '＋ Registrar venta',
    'sale-form',
    select(
      'Cliente',
      'customerId',
      options(
        state.customers,
        (x) => `${x.nit || 'CF'} — ${x.name}`,
        'Consumidor final',
      ),
    ) +
      field('Número de factura', 'invoiceNumber', 'text', 'required') +
      `<div class="full"><h4>Medicamentos vendidos</h4><div id="sale-items">${saleItem()}</div><button type="button" class="secondary add-line" data-kind="sale">＋ Agregar medicamento</button></div>`,
    'Completar venta',
  );
const loadCatalogs = async (...names) =>
  Promise.all(
    names.map(async (name) => {
      state[name] = await api(`/${name}?limit=100`);
    }),
  );

const listView = async (view) => {
  if (view === 'purchases') await loadCatalogs('medications', 'suppliers');
  if (view === 'sales') await loadCatalogs('medications', 'customers');
  const config = {
    medications: {
      path: '/medications?limit=100',
      form: medicationForm,
      headers: [
        'Código',
        'Medicamento',
        'Principio activo',
        'Presentación',
        'Precio',
        'Acciones',
      ],
      row: (x) =>
        `<tr><td>${h(x.code)}</td><td><strong>${h(x.name)}</strong></td><td>${h(x.activeIngredient)}</td><td>${h(x.presentation)}</td><td>${money(x.salePrice)}</td><td><button class="table-action" data-edit="medications" data-id="${x.id}">Editar</button><button class="table-action danger" data-delete="medications" data-id="${x.id}">Desactivar</button></td></tr>`,
    },
    inventory: {
      path: '/inventory/batches?limit=100',
      form: null,
      headers: ['Medicamento', 'Lote', 'Vencimiento', 'Stock'],
      row: (x) =>
        `<tr><td><strong>${h(x.medication.name)}</strong><small>${h(x.medication.code)}</small></td><td>${h(x.batchNumber)}</td><td>${date(x.expirationDate)}</td><td><span class="badge ${x.stock <= 10 ? 'warn' : ''}">${x.stock}</span></td></tr>`,
    },
    suppliers: {
      path: '/suppliers?limit=100',
      form: supplierForm,
      headers: ['NIT', 'Proveedor', 'Contacto', 'Teléfono', 'Acciones'],
      row: (x) =>
        `<tr><td>${h(x.nit)}</td><td><strong>${h(x.name)}</strong></td><td>${h(x.contactName ?? '—')}</td><td>${h(x.phone ?? '—')}</td><td><button class="table-action" data-edit="suppliers" data-id="${x.id}">Editar</button><button class="table-action danger" data-delete="suppliers" data-id="${x.id}">Desactivar</button></td></tr>`,
    },
    customers: {
      path: '/customers?limit=100',
      form: customerForm,
      headers: ['NIT', 'Cliente', 'Teléfono', 'Correo', 'Acciones'],
      row: (x) =>
        `<tr><td>${h(x.nit ?? 'CF')}</td><td><strong>${h(x.name)}</strong></td><td>${h(x.phone ?? '—')}</td><td>${h(x.email ?? '—')}</td><td><button class="table-action" data-edit="customers" data-id="${x.id}">Editar</button><button class="table-action danger" data-delete="customers" data-id="${x.id}">Desactivar</button></td></tr>`,
    },
    purchases: {
      path: '/purchases?limit=100',
      form: purchaseForm,
      headers: ['Factura', 'Proveedor', 'Fecha', 'Total'],
      row: (x) =>
        `<tr><td><strong>${h(x.invoiceNumber)}</strong></td><td>${h(x.supplier.name)}</td><td>${date(x.purchaseDate)}</td><td>${money(x.total)}</td></tr>`,
    },
    sales: {
      path: '/sales?limit=100',
      form: saleForm,
      headers: ['Factura', 'Cliente', 'Fecha', 'Total'],
      row: (x) =>
        `<tr><td><strong>${h(x.invoiceNumber)}</strong></td><td>${h(x.customer?.name ?? 'Consumidor final')}</td><td>${date(x.soldAt)}</td><td>${money(x.total)}</td></tr>`,
    },
  }[view];
  const result = await api(config.path);
  if (['medications', 'suppliers', 'customers'].includes(view))
    state[view] = result;
  const manage =
    config.form &&
    (state.user.role === 'ADMIN' || ['customers', 'sales'].includes(view));
  return `${manage ? config.form() : ''}<div class="section-head"><h2>Registros</h2><span class="muted">${result.length} encontrados</span></div>${table(config.headers, result.map(config.row))}`;
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
    else
      $('#page-content').innerHTML = `<p class="error">${h(error.message)}</p>`;
  }
};

const saveMaster = async (form, endpoint, transform) => {
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const id = form.dataset.editId;
    await api(`/${endpoint}${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(transform(values(form))),
    });
    toast(
      id
        ? 'Cambios guardados correctamente.'
        : 'Registro guardado correctamente.',
    );
    await loadView(state.view);
  } catch (error) {
    toast(error.message, true);
    button.disabled = false;
  }
};
const collectLines = (container, fields) =>
  [...container.querySelectorAll('.line-item')].map((line) => {
    return Object.fromEntries(
      fields.map((name) => [
        name,
        ['quantity', 'unitCost'].includes(name)
          ? Number(line.querySelector(`[name="${name}"]`).value)
          : line.querySelector(`[name="${name}"]`).value,
      ]),
    );
  });

$('#page-content').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'medication-form')
    return saveMaster(form, 'medications', (d) => ({
      ...d,
      concentration: nullable(d.concentration),
      purchasePrice: Number(d.purchasePrice),
      salePrice: Number(d.salePrice),
      requiresPrescription: Boolean(d.requiresPrescription),
    }));
  if (form.id === 'supplier-form')
    return saveMaster(form, 'suppliers', (d) => ({
      ...d,
      contactName: nullable(d.contactName),
      phone: nullable(d.phone),
      email: nullable(d.email),
      address: nullable(d.address),
    }));
  if (form.id === 'customer-form')
    return saveMaster(form, 'customers', (d) => ({
      ...d,
      nit: nullable(d.nit),
      phone: nullable(d.phone),
      email: nullable(d.email),
      address: nullable(d.address),
    }));
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const data = values(form);
    if (form.id === 'purchase-form') {
      await api('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplierId: data.supplierId,
          invoiceNumber: data.invoiceNumber,
          purchaseDate: data.purchaseDate,
          items: collectLines($('#purchase-items'), [
            'medicationId',
            'batchNumber',
            'expirationDate',
            'quantity',
            'unitCost',
          ]),
        }),
      });
      toast('Compra registrada; el inventario fue actualizado.');
    }
    if (form.id === 'sale-form') {
      await api('/sales', {
        method: 'POST',
        body: JSON.stringify({
          customerId: nullable(data.customerId),
          invoiceNumber: data.invoiceNumber,
          items: collectLines($('#sale-items'), ['medicationId', 'quantity']),
        }),
      });
      toast('Venta completada y existencias descontadas.');
    }
    await loadView(state.view);
  } catch (error) {
    toast(error.message, true);
    button.disabled = false;
  }
});

$('#page-content').addEventListener('click', async (event) => {
  const add = event.target.closest('.add-line');
  if (add) {
    const kind = add.dataset.kind;
    $(`#${kind}-items`).insertAdjacentHTML(
      'beforeend',
      kind === 'purchase' ? purchaseItem() : saleItem(),
    );
    return;
  }
  const remove = event.target.closest('.remove-line');
  if (remove) {
    const container = remove.closest('[id$="-items"]');
    if (container.children.length > 1) remove.closest('.line-item').remove();
    else toast('Debe dejar al menos un medicamento.', true);
    return;
  }
  const edit = event.target.closest('[data-edit]');
  if (edit) {
    try {
      const resource = edit.dataset.edit;
      const record = await api(`/${resource}/${edit.dataset.id}`);
      const form = $(`#${resource.slice(0, -1)}-form`);
      form.closest('details').open = true;
      Object.entries(record).forEach(([name, value]) => {
        const input = form.elements.namedItem(name);
        if (input)
          input.type === 'checkbox'
            ? (input.checked = Boolean(value))
            : (input.value = value ?? '');
      });
      form.dataset.editId = record.id;
      form.querySelector('[type="submit"]').textContent = 'Guardar cambios';
      form.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      toast(error.message, true);
    }
    return;
  }
  const removeRecord = event.target.closest('[data-delete]');
  if (removeRecord && confirm('¿Desea desactivar este registro?')) {
    try {
      await api(`/${removeRecord.dataset.delete}/${removeRecord.dataset.id}`, {
        method: 'DELETE',
      });
      toast('Registro desactivado.');
      await loadView(state.view);
    } catch (error) {
      toast(error.message, true);
    }
  }
});

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
