// ============= VARIABLES GLOBALES =============
let trabajadores = JSON.parse(localStorage.getItem('champa_trabajadores')) || [];
let usuarioActual = JSON.parse(localStorage.getItem('champa_usuario')) || null;
let usuarioAutenticado = JSON.parse(localStorage.getItem('champa_autenticado')) || null;

// ============= INICIALIZACIÓN =============
document.addEventListener('DOMContentLoaded', () => {
  limpiarDestacados();
  renderizarTrabajadores();
  checkUsuario();
  actualizarVista();
});

// ============= AUTENTICACIÓN =============
function loginTrabajador() {
  const telefono = document.getElementById('login-telefono').value.trim();
  const pin = document.getElementById('login-pin').value.trim();

  if (!telefono || !pin || pin.length !== 4) {
    mostrarAlerta('Ingresa teléfono y PIN de 4 dígitos', 'error');
    return;
  }

  if (!/^\d{10}$/.test(telefono.replace(/\D/g, ''))) {
    mostrarAlerta('Teléfono inválido', 'error');
    return;
  }

  // Buscar o crear trabajador
  let trabajador = trabajadores.find(t => t.telefono === telefono);
  
  if (!trabajador) {
    // Crear nuevo perfil con PIN
    trabajador = {
      id: 'trab_' + Date.now(),
      nombre: '',
      telefono: telefono,
      pin: pin,
      oficio: 'Electricista',
      zona: 'Asunción',
      descripcion: '',
      trabajos: [],
      reseñas: [],
      rating_promedio: 0,
      total_trabajos: 0,
      verificado: false,
      destacado: false,
      destacado_hasta: null,
      fecha: new Date().toISOString()
    };
    trabajadores.push(trabajador);
  } else if (trabajador.pin !== pin) {
    mostrarAlerta('PIN incorrecto', 'error');
    return;
  }

  usuarioAutenticado = { telefono, pin };
  usuarioActual = trabajador;
  guardarDatos();
  actualizarVista();
  mostrarAlerta('Acceso concedido', 'success');
}

function logout() {
  usuarioAutenticado = null;
  usuarioActual = null;
  localStorage.removeItem('champa_autenticado');
  localStorage.removeItem('champa_usuario');
  document.getElementById('login-telefono').value = '';
  document.getElementById('login-pin').value = '';
  actualizarVista();
  cambiarTab('buscar', { target: document.querySelectorAll('.tab-btn')[0] });
}

// ============= GESTIÓN DE PERFIL =============
function registrarTrabajador() {
  const nombre = document.getElementById('nombre').value.trim();
  const oficio = document.getElementById('oficio').value;
  const zona = document.getElementById('zona').value;
  const descripcion = document.getElementById('descripcion').value.trim();

  if (!nombre) {
    mostrarAlerta('Completa tu nombre', 'error');
    return;
  }

  usuarioActual.nombre = nombre;
  usuarioActual.oficio = oficio;
  usuarioActual.zona = zona;
  usuarioActual.descripcion = descripcion;

  let idx = trabajadores.findIndex(t => t.id === usuarioActual.id);
  if (idx !== -1) {
    trabajadores[idx] = usuarioActual;
  }

  guardarDatos();
  checkUsuario();
  mostrarAlerta('Perfil actualizado ✓', 'success');
}

function actualizarPerfilUI() {
  if (!usuarioActual) return;
  
  document.getElementById('usuario-nombre').textContent = usuarioActual.nombre || 'Sin nombre';
  document.getElementById('usuario-telefono').textContent = usuarioActual.telefono;
  document.getElementById('nombre').value = usuarioActual.nombre || '';
  document.getElementById('telefono').value = usuarioActual.telefono;
  document.getElementById('oficio').value = usuarioActual.oficio;
  document.getElementById('zona').value = usuarioActual.zona;
  document.getElementById('descripcion').value = usuarioActual.descripcion;
  
  document.getElementById('stat-trabajos').textContent = usuarioActual.trabajos.length;
  document.getElementById('stat-rating').textContent = usuarioActual.rating_promedio.toFixed(1);
}

// ============= GESTIÓN DE TRABAJOS =============
function subirTrabajo() {
  const archivos = document.getElementById('archivo').files;
  if (archivos.length === 0) {
    mostrarAlerta('Selecciona una foto o video', 'error');
    return;
  }

  let procesados = 0;
  for (let archivo of archivos) {
    if (archivo.size > 5 * 1024 * 1024) {
      mostrarAlerta('Archivo muy grande (máx 5MB)', 'error');
      continue;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      usuarioActual.trabajos.push({
        id: 'trabajo_' + Date.now() + Math.random(),
        url: e.target.result,
        tipo: archivo.type.startsWith('video') ? 'video' : 'imagen',
        fecha: new Date().toISOString()
      });

      procesados++;
      if (procesados === archivos.length) {
        let idx = trabajadores.findIndex(t => t.id === usuarioActual.id);
        trabajadores[idx] = usuarioActual;
        guardarDatos();
        renderizarMisTrabajos();
        document.getElementById('archivo').value = '';
        mostrarAlerta('Fotos/videos subidos ✓', 'success');
      }
    };
    reader.readAsDataURL(archivo);
  }
}

function eliminarTrabajo(trabajoId) {
  if (!confirm('¿Eliminar este trabajo?')) return;
  
  usuarioActual.trabajos = usuarioActual.trabajos.filter(t => t.id !== trabajoId);
  let idx = trabajadores.findIndex(t => t.id === usuarioActual.id);
  trabajadores[idx] = usuarioActual;
  guardarDatos();
  renderizarMisTrabajos();
  mostrarAlerta('Trabajo eliminado', 'success');
}

function renderizarMisTrabajos() {
  if (!usuarioActual.trabajos.length) {
    document.getElementById('mis-trabajos').innerHTML = '<div class="empty-state"><p>No has subido trabajos aún</p></div>';
    return;
  }

  document.getElementById('mis-trabajos').innerHTML = `
    <h4>Tus trabajos subidos (${usuarioActual.trabajos.length}):</h4>
    <div class="grid">
      ${usuarioActual.trabajos.map(trab => `
        <div style="position: relative;">
          ${trab.tipo === 'video' 
            ? `<video src="${trab.url}" controls style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"></video>` 
            : `<img src="${trab.url}" style="cursor: pointer; width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" onclick="abrirModal('${trab.url}')">`
          }
          <button class="btn btn-danger btn-small" style="position: absolute; bottom: 5px; right: 5px; width: auto;" onclick="eliminarTrabajo('${trab.id}')">✕</button>
        </div>
      `).join('')}
    </div>
  `;
}

// ============= BÚSQUEDA Y VISUALIZACIÓN =============
function renderizarTrabajadores() {
  const filtroOficio = document.getElementById('buscar-oficio').value.toLowerCase();
  const filtroZona = document.getElementById('filtro-zona').value;

  let filtrados = trabajadores
    .filter(t => t.nombre && t.oficio.toLowerCase().includes(filtroOficio) && (filtroZona === '' || t.zona === filtroZona))
    .sort((a, b) => {
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
      return b.rating_promedio - a.rating_promedio;
    });

  if (filtrados.length === 0) {
    document.getElementById('lista-trabajadores').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No encontramos trabajadores</p></div>';
    return;
  }

  document.getElementById('lista-trabajadores').innerHTML = filtrados.map(t => `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 style="margin: 0;">${t.nombre}</h3>
          ${t.verificado ? '<span class="badge badge-verified">✓ Verificado</span>' : ''}
          ${t.destacado ? '<span class="badge badge-featured">★ Destacado</span>' : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px;">⭐ ${t.rating_promedio.toFixed(1)}</div>
          <small style="color: #64748b;">${t.reseñas.length} reseñas</small>
        </div>
      </div>

      <p style="color: #64748b; margin: 5px 0;"><strong>${t.oficio}</strong> · ${t.zona}</p>
      <p style="margin: 10px 0;">${t.descripcion}</p>

      <div class="grid">
        ${t.trabajos.slice(0, 4).map(trab => 
          trab.tipo === 'video'
            ? `<video src="${trab.url}" controls style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"></video>`
            : `<img src="${trab.url}" style="cursor: pointer; width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" onclick="abrirModal('${trab.url}')">`
        ).join('')}
      </div>

      ${t.reseñas.length > 0 ? `
      <div style="margin: 10px 0;">
        <h4 style="margin-bottom: 8px;">Reseñas recientes:</h4>
        ${t.reseñas.slice(-2).reverse().map(r => `
          <div class="review-item">
            <strong>⭐ ${r.estrellas}/5</strong> - <strong>${r.cliente}</strong>
            <p style="margin: 5px 0; font-size: 14px;">${r.comentario}</p>
            <small style="color: #64748b;">${new Date(r.fecha).toLocaleDateString()}</small>
          </div>
        `).join('')}
      </div>` : ''}

      <a href="https://wa.me/595${t.telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(t.nombre)}%20contacto%20para%20solicitar%20tu%20servicio" class="btn" style="text-decoration: none; display: block; text-align: center; margin-top: 10px;">💬 Contactar por WhatsApp</a>

      <details>
        <summary>⭐ Dejar reseña</summary>
        <select id="estrellas-${t.id}">
          <option value="5">⭐⭐⭐⭐⭐ 5 estrellas</option>
          <option value="4">⭐⭐⭐⭐ 4 estrellas</option>
          <option value="3">⭐⭐⭐ 3 estrellas</option>
          <option value="2">⭐⭐ 2 estrellas</option>
          <option value="1">⭐ 1 estrella</option>
        </select>
        <input id="comentario-${t.id}" placeholder="Cuenta tu experiencia...">
        <input id="cliente-${t.id}" placeholder="Tu nombre (opcional)">
        <button class="btn" onclick="dejarReseña('${t.id}')">Enviar reseña</button>
      </details>
    </div>
  `).join('');
}

function dejarReseña(trabajadorId) {
  const estrellas = parseInt(document.getElementById(`estrellas-${trabajadorId}`).value);
  const comentario = document.getElementById(`comentario-${trabajadorId}`).value.trim();
  const cliente = document.getElementById(`cliente-${trabajadorId}`).value.trim() || 'Cliente anónimo';

  if (!comentario) {
    mostrarAlerta('Escribe tu experiencia', 'error');
    return;
  }

  let t = trabajadores.find(x => x.id === trabajadorId);
  t.reseñas.push({
    id: 'review_' + Date.now(),
    cliente: cliente,
    estrellas: estrellas,
    comentario: comentario,
    fecha: new Date().toISOString()
  });

  t.rating_promedio = t.reseñas.reduce((sum, r) => sum + r.estrellas, 0) / t.reseñas.length;
  t.total_trabajos++;

  guardarDatos();
  renderizarTrabajadores();
  mostrarAlerta('Reseña enviada ✓', 'success');
}

function eliminarReseña(trabajadorId, reseñaId) {
  if (!confirm('¿Eliminar esta reseña?')) return;
  
  let t = trabajadores.find(x => x.id === trabajadorId);
  t.reseñas = t.reseñas.filter(r => r.id !== reseñaId);
  
  if (t.reseñas.length > 0) {
    t.rating_promedio = t.reseñas.reduce((sum, r) => sum + r.estrellas, 0) / t.reseñas.length;
  } else {
    t.rating_promedio = 0;
  }

  guardarDatos();
  renderizarTrabajadores();
  mostrarAlerta('Reseña eliminada', 'success');
}

// ============= PANEL ADMIN =============
function renderizarAdmin() {
  const pinAdmin = prompt('Ingresa el PIN del admin:');
  if (pinAdmin !== '1234') {
    mostrarAlerta('PIN incorrecto', 'error');
    cambiarTab('buscar', { target: document.querySelectorAll('.tab-btn')[0] });
    return;
  }

  document.getElementById('lista-admin').innerHTML = trabajadores
    .filter(t => t.nombre)
    .map(t => `
    <div class="card">
      <h4>${t.nombre} - ${t.oficio}</h4>
      <p>Tel: <strong>${t.telefono}</strong></p>
      <p>⭐ Rating: ${t.rating_promedio.toFixed(1)} | Reseñas: ${t.reseñas.length}</p>
      <p>Trabajos: ${t.trabajos.length}</p>
      <p>Verificado: ${t.verificado ? '✓ Sí' : '✗ No'} | Destacado: ${t.destacado ? '✓ Sí hasta ' + new Date(t.destacado_hasta).toLocaleDateString() : '✗ No'}</p>
      
      <div style="display: flex; gap: 5px; flex-wrap: wrap;">
        <button class="btn btn-small" onclick="verificar('${t.id}')">✓ Verificar</button>
        <button class="btn btn-destacado btn-small" onclick="activarDestacado('${t.id}')">★ Destacado 30d</button>
      </div>
    </div>
  `).join('');
}

function verificar(id) {
  let t = trabajadores.find(x => x.id === id);
  t.verificado = true;
  guardarDatos();
  renderizarAdmin();
  mostrarAlerta('Verificado ✓', 'success');
}

function activarDestacado(id) {
  let t = trabajadores.find(x => x.id === id);
  let fecha = new Date();
  fecha.setDate(fecha.getDate() + 30);
  t.destacado = true;
  t.destacado_hasta = fecha.toISOString();
  guardarDatos();
  renderizarTrabajadores();
  renderizarAdmin();
  mostrarAlerta('¡Destacado activado por 30 días!', 'success');
}

// ============= UTILIDADES =============
function checkUsuario() {
  if (usuarioActual && usuarioActual.nombre) {
    document.getElementById('registro-form').classList.add('hidden');
    document.getElementById('perfil-creado').classList.remove('hidden');
    actualizarPerfilUI();
    renderizarMisTrabajos();
  } else if (usuarioActual) {
    document.getElementById('registro-form').classList.remove('hidden');
    document.getElementById('perfil-creado').classList.add('hidden');
    actualizarPerfilUI();
  }
}

function cambiarTab(tab, e) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (e && e.target) e.target.classList.add('active');

  document.getElementById('pantalla-buscar').classList.toggle('hidden', tab !== 'buscar');
  document.getElementById('pantalla-perfil').classList.toggle('hidden', tab !== 'perfil');
  document.getElementById('pantalla-login').classList.toggle('hidden', usuarioAutenticado !== null);
  document.getElementById('pantalla-admin').classList.toggle('hidden', tab !== 'admin');

  if (tab === 'perfil' && !usuarioAutenticado) {
    document.getElementById('pantalla-login').classList.remove('hidden');
  }

  if (tab === 'admin') {
    renderizarAdmin();
  }
}

function limpiarDestacados() {
  const ahora = new Date().toISOString();
  trabajadores.forEach(t => {
    if (t.destacado && t.destacado_hasta < ahora) {
      t.destacado = false;
    }
  });
  guardarDatos();
}

function guardarDatos() {
  localStorage.setItem('champa_trabajadores', JSON.stringify(trabajadores));
  if (usuarioActual) localStorage.setItem('champa_usuario', JSON.stringify(usuarioActual));
  if (usuarioAutenticado) localStorage.setItem('champa_autenticado', JSON.stringify(usuarioAutenticado));
}

function actualizarVista() {
  if (usuarioAutenticado) {
    document.getElementById('pantalla-login').classList.add('hidden');
    document.getElementById('pantalla-perfil').classList.remove('hidden');
    document.querySelector('.tab-nav').style.display = 'flex';
  } else {
    document.getElementById('pantalla-login').classList.add('hidden');
    document.querySelector('.tab-nav').style.display = 'flex';
  }
}

function mostrarAlerta(mensaje, tipo = 'info') {
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = mensaje;
  alerta.style.position = 'fixed';
  alerta.style.top = '70px';
  alerta.style.left = '50%';
  alerta.style.transform = 'translateX(-50%)';
  alerta.style.maxWidth = '90%';
  alerta.style.zIndex = '15';
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 3000);
}

function abrirModal(imgSrc) {
  document.getElementById('modal-img').src = imgSrc;
  document.getElementById('modal-imagen').classList.add('active');
}

function cerrarModal(event) {
  if (!event || event.target.id === 'modal-imagen') {
    document.getElementById('modal-imagen').classList.remove('active');
  }
}
