CONTEXTO DEL PROYECTO - JILBERT BURGERS

STACK
- HTML5 + CSS3 + JS puro. SIN frameworks, SIN build, SIN backend, SIN Node, SIN CDN.
- Hosting: GitHub Pages. Repo: jimmya27-del/jilbert-burgers, rama main.
- Local: C:\jilbert_burgers
- Estructura: index.html, categoria.html, hamburguesas.html, salchipapas.html,
  bebidas.html, combos.html, admin.html, assets/{script.js, style.css, menu.json}
- Fuente de datos: assets/menu.json (negocio, hero, categorias con productos).

ESTADO GIT AL INICIO DE ESTA SESION
- HEAD = origin/main = (confirmar hash tras push FASE 13).
- Working tree limpio.

QUE SE CERRO EN FASE 13
- Vista unificada en index.html: se muestran TODOS los productos de una sola
  vez (sin obligar al cliente a navegar por categoria y volver).
- Filtro por categoria movido a un menu hamburguesa (tres rayitas) en la
  esquina superior izquierda, para quien quiera ver solo combos / hamburguesas
  / salchipapas / bebidas.
- Admin: el control de orden dejo de usar flechas subir/bajar y paso a input
  numerico de posicion (1, 2, 3, ...). El admin escribe el numero y el
  producto se reordena a esa posicion.
- El orden definido en admin se respeta en la vista unificada del index.

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

BACKLOG FASE 14 (decide el director)
(a) Renombrar archivo de producto NUEVO al recibir id definitivo
    (deuda FASE 11).
(b) Optimizar/reescalar imagenes en assets/img/ (varias >60 KB, no 1:1).
(c) Limpiar .bak-* acumulados (~150 en disco).
(d) Rediseno del carrito (subir al header vs flotante).
(e) Limpiar campos emoji de menu.json (ya no se usan en web).
(f) Otro definido por el director.

REGLAS DURAS
1. NO frameworks, NO build, NO backend, NO Node, NO CDN externo.
2. NO avanzar sin OK de verificacion tras cada script.
3. Un mensaje = un bloque ejecutable. Esperar confirmacion.
4. Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
5. NO asumir datos del negocio. Preguntar.
6. AL CERRAR FASE: reescribir continuidad.md + entregar prompt actualizado.
7. Regla 8: todo script termina con autocopiado al portapapeles.
8. Diagnostico previo obligatorio al inicio de cada fase (read-only).
9. Cierre de fase = 3 condiciones: verificado local + push + verificado
   en Pages.
10. PROHIBIDO DevTools/F12 para verificar. Solo PowerShell sobre disco.

NOTAS OPERATIVAS
- Backups .bak-<paso>-<timestamp> antes de tocar cualquier archivo.
- Reemplazos sobre strings unicos (count == 1). Si no, NO escribir.
- Doble buffer: escribir a .tmp-<paso>, validar, Move-Item al original.
- Encoding UTF8 sin BOM con UTF8Encoding($false). NUNCA Set-Content a secas.
- Strings largos: arrays de lineas + -join CRLF. Nada de here-strings
  pegados.
- Comillas en HTML inline dentro de JS: NUNCA dobles-duplicadas. Verificar
  anchors con PowerShell antes de cerrar el fix.
- categoria.html tiene su PROPIO carrito-panel duplicado del de index.html.
  Toda fase que toque el carrito debe actualizar AMBAS.
- Git: git fetch + git rebase origin/main si behind. Si conflicto en
  menu.json, NO pushear, pedir al director.
- PS con git: bajar ErrorActionPreference o usar cmd /c "git ... 2>&1".

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

PROMPT DE TRASPASO - FASE 14
Continuamos Jilbert Burgers. Lee este contexto completo antes de actuar.
Estado: FASE 13 cerrada (vista unificada de productos en index + filtro
por menu hamburguesa + orden de productos por posicion numerica en admin).
Backlog Fase 14 disponible en este documento.
Reglas duras y dinamica PRO ZOERUN vigentes.
PRIMERA ACCION: preguntar al director cual es la siguiente tarea. NO
asumir. NO empezar por ningun item del backlog sin confirmacion.
