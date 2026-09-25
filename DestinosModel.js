// =============================================================
// MODELO: DestinosModel
// -------------------------------------------------------------
// Responsabilidad: leer data/destinos.json y responder
// "¿a dónde lleva la etiqueta X?".
// No sabe nada de botones ni de pantallas.
// =============================================================

export class DestinosModel {
  /**
   * @param {string} rutaJson  Ruta del archivo de destinos (relativa a la página)
   */
  constructor(rutaJson = "data/destinos.json") {
    this.rutaJson = rutaJson;
    this.destinos = {};
  }

  /**
   * Descarga el JSON. cache "no-store" evita que el celular
   * use una copia vieja cuando cambias un destino en GitHub.
   * @returns {Promise<Object<string,string>>}
   */
  async cargar() {
    const respuesta = await fetch(this.rutaJson, { cache: "no-store" });
    if (!respuesta.ok) {
      throw new Error(`No se encontró ${this.rutaJson} (HTTP ${respuesta.status})`);
    }

    const datos = await respuesta.json(); // falla si el JSON tiene errores de sintaxis
    if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
      throw new Error("destinos.json debe ser un objeto { \"nombre\": \"url\" }");
    }

    // Solo guardamos las entradas con URL válida (http/https)
    this.destinos = {};
    for (const [id, url] of Object.entries(datos)) {
      if (DestinosModel.esUrlSegura(url)) this.destinos[id] = url;
    }
    return this.destinos;
  }

  /** Lista de nombres de etiquetas disponibles. */
  ids() {
    return Object.keys(this.destinos);
  }

  /**
   * Devuelve la URL de destino para un id.
   * Si el id no existe, usa "principal".
   * @returns {string|null}
   */
  resolver(id) {
    return this.destinos[id] || this.destinos.principal || null;
  }

  /**
   * Seguridad: solo permitimos http y https.
   * Así nadie puede colar un "javascript:..." en el JSON.
   */
  static esUrlSegura(valor) {
    try {
      const url = new URL(valor);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }
}
