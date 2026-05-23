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
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-white border border-slate-100 rounded-[28px] p-6 font-mono text-xs leading-relaxed shadow-[0_15px_40px_rgba(0,0,0,0.02)] h-[480px] flex flex-col relative overflow-hidden transition-all duration-300">
      
      {/* Top Header Panel */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-100"></span>
          </div>
          <span className="text-slate-500 font-semibold flex items-center gap-1.5 pl-3 border-l border-slate-100 tracking-tight">
            <Terminal className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
            Autonomous Middleware Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-bold tracking-wider uppercase">
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
              Processing
            </span>
          )}
          <span className="text-slate-400 text-[10px]">v1.2.0-beta</span>
        </div>
      </div>

      {/* Terminal logs container */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl p-5 pr-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {logs.map((log, index) => {
          let typeColor = 'text-slate-500';
          let badgeText = '➜';
          if (log.type === 'system') {
            typeColor = 'text-slate-800 font-bold';
            badgeText = '[SYS]';
          } else if (log.type === 'reasoning') {
            typeColor = 'text-purple-700 font-bold';
            badgeText = '[COG]';
          } else if (log.type === 'warning') {
            typeColor = 'text-amber-700 font-bold';
            badgeText = '[WRN]';
          } else if (log.type === 'success') {
            typeColor = 'text-emerald-700 font-bold';
            badgeText = '[OK]';
          } else if (log.type === 'info') {
            typeColor = 'text-slate-600';
            badgeText = '[INF]';
          }

          return (
            <div key={index} className="transition-all duration-300 animate-fadeIn flex items-start gap-1">
              <span className="text-slate-400 select-none mr-2 font-light shrink-0">[{log.time}]</span>
              <span className={`${typeColor} shrink-0 mr-1.5`}>{badgeText}</span>
              <span className="text-slate-700">{log.text}</span>
            </div>
          );
        })}
        {isRunning && currentStep < steps.length && (
          <div className="flex items-center gap-1 text-slate-400 animate-pulse mt-2 pl-1 font-mono">
            <span>▋</span>
            <span>Agent reasoning in progress...</span>
          </div>
        )}
      </div>

      {/* Final Claim Output panel */}
      {claimJson && (
        <div className="border-t border-slate-100 pt-4 mt-4 bg-slate-50/80 backdrop-blur-md -mx-6 -mb-6 p-6 shrink-0 animate-slideUp">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-800 flex items-center gap-1.5 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Claim Ready for Ingestion
            </span>
            <span className="text-[10px] text-slate-400 font-bold">ID: {claimJson.claimId}</span>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-[11px] font-mono text-slate-600 overflow-x-auto max-h-[120px] select-all shadow-inner">
            <pre>{JSON.stringify(claimJson, null, 2)}</pre>
          </div>
          <div className="flex gap-3 mt-4">
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
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold font-mono text-[10px] tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5" />
              Export Claim JSON
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(claimJson, null, 2));
                alert('Claim JSON copied to clipboard!');
              }}
              className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer"
            >
              Copy Raw
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
