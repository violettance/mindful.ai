import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, audioContext, analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !isActive || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#020617'; // Match Slate 950 bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#818cf8'; // Indigo 400
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Glow Effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#6366f1';
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, analyser]);

  return (
    <div className="w-full h-48 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center relative">
        {!isActive && (
            <div className="absolute text-slate-600 font-mono text-sm animate-pulse">
                Sistem Beklemede...
            </div>
        )}
        <canvas 
            ref={canvasRef} 
            width={800} 
            height={200} 
            className="w-full h-full"
        />
    </div>
  );
};

export default AudioVisualizer;