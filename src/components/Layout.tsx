'use client';

import React, { useState, useEffect } from 'react';
import { TerminalConsole } from './TerminalConsole';
import { AgentCard } from './AgentCard';
import { PipelineStepper } from './PipelineStepper';
import { OnboardingTour } from './OnboardingTour';
import { supabase } from '../lib/supabase';
import mockPatients from '../data/mockPatientData.json';
import { 
  Database, ShieldCheck, Play, UserCheck, AlertCircle, 
  ExternalLink, FileText, Info 
} from 'lucide-react';

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

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

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
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [keysTyped, setKeysTyped] = useState('');
  const [isTampered, setIsTampered] = useState(false);

  // 1. Console Signature Log
  useEffect(() => {
    console.log(
      "%c🏥 CLINICAL MIDDLEWARE SYSTEM PLAYGROUND %c\n" +
      "Designed & Developed by Dr. Baddam Sucharith Reddy\n" +
      "Role: Clinical Systems Architect / Health Tech Innovator\n" +
      "Credits: AI-Assisted Architecture (Antigravity)\n" +
      "License: MIT License (c) 2026 Dr. Baddam Sucharith Reddy. All rights reserved.\n" +
      "LinkedIn: https://www.linkedin.com/in/sucharith007\n" +
      "GitHub: https://github.com/safevoice009\n" +
      "Signature Verification Key: e4c99557bc1fe77b42ff2b67cdb9c24efb48197779de0927c7f3e825a0728c2e",
      "color: #b45309; font-weight: 800; font-size: 13px; font-family: sans-serif; background-color: #fef3c7; padding: 6px 12px; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 6px; display: inline-block;",
      "color: #44403c; font-weight: 550; font-size: 11px; line-height: 1.6; font-family: monospace;"
    );
  }, []);

  // 2. Keyboard Easter Egg Sequence Detector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }
      const newKeys = (keysTyped + e.key.toLowerCase()).slice(-20);
      setKeysTyped(newKeys);
      if (newKeys.includes('sucharith')) {
        setShowEasterEgg(true);
        setKeysTyped('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keysTyped]);

  // 3. DOM Integrity & Anti-Tamper Check
  useEffect(() => {
    const checkIntegrity = () => {
      const bodyText = document.body.innerText || '';
      const hasAuthor = bodyText.includes('Dr. Baddam Sucharith Reddy') || bodyText.includes('Sucharith');
      
      const footerElement = document.querySelector('footer');
      const footerHasName = footerElement ? (footerElement.innerText.includes('Sucharith') || footerElement.innerText.includes('Dr. Baddam')) : false;

      if (!hasAuthor || !footerHasName) {
        setIsTampered(true);
      } else {
        setIsTampered(false);
      }
    };

    const initialTimer = setTimeout(checkIntegrity, 3000);
    const interval = setInterval(checkIntegrity, 4000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // Auto-start tour for new visitors
  useEffect(() => {
    const hasSeen = localStorage.getItem('has_seen_tour_sandbox');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
        localStorage.setItem('has_seen_tour_sandbox', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

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

  // Auto-scroll to the pipeline engine when simulation steps advance and terminal is closed
  useEffect(() => {
    if (isRunning && step > 0 && !isConsoleOpen) {
      const element = document.getElementById('pipeline-engine');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [step, isRunning, isConsoleOpen]);

  const handleTriggerPipeline = () => {
    setClaimJson(null);
    setStep(0);
    setActiveStep(0);
    setIsRunning(true);
    setIsConsoleOpen(true); // Expand console initially to show logs startup

    // Collapse drawer after 2 seconds so the user can clearly see the visual flowchart progress
    setTimeout(() => {
      setIsConsoleOpen(false);
    }, 2000);
  };

  const handleFinishedSimulation = async (claimData: any) => {
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

    // Auto-Scroll to center on the pipeline details
    setIsRunning(false);
    setTimeout(() => {
      const element = document.getElementById('pipeline-engine');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleUpdateNote = (newNote: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, clinical_note: newNote } : p))
    );
  };

  return (
    <div id="overview" className="min-h-screen bg-[#fbfaf7] text-stone-900 flex flex-col font-sans select-none pb-32 scroll-smooth">
      
      {/* Floating navigation pill menu */}
      <div className="fixed top-4 left-0 right-0 z-45 flex justify-center px-4 pointer-events-none max-w-full">
        <nav className="bg-white/95 backdrop-blur-md border border-[#eae6df] px-4 py-2 rounded-full shadow-[0_12px_40px_rgba(28,25,23,0.045)] flex gap-1.5 md:gap-2 items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500 overflow-x-auto max-w-full scrollbar-none whitespace-nowrap pointer-events-auto">
          <button 
            onClick={() => {
              setIsConsoleOpen(false);
              document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
          >
            Overview
          </button>
          <button 
            onClick={() => {
              setIsConsoleOpen(false);
              document.getElementById('patient-intake')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
          >
            Patient Intake
          </button>
          <button 
            onClick={() => {
              setIsConsoleOpen(false);
              document.getElementById('pipeline-engine')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
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
            className="hover:text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
          >
            Developer Logs
          </button>
          <button 
            onClick={() => {
              setIsConsoleOpen(false);
              document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' });
            }} 
            className="hover:text-stone-900 hover:bg-stone-50 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none hover:scale-105 active:scale-95"
          >
            Ecosystem
          </button>
          <button 
            onClick={() => {
              setIsConsoleOpen(false);
              setIsTourOpen(true);
            }} 
            className="text-amber-700 bg-amber-50 hover:text-amber-800 hover:bg-amber-100/80 border border-amber-250/40 px-4 py-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none hover:scale-105 active:scale-95 flex items-center gap-1 font-extrabold"
          >
            ✨ Quick Tour
          </button>
        </nav>
      </div>

      {/* Main Page Header */}
      <div className="max-w-5xl w-full mx-auto px-6 pt-24 md:pt-28 pb-6 text-center relative z-10">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-stone-955 tracking-tight mb-3">
          Clinical Systems Architecture
        </h1>
        <p className="text-xs font-mono tracking-widest text-stone-400 uppercase font-bold">
          EHR Operational Middleware // Payer Code Guardrails
        </p>

        {/* Telemetry status bar */}
        <div className="flex justify-center gap-4 mt-6 text-[10px] font-mono text-stone-500">
          <div className="flex items-center gap-1.5 bg-white border border-[#eae6df] px-3.5 py-1.5 rounded-full shadow-sm">
            <Database className={`w-3.5 h-3.5 ${isDbLoaded ? 'text-emerald-700' : 'text-stone-450'}`} />
            <span>Database: <span className={isDbLoaded ? 'text-emerald-700 font-extrabold' : 'text-stone-500'}>{isDbLoaded ? 'Supabase Connected' : 'Offline Mode'}</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-[#eae6df] px-3.5 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
            <span>Telemetry Audits: <span className="text-stone-950 font-extrabold">{claimsCount}</span></span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Patient Ingest & Middleware Control */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-6 space-y-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selector Bento Panel */}
          <div 
            id="patient-intake" 
            className="lg:col-span-2 bg-white border border-[#eae6df] rounded-[32px] p-6 shadow-sm space-y-4 hover:shadow-md hover:-translate-y-1 transition-all duration-500 ease-out will-change-transform scroll-mt-24"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-stone-600" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">Step 1: Patient Ingestion Hub</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {patients.map((pat) => (
                <button
                  key={pat.id}
                  id={`patient-btn-${pat.id}`}
                  onClick={() => {
                    if (!isRunning) {
                      setSelectedPatient(pat);
                    }
                  }}
                  disabled={isRunning}
                  className={`py-4 px-4 rounded-[20px] border font-mono text-left shadow-sm flex flex-col justify-between h-24 will-change-transform transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
                    selectedPatient.id === pat.id
                      ? 'bg-stone-900 border-stone-900 text-[#fbfaf7] shadow-md shadow-stone-900/10'
                      : 'bg-white border-[#eae6df] text-stone-600 hover:border-stone-400 hover:text-stone-950 hover:bg-stone-50/20'
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

        {/* Informative Bento Section */}
        <div 
          id="ecosystem" 
          className="bg-white border border-[#eae6df] rounded-[32px] p-6 flex gap-4 text-xs text-stone-600 shadow-sm max-w-4xl mx-auto hover:shadow-md hover:-translate-y-0.5 transition-all duration-500 ease-out will-change-transform scroll-mt-24"
        >
          <AlertCircle className="w-5 h-5 text-stone-550 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Architecture Notice:</strong> This clinical middleware operates by intercepting unstructured clinical text (EHR logs) generated by reasoning systems (like <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[10px]">AgentClinic</code>). It runs automated ICD-10 transpilation audits, maps corresponding CPT procedure parameters, and verifies insurance payer compliance guidelines before shipping clean claims records.
          </p>
        </div>

        {/* Developer Info & References Bento Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Dr Baddam Sucharith Reddy Profile Card */}
          <div className="bg-white border border-[#eae6df] rounded-[32px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 ease-out will-change-transform flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold tracking-wider uppercase text-stone-500 bg-[#fbfaf7] px-2.5 py-0.5 rounded-full border border-stone-200/80 mb-3.5">
                Developer Profile
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-900 leading-tight">Dr. Baddam Sucharith Reddy</h4>
              <p className="text-[11px] font-sans text-stone-500 mt-1 font-medium">Healthcare Systems Architect specializing in clinical NLP pipelines and autonomous agent auditing networks.</p>
            </div>
            <div className="mt-4">
              <a 
                href="https://www.linkedin.com/in/sucharith007" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-855 text-white rounded-xl font-mono text-[9px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
                LinkedIn Profile
              </a>
            </div>
          </div>

          {/* GitHub Project Codebase Card */}
          <div className="bg-white border border-[#eae6df] rounded-[32px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 ease-out will-change-transform flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold tracking-wider uppercase text-stone-500 bg-[#fbfaf7] px-2.5 py-0.5 rounded-full border border-stone-200/80 mb-3.5">
                Code Repository
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-900 leading-tight">Project Source</h4>
              <p className="text-[11px] font-sans text-stone-500 mt-1 font-medium">Read the production-ready code blocks, database migration DDLs, and automation pipelines deployed for this sandbox.</p>
            </div>
            <div className="mt-4">
              <a 
                href="https://github.com/safevoice009/clinical-middleware-dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-mono text-[9px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
              >
                <GitHubIcon className="w-3.5 h-3.5 text-stone-650" />
                GitHub Repository
              </a>
            </div>
          </div>

          {/* Research References Card */}
          <div className="bg-white border border-[#eae6df] rounded-[32px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 ease-out will-change-transform flex flex-col justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold tracking-wider uppercase text-stone-500 bg-[#fbfaf7] px-2.5 py-0.5 rounded-full border border-stone-200/80">
                Ecosystem References
              </span>
              <h4 className="font-serif text-lg font-bold text-stone-900 leading-tight">Research Frameworks</h4>
              
              <div className="space-y-1.5 font-mono text-[9px] text-stone-600">
                <a href="https://github.com/W革新者/AgentClinic" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-stone-950 hover:underline">
                  <span>➜ AgentClinic (Dialogue)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-stone-455" />
                </a>
                <a href="https://github.com/vinesmsuic/MedAgentBench" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-stone-950 hover:underline">
                  <span>➜ MedAgentBench (EHR)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-stone-455" />
                </a>
                <a href="https://github.com/textviewer/EHRAgent" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-stone-950 hover:underline">
                  <span>➜ EHRAgent (Reasoning)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-stone-455" />
                </a>
              </div>
            </div>
            <div className="text-[8px] font-mono text-stone-400 pt-2 border-t border-stone-100 uppercase tracking-widest text-center mt-3">
              Open-Source Ingestions
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-12 text-center space-y-2 border-t border-stone-200/80 bg-white/40 mt-12 relative z-10">
        <p className="text-[10px] font-mono text-stone-650">
          Developed by **Dr. Baddam Sucharith Reddy** (AI-Assisted) // Copyright © 2026. All rights reserved.
        </p>
        <p className="max-w-3xl mx-auto text-[9px] font-sans text-stone-455 leading-relaxed px-6">
          <strong>Legal Disclaimer:</strong> This application is a clinical software architecture proof-of-concept. All clinical notes, diagnostics confidence ratios, ICD-10 CM coding recommendations, payer rule assertions, and database logs are strictly simulated datasets designed for portfolio presentation. No Protected Health Information (PHI) is collected, stored, or processed.
        </p>
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

      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        isRunning={isRunning}
        triggerSimulation={handleTriggerPipeline}
        selectedPatientId={selectedPatient.id}
        onSelectPatient={(id) => {
          const pat = patients.find((p) => p.id === id);
          if (pat) setSelectedPatient(pat);
        }}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      {/* Verifiable Authorship Certificate Modal (Easter Egg) */}
      {showEasterEgg && (
        <div 
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out"
          onClick={() => setShowEasterEgg(false)}
        >
          <div 
            className="bg-[#fbfaf7] border border-amber-200 rounded-[32px] max-w-md w-full p-8 shadow-2xl relative overflow-hidden transition-all transform scale-100 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sand-gold aesthetic design accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200" />
            
            <div className="flex flex-col items-center text-center space-y-2.5 pb-2 border-b border-stone-200/60">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-700 animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 leading-tight">
                Authorship Verified
              </h3>
              <p className="text-[9px] font-mono tracking-wider uppercase text-stone-400 font-bold">
                Clinical Middleware Integrity Registry
              </p>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex justify-between items-center py-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">Architect</span>
                <span className="font-sans font-extrabold text-stone-900">Dr. Baddam Sucharith Reddy</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">Credentials</span>
                <span className="font-sans font-semibold text-stone-900">Physician & Health Tech Innovator</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">System Engine</span>
                <span className="font-sans font-semibold text-stone-900">Autonomous EHR Intercept Cockpit</span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">Integrity Checksum</span>
                <span className="font-mono text-[9px] bg-stone-150/60 px-2.5 py-1.5 rounded text-stone-750 select-all break-all leading-normal border border-stone-200/50">
                  sha256-e4c99557bc1fe77b42ff2b67cdb9c24efb48197779de0927c7f3e825a0728c2e
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400">Build Source</span>
                <span className="font-sans font-semibold text-emerald-800 bg-emerald-50 border border-emerald-250/30 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                  AI-Assisted (Antigravity)
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3.5 border-t border-stone-200/60">
              <div className="flex justify-center gap-5 text-[9px] font-mono font-bold uppercase tracking-wider">
                <a 
                  href="https://www.linkedin.com/in/sucharith007" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-stone-500 hover:text-stone-950 underline flex items-center gap-1.5"
                >
                  LinkedIn Profile ➜
                </a>
                <a 
                  href="https://github.com/safevoice009" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-stone-500 hover:text-stone-950 underline flex items-center gap-1.5"
                >
                  GitHub Profile ➜
                </a>
              </div>
              <button
                onClick={() => setShowEasterEgg(false)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer active:scale-95 hover:scale-[1.02]"
              >
                Dismiss Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating DOM Anti-Tamper Security Banner */}
      {isTampered && (
        <div className="fixed bottom-6 right-6 z-55 max-w-xs bg-amber-50 border border-amber-300 rounded-[24px] p-5 shadow-xl shadow-amber-900/10 animate-bounce flex gap-3 text-stone-900 max-w-[280px]">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-amber-800">
              Integrity Check Failed
            </h5>
            <p className="text-[9px] font-sans text-stone-600 leading-normal font-semibold">
              Authorship credit has been modified. This codebase was engineered by <strong>Dr. Baddam Sucharith Reddy</strong> (AI-Assisted).
            </p>
            <div className="pt-1">
              <a 
                href="https://www.linkedin.com/in/sucharith007" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[9px] font-mono font-bold text-amber-850 hover:underline flex items-center gap-1"
              >
                LinkedIn Verification ➜
              </a>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
