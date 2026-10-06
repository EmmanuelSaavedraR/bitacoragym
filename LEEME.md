# Bitácora de Hierro · guía de instalación

Una app para registrar entrenamientos, medidas, peso y comida con aspecto de app nativa de iPhone.
No depende de Claude ni de ningún enlace de terceros: tú eres dueño de los datos (en tu propio
Supabase) y de la app (archivos estáticos que alojas donde quieras).

Tiempo estimado: 20 minutos. Costo: $0 con los planes gratuitos de Supabase y de cualquiera de los servicios de alojamiento de abajo.

---

## 1. Crear la base de datos (Supabase)

1. Entra a <https://supabase.com>, crea una cuenta y un **New project** (elige la región más cercana y guarda la contraseña de la base de datos).
2. Cuando termine de crearse, abre **SQL Editor → New query**, pega **todo** el contenido de `schema.sql` y presiona **Run**. Debe decir *Success*. Es seguro volver a ejecutarlo.
3. Ve a **Authentication → Sign In / Providers → Email** y desactiva **Allow new users to sign up** (así nadie más puede crear cuentas) y, si quieres, **Confirm email**.
4. Ve a **Authentication → Users → Add user → Create new user**: pon tu correo y una contraseña, y marca **Auto Confirm User**. Esa será tu cuenta para entrar a la app.
5. Ve a **Project Settings → API** y copia dos datos: **Project URL** y la clave **anon public**.
   La clave anon es pública por diseño: lo que protege tus datos es el inicio de sesión más la seguridad por fila que creó `schema.sql`.

## 2. Poner tus datos en la app

Abre `config.js` con cualquier editor de texto y reemplaza los dos valores:

```js
window.BH_CONFIG = {
  SUPABASE_URL: "https://abcdxyz.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."
};
```

(Si prefieres no editar nada, también puedes subir la app tal cual: la primera vez te pedirá estos dos datos en pantalla y los guarda en el teléfono.)

## 3. Alojar la carpeta (elige uno)

La app son archivos estáticos; cualquier servicio que los sirva por **HTTPS** sirve.

- **Netlify Drop** (lo más fácil): entra a <https://app.netlify.com/drop> y arrastra la carpeta `bitacora-app` completa. Te da una dirección tipo `https://nombre.netlify.app`.
- **Cloudflare Pages**: *Workers & Pages → Create → Pages → Upload assets* y sube la carpeta.
- **GitHub Pages**: crea un repositorio, sube los archivos y activa *Settings → Pages* sobre la rama principal.

Guarda esa dirección: es tu app.

## 4. Instalarla en el iPhone

1. Abre la dirección en **Safari** (tiene que ser Safari).
2. Toca **Compartir** (cuadro con flecha) → **Añadir a pantalla de inicio** → **Añadir**.
3. Ábrela desde el ícono. Inicia sesión una sola vez con el correo y la contraseña del paso 1.4.
4. La primera vez, con la cuenta vacía, la app carga una biblioteca de 32 ejercicios y 4 rutinas (Torso A, Pierna A, Torso B, Pierna B). Edítalas en **Más → Rutinas / Ejercicios**.

> En iOS la app instalada guarda sus datos aparte de Safari. Por eso conviene editar `config.js` (paso 2) antes de subirla: así no tienes que escribir la configuración en el teléfono.

---

## Cómo funciona

**Sin internet.** La app abre sin señal y todo lo que registres se guarda en el teléfono; en cuanto vuelve la conexión se envía solo (verás un aviso azul mientras haya cambios por enviar). La primera vez que entras sí necesitas internet.

**Una sesión iniciada por error.** En la sesión toca **Cancelar** (arriba a la izquierda) o **Terminar** sin haber marcado series: la app te ofrece descartar y no queda nada registrado. Una sesión que lleva más de 8 horas abierta muestra un aviso para descartarla. Las sesiones ya guardadas pueden ir a la **papelera** y restaurarse.

**Sesiones flexibles.** Además de las rutinas, en *Entrenar* puedes **armar una sesión por grupos** (por ejemplo pecho + espalda, o pecho + pierna) o abrir una **sesión en blanco**. Solo las sesiones hechas con una rutina avanzan la rotación.

**Entrenador.** No hay IA integrada ni claves que configurar. La pestaña *Entrenador* prepara un prompt con tus últimas 12 semanas (sesiones, volumen por grupo, peso, medidas, comida y récords): lo copias y lo pegas en un chat de Claude o en tu agente. Dentro de una sesión, **Plan del entrenador** te da un prompt que pide la propuesta del día en JSON; pegas la respuesta y se llenan los pesos y repeticiones sugeridos (en azul).

**Tus datos y las gráficas externas.** Cada serie es una fila (`session_sets`). La vista **`series_flat`** de Supabase ya trae una fila por serie con fecha, ejercicio, kg, reps, RIR, e1RM y volumen: conéctala a Looker Studio, Metabase, Google Sheets (con un conector de PostgreSQL), Python, etc. También puedes exportar CSV desde **Más → Exportar datos**: se abre el menú de compartir de iOS (Archivos, Drive, Hojas de cálculo).

**Respaldo.** *Más → Exportar datos → Respaldo completo (JSON)*, o los backups automáticos de Supabase.

## Actualizar la app

Sustituye los archivos en tu servicio de alojamiento. La app instalada se actualiza sola: la próxima vez que la abras ya tiene la versión nueva (si no, ciérrala por completo y ábrela otra vez). Si cambias archivos, sube también el número de `CACHE` en `sw.js` (por ejemplo `bitacora-v2`).

## Contenido de la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La interfaz |
| `data.js` | Base de datos local, cola sin conexión y sincronización con Supabase |
| `config.js` | **Lo único que debes editar**: URL y clave de Supabase |
| `schema.sql` | Tablas, seguridad por fila y la vista `series_flat` |
| `sw.js`, `manifest.webmanifest`, `icons/` | Instalación y funcionamiento sin conexión |
| `vendor/supabase.js` | Librería oficial de Supabase (copia local) |

## Si algo falla

- **“Correo o contraseña incorrectos”**: revisa que el usuario se creó con *Auto Confirm User* en Authentication → Users.
- **La pantalla pide “Conectar con Supabase”**: `config.js` aún tiene los valores de ejemplo.
- **“Un cambio no se pudo guardar”**: casi siempre es que `schema.sql` no se ejecutó completo. Vuelve a correrlo; el detalle del error está en *Más → Cuenta y sincronización*.
- **No aparece “Añadir a pantalla de inicio”**: ábrela en Safari (no dentro de otra app) y desde una dirección **https**.
