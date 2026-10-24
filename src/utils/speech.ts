/**
 * Native Web Speech API integration for IELTS pronunciation & recognition
 */

export interface SpeechPlaybackOptions {
  rate?: number; // 0.8, 1.0, 1.2
  pitch?: number;
  accent?: 'en-GB' | 'en-AU' | 'en-US';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  onBoundary?: (charIndex: number) => void;
}

class SpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public speak(text: string, options: SpeechPlaybackOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onEnd?.();
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    // Pick best matching voice
    const voices = this.getVoices();
    const targetAccent = options.accent || 'en-GB';

    const preferredVoice =
      voices.find((v) => v.lang.includes(targetAccent)) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
      // Ensure onEnd is also fired on error to prevent UI freeze
      options.onEnd?.();
    };

    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        options.onBoundary?.(event.charIndex);
      };
    }

    window.speechSynthesis.speak(utterance);
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speech = new SpeechService();

export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError?: (err: unknown) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      onResult(current.toLowerCase());
    };

    recognition.onerror = (event: any) => {
      onError?.(event.error);
    };

    return recognition;
  } catch (e) {
    console.warn('SpeechRecognition initialization failed:', e);
    return null;
  }
}
