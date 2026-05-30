'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Search, Tag, MapPin, Phone, Mail, ShieldCheck, Check, Trash, Upload, Users, FolderPlus, HelpCircle } from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: any;
  tags: string[];
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  members: Recipient[];
  createdAt: string;
}

export default function AddressBookPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Redirect if unauthenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/address-book');
    }
  }, [sessionStatus, router]);

  // States
  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'GROUPS'>('CONTACTS');
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields (Single Contact)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [tagInput, setTagInput] = useState('Client');

  // Form Fields (Group Creation)
  const [groupName, setGroupName] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);

  // CSV Bulk Import State
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvError, setCsvError] = useState('');

  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/recipients');
      const data = await res.json();
      if (res.ok && data.recipients) {
        setRecipients(data.recipients);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (res.ok && data.groups) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchRecipients(), fetchGroups()]);
    setLoading(false);
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      loadData();
    }
  }, [sessionStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact from your address book?')) return;
    try {
      const res = await fetch('/api/recipients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchRecipients();
        fetchGroups(); // Refresh group member counts
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to dissolve this recipient group?')) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId }),
      });
      if (res.ok) {
        fetchGroups();
      }
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || null,
          phone: phone || null,
          address: street ? { street, city, state, postalCode, country } : null,
          tags: [tagInput],
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSuccessMsg('Recipient securely logged.');
        // Clear fields
        setName('');
        setEmail('');
        setPhone('');
        setStreet('');
        setCity('');
        setState('');
        setPostalCode('');
        
        // Refresh contacts
        fetchRecipients();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Fulfillment error');
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMsg('A system error occurred. Please try again.');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          recipientIds: selectedRecipientIds
        })
      });
      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setGroupName('');
        setSelectedRecipientIds([]);
        setShowGroupForm(false);
        fetchGroups();
      }
    } catch (err) {
      setSubmitting(false);
      console.error(err);
    }
  };

  const toggleSelectRecipient = (id: string) => {
    if (selectedRecipientIds.includes(id)) {
      setSelectedRecipientIds(selectedRecipientIds.filter((item) => item !== id));
    } else {
      setSelectedRecipientIds([...selectedRecipientIds, id]);
    }
  };

  // CSV Parser
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError('');
    setCsvPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
        if (lines.length < 2) {
          setCsvError('CSV requires a header line and at least one recipient row.');
          return;
        }

        // Header mapping
        const headers = lines[0].split(',').map((h) => h.trim().replace(/['"]/g, ''));
        const nameIdx = headers.findIndex((h) => h.toLowerCase().includes('name'));
        const emailIdx = headers.findIndex((h) => h.toLowerCase().includes('email'));
        const phoneIdx = headers.findIndex((h) => h.toLowerCase().includes('phone'));
        const streetIdx = headers.findIndex((h) => h.toLowerCase().includes('street') || h.toLowerCase().includes('address'));
        const cityIdx = headers.findIndex((h) => h.toLowerCase().includes('city'));
        const stateIdx = headers.findIndex((h) => h.toLowerCase().includes('state'));
        const zipIdx = headers.findIndex((h) => h.toLowerCase().includes('zip') || h.toLowerCase().includes('postal'));
        const countryIdx = headers.findIndex((h) => h.toLowerCase().includes('country'));
        const tagsIdx = headers.findIndex((h) => h.toLowerCase().includes('tag'));

        if (nameIdx === -1) {
          setCsvError('CSV requires a column containing "Name" values.');
          return;
        }

        const previewRows: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
          if (cols.length < headers.length) continue;

          previewRows.push({
            name: cols[nameIdx],
            email: emailIdx !== -1 ? cols[emailIdx] : null,
            phone: phoneIdx !== -1 ? cols[phoneIdx] : null,
            address: streetIdx !== -1 && cols[streetIdx] ? {
              street: cols[streetIdx],
              city: cityIdx !== -1 ? cols[cityIdx] : 'Beverly Hills',
              state: stateIdx !== -1 ? cols[stateIdx] : 'CA',
              postalCode: zipIdx !== -1 ? cols[zipIdx] : '90210',
              country: countryIdx !== -1 ? cols[countryIdx] : 'United States',
            } : null,
            tags: tagsIdx !== -1 && cols[tagsIdx] ? [cols[tagsIdx]] : ['Client']
          });
        }

        setCsvPreview(previewRows);
      } catch (err) {
        setCsvError('Parsing exception during file ingestion.');
      }
    };
    reader.readAsText(file);
  };

  const commitCsvImport = async () => {
    if (csvPreview.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(csvPreview)
      });
      if (res.ok) {
        setSuccessMsg(`Successfully imported ${csvPreview.length} recipients bulk.`);
        setCsvPreview([]);
        fetchRecipients();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter contacts by search query
  const filteredRecipients = recipients.filter((rec) => {
    const term = searchQuery.toLowerCase();
    return (
      rec.name.toLowerCase().includes(term) ||
      (rec.email && rec.email.toLowerCase().includes(term)) ||
      rec.tags.some(t => t.toLowerCase().includes(term))
    );
  });

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] space-y-4">
        <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-ping"></span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">
          Loading Directory Nodes...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        
        {/* Dynamic CSV Import Overlay preview */}
        {csvPreview.length > 0 && (
          <div className="fixed inset-0 z-50 bg-[#1F2B1A]/30 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[#FAF6EE] border border-[#8F9C86]/20 p-8 max-w-2xl w-full relative shadow-2xl rounded-[2.5rem] space-y-6 flex flex-col max-h-[80vh]">
              <div>
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-1">
                  SYS.08 // BULK INGESTION STAGING
                </span>
                <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A] leading-none">
                  Review <span className="italic font-light lowercase text-[#D27D5B]">import</span>
                </h3>
              </div>

              {/* Data Rows Preview table */}
              <div className="flex-grow overflow-y-auto border border-[#8F9C86]/15 rounded-2xl bg-[#F5F1E6]/30 divide-y divide-[#8F9C86]/10 pr-2">
                {csvPreview.map((row, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-[#1F2B1A] block">{row.name}</span>
                      <span className="text-[10px] text-[#1F2B1A]/60 block mt-0.5">// {row.email || 'No email'}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-[#D27D5B]/10 text-[#D27D5B] text-[8px] uppercase font-bold tracking-widest rounded-full border border-[#D27D5B]/20">
                      {row.tags[0]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCsvPreview([])}
                  className="flex-1 py-3.5 border border-[#1F2B1A]/20 text-[#1F2B1A] text-xs uppercase font-bold rounded-full hover:bg-[#F5F1E6] cursor-pointer"
                >
                  Cancel Import
                </button>
                <button
                  onClick={commitCsvImport}
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-[#D27D5B] text-[#FAF6EE] text-xs uppercase font-bold rounded-full hover:bg-[#1F2B1A] shadow-md cursor-pointer"
                >
                  {submitting ? 'Syncing...' : `Commit ${csvPreview.length} Recipients`}
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#8F9C86]/15 pb-8 gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/60 hover:text-[#D27D5B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" /> Back to Client Portal
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block">
              SYS.04 // WORKSPACE DIRECTORY
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Address <span className="italic font-light lowercase text-[#D27D5B]">book</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Manage saved employee profiles, create customized deployment groups, or bulk load directory templates.
            </p>
          </div>
        </header>

        {/* View Selection Tabs */}
        <div className="flex gap-4 border-b border-[#8F9C86]/10 pb-4 mb-12 text-xs uppercase tracking-[0.25em] font-bold">
          <button
            onClick={() => setActiveTab('CONTACTS')}
            className={`pb-4 -mb-[17px] border-b-2 cursor-pointer transition-all ${
              activeTab === 'CONTACTS' ? 'text-[#1F2B1A] border-[#D27D5B]' : 'text-[#1F2B1A]/40 border-transparent hover:text-[#1F2B1A]'
            }`}
          >
            Individual Directory
          </button>
          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`pb-4 -mb-[17px] border-b-2 cursor-pointer transition-all ${
              activeTab === 'GROUPS' ? 'text-[#1F2B1A] border-[#D27D5B]' : 'text-[#1F2B1A]/40 border-transparent hover:text-[#1F2B1A]'
            }`}
          >
            Campaign Groups ({groups.length})
          </button>
        </div>

        {activeTab === 'CONTACTS' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Panel: Register New Contact & CSV Loader */}
            <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 lg:p-10 rounded-[2rem] space-y-8 lg:sticky lg:top-28 shadow-sm">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">
                  STATION 01 // DIRECTORY ENTRY
                </span>
                <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">
                  Log <span className="italic font-light lowercase text-[#D27D5B]">designee</span>
                </h3>
              </div>

              {successMsg && (
                <div className="border border-[#8F9C86]/30 bg-[#8F9C86]/10 px-6 py-4 text-xs uppercase tracking-widest text-[#1F2B1A] font-bold flex items-center gap-2 rounded-xl animate-bloom">
                  <Check className="w-4 h-4 stroke-[2.5] text-[#D27D5B]" /> {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="border border-[#D27D5B]/30 bg-[#D27D5B]/10 px-6 py-4 text-xs uppercase tracking-widest text-[#D27D5B] font-bold rounded-xl">
                  🌿 {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                    <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="ALEX MORGAN"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                    <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="ALEX@COMPANY.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                    <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="+1 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                    <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Cohort Tag</label>
                    <select
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    >
                      <option value="Client" className="bg-[#FAF6EE] text-[#1F2B1A]">Client</option>
                      <option value="Employee" className="bg-[#FAF6EE] text-[#1F2B1A]">Employee</option>
                      <option value="Executive" className="bg-[#FAF6EE] text-[#1F2B1A]">Executive</option>
                      <option value="VIP" className="bg-[#FAF6EE] text-[#1F2B1A]">VIP Partner</option>
                    </select>
                  </div>
                </div>

                {/* Optional Physical address logs */}
                <div className="space-y-4 pt-4 border-t border-[#8F9C86]/15">
                  <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/50 font-sans font-bold">
                    Physical Coordinates (Optional &bull; Can collect later)
                  </span>

                  <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                    <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Street Address</label>
                    <input
                      type="text"
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="123 SEEDLING WAY, SUITE 4"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                      <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">City</label>
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="BEVERLY HILLS"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                      <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">State</label>
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="CA"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                      <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Postal Code</label>
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="90210"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                    <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                      <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Country</label>
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="UNITED STATES"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4.5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-500 disabled:opacity-50 border border-[#8F9C86]/10 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#FAF6EE]" /> {submitting ? 'LOGGING DESIGNEE...' : 'COMMIT TO DIRECTORY'}
                </button>
              </form>

              {/* CSV Bulk uploader section */}
              <div className="border-t border-[#8F9C86]/15 pt-6 space-y-4">
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">
                  STATION 02 // CSV MASS LOADER
                </span>
                
                {csvError && (
                  <div className="text-[10px] text-[#D27D5B] font-bold">// ERROR: {csvError}</div>
                )}

                <label className="relative border border-dashed border-[#8F9C86]/40 rounded-2xl bg-[#FAF6EE]/50 hover:bg-[#FAF9F5] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group text-center shadow-sm">
                  <Upload className="w-6 h-6 text-[#1F2B1A]/40 mb-2 group-hover:text-[#D27D5B] transition-colors" />
                  <span className="text-xs font-bold text-[#1F2B1A]">Upload Recipient CSV</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono mt-1 block">Requires column: "Name"</span>
                  <input
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleCsvUpload}
                  />
                </label>
              </div>

            </div>
 
            {/* Right Panel: Address List View */}
            <div className="lg:col-span-7 border border-[#8F9C86]/15 bg-[#F5F1E6]/20 rounded-[2rem] shadow-sm overflow-hidden flex flex-col justify-between">
              {/* Search filter bar */}
              <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F5F1E6]/30">
                <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none flex-shrink-0">
                  Directory Registry
                </h3>
                
                <div className="relative w-full md:max-w-xs flex items-center border border-[#8F9C86]/25 px-4 py-2 bg-[#FAF9F5]/80 rounded-full shadow-inner focus-within:border-[#D27D5B]/60 transition-colors">
                  <Search className="w-4 h-4 text-[#1F2B1A]/40 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/30"
                    placeholder="SEARCH DIRECTORY..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* List Render */}
              {recipients.length === 0 ? (
                <div className="py-24 text-center px-6">
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic mb-2">
                    No directory records established.
                  </p>
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/30 max-w-xs mx-auto leading-relaxed">
                    Utilize the registration console on the left to populate your corporate workspace cohort.
                  </p>
                </div>
              ) : filteredRecipients.length === 0 ? (
                <div className="py-24 text-center px-6">
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic">
                    No matches for &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#8F9C86]/15">
                  {filteredRecipients.map((rec) => {
                    const hasAddress = rec.address && (rec.address as any).street;
                    const addressObj = rec.address as any;
                    const formattedAddress = hasAddress
                      ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.postalCode}`
                      : null;

                    return (
                      <div key={rec.id} className="p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3.5 flex-grow">
                          <div className="flex items-center gap-3">
                            <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">{rec.name}</span>
                            {rec.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="px-3 py-1.5 border border-[#D27D5B]/20 text-[8px] uppercase tracking-[0.2em] font-bold text-[#D27D5B] bg-[#D27D5B]/5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/50">
                            <div className="space-y-2">
                              {rec.email && (
                                <span className="flex items-center gap-2 text-[#1F2B1A]/70">
                                  <Mail className="w-3.5 h-3.5 stroke-[1.8] text-[#1F2B1A]/30" /> {rec.email}
                                </span>
                              )}
                              {rec.phone && (
                                <span className="flex items-center gap-2 text-[#1F2B1A]/70">
                                  <Phone className="w-3.5 h-3.5 stroke-[1.8] text-[#1F2B1A]/30" /> {rec.phone}
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              {formattedAddress ? (
                                <span className="flex items-start gap-2 text-[#1F2B1A]/70 leading-normal">
                                  <MapPin className="w-3.5 h-3.5 stroke-[1.8] text-[#D27D5B]/60 flex-shrink-0" />
                                  <span className="truncate max-w-xs">{formattedAddress}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase tracking-widest text-[#D27D5B] italic font-semibold">
                                  [ Address parameters missing ]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Trash Delete Contact Button */}
                        <button 
                          onClick={() => handleDelete(rec.id)}
                          className="text-[#D27D5B] hover:text-[#1F2B1A] p-2.5 transition-colors flex-shrink-0 cursor-pointer"
                          title="Delete Contact"
                        >
                          <Trash className="w-5 h-5 stroke-[1.8]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Recipient Groups Tab Section */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Panel: Create Group */}
            <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 lg:p-10 rounded-[2rem] space-y-8 lg:sticky lg:top-28 shadow-sm">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">
                  STATION 03 // GROUP FORMATION
                </span>
                <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">
                  New <span className="italic font-light lowercase text-[#D27D5B]">cohort</span>
                </h3>
              </div>

              {!showGroupForm ? (
                <button
                  onClick={() => setShowGroupForm(true)}
                  className="w-full py-4.5 bg-[#D27D5B] hover:bg-[#1F2B1A] text-[#FAF6EE] text-xs uppercase tracking-[0.25em] font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border-0 outline-none"
                >
                  <FolderPlus className="w-4 h-4" /> Create Named Group
                </button>
              ) : (
                <form onSubmit={handleCreateGroup} className="space-y-6 animate-fade-in">
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">Group Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="E.G., ENGINEERING TEAM"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>

                  {/* Checkbox selector of contacts to include in group */}
                  <div className="space-y-3">
                    <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/50 font-sans font-bold">
                      Select Cohort Members ({selectedRecipientIds.length})
                    </span>
                    
                    {recipients.length === 0 ? (
                      <div className="text-xs text-[#1F2B1A]/40 font-bold italic">// No contacts available.</div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-[#8F9C86]/15 rounded-xl p-3 space-y-2 bg-[#FAF6EE]/50 shadow-inner">
                        {recipients.map((rec) => (
                          <label key={rec.id} className="flex items-center gap-3 cursor-pointer text-xs uppercase tracking-wider text-[#1F2B1A]/70 select-none">
                            <input
                              type="checkbox"
                              className="accent-[#D27D5B] w-4 h-4"
                              checked={selectedRecipientIds.includes(rec.id)}
                              onChange={() => toggleSelectRecipient(rec.id)}
                            />
                            <span>{rec.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowGroupForm(false)}
                      className="flex-1 py-3 border border-[#8F9C86]/30 text-[#1F2B1A] text-xs uppercase font-bold rounded-full hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !groupName}
                      className="flex-1 py-3 bg-[#1F2B1A] text-[#FAF6EE] text-xs uppercase font-bold rounded-full hover:bg-[#D27D5B] shadow-md cursor-pointer border-0"
                    >
                      Create Group
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Panel: Groups List View */}
            <div className="lg:col-span-7 border border-[#8F9C86]/15 bg-[#F5F1E6]/20 rounded-[2rem] shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
                <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">
                  Campaign Cohorts
                </h3>
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40">// ACTIVE_GROUPS</span>
              </div>

              {groups.length === 0 ? (
                <div className="py-24 text-center px-6">
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic mb-2">
                    No active campaign groups logged.
                  </p>
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/30 max-w-xs mx-auto leading-relaxed">
                    Establish a named group using the console on the left to trigger bulk gifting templates in one click.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#8F9C86]/15">
                  {groups.map((grp) => (
                    <div key={grp.id} className="p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-300 flex items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h4 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">{grp.name}</h4>
                        <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#D27D5B]">
                          🍃 Includes {grp.members.length} Designee(s)
                        </span>
                        
                        {/* Inline preview of member names */}
                        {grp.members.length > 0 && (
                          <div className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold max-w-md pt-1">
                            Members: {grp.members.map(m => m.name).join(', ')}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteGroup(grp.id)}
                        className="text-[#D27D5B] hover:text-[#1F2B1A] p-2.5 transition-colors flex-shrink-0 cursor-pointer"
                        title="Dissolve Group"
                      >
                        <Trash className="w-5 h-5 stroke-[1.8]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
