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
4. La primera vez, con la cuenta vacía, la app carga 32 ejercicios y 4 rutinas (Torso A, Pierna A, Torso B, Pierna B). Edítalas en **Más → Rutinas / Ejercicios**. En **Más → Ejercicios → Biblioteca** hay 120 ejercicios más para agregar con un toque.

> En iOS la app instalada guarda sus datos aparte de Safari. Por eso conviene editar `config.js` (paso 2) antes de subirla: así no tienes que escribir la configuración en el teléfono.

---

## Cómo funciona

**Sin internet.** La app abre sin señal y todo lo que registres se guarda en el teléfono; en cuanto vuelve la conexión se envía solo (verás un aviso azul mientras haya cambios por enviar). La primera vez que entras sí necesitas internet.

**Una sesión iniciada por error.** En la sesión toca **Cancelar** (arriba a la izquierda) o **Terminar** sin haber marcado series: la app te ofrece descartar y no queda nada registrado. Una sesión que lleva más de 8 horas abierta muestra un aviso para descartarla. Las sesiones ya guardadas pueden ir a la **papelera** y restaurarse.

**Sesiones flexibles.** Además de las rutinas, en *Entrenar* puedes **armar una sesión por grupos** (por ejemplo pecho + espalda, o pecho + pierna) o abrir una **sesión en blanco**. Solo las sesiones hechas con una rutina avanzan la rotación.

**Entrenador.** No hay IA integrada ni claves que configurar. La pestaña *Entrenador* prepara un prompt con tus últimas 12 semanas (sesiones, volumen por grupo, peso, medidas, comida y récords): lo copias y lo pegas en un chat de Claude o en tu agente. Dentro de una sesión, **Plan del entrenador** te da un prompt que pide la propuesta del día en JSON; pegas la respuesta y se llenan los pesos y repeticiones sugeridos (en azul).

**Ejercicios y récords.** *Más → Ejercicios* tiene búsqueda, filtros por músculo, favoritos (★) y archivado. Cada ejercicio tiene una **ficha** con su 1RM estimado, el peso máximo, el **mejor peso por repeticiones** (1, 2, 3, 5, 6, 8, 10, 12 y 15), los récords rotos, gráficas y el historial; se abre desde la lista, desde *Progreso → Récords* y desde el historial. Cada ejercicio guarda su propio rango de repeticiones, descanso y series: al **reemplazar** un ejercicio en una sesión o rutina se usan los del nuevo. Al terminar una sesión, la app avisa si rompiste un récord.

**Durante la sesión.** Una mini barra flotante (como el reproductor de música) muestra cuánto llevas entrenando, el ejercicio actual y el descanso. Se ve en todas las pestañas y al tocarla regresas a la sesión. El descanso es una cuenta regresiva con anillo; al llegar a cero la barra se pone verde y empieza a contar el tiempo extra, y se queda ahí hasta que marques la siguiente serie, sumes 15 s u omitas (no desaparece sola). Sobrevive si cierras la app. No usa vibración. Al marcar la última serie, el ejercicio **se pliega solo** a una línea (✓, nombre, series y mejor serie) y la pantalla baja al siguiente; tócalo para desplegarlo. Una línea fina bajo la barra superior tiene un segmento por ejercicio y se llena con sus series.

**Estadísticas.** *Progreso → Estadísticas* (periodos de 7, 30, 90 días o todo): sesiones, series, volumen, sesiones por semana y duración; el **calendario de días entrenados** del mes; series por grupo muscular contra tu meta semanal; distribución del trabajo por músculo; equilibrio empuje / jalón / pierna; tus ejercicios principales (más frecuentes o con más volumen, con acceso a su ficha) y las sesiones por semana de las últimas 8 semanas.

**Reordenar y botón atrás.** Los ejercicios y rutinas se reordenan **arrastrando el asa ⋮⋮**. El botón o gesto de atrás del teléfono cierra primero menús y hojas, luego regresa de subpantallas y pestañas; solo en la pantalla de inicio pide «atrás» una segunda vez para salir.

**Registrar con Claude.** En *Cuerpo → Comida → Registrar con Claude*: copias un prompt (ya incluye la fecha, tus metas, lo que registraste hoy y tus alimentos frecuentes), lo pegas en un chat de Claude y le cuentas qué comiste, aunque sea en varias veces durante el día. Claude responde con un bloque JSON; lo pegas en la app, ves una **vista previa con totales** y confirmas. Si ese día ya tenías registros, eliges entre agregar o reemplazar el día. El mismo JSON puede traer tu peso. *Más → Ejercicios → Pedir a Claude* hace lo mismo para crear ejercicios nuevos (se omiten los que ya existen).

**Tus datos y las gráficas externas.** Cada serie es una fila (`session_sets`). La vista **`series_flat`** de Supabase ya trae una fila por serie con fecha, ejercicio, kg, reps, RIR, e1RM y volumen: conéctala a Looker Studio, Metabase, Google Sheets (con un conector de PostgreSQL), Python, etc. También puedes exportar CSV desde **Más → Exportar datos**: se abre el menú de compartir de iOS (Archivos, Drive, Hojas de cálculo).

**Respaldo.** *Más → Exportar datos → Respaldo completo (JSON)*, o los backups automáticos de Supabase.

## Actualizar la app

Si ya tenías la base de datos creada antes de esta versión, ejecuta **una sola vez** `migracion-2.sql` (Supabase → SQL Editor → New query → Run). Si no lo haces, la app te lo recuerda con un aviso azul y te muestra el SQL con un botón «Copiar SQL» (también en *Más → Cuenta*). Mientras tanto todo funciona; solo no se guardan en tu base los rangos propios, favoritos y notas de técnica.

Sustituye los archivos en tu servicio de alojamiento. La app instalada se actualiza sola: la próxima vez que la abras ya tiene la versión nueva (si no, ciérrala por completo y ábrela otra vez). Si cambias archivos, sube también el número de `CACHE` en `sw.js` (por ejemplo `bitacora-v4`).

## Contenido de la carpeta

| Archivo | Para qué sirve |
|---|---|
| `index.html`, `styles.css`, `app.js` | La interfaz |
| `catalog.js` | Biblioteca de 120 ejercicios con rango, descanso y técnica |
| `data.js` | Base de datos local, cola sin conexión y sincronización con Supabase |
| `config.js` | **Lo único que debes editar**: URL y clave de Supabase |
| `schema.sql` | Tablas, seguridad por fila y la vista `series_flat` |
| `migracion-2.sql` | Solo si ya tenías la base: agrega las columnas nuevas de ejercicios |
| `sw.js`, `manifest.webmanifest`, `icons/` | Instalación y funcionamiento sin conexión |
| `vendor/supabase.js` | Librería oficial de Supabase (copia local) |

## Si algo falla

- **“Correo o contraseña incorrectos”**: revisa que el usuario se creó con *Auto Confirm User* en Authentication → Users.
- **La pantalla pide “Conectar con Supabase”**: `config.js` aún tiene los valores de ejemplo.
- **“Un cambio no se pudo guardar”**: casi siempre es que `schema.sql` no se ejecutó completo. Vuelve a correrlo; el detalle del error está en *Más → Cuenta y sincronización*.
- **No aparece “Añadir a pantalla de inicio”**: ábrela en Safari (no dentro de otra app) y desde una dirección **https**.
