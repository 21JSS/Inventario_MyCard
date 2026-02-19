# 🟦 CSS — Documentación

## Archivos

| Archivo             | Descripción                                    |
| ------------------- | ---------------------------------------------- |
| `InventarioPCs.css` | Estilos principales de la página de inventario |
| `Estilo.css`        | Estilos de la página de inicio (landing page)  |

---

## ¿Qué es CSS?

CSS (**Cascading Style Sheets**) es el lenguaje que define la **apariencia visual** de una página web: colores, tamaños, posiciones, animaciones, etc.

```css
selector {
  propiedad: valor;
}
```

### ¿Qué significa "Cascading" (Cascada)?

Los estilos se aplican en **orden de prioridad**:

1. Estilos en línea (`style="..."`) — **Mayor prioridad**
2. ID (`#miId { }`)
3. Clase (`.miClase { }`)
4. Elemento (`p { }`, `div { }`) — **Menor prioridad**

Si hay conflictos, gana el de mayor prioridad. `!important` **rompe** esta regla y fuerza un estilo.

---

## `InventarioPCs.css` — Análisis Completo

### Variables CSS (`:root`)

```css
:root {
  --mycard-color: #00c6e6;
  --gradiente-oscuro: #191e2b;
  --shadow-buttons: #2769dc66;
  --color-text-mycard: #086ceeb4;
  --color-body: #ffffff;
  --boton-excel: #30d148;
  --transparencia: 0.3;
}
```

#### ¿Qué es `:root`?

Es un selector que apunta al **elemento raíz del documento** (`<html>`). Se usa para definir **variables CSS** que pueden reutilizarse en todo el archivo.

#### ¿Qué es una variable CSS?

Se definen con `--nombre` y se usan con `var(--nombre)`:

```css
/* Definir */
:root {
  --mi-color: #ff0000;
}

/* Usar */
h1 {
  color: var(--mi-color); /* Resultado: #ff0000 */
}
```

**Ventaja:** Si quieres cambiar el color en todo el proyecto, solo cambias la variable en `:root`.

#### Colores en CSS

| Formato       | Ejemplo                   | Explicación                                      |
| ------------- | ------------------------- | ------------------------------------------------ |
| Hexadecimal   | `#00c6e6`                 | 6 dígitos: RR GG BB (00=rojo, c6=verde, e6=azul) |
| Hex con alpha | `#2769dc66`               | 8 dígitos: RR GG BB AA (66 = ~40% opacidad)      |
| RGB           | `rgb(255, 255, 255)`      | Rojo, Verde, Azul (0-255)                        |
| RGBA          | `rgba(0, 0, 0, 0.5)`      | RGB + Alpha (0=transparente, 1=opaco)            |
| RGB moderno   | `rgb(255 255 255 / 0.14)` | Sintaxis nueva sin comas                         |

---

### Estilos del Body

```css
body {
  background: rgba(0, 0, 0, 255); /* Fondo negro sólido */
  min-height: 100vh; /* Mínimo 100% de la altura visible */
  margin: 0; /* Sin margen exterior */
  padding: 20px; /* Espacio interior de 20px */
  overflow-y: visible !important; /* Permite scroll vertical */
  overflow-x: hidden; /* Oculta scroll horizontal */
}
```

#### ¿Qué es `vh`?

- `vh` = **Viewport Height** (altura de la ventana del navegador)
- `100vh` = 100% de la altura visible
- `50vh` = 50% de la altura visible

#### ¿Qué es `!important`?

Fuerza un estilo a tener la **máxima prioridad**, ignorando la cascada normal:

```css
overflow-y: visible !important; /* Este estilo NO puede ser sobreescrito */
```

> ⚠️ Usar con moderación. Abusar de `!important` dificulta el mantenimiento del código.

---

### Tarjetas de Estadísticas (`.stat-card`)

```css
.stat-card {
  background: rgb(255 255 255 / 0.14); /* Fondo blanco al 14% de opacidad */
  border-radius: 15px; /* Esquinas redondeadas */
  padding: 35px; /* Espacio interior */
  color: white;
  transition:
    transform 0.3s ease-in,
    /* Animación de movimiento */ box-shadow 0.4s ease-in-out; /* Animación de sombra */
}

.stat-card:hover {
  transform: translateY(-23px); /* Se eleva 23px al pasar el mouse */
  box-shadow: 0 8px 16px var(--shadow-buttons); /* Sombra azul */
}
```

#### ¿Qué es `transition`?

Anima el cambio de un valor CSS de forma **suave**:

```css
transition: propiedad duración función-de-tiempo;
```

- **`transform 0.3s ease-in`** → La transformación dura 0.3 segundos, empieza lento.
- **`ease-in`** → Empieza lento, termina rápido.
- **`ease-in-out`** → Empieza y termina lento, rápido en el medio.
- **`ease`** → Similar a ease-in-out pero más natural.

#### ¿Qué es `transform`?

Modifica la posición, tamaño o rotación de un elemento **sin afectar el layout**:

```css
transform: translateY(-23px); /* Mueve hacia arriba 23px */
transform: translateX(10px); /* Mueve hacia la derecha 10px */
transform: translateY(-50%); /* Mueve hacia arriba 50% de su propia altura */
transform: scale(1.1); /* Agranda al 110% */
transform: rotate(45deg); /* Rota 45 grados */
```

#### ¿Qué es `box-shadow`?

Agrega una sombra al elemento:

```css
box-shadow: desplazamiento-x desplazamiento-y difuminado color;
box-shadow: 0 8px 16px rgba(39, 105, 220, 0.4);
/*          sin mover         abajo 8px         difusión     azul semitransparente */
```

---

### Layout con Flexbox

```css
.button-group {
  display: flex; /* Activa Flexbox: los hijos se colocan en fila */
  gap: 15px; /* Espacio entre cada hijo */
  flex-wrap: wrap; /* Si no caben, saltan a la siguiente línea */
}
```

#### ¿Qué es Flexbox?

Es un sistema de **layout unidimensional** (una fila O una columna):

```css
display: flex; /* Activa Flexbox */
flex-direction: row; /* Hijos en fila (por defecto) */
flex-direction: column; /* Hijos en columna */
flex-direction: column-reverse; /* Columna invertida (último primero) */
justify-content: space-between; /* Distribuye espacio entre los hijos */
justify-content: center; /* Centra horizontalmente */
align-items: center; /* Centra verticalmente */
gap: 15px; /* Espacio entre hijos */
flex-wrap: wrap; /* Permite salto de línea */
flex: 1; /* El hijo ocupa todo el espacio disponible */
```

---

### Layout con Grid

```css
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
```

#### ¿Qué es Grid?

Es un sistema de **layout bidimensional** (filas Y columnas):

- **`repeat(auto-fit, minmax(200px, 1fr))`** significa:
  - Crea tantas columnas como quepan.
  - Cada columna tiene mínimo 200px y máximo el espacio disponible (`1fr`).
  - Si la pantalla es chica, se hace una sola columna; si es grande, dos o tres.

---

### Posicionamiento (`position`)

```css
.search-icon {
  position: absolute; /* Se posiciona relativo a su padre con position: relative */
  left: 15px; /* 15px desde la izquierda */
  top: 50%; /* 50% desde arriba */
  transform: translateY(-50%); /* Centrado vertical exacto */
}

.search-wrapper {
  position: relative; /* El padre debe tener esto para que absolute funcione */
}
```

#### Tipos de `position`

| Valor      | Comportamiento                                                      |
| ---------- | ------------------------------------------------------------------- |
| `static`   | Posición normal (por defecto)                                       |
| `relative` | Se mueve relativo a su posición original                            |
| `absolute` | Se mueve relativo a su **ancestro con position: relative**          |
| `fixed`    | Se fija a la ventana del navegador (no se mueve con scroll)         |
| `sticky`   | Se comporta como relative hasta que llega a un punto, luego se fija |

---

### Efecto Glassmorphism

```css
.controls {
  background: rgb(255 255 255 / 0.14); /* Fondo semitransparente */
  backdrop-filter: blur(10px); /* Desenfoque del fondo */
  border-radius: 20px; /* Esquinas redondeadas */
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); /* Sombra profunda */
}
```

#### ¿Qué es `backdrop-filter`?

Aplica un efecto visual al **fondo que está detrás del elemento** (no al elemento mismo). `blur(10px)` desenfoca lo que hay detrás, creando el efecto de "vidrio esmerilado".

---

### Pseudo-selectores

```css
/* :hover → cuando el mouse está encima del elemento */
button:hover {
  transform: translateY(-2px);
}

/* :focus → cuando el campo está activo (clic o Tab) */
.search-box:focus {
  border-color: #2282e7;
}

/* :first-child → el primer hijo */
th:first-child {
  border-top-left-radius: 10px;
}

/* :last-child → el último hijo */
th:last-child {
  border-top-right-radius: 10px;
}

/* ::before y ::after → elementos decorativos generados por CSS */
*::before,
*::after {
  box-sizing: border-box;
}
```

---

### Modales

```css
.modal {
  position: fixed; /* Fijo a la ventana */
  z-index: 1000; /* Encima de todo */
  left: 0;
  top: 0;
  width: 100%;
  height: 100%; /* Cubre toda la pantalla */
  background-color: rgba(0, 0, 0, 0.5); /* Fondo oscuro semitransparente */
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /* Centra verticalmente */
}
```

#### ¿Qué es `z-index`?

Controla qué elemento queda **encima** de otro cuando se superponen:

- `z-index: 1000` → Queda encima de elementos con `z-index` menor.
- Solo funciona en elementos con `position` distinto de `static`.

---

### `box-sizing: border-box`

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

#### ¿Qué hace?

Cambia cómo se calculan las dimensiones:

- **`content-box`** (por defecto): `width = contenido`. El padding y border se **suman** al ancho.
- **`border-box`**: `width = contenido + padding + border`. El tamaño total **nunca excede** el width declarado.

> Se aplica a **todos los elementos** (`*`) para evitar problemas de tamaño. Es una buena práctica estándar.

---

## `Estilo.css` — Landing Page

Estilos para la página de entrada del proyecto, con diseño oscuro y gradientes.

### Elementos destacados:

```css
body {
  background-color: #070714;
  background-image: radial-gradient(
    ellipse at 50% 30%,
    rgba(39, 105, 220, 0.35) 0%,
    transparent 70%
  );
}
```

- **`radial-gradient`** — Gradiente circular/elíptico. Crea un resplandor azul centrado sobre el fondo oscuro.

```css
.presionarparaver {
  border-radius: 50px; /* Forma de píldora */
  background: linear-gradient(
    135deg,
    #2f4fa0,
    #457bc6
  ); /* Gradiente diagonal */
  box-shadow: 0 0 20px rgba(39, 105, 220, 0.4); /* Glow azul */
  transition: all 0.3s ease;
}
```

```css
.Titulo {
  font-size: clamp(1.8rem, 5vw, 2.5rem); /* Tamaño responsivo */
  letter-spacing: -0.2em; /* Letras más juntas */
}
```

#### ¿Qué es `clamp()`?

Establece un valor con **mínimo, preferido y máximo**:

```css
font-size: clamp(1.8rem, 5vw, 2.5rem);
/*               mínimo  ideal  máximo */
```

- En pantallas pequeñas: 1.8rem.
- En pantallas medianas: 5% del ancho de la ventana.
- En pantallas grandes: máximo 2.5rem.

#### ¿Qué es `rem`?

- `rem` = Relativo al tamaño de fuente del `<html>` (normalmente 16px).
- `1rem` = 16px, `2rem` = 32px, `0.5rem` = 8px.
- A diferencia de `px`, se escala si el usuario cambia el tamaño de fuente del navegador.

### Media Queries — Responsividad

```css
@media (max-width: 768px) {
  .Titulo h1 {
    font-size: 1.2rem;
  }
}
```

#### ¿Qué son las Media Queries?

Aplican estilos **solo cuando se cumple una condición**:

- `max-width: 768px` → Se aplica cuando la pantalla es de **768px o menos** (tablets y móviles).
- Permiten adaptar el diseño a diferentes dispositivos.

---

## Resumen de Propiedades CSS Usadas

| Propiedad                  | Descripción                                  |
| -------------------------- | -------------------------------------------- |
| `display: flex`            | Layout en fila o columna                     |
| `display: grid`            | Layout en cuadrícula 2D                      |
| `position: absolute/fixed` | Posicionamiento fuera del flujo normal       |
| `transition`               | Animación suave entre estados                |
| `transform`                | Mover, escalar o rotar elementos             |
| `box-shadow`               | Sombra exterior                              |
| `backdrop-filter`          | Efecto de desenfoque en el fondo             |
| `border-radius`            | Esquinas redondeadas                         |
| `z-index`                  | Orden de apilamiento (qué queda encima)      |
| `opacity`                  | Transparencia del elemento (0-1)             |
| `overflow`                 | Comportamiento del contenido que se desborda |
| `clamp()`                  | Valor responsivo con mín/ideal/máx           |
| `var()`                    | Usa una variable CSS                         |

---

_📖 Ver también: [HTML README](../html/README.md) · [JavaScript README](../scripts/README.md) · [PHP README](../README_PHP.md) · [Python README](../python/README.md)_
