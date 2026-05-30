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
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#FAF9F5]/40 border border-[#0A0A0A]/10 p-4 w-full">
      <div className="flex-grow space-y-1">
        <span className="text-[7px] uppercase tracking-widest text-[#0A0A0A]/40 block font-sans">Designee Access Gateway</span>
        <span className="text-[9px] uppercase tracking-widest font-mono text-[#0A0A0A] block truncate max-w-md">
          {copied ? 'Gateway URL Loaded' : 'SECURE_GATEWAY_NODE://collect_address'}
        </span>
      </div>
      <button
        onClick={handleCopy}
        className="w-full sm:w-auto px-6 py-3 bg-[#0A0A0A] hover:bg-[#9C3D2E] text-[#EAE8E0] text-[8px] tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 transition-colors duration-300 border border-[#0A0A0A]"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 stroke-[2]" /> Copied Gateway
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 stroke-[1.5]" /> Copy Secure Link
          </>
        )}
      </button>
    </div>
  );
}
