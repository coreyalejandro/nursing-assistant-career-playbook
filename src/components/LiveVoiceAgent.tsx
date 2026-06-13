import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Settings, X, AudioLines } from 'lucide-react';

export function LiveVoiceAgent({ onClose }: { onClose: () => void }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startSession = async () => {
    try {
      setError(null);
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        setIsConnected(true);
        // Start audio capture
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          audioContextRef.current = new AudioContext({ sampleRate: 16000 });
          playContextRef.current = new AudioContext({ sampleRate: 24000 });
          
          const source = audioContextRef.current.createMediaStreamSource(stream);
          processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
          
          source.connect(processorRef.current);
          processorRef.current.connect(audioContextRef.current.destination);

          processorRef.current.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isMuted) return;
            
            const channelData = e.inputBuffer.getChannelData(0);
            
            // PCM to Base64
            const buffer = new ArrayBuffer(channelData.length * 2);
            const view = new DataView(buffer);
            let offset = 0;
            for (let i = 0; i < channelData.length; i++, offset += 2) {
              let s = Math.max(-1, Math.min(1, channelData[i]));
              view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
            
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            wsRef.current.send(JSON.stringify({ audio: base64 }));
          };
        } catch (audioErr: any) {
          setError(audioErr.message || "Microphone access denied");
        }
      };

      wsRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.error) {
           setError(msg.error);
        }
        if (msg.audio && playContextRef.current) {
          const binaryString = atob(msg.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBufferData = new Int16Array(bytes.buffer);
          
          // Convert Int16 PCM to Float32
          const audioBuffer = playContextRef.current.createBuffer(1, audioBufferData.length, 24000);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < audioBufferData.length; i++) {
            channelData[i] = audioBufferData[i] / 0x8000;
          }
          
          const source = playContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(playContextRef.current.destination);
          source.start();
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        stopAudio();
      };
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
    }
  };

  const stopAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (playContextRef.current) {
      playContextRef.current.close().catch(() => {});
      playContextRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    return () => { stopAudio(); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-900 border-2 border-slate-700 shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] z-50 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <AudioLines className="w-5 h-5 text-rose-500" />
          <h3 className="font-mono font-bold text-slate-200">Live Voice Agent</h3>
        </div>
        <button onClick={() => { stopAudio(); onClose(); }} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error ? (
        <div className="p-3 bg-red-900 text-red-100 text-xs mb-4 font-mono font-bold">{error}</div>
      ) : (
        <div className="p-4 bg-slate-950 border border-slate-800 text-center mb-4 flex flex-col items-center gap-3">
          {isConnected ? (
             <>
               <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center animate-pulse">
                  <AudioLines className="w-6 h-6 text-rose-500" />
               </div>
               <span className="text-rose-400 text-xs font-mono font-bold tracking-widest uppercase">Streaming</span>
             </>
          ) : (
             <span className="text-slate-400 text-xs font-mono">Not connected</span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!isConnected ? (
          <button 
            onClick={startSession} 
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold p-3 uppercase text-xs tracking-widest transition-colors flex justify-center items-center gap-2"
          >
            <Mic className="w-4 h-4" /> Start Call
          </button>
        ) : (
          <>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`flex-1 p-3 font-bold uppercase text-xs tracking-widest transition-colors flex justify-center items-center gap-2 ${isMuted ? 'bg-slate-700 text-white' : 'bg-slate-800 text-rose-400 border border-rose-500/30'} `}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button 
              onClick={stopAudio} 
              className="bg-red-600 hover:bg-red-500 text-white p-3 font-bold uppercase text-xs w-1/3"
            >
              End
            </button>
          </>
        )}
      </div>
    </div>
  );
}
