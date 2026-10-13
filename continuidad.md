========================================================================
PROMPT DE TRASPASO - JILBERT BURGERS
FASE ENTRANTE: 12 (por definir; ver candidatos al final)
FASE SALIENTE: 11 (CERRADA 2026-10-12)
========================================================================

------------------------------------------------------------------------
TU TAREA EN ESTE CHAT (LEER ESTO PRIMERO)
------------------------------------------------------------------------

Eres la IA que INICIA la FASE 12. La fase anterior (11) esta CERRADA:
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
    b) git log --oneline -15
    c) git log origin/main --oneline -15
    d) HEAD vs origin/main (rev-parse de ambos)
    e) tamanos de: assets/script.js, assets/style.css, index.html,
       categoria.html, admin.html, assets/menu.json, continuidad.md
    f) menu.json:
         negocio.moneda, negocio.tasa_bcv, negocio.descuento_contado
         (valor + tipo)
         negocio.logo (debe ser 'assets/img/logo.jpg' exacto)
         Recorrer el arbol buscando strings que empiecen con
         'data:image' y reportar PATH + campo + longitud.
         Tras FASE 10 y 11 se espera 0 coincidencias.
         Listar cada .categorias.<slug>.imagen y cada
         .categorias.<slug>.productos[i].foto con su ruta.
    g) assets/img/: listar contenido con tamanos y dimensiones JPEG.
       Se esperan los 10 originales + 6 subidos en la prueba de
       FASE 11 (prod-salchipapas-s4, prod-salchipapas-s5,
       prod-bebidas-b6, prod-combos-descuento-h6,
       prod-hamburguesas-carne-h8, prod-hamburguesas-pollo-h9).
    h) assets/style.css: regla .categoria-card .cat-media
       (aspect-ratio 1/1) y .cat-media img.cat-img (object-fit cover).
       Ambas deben existir.
    i) admin.html:
         - count('data:image') = 0
         - count('c.toDataURL') = 0
         - count('readAsDataURL(file)') = 1 (transitorio)
         - count('window.__jbSubirArchivo') = 3
         - count('window.__jbToken') = 5
         - count('window.__jbSlugActivo') = 3
         - localizar handler 'subir-foto' y 'subir-imagen-cat'
    j) .bak-archive/: confirmar que existe y cuantos archivos
       contiene (el director puede decidir limpiarlo o borrarlo).
  Reportar hallazgos y ESPERAR OK del director antes de proponer
  cualquier cambio.

TAREA PRINCIPAL DE FASE 12 (CANDIDATOS - DECIDE EL DIRECTOR):
  (a) Renombrar el archivo de un producto NUEVO cuando recibe id
      definitivo. Deuda detectada en FASE 11: si se sube foto a un
      producto aun con id 'nuevo-<timestamp>', el archivo queda
      como assets/img/prod-<slug>-nuevo-<ts>.jpg. Al guardar,
      el id pasa a 'h<N>' pero el archivo conserva el nombre
      viejo. Renombrar implicaria: crear el archivo nuevo, borrar
      el viejo (via Contents API DELETE), actualizar menu.json.
  (b) Optimizar / reescalar imagenes ya en assets/img/ (varias
      superan 60 KB y no todas estan en 1:1).
  (c) Otro backlog definido por el director.

NOTA DE FASE 11 - ALTERNATIVAS YA DESCARTADAS:
  La tarea de FASE 11 (adaptar handlers admin a GitHub Contents
  API, sin base64) esta COMPLETA y verificada.

CONDICIONES DE CIERRE (3 condiciones vigentes):
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (git add + commit + push origin main).
  3. Director verifica en la URL publicada de GitHub Pages con Ctrl+F5.

RESPUESTA ESPERADA AL RECIBIR ESTE PROMPT:
  1. Confirmar contexto, reglas duras, Regla 8, Regla de Diagnostico
     Previo, Regla de Traspaso y Regla de Cierre de Fase.
  2. Repetir en una linea el objetivo de FASE 12 confirmado por
     el director.
  3. Confirmar que NO vas a hardcodear datos del negocio.
  4. Ejecutar la TAREA 0 (diagnostico previo obligatorio) en UN
     solo bloque PowerShell con autocopiado al portapapeles, y
     esperar OK del director antes de proponer cualquier cambio.
  5. Recien despues del OK del diagnostico: proponer UN bloque
     ejecutable para el primer paso de FASE 12 y esperar OK.

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
  - assets/menu.json paso de 195.852 -> 6.042 bytes. 0 data:image.
  - 9 referencias de imagen, todas ruta relativa a assets/img/:
      7 categorias + 2 productos (combo-0, combo-2).
  - assets/img/ contenia 10 archivos: los 9 anteriores + logo.jpg.
  - assets/style.css:
      .categoria-card .cat-media   -> aspect-ratio: 1 / 1
      .cat-media img.cat-img       -> position absolute,
                                      inset 0, width 100%,
                                      height 100%,
                                      object-fit: cover.
    El aspect-ratio esta en el CONTENEDOR, no en la img. El efecto
    visual es el mismo: 1:1 recortado.
  - script.js es retrocompatible (sin cambios en FASE 10):
      L256 (mediaHTML): src="' + p.foto + '" (producto).
      L433 (categoria): src="' + c.imagen + '" (categoria).
    Ambos aceptan data: URI o ruta relativa indistintamente.
  - index.html y categoria.html NO embeben imagenes de
    categoria/producto (solo <img data-negocio="logo">).
  - Commits de codigo de FASE 10:
      d8a61cc, a2e4437, 3b40798, fe1315b.
  - Commit de cierre documental de FASE 10:
      73e1f6f, 7929d49.

NOTA HEREDADA DE FASE 11 (handlers admin a GitHub Contents API):
  - admin.html: 69 insertions, 16 deletions (commit 38330e0).
  - Nuevas funciones dentro del primer IIFE:
      blobABase64(blob)             -> base64 chunked (0x8000)
      subirArchivoAGitHub(t,r,b,m)  -> GET sha + PUT contents
  - Handlers agregados al window:
      window.__jbSubirArchivo = subirArchivoAGitHub
      window.__jbToken        = getTokenGuardado
      window.__jbSlugActivo   = slug (asignado en
                                 seleccionarCategoria)
  - redimensionarImagen(file, maxLado, calidad, opts) ahora:
      - usa canvas.toBlob(..., 'image/jpeg', calidad)
      - si opts.subir: sube el blob via __jbSubirArchivo y
        resuelve con opts.ruta.
      - si no opts.subir: rechaza (modo base64 deshabilitado).
  - Handler subir-foto:
      Ruta: assets/img/prod-<slug>-<id>.jpg
      Escribe la ruta resultante en el input [data-campo="foto"].
      NO incrusta base64.
  - Handler subir-imagen-cat:
      Ruta: assets/img/cat-<slug>.jpg
      Escribe la ruta resultante en [data-cat-imagen].
      Actualiza preview [data-cat-img-preview] con la ruta.
      NO incrusta base64.
  - Textos UI actualizados (L601, L1249).
  - Placeholders actualizados: cat-<slug>.jpg, prod-<slug>-<id>.jpg.
  - Subidas reales durante la prueba manual (origin/main):
      3f50ea5  prod-salchipapas-s4.jpg
      5090e1c  prod-salchipapas-s5.jpg
      e901e92  prod-bebidas-b6.jpg
      5cbd509  prod-combos-descuento-h6.jpg
      760c3fd  prod-hamburguesas-carne-h8.jpg
      05cd750  prod-hamburguesas-pollo-h9.jpg
      + 6 commits "admin: actualizar menu.json" intercalados.
  - Commit de codigo de FASE 11: 38330e0.
  - DEUDA DETECTADA (candidata a FASE 12):
      Si se sube foto a un producto NUEVO (id "nuevo-<timestamp>"),
      el archivo queda como prod-<slug>-nuevo-<timestamp>.jpg.
      Al guardar, el id pasa a 'h<N>' pero el archivo conserva
      el nombre viejo. Funciona, pero el nombre es feo.

------------------------------------------------------------------------
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
            3b40798 + fe1315b + 73e1f6f + 7929d49]
FASE 11  - Adaptar handlers admin (subir-imagen-cat y
            subir-foto) a GitHub Contents API + guardar
            ruta relativa en menu.json (sin base64)  [CERRADA
            2026-10-12, commit 38330e0 + subidas
            de prueba 3f50ea5..9493012]
FASE 12  - <por definir segun decision del director> [ACTIVA]

========================================================================
FIN DEL PROMPT DE TRASPASO - FASE 12
========================================================================
