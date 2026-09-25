// =============================================================
// VISTA: PuenteView
// -------------------------------------------------------------
// Responsabilidad: lo que se ve en ir.html mientras redirige.
// Construye los enlaces con createElement (no innerHTML)
// para que ninguna URL pueda inyectar código.
// =============================================================

export class PuenteView {
  constructor() {
    this.titulo  = document.getElementById("titulo");
    this.detalle = document.getElementById("detalle");
    this.accion  = document.getElementById("accion");
    this.cuerpo  = document.body;
  }

  mostrarCargando() {
    this.cuerpo.dataset.estado = "cargando";
    this.titulo.textContent = "Abriendo…";
    this.detalle.textContent = "Un momento, te estamos llevando a tu destino.";
    this.accion.hidden = true;
  }

  /** Muestra un enlace manual por si el navegador bloquea la redirección. */
  mostrarEnlace(url) {
    this.titulo.textContent = "Redirigiendo";
    this.detalle.textContent = "Si no se abre automáticamente, usa el botón.";
    this.#ponerEnlace(url, "Abrir destino");
  }

  mostrarError(mensaje, urlRespaldo) {
    this.cuerpo.dataset.estado = "error";
    this.titulo.textContent = "No se pudo abrir";
    this.detalle.textContent = mensaje;
    this.#ponerEnlace(urlRespaldo, "Ir a mi GitHub");
  }

  #ponerEnlace(url, texto) {
    this.accion.href = url;
    this.accion.textContent = texto;
    this.accion.hidden = false;
  }
}
