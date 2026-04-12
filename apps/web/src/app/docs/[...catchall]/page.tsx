import React from "react";
import { Construction } from "lucide-react";

export default async function PlaceholderDocPage({ params }: { params: Promise<{ catchall: string[] }> }) {
  // Try to cleanly display the requested path
  const resolvedParams = await params;
  const requestedPath = resolvedParams.catchall.join("/");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center text-[#e2e8f0]">
      <div className="bg-[#1e293b] p-6 rounded-full border border-[#3b82f6]/30 mb-8">
         <Construction size={48} className="text-[#3b82f6]" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Documentation Under Construction</h1>
      <p className="text-[#94a3b8] max-w-lg mb-8 leading-relaxed">
        You are trying to view the simulated page <strong>/docs/{requestedPath}</strong>.
        <br/><br/>
        This page forms part of the simulated 50+ page architecture template. While the left sidebar demonstrates the full scope of a massive enterprise documentation site, this specific page is a structural placeholder.
      </p>
      
      <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-6 max-w-xl text-left shadow-lg">
         <h3 className="text-white font-semibold mb-3">Check out the fully implemented deep-dives:</h3>
         <ul className="list-disc pl-5 space-y-2 text-[#3b82f6]">
            <li><a href="/docs/services/pipelines" className="hover:underline">Pipelines Engine</a></li>
            <li><a href="/docs/services/catalog" className="hover:underline">Active Governance Catalog</a></li>
            <li><a href="/docs/services/observability" className="hover:underline">Data Observability</a></li>
            <li><a href="/docs/tutorials/ecommerce" className="hover:underline">Real-Time E-Commerce Tutorial</a></li>
         </ul>
      </div>
    </div>
  );
}
