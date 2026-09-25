// =============================================================
// CONTROLADOR: PuenteController
// -------------------------------------------------------------
// La etiqueta NFC abre ir.html?t=nombre. Este controlador
// busca "nombre" en destinos.json y redirige.
// Para cambiar el destino: edita data/destinos.json en GitHub.
// =============================================================

export class PuenteController {
  /**
   * @param {PuenteView} vista
   * @param {DestinosModel} destinos
   * @param {string} urlRespaldo  A dónde ir si algo falla
   */
  constructor(vista, destinos, urlRespaldo) {
    this.vista = vista;
    this.destinos = destinos;
    this.urlRespaldo = urlRespaldo;
  }

  async iniciar() {
    this.vista.mostrarCargando();

    // 1. Leer el id de la URL: ir.html?t=principal -> "principal"
    const id = new URLSearchParams(location.search).get("t") || "principal";

    try {
      // 2. Cargar destinos y resolver el id
      await this.destinos.cargar();
      const destino = this.destinos.resolver(id);
      if (!destino) throw new Error(`No hay destino para "${id}" ni un "principal".`);

      // 3. Redirigir. replace() evita que "atrás" vuelva a esta página
      location.replace(destino);
      this.vista.mostrarEnlace(destino);
    } catch (error) {
      this.vista.mostrarError(error.message, this.urlRespaldo);
    }
  }
}
