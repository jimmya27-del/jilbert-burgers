# CONTINUIDAD - JILBERT BURGERS

## Estado actual
FASE 7-C CERRADA (panel de pago en el carrito) - verificada en local
y en produccion (GitHub Pages).
FASE 7-D ACTIVA (WhatsApp con dos mensajes distintos).

## Stack y entorno
- HTML5 + CSS3 + JS puro. Sin frameworks, sin build, sin backend, sin CDN.
- Hosting: GitHub Pages (repo jimmya27-del/jilbert-burgers, rama main).
- Consola: PowerShell (Windows). Ruta local: C:\jilbert_burgers
- Admin: admin.html (GitHub API + PAT en localStorage).
- Lectura publica: assets/menu.json via fetch.
- CRLF. UTF-8 sin BOM.
- Regla 8: todo script PowerShell termina con Set-Clipboard.

## REGLA DE CIERRE DE FASE (ACTUALIZADA 2026-10-11)
Una fase NO se considera cerrada hasta cumplir LAS TRES:
  1. El director verifica manualmente en local que la tarea funciona.
  2. Los cambios se suben a GitHub:
       git add <archivos>
       git commit -m "<mensaje>"
       git push origin main
  3. El director verifica manualmente en la URL publicada de GitHub
     Pages que la tarea funciona (Ctrl+F5).
Si alguna de las tres falla, la fase sigue ABIERTA. NO se avanza a
la siguiente fase con una fase previa sin verificar en produccion.
Esta regla REEMPLAZA la anterior de "NO pusheado" para cierres de fase.

## Historico cerrado
- IA 1..6 [CERRADA]
- FASE 6-bis - Logica escala/posicion del logo [CERRADA]
- FASE 7-A - Migracion aditiva menu.json [CERRADA]
  .negocio: moneda "EUR", tasa_bcv 0, descuento_contado 10,
  pago { pago_movil, transferencia, instrucciones }.
- FASE 7-B - Render carrito moneda + tasa + Bs [CERRADA]
  script.js +1378, style.css +513. Funciones simboloMoneda(),
  monedaActual(), tasaActual(), equivalenteBsHTML(). Bloque
  #carrito-total-bs dentro de pintarCarrito().
- FASE 7-C - Panel de pago en el carrito [CERRADA - 2026-10-11]
  Commits:
    8834d5e  Fase 7-C: panel de pago en carrito + migracion 7-A menu.json
             (index.html, assets/script.js, assets/style.css)
    93bf294  Fase 7-C: panel de pago en el carrito (index + categoria)
             (categoria.html - 24 insertions, 1 deletion)
  Rama main alineada con origin/main en 93bf294.
  Backups .bak-7c:
    assets/script.js.bak-7c-20261011-163054
    assets/style.css.bak-7c-20261011-163054
    index.html.bak-7c-20261011-163054
    categoria.html.bak-7c-cat-20261011-172052
  Tamanos finales:
    index.html             4390 bytes
    categoria.html         3655 bytes
    assets/script.js      23400 bytes
    assets/style.css      20517 bytes
  Contenido de la fase:
    index.html: boton #carrito-enviar dice "Finalizar pedido";
    nuevo bloque #carrito-pago-panel con total, dos caminos
    (#pago-camino-contado / #pago-camino-credito), #pago-datos,
    #pago-instrucciones y #pago-confirmar disabled.
    categoria.html: mismo bloque HTML portado.
    assets/script.js: caminoPago, descuentoContado(), pagoConfig(),
    totalCarrito(), totalSegunCamino(), abrirPanelPago(),
    cerrarPanelPago(), seleccionarCamino(), renderPago().
    Listener de #carrito-enviar cambiado a abrirPanelPago.
    enviarWhatsApp() quedo INTACTA (para 7-D).
    assets/style.css: .carrito-pago-panel y .pago-*.

## Pendiente heredado de IA 6 (no bloqueante)
- Campo editable "imagen de categoria" en admin.html (Opcion X).

## Lecciones de proceso (7-C)
- Hay DOS archivos HTML que comparten el carrito: index.html y
  categoria.html. Cualquier cambio al carrito debe aplicarse en AMBOS
  antes de dar la fase por cerrada. El sintoma tipico fue: en la
  pantalla principal se veia el boton nuevo ("Finalizar pedido") pero
  al entrar a una categoria el boton volvia a "Enviar pedido por
  WhatsApp" porque categoria.html tenia su propio carrito con HTML
  duplicado.
- En PowerShell pegado en consola, un `return` de nivel superior NO
  aborta el resto del paste. Para abortos reales usar `exit` o envolver
  el bloque en & { ... }. Aplicar en 7-D en adelante.
- No estimar rangos de tamano "a ojo": medir el bloque real antes de
  fijar el limite superior.
- Archivos sueltos en la raiz del repo (style.css untracked): ignorar
  o borrar, no forman parte del flujo.

## Plan de fases
- FASE 7-A .. 7-C [CERRADAS]
- FASE 7-D - WhatsApp con dos mensajes distintos [ACTIVA]
- FASE 7-E - Admin editable: moneda + tasa + descuento
- FASE 7-F - Admin editable: datos de pago
- FASE 8   - Cambio de USD a EUR en render publico

## Reglas duras vigentes
- NO frameworks, NO build, NO backend, NO Node, NO CDN.
- NO avanzar sin OK de verificacion tras cada script.
- Un mensaje = un bloque ejecutable. Esperar confirmacion.
- Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
- NO asumir datos del negocio. Preguntar.
- TODO dinamico desde menu.json. Nada hardcodeado. En particular:
  descuento_contado, pago.*, instrucciones, moneda y tasa_bcv se
  leen de .negocio. El admin es el unico que escribe.
- Backups .bak-<paso> antes de tocar cualquier archivo.
- Verificar tamano de entrada antes de editar.
- Reemplazos sobre strings unicos (count == 1). Si != 1, NO escribir.
- Validar tamano de salida en rango antes de escribir.
  Reportar ESCRITO OK o NO ESCRITO.
- CRLF: usar `r`n. Encoding UTF8 sin BOM explicito.
- Git: 'git status -sb' antes de push. Si behind:
  'git pull --rebase origin main'. Sucios: 'git stash push -u',
  rebase, push, 'git stash pop'. Conflicto en menu.json: NO pushear,
  pedir al director.
- Regla 8: TODO script termina con Set-Clipboard / copy().
- NO crear ni leer archivos de prompt en _sesion.
- AL CERRAR FASE: reescribir continuidad.md Y entregar prompt de
  traspaso con seccion "TU TAREA EN ESTE CHAT".
