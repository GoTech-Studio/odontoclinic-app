/**
 * Sintetizador Web Audio API para notificaciones discretas, armónicas y relajantes.
 * Diseñado específicamente para un entorno clínico (cero sonidos estridentes ni alarmantes).
 * No depende de archivos externos .mp3 ni llamadas a red.
 */

class ClinicChimePlayer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Reproduce un doble acorde suave y cálido (E5 -> A5 con envolvente natural)
   * Volumen suave (~0.12) con desvanecimiento exponencial.
   */
  playTurnoChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Nota 1: Dulce y suave (E5 - 659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.12, now + 0.04); // Ataque suave sin chasquidos
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Desvanecimiento suave

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.41);

      // Nota 2: Armónica y resolutiva (A5 - 880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.16);

      gain2.gain.setValueAtTime(0, now + 0.16);
      gain2.gain.linearRampToValueAtTime(0.14, now + 0.2); // Ataque suave
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85); // Resonancia cálida y relajante

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.86);
    } catch (e) {
      console.warn("No se pudo sintetizar el timbre clínico:", e);
    }
  }
}

export const clinicChime = new ClinicChimePlayer();
