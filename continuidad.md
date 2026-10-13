========================================================================
CONTINUIDAD - JILBERT BURGERS
FASE CERRADA: 9 (Migracion del logo base64 de menu.json a archivo externo)
FASE ACTIVA:  10 (Migracion de imagenes base64 de categorias y productos)
========================================================================

------------------------------------------------------------------------
RESUMEN DE CIERRE - FASE 9 (2026-10-12)
------------------------------------------------------------------------

Objetivo: migrar el logo base64 embebido en menu.json (.negocio.logo)
a un archivo externo assets/img/logo.jpg, sin romper retrocompatibilidad.

Estado: CERRADA.

Commits relevantes:
  45bf94f  9: migrar logo a archivo externo (paso 1/2 - admin.html
           sin boton base64 + assets/img/logo.jpg)
  2bc3c41  admin: actualizar menu.json (generado por admin.html
           al guardar .negocio.logo = assets/img/logo.jpg)

Cambios aplicados:
  * assets/img/logo.jpg creado (17.353 bytes, JPEG, extraido del
    base64 que estaba en menu.json). Magic FF D8 FF ... FF D9 OK.
  * admin.html: eliminado el boton "Elegir logo desde mi computadora"
    y su handler (data-accion="subir-logo"). Redundante y peligroso:
    re-introducia base64 en .negocio.logo. El placeholder del input
    paso de "assets/img/logo.svg" a "assets/img/logo.jpg".
  * menu.json: .negocio.logo ahora es "assets/img/logo.jpg" (ruta
    relativa). Tamano del archivo: 218.996 -> 195.852 bytes.
  * script.js, index.html, categoria.html: SIN CAMBIOS. El render
    publico usa el.setAttribute('src', valor) sobre <img
    data-negocio="logo">, que acepta data: URI o ruta relativa por
    igual. Retrocompatibilidad garantizada por diseno.

Verificado:
  * negocio.logo == "assets/img/logo.jpg" (exacto, case-sensitive).
  * negocio.logo_pos intacto (escala=2, x=-2, y=0).
  * negocio.moneda=EUR/String, tasa_bcv=980.61/Decimal,
    descuento_contado=10/Int32 (sin cambios desde 8-F).
  * assets/img/logo.jpg 17.353 bytes, magic JPEG OK.
  * git status limpio, HEAD == origin/main == 2bc3c41.

FALSO OBJETIVO DEL PROMPT DE TRASPASO 8-F -> 9:
  El prompt decia "reducir menu.json de ~218 KB a ~10-15 KB".
  Aritmetica incorrecta: el logo era ~23 KB de 218 KB, no el 90 %.
  Lo que baja con FASE 9 es 218.996 -> 195.852 (-23.144 bytes).
  El resto del peso (~190 KB) esta en 3 imagenes base64 residuales
  que son objeto de FASE 10 (ver abajo).

------------------------------------------------------------------------
RESIDUOS BASE64 EN menu.json (objeto de FASE 10)
------------------------------------------------------------------------

Al cierre de FASE 9, menu.json aun contiene 3 imagenes base64:

  PATH                                             CHARS base64
  $.categorias.salchipapas.imagen                  43.227
  $.categorias.combos-descuento.productos[0].foto  62.403
  $.categorias.combos-descuento.productos[2].foto  84.455
                                                  --------
  TOTAL residual                                  190.085

Estas NO forman parte de FASE 9. Son FASE 10.

------------------------------------------------------------------------
ESTADO DEL PROYECTO AL CIERRE DE FASE 9
------------------------------------------------------------------------

Negocio: Jilbert Burgers - comida rapida - Maracay, Venezuela.
Stack: HTML5 + CSS3 + JS puro. SIN frameworks, SIN build, SIN
backend, SIN CDN.
Hosting: GitHub Pages (repo jimmya27-del/jilbert-burgers, rama main).
Consola: PowerShell (Windows). Ruta local: C:\jilbert_burgers
Web publica: index.html + categoria.html (render dinamico por slug
via ?cat=).
Admin: admin.html.
Lectura de datos publica: assets/menu.json con fetch.
CRLF. Encoding UTF-8 sin BOM en escrituras.

Estructura menu.json (al cierre de 9):
  .negocio             -> PSCustomObject
    .moneda            -> String  ('EUR')
    .tasa_bcv          -> Decimal (980.61)
    .descuento_contado -> Int32   (10)
    .whatsapp          -> String
    .direccion         -> String
    .facebook          -> String
    .correo            -> String
    .logo              -> String  ('assets/img/logo.jpg')
    .logo_pos          -> PSCustomObject { escala: 2, x: -2, y: 0 }
    .pago              -> PSCustomObject
      .pago_movil      -> { banco, telefono, cedula, titular }
      .transferencia   -> { banco, cuenta, tipo, cedula, titular }
      .instrucciones   -> String
  .hero                -> PSCustomObject
  .categorias          -> PSCustomObject (NO array; cada clave ES
                          el slug: hamburguesas, salchipapas,
                          bebidas, combos, combos-descuento,
                          hamburguesas-carne, hamburguesas-pollo)
    .<slug>.imagen     -> String (data: URI o ruta relativa)
    .<slug>.productos  -> PSCustomObject
      .<prod>.foto     -> String (data: URI o ruta relativa)

------------------------------------------------------------------------
PROMPT DE TRASPASO - FASE 10
------------------------------------------------------------------------

========================================================================
PROMPT DE TRASPASO - JILBERT BURGERS
FASE ENTRANTE: 10 (Migracion de imagenes base64 de categorias y
               productos a archivos externos en assets/img/)
FASE SALIENTE: 9 (CERRADA 2026-10-12, commit 2bc3c41)
========================================================================

------------------------------------------------------------------------
TU TAREA EN ESTE CHAT (LEER ESTO PRIMERO)
------------------------------------------------------------------------

Eres la IA que INICIA la FASE 10. La fase anterior (9) esta CERRADA:
commit 2bc3c41 en origin/main, verificado en local y en GitHub Pages.
No hay working tree sucio ni pendientes bloqueantes.

REGLA OBLIGATORIA (2026-10-12): antes de tocar nada, tu PRIMERA tarea
es un DIAGNOSTICO del entorno y del estado real en disco y en el
remoto. Sin ese diagnostico confirmado por el director, NO se escribe
ni se modifica ningun archivo.

TAREA 0 - DIAGNOSTICO PREVIO (OBLIGATORIA, SOLO LECTURA):
  Ejecutar UN bloque PowerShell (con autocopiado al portapapeles,
  Regla 8) que reporte:
    a) git status -sb
    b) git log --oneline -10
    c) git log origin/main --oneline -10
    d) HEAD vs origin/main (rev-parse de ambos)
    e) tamanos de: assets/script.js, index.html, categoria.html,
       admin.html, assets/menu.json, continuidad.md
    f) menu.json:
         negocio.moneda, negocio.tasa_bcv, negocio.descuento_contado
         (valor + tipo)
         negocio.logo (debe ser 'assets/img/logo.jpg' exacto)
         Recorrer el arbol buscando strings que empiecen con
         'data:image' y reportar PATH + campo + longitud. Deben
         aparecer 3: $.categorias.salchipapas.imagen,
         $.categorias.combos-descuento.productos[0].foto,
         $.categorias.combos-descuento.productos[2].foto.
         Verificar que assets/img/logo.jpg existe y su tamano.
    g) script.js: TODAS las menciones de 'imagen' y 'foto'
       (contexto de 2 lineas). Localizar donde se pintan las
       imagenes de categoria y producto en la web publica.
    h) admin.html: TODAS las menciones de 'imagen', 'foto',
       'subir-imagen-cat', 'imagen-cat', 'data-cat',
       'data-prod'. Localizar el handler de subida de imagen de
       categoria/producto y el flujo de guardado de productos.
    i) index.html y categoria.html: menciones de 'imagen', 'foto'
       en <img> y data-*. Confirmar si las imagenes se pintan solo
       via script.js o hay <img> embebidos.
    j) Listar contenido de assets/img/ (carpeta existe tras 9;
       debe contener logo.jpg).
    k) Confirmar que assets/img/logo.jpg NO fue borrado ni movido.
  Reportar hallazgos y ESPERAR OK del director antes de proponer
  cualquier cambio.

TAREA PRINCIPAL DE FASE 10:
  "Migrar las 3 imagenes base64 residuales en menu.json a archivos
   externos en assets/img/ (una por imagen), manteniendo
   retrocompatibilidad: si el campo empieza con 'data:', usarlo tal
   cual; si empieza con 'assets/' o 'http', usarlo como src de <img>."

OBJETIVO (una linea):
  Reducir menu.json de ~196 KB a la zona de ~6-10 KB, sacando 190.085
  chars de base64 a 3 archivos binarios en assets/img/, sin romper
  la web si algun campo queda con data: URI.

ALCANCE (orientativo, confirmar tras Tarea 0):
  SI TOCAR (segun diagnostico):
    - assets/menu.json: .categorias.salchipapas.imagen,
      .categorias.combos-descuento.productos[0].foto,
      .categorias.combos-descuento.productos[2].foto -> rutas
      relativas (ej. assets/img/cat-salchipapas.jpg,
      assets/img/prod-combo-0.jpg, assets/img/prod-combo-2.jpg).
      SOLO via admin, no edicion directa.
    - admin.html: el handler de subir-imagen-cat y el flujo de
      guardado de productos, si hay que adaptar el input.
    - assets/script.js: el punto donde se pintan las imagenes de
      categoria y producto (manejar data: URI y ruta relativa).
    - index.html / categoria.html: si embeben alguna imagen
      directamente.
    - Assets binarios: crear 3 archivos en assets/img/ con los
      binarios extraidos de los base64 actuales (una sola vez).
  NO TOCAR:
    - Logica del carrito, panel de pago, WhatsApp, negocio.pago.*.
      7-C/7-D/7-F cerradas.
    - Flujo de guardado (GitHub Contents API + PAT en localStorage)
      salvo lo estrictamente necesario para subir el binario.
    - .negocio.logo, .negocio.logo_pos (cerrados en FASE 9).
    - Moneda, tasa, descuento (cerrados en FASE 8).

CONDICIONES DE CIERRE (3 condiciones vigentes):
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (git add + commit + push origin main).
  3. Director verifica en la URL publicada de GitHub Pages con Ctrl+F5.

RESPUESTA ESPERADA AL RECIBIR ESTE PROMPT:
  1. Confirmar contexto, reglas duras, Regla 8, Regla de Diagnostico
     Previo, Regla de Traspaso y Regla de Cierre de Fase.
  2. Repetir en una linea:
     "FASE 10. Objetivo: migrar las 3 imagenes base64 residuales de
      menu.json a archivos externos en assets/img/."
  3. Confirmar que NO vas a hardcodear moneda ni ningun dato del
     negocio. Todo se lee de menu.json.
  4. Ejecutar la TAREA 0 (diagnostico previo obligatorio) en UN
     solo bloque PowerShell con autocopiado al portapapeles, y
     esperar OK del director antes de proponer cualquier cambio.
  5. Recien despues del OK del diagnostico: proponer UN bloque
     ejecutable para el primer paso de FASE 10 y esperar OK.

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

NOTA HEREDADA DE FASE 9 (estado actual del logo):
  - assets/img/logo.jpg existe (17.353 bytes, JPEG).
  - .negocio.logo = 'assets/img/logo.jpg' (ruta relativa).
  - script.js pinta el logo con setAttribute('src', valor) sobre
    <img data-negocio="logo">. Acepta data: URI o ruta relativa.
  - admin.html: eliminado el boton "Elegir logo desde mi
    computadora" y su handler (data-accion="subir-logo").
  - NO HAY deuda tecnica pendiente en el logo.

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

NOTAS OPERATIVAS NUEVAS (derivadas de errores de FASE 8 y 9,
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
- NUEVO (derivado de FASE 9, intento 1 del Paso 3): el tamano en
  bytes de un archivo de texto NO es igual a la suma de .Length de
  sus lineas + CRLF cuando hay caracteres no-ASCII (acentos
  literales, emojis, etc.) que ocupan mas bytes en UTF-8 que chars
  en .Length. Calcular sizeEsperado con
  $utf8.GetBytes($newRaw).Length. Ademas, hacer read-back del tmp
  con la misma codificacion y comparar -ceq string-vs-string; ese
  es el chequeo fuerte, el size es secundario.

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
            y productos a assets/img/                [ACTIVA]

========================================================================
FIN DEL PROMPT DE TRASPASO - FASE 10
========================================================================
