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

  function formatearPrecio(n) {
    var sim = (menuData && menuData.simbolo) ? menuData.simbolo : '$';
    return sim + Number(n).toFixed(2);
  }
  function totalItems() { return carrito.reduce(function (s, it) { return s + it.cantidad; }, 0); }
  function totalPrecio() { return carrito.reduce(function (s, it) { return s + it.cantidad * it.precio; }, 0); }

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
    if (totalEl) totalEl.textContent = formatearPrecio(totalPrecio());
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
          '<p class="desc">' + p.desc + '</p>' +
          '<div class="precio">' + formatearPrecio(p.precio) + '</div>' +
          '<div class="acciones">' +
            '<button type="button" class="btn-menos" data-accion="menos" data-id="' + p.id + '">-</button>' +
            '<span class="contador" data-id="' + p.id + '">0</span>' +
            '<button type="button" class="btn-agregar" data-accion="mas" data-id="' + p.id + '">Agregar</button>' +
          '</div>' +
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

  function abrirPanel() { var p = document.getElementById('carrito-panel'); if (p) p.classList.add('abierto'); }
  function cerrarPanel() { var p = document.getElementById('carrito-panel'); if (p) p.classList.remove('abierto'); }

  function enviarWhatsApp() {
    if (carrito.length === 0) { alert('El carrito est\u00E1 vac\u00EDo.'); return; }
    var nombre = prompt('\u00BFTu nombre?');
    if (nombre === null) return;
    var nota = prompt('Direcci\u00F3n o nota para el pedido (opcional):');
    if (nota === null) nota = '';
    var lineas = [];
    lineas.push('*Pedido Jilbert Burgers*');
    lineas.push('');
    carrito.forEach(function (it) {
      lineas.push('\u2022 ' + it.cantidad + ' x ' + it.nombre + ' = ' + formatearPrecio(it.precio * it.cantidad));
    });
    lineas.push('');
    lineas.push('*Total:* ' + formatearPrecio(totalPrecio()));
    if (nombre) lineas.push('*Cliente:* ' + nombre);
    if (nota)   lineas.push('*Direcci\u00F3n/Nota:* ' + nota);
    var num = (menuData && menuData.whatsapp) ? menuData.whatsapp : '584124409025';
    var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(lineas.join('\n'));
    window.open(url, '_blank');
  }

  function init() {
    leerCarrito();

    var btnFlotante = document.getElementById('carrito-btn');
    if (btnFlotante) btnFlotante.addEventListener('click', abrirPanel);
    var btnCerrar = document.getElementById('carrito-cerrar');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarPanel);
    var btnVaciar = document.getElementById('carrito-vaciar');
    if (btnVaciar) btnVaciar.addEventListener('click', vaciar);
    var btnEnviar = document.getElementById('carrito-enviar');
    if (btnEnviar) btnEnviar.addEventListener('click', enviarWhatsApp);

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
        var cat = document.body.getAttribute('data-categoria');
        if (cat) pintarProductos(cat);
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
