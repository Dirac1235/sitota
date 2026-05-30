'use client';

import { useState } from 'react';
import { Copy, Check, Send } from 'lucide-react';

export default function CopyLinkButton({ recipientId }: { recipientId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const secureUrl = `${window.location.origin}/recipients/collect-address/${recipientId}`;
      await navigator.clipboard.writeText(secureUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy secure link:', err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-[#F5F1E6]/40 border border-[#8F9C86]/15 rounded-[1.5rem] p-5 w-full shadow-sm">
      <div className="flex-grow space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/50 block font-sans">Designee Access Gateway</span>
        <span className="text-xs uppercase tracking-widest font-mono text-[#1F2B1A] block truncate max-w-md">
          {copied ? 'Gateway URL Loaded' : 'SECURE_GATEWAY_NODE://collect_address'}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="w-full sm:w-auto px-6 py-3.5 bg-[#1F2B1A] hover:bg-[#D27D5B] text-[#FAF6EE] text-[10px] tracking-[0.2em] uppercase font-bold rounded-full flex items-center justify-center gap-2 transition-colors duration-300 border border-transparent hover:shadow-md cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 stroke-[2.5]" /> Copied Gateway
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 stroke-[1.5]" /> Copy Secure Link
          </>
        )}
      </button>
    </div>
  );
}
