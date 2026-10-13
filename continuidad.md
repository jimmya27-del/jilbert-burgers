========================================================================
PROMPT DE TRASPASO - JILBERT BURGERS
FASE ENTRANTE: 11 (por definir; recomendacion: adaptar handlers
               del admin para subir binarios a assets/img/)
FASE SALIENTE: 10 (CERRADA 2026-10-12)
========================================================================

------------------------------------------------------------------------
TU TAREA EN ESTE CHAT (LEER ESTO PRIMERO)
------------------------------------------------------------------------

Eres la IA que INICIA la FASE 11. La fase anterior (10) esta CERRADA:
todos los commits estan en origin/main y la web ha sido verificada en
local y en GitHub Pages con Ctrl+F5. No hay working tree sucio ni
pendientes bloqueantes.

REGLA OBLIGATORIA (2026-10-12): antes de tocar nada, tu PRIMERA tarea
es un DIAGNOSTICO del entorno y del estado real en disco y en el
remoto. Sin ese diagnostico confirmado por el director, NO se escribe
ni se modifica ningun archivo.

TAREA 0 - DIAGNOSTICO PREVIO (OBLIGATORIA, SOLO LECTURA):
  Ejecutar UN bloque PowerShell (con autocopiado al portapapeles,
  Regla 8) que reporte:
    a) git status -sb
    b) git log --oneline -12
    c) git log origin/main --oneline -12
    d) HEAD vs origin/main (rev-parse de ambos)
    e) tamanos de: assets/script.js, assets/style.css, index.html,
       categoria.html, admin.html, assets/menu.json, continuidad.md
    f) menu.json:
         negocio.moneda, negocio.tasa_bcv, negocio.descuento_contado
         (valor + tipo)
         negocio.logo (debe ser 'assets/img/logo.jpg' exacto)
         Recorrer el arbol buscando strings que empiecen con
         'data:image' y reportar PATH + campo + longitud.
         Tras FASE 10 se espera 0 coincidencias.
         Listar cada .categorias.<slug>.imagen y cada
         .categorias.<slug>.productos[i].foto con su ruta.
    g) assets/img/: listar contenido con tamanos y dimensiones JPEG.
    h) assets/style.css: reglas de .categoria-card .cat-media img.cat-img
       (aspect-ratio y object-fit). Confirmar que estan puestas a 1/1
       y cover respectivamente.
    i) admin.html: TODAS las menciones de 'imagen', 'foto',
       'subir-imagen-cat', 'subir-foto', 'data-cat-imagen',
       'data-campo="foto"', 'subirMenuAGitHub', 'redimensionarImagen'.
       Localizar:
         - handler 'subir-imagen-cat'
         - handler 'subir-foto'
         - funcion redimensionarImagen
         - flujo de guardado (subirMenuAGitHub)
       Confirmar si siguen generando data: URI (base64).
    j) Listar archivos .bak-* y scripts sueltos (_*.ps1) en la raiz,
       para que el director decida si limpiarlos.
  Reportar hallazgos y ESPERAR OK del director antes de proponer
  cualquier cambio.

TAREA PRINCIPAL DE FASE 11 (RECOMENDADA - CONFIRMAR):
  "Adaptar los handlers 'subir-imagen-cat' y 'subir-foto' del
   admin para que suban el binario redimensionado a assets/img/
   via GitHub Contents API, y guarden solo la ruta relativa en
   menu.json. Eliminar el flujo que incrusta base64."

  JUSTIFICACION: tras FASE 10 menu.json esta en 6.042 bytes y sin
  data:image. Pero los botones "Elegir imagen de categoria desde mi
  computadora" (data-accion='subir-imagen-cat') y "Elegir foto
  desde mi computadora" (data-accion='subir-foto') SIGUEN generando
  base64 y guardandolo en menu.json. Un solo uso del admin infla el
  JSON y deshace el objetivo de FASE 10.

  ALTERNATIVAS (decide el director):
    (a) FASE 11 = adaptar handlers admin (recomendado).
    (b) FASE 11 = otro backlog (a definir por el director).
    (c) FASE 11 = solo documentar deuda, no tocar admin aun.

OBJETIVO (una linea, si se elige (a)):
  Que subir imagen/foto desde admin escriba binario en
  assets/img/ y deje en menu.json la ruta relativa, sin base64.

ALCANCE (orientativo, confirmar tras Tarea 0):
  SI TOCAR (si se elige (a)):
    - admin.html: handlers 'subir-imagen-cat' y 'subir-foto'.
      Funcion redimensionarImagen. Flujo de guardado
      (subirMenuAGitHub). Reutilizar la misma GitHub Contents API
      ya usada para guardar menu.json, subiendo el binario a
      assets/img/<nombre>.<ext>.
    - Nomenclatura de archivos subidos: definir con el director
      (ej. assets/img/cat-<slug>.jpg y assets/img/prod-<id>.jpg).
    - Si el PAT en localStorage no tiene permisos de escritura
      sobre assets/img/, reportar y NO escribir.
  NO TOCAR:
    - Logica del carrito, panel de pago, WhatsApp, negocio.pago.*.
    - .negocio.logo, .negocio.logo_pos (cerrados en FASE 9).
    - Moneda, tasa, descuento (cerrados en FASE 8).
    - script.js render (ya soporta data: y ruta relativa).
    - assets/style.css .categoria-card .cat-media img.cat-img
      (cerrado en FASE 10).

CONDICIONES DE CIERRE (3 condiciones vigentes):
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (git add + commit + push origin main).
  3. Director verifica en la URL publicada de GitHub Pages con Ctrl+F5.

RESPUESTA ESPERADA AL RECIBIR ESTE PROMPT:
  1. Confirmar contexto, reglas duras, Regla 8, Regla de Diagnostico
     Previo, Regla de Traspaso y Regla de Cierre de Fase.
  2. Repetir en una linea el objetivo de FASE 11 confirmado por
     el director.
  3. Confirmar que NO vas a hardcodear datos del negocio.
  4. Ejecutar la TAREA 0 (diagnostico previo obligatorio) en UN
     solo bloque PowerShell con autocopiado al portapapeles, y
     esperar OK del director antes de proponer cualquier cambio.
  5. Recien despues del OK del diagnostico: proponer UN bloque
     ejecutable para el primer paso de FASE 11 y esperar OK.

------------------------------------------------------------------------
NOTAS HEREDADAS - ESTADO ACTUAL
------------------------------------------------------------------------

NOTA HEREDADA DE FASE 8 (render de moneda):
  Fallbacks unificados a 'EUR':
    - assets/script.js: simboloMoneda() y monedaActual() con
      fallback 'EUR'. Mapea EUR -> codigo U+20AC, USD -> $,
      Bs -> Bs, otro -> codigo ISO tal cual.
    - admin.html: helper simboloDeMoneda(m) + fallback 'EUR'.
    - admin.html: subirMenuAGitHub() serializa copia sin .simbolo.
    - index.html / categoria.html: placeholder estatico.
  NO HAY deuda tecnica pendiente en moneda.

NOTA HEREDADA DE FASE 9 (logo):
  - assets/img/logo.jpg existe (17.353 bytes, JPEG).
  - .negocio.logo = 'assets/img/logo.jpg' (ruta relativa).
  - script.js pinta el logo con setAttribute('src', valor) sobre
    <img data-negocio="logo">. Acepta data: URI o ruta relativa.
  - admin.html: eliminado el boton "Elegir logo desde mi
    computadora" y su handler (data-accion='subir-logo').
  - NO HAY deuda tecnica pendiente en el logo.

NOTA HEREDADA DE FASE 10 (imagenes categorias/productos):
  - assets/menu.json: 195.852 -> 6.042 bytes. 0 data:image residual.
  - 9 referencias de imagen en menu.json, todas ruta relativa a
    assets/img/ (7 categorias + 2 productos):
      .categorias.hamburguesas.imagen           -> assets/img/cat-hamburguesas.jpg
      .categorias.salchipapas.imagen            -> assets/img/cat-salchipapas.jpg
      .categorias.bebidas.imagen                -> assets/img/cat-bebidas.jpg
      .categorias.combos.imagen                 -> assets/img/cat-combos.jpg
      .categorias.combos-descuento.imagen       -> assets/img/cat-combos-descuento.jpg
      .categorias.hamburguesas-carne.imagen     -> assets/img/cat-hamburguesas-carne.jpg
      .categorias.hamburguesas-pollo.imagen     -> assets/img/cat-hamburguesas-pollo.jpg
      .categorias.combos-descuento.productos[0].foto -> assets/img/prod-combo-0.jpg
      .categorias.combos-descuento.productos[2].foto -> assets/img/prod-combo-2.jpg
  - assets/img/ contiene 10 archivos: los 9 anteriores + logo.jpg.
  - assets/style.css: .categoria-card .cat-media img.cat-img con
    aspect-ratio: 1 / 1 y object-fit: cover, para que la imagen de
    la tarjeta de categoria ocupe todo el espacio disponible.
  - script.js es retrocompatible (sin cambios en FASE 10):
    - L256 (mediaHTML): src="' + p.foto + '" (producto).
    - L433 (categoria): src="' + c.imagen + '" (categoria).
    Ambos aceptan data: URI o ruta relativa indistintamente.
  - index.html y categoria.html NO embeben imagenes de
    categoria/producto (solo <img data-negocio="logo">).
  - Commits de codigo de FASE 10:
      d8a61cc  migracion inicial de las 3 imagenes residuales.
      a2e4437  admin: actualizar menu.json (reintento).
      3b40798  CSS: .cat-img ocupa todo el espacio disponible.
      fe1315b  migracion de las 9 imagenes restantes.
  - Commits de cierre documental de FASE 10:
      73e1f6f  continuidad.md inicial (contiene datos incompletos:
               decia 3 imagenes / commit d8a61cc).
      <este>   fix: continuidad.md alineada con estado real.
  - DEUDA TECNICA PENDIENTE (candidata a FASE 11):
      admin.html handlers 'subir-imagen-cat' y 'subir-foto'
      SIGUEN generando base64 y guardandolo en menu.json.
      Un uso del admin revierte el ahorro de FASE 10.

------------------------------------------------------------------------
REGLAS DURAS (VIGENTES)
------------------------------------------------------------------------

NO frameworks, NO build, NO backend, NO Node, NO CDN externo.
NO avanzar sin OK de verificacion tras cada script.
Un mensaje = un bloque ejecutable. Esperar confirmacion.
Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
NO asumir datos del negocio. Preguntar.
AL CERRAR TU FASE: reescribir continuidad.md Y entregar en el chat
el PROMPT DE TRASPASO actualizado CON SECCION "TU TAREA EN ESTE
CHAT" explicita (REGLA DE TRASPASO).
NO crear ni leer archivos de prompt en _sesion.
TODO script (PowerShell, JS consola) DEBE incluir al final autocopiado
al portapapeles (Set-Clipboard / copy()). Regla 8.

REGLA (2026-10-12) - DIAGNOSTICO PREVIO OBLIGATORIO:
Todo prompt de reenganche o traspaso debe incluir como PRIMERA
tarea un diagnostico del entorno y del estado real en disco y en
el remoto. Sin ese diagnostico confirmado, NO se modifica nada.
Aplica a toda fase futura.

REGLA DE CIERRE DE FASE (ACTUALIZADA 2026-10-11):
Una fase NO se considera cerrada hasta cumplir LAS TRES:
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (git add + commit + push origin main).
  3. Director verifica en la URL publicada de GitHub Pages con Ctrl+F5.
Si alguna falla, la fase sigue ABIERTA.

NOTAS OPERATIVAS:
- Backups .bak-<paso>-<timestamp> antes de tocar cualquier archivo.
- Reemplazos con -replace o [regex]::Replace sobre strings unicos
  (count == 1). Si algun patron != 1, NO ESCRIBIR y reportar.
- Validar tamano de salida dentro de rango antes de escribir.
  Reportar ESCRITO OK o NO ESCRIBIR.
- CRLF: usar secuencia CRLF. Si un patron de anclaje falla, pedir
  dump del contexto antes de reescribir.
- Encoding: leer y escribir con [System.Text.Encoding]::UTF8 o
  UTF8Encoding($false) explicito. NUNCA Set-Content/Out-File a
  secas.
- CRITICO: categoria.html tiene su PROPIO bloque carrito-panel
  duplicado del de index.html. Toda fase que toque el carrito debe
  revisar y actualizar AMBAS paginas.
- En PowerShell pegado en consola, un return de nivel superior NO
  aborta el resto del paste: usar exit o envolver en & { }.
- No estimar rangos de tamano "a ojo": medir el bloque real antes
  de fijar el limite.
- GIT: invocar con cmd /c "git <args> 2>&1" o bajar
  ErrorActionPreference a Continue. Evita NativeCommandError por
  stderr normal de git.
- Git: antes de push, git status -sb. Si behind: git fetch +
  git rebase origin/main. Si hay sucios: git stash push -u, rebase,
  push, git stash pop. Conflicto en menu.json: NO pushear, pedir
  al director.
- PROHIBIDO abrir DevTools / F12 para verificar. Toda verificacion
  tecnica se hace con PowerShell sobre el codigo en disco.

NOTAS OPERATIVAS NUEVAS (derivadas de errores de FASE 8, 9 y 10,
OBLIGATORIAS desde 2026-10-12):
- PROHIBIDO usar here-strings pegados en consola PowerShell: se
  parsean fragilmente y pueden quedar vacios o truncados.
  Construir strings largos con arrays de lineas y -join CRLF.
- PROHIBIDO usar $script:out dentro de una function anidada en un
  bloque & { }: apunta a otro scope y el output se pierde. Usar
  $out local o evitar funciones anidadas.
- PROHIBIDO usar funciones auxiliares con parametros [string]
  invocadas por posicion para contar ocurrencias (CountOcc). Usar
  IndexOf inline en bucle o verificar por linea exacta.
- OBLIGATORIO doble buffer en toda escritura de archivo: escribir
  a <archivo>.tmp-<paso>, validar sobre el tmp, y SOLO SI PASA
  hacer Move-Item -Force al original.
- Los umbrales de aborto por tamano deben calibrarse con el tamano
  REAL medido antes (no a ojo).
- NUEVO (derivado de FASE 9): el tamano en bytes de un archivo de
  texto NO es igual a la suma de .Length de sus lineas + CRLF
  cuando hay caracteres no-ASCII (acentos literales, emojis, etc.)
  que ocupan mas bytes en UTF-8 que chars en .Length. Calcular
  sizeEsperado con $utf8.GetBytes($newRaw).Length. Ademas, hacer
  read-back del tmp con la misma codificacion y comparar -ceq
  string-vs-string; ese es el chequeo fuerte, el size es secundario.
- NUEVO (derivado de FASE 10): commitear codigo y commitear
  continuidad.md deben describir el MISMO estado. Si entre el
  commit de codigo y el commit de cierre pasa trabajo adicional
  (migraciones extra, ajustes CSS, admin updates), hay que releer
  git log ANTES de escribir continuidad.md para no documentar un
  estado obsoleto.

------------------------------------------------------------------------
SERVIDOR LOCAL (necesario para probar)
------------------------------------------------------------------------

Abrir PowerShell en C:\jilbert_burgers y ejecutar:

& {
  $root = 'C:\jilbert_burgers'
  $port = 8080
  Set-Clipboard -Value "Servidor local en http://localhost:$port/"
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
  Write-Host "Servidor en http://localhost:$port/" -ForegroundColor Green
  Write-Host "Ctrl+C para detener." -ForegroundColor Yellow
  try {
    while ($listener.IsListening) {
      $ctx = $listener.GetContext()
      $rel = $ctx.Request.Url.LocalPath.TrimStart('/')
      if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
      $path = Join-Path $root $rel
      if (Test-Path -LiteralPath $path -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $ext = [System.IO.Path]::GetExtension($path).ToLower()
        $mime = switch ($ext) {
          '.html' { 'text/html; charset=utf-8' }
          '.css'  { 'text/css; charset=utf-8' }
          '.js'   { 'application/javascript; charset=utf-8' }
          '.json' { 'application/json; charset=utf-8' }
          '.png'  { 'image/png' } '.jpg' { 'image/jpeg' }
          '.jpeg' { 'image/jpeg' } '.svg' { 'image/svg+xml' }
          '.webp' { 'image/webp' }
          default { 'application/octet-stream' }
        }
        $ctx.Response.ContentType = $mime
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else { $ctx.Response.StatusCode = 404 }
      $ctx.Response.Close()
    }
  } finally { $listener.Stop(); $listener.Close() }
}

------------------------------------------------------------------------
HISTORIAL DE FASES
------------------------------------------------------------------------

IA 1 .. IA 6                                        [CERRADA]
FASE 6-bis - Logica escala/posicion del logo        [CERRADA]
FASE 7-A - Migracion aditiva menu.json               [CERRADA]
FASE 7-B - Render carrito moneda + tasa + Bs         [CERRADA]
FASE 7-C - Panel de pago en el carrito               [CERRADA]
FASE 7-D - WhatsApp con dos mensajes distintos       [CERRADA]
FASE 7-E - Admin editable: moneda + tasa + descuento [CERRADA]
FASE 7-F - Admin editable: datos de pago             [CERRADA
            2026-10-12, commit ca06e1c]
FASE 8   - Cambio USD->EUR en render publico         [CERRADA
            2026-10-12, commit 23b039c]
FASE 9   - Migracion del logo base64 de menu.json a
            archivo externo                          [CERRADA
            2026-10-12, commits 45bf94f + 2bc3c41]
FASE 10  - Migracion de imagenes base64 de categorias
            y productos a assets/img/ + ajuste CSS
            de tarjeta de categoria                  [CERRADA
            2026-10-12, commits d8a61cc + a2e4437 +
            3b40798 + fe1315b + 73e1f6f + <este>]
FASE 11  - <por definir segun decision del director> [ACTIVA]

========================================================================
FIN DEL PROMPT DE TRASPASO - FASE 11
========================================================================
