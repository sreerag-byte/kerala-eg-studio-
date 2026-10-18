// ============================================================
// Kerala EG Studio — Advanced Smooth Step Controls
// Smooth playback, speed controls (0.5x, 1x, 1.5x, 2x), timeline scrubber,
// audio chime feedback, keyboard shortcuts, and layer toggles.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw,
  Layers, Eye, EyeOff, Ruler, Tag, Grid3x3,
  ZoomIn, ZoomOut, Maximize2, Volume2, VolumeX, Gauge,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

// Web Audio API Gentle Chime Synthesizer
function playStepChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch {
    // Audio context may be restricted by browser policy before first interaction
  }
}

export const StepControls: React.FC = () => {
  const {
    canvasState, nextStep, prevStep, setCurrentStep,
    toggleConstructionLines, toggleHiddenLines,
    toggleDimensions, toggleLabels, setScale, resetViewport,
    currentSolution,
  } = useAppStore();

  const { currentStep, totalSteps, showConstructionLines, showHiddenLines, showDimensions, showLabels, viewport } = canvasState;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x, 1.0x, 1.5x, 2.0x
  const [audioEnabled, setAudioEnabled] = useState(true);

  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const play = useCallback(() => {
    if (currentStep >= totalSteps) setCurrentStep(1);
    setIsPlaying(true);
  }, [currentStep, totalSteps, setCurrentStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (playRef.current) clearInterval(playRef.current);
  }, []);

  const handleStepChange = useCallback((targetStep: number) => {
    const valid = Math.max(1, Math.min(targetStep, totalSteps));
    setCurrentStep(valid);
    if (audioEnabled) playStepChime();
  }, [totalSteps, setCurrentStep, audioEnabled]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        pause();
        if (currentStep < totalSteps) handleStepChange(currentStep + 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        pause();
        if (currentStep > 1) handleStepChange(currentStep - 1);
      } else if (e.code === 'KeyR' || e.code === 'Home') {
        e.preventDefault();
        pause();
        handleStepChange(1);
      } else if (e.code === 'End') {
        e.preventDefault();
        pause();
        handleStepChange(totalSteps);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentStep, totalSteps, play, pause, handleStepChange]);

  // Interval timer for playback with dynamic speed
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.round(1800 / playbackSpeed);
      playRef.current = setInterval(() => {
        if (currentStep < totalSteps) {
          handleStepChange(currentStep + 1);
        } else {
          setIsPlaying(false);
          if (playRef.current) clearInterval(playRef.current);
        }
      }, delay);
    }
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, handleStepChange]);

  if (!currentSolution) return null;

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-2.5 shadow-xs">
      {/* Interactive Timeline Scrubber Slider */}
      <div className="mb-2">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
          <span className="font-medium text-slate-700">Construction Timeline (Step {currentStep} of {totalSteps})</span>
          <span className="text-[11px] text-slate-400">Shortcuts: Space (Play) • ← / → (Step)</span>
        </div>
        <div className="relative flex items-center">
          <input
            type="range"
            min={1}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => {
              pause();
              handleStepChange(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Main playback control bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Playback buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { pause(); handleStepChange(1); }}
            className="toolbar-btn" title="Restart to Step 1 (Home/R)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => { pause(); handleStepChange(currentStep - 1); }}
            disabled={currentStep <= 1}
            className="toolbar-btn disabled:opacity-40"
            title="Previous Step (Left Arrow)"
          >
            <ChevronLeft size={16} />
          </button>
          {isPlaying ? (
            <button onClick={pause} className="toolbar-btn active text-blue-600 bg-blue-50" title="Pause (Space)">
              <Pause size={16} />
            </button>
          ) : (
            <button onClick={play} className="toolbar-btn" title="Play Construction (Space)">
              <Play size={16} />
            </button>
          )}
          <button
            onClick={() => { pause(); handleStepChange(currentStep + 1); }}
            disabled={currentStep >= totalSteps}
            className="toolbar-btn disabled:opacity-40"
            title="Next Step (Right Arrow)"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => { pause(); handleStepChange(totalSteps); }}
            className="toolbar-btn" title="Show Complete Drawing (End)"
          >
            <Layers size={14} />
          </button>
        </div>

        {/* Speed multiplier & Audio chime toggle */}
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
            <Gauge size={12} className="text-blue-600" />
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-transparent border-0 text-[11px] font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={0.5}>0.5x</option>
              <option value={1.0}>1.0x</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`toolbar-btn ${audioEnabled ? 'active' : ''}`}
            title={audioEnabled ? 'Audio Chime Enabled' : 'Mute Audio Chime'}
          >
            {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>

        {/* BIS Layer toggles */}
        <div className="flex items-center gap-0.5 border-l border-slate-200 pl-2">
          <button
            onClick={toggleConstructionLines}
            className={`toolbar-btn ${showConstructionLines ? 'active' : ''}`}
            title="Toggle Construction Lines"
          >
            <Grid3x3 size={14} />
          </button>
          <button
            onClick={toggleHiddenLines}
            className={`toolbar-btn ${showHiddenLines ? 'active' : ''}`}
            title="Toggle Hidden Lines"
          >
            {showHiddenLines ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={toggleDimensions}
            className={`toolbar-btn ${showDimensions ? 'active' : ''}`}
            title="Toggle Dimensions"
          >
            <Ruler size={14} />
          </button>
          <button
            onClick={toggleLabels}
            className={`toolbar-btn ${showLabels ? 'active' : ''}`}
            title="Toggle Labels"
          >
            <Tag size={14} />
          </button>
        </div>

        {/* Zoom & Fit controls */}
        <div className="flex items-center gap-0.5 border-l border-slate-200 pl-2">
          <button
            onClick={() => setScale(Math.min(20, viewport.scale * 1.25))}
            className="toolbar-btn" title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setScale(Math.max(0.2, viewport.scale * 0.8))}
            className="toolbar-btn" title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetViewport}
            className="toolbar-btn" title="Fit to Screen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
