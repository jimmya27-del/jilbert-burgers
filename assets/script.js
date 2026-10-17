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
        '<label>Referencia del pago<input type="text" id="pago-referencia"></label>' +
        '<button type="submit" class="btn-wa" id="pago-enviar">Consultar por WhatsApp</button>' +
      '</form>';
    aside.appendChild(div);
    var form = div.querySelector('#pago-form');
    if (form) form.addEventListener('submit', function (ev) { ev.preventDefault(); enviarContado(); });
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
    if (opciones.referencia) lineas.push('*Referencia:* ' + opciones.referencia);
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
      referencia: ref
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
        '<div class="producto" data-id="' + p.id + '" data-cat="' + categoria + '">' +
          mediaHTML(p) +
          badgeHTML(p.badge) +
          '<h3>' + p.nombre + '</h3>' +
          '<div class="precio">' + formatearPrecio(p.precio) + '</div>' +
          '<div class="acciones">' +
            '<button type="button" class="btn-menos" data-accion="menos" data-id="' + p.id + '">-</button>' +
            '<span class="contador" data-id="' + p.id + '">0</span>' +
            '<button type="button" class="btn-agregar" data-accion="mas" data-id="' + p.id + '">Agregar</button>' +
          '</div>' +
          '<p class="desc">' + p.desc + '</p>' +
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

  var UPSELL_STORAGE_KEY = 'jilbert_upsell_visto_v1';
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

  function upsellYaVisto() {
    try { return sessionStorage.getItem(UPSELL_STORAGE_KEY) === '1'; } catch (e) { return false; }
  }

  function marcarUpsellVisto() {
    try { sessionStorage.setItem(UPSELL_STORAGE_KEY, '1'); } catch (e) {}
  }

  function cerrarUpsell() {
    var m = document.getElementById('upsell-modal');
    if (!m) return;
    m.classList.remove('abierto');
    m.setAttribute('aria-hidden', 'true');
    _upsellProductoActual = null;
    marcarUpsellVisto();
  }

  function intentarAbrirUpsell() {
    if (!menuData) return;
    var upId = menuData.upsell_id;
    if (!upId || typeof upId !== 'string') return;
    if (upsellYaVisto()) return;
    if (!carrito || carrito.length === 0) return;
    var yaEnCarrito = carrito.some(function (it) { return it.id === upId; });
    if (yaEnCarrito) return;
    var prod = buscarProductoPorId(upId);
    if (!prod) return;
    if (prod.activo === false) return;
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
        '<div class="producto' + (esDestacado ? ' destacado' : '') + '" data-id="' + p.id + '" data-cat="' + item.slug + '">' +
          (esDestacado ? '<span class="badge-top-flotante">&#x2605; MAS VENDIDO</span>' : '') +
          mediaHTML(p) +
          badgeHTML(p.badge) +
          '<h3>' + p.nombre + '</h3>' +
          '<div class="precio">' + formatearPrecio(p.precio) + '</div>' +
          '<div class="acciones">' +
            '<button type="button" class="btn-menos" data-accion="menos" data-id="' + p.id + '">-</button>' +
            '<span class="contador" data-id="' + p.id + '">0</span>' +
            '<button type="button" class="btn-agregar" data-accion="mas" data-id="' + p.id + '">Agregar</button>' +
          '</div>' +
          '<p class="desc">' + p.desc + '</p>' +
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
        var id = card.getAttribute('data-id');
        var cat = card.getAttribute('data-cat');
        if (!id || !cat || !menuData) return;
        var prod = menuData.categorias[cat].productos.find(function (x) { return x.id === id; });
        if (!prod) return;
        if (ev.target.classList && ev.target.classList.contains('btn-menos')) {
          if (cantidadDe(id) > 0) { cambiarCantidad(id, -1); animarTarjeta(card); }
          ev.stopPropagation();
          return;
        }
        agregar(prod);
        animarTarjeta(card);
      });
    }

    fetch('assets/menu.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        menuData = data;
        aplicarNegocio();
        aplicarLogoPos();
        aplicarHero();
        pintarTodosLosProductos();
        pintarMenuLateral();
        var cat = document.body.getAttribute('data-categoria');
        if (!cat) {
          try {
            var params = new URLSearchParams(window.location.search);
            cat = params.get('cat');
          } catch (e) { cat = null; }
        }
        if (cat) {
          var tituloEl = document.getElementById('cat-titulo');
          if (tituloEl && menuData.categorias[cat]) {
            tituloEl.textContent = menuData.categorias[cat].titulo || cat;
          }
          pintarProductos(cat);
        }
        pintarCarrito();
        refrescarTarjetas();
      })
      .catch(function (err) {
        console.error('Error cargando menu.json', err);
        var cont = document.getElementById('lista-productos');
        if (cont) cont.innerHTML = '<p style="text-align:center;color:#D32F2F;">No se pudo cargar el men\u00FA. Recarga la p\u00E1gina.</p>';
      });

    pintarCarrito();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
