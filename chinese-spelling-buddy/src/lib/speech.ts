// Thin wrapper around the Web Speech API's SpeechSynthesis. Everything here
// is best-effort: browsers vary a lot in which Chinese voices they ship, and
// some (older Firefox, some Android WebViews) don't support speech synthesis
// at all — isSpeechSupported() lets callers disable audio buttons instead of
// throwing.

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickChineseVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('zh-cn')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ??
    undefined
  );
}

// Chrome loads voices asynchronously and getVoices() returns an empty list
// until the voiceschanged event fires at least once — calling this early
// (on app mount) means the first "Read aloud" tap already has a voice ready
// instead of silently using the browser default (often English) voice.
export function primeVoices(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices(), { once: true });
}

export function speak(text: string, rate = 1): void {
  if (!isSpeechSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export interface SpeakWithEventsHandlers {
  onBoundary?: (charIndex: number) => void;
  onEnd?: () => void;
}

export function speakWithEvents(text: string, rate: number, handlers: SpeakWithEventsHandlers): void {
  if (!isSpeechSupported() || !text.trim()) {
    handlers.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  const voice = pickChineseVoice();
  if (voice) utterance.voice = voice;
  utterance.onboundary = (e) => handlers.onBoundary?.(e.charIndex);
  utterance.onend = () => handlers.onEnd?.();
  utterance.onerror = () => handlers.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function pauseSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.pause();
}

export function resumeSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.resume();
}

export function cancelSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
