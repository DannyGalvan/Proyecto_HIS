/**
 * Announces text using the Web Speech API (SpeechSynthesis).
 * Falls back silently if the API is not available.
 *
 * @param text  The text to speak
 * @param lang  BCP-47 language tag (default: "es-GT")
 * @param rate  Speech rate 0.1–10 (default: 0.9)
 */
export function announce(text: string, lang = "es-GT", rate = 0.9): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech before announcing new one
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;

  window.speechSynthesis.speak(utterance);
}

/**
 * Builds the standard patient call announcement used in the nurse/doctor dashboards.
 *
 * @param appointmentId  The appointment number
 * @param patientName    The patient's full name
 * @param message        What to say after the name (e.g. "favor pasar a toma de signos vitales")
 */
export function callPatient(
  appointmentId: number,
  patientName: string,
  message: string,
): void {
  const text = `Turno número ${appointmentId}. Paciente ${patientName}, ${message}.`;
  announce(text);
}
