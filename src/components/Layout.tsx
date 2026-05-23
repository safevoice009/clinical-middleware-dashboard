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
          // Fallback if DB query fails or has no records
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

    // Insert log metrics into Supabase to demonstrate pipeline analytics
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 flex flex-col font-sans select-none selection:bg-emerald-500/20 selection:text-emerald-400 relative">
      {/* Decorative ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Top Banner Header */}
      <header className="border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-md sticky top-0 z-50 px-8 py-5 flex justify-between items-center transition-all duration-300 relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-100 uppercase">
              Clinical Systems Architecture
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Operational EHR Middleware // Payer Code Guardrails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database className={`w-3.5 h-3.5 ${isDbLoaded ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>DB Status: <span className={isDbLoaded ? 'text-emerald-400' : 'text-slate-500'}>{isDbLoaded ? 'Supabase Connected' : 'Fallback Mode'}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Audits Completed: <span className="text-blue-400 font-bold">{claimsCount}</span></span>
            </div>
          </div>
          <a
            href="https://github.com/vinesmsuic/MedAgentBench"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] text-xs font-mono font-medium text-slate-300 hover:text-slate-100 transition-all duration-300"
          >
            Core Research Decks
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Pane (Metadata cards, patient selector, EHR preview) */}
        <section className="lg:col-span-5 space-y-6 flex flex-col justify-start">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-200 mb-2">1. Ingest Clinical Intent</h2>
            <p className="text-xs text-slate-500 font-mono">Select a patient profile to ingest unstructured Electronic Health Record details.</p>
          </div>

          {/* Patient Profile Selector */}
          <div className="grid grid-cols-3 gap-3">
            {patients.map((pat) => (
              <button
                key={pat.id}
                onClick={() => {
                  if (!isRunning) setSelectedPatient(pat);
                }}
                disabled={isRunning}
                className={`py-3.5 px-4 rounded-2xl border font-mono text-left transition-all duration-500 flex flex-col justify-between h-24 ${
                  selectedPatient.id === pat.id
                    ? 'bg-white/[0.08] border-emerald-500/50 text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.1)] shadow-inner'
                    : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:bg-white/[0.05] hover:border-white/[0.1] hover:text-slate-200'
                } ${isRunning ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-[10px] text-slate-500 block truncate">{pat.id.toUpperCase()}</span>
                <span className="text-xs font-bold truncate block">{pat.name.split(' ')[0]}</span>
                <span className="text-[9px] text-slate-500 block">{pat.gender}, {pat.age}y</span>
              </button>
            ))}
          </div>

          {/* Unstructured EHR Note Box */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
              <span className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Raw EHR Note Snippet
              </span>
              <span className="text-[9px] font-mono text-slate-500 bg-black/40 border border-white/[0.06] px-2 py-0.5 rounded">
                Unstructured Data
              </span>
            </div>
            <p className="text-slate-300 text-xs font-mono leading-relaxed h-[130px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent select-text">
              {selectedPatient.clinical_note}
            </p>
          </div>

          {/* Active Pipeline Card */}
          {pipeline && (
            <div className="relative">
              <div className="absolute -top-2.5 left-5 px-2.5 bg-slate-950 text-[10px] tracking-wider uppercase font-bold text-slate-500 font-mono z-10 border border-white/[0.06] rounded-full">
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
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-200 mb-1">3. Middleware Reasoning Loop</h2>
              <p className="text-xs text-slate-500 font-mono">Observe automated code validation & insurance compliance auditing in real time.</p>
            </div>
          </div>

          <TerminalConsole
            patient={selectedPatient}
            isRunning={isRunning}
            onFinished={handleFinishedSimulation}
          />

          {/* Additional details about the pipeline stack */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex gap-4 text-xs font-mono text-slate-500 shadow-lg">
            <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This proof-of-concept simulates the integration of clinical decision models (like AgentClinic) with administrative verification pipes (ICD-10 maps and billing regulations). Telemetry logs are pushed to PostgreSQL on Supabase database to verify operational execution and compliance checks.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-950/40 py-6 text-center text-[10px] font-mono text-slate-600 relative z-10">
        Clinical Architect Portfolio // Built with Next.js App Router, Supabase, Tailwind CSS. Managed by Antigravity Agent.
      </footer>
    </div>
  );
};
