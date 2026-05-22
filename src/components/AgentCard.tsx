'use client';

import React from 'react';
import { Activity, ShieldAlert, Cpu, Sparkles, Clock, CheckCircle } from 'lucide-react';

interface PipelineProps {
  pipeline: {
    id: string;
    title: string;
    description: string;
    target_specialty: string;
    clinical_repo_source: string;
    icd10_validation_supported: boolean;
    completion_estimate_mins: number;
    community_trust_score: number;
  };
  onTrigger: () => void;
  isRunning: boolean;
}

export const AgentCard: React.FC<PipelineProps> = ({ pipeline, onTrigger, isRunning }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden group">
      {/* Visual background gradient decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium tracking-wide uppercase text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/60">
            <Activity className="w-3.5 h-3.5" />
            {pipeline.target_specialty}
          </span>
          <h3 className="text-xl font-bold text-slate-100 mt-3 group-hover:text-white transition-colors">
            {pipeline.title}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Trust Index</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-lg font-bold font-mono text-amber-400">{pipeline.community_trust_score}</span>
            <span className="text-xs text-slate-500">/10</span>
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">
        {pipeline.description || 'Automated clinical logic engine executing EHR analysis and billing audits.'}
      </p>
      
      <div className="grid grid-cols-2 gap-4 my-6 bg-slate-950/60 p-4 rounded-lg border border-slate-800/50 font-mono text-xs text-slate-300 relative z-10">
        <div>
          <span className="text-slate-500 block mb-1">Clinical Engine:</span> 
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            {pipeline.clinical_repo_source}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block mb-1">Execution Limit:</span> 
          <span className="text-slate-200 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            {pipeline.completion_estimate_mins}s (Simulated)
          </span>
        </div>
        <div className="col-span-2 pt-2 border-t border-slate-800/40">
          <span className="text-slate-500 block mb-1">Compliance Guardrail:</span>
          <span className="flex items-center gap-1.5">
            {pipeline.icd10_validation_supported ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-medium font-mono">ICD-10 & Payer Rule MCP Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-amber-500 font-medium font-mono">Clinical Only (Billing Disabled)</span>
              </>
            )}
          </span>
        </div>
      </div>

      <button
        onClick={onTrigger}
        disabled={isRunning}
        className={`w-full py-3.5 px-4 rounded-lg font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative z-10 flex items-center justify-center gap-2 border ${
          isRunning
            ? 'bg-slate-850 text-slate-500 border-slate-800 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-[1px]'
        }`}
      >
        {isRunning ? (
          <>
            <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-500 border-t-transparent rounded-full"></span>
            Orchestrating Agents...
          </>
        ) : (
          <>
            <span>▶</span> Run Simulated Intake Pipeline
          </>
        )}
      </button>
    </div>
  );
};
