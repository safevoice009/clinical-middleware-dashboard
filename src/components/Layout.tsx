'use client';

import React, { useState, useEffect } from 'react';
import { TerminalConsole } from './TerminalConsole';
import { AgentCard } from './AgentCard';
import { PipelineStepper } from './PipelineStepper';
import { supabase } from '../lib/supabase';
import mockPatients from '../data/mockPatientData.json';
import { Database, ShieldCheck, Play, UserCheck, AlertCircle, Heart } from 'lucide-react';

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
  const [patients, setPatients] = useState<Patient[]>(mockPatients as Patient[]);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(mockPatients[0] as Patient);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [claimsCount, setClaimsCount] = useState(0);
  const [step, setStep] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [claimJson, setClaimJson] = useState<any | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Sync selected patient from patients array if modified
  useEffect(() => {
    const current = patients.find((p) => p.id === selectedPatient.id);
    if (current) {
      setSelectedPatient(current);
    }
  }, [patients, selectedPatient.id]);

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
    setClaimJson(null);
    setStep(0);
    setActiveStep(0);
    setIsRunning(true);
  };

  const handleFinishedSimulation = async (claimData: any) => {
    setIsRunning(false);
    setClaimJson(claimData);
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

  const handleUpdateNote = (newNote: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, clinical_note: newNote } : p))
    );
  };

  return (
    <div id="overview" className="min-h-screen bg-[#fbfaf7] text-stone-900 flex flex-col font-sans select-none pb-24 scroll-smooth">
      
      {/* Floating navigation pill menu (matching reference portfolio site) */}
      <div className="w-full flex justify-center pt-8 px-4 relative z-40">
        <nav className="bg-white/90 backdrop-blur-md border border-[#eae6df] px-8 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex gap-8 items-center text-xs font-bold uppercase tracking-widest text-stone-500">
          <button 
            onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-extrabold focus:outline-none"
          >
            Overview
          </button>
          <button 
            onClick={() => document.getElementById('patient-intake')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-extrabold focus:outline-none"
          >
            Patient Intake
          </button>
          <button 
            onClick={() => document.getElementById('pipeline-engine')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-extrabold focus:outline-none"
          >
            Pipeline Engine
          </button>
          <button 
            onClick={() => {
              setIsConsoleOpen(true);
              setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }, 100);
            }} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-extrabold focus:outline-none"
          >
            Developer Logs
          </button>
          <button 
            onClick={() => document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-extrabold focus:outline-none"
          >
            Ecosystem
          </button>
        </nav>
      </div>

      {/* Main Page Header */}
      <div className="max-w-5xl w-full mx-auto px-6 pt-12 pb-6 text-center relative z-10">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-stone-950 tracking-tight mb-3">
          Clinical Systems Architecture
        </h1>
        <p className="text-xs font-mono tracking-widest text-stone-400 uppercase font-bold">
          EHR Operational Middleware // Payer Code Guardrails
        </p>

        {/* Telemetry status bar */}
        <div className="flex justify-center gap-4 mt-6 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5 bg-white border border-[#eae6df] px-3.5 py-1.5 rounded-full shadow-sm">
            <Database className={`w-3.5 h-3.5 ${isDbLoaded ? 'text-emerald-700' : 'text-stone-400'}`} />
            <span>Database: <span className={isDbLoaded ? 'text-emerald-700 font-extrabold' : 'text-stone-500'}>{isDbLoaded ? 'Supabase Connected' : 'Offline Mode'}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#eae6df] px-3.5 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
            <span>Telemetry Audits: <span className="text-stone-950 font-extrabold">{claimsCount}</span></span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Patient Selector & Middleware Control */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 space-y-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selector Bento Panel (col-span-2) */}
          <div id="patient-intake" className="lg:col-span-2 bg-white border border-[#eae6df] rounded-[32px] p-6 shadow-sm space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-stone-600" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">Step 1: Patient Ingestion Hub</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {patients.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => {
                    if (!isRunning) {
                      setSelectedPatient(pat);
                    }
                  }}
                  disabled={isRunning}
                  className={`py-4 px-4 rounded-[20px] border font-mono text-left transition-all duration-300 flex flex-col justify-between h-24 ${
                    selectedPatient.id === pat.id
                      ? 'bg-stone-900 border-stone-900 text-[#fbfaf7] shadow-md shadow-stone-900/10'
                      : 'bg-white border-[#eae6df] text-stone-450 hover:border-stone-400 hover:text-stone-850 shadow-sm'
                  } ${isRunning ? 'pointer-events-none' : 'cursor-pointer'}`}
                >
                  <span className="text-[8px] font-bold block uppercase tracking-wider opacity-60">{pat.id}</span>
                  <span className="text-xs font-extrabold truncate block font-sans">{pat.name.split(' ')[0]}</span>
                  <span className="text-[9px] block opacity-70">{pat.gender}, {pat.age}y</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middleware Controller Panel */}
          {pipeline && (
            <AgentCard
              pipeline={pipeline}
              onTrigger={handleTriggerPipeline}
              isRunning={isRunning}
            />
          )}
        </div>

        {/* Central Pipeline Interactive Play Area */}
        <div id="pipeline-engine" className="scroll-mt-24">
          <PipelineStepper
            patient={selectedPatient}
            step={step}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            isRunning={isRunning}
            onUpdateNote={handleUpdateNote}
            claimJson={claimJson}
          />
        </div>

        {/* Informative Bento footer section */}
        <div id="ecosystem" className="bg-white border border-[#eae6df] rounded-[32px] p-6 flex gap-4 text-xs text-stone-500 shadow-sm max-w-4xl mx-auto scroll-mt-24">
          <AlertCircle className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Architecture Notice:</strong> This clinical middleware operates by intercepting unstructured clinical text (EHR logs) generated by reasoning systems (like <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[10px]">AgentClinic</code>). It runs automated ICD-10 transpilation audits, maps corresponding CPT procedure parameters, and verifies insurance payer compliance guidelines before shipping clean claims records.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-[10px] font-mono text-stone-400">
        Clinical Systems Playground // Compiled by Antigravity Agent // Next.js & Supabase
      </footer>

      {/* Collapsible Telemetry Terminal Drawer */}
      <TerminalConsole
        patient={selectedPatient}
        isRunning={isRunning}
        onFinished={handleFinishedSimulation}
        onStepChange={setStep}
        isOpen={isConsoleOpen}
        setIsOpen={setIsConsoleOpen}
      />
      
    </div>
  );
};
