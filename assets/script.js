/* ============================================================
   Jilbert Burgers - script.js
   Carrito (localStorage) + render de productos + WhatsApp
   UX: tarjeta toggle con contador y boton "-"
   FASE 6: consume foto, badge y negocio desde menu.json
   ============================================================ */

(function () {
  'use strict';

  var CLAVE_CARRITO = 'jilbert_carrito_v1';
  var carrito = [];
  var menuData = null;

  function leerCarrito() {
    try {
      var raw = localStorage.getItem(CLAVE_CARRITO);
      carrito = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(carrito)) carrito = [];
    } catch (e) { carrito = []; }
  }

  function guardarCarrito() {
    try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito)); } catch (e) {}
  }

  function simboloMoneda() {
    var m = (menuData && menuData.negocio && menuData.negocio.moneda) ? String(menuData.negocio.moneda) : 'EUR';
    if (m === 'EUR') return '\u20ac';
    if (m === 'USD') return '$';
    if (m === 'Bs')  return 'Bs';
    return m;
  }
  function formatearPrecio(n) {
    return simboloMoneda() + Number(n).toFixed(2);
  }
  function totalItems() { return carrito.reduce(function (s, it) { return s + it.cantidad; }, 0); }
  function totalPrecio() { return carrito.reduce(function (s, it) { return s + it.cantidad * it.precio; }, 0); }

  function monedaActual() {
    return (menuData && menuData.negocio && menuData.negocio.moneda) ? String(menuData.negocio.moneda) : 'EUR';
  }
  function tasaActual() {
    var t = (menuData && menuData.negocio) ? Number(menuData.negocio.tasa_bcv) : 0;
    return (isFinite(t) && t > 0) ? t : 0;
  }
  function equivalenteBsHTML(total) {
    if (monedaActual() === 'Bs') return '';
    var t = tasaActual();
    if (t <= 0) return '';
    var bs = total * t;
    return 'Bs ' + bs.toFixed(2).replace('.', ',') +
           ' <span class="carrito-bs-tasa">(' + t.toFixed(2).replace('.', ',') + ' Bs/u)</span>';
  }

  function equivalenteBsTexto(total) {
    if (monedaActual() === 'Bs') return '';
    var t = tasaActual();
    if (t <= 0) return '';
    var bs = total * t;
    return ' / Bs ' + bs.toFixed(2).replace('.', ',');
  }

  // ============================================================
  // FASE 12-BIS - Pago del carrito (sin prompts nativos)
  // Dos acciones directas: Enviar por WhatsApp | Contado
  // ============================================================

  function descuentoContado() {
    var d = (menuData && menuData.negocio) ? Number(menuData.negocio.descuento_contado) : 0;
    if (!isFinite(d) || d < 0) d = 0;
    if (d > 100) d = 100;
    return d;
  }

  function actualizarTextoBotonPago() {
    var btn = document.getElementById('carrito-contado');
    if (!btn) return;
    var custom = (menuData && menuData.negocio && menuData.negocio.texto_boton_pago || '').trim();
    btn.textContent = custom || ('Pagar ahora con ' + descuentoContado() + '% off');
  }

  function pagoConfig() {
    return (menuData && menuData.negocio && menuData.negocio.pago) ? menuData.negocio.pago : null;
  }

  function totalCarrito() {
    return carrito.reduce(function (s, it) { return s + (Number(it.precio) * Number(it.cantidad)); }, 0);
  }

  function totalContado() {
    return totalCarrito() * (1 - descuentoContado() / 100);
  }

  function inyectarPanelPago() {
    var aside = document.getElementById('carrito-panel');
    if (!aside) return;
    if (document.getElementById('carrito-pago-panel')) return;
    var div = document.createElement('div');
    div.className = 'carrito-pago-panel';
    div.id = 'carrito-pago-panel';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = '' +
      '<header class="carrito-pago-head">' +
        '<h3>Pago del pedido</h3>' +
        '<button type="button" id="carrito-pago-cerrar" aria-label="Volver al carrito">&times;</button>' +
      '</header>' +
      '<div class="pago-total">' +
        '<span id="pago-total-label">Total a pagar</span>' +
        '<strong id="pago-total-valor"></strong>' +
        '<span class="carrito-total-bs" id="pago-total-bs"></span>' +
      '</div>' +
      '<div class="pago-datos" id="pago-datos"></div>' +
      '<form class="pago-form" id="pago-form" autocomplete="off">' +
        '<label>Nombre<input type="text" id="pago-nombre" required></label>' +
        '<label>Direcci\u00F3n o nota<input type="text" id="pago-nota"></label>' +
        '<label>Tipo de pago<select id="pago-tipo"></select></label>' +
        '<label id="pago-referencia-wrap" style="display:none">Referencia del pago<input type="text" id="pago-referencia"></label>' +
        '<button type="submit" class="btn-wa" id="pago-enviar">Confirmar y enviar pago</button>' +
      '</form>';
    aside.appendChild(div);
    var form = div.querySelector('#pago-form');
    if (form) form.addEventListener('submit', function (ev) { ev.preventDefault(); enviarContado(); });
    var selTipo = div.querySelector('#pago-tipo');
    if (selTipo) selTipo.addEventListener('change', function () {
      var wrap = document.getElementById('pago-referencia-wrap');
      var inp = document.getElementById('pago-referencia');
      var mostrar = selTipo.value === 'Pago m\u00F3vil';
      if (wrap) wrap.style.display = mostrar ? '' : 'none';
      if (!mostrar && inp) inp.value = '';
    });
    var btnCerrar = div.querySelector('#carrito-pago-cerrar');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarPanelPago);
  }

  function abrirPanelContado() {
    if (carrito.length === 0) { mostrarMensajeCarrito('El carrito est\u00E1 vac\u00EDo.'); return; }
    inyectarPanelPago();
    var p = document.getElementById('carrito-pago-panel');
    if (!p) return;
    renderPagoContado();
    p.classList.add('abierto');
    p.setAttribute('aria-hidden', 'false');
  }

  function cerrarPanelPago() {
    var p = document.getElementById('carrito-pago-panel');
    if (!p) return;
    p.classList.remove('abierto');
    p.setAttribute('aria-hidden', 'true');
  }

  function renderPagoContado() {
    try { console.log('[pago]', { descRaw: (menuData && menuData.negocio) ? menuData.negocio.descuento_contado : 'NO-NEGOCIO', d: descuentoContado(), carrito: totalCarrito(), total: totalContado() }); } catch(e){}
    var d = descuentoContado();
    var total = totalContado();
    var lbl = document.getElementById('pago-total-label');
    if (lbl) lbl.textContent = 'Total contado (' + d + '% OFF)';
    var tot = document.getElementById('pago-total-valor');
    if (tot) tot.textContent = formatearPrecio(total);
    var totBs = document.getElementById('pago-total-bs');
    if (totBs) totBs.innerHTML = equivalenteBsHTML(total);
    var datos = document.getElementById('pago-datos');
    if (datos) {
      var pg = pagoConfig();
      var pm = (pg && pg.pago_movil) ? pg.pago_movil : null;
      var tr = (pg && pg.transferencia) ? pg.transferencia : null;
      var hayPm = pm && (pm.banco || pm.telefono || pm.cedula || pm.titular);
      var hayTr = tr && (tr.banco || tr.cuenta || tr.tipo || tr.cedula || tr.titular);
      if (!hayPm && !hayTr) {
        datos.innerHTML = '<p class="pago-vacio">El negocio a\u00FAn no ha cargado estos datos.</p>';
      } else {
        var html = '';
        if (hayPm) {
          html += '<div class="pago-bloque"><h4>Pago m\u00F3vil</h4><ul>';
          if (pm.banco)    html += '<li><span>Banco</span><strong>'    + pm.banco    + '</strong></li>';
          if (pm.telefono) html += '<li><span>Tel\u00E9fono</span><strong>' + pm.telefono + '</strong></li>';
          if (pm.cedula)   html += '<li><span>C\u00E9dula</span><strong>'   + pm.cedula   + '</strong></li>';
          if (pm.titular)  html += '<li><span>Titular</span><strong>'  + pm.titular  + '</strong></li>';
          html += '</ul></div>';
        }
        if (hayTr) {
          html += '<div class="pago-bloque"><h4>Transferencia</h4><ul>';
          if (tr.banco)   html += '<li><span>Banco</span><strong>'  + tr.banco  + '</strong></li>';
          if (tr.cuenta)  html += '<li><span>Cuenta</span><strong>' + tr.cuenta + '</strong></li>';
          if (tr.tipo)    html += '<li><span>Tipo</span><strong>'   + tr.tipo   + '</strong></li>';
          if (tr.cedula)  html += '<li><span>C\u00E9dula</span><strong>' + tr.cedula + '</strong></li>';
          if (tr.titular) html += '<li><span>Titular</span><strong>' + tr.titular + '</strong></li>';
          html += '</ul></div>';
        }
        datos.innerHTML = html;
      }
    }
    poblarTiposPago();
  }

  function poblarTiposPago() {
    var sel = document.getElementById('pago-tipo');
    if (!sel) return;
    var pg = pagoConfig();
    var pm = (pg && pg.pago_movil) ? pg.pago_movil : null;
    var tr = (pg && pg.transferencia) ? pg.transferencia : null;
    var hayPm = pm && (pm.banco || pm.telefono || pm.cedula || pm.titular);
    var hayTr = tr && (tr.banco || tr.cuenta || tr.tipo || tr.cedula || tr.titular);
    var previo = sel.value;
    var html = '<option value="Efectivo">Efectivo</option>';
    if (hayPm) html += '<option value="Pago m\u00F3vil">Pago m\u00F3vil</option>';
    if (hayTr) html += '<option value="Transferencia">Transferencia</option>';
    sel.innerHTML = html;
    if (previo) {
      var opts = sel.options;
      for (var i = 0; i < opts.length; i++) {
        if (opts[i].value === previo) { sel.value = previo; break; }
      }
    }
  }

  function mostrarMensajeCarrito(txt) {
    var lista = document.getElementById('carrito-lista');
    if (!lista) return;
    var aviso = document.createElement('div');
    aviso.className = 'carrito-aviso';
    aviso.textContent = txt;
    lista.insertBefore(aviso, lista.firstChild);
    setTimeout(function () { if (aviso.parentNode) aviso.parentNode.removeChild(aviso); }, 2500);
  }

  function construirLineasPedido(opciones) {
    var lineas = [];
    lineas.push('*Pedido Jilbert Burgers*');
    if (opciones.camino === 'contado') {
      lineas.push('*Contado - ' + descuentoContado() + '% OFF*');
    } else {
      lineas.push('*Enviar por WhatsApp (pago a coordinar)*');
    }
    lineas.push('');
    carrito.forEach(function (it) {
      lineas.push('\u2022 ' + it.cantidad + ' x ' + it.nombre + ' = ' + formatearPrecio(it.precio * it.cantidad));
    });
    lineas.push('');
    if (opciones.camino === 'contado') {
      var sub = totalCarrito(); var dcto = descuentoContado(); var mDesc = sub * (dcto / 100);
      lineas.push('*Subtotal:* ' + formatearPrecio(sub));
      lineas.push('*Descuento contado (' + dcto + '%):* -' + formatearPrecio(mDesc));
      lineas.push('*Total a pagar:* ' + formatearPrecio(sub - mDesc) + equivalenteBsTexto(sub - mDesc));
    } else {
      lineas.push('*Total:* ' + formatearPrecio(totalCarrito()) + equivalenteBsTexto(totalCarrito()));
    }
    if (opciones.nombre)     lineas.push('*Cliente:* ' + opciones.nombre);
    if (opciones.nota)       lineas.push('*Direcci\u00F3n/Nota:* ' + opciones.nota);
    if (opciones.tipoPago)   lineas.push('*Tipo de pago:* ' + opciones.tipoPago);
    if (opciones.referencia && opciones.tipoPago === 'Pago m\u00F3vil') lineas.push('*Referencia:* ' + opciones.referencia);
    return lineas;
  }

  function abrirWhatsAppConLineas(lineas) {
    var num = normalizarWhatsApp(menuData && menuData.negocio ? menuData.negocio.whatsapp : '');
    if (!num) { mostrarMensajeCarrito('N\u00FAmero de WhatsApp no configurado.'); return; }
    var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(lineas.join('\n'));
    var w = window.open(url, '_blank');
    if (!w) { location.href = url; }
  }

  function enviarPorWhatsAppDirecto() {
    if (carrito.length === 0) { mostrarMensajeCarrito('El carrito est\u00E1 vac\u00EDo.'); return; }
    abrirWhatsAppConLineas(construirLineasPedido({ camino: 'wa' })); limpiarCarritoTrasEnvio();
  }

  function enviarContado() {
    if (carrito.length === 0) { mostrarMensajeCarrito('El carrito est\u00E1 vac\u00EDo.'); return; }
    var nombre = String(((document.getElementById('pago-nombre') || {}).value) || '').trim();
    var nota   = String(((document.getElementById('pago-nota')   || {}).value) || '').trim();
    var tipo   = String(((document.getElementById('pago-tipo')   || {}).value) || '').trim();
    var ref    = String(((document.getElementById('pago-referencia') || {}).value) || '').trim();
    if (!nombre) { mostrarMensajeCarrito('Pon tu nombre.'); return; }
    abrirWhatsAppConLineas(construirLineasPedido({
      camino: 'contado',
      nombre: nombre,
      nota: nota,
      tipoPago: tipo,
      referencia: (tipo === 'Pago m\u00F3vil') ? ref : ''
    }));
    limpiarCarritoTrasEnvio();
    cerrarPanelPago();
  }
  function limpiarCarritoTrasEnvio() {
    carrito = [];
    guardarCarrito();
    pintarCarrito();
    refrescarTarjetas();
    var badge = document.getElementById('carrito-badge');
    if (badge) { badge.style.display = 'none'; badge.textContent = '0'; }
  }

  function cantidadDe(id) {
    var it = carrito.find(function (x) { return x.id === id; });
    return it ? it.cantidad : 0;
  }

  function agregar(producto) {
    var idx = carrito.findIndex(function (it) { return it.id === producto.id; });
    if (idx >= 0) { carrito[idx].cantidad += 1; }
    else {
      carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
    }
    guardarCarrito();
    pintarCarrito();
    refrescarTarjetas();
  }

  function cambiarCantidad(id, delta) {
    var idx = carrito.findIndex(function (it) { return it.id === id; });
    if (idx < 0) return;
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    guardarCarrito();
    pintarCarrito();
    refrescarTarjetas();
  }

  function vaciar() {
    if (carrito.length === 0) return;
    if (!confirm('\u00BFVaciar todo el carrito?')) return;
    carrito = [];
    guardarCarrito();
    pintarCarrito();
    refrescarTarjetas();
  }

  function pintarCarrito() {
    var badge = document.getElementById('carrito-badge');
    if (badge) {
      var n = totalItems();
      badge.textContent = n;
      badge.style.display = n > 0 ? 'flex' : 'none';
    }
    var lista = document.getElementById('carrito-lista');
    if (!lista) return;
    if (carrito.length === 0) {
      lista.innerHTML = '<div class="carrito-vacio">Tu carrito est\u00E1 vac\u00EDo.<br>Agrega productos para empezar.</div>';
    } else {
      lista.innerHTML = carrito.map(function (it) {
        return '' +
          '<div class="carrito-item">' +
            '<span class="nombre">' + it.nombre + '</span>' +
            '<span class="cant">' +
              '<button data-accion="menos" data-id="' + it.id + '">-</button>' +
              '<span>' + it.cantidad + '</span>' +
              '<button data-accion="mas" data-id="' + it.id + '">+</button>' +
            '</span>' +
            '<span class="precio">' + formatearPrecio(it.precio * it.cantidad) + '</span>' +
          '</div>';
      }).join('');
    }
    var totalEl = document.getElementById('carrito-total');
    var totalVal = totalPrecio();
    if (totalEl) {
      totalEl.textContent = formatearPrecio(totalVal);
      var bsHTML = equivalenteBsHTML(totalVal);
      var bsEl = document.getElementById('carrito-total-bs');
      if (bsHTML) {
        if (!bsEl) {
          bsEl = document.createElement('div');
          bsEl.id = 'carrito-total-bs';
          bsEl.className = 'carrito-total-bs';
          totalEl.parentNode.insertBefore(bsEl, totalEl.nextSibling);
        }
        bsEl.innerHTML = bsHTML;
      } else if (bsEl) {
        bsEl.parentNode.removeChild(bsEl);
      }
    }
  }

  function badgeHTML(b) {
    if (!b) return '';
    var k = String(b).toLowerCase();
    var textos = { 'nuevo': 'Nuevo', 'top': 'Top', 'promo': 'Promo' };
    if (!textos[k]) return '';
    return '<span class="badge-prod badge-' + k + '">' + textos[k] + '</span>';
  }

  function mediaHTML(p) {
    if (p && p.foto) {
      return '<div class="media"><img class="foto" src="' + p.foto + '" alt="' + (p.nombre || '') + '" loading="lazy"></div>';
    }
    return '<div class="media media-placeholder" aria-hidden="true">' +
             '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
               '<rect x="8" y="14" width="48" height="10" rx="5" fill="#FFC107"/>' +
               '<rect x="8" y="27" width="48" height="10" rx="4" fill="#D32F2F"/>' +
               '<rect x="8" y="40" width="48" height="10" rx="5" fill="#FFC107"/>' +
             '</svg>' +
           '</div>';
  }

  function descHTML(p) {
    var d = (p && p.desc) ? String(p.desc) : '';
    if (!d) return '';
    return '<details class="desc-detalle">' +
             '<summary class="desc-toggle">' +
               '<span class="txt-mas">Ver descripci\u00F3n</span>' +
               '<span class="txt-menos">Ocultar descripci\u00F3n</span>' +
             '</summary>' +
             '<p class="desc">' + d + '</p>' +
           '</details>';
  }
  function pintarProductos(categoria) {
    var cont = document.getElementById('lista-productos');
    if (!cont || !menuData) return;
    var cat = menuData.categorias[categoria];
    if (!cat) {
      cont.innerHTML = '<p style="text-align:center;color:#555;">Categor\u00EDa no encontrada.</p>';
      return;
    }
    cont.innerHTML = cat.productos.map(function (p) {
      return '' +
        '<div class="producto' + (String(p.badge || '').toLowerCase() === 'nuevo' ? ' es-nuevo' : '') + '" data-id="' + p.id + '" data-cat="' + categoria + '">' +
          mediaHTML(p) +
          badgeHTML(p.badge) +
          '<h3>' + p.nombre + '</h3>' +
          '<div class="precio">' + formatearPrecio(p.precio) + '</div>' +
          '<div class="acciones">' +
            '<button type="button" class="btn-menos" data-accion="menos" data-id="' + p.id + '">-</button>' +
            '<span class="contador" data-id="' + p.id + '">0</span>' +
            '<button type="button" class="btn-agregar" data-accion="mas" data-id="' + p.id + '">Agregar</button>' +
          '</div>' +
          descHTML(p) +
        '</div>';
    }).join('');
    refrescarTarjetas();
  }

  function aplicarNegocio() {
    if (!menuData) return;
    var neg = menuData.negocio || menuData;
    var nodos = document.querySelectorAll('[data-negocio]');
    if (!nodos.length) return;

    Array.prototype.forEach.call(nodos, function (el) {
      var campo = el.getAttribute('data-negocio');
      var valor = neg[campo];
      if (valor === undefined || valor === null || valor === '') return;

      if (campo === 'whatsapp') {
        var num = String(valor).replace(/\D/g, '');
        if (el.tagName === 'A') el.setAttribute('href', 'https://wa.me/' + num);
        else el.textContent = valor;
      } else if (campo === 'facebook') {
        if (el.tagName === 'A') el.setAttribute('href', valor);
        else el.textContent = valor;
      } else if (campo === 'correo') {
        if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + valor);
        el.textContent = valor;
      } else if (campo === 'direccion') {
        el.textContent = valor;
      } else if (campo === 'logo') {
        if (el.tagName === 'IMG') el.setAttribute('src', valor);
      } else {
        el.textContent = valor;
      }
    });
  }

  function aplicarLogoPos() {
    if (!menuData) return;
    var neg = menuData.negocio || menuData;
    var pos = neg.logo_pos || {};
    var escala = (pos.escala != null) ? Number(pos.escala) : 1;
    var x = (pos.x != null) ? Number(pos.x) : 0;
    var y = (pos.y != null) ? Number(pos.y) : 0;
    if (isNaN(escala) || escala <= 0) escala = 1;
    if (isNaN(x)) x = 0;
    if (isNaN(y)) y = 0;
    var bandas = document.querySelectorAll(".logo-banda");
    Array.prototype.forEach.call(bandas, function (b) {
      b.style.setProperty("--logo-escala", escala);
      b.style.setProperty("--logo-x", x + "%");
      b.style.setProperty("--logo-y", y + "%");
    });
  }

  function aplicarHero() {
    if (!menuData) return;
    var h = menuData.hero;
    if (!h) return;
    var elTit = document.getElementById('hero-titulo');
    var elSub = document.getElementById('hero-subtitulo');
    if (elTit && typeof h.titulo === 'string')    elTit.innerHTML = h.titulo;
    if (elSub && typeof h.subtitulo === 'string') elSub.innerHTML = h.subtitulo;
  }

  function refrescarTarjetas() {
    var cont = document.getElementById('lista-productos');
    if (!cont) return;
    cont.querySelectorAll('.producto').forEach(function (card) {
      var id = card.getAttribute('data-id');
      var cant = cantidadDe(id);
      var contador = card.querySelector('.contador');
      var btnMenos = card.querySelector('.btn-menos');
      if (contador) contador.textContent = cant;
      if (btnMenos) btnMenos.disabled = cant <= 0;
      if (cant > 0) card.classList.add('seleccionado');
      else card.classList.remove('seleccionado');
    });
  }

  function animarTarjeta(card) {
    if (!card) return;
    card.classList.remove('pop');
    void card.offsetWidth;
    card.classList.add('pop');
    setTimeout(function () { card.classList.remove('pop'); }, 280);
  }

  function abrirPanel() {
    var p = document.getElementById('carrito-panel');
    if (p) p.classList.add('abierto');
    intentarAbrirUpsell();
  }

  var _upsellProductoActual = null;

  function buscarProductoPorId(id) {
    if (!menuData || !menuData.categorias || !id) return null;
    var cats = menuData.categorias;
    var encontrado = null;
    Object.keys(cats).forEach(function (slug) {
      if (encontrado) return;
      var prods = (cats[slug] && cats[slug].productos) ? cats[slug].productos : [];
      for (var i = 0; i < prods.length; i++) {
        if (prods[i] && prods[i].id === id) { encontrado = prods[i]; return; }
      }
    });
    return encontrado;
  }

  function cerrarUpsell() {
    var m = document.getElementById('upsell-modal');
    if (!m) return;
    m.classList.remove('abierto');
    m.setAttribute('aria-hidden', 'true');
    _upsellProductoActual = null;
  }

  function intentarAbrirUpsell() {
    if (!menuData) return;
    if (!carrito || carrito.length === 0) return;
    var ids = [menuData.upsell_id, menuData.upsell_id_2];
    var prod = null;
    for (var i = 0; i < ids.length; i++) {
      var upId = ids[i];
      if (!upId || typeof upId !== 'string') continue;
      var yaEnCarrito = carrito.some(function (it) { return it.id === upId; });
      if (yaEnCarrito) continue;
      var cand = buscarProductoPorId(upId);
      if (!cand) continue;
      if (cand.activo === false) continue;
      prod = cand;
      break;
    }
    if (!prod) return;
    var modal = document.getElementById('upsell-modal');
    if (!modal) return;
    var img = document.getElementById('upsell-img');
    var nom = document.getElementById('upsell-nombre');
    var desc = document.getElementById('upsell-desc');
    var pre = document.getElementById('upsell-precio');
    if (img) {
      var srcImg = prod.foto || prod.imagen || '';
      if (srcImg) { img.src = srcImg; img.style.display = 'block'; }
      else { img.removeAttribute('src'); img.style.display = 'none'; }
    }
    if (nom) nom.textContent = prod.nombre || '';
    if (desc) desc.textContent = prod.desc || prod.descripcion || '';
    if (pre) pre.textContent = formatearPrecio(prod.precio);
    _upsellProductoActual = prod;
    modal.classList.add('abierto');
    modal.setAttribute('aria-hidden', 'false');
  }

  function aceptarUpsell() {
    if (_upsellProductoActual) {
      agregar(_upsellProductoActual);
      cerrarUpsell();
      setTimeout(intentarAbrirUpsell, 350);
      return;
    }
    cerrarUpsell();
  }
  function cerrarPanel() { var p = document.getElementById('carrito-panel'); if (p) p.classList.remove('abierto'); cerrarPanelPago(); }

  function normalizarWhatsApp(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '0') { d = '58' + d.slice(1); }
    return d;
  }

  function svgCategoria(slug) {
    var s = {
      'hamburguesas': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><path d="M8 22 Q32 6 56 22 Z" fill="#FFC107"/><rect x="6" y="24" width="52" height="6" rx="3" fill="#D32F2F"/><rect x="8" y="32" width="48" height="6" rx="2" fill="#7CB342"/><rect x="6" y="40" width="52" height="6" rx="3" fill="#D32F2F"/><path d="M8 48 Q32 60 56 48 Z" fill="#FFC107"/></svg>',
      'salchipapas': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect x="16" y="10" width="6" height="32" fill="#FFC107"/><rect x="24" y="6" width="6" height="36" fill="#FFC107"/><rect x="32" y="8" width="6" height="34" fill="#FFC107"/><rect x="40" y="12" width="6" height="30" fill="#FFC107"/><path d="M10 40 L54 40 L50 58 L14 58 Z" fill="#D32F2F"/></svg>',
      'bebidas': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect x="34" y="6" width="4" height="22" fill="#111111" transform="rotate(20 36 17)"/><rect x="14" y="20" width="36" height="6" fill="#FFC107"/><path d="M14 26 L50 26 L46 58 L18 58 Z" fill="#D32F2F"/><rect x="20" y="38" width="24" height="3" fill="#FFFFFF" opacity="0.5"/></svg>',
      'combos': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect x="6" y="46" width="52" height="6" rx="2" fill="#111111"/><circle cx="20" cy="36" r="10" fill="#FFC107"/><circle cx="20" cy="36" r="6" fill="#D32F2F"/><rect x="34" y="26" width="8" height="20" fill="#FFC107"/><rect x="44" y="30" width="8" height="16" fill="#D32F2F"/></svg>',
      'combos-descuento': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><path d="M6 30 Q32 16 58 30 Z" fill="#FFC107"/><rect x="4" y="32" width="56" height="6" rx="3" fill="#D32F2F"/><rect x="6" y="40" width="52" height="6" rx="2" fill="#7CB342"/><path d="M4 48 Q32 58 60 48 Z" fill="#FFC107"/><polygon points="52,8 54,16 62,16 56,21 58,29 52,24 46,29 48,21 42,16 50,16" fill="#D32F2F"/></svg>',
      'hamburguesas-carne': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><path d="M8 22 Q32 6 56 22 Z" fill="#FFC107"/><rect x="6" y="24" width="52" height="5" rx="2" fill="#7CB342"/><rect x="4" y="30" width="56" height="10" rx="3" fill="#6D4C41"/><rect x="6" y="42" width="52" height="6" rx="3" fill="#D32F2F"/><path d="M8 50 Q32 62 56 50 Z" fill="#FFC107"/></svg>',
      'hamburguesas-pollo': '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="80" height="80"><path d="M8 22 Q32 6 56 22 Z" fill="#FFC107"/><rect x="6" y="24" width="52" height="6" rx="2" fill="#F5DEB3"/><rect x="4" y="32" width="56" height="10" rx="4" fill="#E8A33D"/><rect x="6" y="44" width="52" height="6" rx="3" fill="#D32F2F"/><path d="M8 52 Q32 62 56 52 Z" fill="#FFC107"/></svg>'
    };
    return s[slug] || s['hamburguesas'];
  }

  function catMediaHTML(c, slug) {
    var svg = svgCategoria(slug);
    var img = '';
    if (c && typeof c.imagen === 'string' && c.imagen.length > 0) {
      img = '<img class="cat-img" src="' + c.imagen + '" alt="" loading="lazy" onerror="this.remove()">';
    }
    return svg + img;
  }

  function pintarTodosLosProductos() {
    var cont = document.getElementById('lista-productos');
    if (!cont || !menuData) return;
    var cats = menuData.categorias || {};
    var todos = [];
    Object.keys(cats).forEach(function (slug) {
      var c = cats[slug] || {};
      var prods = c.productos || [];
      prods.forEach(function (p) {
        if (p.activo === false) return;
        todos.push({ p: p, slug: slug });
      });
    });
    todos.sort(function (a, b) {
      var oa = (a.p.orden != null) ? Number(a.p.orden) : 9999;
      var ob = (b.p.orden != null) ? Number(b.p.orden) : 9999;
      return oa - ob;
    });
    var html = '<div class="grupo-grid">';
    todos.forEach(function (item, idx) {
      var p = item.p;
      var esDestacado = (idx === 0);
      html += '' +
        '<div class="producto' + (esDestacado ? ' destacado' : '') + (String(p.badge || '').toLowerCase() === 'nuevo' ? ' es-nuevo' : '') + '" data-id="' + p.id + '" data-cat="' + item.slug + '">' +
          (esDestacado ? '<span class="badge-top-flotante">&#x2605; LA M&Aacute;S VENDIDA</span>' : '') +
          mediaHTML(p) +
          badgeHTML(p.badge) +
          '<h3>' + p.nombre + '</h3>' +
          '<div class="precio">' + formatearPrecio(p.precio) + '</div>' +
          '<div class="acciones">' +
            '<button type="button" class="btn-menos" data-accion="menos" data-id="' + p.id + '">-</button>' +
            '<span class="contador" data-id="' + p.id + '">0</span>' +
            '<button type="button" class="btn-agregar" data-accion="mas" data-id="' + p.id + '">Agregar</button>' +
          '</div>' +
          descHTML(p) +
        '</div>';
    });

    html += '</div>';
    cont.innerHTML = html;
    refrescarTarjetas();
  }

  function pintarMenuLateral() {
    var cont = document.getElementById('menu-lateral-lista');
    if (!cont || !menuData) return;
    var cats = menuData.categorias || {};
    var html = '<button type="button" class="menu-item activo" data-filtro="todos">Todos</button>';
    Object.keys(cats).forEach(function (slug) {
      var c = cats[slug] || {};
      var prods = (c.productos || []).filter(function (p) { return p.activo !== false; });
      if (prods.length === 0) return;
      html += '<button type="button" class="menu-item" data-filtro="' + slug + '">' + (c.titulo || slug) + '</button>';
    });
    html += '<button type="button" class="menu-item menu-item-compartir" data-accion="compartir">Compartir men&uacute;</button>';
    cont.innerHTML = html;
  }

  function aplicarFiltro(slug) {
    var prods = document.querySelectorAll('#lista-productos .producto');
    Array.prototype.forEach.call(prods, function (el) {
      var cat = el.getAttribute('data-cat');
      if (slug === 'todos' || cat === slug) el.classList.remove('oculto');
      else el.classList.add('oculto');
    });
    var items = document.querySelectorAll('#menu-lateral-lista .menu-item');
    Array.prototype.forEach.call(items, function (it) {
      if (it.getAttribute('data-filtro') === slug) it.classList.add('activo');
      else it.classList.remove('activo');
    });
    cerrarMenuLateral();
  }

  function abrirMenuLateral() {
    var m = document.getElementById('menu-lateral');
    var o = document.getElementById('menu-overlay');
    var b = document.getElementById('btn-hamburguesa');
    if (m) { m.classList.add('abierto'); m.setAttribute('aria-hidden','false'); }
    if (o) { o.classList.add('abierto'); o.setAttribute('aria-hidden','false'); }
    if (b) b.setAttribute('aria-expanded','true');
  }
  function cerrarMenuLateral() {
    var m = document.getElementById('menu-lateral');
    var o = document.getElementById('menu-overlay');
    var b = document.getElementById('btn-hamburguesa');
    if (m) { m.classList.remove('abierto'); m.setAttribute('aria-hidden','true'); }
    if (o) { o.classList.remove('abierto'); o.setAttribute('aria-hidden','true'); }
    if (b) b.setAttribute('aria-expanded','false');
  }
  function compartirMenu() {
    var url = window.location.origin + window.location.pathname.replace(/[^/]*$/, 'index.html');
    var texto = 'Mira el men\u00FA de Jilbert Burgers: ' + url;
    try {
      if (navigator.share) {
        navigator.share({ title: 'Jilbert Burgers', text: 'Mira el men\u00FA de Jilbert Burgers', url: url });
        return;
      }
    } catch (e) {}
    var w = window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
    if (!w) location.href = 'https://wa.me/?text=' + encodeURIComponent(texto);
  }

  function init() {
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    leerCarrito();

    var btnFlotante = document.getElementById('carrito-btn');
    if (btnFlotante) btnFlotante.addEventListener('click', abrirPanel);
    var btnCerrar = document.getElementById('carrito-cerrar');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarPanel);
    var btnVaciar = document.getElementById('carrito-vaciar');
    if (btnVaciar) btnVaciar.addEventListener('click', vaciar);
    var btnWa = document.getElementById('carrito-wa');
    if (btnWa) btnWa.addEventListener('click', enviarPorWhatsAppDirecto);
    var btnContado = document.getElementById('carrito-contado');
    if (btnContado) btnContado.addEventListener('click', abrirPanelContado);
    actualizarTextoBotonPago();
    var btnUpsellSi = document.getElementById('upsell-si');
    if (btnUpsellSi) btnUpsellSi.addEventListener('click', aceptarUpsell);
    var btnUpsellNo = document.getElementById('upsell-no');
    if (btnUpsellNo) btnUpsellNo.addEventListener('click', cerrarUpsell);
    var upsellModalEl = document.getElementById('upsell-modal');
    if (upsellModalEl) upsellModalEl.addEventListener('click', function (ev) { if (ev.target === upsellModalEl) cerrarUpsell(); });
    var btnShare = document.getElementById('compartir-btn');
    if (btnShare) btnShare.addEventListener('click', compartirMenu);
    var btnHamb = document.getElementById('btn-hamburguesa');
    if (btnHamb) btnHamb.addEventListener('click', abrirMenuLateral);
    var btnMenuCerrar = document.getElementById('menu-lateral-cerrar');
    if (btnMenuCerrar) btnMenuCerrar.addEventListener('click', cerrarMenuLateral);
    var overlayMenu = document.getElementById('menu-overlay');
    if (overlayMenu) overlayMenu.addEventListener('click', cerrarMenuLateral);
    var menuLista = document.getElementById('menu-lateral-lista');
    if (menuLista) {
      menuLista.addEventListener('click', function (ev) {
        var t = ev.target.closest ? ev.target.closest('button') : null;
        if (!t) return;
        var acc = t.getAttribute('data-accion');
        if (acc === 'compartir') { cerrarMenuLateral(); compartirMenu(); return; }
        var f = t.getAttribute('data-filtro');
        if (!f) return;
        aplicarFiltro(f);
      });
    }
    var listaCarrito = document.getElementById('carrito-lista');
    if (listaCarrito) {
      listaCarrito.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t.tagName !== 'BUTTON') return;
        var accion = t.getAttribute('data-accion');
        var id = t.getAttribute('data-id');
        if (!accion || !id) return;
        cambiarCantidad(id, accion === 'mas' ? 1 : -1);
      });
    }

    var listaProd = document.getElementById('lista-productos');
    if (listaProd) {
      listaProd.addEventListener('click', function (ev) {
        var card = ev.target.closest ? ev.target.closest('.producto') : null;
        if (!card) return;
        if (card.classList.contains('reel')) return;
        var id = card.getAttribute('data-id');
        var cat = card.getAttribute('data-cat');
        if (!id || !cat || !menuData) return;
        var prod = menuData.categorias[cat].productos.find(function (x) { return x.id === id; });
        if (!prod) return;
        if (ev.target.closest && ev.target.closest('.desc-detalle')) { return; }
        if (ev.target.classList && ev.target.classList.contains('btn-menos')) {
          if (cantidadDe(id) > 0) { cambiarCantidad(id, -1); animarTarjeta(card); }
          ev.stopPropagation();
          return;
        }
        agregar(prod);
        animarTarjeta(card);
      });
    }

    (window.MENU ? Promise.resolve(window.MENU) : fetch('assets/menu.json').then(function(r){return r.json()}))
      .then(function (data) {
        menuData = data;
        actualizarTextoBotonPago();
        aplicarNegocio();
        aplicarLogoPos();
        aplicarHero();
        pintarMenuLateral();

        if (esIndexPage()) {
          activarReelsEnIndex();
          pintarTodosLosProductosReels();
          var _contI = document.getElementById('lista-productos');
          if (_contI) _contI.scrollTop = 0;
        } else if (esCategoriaPage()) {
          activarModoReels();
          var catSlug = document.body.getAttribute('data-categoria');
          if (!catSlug) {
            try { catSlug = new URLSearchParams(window.location.search).get('cat'); } catch (e) {}
          }
          var tituloEl = document.getElementById('cat-titulo');
          if (tituloEl && catSlug && menuData.categorias[catSlug]) {
            tituloEl.textContent = menuData.categorias[catSlug].titulo || catSlug;
          }
          if (catSlug) pintarProductosReels(catSlug);
        } else {
          pintarTodosLosProductos();
        }
        pintarCarrito();
        refrescarTarjetas();
        if (esIndexPage()) {
          var _c = document.getElementById('lista-productos');
          if (_c) {
            _c.scrollTop = 0;
            requestAnimationFrame(function(){ _c.scrollTop = 0; });
            setTimeout(function(){ _c.scrollTop = 0; }, 50);
            setTimeout(function(){ _c.scrollTop = 0; }, 200);
          }
        }
      })
      .catch(function (err) {
        console.error('Error cargando menu.json', err);
        var cont = document.getElementById('lista-productos');
        if (cont) cont.innerHTML = '<p style="text-align:center;color:#D32F2F;">No se pudo cargar el men\u00FA. Recarga la p\u00E1gina.</p>';
      });

    pintarCarrito();
  }

  // ============================================================
  // MODO REELS (categoria.html)
  // ============================================================
  function esCategoriaPage() {
    if (document.body && document.body.hasAttribute('data-categoria')) return true;
    try { var params = new URLSearchParams(window.location.search); return !!params.get('cat'); }
    catch (e) { return false; }
  }
  function mediaItemsDe(p) {
    var items = [];
    if (p && Array.isArray(p.media) && p.media.length > 0) {
      items = p.media.filter(function (m) { return m && m.src; });
    }
    if (items.length === 0 && p && p.foto) { items = [{ tipo: 'foto', src: p.foto }]; }
    return items;
  }
  function mediaReelHTML(p) {
    var items = mediaItemsDe(p);
    if (items.length === 0) {
      return '<div class="reel-media-item placeholder" data-idx="0">' +
               '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
                 '<rect x="8" y="14" width="48" height="10" rx="5" fill="#FFC107"/>' +
                 '<rect x="8" y="27" width="48" height="10" rx="4" fill="#D32F2F"/>' +
                 '<rect x="8" y="40" width="48" height="10" rx="5" fill="#FFC107"/>' +
               '</svg>' +
             '</div>';
    }
    return items.map(function (m, i) {
      var src = String(m.src).replace(/"/g, '&quot;');
      if (m.tipo === 'video') {
        return '<div class="reel-media-item" data-idx="' + i + '"><video src="' + src + '" autoplay muted playsinline loop preload="metadata"></video></div>';
      }
      return '<div class="reel-media-item" data-idx="' + i + '"><img src="' + src + '" alt="' + (p.nombre || '') + '" loading="lazy"></div>';
    }).join('');
  }
  function dotsReelHTML(p) {
    var items = mediaItemsDe(p);
    if (items.length <= 1) return '';
    var html = '<div class="reel-dots">';
    for (var i = 0; i < items.length; i++) html += '<span class="reel-dot' + (i === 0 ? ' activo' : '') + '"></span>';

    html += '</div>';
    return html;
  }
  var sonidoActivado = false;
  function reelHTML(p, slug) {
    var bk = String(p.badge || '').toLowerCase();
    var bt = bk === 'nuevo' ? 'Nuevo' : (bk === 'top' ? 'Top' : (bk === 'promo' ? 'Promo' : ''));
    var desc = (p.desc || p.descripcion || '').toString();
    var cant = cantidadDe(p.id);
    return '' +
      '<div class="reel producto" data-id="' + p.id + '" data-cat="' + slug + '">' +
        (p._destacado ? '<span class="badge-top-flotante">\u2605 LA M\u00C1S VENDIDA</span>' : '') +
        '<div class="reel-media">' + mediaReelHTML(p) + '</div>' +
        (function(){ var items = mediaItemsDe(p); for (var k=0;k<items.length;k++){ if (items[k].tipo === 'video') { return '<button type="button" class="reel-sound-btn" data-accion="sonido" data-id="' + p.id + '" aria-label="Activar sonido">' + (sonidoActivado ? '\uD83D\uDD0A' : '\uD83D\uDD07') + '</button>'; } } return ''; })() +

        dotsReelHTML(p) +
        '<div class="reel-overlay"></div>' +
        '<div class="reel-info">' +
          (bt ? '<span class="reel-badge">' + bt + '</span>' : '') +
          '<h3 class="reel-nombre">' + (p.nombre || '') + '</h3>' +
          '<div class="reel-precio">' + formatearPrecio(p.precio) + '</div>' +
          (desc ? '<details class="reel-desc"><summary>Ver descripci\u00F3n</summary><p>' + desc + '</p></details>' : '') +
          '<div class="reel-acciones">' +
            '<button type="button" class="reel-btn-agregar" data-accion="mas" data-id="' + p.id + '"' + (cant > 0 ? ' style="display:none"' : '') + '>Agregar al pedido</button>' +
            '<div class="reel-contador' + (cant > 0 ? ' visible' : '') + '">' +
              '<button type="button" data-accion="menos" data-id="' + p.id + '">\u2212</button>' +
              '<span class="contador" data-id="' + p.id + '">' + cant + '</span>' +
              '<button type="button" data-accion="mas" data-id="' + p.id + '">+</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  function pintarProductosReels(categoria) {
    var cont = document.getElementById('lista-productos');
    if (!cont || !menuData) return;
    var cat = menuData.categorias[categoria];
    if (!cat) { cont.innerHTML = '<div class="reel-vacio"><h3>Categor\u00EDa no encontrada</h3></div>'; return; }
    var prods = (cat.productos || []).filter(function (p) { return p && p.activo !== false; });
    if (prods.length === 0) { cont.innerHTML = '<div class="reel-vacio"><h3>Pronto habr\u00E1 productos aqu\u00ED</h3></div>'; return; }
    cont.classList.add('reels');
    cont.innerHTML = prods.map(function (p, idx) {
      var _p = Object.assign({}, p, { _destacado: idx === 0 });
      return reelHTML(_p, categoria);
    }).join('');
    activarReels(cont);
  }
  function activarReels(cont) {
    Array.prototype.forEach.call(cont.querySelectorAll('.reel'), function (reel) {
      var media = reel.querySelector('.reel-media');
      var dots = reel.querySelectorAll('.reel-dot');
      if (media && dots.length > 1) {
        media.addEventListener('scroll', function () {
          var idx = Math.round(media.scrollLeft / media.clientWidth);
          Array.prototype.forEach.call(dots, function (d, i) {
            if (i === idx) d.classList.add('activo'); else d.classList.remove('activo');
          });
        }, { passive: true });
      }
    });
    if (typeof IntersectionObserver !== 'undefined') {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var vid = en.target.querySelector('video');
          if (!vid) return;
          if (en.isIntersecting && en.intersectionRatio > 0.6) { try { vid.muted = !sonidoActivado; vid.play().catch(function(){}); } catch (e) {} }
          else { try { vid.pause(); } catch (e) {} }
        });
      }, { threshold: [0, 0.6, 1] });
      Array.prototype.forEach.call(cont.querySelectorAll('.reel'), function (r) { obs.observe(r); });
    }
    activarScrollPorPagina(cont);
    if (!cont.dataset.reelListener) {
      cont.dataset.reelListener = '1';
      cont.addEventListener('click', function (ev) {
        var btn = ev.target.closest ? ev.target.closest('button[data-accion]') : null;
        if (!btn) return;
        var accion = btn.getAttribute('data-accion');
        var id = btn.getAttribute('data-id');
        if (!id || !accion) return;
        ev.stopPropagation();
        if (accion === 'mas') { var prod = buscarProductoPorId(id); if (prod) agregar(prod); }
        else if (accion === 'menos') { if (cantidadDe(id) > 0) cambiarCantidad(id, -1); }
        else if (accion === 'sonido') {
          sonidoActivado = !sonidoActivado;
          var reelBtn = btn.closest ? btn.closest('.reel') : null;
          if (reelBtn) {
            var vids = reelBtn.querySelectorAll('video');
            Array.prototype.forEach.call(vids, function(v){ v.muted = !sonidoActivado; if (sonidoActivado && v.paused) { try { v.play().catch(function(){}); } catch(e){} } });
          }
          Array.prototype.forEach.call(cont.querySelectorAll('.reel-sound-btn'), function(b){ b.textContent = sonidoActivado ? '\uD83D\uDD0A' : '\uD83D\uDD07'; b.setAttribute('aria-label', sonidoActivado ? 'Silenciar' : 'Activar sonido'); });
        }
      });
    }
  }
  function actualizarBotonesReel() {
    var cont = document.getElementById('lista-productos');
    if (!cont || !cont.classList.contains('reels')) return;
    Array.prototype.forEach.call(cont.querySelectorAll('.reel'), function (reel) {
      var id = reel.getAttribute('data-id');
      var cant = cantidadDe(id);
      var btnAdd = reel.querySelector('.reel-btn-agregar');
      var ctrl = reel.querySelector('.reel-contador');
      var span = reel.querySelector('.contador');
      if (span) span.textContent = cant;
      if (btnAdd) btnAdd.style.display = cant > 0 ? 'none' : '';
      if (ctrl) { if (cant > 0) ctrl.classList.add('visible'); else ctrl.classList.remove('visible'); }
    });
  }
  function activarModoReels() {
    if (!document.body) return;
    document.body.classList.add('modo-reels');
    if (!document.querySelector('.reels-back')) {
      var a = document.createElement('a');
      a.className = 'reels-back';
      a.href = 'index.html';
      a.textContent = '\u2190 Men\u00FA';
      document.body.appendChild(a);
    }
  }
  var _agregarOrig = agregar;
  agregar = function (prod) { _agregarOrig(prod); actualizarBotonesReel(); };
  var _cambiarOrig = cambiarCantidad;
  cambiarCantidad = function (id, delta) { _cambiarOrig(id, delta); actualizarBotonesReel(); };
  function pintarTodosReels() {
    var cont = document.getElementById('lista-productos');
    if (!cont || !menuData) return;
    var cats = menuData.categorias || {};
    var items = [];
    Object.keys(cats).forEach(function (slug) {
      var c = cats[slug] || {};
      var prods = (c.productos || []).filter(function (p) { return p && p.activo !== false; });
      prods.forEach(function (p) { items.push({ p: p, slug: slug }); });
    });
    items.sort(function (a, b) {
      var oa = (a.p.orden != null) ? Number(a.p.orden) : 9999;
      var ob = (b.p.orden != null) ? Number(b.p.orden) : 9999;
      return oa - ob;
    });
    if (items.length === 0) {
      cont.innerHTML = '<div class="reel-vacio"><h3>Pronto habr\u00E1 productos</h3></div>';
      return;
    }
    cont.classList.add('reels');
    cont.innerHTML = items.map(function (it) { return reelHTML(it.p, it.slug); }).join('');
    activarReels(cont);
    insertarPortadaEnContenedor();
    cont.scrollTop = 0;
  }
  function aplicarFiltroReels(slug) {
    var cont = document.getElementById('lista-productos');
    if (!cont) return;
    Array.prototype.forEach.call(cont.querySelectorAll('.reel'), function (el) {
      var cat = el.getAttribute('data-cat');
      if (slug === 'todos' || cat === slug) el.classList.remove('oculto');
      else el.classList.add('oculto');
    });
    var primero = cont.querySelector('.reel:not(.oculto)');
    if (primero) {
      cont.scrollTop = primero.offsetTop;
    }
  }
  // ============================================================
  // MODO REELS en index (todos los productos mezclados)
  // ============================================================
  function esIndexPage() {
    return !!(document.body && document.body.hasAttribute('data-vista'));
  }
  function pintarTodosLosProductosReels() {
    var cont = document.getElementById('lista-productos');
    if (!cont || !menuData) return;
    var cats = menuData.categorias || {};
    var items = [];
    Object.keys(cats).forEach(function (slug) {
      var c = cats[slug] || {};
      var prods = (c.productos || []).filter(function (p) { return p && p.activo !== false; });
      prods.forEach(function (p) { items.push({ p: p, slug: slug }); });
    });
    items.sort(function (a, b) {
      var oa = (a.p.orden != null) ? Number(a.p.orden) : 9999;
      var ob = (b.p.orden != null) ? Number(b.p.orden) : 9999;
      return oa - ob;
    });
    // Capturar portada ANTES de reescribir innerHTML
    var logoBanda = document.querySelector('.logo-banda');
    var hero = document.querySelector('.hero');
    var logoHTML = logoBanda ? logoBanda.outerHTML : '';
    var heroHTML = hero ? hero.outerHTML : '';
    if (logoBanda && logoBanda.parentNode) logoBanda.parentNode.removeChild(logoBanda);
    if (hero && hero.parentNode) hero.parentNode.removeChild(hero);
    var htmlPortada = '';
    if (logoHTML) {
      var tmp = document.createElement('div');
      tmp.innerHTML = logoHTML;
      var lbx = tmp.querySelector('.logo-banda');
      if (lbx) lbx.removeAttribute('style');
      htmlPortada += '<div class="reel portada-logo">' + tmp.innerHTML + '</div>';
    }
    var _h = (menuData && menuData.hero) ? menuData.hero : null;
    if (_h && (typeof _h.titulo === 'string' || typeof _h.subtitulo === 'string')) {
      var _tit = (typeof _h.titulo === 'string') ? _h.titulo : '';
      var _sub = (typeof _h.subtitulo === 'string') ? _h.subtitulo : '';
      htmlPortada += '<div class="reel portada-hero">'
        + '<div class="hero-inner">'
        + '<h1>' + _tit + '</h1>'
        + '<p>' + _sub + '</p>'
        + '</div>'
        + '</div>';
    }

    if (items.length === 0 && !htmlPortada) {
      cont.innerHTML = '<div class="reel-vacio"><h3>Pronto habr\u00E1 productos aqu\u00ED</h3></div>';
      return;
    }
    cont.classList.add('reels');
    cont.innerHTML = htmlPortada + items.map(function (it, idx) {
      var _p = Object.assign({}, it.p, { _destacado: idx === 0 });
      return reelHTML(_p, it.slug);
    }).join('');
    activarReels(cont);
    cont.scrollTop = 0;
  }
  var _aplicarFiltroOrig = aplicarFiltro;
  aplicarFiltro = function (slug) {
    var cont = document.getElementById('lista-productos');
    if (cont && cont.classList.contains('reels')) {
      // Ocultar portadas (logo/hero) cuando se filtra por categoría
      Array.prototype.forEach.call(cont.querySelectorAll('.reel.portada-logo, .reel.portada-hero'), function (el) {
        if (slug === 'todos') el.style.removeProperty('display');
        else el.style.setProperty('display', 'none', 'important');
      });
      // Mostrar/ocultar productos por categoría
      Array.prototype.forEach.call(cont.querySelectorAll('.reel[data-cat]'), function (el) {
        var cat = el.getAttribute('data-cat');
        if (slug === 'todos' || cat === slug) el.style.removeProperty('display');
        else el.style.setProperty('display', 'none', 'important');
      });
      // Marcar activo en menú lateral
      var items = document.querySelectorAll('#menu-lateral-lista .menu-item');
      Array.prototype.forEach.call(items, function (it) {
        if (it.getAttribute('data-filtro') === slug) it.classList.add('activo');
        else it.classList.remove('activo');
      });
      cerrarMenuLateral();
      // Scroll al primer reel visible (robusto frente a scroll-snap)
      var visibles = Array.prototype.slice.call(cont.querySelectorAll('.reel')).filter(function (r) {
        return r.offsetParent !== null;
      });
      var primero = visibles.length > 0 ? visibles[0] : null;
      var snapPrevio = cont.style.scrollSnapType;
      cont.style.scrollSnapType = 'none';
      if (primero) {
        try { primero.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) {}
        cont.scrollTop = primero.offsetTop;
      } else {
        cont.scrollTop = 0;
      }
      requestAnimationFrame(function () {
        if (primero) {
          try { primero.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) {}
          cont.scrollTop = primero.offsetTop;
        } else {
          cont.scrollTop = 0;
        }
        requestAnimationFrame(function () { cont.style.scrollSnapType = snapPrevio || ''; });
      });
      return;
    }
    _aplicarFiltroOrig(slug);
  };
  function activarReelsEnIndex() {
    activarModoReels();
    document.body.classList.add('reels-index');
    var pie = document.querySelector('.pie');
    if (pie) pie.style.display = 'none';
    insertarPortadaEnContenedor();
  }

  function insertarPortadaEnContenedor() { /* neutralizada: la portada se prepende en pintarTodosLosProductosReels */ }
  // Scroll por página: un gesto de rueda = un reel completo
  function activarScrollPorPagina(cont) {
    if (!cont || cont.__wheelBound) return;
    cont.__wheelBound = true;
    var bloqueado = false;
    cont.addEventListener('wheel', function (ev) {
      if (ev.ctrlKey) return;
      var target = ev.target.closest ? ev.target.closest('.reel-media') : null;
      if (target && Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return;
      ev.preventDefault();
      if (bloqueado) return;
      var reels = Array.prototype.slice.call(cont.querySelectorAll('.reel')).filter(function (r) {
        return r.style.display !== 'none';
      });
      if (reels.length === 0) return;
      var idxActual = 0, minDist = Infinity;
      for (var i = 0; i < reels.length; i++) {
        var d = Math.abs(reels[i].getBoundingClientRect().top);
        if (d < minDist) { minDist = d; idxActual = i; }
      }
      var dir = ev.deltaY > 0 ? 1 : -1;
      var nuevo = Math.max(0, Math.min(reels.length - 1, idxActual + dir));
      if (nuevo === idxActual) return;
      bloqueado = true;
      cont.scrollTo({ top: reels[nuevo].offsetTop, behavior: 'smooth' });
      setTimeout(function () { bloqueado = false; }, 450);
    }, { passive: false });
  }
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  })();





