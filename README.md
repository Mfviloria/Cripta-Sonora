# Cripta Sonora

Encuesta de terror para emparejar personas por sus gustos musicales. Cada persona responde 11 "puertas", el facilitador ve las gráficas en vivo y, con un botón, cada quien descubre a sus 3 almas gemelas y por qué son compatibles.

## Dos enlaces separados

| Quién | Ruta | Qué ve |
|---|---|---|
| Participantes | `/` | La encuesta y, al final, sus 3 matches |
| Facilitador | `/facilitador` | Gráficas en vivo y el botón **Invocar los matches** |

`/facilitador` pide un PIN. Sin el PIN el servidor rechaza cualquier lectura de las respuestas ajenas o de los matches, aunque alguien conozca la ruta.

## Cómo correrlo

Necesitas Node 18 o superior. No hay dependencias que instalar.

```bash
npm start
```

Al arrancar, la consola muestra los dos enlaces y el **PIN del facilitador**:

```
  Participantes:  http://localhost:3000/
  Facilitador:    http://localhost:3000/facilitador
  PIN del facilitador: 482913
```

Para fijar tu propio PIN y puerto:

```bash
FACILITATOR_PIN=miclave PORT=8080 npm start
```

Variables disponibles:

- `PORT`: puerto (por defecto 3000)
- `FACILITATOR_PIN`: PIN del facilitador (si no lo defines, se genera uno y se guarda en `data.json`)
- `DATA_FILE`: ruta del archivo donde se guardan las respuestas (por defecto `data.json`)

## Usarlo en un evento

1. Corre el servidor en un computador o en un servicio de hosting con Node (Render, Railway, Fly.io, etc.). Si usas hosting, activa un disco persistente y apunta `DATA_FILE` a él; si no, las respuestas se pierden al reiniciar.
2. Si todos están en la misma red, comparte `http://IP-DEL-COMPUTADOR:3000/` (por ejemplo con un código QR).
3. Abre `/facilitador` en tu pantalla, escribe el PIN y proyéctala.
4. Cuando todos hayan respondido, toca **Invocar los matches**. Las pantallas de los participantes se transforman solas en unos segundos.
5. **Invocar de nuevo** recalcula si llegó alguien más. **Sellar el libro** vuelve a ocultar los matches.

El botón "Sembrar 10 almas de prueba" llena el panel con datos de ejemplo para ensayar. "Quitar almas de prueba" los borra.

## Cómo se calculan los matches (máximo 100)

| Qué cuenta | Puntos |
|---|---|
| Géneros favoritos en común | 35 |
| Coincidencias en los 6 momentos (road trip, fiesta, caminar, día horrible, arranca la fiesta, cuando te gusta alguien) | 25 |
| Apertura a escuchar lo nuevo | 10 |
| Mismo artista favorito | 10 |
| Horas de música al día | 6 |
| Cómo descubren música | 6 |
| Querer recomendaciones del match | 4 |
| Dónde escuchan | 4 |

La lógica está en `public/app.js` (funciones `pair` y `computeMatches`). Las preguntas y opciones están al comienzo del mismo archivo (`GENRES`, `SIT`, `DESC`, etc.).

## Estructura

```
server.js               servidor y reglas de acceso (sin dependencias)
public/index.html       página de los participantes
public/facilitador.html página del facilitador
public/app.js           lógica de ambas páginas
public/style.css        estilos
data.json               se crea al arrancar; aquí se guardan las respuestas
```

## Privacidad y límites

- Cada navegador recibe un identificador aleatorio que se guarda en su `localStorage`. Con él cada persona solo puede leer y escribir su propia respuesta y leer sus propios matches.
- El PIN viaja en una cabecera HTTP. Si lo publicas en internet, ponlo detrás de HTTPS (los servicios de hosting lo dan por defecto).
- El servidor guarda todo en un solo archivo y está pensado para grupos de hasta unos cientos de personas.
# Cripta-Sonora
