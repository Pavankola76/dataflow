"use client";

import React, { useEffect, useState, useRef } from "react";
import "./GuidedTour.css";

const TOUR_STEPS = [
  { id: "home", audio: "/tour/01_home.mp3", route: "/home", text: "Processing Brazilian E-Commerce Dataset" },
  { id: "connections", audio: "/tour/02_connections.mp3", route: "/connections", text: "Linking Olist S3 Data Lakes" },
  { id: "ingestion", audio: "/tour/03_ingestion.mp3", route: "/ingestion", text: "Extracting 100k Brazilian Orders" },
  { id: "pipelines", audio: "/tour/04_pipelines.mp3", route: "/pipelines", text: "Cleansing Geolocation Records" },
  { id: "streams", audio: "/tour/05_streams.mp3", route: "/streams", text: "Streaming Live Payments (Kafka)" },
  { id: "models", audio: "/tour/06_models.mp3", route: "/models", text: "Building Conformed Olist Analytics" },
  { id: "quality", audio: "/tour/07_quality.mp3", route: "/quality", text: "Validating Brazilian Zip Codes" },
  { id: "memory", audio: "/tour/08_memory.mp3", route: "/memory", text: "Vectorizing Seller Relationships" },
  { id: "catalog", audio: "/tour/09_catalog.mp3", route: "/catalog", text: "Masking Customer Email PII" },
  { id: "glossary", audio: "/tour/10_glossary.mp3", route: "/glossary", text: "Defining Freight Value KPIs" },
  { id: "lineage", audio: "/tour/11_lineage.mp3", route: "/lineage", text: "Tracing Order Price Metrics" },
  { id: "dashboards", audio: "/tour/12_dashboards.mp3", route: "/dashboards", text: "Visualizing São Paulo Orders" },
  { id: "collaborate", audio: "/tour/13_collaborate.mp3", route: "/collaborate", text: "Co-Authoring Transformations" },
  { id: "sdk", audio: "/tour/14_sdk.mp3", route: "/sdk", text: "Embedding Seller Volume Charts" },
  { id: "reports", audio: "/tour/15_reports.mp3", route: "/reports", text: "Scheduling Regional Delay PDFs" },
  { id: "analytics", audio: "/tour/16_analytics.mp3", route: "/analytics", text: "Asking: Top selling categories?" },
  { id: "performance", audio: "/tour/17_performance.mp3", route: "/performance", text: "Clustering Massive Geodata" },
  { id: "contracts", audio: "/tour/18_contracts.mp3", route: "/contracts", text: "Enforcing Upstream Schema" },
  { id: "approvals", audio: "/tour/19_approvals.mp3", route: "/approvals", text: "Peer-Reviewing Olist Updates" },
  { id: "commits", audio: "/tour/20_commits.mp3", route: "/commits", text: "Auditing Architectural Changes" },
  { id: "syncs", audio: "/tour/21_syncs.mp3", route: "/syncs", text: "Syncing CLV Scores to Salesforce" },
  { id: "cost", audio: "/tour/22_cost.mp3", route: "/cost", text: "Attributing Snowflake Compute" },
  { id: "security", audio: "/tour/23_security.mp3", route: "/security", text: "Logging LGPD Query Events" },
  { id: "workspaces", audio: "/tour/24_workspaces.mp3", route: "/workspaces", text: "Isolating Latin America Tenant" },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 500, y: 500 });
  const [isClicking, setIsClicking] = useState(false);
  const [helperText, setHelperText] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      setStepIdx(0);
      setCursorPos({ x: 500, y: 500 });
      setHelperText("Initializing Full Platform Tour...");
    } else {
      clearAllTimeouts();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    clearAllTimeouts();

    const currentStep = TOUR_STEPS[stepIdx];
    if (!currentStep) {
      onClose();
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = currentStep.audio;
      audioRef.current.play().catch(console.error);
    }

    const estimatedSidebarY = Math.min(100 + (stepIdx * 32), 650);

    const tMove = setTimeout(() => {
      setCursorPos({ x: 80, y: estimatedSidebarY });
      setHelperText(currentStep.text);
    }, 600);

    const tClick = setTimeout(() => {
      setIsClicking(true);
      const tRelease = setTimeout(() => setIsClicking(false), 300);
      timeoutsRef.current.push(tRelease);
    }, 1500);

    timeoutsRef.current.push(tMove, tClick);

    // ==========================================
    // SYNTHETIC INTERACTION ENGINE
    // ==========================================
    let isCancelled = false;
    
    const executeInteraction = async () => {
      if (isCancelled) return;
      
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      const doc = iframe.contentDocument;
      if (!doc) return;

      const typeText = async (element: HTMLInputElement | HTMLTextAreaElement, text: string, speed = 40) => {
        const win = iframe.contentWindow as any;
        const proto = element instanceof HTMLTextAreaElement 
           ? win.HTMLTextAreaElement.prototype 
           : win.HTMLInputElement.prototype;
           
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;

        for (let i = 0; i <= text.length; i++) {
          if (isCancelled) return;
          nativeInputValueSetter?.call(element, text.slice(0, i));
          element.dispatchEvent(new Event("input", { bubbles: true }));
          await new Promise(r => setTimeout(r, speed));
        }
      };

      const clickTextBtn = async (text: string, x: number, y: number) => {
         await new Promise(r => setTimeout(r, 1500));
         if (isCancelled) return;
         const btn = Array.from(doc.querySelectorAll("button")).find(b => 
            b.textContent?.includes(text) || b.title?.includes(text) 
         );
         if (btn) {
           setCursorPos({ x, y });
           setIsClicking(true);
           setTimeout(() => setIsClicking(false), 200);
           btn.click();
         }
      };

      try {
        if (currentStep.id === "home") await clickTextBtn("Refresh", 800, 100);
        
        if (currentStep.id === "connections") {
           setCursorPos({ x: 500, y: 300 });
           await new Promise(r => setTimeout(r, 2000));
           if (isCancelled) return;
           
           const btn = Array.from(doc.querySelectorAll("button")).find(b => b.textContent?.includes("New Connection"));
           if (btn) btn.click();

           await new Promise(r => setTimeout(r, 800));
           if (isCancelled) return;
           
           const host = doc.getElementById("conn-host") as HTMLInputElement;
           const db = doc.getElementById("conn-db") as HTMLInputElement;
           const user = doc.getElementById("conn-user") as HTMLInputElement;
           const pass = doc.getElementById("conn-pass") as HTMLInputElement;

           if (host) await typeText(host, "olist-prod.rds.amazonaws.com", 25);
           if (db) await typeText(db, "brazilian_ecommerce", 25);
           if (user) await typeText(user, "data_engineer_service", 25);
           if (pass) await typeText(pass, "********", 25);

           await new Promise(r => setTimeout(r, 800));
           if (isCancelled) return;
           const saveBtn = Array.from(doc.querySelectorAll("button")).find(b => b.textContent?.includes("Save Connection"));
           if (saveBtn) {
              setCursorPos({ x: 600, y: 600 });
              saveBtn.click();
           }
        }

        if (currentStep.id === "ingestion") await clickTextBtn("New Sync Job", 800, 150);
        if (currentStep.id === "pipelines") await clickTextBtn("Deploy & Run", 800, 350);
        if (currentStep.id === "streams") await clickTextBtn("Monitor", 700, 200);
        if (currentStep.id === "models") await clickTextBtn("Share", 850, 120);
        
        if (currentStep.id === "quality") {
           await new Promise(r => setTimeout(r, 1500));
           if (isCancelled) return;
           const accordion = doc.querySelector(".cursor-pointer") as HTMLElement;
           if (accordion) {
             setCursorPos({ x: 400, y: 400 });
             setIsClicking(true);
             setTimeout(() => setIsClicking(false), 200);
             accordion.click();
           }
        }

        if (currentStep.id === "memory") {
           await new Promise(r => setTimeout(r, 1500));
           if (isCancelled) return;
           const search = doc.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
           if (search) {
             setCursorPos({ x: 400, y: 200 });
             await typeText(search, "seller relationship context", 25);
           }
        }

        if (currentStep.id === "catalog") {
           await new Promise(r => setTimeout(r, 1000));
           if (isCancelled) return;
           const search = doc.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
           if (search) {
             setCursorPos({ x: 400, y: 200 });
             await typeText(search, "customer_pii_masked", 30);
           }
        }

        if (currentStep.id === "glossary") {
           await new Promise(r => setTimeout(r, 1000));
           if (isCancelled) return;
           const search = doc.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
           if (search) {
             setCursorPos({ x: 400, y: 200 });
             await typeText(search, "Freight Value Analysis", 30);
             await new Promise(r => setTimeout(r, 600));
             if (isCancelled) return;
             await clickTextBtn("New Entity", 800, 150);
           }
        }
        
        if (currentStep.id === "lineage") await clickTextBtn("Filter Layer", 850, 150);
        if (currentStep.id === "dashboards") await clickTextBtn("View Report", 800, 400);

        if (currentStep.id === "collaborate") {
           await new Promise(r => setTimeout(r, 1500));
           if (isCancelled) return;
           const chat = doc.querySelector('input[placeholder*="Message"]') as HTMLInputElement;
           if (chat) {
             setCursorPos({ x: 400, y: 700 });
             await typeText(chat, "Could someone review the new Brazilian zip code clustering strategy?", 25);
           }
        }

        if (currentStep.id === "sdk") await clickTextBtn("Copy Snippet", 850, 250);
        if (currentStep.id === "reports") await clickTextBtn("Export", 850, 150);

        if (currentStep.id === "analytics") {
           await new Promise(r => setTimeout(r, 1500));
           if (isCancelled) return;
           setCursorPos({ x: 400, y: 500 });
           
           const input = doc.querySelector("input[placeholder*='Ask'], textarea") as HTMLInputElement;
           if (input) {
             await typeText(input, "Generate a breakdown of top Olist product categories in Brazil by revenue", 30);
             await new Promise(r => setTimeout(r, 600));
             if (isCancelled) return;
             const run = Array.from(doc.querySelectorAll("button")).find(b => b.textContent?.includes("Run") || b.textContent?.includes("Ask") || b.textContent?.includes("Generate"));
             if (run) run.click();
           }
        }

        if (currentStep.id === "performance") await clickTextBtn("Refresh", 820, 150);
        if (currentStep.id === "contracts") await clickTextBtn("New Contract", 850, 150);
        if (currentStep.id === "approvals") await clickTextBtn("Approve", 400, 400);
        if (currentStep.id === "commits") await clickTextBtn("Revert", 800, 400);
        if (currentStep.id === "syncs") await clickTextBtn("Get Started", 850, 150);
        if (currentStep.id === "cost") await clickTextBtn("Pipelines", 750, 300);
        if (currentStep.id === "security") await clickTextBtn("Export JSON", 850, 150);
        if (currentStep.id === "workspaces") await clickTextBtn("New Workspace", 850, 150);
        
      } catch (e) {
        console.warn("Synthetic interaction skipped cleanly.", e);
      }
    };

    // Ensure the iframe has actually loaded before trying to manipulate DOM
    const tEngine = setTimeout(() => {
      executeInteraction();
    }, 500);
    timeoutsRef.current.push(tEngine);

    return () => {
      isCancelled = true;
    };

  }, [stepIdx, isOpen, onClose]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[stepIdx];

  return (
    <div className="demo-modal-overlay tour-overlay">
      <div className="demo-modal-content tour-content">
        <iframe
          ref={iframeRef}
          src={`http://localhost:3000${currentStep?.route || "/home"}`}
          className="tour-iframe"
          sandbox="allow-same-origin allow-scripts"
        />

        {/* Fake Cursor Simulation */}
        <div
          className={`tour-cursor ${isClicking ? "tour-clicking" : ""}`}
          style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 3.5L18.5 10.5L11.5 12.5L9.5 19.5L4.5 3.5Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="tour-helper-text">
          <div className="text-[12px] opacity-70 mb-1 text-center font-bold tracking-widest text-indigo-400">
            STEP {stepIdx + 1} OF 24
          </div>
          {helperText}
        </div>

        {/* Video Player Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#0a0c10]/80 backdrop-blur-xl border border-[var(--b2)] rounded-full px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-[100] text-zinc-200">
           <button 
             onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
             disabled={stepIdx === 0}
             className="p-1.5 hover:bg-white/10 hover:text-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
             title="Previous Step"
           >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
           </button>
           
           <div className="text-[13px] font-mono text-white/90 font-medium tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
             {String(stepIdx + 1).padStart(2, '0')} / {TOUR_STEPS.length}
           </div>
           
           <button 
             onClick={() => setStepIdx(Math.min(TOUR_STEPS.length - 1, stepIdx + 1))}
             disabled={stepIdx === TOUR_STEPS.length - 1}
             className="p-1.5 hover:bg-white/10 hover:text-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
             title="Next Step"
           >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
           </button>
           
           <div className="w-[1px] h-5 bg-[var(--b2)] mx-1"></div>
           
           <button 
             onClick={onClose}
             className="p-1.5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-full transition-all"
             title="Close Demo"
           >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
        </div>

        <audio
          ref={audioRef}
          onEnded={() => setStepIdx((prev) => prev + 1)}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
