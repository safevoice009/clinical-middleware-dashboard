'use client';

import React, { useState, useEffect } from 'react';
import { TerminalConsole } from './TerminalConsole';
import { AgentCard } from './AgentCard';
import { supabase } from '../lib/supabase';
import mockPatients from '../data/mockPatientData.json';
import { Database, FileText, Settings, Heart, AlertCircle, ShieldCheck } from 'lucide-react';

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

interface Pipeline {
  id: string;
  title: string;
  description: string;
  target_specialty: string;
  clinical_repo_source: string;
  icd10_validation_supported: boolean;
  completion_estimate_mins: number;
  community_trust_score: number;
}

export const Layout: React.FC = () => {
  const [patients] = useState<Patient[]>(mockPatients as Patient[]);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(mockPatients[0] as Patient);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [claimsCount, setClaimsCount] = useState(0);

  // Fetch pipeline data from Supabase
  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const { data, error } = await supabase
          .from('clinical_pipelines')
          .select('*')
          .limit(1)
          .single();

        if (data) {
          setPipeline({
            id: data.id,
            title: data.title,
            description: data.description,
            target_specialty: data.target_specialty,
            clinical_repo_source: data.clinical_repo_source,
            icd10_validation_supported: data.icd10_validation_supported,
            completion_estimate_mins: data.completion_estimate_mins,
            community_trust_score: Number(data.community_trust_score)
          });
          setIsDbLoaded(true);
        } else {
          console.warn('No pipeline records found in Supabase. Using local fallback.');
          setPipeline({
            id: 'fallback_id',
            title: 'Cardiovascular Trial Matching & Validation Engine',
            description: 'Automated clinical trial eligibility matching wrapped with an operational billing guardrail.',
            target_specialty: 'Cardiology',
            clinical_repo_source: 'AgentClinic + MedAgentBench',
            icd10_validation_supported: true,
            completion_estimate_mins: 5,
            community_trust_score: 9.4
          });
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
        setPipeline({
          id: 'fallback_id',
          title: 'Cardiovascular Trial Matching & Validation Engine',
          description: 'Automated clinical trial eligibility matching wrapped with an operational billing guardrail.',
          target_specialty: 'Cardiology',
          clinical_repo_source: 'AgentClinic + MedAgentBench',
          icd10_validation_supported: true,
          completion_estimate_mins: 5,
          community_trust_score: 9.4
        });
      }
    };

    fetchPipeline();
  }, []);

  const handleTriggerPipeline = () => {
    setIsRunning(true);
  };

  const handleFinishedSimulation = async (claimData: any) => {
    setIsRunning(false);
    setClaimsCount((prev) => prev + 1);

    if (pipeline && pipeline.id !== 'fallback_id') {
      try {
        const { error } = await supabase.from('pipeline_logs').insert([
          {
            pipeline_id: pipeline.id,
            step_name: 'EHR Intake Audit',
            status: 'Success',
            log_payload: claimData
          }
        ]);
        if (error) console.error('Failed to log to Supabase:', error);
      } catch (err) {
        console.error('Supabase telemetry logging error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafb] text-slate-800 flex flex-col font-sans select-none selection:bg-emerald-500/10 selection:text-emerald-800">
      
      {/* Floating navigation pill menu (matching reference portfolio site) */}
      <div className="w-full flex justify-center pt-8 px-4 relative z-50">
        <nav className="bg-white/90 backdrop-blur-md border border-slate-100/80 px-8 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex gap-8 items-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Overview</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer text-slate-900 font-bold border-b-2 border-slate-850 pb-0.5">Clinical</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Capabilities</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Projects</span>
          <span className="hover:text-slate-900 transition-colors cursor-pointer">Ecosystem</span>
        </nav>
      </div>

      {/* Main Page Header */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-12 text-center relative z-10">
        <h1 className="font-serif text-3xl md:text-5xl font-medium text-slate-900 tracking-tight mb-3">
          Clinical Systems Architecture
        </h1>
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          EHR Operational Middleware // Payer Code Guardrails
        </p>

        {/* Telemetry info row */}
        <div className="flex justify-center gap-6 mt-6 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
            <Database className={`w-3 h-3 ${isDbLoaded ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Database: <span className={isDbLoaded ? 'text-emerald-700 font-bold' : 'text-slate-500'}>{isDbLoaded ? 'Supabase' : 'Offline'}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Telemetry Audits: <span className="text-emerald-700 font-bold">{claimsCount}</span></span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Pane (Patient Selector & Input EHR) */}
        <section className="lg:col-span-5 space-y-6 flex flex-col justify-start">
          <div className="pl-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block mb-1">Step 1</span>
            <h2 className="text-lg font-bold text-slate-900">Ingest Clinical Intent</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Select a patient profile to parse unstructured Electronic Health Record details.</p>
          </div>

          {/* Patient Selector Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {patients.map((pat) => (
              <button
                key={pat.id}
                onClick={() => {
                  if (!isRunning) setSelectedPatient(pat);
                }}
                disabled={isRunning}
                className={`py-3.5 px-4 rounded-[20px] border font-mono text-left transition-all duration-500 flex flex-col justify-between h-24 ${
                  selectedPatient.id === pat.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 shadow-sm'
                } ${isRunning ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`text-[9px] block ${selectedPatient.id === pat.id ? 'text-slate-400' : 'text-slate-400'}`}>{pat.id.toUpperCase()}</span>
                <span className="text-xs font-bold truncate block">{pat.name.split(' ')[0]}</span>
                <span className={`text-[9px] block ${selectedPatient.id === pat.id ? 'text-slate-400' : 'text-slate-400'}`}>{pat.gender}, {pat.age}y</span>
              </button>
            ))}
          </div>

          {/* Unstructured EHR Note Box */}
          <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <span className="text-slate-400 font-mono text-[9px] tracking-widest uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Raw EHR Note Snippet
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                Unstructured Data
              </span>
            </div>
            <p className="text-slate-600 text-xs font-mono leading-relaxed h-[130px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent select-text">
              {selectedPatient.clinical_note}
            </p>
          </div>

          {/* Active Pipeline Card */}
          {pipeline && (
            <div className="relative">
              <div className="absolute -top-2 left-6 px-3 bg-[#fafafb] text-[9px] tracking-wider uppercase font-bold text-slate-400 font-mono z-10">
                2. Operational Middleware
              </div>
              <AgentCard
                pipeline={pipeline}
                onTrigger={handleTriggerPipeline}
                isRunning={isRunning}
              />
            </div>
          )}
        </section>

        {/* Right Pane (Console Terminal Stream) */}
        <section className="lg:col-span-7 space-y-6 flex flex-col justify-start">
          <div className="pl-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block mb-1">Step 3</span>
            <h2 className="text-lg font-bold text-slate-900">Middleware Reasoning Loop</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Observe automated code validation & insurance compliance auditing in real time.</p>
          </div>

          <TerminalConsole
            patient={selectedPatient}
            isRunning={isRunning}
            onFinished={handleFinishedSimulation}
          />

          {/* Additional details about the pipeline stack */}
          <div className="bg-white border border-slate-100 rounded-[28px] p-6 flex gap-4 text-xs font-mono text-slate-500 shadow-[0_15px_40px_rgba(0,0,0,0.02)]">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This proof-of-concept simulates the integration of clinical decision models (like AgentClinic) with administrative verification pipes (ICD-10 maps and billing regulations). Telemetry logs are pushed to PostgreSQL on Supabase database to verify operational execution and compliance checks.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-[10px] font-mono text-slate-400 relative z-10 mt-auto">
        Clinical Architect Portfolio // Built with Next.js App Router, Supabase, Tailwind CSS. Managed by Antigravity Agent.
      </footer>
    </div>
  );
};
