/* ============================================================
   Jilbert Burgers - script.js
   Carrito (localStorage) + render de productos + WhatsApp
   ============================================================ */

(function () {
  'use strict';

  var CLAVE_CARRITO = 'jilbert_carrito_v1';
  var carrito = [];
  var menuData = null;

  // ---------- Utilidades ----------
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
    return '$' + Number(n).toFixed(2);
  }

  function totalItems() {
    return carrito.reduce(function (s, it) { return s + it.cantidad; }, 0);
  }

  function totalPrecio() {
    return carrito.reduce(function (s, it) { return s + it.cantidad * it.precio; }, 0);
  }

  // ---------- Carrito ----------
  function agregar(producto) {
    var idx = carrito.findIndex(function (it) { return it.id === producto.id; });
    if (idx >= 0) {
      carrito[idx].cantidad += 1;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1
      });
    }
    guardarCarrito();
    pintarCarrito();
  }

  function cambiarCantidad(id, delta) {
    var idx = carrito.findIndex(function (it) { return it.id === id; });
    if (idx < 0) return;
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    guardarCarrito();
    pintarCarrito();
  }

  function vaciar() {
    if (carrito.length === 0) return;
    if (!confirm('\u00BFVaciar todo el carrito?')) return;
    carrito = [];
    guardarCarrito();
    pintarCarrito();
  }

  // ---------- Render del carrito ----------
  function pintarCarrito() {
    // Badge
    var badge = document.getElementById('carrito-badge');
    if (badge) {
      var n = totalItems();
      badge.textContent = n;
      badge.style.display = n > 0 ? 'flex' : 'none';
    }

    // Lista
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

  // ---------- Render de productos ----------
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
        '<div class="producto">' +
          '<div class="emoji">' + (p.emoji || '\uD83C\uDF54') + '</div>' +
          '<h3>' + p.nombre + '</h3>' +
          '<p class="desc">' + p.desc + '</p>' +
          '<div class="precio">' + formatearPrecio(p.precio) + '</div>' +
          '<button data-id="' + p.id + '" data-cat="' + categoria + '">Agregar</button>' +
        '</div>';
    }).join('');

    // Listeners
    cont.querySelectorAll('button[data-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var cat2 = btn.getAttribute('data-cat');
        var prod = menuData.categorias[cat2].productos.find(function (x) { return x.id === id; });
        if (prod) {
          agregar(prod);
          // Feedback visual
          btn.textContent = '\u00A1Agregado!';
          btn.style.background = '#2E7D32';
          setTimeout(function () {
            btn.textContent = 'Agregar';
            btn.style.background = '';
          }, 700);
        }
      });
    });
  }

  // ---------- Panel del carrito ----------
  function abrirPanel() {
    var panel = document.getElementById('carrito-panel');
    if (panel) panel.classList.add('abierto');
  }
  function cerrarPanel() {
    var panel = document.getElementById('carrito-panel');
    if (panel) panel.classList.remove('abierto');
  }

  // ---------- WhatsApp ----------
  function enviarWhatsApp() {
    if (carrito.length === 0) {
      alert('El carrito est\u00E1 vac\u00EDo.');
      return;
    }
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

  // ---------- Init ----------
  function init() {
    leerCarrito();

    // Boton flotante
    var btnFlotante = document.getElementById('carrito-btn');
    if (btnFlotante) btnFlotante.addEventListener('click', abrirPanel);

    // Botones de cerrar / vaciar / enviar
    var btnCerrar = document.getElementById('carrito-cerrar');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarPanel);

    var btnVaciar = document.getElementById('carrito-vaciar');
    if (btnVaciar) btnVaciar.addEventListener('click', vaciar);

    var btnEnviar = document.getElementById('carrito-enviar');
    if (btnEnviar) btnEnviar.addEventListener('click', enviarWhatsApp);

    // Delegacion en lista del carrito (+ / -)
    var lista = document.getElementById('carrito-lista');
    if (lista) {
      lista.addEventListener('click', function (ev) {
        var t = ev.target;
        if (t.tagName !== 'BUTTON') return;
        var accion = t.getAttribute('data-accion');
        var id = t.getAttribute('data-id');
        if (!accion || !id) return;
        cambiarCantidad(id, accion === 'mas' ? 1 : -1);
      });
    }

    // Cargar menu.json
    fetch('assets/menu.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        menuData = data;
        var cat = document.body.getAttribute('data-categoria');
        if (cat) pintarProductos(cat);
        pintarCarrito();
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
