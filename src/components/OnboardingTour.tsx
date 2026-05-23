'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, HelpCircle, X, ChevronRight, ChevronLeft, PlayCircle, StopCircle } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  isRunning: boolean;
  triggerSimulation: () => void;
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

interface TourStep {
  targetId?: string;
  title: string;
  description: string;
  popoverPlacement?: 'bottom' | 'top' | 'center';
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  isRunning,
  triggerSimulation,
  selectedPatientId,
  onSelectPatient,
  activeStep,
  setActiveStep,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, scale: 1, visible: false });
  const [isMobile, setIsMobile] = useState(false);
  const activeTimers = useRef<any[]>([]);
  const activeIntervals = useRef<any[]>([]);

  // Listen to window size for responsive mobile layouts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tourSteps: TourStep[] = [
    {
      title: "Clinical Systems Playground",
      description: "Welcome! This dashboard simulates an autonomous clinical intake pipeline. Let's take a quick guided tour to see how NLP parsing and insurance guardrails work.",
      popoverPlacement: "center"
    },
    {
      targetId: "patient-intake",
      title: "1. Patient Ingestion Hub",
      description: "We start by selecting a patient card. Each patient is loaded with simulated clinical notes. Try clicking Patient 1 (Baddam) to load their medical record.",
      popoverPlacement: "bottom"
    },
    {
      targetId: "run-intake-btn",
      title: "2. Trigger AI Middleware Ingest",
      description: "Click 'Run Intake Pipeline' to trigger the autonomous reasoning cycle. This triggers NLP entity extraction and clinical diagnosis agents.",
      popoverPlacement: "bottom"
    },
    {
      targetId: "console-drawer-header",
      title: "3. Developer Telemetry Drawer",
      description: "This bottom terminal opens to stream live agent logs. It collapses automatically after 2 seconds to keep the workspace clean.",
      popoverPlacement: "top"
    },
    {
      targetId: "pipeline-engine",
      title: "4. Explore Pipeline Stepper & Bento Cards",
      description: "Here, each step of the pipeline lights up as it finishes. You can click on EHR Ingest, Reasoner, Code Map, and Payer Audit to explore custom differential diagnoses, confidence dials, code mappings, and compiled claim envelopes.",
      popoverPlacement: "bottom"
    },
    {
      title: "Interactive Sandbox Ready",
      description: "Tour complete! You are now in full control. Try editing the clinical narrative note, re-running the intake pipeline, and testing out the payer compliance limits.",
      popoverPlacement: "center"
    }
  ];

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      clearAllActivities();
    };
  }, []);

  const clearAllActivities = () => {
    activeTimers.current.forEach(clearTimeout);
    activeTimers.current = [];
    activeIntervals.current.forEach(clearInterval);
    activeIntervals.current = [];
  };

  const addTimer = (cb: () => void, ms: number) => {
    const t = setTimeout(cb, ms);
    activeTimers.current.push(t);
  };

  const addInterval = (cb: () => void, ms: number) => {
    const i = setInterval(cb, ms);
    activeIntervals.current.push(i);
  };

  // Run tour lifecycle positioning & dynamic tracking polling (every 100ms)
  useEffect(() => {
    if (!isOpen) {
      setHighlightRect(null);
      setCursorPos(prev => ({ ...prev, visible: false }));
      setIsAutoPlaying(false);
      clearAllActivities();
      return;
    }

    const stepData = tourSteps[currentStep];
    if (!stepData) return;

    // Initial scroll into view
    if (stepData.targetId) {
      const el = document.getElementById(stepData.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const updateRect = () => {
      if (stepData.targetId) {
        const el = document.getElementById(stepData.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightRect((prev) => {
            if (
              !prev ||
              prev.top !== rect.top ||
              prev.bottom !== rect.bottom ||
              prev.left !== rect.left ||
              prev.right !== rect.right ||
              prev.width !== rect.width ||
              prev.height !== rect.height
            ) {
              return rect;
            }
            return prev;
          });
        } else {
          setHighlightRect(null);
        }
      } else {
        setHighlightRect(null);
        setCursorPos(prev => ({ ...prev, visible: false }));
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 100);
    activeIntervals.current.push(interval);

    return () => {
      clearInterval(interval);
    };
  }, [currentStep, isOpen]);

  // Auto advance for Step 3 (Developer Telemetry Drawer) in both manual and auto modes
  useEffect(() => {
    if (isOpen && currentStep === 3) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2600);
      activeTimers.current.push(timer);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  // Execute Auto-Demo animation steps
  useEffect(() => {
    if (!isAutoPlaying || !isOpen) return;

    clearAllActivities();

    if (currentStep === 0) {
      // Welcome screen auto advance
      addTimer(() => handleNext(), 2500);
    } 
    else if (currentStep === 1) {
      // Click Patient card pat_001
      const targetBtn = "patient-btn-pat_001";
      addTimer(() => {
        animateCursorTo(targetBtn, () => {
          onSelectPatient("pat_001");
          addTimer(() => handleNext(), 1200);
        });
      }, 500);
    } 
    else if (currentStep === 2) {
      // Click Run Intake button
      const triggerBtn = "run-intake-btn";
      addTimer(() => {
        animateCursorTo(triggerBtn, () => {
          triggerSimulation();
          addTimer(() => handleNext(), 1200);
        });
      }, 500);
    } 
    else if (currentStep === 3) {
      // Watch logs stream, wait for drawer auto close & scroll to stepper
      addTimer(() => {
        // Once console collapses and page scrolls down, advance
        handleNext();
      }, 2500);
    } 
    else if (currentStep === 4) {
      // Walk through stepper nodes sequentially to show the bento tabs
      const stepsSequence = [0, 1, 2, 3];
      let seqIndex = 0;

      const runStepperWalk = () => {
        if (seqIndex >= stepsSequence.length) {
          setCursorPos(prev => ({ ...prev, visible: false }));
          addTimer(() => handleNext(), 1000);
          return;
        }

        const activeNodeId = `stepper-node-${stepsSequence[seqIndex]}`;
        const nodeIdx = stepsSequence[seqIndex];

        animateCursorTo(activeNodeId, () => {
          setActiveStep(nodeIdx);
          seqIndex++;
          addTimer(runStepperWalk, 1800);
        });
      };

      addTimer(runStepperWalk, 1000);
    } 
    else if (currentStep === 5) {
      // Final screen, auto end after 6 seconds
      setIsAutoPlaying(false);
    }
  }, [currentStep, isAutoPlaying, isOpen]);

  const animateCursorTo = (elementId: string, onArrival?: () => void) => {
    const el = document.getElementById(elementId);
    if (!el) {
      if (onArrival) onArrival();
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    addTimer(() => {
      const rect = el.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      // Make cursor visible at starting offset if not already visible
      setCursorPos(prev => ({
        x: prev.visible ? prev.x : window.innerWidth / 2,
        y: prev.visible ? prev.y : window.innerHeight - 100,
        scale: 1,
        visible: true
      }));

      // Fly to element
      addTimer(() => {
        setCursorPos({ x: targetX, y: targetY, scale: 1, visible: true });

        // Wait for glide to complete, then scale pulse click
        addTimer(() => {
          setCursorPos({ x: targetX, y: targetY, scale: 0.8, visible: true });

          addTimer(() => {
            setCursorPos({ x: targetX, y: targetY, scale: 1, visible: true });
            if (onArrival) onArrival();
          }, 150);
        }, 1000);
      }, 50);
    }, 600); // Allow scrolling to finish
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    clearAllActivities();
    setCursorPos(prev => ({ ...prev, visible: false }));
    setIsAutoPlaying(false);
    onClose();
  };

  const startAutoDemo = () => {
    setCurrentStep(0);
    setIsAutoPlaying(true);
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];

  // Compute position relative to highlight rect
  const getPopoverStyle = () => {
    if (isMobile) {
      // Fixed bottom sheet drawer on mobile devices to prevent cutting off controls
      return {
        position: 'fixed' as const,
        bottom: '24px',
        left: '16px',
        right: '16px',
        width: 'calc(100vw - 32px)',
        zIndex: 9998,
        transform: 'none',
        transition: 'all 0.4s ease-out',
      };
    }

    if (!highlightRect || currentStepData.popoverPlacement === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9998,
      };
    }

    const spaceBelow = window.innerHeight - highlightRect.bottom;
    const placeAbove = spaceBelow < 220;

    return {
      position: 'fixed' as const,
      left: `${highlightRect.left + highlightRect.width / 2}px`,
      top: placeAbove 
        ? `${highlightRect.top - 16}px` 
        : `${highlightRect.bottom + 16}px`,
      transform: placeAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
      zIndex: 9998,
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <>
      {/* Dynamic Dark Spotlight Cutout Overlay */}
      {highlightRect && (
        <div 
          className="fixed pointer-events-none z-[9997] transition-all duration-[600ms] ease-out border-2 border-amber-400 shadow-[0_0_0_9999px_rgba(28,25,23,0.55)] rounded-[24px] animate-pulseSlow"
          style={{
            left: `${highlightRect.left - 8}px`,
            top: `${highlightRect.top - 8}px`,
            width: `${highlightRect.width + 16}px`,
            height: `${highlightRect.height + 16}px`,
          }}
        />
      )}
      
      {/* Full screen dim click-catcher when no highlight (centers the popover) */}
      {!highlightRect && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-[2px] z-[9996] transition-all duration-500 animate-fadeIn" />
      )}

      {/* Floating simulated mouse pointer */}
      {cursorPos.visible && (
        <div 
          className="pointer-events-none fixed z-[9999] transition-all duration-1000 ease-in-out"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: `translate(-50%, -50%) scale(${cursorPos.scale})`,
          }}
        >
          <svg className="w-8 h-8 text-stone-900 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 3v15.25l4.5-4.25h6.5l-11-11z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          {cursorPos.scale < 1 && (
            <span className="absolute -inset-3 rounded-full border-2 border-amber-500 animate-ping opacity-80"></span>
          )}
        </div>
      )}

      {/* Tour Dialog Popover Card */}
      <div 
        style={getPopoverStyle()}
        className="w-[calc(100vw-32px)] md:w-80 bg-[#fbfaf7] border border-[#eae6df] text-stone-900 rounded-[28px] p-6 shadow-[0_20px_50px_rgba(28,25,23,0.15)] flex flex-col justify-between max-w-sm overflow-hidden select-none animate-fadeIn"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
            <Sparkles className="w-2.5 h-2.5" />
            {isAutoPlaying ? '🤖 AUTO DEMO PLAYING' : `Step ${currentStep + 1} of ${tourSteps.length}`}
          </span>
          <button 
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-750 transition-colors p-1 rounded-full hover:bg-stone-100/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="font-serif text-lg font-bold text-stone-905 leading-tight">{currentStepData.title}</h4>
          <p className="text-xs text-stone-500 font-sans leading-relaxed font-medium">
            {currentStepData.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center justify-between">
          <div>
            {currentStep === 0 && !isAutoPlaying && (
              <button 
                onClick={startAutoDemo}
                className="flex items-center gap-1 py-1.5 px-3 bg-amber-550 hover:bg-amber-600 text-white rounded-xl font-mono text-[9px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-xs"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Auto Play
              </button>
            )}
            {isAutoPlaying && (
              <button 
                onClick={() => setIsAutoPlaying(false)}
                className="flex items-center gap-1 py-1.5 px-3 bg-stone-900 text-white rounded-xl font-mono text-[9px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer hover:bg-stone-800"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Stop Auto
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {!isAutoPlaying && currentStep > 0 && (
              <button 
                onClick={handlePrev}
                className="p-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={isAutoPlaying}
              className={`py-1.5 px-3.5 rounded-xl font-mono text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                isAutoPlaying 
                  ? 'bg-stone-100 text-stone-400 border border-stone-150 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-805 text-white border border-stone-900 hover:scale-[1.03] active:scale-[0.98] cursor-pointer'
              }`}
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
