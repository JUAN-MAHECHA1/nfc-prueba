// Punto de entrada de index.html: une Modelo + Vista + Controlador
import { DestinosModel } from "./models/DestinosModel.js";
import { NfcModel } from "./models/NfcModel.js";
import { GrabadorView } from "./views/GrabadorView.js";
import { GrabadorController } from "./controllers/GrabadorController.js";

const app = new GrabadorController(
  new GrabadorView(),
  new NfcModel(),
  new DestinosModel("data/destinos.json")
);
app.iniciar();
