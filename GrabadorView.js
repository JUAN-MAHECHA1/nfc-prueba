// =============================================================
// VISTA: GrabadorView
// -------------------------------------------------------------
// Responsabilidad: todo lo que se VE en index.html.
// Lee lo que escribe el usuario y muestra mensajes.
// No sabe nada de NFC ni de JSON: eso es del modelo.
// =============================================================

const OPCION_PERSONAL = "__personal__";

export class GrabadorView {
  constructor() {
    // Referencias a los elementos del HTML
    this.selDestino   = document.getElementById("selDestino");
    this.grupoUrl     = document.getElementById("grupoUrl");
    this.inputUrl     = document.getElementById("inputUrl");
    this.urlFinal     = document.getElementById("urlFinal");
    this.destinoFinal = document.getElementById("destinoFinal");
    this.anillo       = document.getElementById("anillo");
    this.estado       = document.getElementById("estado");
    this.estadoTexto  = document.getElementById("estadoTexto");
    this.aviso        = document.getElementById("aviso");

    this.botones = {
      grabar:   document.getElementById("btnGrabar"),
      leer:     document.getElementById("btnLeer"),
      borrar:   document.getElementById("btnBorrar"),
      cancelar: document.getElementById("btnCancelar"),
    };
  }

  // ---------- Eventos: el controlador se "suscribe" aquí ----------
  alGrabar(fn)          { this.botones.grabar.addEventListener("click", fn); }
  alLeer(fn)            { this.botones.leer.addEventListener("click", fn); }
  alBorrar(fn)          { this.botones.borrar.addEventListener("click", fn); }
  alCancelar(fn)        { this.botones.cancelar.addEventListener("click", fn); }
  alCambiarDestino(fn)  {
    this.selDestino.addEventListener("change", fn);
    this.inputUrl.addEventListener("input", fn);
  }

  // ---------- Selector de destinos ----------
  /** Llena el <select> con las etiquetas de destinos.json. */
  mostrarDestinos(destinos) {
    this.selDestino.innerHTML = "";
    for (const [id, url] of Object.entries(destinos)) {
      this.selDestino.append(new Option(`${id}  ·  ${this.#acortar(url)}`, id));
    }
    this.selDestino.append(new Option("Otra URL (personalizada)…", OPCION_PERSONAL));
  }

  /** Devuelve { personal: bool, id, url } según lo elegido. */
  seleccion() {
    const valor = this.selDestino.value;
    return valor === OPCION_PERSONAL
      ? { personal: true, url: this.inputUrl.value.trim() }
      : { personal: false, id: valor };
  }

  /** Muestra la URL que se grabará y a dónde terminará llevando. */
  mostrarVistaPrevia(urlGrabar, destino) {
    const personal = this.selDestino.value === OPCION_PERSONAL;
    this.grupoUrl.hidden = !personal;
    this.urlFinal.textContent = urlGrabar || "—";
    this.destinoFinal.textContent = destino ? this.#acortar(destino) : "—";
  }

  // ---------- Estado y mensajes ----------
  /**
   * @param {"neutral"|"espera"|"ok"|"error"} tipo
   */
  mostrarEstado(tipo, mensaje) {
    this.estado.dataset.tipo = tipo;
    this.estadoTexto.textContent = mensaje;
    this.anillo.dataset.activo = tipo === "espera" ? "si" : "no";
  }

  mostrarAviso(mensaje) {
    this.aviso.textContent = mensaje;
    this.aviso.hidden = false;
  }

  /** Mientras se espera la etiqueta, bloquea botones y muestra Cancelar. */
  ocupado(activo) {
    this.botones.grabar.disabled = activo;
    this.botones.leer.disabled = activo;
    this.botones.borrar.disabled = activo;
    this.selDestino.disabled = activo;
    this.botones.cancelar.hidden = !activo;
  }

  /** Deshabilita todo (por ejemplo, si el navegador no tiene NFC). */
  deshabilitarNfc() {
    this.botones.grabar.disabled = true;
    this.botones.leer.disabled = true;
    this.botones.borrar.disabled = true;
  }

  confirmar(mensaje) {
    return window.confirm(mensaje);
  }

  // Quita "https://" y acorta para que se lea bonito
  #acortar(url) {
    const limpio = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return limpio.length > 42 ? limpio.slice(0, 40) + "…" : limpio;
  }
}
