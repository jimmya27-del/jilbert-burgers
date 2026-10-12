# CONTINUIDAD - JILBERT BURGERS

## FASE ACTIVA: 7-E (Admin editable: moneda + tasa + descuento)
## ULTIMA FASE CERRADA: 7-D (2026-10-12)

---

## ESTADO ACTUAL

Stack: HTML5 + CSS3 + JS puro. Sin frameworks, sin build, sin backend, sin CDN.
Hosting: GitHub Pages (repo jimmya27-del/jilbert-burgers, rama main).
Local: C:\jilbert_burgers
Admin: admin.html (lee/escribe menu.json via GitHub API con PAT en localStorage).
Web publica: index.html + categoria.html (render dinamico por slug via ?cat=).
Lectura de datos: assets/menu.json con fetch.
CRLF. Encoding UTF-8 sin BOM en escrituras.

---

## HISTORICO RESUMIDO (CERRADO)

IA 1 .. IA 6                                     [CERRADA]
FASE 6-bis - Logica escala/posicion del logo     [CERRADA]
FASE 7-A - Migracion aditiva de menu.json        [CERRADA]
  .negocio extendido: moneda "EUR", tasa_bcv 0,
  descuento_contado 10, pago { pago_movil, transferencia, instrucciones }.
FASE 7-B - Render carrito con moneda + tasa + Bs [CERRADA]
  simboloMoneda(), monedaActual(), tasaActual(),
  equivalenteBsHTML(), bloque #carrito-total-bs.
FASE 7-C - Panel de pago en el carrito            [CERRADA]
  Boton #carrito-enviar + bloque #carrito-pago-panel en index.html
  Y categoria.html. Funciones en script.js: caminoPago,
  descuentoContado(), pagoConfig(), totalCarrito(),
  totalSegunCamino(), abrirPanelPago(), cerrarPanelPago(),
  seleccionarCamino(), renderPago().
FASE 7-D - WhatsApp con dos mensajes distintos    [CERRADA 2026-10-12]
  Commit: fa46b3d "7-D: WhatsApp con dos mensajes distintos".
  Backups: .bak-7d-20261012-122328 (los 3 archivos),
           .bak-7d-fix-20261012-131940 (script.js, fix popup).
  Script.js:
    - enviarWhatsApp() -> enviarWhatsApp(camino) con cabecera
      condicional ("Ya pague, adjunto comprobante" vs "Pago al
      recibir, precio normal") y total via totalSegunCamino()
      (con/sin descuento).
    - renderPago() actualiza textContent de #pago-confirmar
      segun caminoPago ("Ya pague - enviar pedido" vs
      "Enviar pedido, pago al recibir").
    - init() agrega listener de #pago-confirmar que llama
      enviarWhatsApp(caminoPago) + cerrarPanelPago().
    - window.open con fallback location.href si popup bloqueado.
  index.html y categoria.html:
    - #pago-confirmar habilitado (sin disabled, sin title).
  Verificado en local y en GitHub Pages (Ctrl+F5):
    - Contado: (10% OFF), total con descuento, cabecera correcta.
    - Credito: total sin descuento, cabecera correcta.
    - descuento_contado = 0 (con backup+restore de menu.json):
      etiqueta (0% OFF) y total igual al de credito.
  menu.json quedo byte-identico (218869 bytes, descuento=10).

PENDIENTE HEREDADO DE IA 6 (trabajo nuevo, no bloqueante):
- Campo editable "imagen de categoria" en admin.html (Opcion X).

---

## REGLA DURA: TODO DINAMICO DESDE EL ADMIN

Ningun dato de negocio hardcodeado. Todo se lee de menu.json:
moneda, tasa_bcv, descuento_contado, pago.*, instrucciones.
La web publica y el carrito SOLO LEEN. El admin es el unico que
escribe (via GitHub API con PAT).

---

## REGLAS DE CIERRE DE FASE (VIGENTES)

Una fase NO se considera cerrada hasta cumplir LAS TRES:
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (git add + commit + push origin main).
  3. Director verifica en la URL publicada de GitHub Pages con Ctrl+F5.

Reglas operativas:
- Backups .bak-<paso> antes de tocar cualquier archivo.
- Reemplazos con -replace sobre strings unicos (count == 1).
  Si != 1: NO escribir y reportar.
- Validar tamano de salida dentro de rango (medir bloque real).
- Reportar ESCRITO OK / NO ESCRIBIR.
- CRLF: `r`n. Encoding UTF-8 sin BOM explicito.
- Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
- CRITICO: categoria.html tiene su propio bloque carrito duplicado.
  Toda fase que toque el carrito debe actualizar AMBAS paginas.
- TODO script (PowerShell, JS consola) DEBE terminar con autocopiado
  al portapapeles (Set-Clipboard / copy()). Regla 8.
- Un mensaje = un bloque ejecutable. Esperar OK del director.
- No crear ni leer archivos de prompt en _sesion.

---

## PLAN DE FASES

FASE 7-A - Migracion aditiva menu.json             [CERRADA]
FASE 7-B - Render carrito moneda + tasa + Bs       [CERRADA]
FASE 7-C - Panel de pago en el carrito             [CERRADA]
FASE 7-D - WhatsApp con dos mensajes distintos     [CERRADA]
FASE 7-E - Admin editable: moneda + tasa + descuento [ACTIVA]
FASE 7-F - Admin editable: datos de pago
FASE 8   - Cambio de USD a EUR en render publico

---

## PROXIMA FASE: 7-E

Objetivo: en admin.html, seccion "Configuracion de venta" con
selector moneda, input tasa BCV, input % descuento contado.
Lee y escribe .negocio.moneda, .negocio.tasa_bcv,
.negocio.descuento_contado via GitHub API con PAT.

Este es el modulo que permitira al negocio cambiar el descuento
contado (hoy 10%) SIN tocar codigo ni menu.json a mano.

Archivos que TOCA: admin.html (probablemente tambien admin.js
o similar si existe). NO toca: index.html, categoria.html,
assets/script.js, assets/menu.json (el admin lo escribe via API,
no via disco local).

---

FIN DE CONTINUIDAD - ACTUALIZADO 2026-10-12 (cierre 7-D)