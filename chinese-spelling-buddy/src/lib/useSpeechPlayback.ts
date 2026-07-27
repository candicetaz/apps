import { useCallback, useRef, useState } from 'react';
import { pauseSpeech, resumeSpeech, speakWithEvents } from './speech';

/**
 * Drives a single "read this text aloud" button: tracks whether audio is
 * currently playing/paused, and (for Reader's word-highlight-while-reading
 * effect) the character index most recently reached via the utterance's
 * boundary events.
 */
export function useSpeechPlayback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const pausedRef = useRef(false);

  const play = useCallback((text: string, rate: number) => {
    pausedRef.current = false;
    setIsPaused(false);
    setHighlightIndex(-1);
    setIsSpeaking(true);
    speakWithEvents(text, rate, {
      onBoundary: (charIndex) => {
        if (!pausedRef.current) setHighlightIndex(charIndex);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setHighlightIndex(-1);
      },
    });
  }, []);

  const togglePause = useCallback(() => {
    if (pausedRef.current) {
      pausedRef.current = false;
      setIsPaused(false);
      resumeSpeech();
    } else {
      pausedRef.current = true;
      setIsPaused(true);
      pauseSpeech();
    }
  }, []);

  return { isSpeaking, isPaused, highlightIndex, play, togglePause };
}
