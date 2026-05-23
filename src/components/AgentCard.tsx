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
    <div className="bg-white border border-slate-100 rounded-[28px] p-8 transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 relative overflow-hidden group">
      
      {/* Delicate background card glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl group-hover:bg-slate-100 transition-all duration-500"></div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 bg-slate-50/80 px-3.5 py-1 rounded-full border border-slate-100">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            {pipeline.target_specialty}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-4 group-hover:text-black transition-colors">
            {pipeline.title}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Trust Index</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            <span className="text-lg font-bold font-mono text-amber-500">{pipeline.community_trust_score}</span>
            <span className="text-[10px] text-slate-400">/10</span>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-sm leading-relaxed mb-6 relative z-10">
        {pipeline.description || 'Automated clinical logic engine executing EHR analysis and billing audits.'}
      </p>
      
      <div className="grid grid-cols-2 gap-4 my-6 bg-slate-50/50 p-4 rounded-[20px] border border-slate-100 font-mono text-xs text-slate-600 relative z-10">
        <div>
          <span className="text-slate-400 block mb-1">Clinical Engine:</span> 
          <span className="text-slate-800 font-semibold flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            {pipeline.clinical_repo_source}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">Execution Limit:</span> 
          <span className="text-slate-800 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {pipeline.completion_estimate_mins}s (Simulated)
          </span>
        </div>
        <div className="col-span-2 pt-3 border-t border-slate-100">
          <span className="text-slate-400 block mb-1">Compliance Guardrail:</span>
          <span className="flex items-center gap-1.5">
            {pipeline.icd10_validation_supported ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold font-mono">ICD-10 & Payer Rule MCP Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700 font-semibold font-mono">Clinical Only (Billing Disabled)</span>
              </>
            )}
          </span>
        </div>
      </div>

      <button
        onClick={onTrigger}
        disabled={isRunning}
        className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-semibold tracking-widest uppercase transition-all duration-300 relative z-10 flex items-center justify-center gap-2 border cursor-pointer ${
          isRunning
            ? 'bg-slate-50 text-slate-450 border-slate-100 cursor-not-allowed'
            : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-md hover:shadow-slate-900/10 hover:-translate-y-[1px]'
        }`}
      >
        {isRunning ? (
          <>
            <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent rounded-full"></span>
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
