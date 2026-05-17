# StarDesk — Cliente de escritorio para HaxBall

Cliente Electron para HaxBall con sistema de extensiones dinámicas.

## Características

- Sistema de extensiones cargadas dinámicamente desde preload.js con Injector propio
- Discord Rich Presence en tiempo real (marcador, jugadores, tiempo de partida) via IPC
- Picture-in-Picture del canvas del juego con captureStream() + requestPictureInPicture()
- Lista de salas rediseñada: filtro por país, buscador con debounce, favoritos en localStorage, salas fijadas en sessionStorage
- Panel de configuración propio inyectado en el DOM del juego con servidor HTTP interno para gestión de caché
- Mucho más

## Tecnologías

Electron · Node.js · discord-rpc · IPC · Web APIs

## Ejecutar localmente

npm install
npm start
