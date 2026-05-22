'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, RefreshCw, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

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
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ patient, isRunning, onFinished }) => {
  const [logs, setLogs] = useState<{ time: string; text: string; type: 'system' | 'reasoning' | 'warning' | 'success' | 'info' }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [claimJson, setClaimJson] = useState<any | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  const steps = [
    {
      text: `[SYSTEM]: Ingesting Patient EHR data packet for [${patient.name}, ${patient.age}yo ${patient.gender}]... [MedAgentBench Ingestion Setup]`,
      type: 'system' as const,
      delay: 1000
    },
    {
      text: `[CLINICAL LOGIC]: Initiating AgentClinic diagnostics via unstructured note parsing...`,
      type: 'info' as const,
      delay: 1500
    },
    {
      text: `[CLINICAL REASONING]: Primary Impression suspected: "${patient.diagnoses[0]}". Extracting confidence parameters...`,
      type: 'reasoning' as const,
      delay: 2000
    },
    {
      text: `[OPERATIONAL INTERCEPT]: Intercepting EHR output. Checking billing compatibility...`,
      type: 'system' as const,
      delay: 1500
    },
    {
      text: `[ICD-10 AUDIT]: Cross-referencing clinical impression with ICD-10-CM registries... Matches Code: ${
        patient.id === 'pat_001' ? 'K35.80 (Unspecified acute appendicitis)' : 
        patient.id === 'pat_002' ? 'I21.4 (Non-ST elevation myocardial infarction)' : 'J20.9 / J45.909 (Acute bronchitis / Asthma)'
      }`,
      type: 'reasoning' as const,
      delay: 1800
    },
    {
      text: `[PAYER RULE AUDIT]: Verifying contract eligibility constraints for ${patient.insurance.payer} (Policy: ${patient.insurance.policy_id})...`,
      type: 'info' as const,
      delay: 1500
    },
    {
      text: `[COMPLIANCE CHECK]: Validating provider credentials and pre-authorization requirements... Zero exclusions detected.`,
      type: 'success' as const,
      delay: 1200
    },
    {
      text: `[SUCCESS]: Operational middleware audit complete. Claim record compiled safely.`,
      type: 'success' as const,
      delay: 1000
    }
  ];

  useEffect(() => {
    if (!isRunning) {
      setLogs([]);
      setCurrentStep(0);
      setClaimJson(null);
      return;
    }

    setLogs([{ time: getTimestamp(), text: "Initializing Autonomous Middleware Execution Loop...", type: 'system' }]);
    setCurrentStep(0);
  }, [isRunning, patient]);

  useEffect(() => {
    if (!isRunning || currentStep >= steps.length) {
      if (isRunning && currentStep === steps.length && !claimJson) {
        // Compile final claim object
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
    }, nextStep.delay);

    return () => clearTimeout(timer);
  }, [isRunning, currentStep, patient]);

  // Scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/95 border border-slate-800 rounded-xl p-5 font-mono text-xs leading-relaxed shadow-2xl h-[480px] flex flex-col relative overflow-hidden">
      {/* Top Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-slate-400 font-medium flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Autonomous Middleware Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-[10px]">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Processing
            </span>
          )}
          <span className="text-slate-600 text-[10px]">v1.2.0-beta</span>
        </div>
      </div>

      {/* Terminal logs container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {logs.map((log, index) => {
          let typeColor = 'text-slate-400';
          let badgeText = '➜';
          if (log.type === 'system') {
            typeColor = 'text-blue-400';
            badgeText = '[SYS]';
          } else if (log.type === 'reasoning') {
            typeColor = 'text-purple-400';
            badgeText = '[COG]';
          } else if (log.type === 'warning') {
            typeColor = 'text-amber-500';
            badgeText = '[WRN]';
          } else if (log.type === 'success') {
            typeColor = 'text-emerald-400';
            badgeText = '[OK]';
          } else if (log.type === 'info') {
            typeColor = 'text-slate-300';
            badgeText = '[INF]';
          }

          return (
            <div key={index} className="transition-all duration-300 animate-fadeIn">
              <span className="text-slate-600 select-none mr-2 font-light">[{log.time}]</span>
              <span className={`${typeColor} font-semibold mr-1.5`}>{badgeText}</span>
              <span className="text-slate-200">{log.text}</span>
            </div>
          );
        })}
        {isRunning && currentStep < steps.length && (
          <div className="flex items-center gap-1 text-slate-500 animate-pulse mt-2 pl-1">
            <span>▋</span>
            <span>Agent reasoning in progress...</span>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Final Claim Output panel */}
      {claimJson && (
        <div className="border-t border-slate-800 pt-4 mt-4 bg-slate-950/80 -mx-5 -mb-5 p-5 shrink-0 animate-slideUp">
          <div className="flex justify-between items-center mb-3">
            <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Claim Ready for Ingestion
            </span>
            <span className="text-[10px] text-slate-500">ID: {claimJson.claimId}</span>
          </div>
          <div className="bg-black border border-slate-850 rounded p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[120px] select-all">
            <pre>{JSON.stringify(claimJson, null, 2)}</pre>
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(claimJson, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `claim-${claimJson.claimId}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold font-mono text-[10px] tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              Export Claim JSON
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(claimJson, null, 2));
                alert('Claim JSON copied to clipboard!');
              }}
              className="py-2 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded font-mono text-[10px] tracking-wider uppercase transition-colors"
            >
              Copy Raw
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
