'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Brain, Hash, ShieldCheck, Check, 
  Sparkles, AlertCircle, Copy, FileCode, CheckCircle2 
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

interface PipelineStepperProps {
  patient: Patient;
  step: number; // Simulation step (0-4)
  activeStep: number; // Interactive selected step (0-3)
  setActiveStep: (step: number) => void;
  isRunning: boolean;
  onUpdateNote: (note: string) => void;
  claimJson: any | null;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  patient,
  step,
  activeStep,
  setActiveStep,
  isRunning,
  onUpdateNote,
  claimJson
}) => {
  const [editedNote, setEditedNote] = useState(patient.clinical_note);
  const [copySuccess, setCopySuccess] = useState(false);

  // Sync edited note when patient changes
  useEffect(() => {
    setEditedNote(patient.clinical_note);
  }, [patient]);

  // Sync active step when simulation is running
  useEffect(() => {
    if (isRunning && step > 0 && step <= 4) {
      setActiveStep(step - 1);
    }
  }, [step, isRunning, setActiveStep]);

  const getIcd10Code = () => {
    if (patient.id === 'pat_001') return { code: 'K35.80', desc: 'Acute appendicitis without generalized peritonitis', matchReason: 'Localized McBurney\'s rebound tenderness + severe RLQ pain' };
    if (patient.id === 'pat_002') return { code: 'I21.4', desc: 'Non-ST elevation myocardial infarction (NSTEMI)', matchReason: 'ECG ST depression in anterior leads + elevated Troponin levels' };
    return { code: 'J20.9', desc: 'Acute bronchitis, unspecified', matchReason: 'Dry cough + shortness of breath + wheezing noted bilaterally' };
  };

  const getCptCodes = () => {
    if (patient.id === 'pat_001') return [
      { code: '99222', desc: 'Initial hospital care, moderate severity decision-making' },
      { code: '44970', desc: 'Laparoscopic appendectomy (surgical excision)' }
    ];
    if (patient.id === 'pat_002') return [
      { code: '99223', desc: 'Initial hospital care, high complexity decision-making' },
      { code: '93454', desc: 'Coronary angiography/catheterization validation' }
    ];
    return [
      { code: '99213', desc: 'Outpatient office visit, low-to-moderate decision complexity' },
      { code: '94640', desc: 'Nebulizer treatment administration (airway relief)' }
    ];
  };

  const activeIcd = getIcd10Code();
  const activeCpt = getCptCodes();

  const handleCopy = () => {
    if (claimJson) {
      navigator.clipboard.writeText(JSON.stringify(claimJson, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleExport = () => {
    if (claimJson) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(claimJson, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `claim-${claimJson.claimId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  return (
    <div className="w-full">
      {/* 4-Step Flowchart SVG Node Graphic */}
      <div className="w-full bg-[#f6f4ee] border border-[#eae6df] rounded-[32px] p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center max-w-4xl mx-auto relative px-4">
          
          {/* Connection Lines Container */}
          <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-stone-200 -z-0">
            {/* Pulsing active line animation driven by current step */}
            <div 
              className="h-full transition-all duration-1000 ease-out animate-dash"
              style={{ 
                width: isRunning ? `${(step / 4) * 100}%` : `${(activeStep / 3) * 100}%`,
                background: 'linear-gradient(to right, #10b981, #f59e0b)'
              }}
            ></div>
          </div>

          {/* Stepper Nodes */}
          {[
            { label: 'EHR Ingest', icon: FileText, desc: 'Raw Notes Parsing' },
            { label: 'Reasoner', icon: Brain, desc: 'Clinical Diagnostics' },
            { label: 'Code Map', icon: Hash, desc: 'Billing Allocations' },
            { label: 'Payer Audit', icon: ShieldCheck, desc: 'Compliance Underwriting' }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            const isResolved = isRunning ? step > idx : activeStep >= idx;
            const isActive = isRunning ? step - 1 === idx : activeStep === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!isRunning) setActiveStep(idx);
                }}
                disabled={isRunning}
                className="flex flex-col items-center relative z-10 focus:outline-none cursor-pointer group"
              >
                <div 
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${
                    isActive 
                      ? 'bg-amber-500 border-amber-500 text-white animate-pulseGlow shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                      : isResolved
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-stone-200 text-stone-400 group-hover:border-stone-400 group-hover:text-stone-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-center mt-3">
                  <span className={`block text-xs font-extrabold tracking-tight transition-colors duration-500 ${
                    isActive ? 'text-amber-600 font-extrabold' : isResolved ? 'text-emerald-700 font-extrabold' : 'text-stone-400 font-semibold'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`hidden md:block text-[9px] font-mono mt-0.5 uppercase tracking-wider transition-colors duration-500 ${
                    isActive ? 'text-amber-500/80 font-bold' : isResolved ? 'text-emerald-600/80 font-bold' : 'text-stone-400'
                  }`}>
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* active Bento Card Sandbox Stage */}
      <div className="bg-white border border-[#eae6df] rounded-[32px] p-8 min-h-[380px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 relative overflow-hidden">
        
        {/* Apple Style corner category */}
        <div className="absolute top-8 right-8 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbfaf7] border border-stone-200/80 font-mono text-[9px] font-bold text-stone-500 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse"></span>
          Interactive Sandbox // Stage {activeStep + 1}
        </div>

        {/* Step 1 Content: EHR Intake Notepad */}
        {activeStep === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-stone-900 leading-tight">EHR Intake & Entity Extraction</h3>
              <p className="text-sm text-stone-500 mt-1 font-sans">Modify the patient\'s raw clinical notes below to customize symptoms and re-verify outcomes.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
              <div className="lg:col-span-2 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">Patient Clinical Narrative (Editable)</label>
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  disabled={isRunning}
                  className="w-full h-48 bg-stone-50 border border-stone-200 rounded-2xl p-4 font-mono text-xs leading-relaxed text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 transition-all select-text disabled:opacity-100 disabled:text-stone-800 disabled:bg-stone-50/80"
                />
                <button
                  onClick={() => onUpdateNote(editedNote)}
                  disabled={isRunning || editedNote === patient.clinical_note}
                  className={`py-2 px-4 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                    editedNote === patient.clinical_note
                      ? 'bg-stone-50 text-stone-350 border-stone-200 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-900 shadow-sm'
                  }`}
                >
                  Save & Reparse Ingested Note
                </button>
              </div>

              <div className="bg-[#fbfaf7] border border-stone-200 rounded-2xl p-5 space-y-4 font-mono text-xs text-stone-700">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block border-b border-stone-200 pb-1.5">Demographic Tags</span>
                <div>
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Patient Name</span>
                  <span className="text-stone-900 font-sans font-bold text-sm block">{patient.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Age</span>
                    <span className="text-stone-900 font-bold block">{patient.age} years</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Gender</span>
                    <span className="text-stone-900 font-bold block">{patient.gender}</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 block text-[9px] uppercase tracking-wider">Insurance Carrier</span>
                  <span className="text-stone-900 font-bold block">{patient.insurance.payer}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Content: Diagnostics & Confidence Dial */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-stone-900 leading-tight">Clinical Diagnostics Reasoner</h3>
              <p className="text-sm text-stone-500 mt-1 font-sans">The clinical AI agent runs differential diagnostic modeling based on symptoms extraction.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-center">
              {/* Suspected Diagnosis detail card */}
              <div className="space-y-4">
                <div className="bg-[#fbfaf7] border border-stone-200 rounded-2xl p-6">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block mb-1">SUSPECTED PRIMARY INDICATION</span>
                  <h4 className="text-lg font-bold text-stone-900 font-serif leading-tight">{patient.diagnoses[0]}</h4>
                  
                  {patient.diagnoses.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block mb-1">Secondary Indication</span>
                      <p className="text-xs text-stone-700 font-medium">{patient.diagnoses[1]}</p>
                    </div>
                  )}
                </div>

                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 font-mono text-xs text-stone-700 space-y-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block border-b border-stone-200 pb-1.5">Prescribed Treatment Loop</span>
                  {patient.medications.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
                      <span className="text-stone-900 font-medium">{med}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Circular Gauge Graphic (Apple-aesthetic) */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Gauge Background circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="72" cy="72" r="60" 
                      className="stroke-stone-150" 
                      strokeWidth="10" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="72" cy="72" r="60" 
                      className="stroke-stone-900 transition-all duration-[1500ms] ease-out" 
                      strokeWidth="10" 
                      fill="transparent" 
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * 0.942)} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold font-mono text-stone-900 tracking-tight">94.2%</span>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-bold mt-0.5">Confidence</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-mono font-bold text-stone-600">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                  <span>AgentClinic Diagnostic Engine</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 Content: Code Allocation with interactive Cards */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-stone-900 leading-tight">ICD-10 & CPT Code Allocation</h3>
              <p className="text-sm text-stone-500 mt-1 font-sans">Middleware resolves diagnoses into clinical codes needed for underwriting audit validation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* ICD-10 Card */}
              <div className="border border-stone-200 rounded-[24px] p-6 bg-[#fbfaf7] hover:border-stone-900 hover:shadow-md transition-all duration-300 relative group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-0.5 bg-stone-900 text-white rounded text-[10px] font-extrabold font-mono tracking-wider">ICD-10-CM</span>
                  <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">Medical Classification</span>
                </div>
                <h4 className="text-3xl font-extrabold font-mono text-stone-900 mb-2">{activeIcd.code}</h4>
                <p className="text-xs text-stone-700 font-medium mb-4">{activeIcd.desc}</p>
                <div className="bg-white border border-stone-150 rounded-xl p-3 text-[10px] text-stone-500 font-mono">
                  <span className="text-stone-400 block uppercase font-bold text-[8px] tracking-wider mb-1">Resolution Logic</span>
                  {activeIcd.matchReason}
                </div>
              </div>

              {/* CPT Codes List */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block">Mapped CPT Codes (Procedures)</span>
                {activeCpt.map((cpt, idx) => (
                  <div 
                    key={idx} 
                    className="border border-stone-200 rounded-xl p-4 bg-white hover:bg-stone-50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <span className="font-mono font-bold text-stone-900 block text-sm">{cpt.code}</span>
                      <span className="text-stone-500 text-[10px] block leading-tight mt-0.5">{cpt.desc}</span>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-[#fbfaf7] flex items-center justify-center text-[10px] shrink-0 font-bold font-mono">
                      CPT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 Content: Compliance check list & JSON payload */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-stone-900 leading-tight">Payer Underwriting Audit</h3>
              <p className="text-sm text-stone-500 mt-1 font-sans">Final insurance compliance validation and schema transpile prior to outbound billing dispatch.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
              {/* Compliance Checklist */}
              <div className="space-y-4">
                <div className="bg-[#fbfaf7] border border-stone-200 rounded-[24px] p-6 space-y-3.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block border-b border-stone-200 pb-2">Compliance Auditing checklist</span>
                  {[
                    'Insurance eligibility verified and policy active',
                    'Provider NPI credentials checked & authenticated',
                    'Medical necessity matched for ICD-10 & CPT pairing',
                    'Outbound claim envelope schema conformant'
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-stone-900 text-[#fbfaf7] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-stone-700 font-medium leading-normal">{check}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="font-extrabold text-[10px] uppercase tracking-wider block">Status Code</span>
                      <span className="font-serif text-sm font-semibold">APPROVED CLAIM</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-white border border-emerald-200/50 px-3 py-1 rounded-full uppercase">
                    Clean Claim
                  </span>
                </div>
              </div>

              {/* JSON payload inspector */}
              <div className="flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block mb-2">Compiled Claim JSON Output</label>
                {claimJson ? (
                  <div className="flex-1 flex flex-col border border-stone-200 rounded-[24px] overflow-hidden bg-stone-50">
                    <div className="bg-white border-b border-stone-200 px-4 py-2 flex justify-between items-center text-[10px] font-mono text-stone-400">
                      <span>claim_envelope.json</span>
                      <span>{claimJson.claimId}</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto max-h-[140px] font-mono text-[10px] text-stone-700 select-all leading-normal">
                      <pre>{JSON.stringify(claimJson, null, 2)}</pre>
                    </div>
                    <div className="border-t border-stone-200 p-3 bg-white flex gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex-1 py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        {copySuccess ? 'Copied!' : 'Copy Code'}
                      </button>
                      <button
                        onClick={handleExport}
                        className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-mono text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        Export JSON
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 border-2 border-dashed border-stone-250 rounded-[24px] flex items-center justify-center p-8 text-center text-stone-400 font-sans italic text-xs">
                    Claim file will compile upon simulation completion.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
