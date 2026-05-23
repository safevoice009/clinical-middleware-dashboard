'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw, FileCode, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  clinical_note: string;
  diagnoses: string[];
  medications: string[];
  insurance: {
    payer: string;
    policy_id: string;
    status: string;
  };
}

interface TerminalConsoleProps {
  patient: Patient;
  isRunning: boolean;
  onFinished: (claimData: any) => void;
  onStepChange: (step: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  patient,
  isRunning,
  onFinished,
  onStepChange,
  isOpen,
  setIsOpen
}) => {
  const [logs, setLogs] = useState<{ time: string; text: string; type: 'system' | 'reasoning' | 'warning' | 'success' | 'info' }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [claimJson, setClaimJson] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  const steps = [
    {
      text: `[SYSTEM]: Ingesting Patient EHR data packet for [${patient.name}, ${patient.age}yo ${patient.gender}]... [MedAgentBench Ingestion Setup]`,
      type: 'system' as const,
      delay: 1200,
      stepperIndex: 1
    },
    {
      text: `[CLINICAL LOGIC]: Initiating AgentClinic diagnostics via unstructured note parsing...`,
      type: 'info' as const,
      delay: 1400,
      stepperIndex: 1
    },
    {
      text: `[CLINICAL REASONING]: Primary Impression suspected: "${patient.diagnoses[0]}". Extracting confidence parameters...`,
      type: 'reasoning' as const,
      delay: 1800,
      stepperIndex: 2
    },
    {
      text: `[OPERATIONAL INTERCEPT]: Intercepting EHR output. Checking billing compatibility...`,
      type: 'system' as const,
      delay: 1200,
      stepperIndex: 2
    },
    {
      text: `[ICD-10 AUDIT]: Cross-referencing clinical impression with ICD-10-CM registries... Matches Code: ${
        patient.id === 'pat_001' ? 'K35.80 (Unspecified acute appendicitis)' : 
        patient.id === 'pat_002' ? 'I21.4 (Non-ST elevation myocardial infarction)' : 'J20.9 / J45.909 (Acute bronchitis / Asthma)'
      }`,
      type: 'reasoning' as const,
      delay: 1600,
      stepperIndex: 3
    },
    {
      text: `[PAYER RULE AUDIT]: Verifying contract eligibility constraints for ${patient.insurance.payer} (Policy: ${patient.insurance.policy_id})...`,
      type: 'info' as const,
      delay: 1400,
      stepperIndex: 3
    },
    {
      text: `[COMPLIANCE CHECK]: Validating provider credentials and pre-authorization requirements... Zero exclusions detected.`,
      type: 'success' as const,
      delay: 1200,
      stepperIndex: 4
    },
    {
      text: `[SUCCESS]: Operational middleware audit complete. Claim record compiled safely.`,
      type: 'success' as const,
      delay: 1000,
      stepperIndex: 4
    }
  ];

  // Reset and trigger execution loop
  useEffect(() => {
    if (!isRunning) {
      setLogs([]);
      setCurrentStep(0);
      setClaimJson(null);
      return;
    }

    setLogs([{ time: getTimestamp(), text: "Initializing Autonomous Middleware Execution Loop...", type: 'system' }]);
    setCurrentStep(0);
    onStepChange(0);
  }, [isRunning, patient]);

  // Open the drawer automatically when simulation starts
  useEffect(() => {
    if (isRunning) {
      setIsOpen(true);
    }
  }, [isRunning, setIsOpen]);

  // Advance simulation steps
  useEffect(() => {
    if (!isRunning || currentStep >= steps.length) {
      if (isRunning && currentStep === steps.length && !claimJson) {
        const generatedClaim = {
          claimId: `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
          patient: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender
          },
          billingCodes: {
            icd10: patient.id === 'pat_001' ? ['K35.80'] : patient.id === 'pat_002' ? ['I21.4'] : ['J20.9', 'J45.909'],
            cpt: patient.id === 'pat_001' ? ['99222', '44970'] : patient.id === 'pat_002' ? ['99223', '93454'] : ['99213', '94640']
          },
          insurance: patient.insurance,
          auditStatus: "CLEAN_APPROVED",
          timestamp: new Date().toISOString()
        };
        setClaimJson(generatedClaim);
        onFinished(generatedClaim);
      }
      return;
    }

    const nextStep = steps[currentStep];
    const timer = setTimeout(() => {
      setLogs((prev) => [...prev, { time: getTimestamp(), text: nextStep.text, type: nextStep.type }]);
      setCurrentStep((prev) => prev + 1);
      onStepChange(nextStep.stepperIndex);
    }, nextStep.delay);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep, patient]);

  // Contain scroll to log window
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-6">
      <div 
        className={`w-full max-w-5xl bg-stone-900 border border-stone-850 rounded-t-[32px] overflow-hidden shadow-[0_-15px_40px_rgba(0,0,0,0.15)] transition-all duration-500 ease-in-out ${
          isOpen ? 'h-[360px]' : 'h-16'
        }`}
      >
        {/* Toggle Header Panel */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-stone-850/50 transition-colors cursor-pointer text-left focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-stone-200 to-emerald-400 font-extrabold flex items-center gap-2 pl-4 border-l border-stone-800 tracking-tight font-mono text-xs uppercase">
              <Terminal className="w-4 h-4 text-stone-400" />
              Developer Telemetry Logs
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {isRunning && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-[9px] font-extrabold tracking-wider uppercase font-mono border border-stone-700">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-400" />
                Stream Active
              </span>
            )}
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-stone-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-stone-400" />
            )}
          </div>
        </button>

        {/* Collapsible Logs Container */}
        {isOpen && (
          <div className="px-8 pb-6 space-y-4">
            <div 
              ref={containerRef} 
              className="h-[230px] overflow-y-auto space-y-2.5 bg-stone-950 border border-stone-850 rounded-2xl p-5 pr-3 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-stone-850 scrollbar-track-transparent select-text"
            >
              {logs.length === 0 ? (
                <p className="text-stone-500 italic my-auto">
                  No telemetry stream active. Select a patient and click "Run Intake Pipeline" above to capture live processing logs.
                </p>
              ) : (
                logs.map((log, index) => {
                  let typeColor = 'text-stone-300';
                  let badgeText = '➜';
                  let badgeColor = 'text-stone-500';

                  if (log.type === 'system') {
                    typeColor = 'text-stone-100 font-bold';
                    badgeText = '[SYS]';
                    badgeColor = 'text-cyan-400 font-extrabold';
                  } else if (log.type === 'reasoning') {
                    typeColor = 'text-fuchsia-100 font-bold';
                    badgeText = '[COG]';
                    badgeColor = 'text-fuchsia-400 font-extrabold';
                  } else if (log.type === 'warning') {
                    typeColor = 'text-amber-100 font-bold';
                    badgeText = '[WRN]';
                    badgeColor = 'text-amber-400 font-extrabold';
                  } else if (log.type === 'success') {
                    typeColor = 'text-emerald-100 font-bold';
                    badgeText = '[ OK]';
                    badgeColor = 'text-emerald-450 font-extrabold';
                  } else if (log.type === 'info') {
                    typeColor = 'text-sky-100';
                    badgeText = '[INF]';
                    badgeColor = 'text-sky-400 font-extrabold';
                  }

                  return (
                    <div key={index} className="flex items-start gap-1">
                      <span className="text-[#d6c7b3] font-bold select-none mr-2.5 shrink-0">[{log.time}]</span>
                      <span className={`${badgeColor} shrink-0 mr-2`}>{badgeText}</span>
                      <span className={typeColor}>{log.text}</span>
                    </div>
                  );
                })
              )}
              {isRunning && currentStep < steps.length && (
                <div className="flex items-center gap-1.5 text-stone-350 animate-pulse mt-3 pl-1 font-mono">
                  <span>▋</span>
                  <span>Executing autonomous routing step...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
