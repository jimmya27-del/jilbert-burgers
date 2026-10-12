# CONTINUIDAD - JILBERT BURGERS

## FASE ACTIVA: 7-F (Admin editable: datos de pago)
## ULTIMA FASE CERRADA: 7-E (2026-10-12)

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

FASE 7-E - Admin editable: moneda + tasa + descuento [CERRADA 2026-10-12]
  Commit: 25b0eee "7-E: admin editable moneda + tasa_bcv + descuento_contado".
  Backup: admin.html.bak-7e-paso1-20261012-143507 (68711 bytes).
  admin.html:
    - 3 nuevos inputs en seccion "Datos del negocio":
        data-negocio="moneda"            (text, uppercase, maxlength 8,
                                          placeholder: codigo ISO)
        data-negocio="tasa_bcv"          (number, min 0, step 0.01)
        data-negocio="descuento_contado" (number, min 0, max 100, step 1)
    - guardarNegocio() extendido: lee los 3 inputs, valida
      (moneda vacia -> fallback a menuCache.negocio.moneda o 'EUR';
      tasa -> Number(), clamp >=0; descuento -> Number(), clamp 0..100),
      y fusiona via Object.assign({}, menuCache.negocio, {...}).
      Preserva pago, logo_pos, logo, whatsapp, direccion, facebook, correo.
  NO toco: index.html, categoria.html, assets/script.js, assets/menu.json.
  NO toco WhatsApp ni datos de pago (eso es 7-F).
  menu.json al cierre: moneda="USD", tasa_bcv=40, descuento_contado=15
    (vienen del commit deae620 "admin: actualizar menu.json", pusheado
    en paralelo desde otra sesion; integrado con fast-forward sin conflictos).
  Verificado en local y en GitHub Pages (Ctrl+F5):
    - SHA256 admin.html local == remoto (68711 bytes).
    - 3 campos visibles, editables y persistidos.
  Nota menor detectada (NO se toca en 7-E): el fallback de moneda difiere
    entre admin.html ('EUR') y assets/script.js ('USD'). Solo aplica si
    negocio.moneda esta vacio. Resolver en FASE 8 (USD->EUR).

PENDIENTE HEREDADO DE IA 6 (trabajo nuevo, no bloqueante):
- Campo editable "imagen de categoria" en admin.html (Opcion X).

---

## REGLA DURA: TODO DINAMICO DESDE EL ADMIN

Ningun dato de negocio hardcodeado. Todo se lee de menu.json:
moneda, tasa_bcv, descuento_contado, pago.*, instrucciones.
La web publica y el carrito SOLO LEEN. El admin es el unico que
escribe (via GitHub API con PAT).

---

## REGLA NUEVA (2026-10-12) - DIAGNOSTICO PREVIO OBLIGATORIO

Todo prompt de reenganche o traspaso debe incluir como PRIMERA
tarea un diagnostico del entorno y del estado real en disco y en
el remoto:
  - git status -sb
  - git log local vs origin/main (fetch + rev-parse + diff --stat)
  - tamanos de los archivos criticos
  - valores reales en assets/menu.json (negocio.*)
  - estado del working tree (M / untracked / stash)
Sin ese diagnostico confirmado por el director, NO se modifica
ningun archivo. Aplica a toda fase futura.

---

## REGLA DE TRASPASO

Al cerrar cada fase:
  1. Reescribir continuidad.md (ESTADO, HISTORICO, PLAN, PROXIMA FASE).
  2. Entregar en el chat el PROMPT DE TRASPASO de la fase siguiente,
     CON SECCION "TU TAREA EN ESTE CHAT" explicita y como PRIMERA
     seccion despues de la cabecera.
Esa seccion debe indicar, como minimo:
  - Diagnostico previo obligatorio (Regla 2026-10-12).
  - Objetivo de la fase (una linea).
  - Alcance: que SI tocar y que NO tocar.
  - Condiciones de cierre (3 condiciones vigentes).

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
- PROHIBIDO DevTools / F12. Verificacion tecnica con PowerShell
  sobre el codigo en disco o via Invoke-WebRequest a Pages.

---

## PLAN DE FASES

FASE 7-A - Migracion aditiva menu.json               [CERRADA]
FASE 7-B - Render carrito moneda + tasa + Bs         [CERRADA]
FASE 7-C - Panel de pago en el carrito               [CERRADA]
FASE 7-D - WhatsApp con dos mensajes distintos       [CERRADA]
FASE 7-E - Admin editable: moneda + tasa + descuento [CERRADA]
FASE 7-F - Admin editable: datos de pago             [ACTIVA]
FASE 8   - Cambio de USD a EUR en render publico

---

## PROXIMA FASE: 7-F

Objetivo: en admin.html, hacer editables los datos de pago:
  .negocio.pago.pago_movil.{banco, telefono, cedula, titular}
  .negocio.pago.transferencia.{banco, cuenta, tipo, cedula, titular}
  .negocio.pago.instrucciones

Lee y escribe en menu.json via GitHub API con PAT. Mismo patron que 7-E:
  - Nuevos inputs en la seccion de negocio (o nueva seccion "Datos de pago").
  - Handler guardarNegocio() extendido con Object.assign anidado,
    respetando la forma actual de .negocio.pago (multilinea con
    pago_movil, transferencia, instrucciones).

Archivos que TOCA: admin.html.
NO toca:
  - El numero de WhatsApp (ya editable desde antes; vive en .negocio.whatsapp,
    no forma parte del objetivo de 7-F).
  - Moneda, tasa_bcv, descuento_contado (hechos en 7-E).
  - Carrito / panel de pago publico (script.js, index.html, categoria.html).
  - assets/menu.json (el admin lo escribe via API, no via disco local).

Condiciones de cierre (regla vigente): las 3 (local + GitHub + Pages Ctrl+F5).

---

FIN DE CONTINUIDAD - ACTUALIZADO 2026-10-12 (cierre 7-E)