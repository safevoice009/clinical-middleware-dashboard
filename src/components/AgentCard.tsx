'use client';

import React from 'react';
import { Activity, Sparkles, Cpu, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

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
    <div className="bg-white border border-[#eae6df] rounded-[32px] p-6 shadow-sm flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 relative group overflow-hidden">
      
      {/* Background soft glow decoration */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#fbfaf7] rounded-full blur-2xl group-hover:bg-[#f5f3eb] transition-all duration-500"></div>

      <div className="relative z-10 space-y-4">
        {/* Header tags */}
        <div className="flex justify-between items-start">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold tracking-widest uppercase text-stone-500 bg-[#fbfaf7] px-3 py-1 rounded-full border border-stone-200/80">
            <Activity className="w-3 h-3 text-stone-400" />
            {pipeline.target_specialty}
          </span>
          <div className="flex items-center gap-0.5 font-mono text-[9px] font-bold text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            <span className="text-stone-900 font-extrabold text-xs pl-0.5">{pipeline.community_trust_score}</span>
            <span>/10</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-950 group-hover:text-stone-900 transition-colors leading-tight">
            {pipeline.title}
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 leading-relaxed font-sans font-medium">
            {pipeline.description || 'Automated clinical logic engine executing EHR analysis and billing audits.'}
          </p>
        </div>

        {/* Middleware specs list */}
        <div className="bg-[#fbfaf7] border border-stone-200/80 rounded-2xl p-3.5 space-y-2 font-mono text-[10px] text-stone-600">
          <div className="flex justify-between">
            <span className="text-stone-400 font-bold uppercase tracking-wider">Clinical Ingestion</span>
            <span className="text-stone-850 font-bold flex items-center gap-1 font-sans">
              <Cpu className="w-3 h-3 text-stone-400" />
              {pipeline.clinical_repo_source.split(' ')[0]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400 font-bold uppercase tracking-wider">Run Limit</span>
            <span className="text-stone-850 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {pipeline.completion_estimate_mins}s (Simulated)
            </span>
          </div>
          <div className="border-t border-stone-200 pt-2 flex justify-between items-center">
            <span className="text-stone-400 font-bold uppercase tracking-wider">Guardrails Mode</span>
            <span className="flex items-center gap-1">
              {pipeline.icd10_validation_supported ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-900 fill-stone-100" />
                  <span className="text-stone-900 font-black text-[9px] uppercase tracking-wider">MCP Active</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-700 font-black text-[9px] uppercase tracking-wider">Clinical Only</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Large button controller */}
      <div className="relative z-10 mt-5">
        <button
          id="run-intake-btn"
          onClick={onTrigger}
          disabled={isRunning}
          className={`w-full py-3.5 px-4 rounded-xl font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer ${
            isRunning
              ? 'bg-stone-50 text-stone-350 border-stone-200 cursor-not-allowed'
              : 'bg-stone-900 hover:bg-stone-850 text-white border-stone-900 shadow-sm hover:shadow-md hover:-translate-y-[1px]'
          }`}
        >
          {isRunning ? (
            <>
              <span className="animate-spin h-3.5 w-3.5 border-2 border-stone-400 border-t-transparent rounded-full"></span>
              Orchestrating Pipeline...
            </>
          ) : (
            <>
              <span>▶</span> Run Intake Pipeline
            </>
          )}
        </button>
      </div>

    </div>
  );
};
