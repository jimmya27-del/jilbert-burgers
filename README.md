# Jilbert Burgers - Menu Digital Web

Sitio web estatico del menu de Jilbert Burgers (comida rapida).
Permite ver el menu por categorias, armar un pedido y enviarlo por WhatsApp.

## Stack

- HTML5 + CSS3 + JavaScript puro
- Sin frameworks, sin build step, sin dependencias externas
- Hosting: GitHub Pages

## Estructura

```nindex.html              Portada con categorias
hamburguesas.html       Categoria: Hamburguesas
salchipapas.html        Categoria: Salchipapas
bebidas.html            Categoria: Bebidas
combos.html             Categoria: Combos
assets/
  style.css             Estilos (moderno minimalista)
  script.js             Carrito + render + WhatsApp
  menu.json             Datos del menu (4 categorias, 14 productos)
_sesion/                Notas internas (no se publican)
.gitignore
README.md
```n
## Como usarlo en local

Abrir index.html en el navegador. No requiere servidor.

Nota: script.js carga assets/menu.json con fetch. Algunos navegadores
bloquean fetch desde file://. Si los productos no aparecen, sirve la
carpeta con un servidor local simple (por ejemplo python -m http.server).

## Datos del negocio

- WhatsApp: 0412-440-9025 (584124409025)
- Direccion: Barrio San Luis, calle Juan Borges N 11-B, Maracay, Aragua.
- Facebook: Jilbert Burgers
- Correo: jilbertburgers@gmail.com

## Personalizacion rapida

- Productos y precios: editar assets/menu.json.
- Colores y estilos: editar assets/style.css (variables en :root).
- Numero de WhatsApp: campo whatsapp en assets/menu.json.

## Licencia

Uso privado del cliente. Todos los derechos reservados.

