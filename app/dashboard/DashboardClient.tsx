'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  Package, 
  Users, 
  DollarSign, 
  Clock, 
  Plus, 
  FolderHeart, 
  Calendar, 
  Tag, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  X, 
  ChevronRight, 
  Search, 
  Copy, 
  Award,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Trash,
  Upload,
  FolderPlus,
  ArrowLeft,
  Building2,
  Palette,
  Briefcase
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  images: any;
}

interface Design {
  id: string;
  productId: string | null;
  product: Product | null;
  bundleId?: string | null;
  bundle?: { name: string; price: number } | null;
  previewImageUrl: string | null;
  status: string;
  intentPrompt: string | null;
  createdAt: string;
}

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

interface Order {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  orderRecipients: { id: string }[];
  design: {
    product?: {
      name: string;
    };
  };
}

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  // Tab State: REGISTRY (Campaign Logs), VAULT (Design Vault), DIRECTORY (Address Book), SETTINGS (Workspace Settings)
  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'VAULT' | 'DIRECTORY' | 'SETTINGS'>('REGISTRY');

  // Unified Loading & Data States
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
  // Organization States (Pure Transactional - No Subscription Plans)
  const [orgName, setOrgName] = useState('');
  const [brandColor, setBrandColor] = useState('#9C3D2E');
  const [logoUrl, setLogoUrl] = useState('');
  const [role, setRole] = useState('STANDARD_USER');
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);
  const [orgError, setOrgError] = useState('');

  // Modals & Searches
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');

  // Directory / Contact Form Fields
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cStreet, setCStreet] = useState('');
  const [cCity, setCCity] = useState('');
  const [cState, setCState] = useState('');
  const [cZip, setCZip] = useState('');
  const [cCountry, setCCountry] = useState('United States');
  const [cTag, setCTag] = useState('Client');

  // Directory Group Form Fields
  const [groupName, setGroupName] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [activeDirectorySubtab, setActiveDirectorySubtab] = useState<'CONTACTS' | 'GROUPS'>('CONTACTS');

  // CSV Mass Loader State
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvError, setCsvError] = useState('');

  // Handle Initial Tab Query Parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'vault') setActiveTab('VAULT');
    else if (tabParam === 'directory') setActiveTab('DIRECTORY');
    else if (tabParam === 'settings') setActiveTab('SETTINGS');
    else setActiveTab('REGISTRY');
  }, [searchParams]);

  // Fetch all dashboard data from unified API routes
  const fetchDashboardData = async () => {
    try {
      const [ordersRes, designsRes, productsRes, recipientsRes, groupsRes, orgRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/generate-preview'),
        fetch('/api/products'),
        fetch('/api/recipients'),
        fetch('/api/groups'),
        fetch('/api/organization')
      ]);

      const ordersData = await ordersRes.json();
      const designsData = await designsRes.json();
      const productsData = await productsRes.json();
      const recipientsData = await recipientsRes.json();
      const groupsData = await groupsRes.json();
      const orgData = await orgRes.json();

      if (ordersRes.ok && ordersData.orders) setOrders(ordersData.orders);
      if (designsRes.ok && designsData.designs) setDesigns(designsData.designs);
      if (productsRes.ok && productsData.products) setProducts(productsData.products);
      if (recipientsRes.ok && recipientsData.recipients) setRecipients(recipientsData.recipients);
      if (groupsRes.ok && groupsData.groups) setGroups(groupsData.groups);
      
      if (orgRes.ok && orgData.organization) {
        setOrgName(orgData.organization.name);
        setBrandColor(orgData.organization.brandColor || '#D27D5B');
        setLogoUrl(orgData.organization.logoUrl || '');
        setRole(orgData.role || 'STANDARD_USER');
      }
    } catch (err) {
      console.error('Error fetching dashboard coordinates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchDashboardData();
    }
  }, [sessionStatus]);

  // Actions: Design Vault Tab
  const handleDuplicateDesign = async (designId: string, productId: string) => {
    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duplicateId: designId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/catalog/${productId}?designId=${data.designId}&from=vault`);
      }
    } catch (err) {
      console.error('Error duplicating design:', err);
    }
  };

  const handleToggleTemplateStatus = async (designId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'APPROVED' ? 'DRAFT' : 'APPROVED';
      const res = await fetch('/api/generate-preview', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: designId, status: newStatus })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error toggling template:', err);
    }
  };

  // Actions: Directory Tab
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContact(true);
    setContactError('');
    setContactSuccess('');

    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cName,
          email: cEmail || null,
          phone: cPhone || null,
          address: cStreet ? { street: cStreet, city: cCity, state: cState, postalCode: cZip, country: cCountry } : null,
          tags: [cTag],
        }),
      });

      const data = await res.json();
      setSubmittingContact(false);

      if (res.ok && data.success) {
        setContactSuccess('Recipient logged to directory.');
        setCName('');
        setCEmail('');
        setCPhone('');
        setCStreet('');
        setCCity('');
        setCState('');
        setCZip('');
        fetchDashboardData();
        setTimeout(() => setContactSuccess(''), 3000);
      } else {
        setContactError(data.error || 'Failed to register recipient');
      }
    } catch (err) {
      setSubmittingContact(false);
      setContactError('A network error occurred. Please retry.');
    }
  };

  const handleContactDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact from your address book?')) return;
    try {
      const res = await fetch('/api/recipients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return;
    setSubmittingContact(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          recipientIds: selectedRecipientIds
        })
      });
      if (res.ok) {
        setGroupName('');
        setSelectedRecipientIds([]);
        setShowGroupForm(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleGroupDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to dissolve this campaign cohort group?')) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: groupId }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
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

  // Actions: CSV Loader
  const handleCsvLoader = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setCsvError('CSV requires a header line and at least one row.');
          return;
        }

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
        setCsvError('Parsing exception during CSV file ingestion.');
      }
    };
    reader.readAsText(file);
  };

  const commitCsvBulkImport = async () => {
    if (csvPreview.length === 0) return;
    setSubmittingContact(true);
    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(csvPreview)
      });
      if (res.ok) {
        setContactSuccess(`Successfully imported ${csvPreview.length} recipients bulk.`);
        setCsvPreview([]);
        fetchDashboardData();
        setTimeout(() => setContactSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingContact(false);
    }
  };

  // Actions: Workspace Settings Tab
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    setOrgSuccess(false);
    setOrgError('');

    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, brandColor, logoUrl }),
      });

      const data = await res.json();
      setSavingOrg(false);

      if (res.ok && data.success) {
        setOrgSuccess(true);
        fetchDashboardData();
        setTimeout(() => setOrgSuccess(false), 3000);
      } else {
        setOrgError(data.error || 'Failed to update workspace details.');
      }
    } catch (err) {
      setSavingOrg(false);
      setOrgError('A network exception occurred.');
    }
  };

  // Searches & Filtering
  const filteredProducts = products.filter((prod) => {
    const term = productSearch.toLowerCase();
    return (
      prod.name.toLowerCase().includes(term) ||
      prod.category.toLowerCase().includes(term) ||
      prod.sku.toLowerCase().includes(term)
    );
  });

  const filteredRecipients = recipients.filter((rec) => {
    const term = directorySearch.toLowerCase();
    return (
      rec.name.toLowerCase().includes(term) ||
      (rec.email && rec.email.toLowerCase().includes(term)) ||
      rec.tags.some(t => t.toLowerCase().includes(term))
    );
  });

  // Registry / Order Stats
  const totalCampaigns = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingCampaigns = orders.filter(o => o.status === 'PROCESSING' || o.status === 'AWAITING_ADDRESS').length;
  const deliveredCampaigns = orders.filter(o => o.status === 'DELIVERED').length;

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6EE] space-y-4">
        <span className="w-2.5 h-2.5 bg-[#D27D5B] rounded-full animate-ping"></span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#1F2B1A] animate-pulse">
          Initializing Dynamic Client Portal...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen pt-12 pb-24 relative animate-bloom">
      <div className="w-full h-px bg-[#8F9C86]/15 absolute top-0"></div>

      {/* Initialize Design Modal (Design Vault Tab) */}
      {showDesignModal && (
        <div className="fixed inset-0 z-50 bg-[#1F2B1A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#FAF6EE] border border-[#8F9C86]/20 p-8 max-w-2xl w-full relative shadow-2xl rounded-[2.5rem] space-y-6 flex flex-col max-h-[85vh] animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-[#8F9C86]/15">
              <div>
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-1">
                  STATION 02 // CHOOSE BASE ELEMENT
                </span>
                <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A] leading-none">
                  Select <span className="italic font-light lowercase text-[#D27D5B]">canvas</span>
                </h3>
              </div>
              <button 
                onClick={() => setShowDesignModal(false)}
                className="w-10 h-10 rounded-full border border-[#8F9C86]/15 flex items-center justify-center text-[#1F2B1A]/60 hover:bg-[#1F2B1A] hover:text-[#FAF6EE] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full flex items-center border border-[#8F9C86]/25 px-4 py-2.5 bg-[#F5F1E6]/40 rounded-full shadow-inner">
              <Search className="w-4 h-4 text-[#1F2B1A]/40 mr-2 flex-shrink-0" />
              <input
                type="text"
                className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/30"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 divide-y divide-[#8F9C86]/10">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#1F2B1A]/40 font-bold tracking-widest uppercase italic">
                  No matching base items found.
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const parsedImages = prod.images ? (prod.images as string[]) : [];
                  const imageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600';
                  
                  return (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setShowDesignModal(false);
                        router.push(`/catalog/${prod.id}?from=vault`);
                      }}
                      className="w-full pt-4 flex items-center gap-4 text-left group hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent p-0"
                    >
                      <div className="w-16 h-16 bg-[#F5F1E6] rounded-xl overflow-hidden flex-shrink-0 relative border border-[#8F9C86]/10">
                        <img src={imageUrl} alt={prod.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                      </div>
                      <div className="flex-grow min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[7px] uppercase tracking-widest text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-2 py-0.5 rounded-full">
                            {prod.category}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest font-mono text-[#1F2B1A]/40">
                            {prod.sku}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg text-[#1F2B1A] uppercase tracking-tight leading-none group-hover:text-[#D27D5B] transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold">
                          Base unit price: ${prod.basePrice.toFixed(2)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#1F2B1A]/30 group-hover:text-[#D27D5B] transition-colors stroke-[2] flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Ingestion staging preview modal (Address Book Tab) */}
      {csvPreview.length > 0 && (
        <div className="fixed inset-0 z-50 bg-[#1F2B1A]/30 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#FAF6EE] border border-[#8F9C86]/20 p-8 max-w-2xl w-full relative shadow-2xl rounded-[2.5rem] space-y-6 flex flex-col max-h-[80vh] animate-fade-in">
            <div>
              <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-1">
                SYS.08 // BULK INGESTION STAGING
              </span>
              <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A] leading-none">
                Review <span className="italic font-light lowercase text-[#D27D5B]">import</span>
              </h3>
            </div>

            <div className="flex-grow overflow-y-auto border border-[#8F9C86]/15 rounded-2xl bg-[#F5F1E6]/30 divide-y divide-[#8F9C86]/10 pr-2">
              {csvPreview.map((row, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#1F2B1A] block">{row.name}</span>
                    <span className="text-[10px] text-[#1F2B1A]/60 block mt-0.5">// {row.email || 'No email logged'}</span>
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
                className="flex-1 py-3.5 border border-[#1F2B1A]/20 text-[#1F2B1A] text-xs uppercase font-bold rounded-full hover:bg-[#F5F1E6]/50 transition-colors cursor-pointer"
              >
                Cancel Ingestion
              </button>
              <button
                onClick={commitCsvBulkImport}
                disabled={submittingContact}
                className="flex-1 py-3.5 bg-[#D27D5B] text-[#FAF6EE] text-xs uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors shadow-md cursor-pointer border-0"
              >
                {submittingContact ? 'Syncing...' : `Commit ${csvPreview.length} Recipients`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Workspace Header & Title (Consolidated Page Style) */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 reveal-text">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#8F9C86]/15 pb-8 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#D27D5B] block mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#D27D5B] rounded-full animate-pulse"></span>
              SYS.07 // CENTRALIZED CLIENT WORKSPACE
            </span>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1F2B1A] uppercase tracking-tight leading-none">
              Client <span className="italic font-light lowercase text-[#D27D5B]">portal</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/60 font-bold mt-2">
              Overview of your registered campaigns, custom asset renders, directory lists, and workspace settings.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Link href="/catalog" className="inline-flex items-center px-8 py-4 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-sm hover:shadow-md border-0">
              New Campaign
            </Link>
          </div>
        </header>

        {/* Workspace Dynamic Tabbing switcher (Tabs instead of separate Page redirects) */}
        <div className="flex flex-wrap gap-8 mb-12 text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 border-b border-[#8F9C86]/10 pb-4">
          <button 
            onClick={() => setActiveTab('REGISTRY')}
            className={`pb-4 cursor-pointer transition-all border-b-2 -mb-[18px] ${
              activeTab === 'REGISTRY' ? 'text-[#1F2B1A] border-[#1F2B1A]' : 'text-[#1F2B1A]/50 border-transparent hover:text-[#1F2B1A]'
            }`}
          >
            Campaign Registry
          </button>
          <button 
            onClick={() => setActiveTab('VAULT')}
            className={`pb-4 cursor-pointer transition-all border-b-2 -mb-[18px] ${
              activeTab === 'VAULT' ? 'text-[#1F2B1A] border-[#1F2B1A]' : 'text-[#1F2B1A]/50 border-transparent hover:text-[#1F2B1A]'
            }`}
          >
            Design Vault ({designs.length})
          </button>
          <button 
            onClick={() => setActiveTab('DIRECTORY')}
            className={`pb-4 cursor-pointer transition-all border-b-2 -mb-[18px] ${
              activeTab === 'DIRECTORY' ? 'text-[#1F2B1A] border-[#1F2B1A]' : 'text-[#1F2B1A]/50 border-transparent hover:text-[#1F2B1A]'
            }`}
          >
            Address Book ({recipients.length})
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`pb-4 cursor-pointer transition-all border-b-2 -mb-[18px] ${
              activeTab === 'SETTINGS' ? 'text-[#1F2B1A] border-[#1F2B1A]' : 'text-[#1F2B1A]/50 border-transparent hover:text-[#1F2B1A]'
            }`}
          >
            Workspace Settings
          </button>
        </div>

        {/* TAB VIEW 1: Campaign Registry */}
        {activeTab === 'REGISTRY' && (
          <div className="space-y-12 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF9F5] transition-all duration-500 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Total Campaigns</span>
                  <Package className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
                </div>
                <div className="mt-8">
                  <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{totalCampaigns}</span>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Active log registries</p>
                </div>
              </div>

              <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF9F5] transition-all duration-500 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Capital Allocated</span>
                  <DollarSign className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
                </div>
                <div className="mt-8">
                  <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">${totalSpent.toFixed(2)}</span>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Product sales summary</p>
                </div>
              </div>

              <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF9F5] transition-all duration-500 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">Delivered Gifts</span>
                  <Users className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
                </div>
                <div className="mt-8">
                  <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{deliveredCampaigns}</span>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Confirmed courier receipts</p>
                </div>
              </div>

              <div className="bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 border border-[#8F9C86]/15 rounded-[2rem] flex flex-col justify-between group hover:bg-[#FAF9F5] transition-all duration-500 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 block">In Production</span>
                  <Clock className="w-4 h-4 text-[#D27D5B] stroke-[1.5]" />
                </div>
                <div className="mt-8">
                  <span className="font-serif text-4xl lg:text-5xl text-[#1F2B1A] font-bold leading-none">{pendingCampaigns}</span>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/40 mt-2">Active transit parameters</p>
                </div>
              </div>
            </div>

            {/* Campaign List */}
            <div className="border border-[#8F9C86]/20 bg-[#F5F1E6]/10 backdrop-blur-[1px] rounded-[2rem] shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
                <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Campaign Execution Log</h3>
                <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40">// SYSTEM_RECORDS_ACTIVE</span>
              </div>
              
              {orders.length === 0 ? (
                <div className="py-24 text-center px-6">
                  <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/50 font-bold mb-8">No campaigns initiated yet.</p>
                  <Link href="/catalog" className="inline-flex justify-center items-center px-8 py-4.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-sm border-0">
                    Explore Curated Index
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#8F9C86]/15">
                  {orders.map((order) => {
                    const productName = order.design.product?.name || 'Custom Concept';
                    return (
                      <Link 
                        key={order.id} 
                        href={`/dashboard/orders/${order.id}`}
                        className="block p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-4">
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#D27D5B] font-mono">{order.id}</span>
                            <span className="text-[10px] uppercase tracking-[0.25em] font-bold px-3.5 py-1 bg-[#1F2B1A] text-[#FAF6EE] border border-[#8F9C86]/10 rounded-full">
                              {order.status}
                            </span>
                          </div>
                          <h4 className="font-serif text-2xl lg:text-3xl text-[#1F2B1A] uppercase tracking-tight leading-none group-hover:text-[#D27D5B] transition-colors duration-300">{productName}</h4>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-12 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/60">
                          <div>
                            <span className="block text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 mb-1">Recipients</span>
                            <span className="text-[#1F2B1A]">{order.orderRecipients.length} designee(s)</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 mb-1">Value Allocated</span>
                            <span className="font-serif text-base text-[#1F2B1A] font-bold mt-1 block">${order.totalAmount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 mb-1">Deployment Date</span>
                            <span className="text-[#1F2B1A] font-mono mt-1 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB VIEW 2: Design Vault */}
        {activeTab === 'VAULT' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center pb-6 border-b border-[#8F9C86]/15">
              <h2 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">Design <span className="italic font-light lowercase text-[#D27D5B]">vault</span></h2>
              <button 
                onClick={() => setShowDesignModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 shadow-sm border-0 cursor-pointer font-sans"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Initialize Design
              </button>
            </div>

            {designs.length === 0 ? (
              <div className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-16 rounded-[2rem] text-center space-y-8 shadow-sm">
                <div className="w-16 h-16 bg-[#8F9C86]/10 rounded-full flex items-center justify-center mx-auto border border-[#8F9C86]/20">
                  <FolderHeart className="w-6 h-6 text-[#1F2B1A]/40" />
                </div>
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">Vault is currently empty</h3>
                  <p className="text-xs md:text-sm font-sans text-[#1F2B1A]/60 uppercase tracking-widest leading-[2.2]">
                    You have not registered any visual rendering proofs yet. Select from our sustainable base catalog, configure your specifications with our AI engine, and save proofs here.
                  </p>
                </div>
                <button 
                  onClick={() => setShowDesignModal(true)}
                  className="inline-flex items-center gap-2 px-8 py-4.5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors duration-500 shadow-sm border-0 cursor-pointer font-sans"
                >
                  <Compass className="w-4 h-4" /> Browse Catalog Index
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {designs.map((design) => {
                  const productName = design.product?.name || design.bundle?.name || 'Custom Branded Asset';
                  const isBundle = !!design.bundleId;
                  const parsedImages = design.product?.images ? (design.product.images as string[]) : [];
                  const defaultImageUrl = isBundle 
                    ? 'https://images.unsplash.com/photo-1607344645866-eea33a4e2e27?q=80&w=1200&auto=format&fit=crop'
                    : (parsedImages[0] || 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600');
                  
                  const imageUrl = design.previewImageUrl || defaultImageUrl;
                  const isTemplate = design.status === 'APPROVED';

                  return (
                    <div 
                      key={design.id} 
                      className="border border-[#8F9C86]/15 bg-[#F5F1E6]/30 hover:bg-[#FAF9F5]/40 rounded-[2rem] flex flex-col justify-between group overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="aspect-square w-full bg-[#F5F1E6] relative border-b border-[#8F9C86]/15 overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={productName} 
                          className="w-full h-full object-cover grayscale mix-blend-multiply group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out filter sepia-[0.03]" 
                        />
                        
                        <div className="absolute top-4 left-4 border border-[#8F9C86]/20 bg-[#FAF6EE] px-3.5 py-1.5 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A] shadow-sm">
                          ID: {design.id.slice(0, 8).toUpperCase()}
                        </div>

                        <div className={`absolute top-4 right-4 border border-[#8F9C86]/20 px-3.5 py-1.5 rounded-full text-[8px] uppercase tracking-[0.2em] font-bold flex items-center gap-1 shadow-sm ${
                          isTemplate ? 'bg-[#2C3625] text-[#FAF6EE]' : 'bg-[#1F2B1A] text-[#FAF6EE]'
                        }`}>
                          {isTemplate ? (
                            <>
                              <Award className="w-3 h-3 text-[#D27D5B]" />
                              <span>Company Template</span>
                            </>
                          ) : (
                            <span>Personal Proof</span>
                          )}
                        </div>
                      </div>

                      <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <span className="inline-block text-[8px] uppercase tracking-[0.2em] text-[#D27D5B] font-bold bg-[#D27D5B]/10 px-2.5 py-1 rounded-full">
                              {isBundle ? 'BUNDLE SUITE' : `SKU // ${design.product?.sku || 'GENERIC'}`}
                            </span>
                            <h3 className="font-serif text-2xl uppercase tracking-tight text-[#1F2B1A] leading-tight truncate">
                              {productName}
                            </h3>
                          </div>

                          {design.intentPrompt && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase tracking-widest text-[#1F2B1A]/40 block font-sans flex items-center gap-1.5 font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-[#D27D5B]" /> Directive Parameters
                              </span>
                              <p className="text-[11px] uppercase tracking-widest font-sans font-medium text-[#1F2B1A]/70 line-clamp-2 leading-relaxed bg-[#F5F1E6]/50 p-3 rounded-xl border border-[#8F9C86]/10">
                                &ldquo;{design.intentPrompt}&rdquo;
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/50 border-t border-[#8F9C86]/10 pt-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
                              <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end">
                              <Tag className="w-3.5 h-3.5 stroke-[1.8]" />
                              <span>${isBundle ? design.bundle?.price.toFixed(2) : (design.product?.basePrice.toFixed(2) || '0.00')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Template Actions */}
                        <div className="flex gap-3 text-[9px] uppercase tracking-wider font-bold">
                          {!isBundle && (
                            <button
                              onClick={() => handleDuplicateDesign(design.id, design.productId || '')}
                              className="flex-1 py-2.5 bg-[#F5F1E6] hover:bg-[#1F2B1A] hover:text-[#FAF6EE] rounded-full flex items-center justify-center gap-1.5 text-[#1F2B1A] border border-[#8F9C86]/20 transition-all cursor-pointer font-sans font-extrabold"
                              title="Duplicate Design"
                            >
                              <Copy className="w-3 h-3" /> Duplicate
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleTemplateStatus(design.id, design.status)}
                            className={`flex-1 py-2.5 rounded-full flex items-center justify-center gap-1.5 border transition-all cursor-pointer font-sans font-extrabold ${
                              isTemplate 
                                ? 'bg-[#FAF6EE] text-[#D27D5B] border-[#D27D5B]/20 hover:bg-[#D27D5B]/5' 
                                : 'bg-[#F5F1E6] text-[#1F2B1A] border-[#8F9C86]/20 hover:bg-[#2C3625] hover:text-[#FAF6EE]'
                            }`}
                          >
                            <Award className="w-3 h-3" /> {isTemplate ? "Demote" : "Promote"}
                          </button>
                        </div>

                        {/* Modify / Deploy (Design Vault flow returning back instead of Checkout) */}
                        <div className="pt-4 border-t border-[#8F9C86]/15 flex gap-4">
                          <Link 
                            href={isBundle ? `/catalog/bundle/${design.bundleId}?designId=${design.id}&from=vault` : `/catalog/${design.productId}?designId=${design.id}&from=vault`}
                            className="flex-1 py-3 text-center border border-[#1F2B1A]/20 text-[#1F2B1A] hover:bg-[#1F2B1A] hover:text-[#FAF6EE] text-xs tracking-[0.2em] uppercase font-bold rounded-full transition-all duration-300"
                          >
                            Modify
                          </Link>
                          <Link 
                            href={`/checkout?designId=${design.id}`}
                            className="flex-1 py-3 text-center bg-[#D27D5B] text-[#FAF6EE] hover:bg-[#1F2B1A] text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 rounded-full flex items-center justify-center gap-1 shadow-sm"
                          >
                            Deploy <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB VIEW 3: Address Book */}
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center pb-6 border-b border-[#8F9C86]/15">
              <div className="flex items-center gap-3">
                {/* Prominent Back Button (Issue #3) */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-10 h-10 rounded-full border border-[#8F9C86]/20 flex items-center justify-center text-[#1F2B1A]/60 hover:text-[#D27D5B] hover:border-[#D27D5B] transition-all cursor-pointer bg-transparent"
                  title="Return to Campaign Registry"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <h2 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">Address <span className="italic font-light lowercase text-[#D27D5B]">book</span></h2>
              </div>
              
              <div className="flex gap-4 border border-[#8F9C86]/20 p-1.5 rounded-full bg-[#FAF6EE]">
                <button
                  onClick={() => setActiveDirectorySubtab('CONTACTS')}
                  className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all ${
                    activeDirectorySubtab === 'CONTACTS' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60 hover:text-[#1F2B1A]'
                  }`}
                >
                  Directory Contacts
                </button>
                <button
                  onClick={() => setActiveDirectorySubtab('GROUPS')}
                  className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all ${
                    activeDirectorySubtab === 'GROUPS' ? 'bg-[#1F2B1A] text-[#FAF6EE] shadow-sm' : 'text-[#1F2B1A]/60 hover:text-[#1F2B1A]'
                  }`}
                >
                  Campaign Groups ({groups.length})
                </button>
              </div>
            </div>

            {activeDirectorySubtab === 'CONTACTS' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                {/* Left Panel: Ingest Single / CSV */}
                <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 lg:p-10 rounded-[2rem] space-y-8 lg:sticky lg:top-28 shadow-sm">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">STATION 01 // DIRECTORY ENTRY</span>
                    <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">Log <span className="italic font-light lowercase text-[#D27D5B]">designee</span></h3>
                  </div>

                  {contactSuccess && (
                    <div className="border border-[#8F9C86]/30 bg-[#8F9C86]/10 px-6 py-4 text-xs uppercase tracking-widest text-[#1F2B1A] font-bold flex items-center gap-2 rounded-xl animate-bloom">
                      <Check className="w-4 h-4 stroke-[2.5] text-[#D27D5B]" /> {contactSuccess}
                    </div>
                  )}

                  {contactError && (
                    <div className="border border-[#D27D5B]/30 bg-[#D27D5B]/10 px-6 py-4 text-xs uppercase tracking-widest text-[#D27D5B] font-bold rounded-xl">
                      🌿 {contactError}
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                        <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">Name</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                          placeholder="ALEX MORGAN"
                          value={cName}
                          onChange={(e) => setCName(e.target.value)}
                        />
                      </div>

                      <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                        <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Email</label>
                        <input
                          type="email"
                          className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                          placeholder="ALEX@COMPANY.COM"
                          value={cEmail}
                          onChange={(e) => setCEmail(e.target.value)}
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
                          value={cPhone}
                          onChange={(e) => setCPhone(e.target.value)}
                        />
                      </div>

                      <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                        <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Cohort Tag</label>
                        <select
                          className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none cursor-pointer"
                          value={cTag}
                          onChange={(e) => setCTag(e.target.value)}
                        >
                          <option value="Client">Client</option>
                          <option value="Employee">Employee</option>
                          <option value="Executive">Executive</option>
                          <option value="VIP">VIP Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#8F9C86]/15">
                      <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/50 font-sans font-bold">Physical Coordinates (Optional)</span>
                      
                      <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                        <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Street Address</label>
                        <input
                          type="text"
                          className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                          placeholder="123 SEEDLING BLVD"
                          value={cStreet}
                          onChange={(e) => setCStreet(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                          <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">City</label>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                            placeholder="BEVERLY HILLS"
                            value={cCity}
                            onChange={(e) => setCCity(e.target.value)}
                          />
                        </div>
                        <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                          <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">State</label>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                            placeholder="CA"
                            value={cState}
                            onChange={(e) => setCState(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                          <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Zip Code</label>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                            placeholder="90210"
                            value={cZip}
                            onChange={(e) => setCZip(e.target.value)}
                          />
                        </div>
                        <div className="relative border-b border-[#8F9C86]/30 pb-1 group focus-within:border-[#D27D5B]">
                          <label className="block text-[8px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/50 mb-1">Country</label>
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                            value={cCountry}
                            onChange={(e) => setCCountry(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingContact}
                      className="w-full py-4.5 bg-[#1F2B1A] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#D27D5B] transition-colors border-0 shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Commit To Directory
                    </button>
                  </form>

                  {/* CSV mass uploader */}
                  <div className="border-t border-[#8F9C86]/15 pt-6 space-y-4">
                    <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">STATION 02 // CSV MASS LOADER</span>
                    {csvError && <div className="text-[10px] text-red-600 font-bold">// ERROR: {csvError}</div>}

                    <label className="relative border border-dashed border-[#8F9C86]/40 rounded-2xl bg-[#FAF6EE]/50 hover:bg-[#FAF9F5] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group text-center shadow-sm">
                      <Upload className="w-6 h-6 text-[#1F2B1A]/40 mb-2 group-hover:text-[#D27D5B] transition-colors" />
                      <span className="text-xs font-bold text-[#1F2B1A]">Upload Recipient CSV</span>
                      <span className="text-[8px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono mt-1 block">Requires header: "Name"</span>
                      <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleCsvLoader} />
                    </label>
                  </div>
                </div>

                {/* Right Panel: List view */}
                <div className="lg:col-span-7 border border-[#8F9C86]/15 bg-[#F5F1E6]/20 rounded-[2rem] shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F5F1E6]/30">
                    <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none flex-shrink-0">Directory Registry</h3>
                    <div className="relative w-full md:max-w-xs flex items-center border border-[#8F9C86]/25 px-4 py-2 bg-[#FAF9F5]/80 rounded-full shadow-inner">
                      <Search className="w-4 h-4 text-[#1F2B1A]/40 mr-2 flex-shrink-0" />
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/30"
                        placeholder="Search directory..."
                        value={directorySearch}
                        onChange={(e) => setDirectorySearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {recipients.length === 0 ? (
                    <div className="py-24 text-center px-6">
                      <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic mb-2">No directory records established.</p>
                      <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/30 max-w-xs mx-auto leading-relaxed">Utilize the registration console on the left to populate your directory.</p>
                    </div>
                  ) : filteredRecipients.length === 0 ? (
                    <div className="py-24 text-center px-6">
                      <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic">No matches found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#8F9C86]/15">
                      {filteredRecipients.map((rec) => {
                        const hasAddress = rec.address && (rec.address as any).street;
                        const addressObj = rec.address as any;
                        const formattedAddress = hasAddress ? `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.postalCode}` : null;

                        return (
                          <div key={rec.id} className="p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3.5 flex-grow">
                              <div className="flex items-center gap-3">
                                <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#1F2B1A]">{rec.name}</span>
                                {rec.tags.map((tag, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-[#D27D5B]/5 border border-[#D27D5B]/10 text-[8px] uppercase tracking-[0.2em] font-bold text-[#D27D5B] rounded-full">{tag}</span>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs uppercase tracking-widest font-bold text-[#1F2B1A]/50">
                                <div className="space-y-2">
                                  {rec.email && <span className="flex items-center gap-2 text-[#1F2B1A]/70"><Mail className="w-3.5 h-3.5 text-[#1F2B1A]/30" /> {rec.email}</span>}
                                  {rec.phone && <span className="flex items-center gap-2 text-[#1F2B1A]/70"><Phone className="w-3.5 h-3.5 text-[#1F2B1A]/30" /> {rec.phone}</span>}
                                </div>
                                <div className="space-y-1">
                                  {formattedAddress ? (
                                    <span className="flex items-start gap-2 text-[#1F2B1A]/70 leading-normal">
                                      <MapPin className="w-3.5 h-3.5 text-[#D27D5B]/60 flex-shrink-0" />
                                      <span className="truncate max-w-xs">{formattedAddress}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] uppercase tracking-widest text-[#D27D5B] italic font-semibold">[ Address collected on checkout ]</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button onClick={() => handleContactDelete(rec.id)} className="text-[#D27D5B] hover:text-[#1F2B1A] p-2.5 transition-colors cursor-pointer border-0 bg-transparent">
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
              /* Campaign Groups Subtab (Addresses Group Creation & connect UI) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                
                {/* Left: Create Group Form */}
                <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 backdrop-blur-[1px] p-8 lg:p-10 rounded-[2rem] space-y-8 lg:sticky lg:top-28 shadow-sm">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block mb-2">STATION 03 // GROUP FORMATION</span>
                    <h3 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">New <span className="italic font-light lowercase text-[#D27D5B]">cohort</span></h3>
                  </div>

                  {!showGroupForm ? (
                    <button
                      onClick={() => setShowGroupForm(true)}
                      className="w-full py-4.5 bg-[#D27D5B] hover:bg-[#1F2B1A] text-[#FAF6EE] text-xs uppercase tracking-[0.25em] font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer border-0"
                    >
                      <FolderPlus className="w-4 h-4" /> Create Named Group
                    </button>
                  ) : (
                    <form onSubmit={handleGroupCreate} className="space-y-6">
                      <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                        <label className="block text-[8px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-1 group-focus-within:text-[#D27D5B]">Group Name</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                          placeholder="E.G., Q4 CORPORATE VIP LIST"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <span className="block text-[8px] uppercase tracking-widest text-[#1F2B1A]/50 font-sans font-bold">Select Cohort Members ({selectedRecipientIds.length})</span>
                        {recipients.length === 0 ? (
                          <div className="text-xs text-[#1F2B1A]/40 font-bold italic">// No directory contacts establish.</div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-[#8F9C86]/15 rounded-xl p-3 space-y-2 bg-[#FAF6EE]/50 shadow-inner">
                            {recipients.map((rec) => (
                              <label key={rec.id} className="flex items-center gap-3 cursor-pointer text-xs uppercase tracking-wider text-[#1F2B1A]/70 select-none">
                                <input
                                  type="checkbox"
                                  className="accent-[#D27D5B] w-4 h-4 cursor-pointer"
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
                          disabled={submittingContact || !groupName}
                          className="flex-1 py-3 bg-[#1F2B1A] text-[#FAF6EE] text-xs uppercase font-bold rounded-full hover:bg-[#D27D5B] shadow-md cursor-pointer border-0"
                        >
                          Create Group
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right: Groups List view */}
                <div className="lg:col-span-7 border border-[#8F9C86]/15 bg-[#F5F1E6]/20 rounded-[2rem] shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="px-8 py-6 border-b border-[#8F9C86]/15 flex justify-between items-center bg-[#F5F1E6]/30">
                    <h3 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">Campaign Cohorts</h3>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/40">// ACTIVE_GROUPS</span>
                  </div>

                  {groups.length === 0 ? (
                    <div className="py-24 text-center px-6">
                      <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/40 font-bold italic mb-2">No active campaign groups logged.</p>
                      <p className="text-xs uppercase tracking-widest text-[#1F2B1A]/30 max-w-xs mx-auto leading-relaxed">Establish a named group using the console on the left to deploy campaigns in checkout.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#8F9C86]/15">
                      {groups.map((grp) => (
                        <div key={grp.id} className="p-8 hover:bg-[#FAF9F5]/40 transition-colors duration-300 flex items-center justify-between gap-6">
                          <div className="space-y-2">
                            <h4 className="font-serif text-2xl text-[#1F2B1A] uppercase tracking-tight leading-none">{grp.name}</h4>
                            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#D27D5B]">Includes {grp.members.length} Designee(s)</span>
                            {grp.members.length > 0 && (
                              <div className="text-[9px] uppercase tracking-widest text-[#1F2B1A]/50 font-bold max-w-md pt-1">
                                Members: {grp.members.map(m => m.name).join(', ')}
                              </div>
                            )}
                          </div>

                          <button onClick={() => handleGroupDelete(grp.id)} className="text-[#D27D5B] hover:text-[#1F2B1A] p-2.5 transition-colors cursor-pointer border-0 bg-transparent">
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
        )}

        {/* TAB VIEW 4: Workspace Settings (Subscription/Plan References Removed) */}
        {activeTab === 'SETTINGS' && (
          <div className="animate-fade-in space-y-8">
            <div className="pb-6 border-b border-[#8F9C86]/15 flex justify-between items-center">
              <h2 className="font-serif text-3xl uppercase tracking-tight text-[#1F2B1A]">Workspace <span className="italic font-light lowercase text-[#D27D5B]">settings</span></h2>
              <span className="px-5 py-2 border border-[#8F9C86]/20 text-[10px] uppercase tracking-[0.2em] font-bold text-[#1F2B1A]/60 bg-[#FAF9F5]/40 rounded-full font-mono">
                Role Node: {role}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left Panel: Form */}
              <form onSubmit={handleOrgSubmit} className="lg:col-span-7 space-y-12">
                {orgSuccess && (
                  <div className="border border-[#8F9C86]/30 bg-[#8F9C86]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#1F2B1A] font-bold flex items-center gap-3 rounded-2xl shadow-inner">
                    <Check className="w-4 h-4 stroke-[2.5] text-[#D27D5B]" /> Workspace parameters synchronized successfully
                  </div>
                )}

                {orgError && (
                  <div className="border border-[#D27D5B]/30 bg-[#D27D5B]/10 px-8 py-5 text-xs uppercase tracking-widest text-[#D27D5B] font-bold rounded-2xl">
                    🌿 {orgError}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                    <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">01 /</span>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Corporate Entity Details</h3>
                  </div>
                  
                  <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                    <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 group-focus-within:text-[#D27D5B]">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                      placeholder="ENTER COMPANY NAME"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#8F9C86]/15 pb-4">
                    <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#D27D5B]">02 /</span>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#1F2B1A]">Brand Identity Assets</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Brand Color */}
                    <div className="space-y-4">
                      <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50">Primary Brand Color</label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="color"
                          className="w-12 h-12 border border-[#8F9C86]/30 rounded-xl bg-transparent cursor-pointer p-1"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                        />
                        <div className="relative border-b border-[#8F9C86]/30 pb-1 flex-grow focus-within:border-[#D27D5B]">
                          <input
                            type="text"
                            className="w-full bg-transparent text-xs font-mono uppercase tracking-widest text-[#1F2B1A] focus:outline-none"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo Asset */}
                    <div className="relative border-b border-[#8F9C86]/30 pb-2 group focus-within:border-[#D27D5B]">
                      <label className="block text-xs uppercase tracking-[0.25em] font-bold text-[#1F2B1A]/50 mb-2 group-focus-within:text-[#D27D5B]">
                        Corporate Logo (Vector/PNG URL)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-transparent text-xs font-sans uppercase tracking-widest text-[#1F2B1A] focus:outline-none placeholder:text-[#1F2B1A]/20"
                        placeholder="HTTPS://DOMAIN.COM/LOGO.PNG"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingOrg}
                  className="w-full py-5 bg-[#D27D5B] text-[#FAF6EE] text-xs tracking-[0.25em] uppercase font-bold rounded-full hover:bg-[#1F2B1A] transition-colors duration-500 disabled:opacity-50 shadow-md hover:shadow-lg cursor-pointer border-0"
                >
                  {savingOrg ? 'SYNCHRONIZING WORKSPACE...' : 'SAVE WORKSPACE PARAMETERS'}
                </button>
              </form>

              {/* Right Panel: Live Mockup Workstation */}
              <div className="lg:col-span-5 border border-[#8F9C86]/15 bg-[#F5F1E6]/30 p-8 space-y-8 rounded-[2rem] shadow-sm lg:sticky lg:top-28">
                <span className="text-[8px] uppercase tracking-[0.25em] font-bold text-[#D27D5B] block">WORKSPACE MOCKUP // DYNAMIC PREVIEW</span>

                <div className="aspect-square w-full border border-[#8F9C86]/10 bg-[#FAF6EE] relative overflow-hidden flex flex-col justify-between p-6 rounded-3xl">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(31,43,26,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(31,43,26,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                  <div 
                    className="w-full h-full border flex flex-col items-center justify-center p-8 relative z-10 transition-colors duration-500 rounded-2xl shadow-inner bg-white/20"
                    style={{ borderColor: brandColor }}
                  >
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 border border-[#8F9C86]/10 rounded-full mx-auto bg-white flex items-center justify-center shadow-sm p-3 relative overflow-hidden">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Preview Logo" className="w-full h-full object-contain grayscale" />
                        ) : (
                          <Building2 className="w-8 h-8 text-[#1F2B1A]/30" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-serif text-2xl uppercase tracking-tight text-[#1F2B1A] truncate max-w-xs mx-auto">
                          {orgName || 'Workspace.'}
                        </h4>
                        <span 
                          className="text-[8px] uppercase tracking-[0.25em] font-bold px-3 py-1.5 text-[#FAF6EE] rounded-full transition-colors duration-500 shadow-sm"
                          style={{ backgroundColor: brandColor }}
                        >
                          Default Brand Color
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-[7px] uppercase tracking-widest text-[#1F2B1A]/40 font-mono relative z-10 pt-4">
                    MOCK_SKU: BNDL_IDENTITY_PACK
                  </div>
                </div>

                <p className="text-xs md:text-sm font-sans text-[#1F2B1A]/60 uppercase tracking-widest leading-[1.8] text-center font-semibold">
                  This mockup represents your default brand values loaded as standard guidelines for custom previews.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
