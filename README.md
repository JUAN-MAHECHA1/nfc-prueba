# Grabador NFC (MVC)

Graba etiquetas NFC que abren una página de tu GitHub.
La etiqueta apunta a `ir.html?t=nombre`, y `data/destinos.json`
decide a dónde lleva. Cambias el destino sin volver a grabar.

## Estructura

```
nfc-prueba/
├── index.html                  Vista del grabador (solo estructura)
├── ir.html                     Vista del puente (la que abre la etiqueta)
├── css/estilos.css             Todo el diseño
├── data/destinos.json          Tus destinos: { "nombre": "url" }
└── js/
    ├── grabador.js             Arranca el grabador (une M + V + C)
    ├── puente.js               Arranca el puente
    ├── models/
    │   ├── DestinosModel.js    Lee y valida destinos.json
    │   └── NfcModel.js         Graba, lee y borra con Web NFC
    ├── views/
    │   ├── GrabadorView.js     Pinta index.html
    │   └── PuenteView.js       Pinta ir.html
    └── controllers/
        ├── GrabadorController.js   Coordina el grabador
        └── PuenteController.js     Resuelve y redirige
```

## Uso

1. Sube todo a la raíz del repo y activa GitHub Pages (Settings → Pages → main / root).
2. Abre `https://juan-mahecha1.github.io/nfc-prueba/` en **Chrome Android**.
3. Elige una etiqueta, toca **Grabar** y acerca la etiqueta.
4. Para cambiar a dónde lleva: edita `data/destinos.json` en GitHub.

Web NFC solo funciona en Chrome para Android. En iPhone la página detecta el dispositivo y te da la URL para grabarla con la app gratuita NFC Tools; la etiqueta ya grabada se lee sola en cualquier iPhone XS o más nuevo y en Android. Web NFC además exige HTTPS
(no funciona abriendo el archivo desde el computador).
