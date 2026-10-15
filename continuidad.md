========================================================================
PROMPT DE TRASPASO - JILBERT BURGERS
FASE ENTRANTE: 13 (por definir)
FASE SALIENTE: 12-BIS (CERRADA 2026-10-15)
========================================================================

------------------------------------------------------------------------
TU TAREA EN ESTE CHAT (LEER ESTO PRIMERO)
------------------------------------------------------------------------

Eres la IA que INICIA la FASE 13. La fase anterior (12-BIS)
esta CERRADA: commit 9a669cd esta en origin/main. Working
tree limpio. Web publicada en GitHub Pages.

REGLA OBLIGATORIA: antes de tocar nada, tu PRIMERA tarea es
un DIAGNOSTICO read-only del entorno y del estado real en
disco y en el remoto. Sin ese diagnostico confirmado por el
director, NO se escribe ni se modifica ningun archivo.

TAREA 0 - DIAGNOSTICO PREVIO (OBLIGATORIA, SOLO LECTURA):
  Un bloque PowerShell que reporte:
    a) git status -sb
    b) git log --oneline -10
    c) git log origin/main --oneline -10
    d) HEAD vs origin/main (rev-parse de ambos)
    e) tamanos de: assets/script.js, assets/style.css,
       index.html, categoria.html, admin.html,
       assets/menu.json, continuidad.md
    f) menu.json: negocio.moneda, tasa_bcv,
       descuento_contado, logo, 0 coincidencias de data:image,
       listar rutas de categorias.<slug>.imagen y
       productos[i].foto
    g) assets/img/: contenido con tamanos
    h) script.js: 0 dobles-comillas erroneas, y los anchors
       id=pago-form, id=pago-nombre, id=carrito-pago-cerrar,
       class=carrito-pago-head deben existir.
  Esperar OK del director antes de proponer cambios.

BACKLOG PARA FASE 13 (decide el director):
  (a) Renombrar archivo de producto NUEVO al recibir id
      definitivo. Deuda de FASE 11: si se sube foto a un
      producto con id nuevo-<ts>, el archivo queda como
      assets/img/prod-<slug>-nuevo-<ts>.jpg. Al guardar el id
      pasa a h<N> pero el archivo conserva el nombre viejo.
  (b) Optimizar / reescalar imagenes en assets/img/
      (varias superan 60 KB y no todas son 1:1).
  (c) Limpiar .bak-* acumulados (~150 en disco hoy).
  (d) Rediseno del carrito (subir al header vs flotante).
  (e) Limpiar campos emoji de menu.json (ya no se usan en web).
  (f) Otro definido por el director.

CONDICIONES DE CIERRE DE FASE (3, vigentes):
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (git add + commit + push origin main).
  3. Director verifica en GitHub Pages con Ctrl+F5.

RESPUESTA ESPERADA AL RECIBIR ESTE PROMPT:
  1. Confirmar contexto, reglas duras, Regla 8, Regla de
     Diagnostico Previo, Regla de Cierre de Fase.
  2. Repetir en una linea el objetivo de FASE 13 confirmado
     por el director.
  3. Confirmar que NO vas a hardcodear datos del negocio.
  4. Ejecutar TAREA 0 en UN bloque PowerShell con autocopiado,
     y esperar OK antes de proponer cualquier cambio.

------------------------------------------------------------------------
NOTAS HEREDADAS - ESTADO ACTUAL
------------------------------------------------------------------------

NOTA HEREDADA DE FASE 8 (render de moneda):
  Fallbacks unificados a EUR.
    - script.js: simboloMoneda() y monedaActual() con fallback EUR.
      Mapea EUR -> codigo U+20AC, USD -> simbolo dolar,
      Bs -> Bs, otro -> codigo ISO tal cual.
    - admin.html: helper simboloDeMoneda(m) + fallback EUR.
    - admin.html: subirMenuAGitHub() serializa copia sin .simbolo.
    - index.html / categoria.html: placeholder estatico.
  NO HAY deuda tecnica pendiente en moneda.

NOTA HEREDADA DE FASE 9 (logo):
  - assets/img/logo.jpg existe (17.353 bytes, JPEG).
  - negocio.logo = assets/img/logo.jpg (ruta relativa).
  - script.js pinta el logo con setAttribute(src, valor) sobre
    el img con data-negocio=logo.
  - admin.html: sin boton de elegir logo desde PC.
  NO HAY deuda tecnica pendiente en el logo.

NOTA HEREDADA DE FASE 10 (imagenes categorias/productos):
  - menu.json bajo de 195.852 a ~6.042 bytes. 0 data:image.
  - Referencias de imagen, todas ruta relativa a assets/img/:
    categorias + productos (combo-0, combo-2) + logo.
  - style.css: .categoria-card .cat-media con aspect-ratio 1/1;
    .cat-media img.cat-img con object-fit cover.
  - script.js es retrocompatible (acepta data:URI o ruta relativa).

NOTA HEREDADA DE FASE 11 (handlers admin a GitHub Contents API):
  - admin.html: 69 inserciones, 16 borrados (commit 38330e0).
  - Funciones nuevas: blobABase64, subirArchivoAGitHub.
  - Exponen window.__jbSubirArchivo, __jbToken, __jbSlugActivo.
  - redimensionarImagen usa canvas.toBlob + sube el blob.
  - Handlers subir-foto y subir-imagen-cat suben a GitHub
    y escriben ruta relativa en menu.json. Sin base64.
  - DEUDA DETECTADA: ver (a) del backlog de FASE 13.

NOTA HEREDADA DE FASE 12-BIS (Contado 10% OFF, CERRADA):
  - Commit 9a669cd en origin/main.
  - BUG resuelto: inyectarPanelPago() tenia todo el HTML
    interno con comillas dobles duplicadas (dos comillas en
    vez de una). El parser no reconocia id=pago-form,
    id=pago-nombre, id=carrito-pago-cerrar ni class=
    carrito-pago-head. Sintoma: al pulsar Contado el panel
    salia roto y el submit no se enganchaba -> nunca enviaba.
  - Fix: reemplazo literal de doble-comilla por comilla simple
    (de dos por una) en assets/script.js.
    Backup: assets/script.js.bak-f12bis-quotefix-20261015-110147.
  - Verificado: 0 dobles-comillas reales (la unica restante es
    un atributo alt vacio, valido), los 4 anchors existen,
    sin BOM.
  - Boton #carrito-contado ya existia en los 6 HTML publicos:
    index, categoria, hamburguesas, salchipapas, bebidas, combos.
  - Flujo verificado en localhost:
    1. Agregar producto -> abrir carrito -> pulsar Contado.
    2. Subpanel con cabecera Pago del pedido, boton X,
       total rebajado (10% OFF), bloque con datos de Pago
       movil (desde menu.json), formulario con Nombre,
       Direccion/Nota, Tipo de pago, Referencia.
    3. Llenar Nombre -> Enviar por WhatsApp.
    4. Mensaje WA incluye: Contado - 10% OFF, lista de
       productos, Subtotal, Descuento contado (10%), Total
       a pagar, Cliente. Carrito se vacia.
  - menu.json: negocio.descuento_contado = 10.
  - negocio.pago.pago_movil fue actualizado por el director
    via admin (commit 1bfa737): Banco de Venezuela,
    04124756747, 30161433, Jilbert Del valle.
  - _nuevo_pago.js movido a
    .bak-archive\_nuevo_pago.js.bak-f12bis-20261015.
  - Incidente push: rechazado (fetch first) -> git pull
    --rebase origin main -> reintento OK. El commit paso de
    b40e10b a 9a669cd tras el rebase (encima de 1bfa737).

------------------------------------------------------------------------
REGLAS DURAS (VIGENTES)
------------------------------------------------------------------------

NO frameworks, NO build, NO backend, NO Node, NO CDN externo.
NO avanzar sin OK de verificacion tras cada script.
Un mensaje = un bloque ejecutable. Esperar confirmacion.
Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
NO asumir datos del negocio. Preguntar.
AL CERRAR TU FASE: reescribir continuidad.md Y entregar en el
chat el PROMPT DE TRASPASO actualizado CON SECCION TU TAREA
EN ESTE CHAT explicita (REGLA DE TRASPASO).
NO crear ni leer archivos de prompt en _sesion.
TODO script (PowerShell, JS consola) DEBE incluir autocopiado
al portapapeles (Set-Clipboard / copy()). Regla 8.

REGLA (2026-10-12) - DIAGNOSTICO PREVIO OBLIGATORIO:
Todo prompt de reenganche o traspaso debe incluir como
PRIMERA tarea un diagnostico del entorno y del estado real
en disco y en el remoto. Sin ese diagnostico confirmado, NO
se modifica nada. Aplica a toda fase futura.

REGLA DE CIERRE DE FASE (ACTUALIZADA 2026-10-11):
Una fase NO se considera cerrada hasta cumplir LAS TRES:
  1. Director verifica en local que la tarea funciona.
  2. Cambios subidos a GitHub (add + commit + push origin main).
  3. Director verifica en la URL publicada con Ctrl+F5.
Si alguna falla, la fase sigue ABIERTA.

REGLA ADICIONAL (2026-10-15, derivada de FASE 12-BIS):
Nunca construir HTML inline con comillas dobles duplicadas
dentro de un string JS. Si el HTML necesita atributos,
usar comillas simples externas y dobles internas, o
plantillas backtick. Antes de dar por cerrado un fix de
HTML inline, verificar con PowerShell que existen los
anchors como id=pago-form, class=carrito-pago-head, etc.

NOTAS OPERATIVAS:
- Backups .bak-<paso>-<timestamp> antes de tocar cualquier archivo.
- Reemplazos con -replace o [regex]::Replace sobre strings unicos
  (count == 1). Si algun patron != 1, NO ESCRIBIR y reportar.
- Validar tamano de salida dentro de rango antes de escribir.
- CRLF: usar secuencia CRLF.
- Encoding: leer y escribir con UTF8Encoding($false) explicito.
  NUNCA Set-Content/Out-File a secas.
- CRITICO: categoria.html tiene su PROPIO bloque carrito-panel
  duplicado del de index.html. Toda fase que toque el carrito
  debe revisar y actualizar AMBAS paginas.
- En PowerShell pegado en consola, un return de nivel superior
  NO aborta el resto del paste: usar exit o envolver en & { }.
- GIT: invocar con cmd /c "git <args> 2>&1" o bajar
  ErrorActionPreference a Continue.
- Git: antes de push, git status -sb. Si behind: git fetch +
  git rebase origin/main. Si hay sucios: git stash push -u,
  rebase, push, git stash pop. Conflicto en menu.json: NO
  pushear, pedir al director.
- PROHIBIDO abrir DevTools / F12 para verificar. Toda
  verificacion tecnica con PowerShell sobre el codigo en disco.

NOTAS OPERATIVAS NUEVAS (FASE 8-10, OBLIGATORIAS):
- PROHIBIDO usar here-strings pegados en consola PowerShell.
  Construir strings largos con arrays de lineas y -join CRLF.
- PROHIBIDO usar $script:out dentro de function anidada en
  bloque & { }: apunta a otro scope.
- PROHIBIDO funciones auxiliares con parametros [string]
  invocadas por posicion para contar ocurrencias.
- OBLIGATORIO doble buffer: escribir a <archivo>.tmp-<paso>,
  validar sobre el tmp, y SOLO SI PASA hacer Move-Item al
  original.
- Umbrales de aborto por tamano calibrados con tamano REAL
  medido antes.
- Tamano en bytes != suma .Length de lineas + CRLF cuando
  hay caracteres no-ASCII. Calcular con $utf8.GetBytes.
- Commitear codigo y commitear continuidad.md deben describir
  el MISMO estado.

------------------------------------------------------------------------
DINAMICA DE OPERACION - PRO ZOERUN (obligatoria)
------------------------------------------------------------------------

Clasificacion de bloques:

TIPO 1 - BLOQUE LECTURA (batch permitido, hasta 5 comandos)
  Solo lectura. Agrupar con ;
  NO usar -ErrorAction SilentlyContinue.
  Uso: explorar, git log, leer config, diagnosticos.

TIPO 2 - BLOQUE ESCRITURA (UNO SOLO por bloque, nunca agrupar)
  Modifican archivos/estado/config.
  UN comando por bloque. UN bloque por mensaje.
  Nunca dos escrituras juntas. Nunca mezclar escritura + lectura.
  Uso: Set-Content, Remove-Item, git add, git commit, renombrar.

TIPO 3 - BLOQUE VERIFICACION (cadena con aborto)
  Post-escritura, en orden, aborta si falla.
  Encadenar: cmd1; if ($?) { cmd2 }; if ($?) { cmd3 }

FORMATO DE ENTREGA:
- Un bloque por mensaje, en bloque de codigo powershell.
- Sin prosa alrededor (salvo 1 linea de que se espera ver).
- Nunca mas de un bloque por mensaje.
- Nunca mezclar tipos.
- Duda TIPO 1 vs TIPO 2 -> tratar como TIPO 2.

AUTO-COPIA:
- Envolver cada bloque en ZoeRun { ... } (funcion del director).

DINAMICA:
1. IA entrega UN bloque.
2. Director ejecuta.
3. Salida al portapapeles, la pega.
4. IA lee, analiza, entrega siguiente bloque.
5. Repetir.

------------------------------------------------------------------------
HISTORIAL DE FASES
------------------------------------------------------------------------

IA 1 .. IA 6                                        [CERRADA]
FASE 6-bis - Logica escala/posicion del logo        [CERRADA]
FASE 7-A - Migracion aditiva menu.json              [CERRADA]
FASE 7-B - Render carrito moneda + tasa + Bs        [CERRADA]
FASE 7-C - Panel de pago en el carrito              [CERRADA]
FASE 7-D - WhatsApp con dos mensajes distintos      [CERRADA]
FASE 7-E - Admin editable: moneda + tasa + descuento [CERRADA]
FASE 7-F - Admin editable: datos de pago            [CERRADA]
FASE 8   - Cambio USD->EUR en render publico        [CERRADA]
FASE 9   - Migracion logo base64 a archivo externo  [CERRADA]
FASE 10  - Migracion imagenes base64 a assets/img/  [CERRADA]
FASE 11  - Handlers admin a GitHub Contents API     [CERRADA]
FASE 12  - Intento modal propio (revertido)         [REVERTIDA]
FASE 12-BIS - Contado 10% OFF + fix comillas        [CERRADA
             2026-10-15, commit 9a669cd]
FASE 13  - <por definir segun decision del director> [ACTIVA]

========================================================================
FIN DEL PROMPT DE TRASPASO - FASE 13
========================================================================