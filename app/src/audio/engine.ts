/* Web Audio engine: synthesized bass hum + UI blips + ambient music loop */

let ctx: AudioContext | null = null;
let humNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null =
  null;
let music: HTMLAudioElement | null = null;
let soundOn = false;
let sensoryEnabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSensoryEnabled(v: boolean) {
  sensoryEnabled = v;
  if (!v) setSoundOn(false);
}

export function isSoundOn() {
  return soundOn;
}

export function startHum() {
  if (!sensoryEnabled) return;
  const ac = getCtx();
  if (!ac || humNodes) return;
  const osc1 = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  osc1.type = "sine";
  osc2.type = "triangle";
  osc1.frequency.value = 55;
  osc2.frequency.value = 55.6;
  filter.type = "lowpass";
  filter.frequency.value = 140;
  gain.gain.value = 0;
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc1.start();
  osc2.start();
  gain.gain.linearRampToValueAtTime(0.05, ac.currentTime + 2.5);
  humNodes = { osc1, osc2, gain };

  if (!music) {
    music = new Audio("/assets/audio/ambient.mp3");
    music.loop = true;
    music.volume = 0;
  }
  void music.play().catch(() => {});
  fadeMusic(0.16, 3000);
}

export function stopHum() {
  if (humNodes && ctx) {
    const { osc1, osc2, gain } = humNodes;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
      } catch {
        /* noop */
      }
    }, 800);
    humNodes = null;
  }
  fadeMusic(0, 600);
  setTimeout(() => music?.pause(), 700);
}

function fadeMusic(target: number, ms: number) {
  if (!music) return;
  const start = music.volume;
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    if (music) music.volume = start + (target - start) * k;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function setSoundOn(v: boolean) {
  soundOn = v && sensoryEnabled;
  if (soundOn) startHum();
  else stopHum();
}

export function blip(kind: "click" | "hover" | "success" = "click") {
  if (!soundOn || !sensoryEnabled) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  if (kind === "click") {
    osc.type = "square";
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.09);
    osc.start();
    osc.stop(ac.currentTime + 0.1);
  } else if (kind === "hover") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(1240, ac.currentTime);
    gain.gain.setValueAtTime(0.025, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.06);
    osc.start();
    osc.stop(ac.currentTime + 0.07);
  } else {
    osc.type = "sine";
    osc.frequency.setValueAtTime(523, ac.currentTime);
    osc.frequency.setValueAtTime(784, ac.currentTime + 0.09);
    gain.gain.setValueAtTime(0.07, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.25);
    osc.start();
    osc.stop(ac.currentTime + 0.26);
  }
}
