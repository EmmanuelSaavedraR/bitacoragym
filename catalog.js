/* Biblioteca de ejercicios (se puede agregar a tu cuenta desde Más → Ejercicios → Biblioteca).
   Formato: [id, nombre, grupo, equipo, [secundarios], repMin, repMax, descanso(s), indicación corta] */
(function () {
  var R = [
    /* ---------- Pecho ---------- */
    ['press-banca', 'Press banca con barra', 'Pecho', 'Barra', ['Tríceps', 'Hombros'], 5, 8, 180, 'Escápulas juntas y abajo, pies firmes; baja la barra a la parte baja del pecho y empuja en línea ligeramente diagonal.'],
    ['press-inclinado-barra', 'Press inclinado con barra', 'Pecho', 'Barra', ['Hombros', 'Tríceps'], 6, 10, 150, 'Banco a 30°. Baja a la parte alta del pecho sin rebotar.'],
    ['press-inclinado-mancuernas', 'Press inclinado con mancuernas', 'Pecho', 'Mancuernas', ['Hombros', 'Tríceps'], 8, 12, 120, 'Banco a 30°. Codos a unos 45° del torso; estira bien abajo.'],
    ['press-plano-mancuernas', 'Press plano con mancuernas', 'Pecho', 'Mancuernas', ['Tríceps', 'Hombros'], 8, 12, 120, 'Rango profundo y control al bajar; las mancuernas se juntan arriba sin chocar.'],
    ['press-declinado', 'Press declinado con barra', 'Pecho', 'Barra', ['Tríceps'], 6, 10, 150, 'Énfasis en la parte baja del pecho. Usa seguros si entrenas solo.'],
    ['press-pecho-maquina', 'Press de pecho en máquina', 'Pecho', 'Máquina', ['Tríceps', 'Hombros'], 8, 12, 90, 'Ajusta el asiento para que los agarres queden a la altura del pecho medio.'],
    ['press-smith', 'Press banca en Smith', 'Pecho', 'Smith', ['Tríceps', 'Hombros'], 8, 12, 120, 'Pies adelantados para tener un recorrido cómodo; no bloquees fuerte los codos.'],
    ['aperturas-mancuernas', 'Aperturas con mancuernas', 'Pecho', 'Mancuernas', [], 10, 15, 90, 'Codos ligeramente flexionados; siente el estiramiento y cierra como si abrazaras un árbol.'],
    ['aperturas-polea', 'Aperturas en polea', 'Pecho', 'Polea', [], 10, 15, 75, 'Tensión constante; cruza ligeramente las manos al final.'],
    ['cruce-poleas-alto', 'Cruce de poleas (de arriba abajo)', 'Pecho', 'Polea', [], 10, 15, 75, 'Poleas altas, tronco inclinado; lleva las manos hacia la cadera cruzando.'],
    ['cruce-poleas-bajo', 'Cruce de poleas (de abajo arriba)', 'Pecho', 'Polea', ['Hombros'], 10, 15, 75, 'Poleas bajas; sube en arco hasta el pecho alto.'],
    ['pec-deck', 'Pec deck (mariposa)', 'Pecho', 'Máquina', [], 10, 15, 75, 'Espalda pegada al respaldo; no dejes que los codos pasen demasiado atrás.'],
    ['fondos', 'Fondos en paralelas', 'Pecho', 'Peso corporal', ['Tríceps', 'Hombros'], 6, 12, 120, 'Inclina el torso hacia delante para enfatizar el pecho; baja hasta sentir estiramiento sin dolor de hombro.'],
    ['flexiones', 'Flexiones', 'Pecho', 'Peso corporal', ['Tríceps', 'Hombros'], 8, 20, 90, 'Cuerpo en línea recta, pecho al suelo. Eleva los pies o agrega peso para progresar.'],
    ['pullover-mancuerna', 'Pullover con mancuerna', 'Pecho', 'Mancuernas', ['Espalda', 'Tríceps'], 10, 15, 90, 'Brazos casi rectos; baja detrás de la cabeza hasta sentir estiramiento.'],
    ['press-suelo', 'Press en suelo con mancuernas', 'Pecho', 'Mancuernas', ['Tríceps'], 8, 12, 90, 'Rango corto, útil si el hombro molesta; para un momento cuando el codo toca el suelo.'],

    /* ---------- Espalda ---------- */
    ['dominadas', 'Dominadas', 'Espalda', 'Peso corporal', ['Bíceps'], 5, 10, 150, 'Empieza con los hombros hacia abajo y lleva el pecho a la barra; baja controlando.'],
    ['dominadas-supinas', 'Dominadas supinas (chin-ups)', 'Espalda', 'Peso corporal', ['Bíceps'], 5, 10, 150, 'Agarre hacia ti; más bíceps. Sube hasta que la barbilla pase la barra.'],
    ['dominadas-asistidas', 'Dominadas asistidas', 'Espalda', 'Máquina', ['Bíceps'], 8, 12, 120, 'Reduce la asistencia poco a poco hasta lograr dominadas libres.'],
    ['jalon-pecho', 'Jalón al pecho', 'Espalda', 'Polea', ['Bíceps'], 8, 12, 90, 'Tira con los codos hacia las costillas; inclínate ligeramente y no balancees el cuerpo.'],
    ['jalon-agarre-cerrado', 'Jalón con agarre cerrado (neutro)', 'Espalda', 'Polea', ['Bíceps'], 8, 12, 90, 'Agarre en V; baja al pecho alto y aprieta los dorsales.'],
    ['jalon-unilateral', 'Jalón a una mano', 'Espalda', 'Polea', ['Bíceps'], 10, 15, 75, 'Mayor rango y control; deja que el hombro suba al estirar.'],
    ['remo-barra', 'Remo con barra', 'Espalda', 'Barra', ['Bíceps'], 6, 10, 150, 'Torso a unos 45°, espalda neutra; tira hacia el ombligo sin impulso.'],
    ['remo-pendlay', 'Remo Pendlay', 'Espalda', 'Barra', ['Bíceps'], 5, 8, 150, 'Torso paralelo al suelo; la barra parte del suelo en cada repetición.'],
    ['remo-t', 'Remo en T', 'Espalda', 'Barra', ['Bíceps'], 8, 12, 120, 'Pecho apoyado o torso firme; lleva los codos atrás sin encoger los hombros.'],
    ['remo-mancuerna', 'Remo con mancuerna a una mano', 'Espalda', 'Mancuernas', ['Bíceps'], 8, 12, 90, 'Apoya mano y rodilla en el banco; tira hacia la cadera, no hacia el hombro.'],
    ['remo-polea-sentado', 'Remo en polea sentado', 'Espalda', 'Polea', ['Bíceps'], 8, 12, 90, 'Pecho alto y espalda neutra; junta las escápulas al final sin balancear el torso.'],
    ['remo-maquina', 'Remo en máquina con apoyo en pecho', 'Espalda', 'Máquina', ['Bíceps'], 8, 12, 90, 'El apoyo en el pecho elimina el impulso; controla la fase de bajada.'],
    ['remo-invertido', 'Remo invertido', 'Espalda', 'Peso corporal', ['Bíceps'], 8, 15, 90, 'Cuerpo recto bajo una barra; lleva el pecho a la barra.'],
    ['pullover-polea', 'Pullover en polea', 'Espalda', 'Polea', ['Pecho'], 10, 15, 75, 'Brazos casi rectos; baja la barra hacia los muslos con los dorsales.'],
    ['peso-muerto-convencional', 'Peso muerto convencional', 'Espalda', 'Barra', ['Femorales', 'Glúteos'], 3, 6, 210, 'Barra pegada a las piernas, espalda neutra, empuja el suelo con los pies.'],
    ['encogimientos', 'Encogimientos de trapecio', 'Espalda', 'Mancuernas', [], 10, 15, 75, 'Sube los hombros hacia las orejas sin rotar; pausa arriba.'],
    ['hiperextensiones', 'Hiperextensiones', 'Espalda', 'Peso corporal', ['Glúteos', 'Femorales'], 10, 15, 90, 'Baja controlado y sube hasta alinear el torso, sin hiperextender la zona lumbar.'],
    ['face-pull', 'Face pull', 'Hombros', 'Polea', ['Espalda'], 12, 20, 75, 'Cuerda a la altura de la cara; tira hacia las orejas separando las manos.'],

    /* ---------- Hombros ---------- */
    ['press-militar', 'Press militar con barra', 'Hombros', 'Barra', ['Tríceps'], 5, 8, 150, 'Glúteos y abdomen apretados; empuja la barra en línea recta pasando cerca de la cara.'],
    ['press-hombro-mancuernas', 'Press de hombro con mancuernas', 'Hombros', 'Mancuernas', ['Tríceps'], 8, 12, 120, 'Sentado con respaldo; baja hasta que los codos queden a la altura de las orejas.'],
    ['press-arnold', 'Press Arnold', 'Hombros', 'Mancuernas', ['Tríceps'], 8, 12, 120, 'Empieza con las palmas hacia ti y gira mientras empujas.'],
    ['press-hombro-maquina', 'Press de hombro en máquina', 'Hombros', 'Máquina', ['Tríceps'], 8, 12, 90, 'Ajusta el asiento para que las asas partan a la altura de los hombros.'],
    ['elevaciones-laterales', 'Elevaciones laterales', 'Hombros', 'Mancuernas', [], 12, 20, 60, 'Sube hasta la altura del hombro con el codo ligeramente flexionado; sin impulso.'],
    ['elevaciones-laterales-polea', 'Elevaciones laterales en polea', 'Hombros', 'Polea', [], 12, 20, 60, 'Tensión constante, ideal para cerrar el entrenamiento de hombro.'],
    ['elevaciones-frontales', 'Elevaciones frontales', 'Hombros', 'Mancuernas', [], 10, 15, 60, 'Sube hasta la altura de los ojos; el deltoides frontal ya trabaja mucho en los press.'],
    ['pajaros-mancuernas', 'Pájaros (deltoides posterior)', 'Hombros', 'Mancuernas', ['Espalda'], 12, 20, 60, 'Torso inclinado; abre los brazos con codos ligeramente flexionados.'],
    ['pajaros-maquina', 'Pájaros en máquina (pec deck inverso)', 'Hombros', 'Máquina', ['Espalda'], 12, 20, 60, 'Pecho apoyado; lleva los brazos atrás sin encoger los hombros.'],
    ['remo-menton', 'Remo al mentón', 'Hombros', 'Barra', ['Espalda'], 8, 12, 90, 'Agarre ancho (más ancho que los hombros); sube hasta el pecho y no más.'],

    /* ---------- Bíceps ---------- */
    ['curl-barra', 'Curl con barra', 'Bíceps', 'Barra', [], 8, 12, 90, 'Codos pegados al cuerpo; evita balancearte.'],
    ['curl-barra-z', 'Curl con barra Z', 'Bíceps', 'Barra', [], 8, 12, 90, 'El agarre inclinado cuida las muñecas; sube sin mover los codos.'],
    ['curl-mancuernas', 'Curl con mancuernas alterno', 'Bíceps', 'Mancuernas', [], 8, 12, 75, 'Gira la muñeca hacia arriba mientras subes; baja lento.'],
    ['curl-martillo', 'Curl martillo', 'Bíceps', 'Mancuernas', ['Antebrazo'], 10, 15, 75, 'Agarre neutro; trabaja el braquial y el antebrazo.'],
    ['curl-inclinado', 'Curl inclinado con mancuernas', 'Bíceps', 'Mancuernas', [], 10, 15, 75, 'Banco a 45°; el brazo queda detrás del cuerpo y el bíceps se estira más.'],
    ['curl-predicador', 'Curl predicador', 'Bíceps', 'Barra', [], 8, 12, 75, 'Brazos apoyados; no bloquees del todo abajo para cuidar el codo.'],
    ['curl-concentrado', 'Curl concentrado', 'Bíceps', 'Mancuernas', [], 10, 15, 60, 'Codo apoyado en el muslo; contrae fuerte arriba.'],
    ['curl-polea', 'Curl en polea baja', 'Bíceps', 'Polea', [], 10, 15, 60, 'Tensión constante durante todo el rango.'],
    ['curl-bayesian', 'Curl bayesiano en polea', 'Bíceps', 'Polea', [], 10, 15, 60, 'De espaldas a la polea con el brazo atrás; gran estiramiento del bíceps.'],
    ['curl-spider', 'Curl spider', 'Bíceps', 'Mancuernas', [], 10, 15, 60, 'Pecho sobre un banco inclinado; brazos colgando verticales.'],

    /* ---------- Tríceps ---------- */
    ['extension-triceps-polea', 'Extensión de tríceps en polea', 'Tríceps', 'Polea', [], 10, 15, 75, 'Codos fijos junto al cuerpo; extiende por completo y controla la subida.'],
    ['extension-triceps-cuerda', 'Extensión de tríceps con cuerda', 'Tríceps', 'Polea', [], 10, 15, 75, 'Separa la cuerda al final del movimiento.'],
    ['extension-triceps-sobre-cabeza', 'Extensión de tríceps sobre la cabeza', 'Tríceps', 'Polea', [], 10, 15, 75, 'Brazo por encima de la cabeza estira la cabeza larga del tríceps; muy eficaz.'],
    ['press-frances', 'Press francés', 'Tríceps', 'Barra', [], 8, 12, 90, 'Codos apuntando al techo; baja hacia la frente o detrás de la cabeza.'],
    ['press-cerrado', 'Press banca agarre cerrado', 'Tríceps', 'Barra', ['Pecho', 'Hombros'], 6, 10, 120, 'Manos a la anchura de los hombros; codos cerca del torso.'],
    ['fondos-banco', 'Fondos en banco', 'Tríceps', 'Peso corporal', ['Pecho', 'Hombros'], 10, 15, 75, 'Espalda cerca del banco; no bajes más de lo cómodo para el hombro.'],
    ['fondos-triceps', 'Fondos en paralelas (tríceps)', 'Tríceps', 'Peso corporal', ['Pecho', 'Hombros'], 6, 12, 120, 'Torso vertical para enfatizar el tríceps.'],
    ['patada-triceps', 'Patada de tríceps', 'Tríceps', 'Mancuernas', [], 12, 20, 60, 'Brazo pegado al torso; extiende por completo y aprieta.'],
    ['extension-triceps-mancuerna', 'Extensión de tríceps con mancuerna', 'Tríceps', 'Mancuernas', [], 10, 15, 75, 'Dos manos sosteniendo la mancuerna; baja detrás de la cabeza sin abrir los codos.'],

    /* ---------- Antebrazo ---------- */
    ['curl-muneca', 'Curl de muñeca', 'Antebrazo', 'Barra', [], 12, 20, 60, 'Antebrazos apoyados; rango completo.'],
    ['curl-muneca-inverso', 'Curl de muñeca inverso', 'Antebrazo', 'Barra', [], 12, 20, 60, 'Palmas hacia abajo; pesos ligeros.'],
    ['curl-inverso', 'Curl inverso con barra', 'Antebrazo', 'Barra', ['Bíceps'], 10, 15, 60, 'Agarre pronado; trabaja el braquiorradial.'],
    ['paseo-granjero', 'Paseo del granjero', 'Antebrazo', 'Mancuernas', ['Abdomen', 'Espalda'], 1, 1, 90, 'Camina 20–40 m con peso pesado, postura erguida.'],

    /* ---------- Cuádriceps ---------- */
    ['sentadilla', 'Sentadilla con barra', 'Cuádriceps', 'Barra', ['Glúteos'], 5, 8, 180, 'Barra firme en la espalda alta; rodillas siguen la línea de los pies; baja hasta una profundidad cómoda.'],
    ['sentadilla-frontal', 'Sentadilla frontal', 'Cuádriceps', 'Barra', ['Glúteos'], 6, 10, 180, 'Codos altos; torso muy vertical.'],
    ['sentadilla-hack', 'Sentadilla hack', 'Cuádriceps', 'Máquina', ['Glúteos'], 8, 12, 120, 'Pies bajos en la plataforma para enfatizar el cuádriceps.'],
    ['sentadilla-smith', 'Sentadilla en Smith', 'Cuádriceps', 'Smith', ['Glúteos'], 8, 12, 120, 'Pies un poco adelantados; controla la profundidad.'],
    ['sentadilla-goblet', 'Sentadilla goblet', 'Cuádriceps', 'Mancuernas', ['Glúteos'], 10, 15, 90, 'Mancuerna pegada al pecho; excelente para aprender el patrón.'],
    ['prensa', 'Prensa de piernas', 'Cuádriceps', 'Máquina', ['Glúteos'], 10, 15, 120, 'Espalda baja pegada al respaldo; no bloquees las rodillas arriba.'],
    ['extension-cuadriceps', 'Extensión de cuádriceps', 'Cuádriceps', 'Máquina', [], 12, 15, 75, 'Pausa 1 s arriba; baja lento.'],
    ['sentadilla-bulgara', 'Sentadilla búlgara', 'Cuádriceps', 'Mancuernas', ['Glúteos'], 8, 12, 120, 'Pie trasero elevado; torso ligeramente inclinado si quieres más glúteo.'],
    ['zancadas', 'Zancadas con mancuernas', 'Cuádriceps', 'Mancuernas', ['Glúteos'], 8, 12, 90, 'Pasos largos y controlados; baja la rodilla trasera cerca del suelo.'],
    ['zancadas-caminando', 'Zancadas caminando', 'Cuádriceps', 'Mancuernas', ['Glúteos'], 10, 16, 90, 'Mantén el torso erguido y el ritmo constante.'],
    ['sentadilla-pistol-asistida', 'Sentadilla a una pierna asistida', 'Cuádriceps', 'Peso corporal', ['Glúteos'], 6, 10, 90, 'Apóyate en un soporte y baja con control.'],
    ['step-up', 'Subida al cajón (step-up)', 'Cuádriceps', 'Mancuernas', ['Glúteos'], 8, 12, 90, 'Empuja con la pierna del cajón, no con la de abajo.'],
    ['sissy-squat', 'Sissy squat', 'Cuádriceps', 'Peso corporal', [], 10, 15, 75, 'Inclínate hacia atrás con las rodillas adelante; avanzado, ve despacio.'],

    /* ---------- Femorales ---------- */
    ['peso-muerto', 'Peso muerto', 'Femorales', 'Barra', ['Glúteos', 'Espalda'], 3, 6, 210, 'Espalda neutra, barra pegada; empuja el suelo con los pies.'],
    ['peso-muerto-rumano', 'Peso muerto rumano', 'Femorales', 'Barra', ['Glúteos'], 6, 10, 150, 'Cadera hacia atrás con las rodillas casi fijas; baja hasta sentir el estiramiento.'],
    ['peso-muerto-rumano-mancuernas', 'Peso muerto rumano con mancuernas', 'Femorales', 'Mancuernas', ['Glúteos'], 8, 12, 120, 'Mancuernas cerca de las piernas; espalda neutra.'],
    ['peso-muerto-piernas-rigidas', 'Peso muerto con piernas rígidas', 'Femorales', 'Barra', ['Glúteos', 'Espalda'], 8, 12, 120, 'Más rango que el rumano; no redondees la espalda.'],
    ['peso-muerto-unilateral', 'Peso muerto a una pierna', 'Femorales', 'Mancuernas', ['Glúteos'], 8, 12, 90, 'Cadera cuadrada; apóyate en algo si pierdes equilibrio.'],
    ['curl-femoral-tumbado', 'Curl femoral tumbado', 'Femorales', 'Máquina', [], 10, 15, 75, 'Cadera pegada al banco; baja lento.'],
    ['curl-femoral-sentado', 'Curl femoral sentado', 'Femorales', 'Máquina', [], 10, 15, 75, 'Con la cadera flexionada se estira más el femoral; buen rango.'],
    ['curl-nordico', 'Curl nórdico', 'Femorales', 'Peso corporal', ['Glúteos'], 4, 8, 120, 'Baja lo más lento posible y ayúdate con las manos al subir.'],
    ['buenos-dias', 'Buenos días', 'Femorales', 'Barra', ['Glúteos', 'Espalda'], 8, 12, 120, 'Pesos moderados; bisagra de cadera con espalda neutra.'],
    ['curl-femoral-polea', 'Curl femoral en polea de pie', 'Femorales', 'Polea', [], 10, 15, 60, 'Una pierna a la vez; mantén la cadera estable.'],

    /* ---------- Glúteos ---------- */
    ['hip-thrust', 'Hip thrust', 'Glúteos', 'Barra', ['Femorales'], 8, 12, 120, 'Barbilla recogida; sube hasta alinear tronco y muslos y aprieta fuerte arriba.'],
    ['hip-thrust-maquina', 'Hip thrust en máquina', 'Glúteos', 'Máquina', ['Femorales'], 8, 12, 90, 'Misma técnica que con barra, más cómodo con cargas altas.'],
    ['puente-gluteos', 'Puente de glúteos', 'Glúteos', 'Peso corporal', ['Femorales'], 12, 20, 60, 'Espalda baja neutra; pausa arriba 1–2 s.'],
    ['patada-gluteo-polea', 'Patada de glúteo en polea', 'Glúteos', 'Polea', ['Femorales'], 10, 15, 60, 'Evita arquear la espalda baja; el movimiento sale de la cadera.'],
    ['patada-gluteo-maquina', 'Patada de glúteo en máquina', 'Glúteos', 'Máquina', ['Femorales'], 10, 15, 60, 'Cadera estable; extiende y aprieta.'],
    ['abduccion-cadera-maquina', 'Abducción de cadera en máquina', 'Glúteos', 'Máquina', [], 12, 20, 60, 'Inclínate ligeramente hacia delante para sentir más el glúteo medio.'],
    ['sentadilla-sumo', 'Sentadilla sumo', 'Glúteos', 'Mancuernas', ['Cuádriceps'], 8, 12, 90, 'Pies muy abiertos y puntas hacia fuera; rodillas siguen los pies.'],
    ['peso-muerto-sumo', 'Peso muerto sumo', 'Glúteos', 'Barra', ['Femorales', 'Espalda', 'Cuádriceps'], 4, 8, 180, 'Pecho alto y empuja el suelo hacia los lados.'],
    ['extension-cadera-cuadrupedia', 'Extensión de cadera en cuadrupedia', 'Glúteos', 'Peso corporal', [], 12, 20, 45, 'Abdomen firme, sin arquear la lumbar.'],

    /* ---------- Pantorrillas ---------- */
    ['talones-de-pie', 'Elevación de talones de pie', 'Pantorrillas', 'Máquina', [], 8, 12, 75, 'Rango completo: estira abajo y sube lo más alto posible, con pausa.'],
    ['talones-sentado', 'Elevación de talones sentado', 'Pantorrillas', 'Máquina', [], 12, 20, 60, 'Trabaja más el sóleo; movimiento lento.'],
    ['talones-prensa', 'Elevación de talones en prensa', 'Pantorrillas', 'Máquina', [], 10, 15, 60, 'Solo mueve los tobillos; no bloquees las rodillas.'],
    ['talones-smith', 'Elevación de talones en Smith', 'Pantorrillas', 'Smith', [], 10, 15, 60, 'Apoya la punta en un escalón para estirar más.'],
    ['talones-unilateral', 'Elevación de talones a una pierna', 'Pantorrillas', 'Peso corporal', [], 10, 15, 60, 'Con una mancuerna en la mano para progresar.'],
    ['tibial-anterior', 'Elevación de puntas (tibial)', 'Pantorrillas', 'Peso corporal', [], 15, 25, 45, 'Espalda contra la pared y sube las puntas; útil para equilibrar la espinilla.'],

    /* ---------- Abdomen ---------- */
    ['crunch-polea', 'Crunch en polea', 'Abdomen', 'Polea', [], 10, 15, 60, 'Redondea la columna llevando las costillas a la pelvis; no tires con los brazos.'],
    ['elevacion-piernas', 'Elevación de piernas colgado', 'Abdomen', 'Peso corporal', [], 8, 15, 75, 'Inclina la pelvis hacia arriba al subir; sin balanceo.'],
    ['elevacion-rodillas', 'Elevación de rodillas colgado', 'Abdomen', 'Peso corporal', [], 10, 15, 60, 'Versión más fácil de la elevación de piernas.'],
    ['crunch-maquina', 'Crunch en máquina', 'Abdomen', 'Máquina', [], 10, 15, 60, 'Movimiento lento y controlado.'],
    ['rueda-abdominal', 'Rueda abdominal', 'Abdomen', 'Otro', [], 6, 12, 75, 'No dejes caer la cadera; avanza solo hasta donde controles la espalda baja.'],
    ['plancha', 'Plancha', 'Abdomen', 'Peso corporal', [], 30, 60, 60, 'Cuerpo recto, glúteos y abdomen firmes. Aquí cuenta el tiempo en segundos como "reps".'],
    ['plancha-lateral', 'Plancha lateral', 'Abdomen', 'Peso corporal', [], 20, 45, 45, 'Cadera elevada y alineada; cuenta segundos por lado.'],
    ['crunch-inverso', 'Crunch inverso', 'Abdomen', 'Peso corporal', [], 10, 20, 45, 'Lleva las rodillas al pecho enrollando la pelvis.'],
    ['lenador', 'Leñador en polea (woodchopper)', 'Abdomen', 'Polea', [], 10, 15, 60, 'Rota desde el torso, con caderas firmes.'],
    ['pallof', 'Press Pallof', 'Abdomen', 'Polea', [], 10, 15, 45, 'Resiste la rotación; mantén la cadera cuadrada.'],
    ['dead-bug', 'Dead bug', 'Abdomen', 'Peso corporal', [], 10, 16, 45, 'Zona lumbar pegada al suelo mientras alternas brazos y piernas.'],

    /* ---------- Otro / acondicionamiento ---------- */
    ['cinta-caminata', 'Caminata en cinta inclinada', 'Otro', 'Máquina', [], 10, 30, 0, 'Cuenta minutos como "reps". Ritmo moderado, 8–12% de inclinación.'],
    ['bicicleta', 'Bicicleta estática', 'Otro', 'Máquina', [], 10, 30, 0, 'Cuenta minutos como "reps".'],
    ['balanceo-kettlebell', 'Swing con kettlebell', 'Otro', 'Kettlebell', ['Glúteos', 'Femorales'], 10, 20, 75, 'Bisagra de cadera explosiva, no es una sentadilla; los brazos solo guían.'],
    ['clean-colgado', 'Cargada colgada (hang clean)', 'Otro', 'Barra', ['Espalda', 'Glúteos'], 3, 6, 150, 'Técnica avanzada: aprende con peso ligero y, si puedes, con un entrenador.']
  ];
  window.CATALOG = R.map(function (r) {
    return { id: r[0], name: r[1], muscle: r[2], equipment: r[3], secondary: r[4], repMin: r[5], repMax: r[6], restSec: r[7], tip: r[8] };
  });
})();
