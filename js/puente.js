// Punto de entrada de ir.html: une Modelo + Vista + Controlador
import { DestinosModel } from "./models/DestinosModel.js";
import { PuenteView } from "./views/PuenteView.js";
import { PuenteController } from "./controllers/PuenteController.js";

// Si algo falla, se manda aquí
const URL_RESPALDO = "https://github.com/JUAN-MAHECHA1";

const app = new PuenteController(
  new PuenteView(),
  new DestinosModel("data/destinos.json"),
  URL_RESPALDO
);
app.iniciar();
