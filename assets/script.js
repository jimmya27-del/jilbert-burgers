/* ============================================================
   Jilbert Burgers - script.js (FASE 12)
   Carrito (localStorage) + render de productos + WhatsApp
   Modal propio: cero prompt/confirm/alert nativos.
   ============================================================ */
(function () {
  'use strict';

  var LS_CARRITO = 'jb_carrito_v1';
  var LS_DATOS   = 'jb_datos_pedido_v1';
  var MENU_URL   = 'assets/menu.json';

  var menu = null;
  var carrito = [];
  var caminoActual = 'contado'; // 'contado' | 'credito'

  // ------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function formatoMoneda(n, moneda) {
    var m = moneda || (menu && menu.negocio && menu.negocio.moneda) || 'EUR';
    var sym = m === 'EUR' ? '\u20AC' : m === 'USD' ? '$' : m === 'VES' ? 'Bs' : m;
    return sym + Number(n || 0).toFixed(2);
  }
  function leerLS(k, def) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function escribirLS(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }

  // ------------------------------------------------------------
  // Carga del menu.json
  // ------------------------------------------------------------
  function cargarMenu() {
    return fetch(MENU_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { menu = data; return data; })
      .catch(function (e) {
        // Sin popups: log en consola y seguir con menu vacio
        console.error('[JB] No se pudo cargar menu.json:', e);
        menu = { negocio: {}, categorias: {} };
        return menu;
      });
  }

  // ------------------------------------------------------------
  // Carrito
  // ------------------------------------------------------------
  function guardarCarrito() { escribirLS(LS_CARRITO, carrito); }
  function cargarCarrito() { carrito = leerLS(LS_CARRITO, []) || []; }

  function totalCarrito() {
    return carrito.reduce(function (acc, it) { return acc + (Number(it.precio) || 0) * (Number(it.cantidad) || 0); }, 0);
  }
  function unidadesCarrito() {
    return carrito.reduce(function (acc, it) { return acc + (Number(it.cantidad) || 0); }, 0);
  }

  function agregarAlCarrito(prod) {
    var ex = carrito.find(function (it) { return it.id === prod.id; });
    if (ex) { ex.cantidad += 1; }
    else {
      carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        precio: Number(prod.precio) || 0,
        cantidad: 1,
        emoji: prod.emoji || ''
      });
    }
    guardarCarrito();
    renderCarrito();
    renderBadge();
  }
  function quitarDelCarrito(id) {
    var i = carrito.findIndex(function (it) { return it.id === id; });
    if (i < 0) return;
    carrito[i].cantidad -= 1;
    if (carrito[i].cantidad <= 0) carrito.splice(i, 1);
    guardarCarrito();
    renderCarrito();
    renderBadge();
  }
  function vaciarCarrito() {
    if (carrito.length === 0) return;
    abrirModalConfirmar({
      titulo: 'Vaciar carrito',
      mensaje: '\u00BFVaciar todo el carrito?',
      textoOk: 'Vaciar',
      textoCancelar: 'Cancelar',
      onOk: function () {
        carrito = [];
        guardarCarrito();
        renderCarrito();
        renderBadge();
      }
    });
  }

  // ------------------------------------------------------------
  // Render carrito
  // ------------------------------------------------------------
  function renderBadge() {
    var badge = $('#carrito-badge');
    if (!badge) return;
    var u = unidadesCarrito();
    if (u > 0) { badge.style.display = ''; badge.textContent = String(u); }
    else { badge.style.display = 'none'; badge.textContent = '0'; }
  }

  function renderCarrito() {
    var lista = $('#carrito-lista');
    var totalEl = $('#carrito-total');
    if (!lista) return;

    if (carrito.length === 0) {
      lista.innerHTML = '<p class="carrito-vacio">Tu carrito est\u00E1 vac\u00EDo.</p>';
    } else {
      var html = '';
      carrito.forEach(function (it) {
        html += '<div class="carrito-item" data-id="' + esc(it.id) + '">';
        html +=   '<div class="carrito-item-info">';
        html +=     '<span class="carrito-item-emoji">' + esc(it.emoji || '\uD83C\uDF54') + '</span>';
        html +=     '<span class="carrito-item-nombre">' + esc(it.nombre) + '</span>';
        html +=     '<span class="carrito-item-precio">' + formatoMoneda(it.precio) + ' x ' + it.cantidad + '</span>';
        html +=   '</div>';
        html +=   '<div class="carrito-item-acciones">';
        html +=     '<button class="btn-menos" data-id="' + esc(it.id) + '" aria-label="Quitar uno">\u2212</button>';
        html +=     '<span class="carrito-item-cant">' + it.cantidad + '</span>';
        html +=     '<button class="btn-mas" data-id="' + esc(it.id) + '" aria-label="Agregar uno">+</button>';
        html +=   '</div>';
        html += '</div>';
      });
      lista.innerHTML = html;
      $$('.btn-mas', lista).forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-id');
          var prod = carrito.find(function (x) { return x.id === id; });
          if (prod) agregarAlCarrito(prod);
        });
      });
      $$('.btn-menos', lista).forEach(function (b) {
        b.addEventListener('click', function () { quitarDelCarrito(b.getAttribute('data-id')); });
      });
    }

    if (totalEl) totalEl.innerHTML = formatoMoneda(totalCarrito());
    actualizarSufijoDescuento();
  }

  function actualizarSufijoDescuento() {
    var span = $('#pago-off-label');
    if (!span) return;
    var d = menu && menu.negocio && Number(menu.negocio.descuento_contado);
    if (d > 0) span.textContent = ' \u00B7 ' + d + '% OFF';
    else span.textContent = '';
  }

  // ------------------------------------------------------------
  // Modal generico (inyectado desde JS, NO duplicado en HTML)
  // ------------------------------------------------------------
  function asegurarModal() {
    if ($('#jb-modal-overlay')) return;
    var wrap = document.createElement('div');
    wrap.id = 'jb-modal-overlay';
    wrap.className = 'modal-datos-overlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML = ''
      + '<div class="modal-datos" role="document">'
      +   '<div class="modal-datos-head">'
      +     '<h3 id="jb-modal-titulo">Datos del pedido</h3>'
      +     '<button type="button" id="jb-modal-cerrar" aria-label="Cerrar">&times;</button>'
      +   '</div>'
      +   '<div class="modal-datos-body" id="jb-modal-body"></div>'
      +   '<div class="modal-datos-acciones" id="jb-modal-acciones"></div>'
      + '</div>';
    document.body.appendChild(wrap);

    wrap.addEventListener('click', function (e) { if (e.target === wrap) cerrarModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('abierto')) cerrarModal();
    });
    $('#jb-modal-cerrar').addEventListener('click', cerrarModal);
  }

  function cerrarModal() {
    var w = $('#jb-modal-overlay');
    if (w) w.classList.remove('abierto');
  }

  function abrirModal(html) {
    asegurarModal();
    var body = $('#jb-modal-body');
    var acc = $('#jb-modal-acciones');
    body.innerHTML = html.body || '';
    acc.innerHTML = html.acciones || '';
    if (html.titulo) $('#jb-modal-titulo').textContent = html.titulo;
    $('#jb-modal-overlay').classList.add('abierto');
  }

  // ------------------------------------------------------------
  // Modal: confirmacion simple (reemplaza confirm nativo)
  // ------------------------------------------------------------
  function abrirModalConfirmar(opts) {
    var html = ''
      + '<p class="modal-texto">' + esc(opts.mensaje || '') + '</p>';
    var acciones = ''
      + '<button type="button" class="btn-secundario" id="jb-modal-cancelar">' + esc(opts.textoCancelar || 'Cancelar') + '</button>'
      + '<button type="button" class="btn-primario" id="jb-modal-ok">' + esc(opts.textoOk || 'Aceptar') + '</button>';
    abrirModal({ titulo: opts.titulo || 'Confirmar', body: html, acciones: acciones });
    $('#jb-modal-cancelar').onclick = cerrarModal;
    $('#jb-modal-ok').onclick = function () { cerrarModal(); if (typeof opts.onOk === 'function') opts.onOk(); };
  }

  // ------------------------------------------------------------
  // Modal: datos del pedido + metodo de pago (FASE 12)
  // ------------------------------------------------------------
  function datosPagoDisponibles() {
    var p = menu && menu.negocio && menu.negocio.pago;
    var lista = [];
    if (!p) return lista;
    var pm = p.pago_movil;
    if (pm && (pm.banco || pm.telefono || pm.cedula || pm.titular)) {
      lista.push({ id: 'pago_movil', label: 'Pago M\u00F3vil', datos: pm });
    }
    var tr = p.transferencia;
    if (tr && (tr.banco || tr.cuenta || tr.tipo || tr.cedula || tr.titular)) {
      lista.push({ id: 'transferencia', label: 'Transferencia', datos: tr });
    }
    // Efectivo: solo si existe en el JSON como bloque
    if (p.efectivo && (p.efectivo.nota || p.efectivo.titular)) {
      lista.push({ id: 'efectivo', label: 'Efectivo', datos: p.efectivo });
    }
    return lista;
  }

  function bloqueDatosPago(metodo) {
    var d = metodo.datos || {};
    var filas = [];
    if (metodo.id === 'pago_movil') {
      filas.push(['Banco', d.banco]);
      filas.push(['Tel\u00E9fono', d.telefono]);
      filas.push(['C\u00E9dula', d.cedula]);
      filas.push(['Titular', d.titular]);
    } else if (metodo.id === 'transferencia') {
      filas.push(['Banco', d.banco]);
      filas.push(['Cuenta', d.cuenta]);
      filas.push(['Tipo', d.tipo]);
      filas.push(['C\u00E9dula', d.cedula]);
      filas.push(['Titular', d.titular]);
    } else if (metodo.id === 'efectivo') {
      filas.push(['Titular', d.titular]);
      filas.push(['Nota', d.nota]);
    }
    var html = '<div class="pago-datos-tabla">';
    filas.forEach(function (f) {
      html += '<div class="pago-datos-fila"><span class="pago-datos-k">' + esc(f[0]) + '</span>'
            + '<span class="pago-datos-v">' + esc(f[1] == null ? '' : f[1]) + '</span></div>';
    });
    html += '</div>';
    var inst = menu && menu.negocio && menu.negocio.pago && menu.negocio.pago.instrucciones;
    if (inst && String(inst).trim() !== '') {
      html += '<p class="pago-instrucciones">' + esc(inst) + '</p>';
    }
    return html;
  }

  function abrirModalDatosPedido() {
    var datos = leerLS(LS_DATOS, { nombre: '', nota: '' }) || { nombre: '', nota: '' };
    var metodos = datosPagoDisponibles();
    var descuento = menu && menu.negocio && Number(menu.negocio.descuento_contado) || 0;
    var total = totalCarrito();
    var totalDesc = descuento > 0 ? total * (1 - descuento / 100) : total;

    var body = ''
      + '<div class="modal-resumen">'
      +   '<div class="modal-resumen-fila"><span>Subtotal</span><span>' + formatoMoneda(total) + '</span></div>'
      + (descuento > 0 ? '<div class="modal-resumen-fila descuento"><span>Descuento contado (' + descuento + '%)</span><span>\u2212 ' + formatoMoneda(total - totalDesc) + '</span></div>' : '')
      +   '<div class="modal-resumen-fila total"><span>Total</span><span>' + formatoMoneda(totalDesc) + '</span></div>'
      + '</div>'
      + '<label class="modal-campo">Nombre <em>*</em>'
      +   '<input type="text" id="jb-nombre" autocomplete="name" value="' + esc(datos.nombre) + '" placeholder="Tu nombre">'
      +   '<span class="modal-error" id="jb-nombre-error" style="display:none;">El nombre es obligatorio.</span>'
      + '</label>'
      + '<label class="modal-campo">Direcci\u00F3n o nota (opcional)'
      +   '<textarea id="jb-nota" rows="2" placeholder="Ej: calle, referencia, sin cebolla...">' + esc(datos.nota) + '</textarea>'
      + '</label>';

    if (metodos.length > 0) {
      body += '<div class="modal-metodos"><p class="modal-metodos-titulo">M\u00E9todo de pago</p>';
      metodos.forEach(function (m, i) {
        body += '<label class="modal-metodo">'
              +   '<input type="radio" name="jb-metodo" value="' + esc(m.id) + '"' + (i === 0 ? ' checked' : '') + '>'
              +   '<span>' + esc(m.label) + '</span>'
              + '</label>';
      });
      body += '</div>';
      body += '<div id="jb-pago-datos">' + bloqueDatosPago(metodos[0]) + '</div>';
    } else {
      body += '<p class="modal-sin-metodos">El negocio a\u00FAn no ha configurado m\u00E9todos de pago. Coordinaremos por WhatsApp.</p>';
    }

    var acciones = ''
      + '<button type="button" class="btn-secundario" id="jb-modal-cancelar">Cancelar</button>'
      + '<button type="button" class="btn-primario" id="jb-modal-enviar">Enviar pedido por WhatsApp</button>';

    abrirModal({ titulo: 'Datos del pedido', body: body, acciones: acciones });

    // Wiring radios -> cambio de bloque datos
    $$('input[name="jb-metodo"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var sel = metodos.find(function (x) { return x.id === r.value; });
        var cont = $('#jb-pago-datos');
        if (cont && sel) cont.innerHTML = bloqueDatosPago(sel);
      });
    });

    // Validacion en vivo
    var nombreEl = $('#jb-nombre');
    nombreEl.addEventListener('input', function () {
      if (nombreEl.value.trim() !== '') {
        nombreEl.classList.remove('error');
        var err = $('#jb-nombre-error'); if (err) err.style.display = 'none';
      }
    });

    $('#jb-modal-cancelar').onclick = cerrarModal;
    $('#jb-modal-enviar').onclick = function () {
      var nombre = (nombreEl.value || '').trim();
      if (nombre === '') {
        nombreEl.classList.add('error');
        var err = $('#jb-nombre-error'); if (err) err.style.display = '';
        nombreEl.focus();
        return;
      }
      var nota = ($('#jb-nota').value || '').trim();
      escribirLS(LS_DATOS, { nombre: nombre, nota: nota });
      var radio = $('input[name="jb-metodo"]:checked');
      var metodoId = radio ? radio.value : '';
      var metodo = metodos.find(function (x) { return x.id === metodoId; }) || null;
      cerrarModal();
      enviarWhatsApp({ nombre: nombre, nota: nota, metodo: metodo, descuento: descuento, total: total, totalDesc: totalDesc });
    };
  }

  // ------------------------------------------------------------
  // Envio a WhatsApp (plantilla unica)
  // ------------------------------------------------------------
  function construirMensaje(datos) {
    var neg = (menu && menu.negocio) || {};
    var lineas = [];
    lineas.push('*Nuevo pedido \u2014 Jilbert Burgers*');
    lineas.push('');
    lineas.push('*Cliente:* ' + datos.nombre);
    if (datos.nota) lineas.push('*Nota:* ' + datos.nota);
    lineas.push('');
    lineas.push('*Productos:*');
    carrito.forEach(function (it) {
      lineas.push('\u2022 ' + it.cantidad + 'x ' + it.nombre + ' \u2014 ' + formatoMoneda(it.precio * it.cantidad));
    });
    lineas.push('');
    lineas.push('*Subtotal:* ' + formatoMoneda(datos.total));
    if (datos.camino === 'contado' && datos.descuento > 0) {
      lineas.push('*Descuento contado (' + datos.descuento + '%):* \u2212 ' + formatoMoneda(datos.total - datos.totalDesc));
    }
    lineas.push('*Total:* ' + formatoMoneda(datos.totalDesc));
    if (datos.metodo) {
      lineas.push('');
      lineas.push('*M\u00E9todo de pago:* ' + datos.metodo.label);
      var d = datos.metodo.datos || {};
      if (datos.metodo.id === 'pago_movil') {
        if (d.banco)    lineas.push('Banco: ' + d.banco);
        if (d.telefono) lineas.push('Tel\u00E9fono: ' + d.telefono);
        if (d.cedula)   lineas.push('C\u00E9dula: ' + d.cedula);
        if (d.titular)  lineas.push('Titular: ' + d.titular);
      } else if (datos.metodo.id === 'transferencia') {
        if (d.banco)   lineas.push('Banco: ' + d.banco);
        if (d.cuenta)  lineas.push('Cuenta: ' + d.cuenta);
        if (d.tipo)    lineas.push('Tipo: ' + d.tipo);
        if (d.cedula)  lineas.push('C\u00E9dula: ' + d.cedula);
        if (d.titular) lineas.push('Titular: ' + d.titular);
      } else if (datos.metodo.id === 'efectivo') {
        if (d.titular) lineas.push('Titular: ' + d.titular);
        if (d.nota)    lineas.push('Nota: ' + d.nota);
      }
    }
    lineas.push('');
    lineas.push('_Enviado desde el men\u00FA web_');
    return lineas.join('\n');
  }

  function enviarWhatsApp(datos) {
    var neg = (menu && menu.negocio) || {};
    var tel = String(neg.whatsapp || '').replace(/\D/g, '');
    if (!tel) {
      abrirModalConfirmar({
        titulo: 'WhatsApp no configurado',
        mensaje: 'El n\u00FAmero de WhatsApp no est\u00E1 configurado en menu.json.',
        textoOk: 'Cerrar',
        textoCancelar: ''
      });
      return;
    }
    var msg = construirMensaje(datos);
    var url = 'https://wa.me/' + tel + '?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }

  // ------------------------------------------------------------
  // Envio directo (credito -> WhatsApp sin bloque de pago)
  // ------------------------------------------------------------
  function enviarCreditoDirecto() {
    var datos = leerLS(LS_DATOS, { nombre: '', nota: '' }) || { nombre: '', nota: '' };
    // Si no hay nombre guardado, abrimos modal minimo (nombre + nota, sin metodo de pago)
    if (!datos.nombre) {
      abrirModalNombreSimple(function (nombre, nota) {
        escribirLS(LS_DATOS, { nombre: nombre, nota: nota });
        var total = totalCarrito();
        enviarWhatsApp({ nombre: nombre, nota: nota, metodo: null, descuento: 0, total: total, totalDesc: total, camino: 'credito' });
      });
      return;
    }
    var total = totalCarrito();
    enviarWhatsApp({ nombre: datos.nombre, nota: datos.nota, metodo: null, descuento: 0, total: total, totalDesc: total, camino: 'credito' });
  }

  function abrirModalNombreSimple(cb) {
    var datos = leerLS(LS_DATOS, { nombre: '', nota: '' }) || { nombre: '', nota: '' };
    var body = ''
      + '<label class="modal-campo">Nombre <em>*</em>'
      +   '<input type="text" id="jb-nombre" autocomplete="name" value="' + esc(datos.nombre) + '" placeholder="Tu nombre">'
      +   '<span class="modal-error" id="jb-nombre-error" style="display:none;">El nombre es obligatorio.</span>'
      + '</label>'
      + '<label class="modal-campo">Direcci\u00F3n o nota (opcional)'
      +   '<textarea id="jb-nota" rows="2" placeholder="Ej: calle, referencia...">' + esc(datos.nota) + '</textarea>'
      + '</label>';
    var acciones = ''
      + '<button type="button" class="btn-secundario" id="jb-modal-cancelar">Cancelar</button>'
      + '<button type="button" class="btn-primario" id="jb-modal-enviar">Enviar por WhatsApp</button>';
    abrirModal({ titulo: 'Datos del pedido', body: body, acciones: acciones });

    var nombreEl = $('#jb-nombre');
    nombreEl.addEventListener('input', function () {
      if (nombreEl.value.trim() !== '') {
        nombreEl.classList.remove('error');
        var err = $('#jb-nombre-error'); if (err) err.style.display = 'none';
      }
    });
    $('#jb-modal-cancelar').onclick = cerrarModal;
    $('#jb-modal-enviar').onclick = function () {
      var nombre = (nombreEl.value || '').trim();
      if (nombre === '') {
        nombreEl.classList.add('error');
        var err = $('#jb-nombre-error'); if (err) err.style.display = '';
        nombreEl.focus();
        return;
      }
      var nota = ($('#jb-nota').value || '').trim();
      cerrarModal();
      cb(nombre, nota);
    };
  }

  // ------------------------------------------------------------
  // Render de productos en paginas de categoria
  // ------------------------------------------------------------
  function renderProductos() {
    var cont = $('#productos');
    if (!cont || !menu) return;
    var cat = cont.getAttribute('data-categoria');
    if (!cat) return;
    var c = menu.categorias && menu.categorias[cat];
    if (!c || !Array.isArray(c.productos)) { cont.innerHTML = ''; return; }
    var html = '';
    c.productos.forEach(function (p) {
      if (p.activo === false) return;
      html += '<article class="producto" data-id="' + esc(p.id) + '">';
      if (p.foto) html += '<img class="producto-foto" src="' + esc(p.foto) + '" alt="' + esc(p.nombre) + '" loading="lazy">';
      else html += '<div class="producto-emoji">' + esc(p.emoji || '\uD83C\uDF54') + '</div>';
      html +=   '<h3 class="producto-nombre">' + esc(p.nombre) + '</h3>';
      html +=   '<p class="producto-desc">' + esc(p.desc || '') + '</p>';
      html +=   '<div class="producto-pie">';
      html +=     '<span class="producto-precio">' + formatoMoneda(p.precio) + '</span>';
      html +=     '<button class="btn-agregar" data-id="' + esc(p.id) + '">Agregar</button>';
      html +=   '</div>';
      html += '</article>';
    });
    cont.innerHTML = html;
    $$('.btn-agregar', cont).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-id');
        var prod = (c.productos || []).find(function (x) { return x.id === id; });
        if (prod) agregarAlCarrito(prod);
      });
    });
  }

  // ------------------------------------------------------------
  // Render hero / negocio (data-negocio)
  // ------------------------------------------------------------
  function renderNegocio() {
    if (!menu || !menu.negocio) return;
    var neg = menu.negocio;
    $$('[data-negocio]').forEach(function (el) {
      var key = el.getAttribute('data-negocio');
      var val = neg[key];
      if (val == null) return;
      if (el.tagName === 'IMG') el.src = val;
      else el.textContent = val;
    });
    var sub = $('#hero-subtitulo');
    if (sub && menu.hero && menu.hero.subtitulo) sub.textContent = menu.hero.subtitulo;
    var tit = $('#hero-titulo');
    if (tit && menu.hero && menu.hero.titulo) tit.textContent = menu.hero.titulo;
  }

  // ------------------------------------------------------------
  // Panel de pago / caminos
  // ------------------------------------------------------------
  function abrirPanelPago() {
    var panel = $('#carrito-pago-panel');
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('abierto');
    actualizarSufijoDescuento();
    var bs = $('#pago-total-bs');
    if (bs && menu && menu.negocio && menu.negocio.tasa_bcv) {
      var t = totalCarrito();
      var bsVal = t * Number(menu.negocio.tasa_bcv);
      bs.textContent = 'Bs ' + bsVal.toFixed(2);
    }
  }
  function cerrarPanelPago() {
    var panel = $('#carrito-pago-panel');
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'true');
    panel.classList.remove('abierto');
  }

  function setCamino(c) {
    caminoActual = c;
    $$('.pago-camino').forEach(function (b) {
      b.classList.toggle('activo', b.getAttribute('data-camino') === c);
    });
  }

  function iniciarCaminos() {
    var bContado = $('#pago-camino-contado');
    var bCredito = $('#pago-camino-credito');
    if (bContado) {
      bContado.addEventListener('click', function () {
        setCamino('contado');
        if (carrito.length === 0) { return; }
        abrirModalDatosPedido();
      });
    }
    if (bCredito) {
      bCredito.addEventListener('click', function () {
        setCamino('credito');
        if (carrito.length === 0) { return; }
        enviarCreditoDirecto();
      });
    }
  }

  // ------------------------------------------------------------
  // Wiring global
  // ------------------------------------------------------------
  function iniciarCarritoUI() {
    var btn = $('#carrito-btn');
    var panel = $('#carrito-panel');
    var cerrar = $('#carrito-cerrar');
    var enviar = $('#carrito-enviar');
    var vaciar = $('#carrito-vaciar');
    var pagoCerrar = $('#carrito-pago-cerrar');

    if (btn && panel) btn.addEventListener('click', function () { panel.classList.add('abierto'); });
    if (cerrar && panel) cerrar.addEventListener('click', function () { panel.classList.remove('abierto'); });
    if (vaciar) vaciar.addEventListener('click', vaciarCarrito);
    if (enviar) enviar.addEventListener('click', function () {
      if (carrito.length === 0) { return; }
      abrirPanelPago();
    });
    if (pagoCerrar) pagoCerrar.addEventListener('click', function () {
      cerrarPanelPago();
      if (panel) panel.classList.add('abierto');
    });
  }

  // ------------------------------------------------------------
  // Init
  // ------------------------------------------------------------
  function init() {
    cargarCarrito();
    cargarMenu().then(function () {
      renderNegocio();
      renderProductos();
      renderCarrito();
      renderBadge();
      iniciarCarritoUI();
      iniciarCaminos();
      asegurarModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();