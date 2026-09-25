// =============================================================
// CONTROLADOR: GrabadorController
// -------------------------------------------------------------
// Responsabilidad: coordinar. Escucha a la vista, le pide
// trabajo a los modelos y le dice a la vista qué mostrar.
// =============================================================

import { DestinosModel } from "../models/DestinosModel.js";
import { NfcModel } from "../models/NfcModel.js";

export class GrabadorController {
  constructor(vista, nfc, destinos) {
    this.vista = vista;
    this.nfc = nfc;
    this.destinos = destinos;
    this.controlador = null; // AbortController de la operación en curso
  }

  async iniciar() {
    // 1. Conectar eventos de la vista con métodos del controlador
    this.vista.alGrabar(() => this.grabar());
    this.vista.alLeer(() => this.leer());
    this.vista.alBorrar(() => this.borrar());
    this.vista.alCancelar(() => this.cancelar());
    this.vista.alCambiarDestino(() => this.actualizarVistaPrevia());

    // 2. ¿Hay NFC en este navegador?
    if (!this.nfc.soportado()) {
      this.vista.deshabilitarNfc();
      this.vista.mostrarAviso(
        "Este navegador no puede grabar NFC. Abre esta página en Chrome para Android."
      );
    }

    // 3. Cargar los destinos para el selector
    try {
      const lista = await this.destinos.cargar();
      this.vista.mostrarDestinos(lista);
    } catch (error) {
      this.vista.mostrarDestinos({}); // solo queda la opción personalizada
      this.vista.mostrarAviso(`No se pudo leer destinos.json: ${error.message}`);
    }

    this.actualizarVistaPrevia();
    this.vista.mostrarEstado("neutral", "Elige un destino y toca Grabar.");
  }

  // ---------- Lógica de URLs ----------

  /**
   * Arma la URL que se grabará. Para etiquetas del JSON grabamos
   * la página puente ir.html?t=id (así el destino se cambia sin regrabar).
   * La base se calcula sola a partir de donde está publicada esta página.
   */
  urlParaGrabar() {
    const sel = this.vista.seleccion();
    if (sel.personal) return sel.url;
    if (!sel.id) return "";
    return new URL(`ir.html?t=${encodeURIComponent(sel.id)}`, location.href).href;
  }

  actualizarVistaPrevia() {
    const sel = this.vista.seleccion();
    const destino = sel.personal ? sel.url : this.destinos.resolver(sel.id);
    this.vista.mostrarVistaPrevia(this.urlParaGrabar(), destino);
  }

  // ---------- Acciones ----------

  async grabar() {
    const url = this.urlParaGrabar();
    if (!DestinosModel.esUrlSegura(url)) {
      this.vista.mostrarEstado("error", "Escribe una URL válida que empiece por https://");
      return;
    }
    await this.#ejecutar(
      "Acerca la etiqueta a la parte trasera del celular…",
      (signal) => this.nfc.grabarUrl(url, signal),
      () => "Etiqueta grabada correctamente."
    );
  }

  async leer() {
    await this.#ejecutar(
      "Acerca la etiqueta para leerla…",
      (signal) => this.nfc.leer(signal),
      ({ serie, registros }) => {
        const utiles = registros.filter((r) => r.contenido);
        if (!registros.length || registros.every((r) => r.tipo === "empty")) {
          return `Serie ${serie} · La etiqueta está vacía.`;
        }
        const texto = utiles.length
          ? utiles.map((r) => r.contenido).join(" · ")
          : registros.map((r) => `registro ${r.tipo}`).join(" · ");
        return `Serie ${serie} · ${texto}`;
      }
    );
  }

  async borrar() {
    if (!this.vista.confirmar("¿Seguro que quieres borrar la etiqueta?")) return;
    await this.#ejecutar(
      "Acerca la etiqueta que quieres borrar…",
      (signal) => this.nfc.borrar(signal),
      () => "Etiqueta borrada. Ya puedes grabarle otra URL."
    );
  }

  cancelar() {
    this.controlador?.abort();
  }

  /**
   * Plantilla común para grabar/leer/borrar:
   * bloquea la vista, ejecuta, muestra éxito o error y desbloquea.
   */
  async #ejecutar(mensajeEspera, operacion, mensajeExito) {
    this.controlador = new AbortController();
    this.vista.ocupado(true);
    this.vista.mostrarEstado("espera", mensajeEspera);

    try {
      const resultado = await operacion(this.controlador.signal);
      this.vista.mostrarEstado("ok", mensajeExito(resultado));
    } catch (error) {
      const tipo = error?.name === "AbortError" ? "neutral" : "error";
      this.vista.mostrarEstado(tipo, NfcModel.traducirError(error));
    } finally {
      this.controlador?.abort(); // corta cualquier escaneo que siga abierto
      this.controlador = null;
      this.vista.ocupado(false);
    }
  }
}
