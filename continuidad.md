# Continuidad - Jilbert Burgers

Ultima actualizacion: 2026-10-12 (cierre FASE 8, traspaso FASE 9).

## Proyecto
- Negocio: Jilbert Burgers - comida rapida - Maracay, Venezuela.
- Stack: HTML5 + CSS3 + JS puro. SIN frameworks, SIN build, SIN backend, SIN CDN.
- Hosting: GitHub Pages (repo jimmya27-del/jilbert-burgers, rama main).
- Local: C:\jilbert_burgers
- Web publica: index.html + categoria.html (render dinamico por slug via ?cat=).
- Admin: admin.html.
- Lectura publica: assets/menu.json via fetch.
- Encoding: UTF-8 sin BOM. CRLF.

## Estado del negocio (menu.json)
- negocio.moneda            : EUR
- negocio.tasa_bcv          : Decimal (valor vigente variable)
- negocio.descuento_contado : 10 (Int32)
- negocio.whatsapp          : 0412 4409025
- negocio.pago              : pago_movil + transferencia + instrucciones (editables desde admin)
- negocio.logo              : base64 data:image (PENDIENTE migrar a assets/img/logo.<ext>, FASE 9)

## Estructura menu.json
.negocio             -> PSCustomObject
  .moneda            -> String  (EUR)
  .tasa_bcv          -> Decimal
  .descuento_contado -> Int32
  .whatsapp .direccion .facebook .correo -> String
  .logo              -> String  (data:image/...;base64,...)  [PENDIENTE FASE 9]
  .logo_pos          -> PSCustomObject
  .pago              -> PSCustomObject
    .pago_movil      -> { banco, telefono, cedula, titular }
    .transferencia   -> { banco, cuenta, tipo, cedula, titular }
    .instrucciones   -> String
.hero                -> PSCustomObject
.categorias          -> PSCustomObject (slug -> { titulo, emoji, productos: [] })

## Historial de fases
- IA 1..6, FASE 6-bis        [CERRADAS]
- FASE 7-A: migracion aditiva menu.json                          [CERRADA]
- FASE 7-B: render carrito moneda + tasa + Bs                    [CERRADA]
- FASE 7-C: panel de pago en el carrito                          [CERRADA]
- FASE 7-D: WhatsApp con dos mensajes distintos                  [CERRADA]
- FASE 7-E: admin editable moneda + tasa + descuento             [CERRADA]
- FASE 7-F: admin editable datos de pago                         [CERRADA 2026-10-12, ca06e1c]
- FASE 8:   cambio USD->EUR en render publico (unificar fallback)[CERRADA 2026-10-12, 23b039c]
            Detalles:
              * script.js: fallback EUR unificado en simboloMoneda() y monedaActual().
              * admin.html: input data-negocio="moneda" y guardarNegocio() con fallback EUR.
                Helper simboloDeMoneda(m) insertado. menuCache.simbolo derivado
                tras cada asignacion de menuCache. subirMenuAGitHub() serializa
                copia sin .simbolo. Fallbacks || '$' migrados a || '\u20ac'.
              * index.html + categoria.html: placeholder estatico &euro;0.00.
- FASE 9:   migracion del logo base64 de menu.json a archivo externo [ACTIVA]

## Reglas duras vigentes
NO frameworks, NO build, NO backend, NO Node, NO CDN externo.
NO avanzar sin OK de verificacion tras cada script.
Un mensaje = un bloque ejecutable. Esperar confirmacion.
Acentos: HTML entidades, JS/CSS/JSON escapes Unicode, PS sin acentos.
NO asumir datos del negocio. Preguntar.
AL CERRAR FASE: reescribir continuidad.md y entregar PROMPT DE TRASPASO actualizado.
NO crear ni leer archivos de prompt en _sesion.
TODO script con autocopiado al portapapeles (Regla 8).
REGLA 2026-10-12: DIAGNOSTICO PREVIO OBLIGATORIO antes de tocar nada.
REGLA DE CIERRE 2026-10-11: local + push origin/main + Ctrl+F5 en Pages.

## Notas operativas NUEVAS (derivadas de errores de FASE 8, obligatorias)
- PROHIBIDO here-strings (@'...'@) pegados en consola PS: parseo fragil.
- PROHIBIDO $script:out dentro de function anidada en & {}: se pierde.
- PROHIBIDO CountOcc con [string] por posicion: usar IndexOf inline.
- OBLIGATORIO doble buffer en toda escritura: tmp + validar + Move-Item.
- Umbrales de aborto por tamano calibrados con el real medido antes.
- Usar cmd /c "git <args> 2>&1" para evitar NativeCommandError en PS.

## FASE 9 - pendiente
Objetivo: migrar negocio.logo base64 a assets/img/logo.<ext>.
Ventajas: menu.json baja de ~218 KB a ~10-15 KB; fetch publico mas rapido;
cada PUT a GitHub Contents API aligera drasticamente.
Retrocompatibilidad: si negocio.logo empieza con data: usarlo tal cual;
si empieza con assets/ o http usarlo como src de <img>.
Tarea 0 de diagnostico obligatoria antes de tocar nada (ver prompt de traspaso).