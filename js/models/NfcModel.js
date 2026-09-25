// =============================================================
// MODELO: NfcModel
// -------------------------------------------------------------
// Responsabilidad: hablar con la etiqueta usando Web NFC
// (grabar, leer y borrar). Envuelve la API NDEFReader.
// Solo existe en Chrome para Android y exige HTTPS.
// =============================================================

export class NfcModel {
  /** ¿El navegador soporta Web NFC? */
  soportado() {
    return "NDEFReader" in window;
  }

  /**
   * ¿En qué tipo de dispositivo estamos?
   * iPadOS se presenta como "Macintosh", por eso se revisa el táctil.
   * @returns {"ios"|"android"|"otro"}
   */
  static plataforma() {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "otro";
  }

  /**
   * Graba una URL en la etiqueta como registro NDEF tipo "url".
   * Chrome se encarga de armar el mensaje NDEF (registro "U").
   * @param {string} url
   * @param {AbortSignal} signal  Permite cancelar mientras espera la etiqueta
   */
  async grabarUrl(url, signal) {
    const ndef = new NDEFReader();
    await ndef.write({ records: [{ recordType: "url", data: url }] }, { signal });
  }

  /**
   * Deja la etiqueta vacía escribiendo un registro "empty".
   * No funciona si la etiqueta fue bloqueada (eso es permanente).
   */
  async borrar(signal) {
    const ndef = new NDEFReader();
    await ndef.write({ records: [{ recordType: "empty" }] }, { signal });
  }

  /**
   * Espera UNA lectura y la devuelve ya decodificada.
   * @returns {Promise<{serie: string, registros: {tipo: string, contenido: string}[]}>}
   */
  leer(signal) {
    return new Promise(async (resolver, rechazar) => {
      const ndef = new NDEFReader();

      // Cuando la etiqueta se lee bien
      ndef.onreading = (evento) => {
        const decodificador = new TextDecoder();
        const registros = evento.message.records.map((r) => ({
          tipo: r.recordType,
          contenido:
            (r.recordType === "url" || r.recordType === "text") && r.data
              ? decodificador.decode(r.data)
              : "",
        }));
        resolver({ serie: evento.serialNumber || "—", registros });
      };

      // Cuando hay etiqueta pero no se puede interpretar
      ndef.onreadingerror = () => {
        rechazar(Object.assign(new Error("Etiqueta no legible"), { name: "ReadingError" }));
      };

      // Si cancelan, rechazamos con AbortError
      signal.addEventListener("abort", () => {
        rechazar(Object.assign(new Error("Cancelado"), { name: "AbortError" }));
      });

      try {
        await ndef.scan({ signal }); // empieza a escuchar etiquetas
      } catch (error) {
        rechazar(error);
      }
    });
  }

  /**
   * Traduce los errores técnicos de Web NFC a mensajes claros.
   */
  static traducirError(error) {
    const mensajes = {
      NotAllowedError: "Permiso de NFC denegado. Toca el candado junto a la URL → Permisos → NFC.",
      NotSupportedError: "Etiqueta no compatible con NDEF (¿MIFARE Classic?). Usa NTAG213/215/216.",
      NotReadableError: "No se pudo usar el NFC. Revisa que esté activado en Ajustes.",
      NetworkError: "Se perdió el contacto con la etiqueta. Mantenla quieta hasta terminar.",
      InvalidStateError: "Otra operación NFC sigue activa. Cancela e intenta de nuevo.",
      ReadingError: "La etiqueta está vacía o no tiene un formato legible.",
      AbortError: "Operación cancelada.",
    };
    return mensajes[error?.name] || `Error inesperado: ${error?.message || error}`;
  }
}
