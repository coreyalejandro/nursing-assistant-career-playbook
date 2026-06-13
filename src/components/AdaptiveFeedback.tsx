import React, { useState, useEffect, useRef } from 'react';
import { Smile, Meh, Frown, Undo2, Tag, Mic, Square, Check, AlertTriangle } from 'lucide-react';

interface FeedbackPayload {
  feedback_id: string;
  timestamp: string;
  page_context: {
    url: string;
    active_tab: string;
  };
  payload: {
    sentiment_score: 'happy' | 'neutral' | 'sad';
    quick_tags: string[];
    transcription?: string;
    has_audio: boolean;
  };
}

interface AdaptiveFeedbackProps {
  currentUrl?: string;
  currentViewMode?: string;
}

export default function AdaptiveFeedback({ 
  currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cna-playbook.local/home', 
  currentViewMode = 'home' 
}: AdaptiveFeedbackProps) {
  // Master Interactive State Hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sentiment, setSentiment] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isUndoVisible, setIsUndoVisible] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References for Timing Safety Window and Recording Hardware Streams
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Algorithmic Tag Generator matching active navigation layout
  const getContextualTags = (): string[] => {
    switch (currentViewMode) {
      case 'home':
        return ['Clear Overview', 'Easy Navigation', 'Helpful Intro', 'Needs More Text'];
      case 'resume':
        return ['Fast Input Fields', 'Layout Looks Crisp', 'Print Formatted Clean', 'Export Error'];
      case 'playbook':
        return ['Wage Info Clear', 'Script is Actionable', 'Good Interview Prep', 'Confusing Salary Stats'];
      case 'audit':
        return ['Compliance Simple', 'STEADI Guide Helpful', 'Case Study Direct', 'Jargon Too Heavy'];
      case 'about':
        return ['Privacy Terms Transparent', 'Clear Methodology', 'Data Handling Explicit', 'Too Wordy'];
      default:
        return ['General UI Great', 'Slight Lag Encountered', 'Found Typo Error', 'Feature Addition Request'];
    }
  };

  // Rank 1 Management: Baseline Sentiment Selector with Safety Buffer Window
  const handleSentimentSelect = (type: 'happy' | 'neutral' | 'sad') => {
    setSentiment(type);
    setIsOpen(true);
    setIsUndoVisible(true);
    setErrorMessage(null);

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Set 3-second temporary grace window before sealing background buffer entries
    undoTimeoutRef.current = setTimeout(() => {
      setIsUndoVisible(false);
    }, 3000);
  };

  // Complete Manual Form Reversal Pipeline
  const triggerUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setSentiment(null);
    setSelectedTags([]);
    setIsOpen(false);
    setIsUndoVisible(false);
    setTranscription('');
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  // Rank 2 Management: Direct Contextual Tag Activation
  const toggleTag = (tag: string) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      setIsUndoVisible(false);
    }
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Rank 3 Management: Platform-Safe Audio Recording Interface
  const startAudioRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Microphone capturing mechanisms are blocked or unsupported by this client layout configuration.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      
      // Verification of sandbox codec processing safety
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setTranscription('Audio stream recorded cleanly. Raw dictation package bundled.');
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setErrorMessage('Device microphone deployment failed. Check security permissions dashboard settings.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Structured Storage Consolidation Logic
  const submitCompleteFeedbackPipeline = () => {
    if (!sentiment) return;

    const feedbackPackage: FeedbackPayload = {
      feedback_id: `fb-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      page_context: {
        url: currentUrl,
        active_tab: currentViewMode,
      },
      payload: {
        sentiment_score: sentiment,
        quick_tags: selectedTags,
        transcription: transcription || undefined,
        has_audio: audioChunksRef.current.length > 0,
      },
    };

    try {
      const activeStorageLogs = JSON.parse(localStorage.getItem('cna_feedback_records_archive') || '[]');
      localStorage.setItem('cna_feedback_records_archive', JSON.stringify([...activeStorageLogs, feedbackPackage]));

      setIsSubmitted(true);
      
      setTimeout(() => {
        setIsOpen(false);
        setSentiment(null);
        setSelectedTags([]);
        setTranscription('');
        setIsSubmitted(false);
        setErrorMessage(null);
      }, 2000);
    } catch (err) {
      setErrorMessage('Failed to write package record indices safely to localized system logs.');
    }
  };

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans no-print" data-testid="adaptive-feedback-root">
      {/* Expanded Workflow Controls Shell */}
      {isOpen && sentiment && (
        <div className="mb-3 w-80 rounded-2xl border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-2 rounded-full bg-emerald-100 p-2 text-emerald-600 border-2 border-slate-900">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h4 className="font-black uppercase tracking-tight text-slate-900">Telemetry Stored</h4>
              <p className="text-xs font-bold text-slate-500 mt-1">Package indexed securely to device system arrays.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Context Monitoring Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Adaptive Input Configuration
                </span>
                {isUndoVisible && (
                  <button
                    onClick={triggerUndo}
                    className="flex items-center space-x-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer"
                  >
                    <Undo2 className="h-3 w-3" />
                    <span>Undo Entry</span>
                  </button>
                )}
              </div>

              {/* Rank 2 Element Viewport Selection Container */}
              <div className="space-y-2">
                <label className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-tight text-slate-700">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Context Matching Flags (Optional)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {getContextualTags().map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-md border px-2 py-1 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rank 3 Audio Interfacing Configuration Blocks */}
              <div className="space-y-2">
                <label className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-tight text-slate-700">
                  <Mic className="h-3.5 w-3.5" />
                  <span>Voice Memo Dictation Pad</span>
                </label>
                <div className="flex items-center space-x-2">
                  {isRecording ? (
                    <button
                      onClick={stopAudioRecording}
                      className="flex items-center space-x-2 rounded-xl bg-rose-500 border-2 border-slate-900 px-3 py-2 text-xs font-black uppercase text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] animate-pulse cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5 fill-white" />
                      <span>Halt Track</span>
                    </button>
                  ) : (
                    <button
                      onClick={startAudioRecording}
                      className="flex items-center space-x-2 rounded-xl bg-slate-100 border-2 border-slate-200 px-3 py-2 text-xs font-black uppercase text-slate-700 hover:border-slate-900 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Mic className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Tap to Speak</span>
                    </button>
                  )}
                  {transcription && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                      Stream Bound
                    </span>
                  )}
                </div>
              </div>

              {/* Active Verification Error Messages */}
              {errorMessage && (
                <div className="flex items-start space-x-1.5 rounded-lg border border-rose-250 bg-rose-50 p-2 text-[11px] font-bold text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Pipeline Transmission Execution Mechanism */}
              <button
                onClick={submitCompleteFeedbackPipeline}
                className="w-full rounded-xl bg-emerald-500 border-2 border-slate-900 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Submit Feedback Package
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ambient Persistent Tracking Baseline Module UI Row */}
      <div className="flex items-center space-x-1 rounded-full border-4 border-slate-900 bg-white p-1.5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <span className="pl-2 pr-1 text-[11px] font-black uppercase tracking-tight text-slate-400 border-r-2 border-slate-100 mr-1 hidden sm:inline">
          Page Feedback
        </span>

        <button
          onClick={() => handleSentimentSelect('happy')}
          aria-label="Rate experience positive"
          className={`rounded-full p-2 transition-all hover:bg-emerald-50 cursor-pointer ${
            sentiment === 'happy' ? 'bg-emerald-500 text-white border-2 border-slate-900 p-1.5' : 'text-emerald-600'
          }`}
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          onClick={() => handleSentimentSelect('neutral')}
          aria-label="Rate experience neutral"
          className={`rounded-full p-2 transition-all hover:bg-amber-50 cursor-pointer ${
            sentiment === 'neutral' ? 'bg-amber-500 text-white border-2 border-slate-900 p-1.5' : 'text-amber-600'
          }`}
        >
          <Meh className="h-5 w-5" />
        </button>

        <button
          onClick={() => handleSentimentSelect('sad')}
          aria-label="Rate experience negative"
          className={`rounded-full p-2 transition-all hover:bg-rose-50 cursor-pointer ${
            sentiment === 'sad' ? 'bg-rose-500 text-white border-2 border-slate-900 p-1.5' : 'text-rose-600'
          }`}
        >
          <Frown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
