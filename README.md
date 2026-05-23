# God Mode Taller — Arquitectura de Red: Streaming Global
**Redes de Computadoras · Análisis de Escenario Real**

Página web interactiva que analiza la infraestructura de red de un servicio de streaming global (tipo Netflix), cubriendo los cuatro ejes del taller: componentes de red, cálculo de retardos y throughput, protocolos de aplicación y medidas de seguridad por capa OSI.

---

## 📁 Estructura del repositorio

```
/
├── god-mode-taller-redes.html   ← Página principal (HTML5 semántico)
├── estilos.css                  ← Todos los estilos CSS (variables, grid, responsive)
├── script.js                    ← Todo el JavaScript (Canvas 3D, calculadora, filtros)
├── Leame.md                     ← Este archivo
└── informe-taller-redes.html    ← Informe completo del taller (opcional)
```

> Los tres archivos (`html`, `css`, `js`) **deben estar en la misma carpeta** para que la página funcione correctamente.

---

## 🚀 Cómo usar la página

### Opción 1 — Abrir localmente (sin servidor)

1. Descarga los tres archivos: `god-mode-taller-redes.html`, `estilos.css` y `script.js` en la **misma carpeta**.
2. En Android con Chrome: abre la app **Archivos** → navega a la carpeta → toca el `.html`.
3. En iPhone con Safari: usa la app **Archivos** de iOS → toca el `.html`.
4. En computadora: doble clic sobre `god-mode-taller-redes.html`.

> ⚠️ **No abras solo el `.html`** sin los otros dos archivos en la misma carpeta: la página se verá sin estilos ni interactividad.

### Opción 2 — GitHub Pages (recomendado para compartir)

1. Sube los tres archivos al repositorio en la rama `main`.
2. Ve a **Settings → Pages → Source → Deploy from branch → main / root**.
3. GitHub generará una URL pública del tipo:
   ```
   https://<tu-usuario>.github.io/<nombre-repo>/god-mode-taller-redes.html
   ```
4. Esa URL abre la página en cualquier dispositivo sin descargar nada.

### Opción 3 — Servidor local con VS Code

1. Instala la extensión **Live Server** en VS Code.
2. Abre la carpeta del proyecto.
3. Clic derecho sobre `god-mode-taller-redes.html` → **Open with Live Server**.
4. Se abre automáticamente en `http://localhost:5500`.

---

## 📱 Compatibilidad

| Dispositivo | Navegador | Estado |
|---|---|---|
| Android | Chrome 90+ | ✅ Completo |
| Android | Firefox | ✅ Completo |
| iPhone / iPad | Safari 15+ | ✅ Completo |
| iPhone / iPad | Chrome | ✅ Completo |
| Windows / Mac | Chrome, Edge, Firefox | ✅ Completo |

> La página usa `background-attachment: scroll` (no `fixed`) para compatibilidad con iOS Safari. El Canvas 3D requiere soporte de WebGL básico (disponible en todos los navegadores modernos).

---

## 🧩 Secciones de la página

| # | Sección | Descripción |
|---|---|---|
| 01 | **Topología 3D** | Diagrama animado con Canvas API: 15 nodos, 25 conexiones, partículas de datos en tiempo real |
| 02 | **Componentes de Red** | 8 tarjetas filtrables por tipo (Edge, ISP, CDN, Core, Origen) |
| 03 | **Retardos & Throughput** | Fórmulas de d_prop, d_trans, d_cola (M/M/1) y RTT total con barras animadas |
| 04 | **Protocolos** | Flujo paso a paso (DNS → TLS → HTTP/3 → DASH → SMTP) + tabla comparativa responsive |
| 05 | **Seguridad** | Matriz de 8 medidas por criticidad (Crítico → Estándar) + mapa OSI |

---

## 🎛️ Controles interactivos

### Panel lateral (Aside)

| Control | Función |
|---|---|
| **Filtrar Componentes** | Muestra u oculta tarjetas por tipo de nodo (Edge / ISP / CDN / Core / Origen) con transición CSS |
| **Calculadora de Retardo** | Calcula d_prop, d_trans, d_cola y RTT en tiempo real con los parámetros que ingreses |
| **Diagrama 3D** | Ajusta velocidad del flujo (0.5× – 4×), ángulo de vista 3D (0°–40°), etiquetas y efecto glow |
| **Escenario** | Cambia entre Netflix/Streaming, Empresa Distribuida e IoT Industrial |

### Controles rápidos en el diagrama
Los sliders de **Velocidad** y **Ángulo 3D** aparecen directamente en el header del diagrama para acceso inmediato sin abrir el aside.

---

## ⌨️ Navegación por teclado (Accesibilidad)

- `Tab` — Navegar entre todos los controles interactivos
- `Enter` / `Space` — Activar botones y expandir/colapsar grupos del aside
- Los paneles del aside tienen `role="button"` y `aria-expanded` correctamente configurados
- Todos los inputs tienen `<label>` asociado
- Las visualizaciones tienen `role="img"` con `aria-label` descriptivo
- Contraste WCAG AA cumplido en toda la paleta de colores

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5 semántico** | `<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<article>` |
| **CSS Grid** | Layout principal responsive con `grid-template-areas` |
| **CSS Flexbox** | Organización interna de componentes del aside y tarjetas |
| **CSS Custom Properties** | Sistema de tokens de diseño (colores, tipografía, espaciado) |
| **Canvas API** | Diagrama 3D animado con proyección oblicua y partículas |
| **JavaScript ES6+** | `const/let`, arrow functions, template literals, desestructuración |
| **IntersectionObserver** | Activación de animaciones al hacer scroll |
| **Google Fonts** | Rajdhani, Share Tech Mono, Exo 2 (con `display=swap`) |

---

## 📐 Breakpoints responsive

| Ancho | Layout |
|---|---|
| `< 360px` | Todo en columna única |
| `360px – 499px` | Componentes y seguridad en 2 columnas |
| `500px – 767px` | Protocolos en 2 columnas; tabla como tarjetas |
| `768px – 1099px` | Main + aside lateral (240px) |
| `≥ 1100px` | Main + aside lateral (280px) |

---

## 📝 Notas técnicas del contenido

### BBR vs CUBIC en QUIC
Para streaming masivo se prefiere **BBR** (control de congestión basado en retraso) sobre CUBIC (basado en pérdida), ya que BBR maximiza el throughput en enlaces residenciales con fluctuaciones (WiFi, 4G/5G) sin necesitar eventos de pérdida para ajustar la ventana.

### SMTP Relay
En arquitecturas globales, el microservicio de notificaciones delega el envío de correos a un **SMTP Relay especializado** (AWS SES o SendGrid) para garantizar entrega en bandeja de entrada con las políticas estrictas de DMARC p=reject activas.

---

## 📄 Licencia

Proyecto académico — God Mode Taller · Redes de Computadoras 
