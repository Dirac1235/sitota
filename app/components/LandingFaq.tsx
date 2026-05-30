'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How does the AI brand rendering studio work?",
    answer: "Once inside the Workspace Portal, you can upload your organization's custom vector logo or brand assets. Our real-time visualization engine instantly wraps, debosses, or laser-engraves your design across our curated catalog, presenting a soft, photorealistic preview from multiple angles."
  },
  {
    question: "Is there a minimum order quantity (MOQ)?",
    answer: "We believe in absolute flexibility. You can order a single, deeply personal token for an individual client, or gently scale up to thousands of gift bundles for a global corporate campaign. There are no minimum constraints on our catalog."
  },
  {
    question: "How does the Address Collection service function?",
    answer: "If you don't have your recipients' physical addresses, simply upload their email addresses. Sitota will send a elegant, customizable coordinate collection link, allowing each recipient to privately and securely submit their preferred shipping details."
  },
  {
    question: "Where do you source your products?",
    answer: "We carefully partner with sustainable organic cotton weavers, artisanal family distillers, ethical wood craftsmen, and single-origin micro-lot coffee roasters. Every item in our catalog is chosen for its organic materials, warm textures, and ethical heritage."
  },
  {
    question: "Do you support global carbon-offset shipping?",
    answer: "Yes, we ship globally with customs clearances fully pre-arranged. Every shipment is carbon-offset, and we offer standard, expedited, or custom scheduled deliveries so your gifts arrive exactly when the timing is perfect."
  }
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="border border-[#8F9C86]/15 rounded-[1.8rem] bg-[#F5F1E6]/20 overflow-hidden transition-all duration-500 hover:border-[#D27D5B]/30"
          >
            <button
              onClick={() => toggleIndex(index)}
              className="w-full text-left p-6 lg:p-8 flex justify-between items-center gap-6 focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <HelpCircle className="w-5 h-5 text-[#D27D5B]/70 group-hover:text-[#D27D5B] transition-colors flex-shrink-0" />
                <span className="font-serif text-lg lg:text-xl text-[#1F2B1A] group-hover:text-[#D27D5B] transition-colors duration-300">
                  {item.question}
                </span>
              </div>
              <div className={`w-8 h-8 rounded-full bg-[#F5F1E6]/80 flex items-center justify-center transition-all duration-500 group-hover:bg-[#D27D5B]/10 ${isOpen ? 'bg-[#D27D5B] text-[#FAF6EE] rotate-180' : 'text-[#1F2B1A]'}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-[300px] border-t border-[#8F9C86]/10 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 lg:p-8 bg-[#FAF6EE]/40 text-xs md:text-sm uppercase tracking-[0.12em] leading-[2.2] text-[#1F2B1A]/80 font-sans">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}