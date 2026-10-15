CONTEXTO DEL PROYECTO - JILBERT BURGERS

STACK
- HTML5 + CSS3 + JS puro. SIN frameworks, SIN build, SIN backend, SIN Node, SIN CDN.
- Hosting: GitHub Pages. Repo: jimmya27-del/jilbert-burgers, rama main.
- Local: C:\jilbert_burgers
- Estructura: index.html, categoria.html, admin.html,
  assets/{script.js, style.css, menu.json}
- Fuente de datos: assets/menu.json (negocio, hero, categorias con productos).

ESTADO GIT AL CIERRE DE FASE 15
- HEAD local = origin/main = 813d9e5.
- Working tree limpio.
- Ultimos commits:
    813d9e5  FASE 15: oculta transferencia vacia, hero admin-only,
             compartir WhatsApp flotante+menu, skeleton loader,
             limpia emojis
    6fd7902  FASE 15: quitar SVG circulo JB del header (logo duplicado)
    e717232  FASE 14: badge MAS VENDIDO dorado premium en producto posicion 1

QUE SE CERRO EN FASE 13 (ya en produccion)
- Vista unificada en index.html: TODOS los productos de una sola vez.
- Filtro por categoria en menu hamburguesa (tres rayitas) arriba-izquierda.
- Admin: orden por input numerico de posicion (1, 2, 3, ...), sin flechas.
- El orden definido en admin se respeta en la vista unificada del index.

QUE SE CERRO EN FASE 14 (ya en produccion)
- Reorden de la tarjeta de producto en index.html:
  FOTO -> TITULO -> [PRECIO + (-)cantidad(+) + Agregar] -> Descripcion.
- Badge "MAS VENDIDO" dorado premium en el producto en posicion 1.
  Aplica en index.html. En categoria.html NO se replica (decision director).
- El producto en posicion 1 lo controla el admin con el input numerico.

QUE SE CERRO EN FASE 15 (ya en produccion)
- Header de index.html: se elimino el SVG/logo circular JB duplicado.
  Queda solo el texto "Jilbert Burgers" del enlace del header.
- menu.json: se eliminaron TODOS los campos "emoji" (ya no se usan).
- Panel "Contado": el <select> de Tipo de pago se pobla dinamicamente.
  "Transferencia" desaparece si sus campos estan vacios.
  "Pago movil" desaparece si sus campos estan vacios.
  "Efectivo" siempre disponible.
- Hero: index.html ya NO trae titulo/subtitulo hardcodeados.
  Solo lo llena el admin via menu.json (evita parpadeo de texto viejo).
- Boton COMPARTIR MENU (WhatsApp):
  * Flotante abajo-izquierda (opuesto a "Mi pedido" que esta abajo-derecha).
  * Item adicional dentro del menu hamburguesa: "Compartir menu".
  * Usa navigator.share si esta disponible; fallback a wa.me sin numero.
  * Presente en index.html y categoria.html.
- Skeleton loader (CSS puro) al cargar productos:
  * index.html: 6 tarjetas placeholders.
  * categoria.html: 4 tarjetas placeholders.
  * Animacion sk-shimmer, se reemplaza al llegar el fetch de menu.json.
- Cache busting actualizado a v=20261015c en ambos HTML.

DECISIONES DEL DIRECTOR EN FASE 15 (no reabrir sin motivo)
- WhatsApp sin codigo de pais: NO importa, solo se vende en Venezuela.
- Favicon propio: NO se agrega, se deja como esta.
- Badge MAS VENDIDO en categoria.html: NO se replica.
- Meta description: ya existia en el head de index.html.
- Doble descuento: NO existe, solo aplica el % configurado en admin.
- Salchipapa "pequeno 150gr papas / ~200gr total": se corrige MANUAL en admin.
- Categorias solapadas / sin productos: el admin ya las oculta en el filtro.
  La limpieza de nombres se hace MANUAL en admin.
- Producto "MAS VENDIDO": se elige MANUAL en admin (input posicion 1).
- Emojis en descripciones de productos: el director los limpia MANUAL en admin.
  (Nota: FASE 15 si limpio los campos "emoji" del menu.json.)

FLUJO YA FUNCIONAL (no tocar sin motivo)
- Agregar productos, carrito flotante, cantidad, vaciar.
- WhatsApp directo con mensaje de pedido.
- Contado: panel propio con datos de Pago movil desde menu.json,
  formulario (nombre/direccion/tipo pago/referencia), total rebajado 10%,
  envio WA con Subtotal + Descuento contado (10%) + Total a pagar + Cliente.
- Admin editable: moneda, tasa BCV, descuento contado, datos de pago,
  hero, logo escala/posicion, subir imagenes categoria y foto producto
  via GitHub Contents API (guardan ruta relativa, sin base64).
- Orden de productos por posicion numerica desde admin.

BACKLOG FASE 16 PENDIENTE (decide el director)
(a) Renombrar archivo de producto NUEVO al recibir id definitivo (deuda FASE 11).
(b) Optimizar/reescalar imagenes en assets/img/ (varias >60 KB, no 1:1).
(c) Limpiar .bak-* acumulados (~150 en disco).
(d) Rediseno del carrito (subir al header vs flotante).
(e) Otro definido por el director.

REGLAS DURAS
1. NO frameworks, NO build, NO backend, NO Node, NO CDN externo.
2. NO avanzar sin OK de verificacion tras cada script.
3. Un mensaje = un bloque ejecutable. Esperar confirmacion.
4. Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
5. NO asumir datos del negocio. Preguntar.
6. AL CERRAR FASE: reescribir continuidad.md + entregar prompt actualizado.
7. Regla 8: todo script termina con autocopiado al portapapeles.
8. Diagnostico previo obligatorio al inicio de cada fase (read-only).
9. Cierre de fase = 3 condiciones: verificado local + push + verificado en Pages.
10. PROHIBIDO DevTools/F12 para verificar. Solo PowerShell sobre disco.

NOTAS OPERATIVAS
- Backups .bak-<paso>-<timestamp> antes de tocar cualquier archivo.
- Reemplazos sobre strings unicos (count == 1). Si no, NO escribir.
- Doble buffer: escribir a .tmp-<paso>, validar, Move-Item al original.
- Encoding UTF8 sin BOM con UTF8Encoding($false). NUNCA Set-Content a secas.
- Strings largos: arrays de lineas + -join CRLF. Nada de here-strings pegados.
- Comillas en HTML inline dentro de JS: NUNCA dobles-duplicadas. Verificar
  anchors con PowerShell antes de cerrar el fix.
- categoria.html tiene su PROPIO carrito-panel duplicado del de index.html.
  Toda fase que toque el carrito debe actualizar AMBAS.
- categoria.html tiene su PROPIO boton flotante "Mi pedido" y ahora tambien
  su PROPIO boton flotante "Compartir".
- Git: git fetch + git rebase origin/main si behind. Si conflicto en
  menu.json, NO pushear, pedir al director.
- PS con git: bajar ErrorActionPreference o usar cmd /c "git ... 2>&1".
- git commit: usar archivo de mensaje con -F. Evitar -m con comillas por cmd.

DINAMICA DE OPERACION - PRO ZOERUN (obligatoria)

TIPO 1 - LECTURA (batch hasta 5, agrupar con ;, sin SilentlyContinue)
TIPO 2 - ESCRITURA (UNO solo por bloque, nunca agrupar, nunca mezclar)
TIPO 3 - VERIFICACION (cadena con aborto: cmd1; if ($?) { cmd2 }; ...)

FORMATO
- Un bloque por mensaje, en bloque powershell.
- Sin prosa alrededor (max 1 linea de que espero ver).
- Nunca mas de un bloque por mensaje. Nunca mezclar tipos.
- Duda TIPO 1 vs TIPO 2 -> tratar como TIPO 2.

AUTO-COPIA
- Envolver cada bloque en ZoeRun { [comandos] }.

DINAMICA
1. IA entrega UN bloque.
2. Director ejecuta.
3. Salida al portapapeles, la pega.
4. IA lee, entrega siguiente bloque.
5. Repetir.

PROMPT DE TRASPASO - FASE 16
Continuamos Jilbert Burgers. Lee este contexto completo antes de actuar.
Estado: FASE 15 cerrada (header sin SVG duplicado, emojis fuera del
menu.json, selector de tipo de pago dinamico, hero sin hardcode,
boton Compartir WhatsApp flotante + item en menu hamburguesa,
skeleton loader en index y categoria).
Backlog Fase 16 disponible en este documento.
Reglas duras y dinamica PRO ZOERUN vigentes.
PRIMERA ACCION: confirmar estado git con
  git fetch origin; git status; git log --oneline -3; git log --oneline -3 origin/main
Esperar: HEAD local == origin/main == 813d9e5, working tree clean.
Si NO coincide, PARAR y pedir al director.
Luego preguntar al director cual es la siguiente tarea entre el backlog.
NO asumir. NO empezar sin confirmacion.
