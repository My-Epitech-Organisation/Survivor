"use client";
import React, { useState, useEffect, useRef } from "react";
import StartupNavigation from "@/components/StartupNavigation";
import { getAPIUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter, Users, DollarSign, X, Building, MapPin, Mail, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PartnerItem = {
  id: string;
  name: string;
  partnership_type?: string;
  address?: string;
  email?: string;
  description: string;
};

type InvestorItem = {
  id: string;
  name: string;
  investor_type?: string;
  investment_focus?: string;
  email?: string;
  description: string;
};

type InvestorMatch = {
  investor_id: number;
  name: string;
  score: number;
  reason: string;
  investor_type?: string;
  investment_focus?: string;
  description?: string;
  location?: string;
};

export default function StartupOpportunities() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"opportunities" | "matches">(
    "opportunities"
  );
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [investors, setInvestors] = useState<InvestorItem[]>([]);
  const [matches, setMatches] = useState<InvestorMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const partnersCardRef = useRef<HTMLDivElement | null>(null);
  const partnersListRef = useRef<HTMLDivElement | null>(null);
  const fundingCardRef = useRef<HTMLDivElement | null>(null);
  const fundingListRef = useRef<HTMLDivElement | null>(null);
  const matchContentRef = useRef<HTMLDivElement | null>(null);

  const [partnerTypes, setPartnerTypes] = useState<string[]>([]);
  const [investorTypes, setInvestorTypes] = useState<string[]>([]);
  const [investmentFocuses, setInvestmentFocuses] = useState<string[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorItem | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<InvestorMatch | null>(null);

  const [activePartnerFilters, setActivePartnerFilters] = useState({
    types: [] as string[],
  });

  const [activeInvestorFilters, setActiveInvestorFilters] = useState({
    types: [] as string[],
    focuses: [] as string[],
  });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const apiBase = getAPIUrl();
        const res = await fetch(`${apiBase}/partners/`);
        if (!res.ok) return;
        const data = await res.json();
        setPartners(data);

        const uniqueTypes = [
          ...new Set(
            data.map((partner: PartnerItem) => partner.partnership_type).filter(Boolean)
          ),
        ];
        setPartnerTypes(uniqueTypes as string[]);
      } catch {
      }
    };
    fetchPartners();
  }, []);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const apiBase = getAPIUrl();
        const res = await fetch(`${apiBase}/investors/`);
        if (!res.ok) return;
        const data = await res.json();
        setInvestors(data);

        const uniqueTypes = [
          ...new Set(
            data.map((investor: InvestorItem) => investor.investor_type).filter(Boolean)
          ),
        ];
        const uniqueFocuses = [
          ...new Set(
            data.map((investor: InvestorItem) => investor.investment_focus).filter(Boolean)
          ),
        ];
        setInvestorTypes(uniqueTypes as string[]);
        setInvestmentFocuses(uniqueFocuses as string[]);
      } catch {
      }
    };
    fetchInvestors();
  }, []);

  useEffect(() => {
    const computeFor = (card: HTMLDivElement | null, list: HTMLDivElement | null) => {
      if (!card || !list) return;

      setTimeout(() => {
        const top = card.getBoundingClientRect().top;
        const available = window.innerHeight - top - 24;
        const children = list.children;

        if (children.length >= 2) {
          const firstChild = children[0] as HTMLElement;
          const secondChild = children[1] as HTMLElement;

          const firstRect = firstChild.getBoundingClientRect();
          const secondRect = secondChild.getBoundingClientRect();

          const twoItemsHeight = secondRect.bottom - firstRect.top;

          const maxHeight = Math.max(120, twoItemsHeight);
          list.style.maxHeight = `${Math.min(available, maxHeight)}px`;
        } else if (children.length === 1) {
          const firstChild = children[0] as HTMLElement;
          const itemHeight = firstChild.getBoundingClientRect().height;
          list.style.maxHeight = `${Math.max(120, itemHeight + 16)}px`;
        }
      }, 100);
    };

    const compute = () => {
      computeFor(partnersCardRef.current, partnersListRef.current);
      computeFor(fundingCardRef.current, fundingListRef.current);
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [partners, investors]);

  // Auto-scroll for match dialog
  useEffect(() => {
    if (selectedMatch && matchContentRef.current) {
      setTimeout(() => {
        if (matchContentRef.current) {
          const contentElement = matchContentRef.current;
          const sections = contentElement.querySelectorAll('.space-y-6 > div');

          if (sections.length >= 2) {
            // Calculate height for about 1.5 sections
            const firstSection = sections[0] as HTMLElement;
            const secondSection = sections[1] as HTMLElement;
            const firstHeight = firstSection.offsetHeight;
            const secondHeight = secondSection.offsetHeight;
            const targetScroll = firstHeight + (secondHeight * 0.5);

            contentElement.scrollTo({
              top: Math.max(0, targetScroll - (contentElement.clientHeight * 0.3)),
              behavior: 'smooth'
            });
          }
        }
      }, 300);
    }
  }, [selectedMatch]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user?.startupId) {
        setMatchesError("Aucune startup associée à votre compte.");
        return;
      }

      setMatchesLoading(true);
      setMatchesError(null);

      try {
        const apiBase = getAPIUrl();
        const res = await fetch(`${apiBase}/opportunities/matches/?startup_id=${user.startupId}`);

        if (!res.ok) {
          if (res.status === 400) {
            setMatchesError("Startup introuvable.");
          } else {
            setMatchesError("Error retrieving matches.");
          }
          return;
        }

        const data = await res.json();
        setMatches(data.matches || []);
      } catch {
        setMatchesError("Connection error. Please try again.");
      } finally {
        setMatchesLoading(false);
      }
    };

    if (tab === "matches" && user) {
      fetchMatches();
    }
  }, [tab, user]);

  const handlePartnerFiltersChange = (filters: { types: string[] }) => {
    setActivePartnerFilters(filters);
  };

  const handleInvestorFiltersChange = (filters: { types: string[]; focuses: string[] }) => {
    setActiveInvestorFilters(filters);
  };

  const getFilteredPartners = () => {
    return partners.filter((partner) => {
      const typeMatch =
        activePartnerFilters.types.length === 0 ||
        activePartnerFilters.types.includes(partner.partnership_type || "");
      return typeMatch;
    });
  };

  const handlePartnerView = (partner: PartnerItem) => {
    setSelectedPartner(partner);
  };

  const handleInvestorView = (investor: InvestorItem) => {
    setSelectedInvestor(investor);
  };

  const handleMatchView = (match: InvestorMatch) => {
    setSelectedMatch(match);
  };

  const getFilteredInvestors = () => {
    return investors.filter((investor) => {
      const typeMatch =
        activeInvestorFilters.types.length === 0 ||
        activeInvestorFilters.types.includes(investor.investor_type || "");
      const focusMatch =
        activeInvestorFilters.focuses.length === 0 ||
        activeInvestorFilters.focuses.includes(investor.investment_focus || "");
      return typeMatch && focusMatch;
    });
  };

  const filteredPartners = getFilteredPartners();
  const filteredInvestors = getFilteredInvestors();

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <StartupNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-4">
            Opportunities
          </h1>
          <p className="text-lg text-app-text-secondary max-w-3xl mx-auto">
            Discover calls for projects, funding opportunities and quick investor
            matches tailored to startups. (Placeholders)
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setTab("opportunities")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none cursor-pointer ${
                tab === "opportunities"
                  ? "bg-app-surface border border-app-border text-app-text-primary"
                  : "bg-white border border-app-border text-app-text-secondary"
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setTab("matches")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none cursor-pointer ${
                tab === "matches"
                  ? "bg-app-surface border border-app-border text-app-text-primary"
                  : "bg-white border border-app-border text-app-text-secondary"
              }`}
            >
              Matches
            </button>
          </div>
        </div>

        {tab === "opportunities" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div ref={partnersCardRef} className="bg-app-surface rounded-lg shadow-md p-8 flex flex-col">
              <h3 className="text-2xl font-semibold text-app-text-primary mb-6">
                Partners
              </h3>

              {/* Partner Filters */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-app-text-secondary" />
                  <span className="text-lg font-medium text-app-text-primary">Filtres</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-app-blue-primary" />
                      <span className="text-sm font-medium text-app-text-primary">Type</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-app-surface/50 hover:border-app-blue-primary/50 transition-colors">
                          {activePartnerFilters.types.length === 0
                            ? "All types"
                            : activePartnerFilters.types.length === 1
                            ? activePartnerFilters.types[0]
                            : `${activePartnerFilters.types.length} selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {partnerTypes.map((type) => (
                          <DropdownMenuCheckboxItem
                            key={type}
                            checked={activePartnerFilters.types.includes(type)}
                            onCheckedChange={(checked) =>
                              handlePartnerFiltersChange({
                                types: checked
                                  ? [...activePartnerFilters.types, type]
                                  : activePartnerFilters.types.filter((t) => t !== type),
                              })
                            }
                            className="hover:bg-app-blue-primary/10 transition-colors cursor-pointer"
                          >
                            {type}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      className="text-app-text-secondary hover:text-app-text-primary whitespace-nowrap cursor-pointer"
                      onClick={() => handlePartnerFiltersChange({ types: [] })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <div
                ref={partnersListRef}
                className="space-y-4 overflow-y-auto flex-1 max-h-96"
              >
                {filteredPartners.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-app-text-secondary">
                    {partners.length === 0 ? "No partners available." : "No partners match your filters."}
                  </div>
                ) : (
                  filteredPartners.map((p) => (
                    <div
                      key={p.id}
                      className="border border-app-border rounded-md p-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-app-text-primary">
                            {p.name}
                          </h4>
                          <div className="text-sm text-app-text-secondary">
                            {p.partnership_type} • {p.address}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-app-text-secondary">{p.description}</p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handlePartnerView(p)}
                          className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm cursor-pointer hover:bg-app-blue-primary/90 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div ref={fundingCardRef} className="bg-app-surface rounded-lg shadow-md p-8 flex flex-col">
              <h3 className="text-2xl font-semibold text-app-text-primary mb-6">
                Funding opportunities
              </h3>

              {/* Investor Filters */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-app-text-secondary" />
                  <span className="text-lg font-medium text-app-text-primary">Filters</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-app-green-primary" />
                      <span className="text-sm font-medium text-app-text-primary">Type</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-app-surface/50 hover:border-app-blue-primary/50 transition-colors">
                          {activeInvestorFilters.types.length === 0
                            ? "All types"
                            : activeInvestorFilters.types.length === 1
                            ? activeInvestorFilters.types[0]
                            : `${activeInvestorFilters.types.length} selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {investorTypes.map((type) => (
                          <DropdownMenuCheckboxItem
                            key={type}
                            checked={activeInvestorFilters.types.includes(type)}
                            onCheckedChange={(checked) =>
                              handleInvestorFiltersChange({
                                types: checked
                                  ? [...activeInvestorFilters.types, type]
                                  : activeInvestorFilters.types.filter((t) => t !== type),
                                focuses: activeInvestorFilters.focuses,
                              })
                            }
                            className="hover:bg-app-blue-primary/10 transition-colors cursor-pointer"
                          >
                            {type}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-app-purple-primary" />
                      <span className="text-sm font-medium text-app-text-primary">Focus</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between cursor-pointer hover:bg-app-surface/50 hover:border-app-blue-primary/50 transition-colors">
                          {activeInvestorFilters.focuses.length === 0
                            ? "All focuses"
                            : activeInvestorFilters.focuses.length === 1
                            ? activeInvestorFilters.focuses[0]
                            : `${activeInvestorFilters.focuses.length} selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select focus</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {investmentFocuses.map((focus) => (
                          <DropdownMenuCheckboxItem
                            key={focus}
                            checked={activeInvestorFilters.focuses.includes(focus)}
                            onCheckedChange={(checked) =>
                              handleInvestorFiltersChange({
                                types: activeInvestorFilters.types,
                                focuses: checked
                                  ? [...activeInvestorFilters.focuses, focus]
                                  : activeInvestorFilters.focuses.filter((f) => f !== focus),
                              })
                            }
                            className="hover:bg-app-blue-primary/10 transition-colors cursor-pointer"
                          >
                            {focus}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      className="text-app-text-secondary hover:text-app-text-primary whitespace-nowrap cursor-pointer"
                      onClick={() => handleInvestorFiltersChange({ types: [], focuses: [] })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <div ref={fundingListRef} className="space-y-4 overflow-y-auto flex-1 max-h-96">
                {filteredInvestors.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-app-text-secondary">
                    {investors.length === 0 ? "No funding opportunities available." : "No funding opportunities match your filters."}
                  </div>
                ) : (
                  filteredInvestors.map((inv) => (
                    <div
                      key={inv.id}
                      className="border border-app-border rounded-md p-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-app-text-primary">
                            {inv.name}
                          </h4>
                          <div className="text-sm text-app-text-secondary">{inv.investment_focus}</div>
                        </div>
                        <div className="text-sm font-medium text-app-text-primary">{inv.investor_type}</div>
                      </div>
                      <p className="mt-3 text-app-text-secondary">{inv.description}</p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleInvestorView(inv)}
                          className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm cursor-pointer hover:bg-app-blue-primary/90 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-app-surface rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-app-text-primary mb-4">
              Investor matches
            </h3>
            <p className="text-app-text-secondary mb-6">
              Discover the investors best suited to your startup. The match score is calculated based on your sector, maturity, needs, and location.
            </p>

            <div className="bg-app-blue-primary/5 border border-app-blue-primary/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-app-text-primary mb-2">How does matching work?</h4>
              <div className="text-xs text-app-text-secondary space-y-1">
                <p>• <strong>Sector:</strong> Direct or thematic match (e.g., DeepTech → Tech, Innovation)</p>
                <p>• <strong>Maturity:</strong> Fit between your startup stage and investor type</p>
                <p>• <strong>Needs:</strong> Alignment with investors&apos; areas of interest</p>
                <p>• <strong>Location:</strong> Preference for investors in your region</p>
              </div>
            </div>

            {matchesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-app-text-secondary">Loading matches...</div>
              </div>
            ) : matchesError ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-app-text-secondary">
                  <p className="mb-2">{matchesError}</p>
                  {matchesError.includes("startup") && (
                    <p className="text-sm">Please contact the administrator to associate a startup with your account.</p>
                  )}
                </div>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-app-text-secondary">
                  <p className="mb-2 text-lg">No perfect matches found.</p>
                  <p className="text-sm mb-4">We suggest completing your startup profile with detailed information about your sector, maturity, and needs for better results.</p>
                  <button className="px-4 py-2 bg-app-blue-primary text-white rounded hover:bg-app-blue-primary/90 transition-colors">
                    Complete my profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m) => (
                  <div
                    key={m.investor_id}
                    className="border border-app-border rounded-md p-6 bg-white flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-medium text-app-text-primary">{m.name}</h4>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            m.score >= 40 ? 'text-green-600' :
                            m.score >= 25 ? 'text-yellow-600' :
                            'text-app-text-secondary'
                          }`}>
                            {m.score}%
                          </div>
                          <div className="text-sm text-app-text-secondary">match</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {m.investor_type && (
                          <span className="px-3 py-1 bg-gradient-to-r from-app-blue-primary/10 to-app-blue-primary/20 text-app-blue-primary text-xs font-medium rounded-full border border-app-blue-primary/20">
                            {m.investor_type}
                          </span>
                        )}
                        {m.investment_focus && (
                          <span className="px-3 py-1 bg-gradient-to-r from-app-purple-primary/10 to-app-purple-primary/20 text-app-purple-primary text-xs font-medium rounded-full border border-app-purple-primary/20">
                            {m.investment_focus}
                          </span>
                        )}
                      </div>

                      {m.description && (
                        <p className="text-app-text-secondary text-sm mb-3 line-clamp-2">{m.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-app-text-secondary">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Reason:</span> {m.reason}
                        </span>
                        {m.location && (
                          <span className="flex items-center gap-1">
                            📍 {m.location.split(',')[1]?.trim() || m.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <button
                        onClick={() => handleMatchView(m)}
                        className="px-4 py-2 rounded bg-app-blue-primary text-white text-sm font-medium hover:bg-app-blue-primary/90 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Partner Details Dialog */}
      <Dialog
        open={selectedPartner !== null}
        onOpenChange={() => setSelectedPartner(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0"
        >
          {/* Custom Close Button */}
          <DialogClose className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer backdrop-blur-sm">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {selectedPartner && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 border border-white/30 text-white">
                      <Building className="w-4 h-4" />
                      <span className="capitalize">Partner</span>
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-bold leading-tight pr-8">
                    {selectedPartner.name}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Partner Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {selectedPartner.partnership_type && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>{selectedPartner.partnership_type}</span>
                        </div>
                      )}
                      {selectedPartner.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedPartner.address}</span>
                        </div>
                      )}
                      {selectedPartner.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedPartner.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Partner Description */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Description
                      </h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {selectedPartner.description || "No description available."}
                        </p>
                      </div>
                    </div>

                    {/* Contact Section */}
                    {selectedPartner.email ? (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact
                        </h3>
                        <div className="flex items-center gap-4">
                          <a
                            href={`mailto:${selectedPartner.email}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-app-blue-primary text-white rounded-lg hover:bg-app-blue-primary/90 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Send Email
                          </a>
                          <span className="text-sm text-gray-600">
                            {selectedPartner.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span>Unknown</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Investor Details Dialog */}
      <Dialog
        open={selectedInvestor !== null}
        onOpenChange={() => setSelectedInvestor(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0"
        >
          {/* Custom Close Button */}
          <DialogClose className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer backdrop-blur-sm">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {selectedInvestor && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 border border-white/30 text-white">
                      <DollarSign className="w-4 h-4" />
                      <span className="capitalize">Investor</span>
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-bold leading-tight pr-8">
                    {selectedInvestor.name}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Investor Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {selectedInvestor.investor_type && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{selectedInvestor.investor_type}</span>
                        </div>
                      )}
                      {selectedInvestor.investment_focus && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{selectedInvestor.investment_focus}</span>
                        </div>
                      )}
                      {selectedInvestor.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{selectedInvestor.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Investor Description */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Description
                      </h3>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {selectedInvestor.description || "No description available."}
                        </p>
                      </div>
                    </div>

                    {/* Contact Section */}
                    {selectedInvestor.email ? (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact
                        </h3>
                        <div className="flex items-center gap-4">
                          <a
                            href={`mailto:${selectedInvestor.email}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-app-blue-primary text-white rounded-lg hover:bg-app-blue-primary/90 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            Send Email
                          </a>
                          <span className="text-sm text-gray-600">
                            {selectedInvestor.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Contact
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span>Unknown</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Details Dialog */}
      <Dialog
        open={selectedMatch !== null}
        onOpenChange={() => setSelectedMatch(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0"
        >
          {/* Custom Close Button */}
          <DialogClose className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer backdrop-blur-sm">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {selectedMatch && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 border border-white/30 text-white">
                      <DollarSign className="w-4 h-4" />
                      <span className="capitalize">Match</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Match Score:</span>
                      <div className={`text-xl font-bold px-2 py-1 rounded-full ${
                        selectedMatch.score >= 40 ? 'bg-green-500/20 text-green-100 border border-green-400/30' :
                        selectedMatch.score >= 25 ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30' :
                        'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                      }`}>
                        {selectedMatch.score}%
                      </div>
                    </div>
                  </div>
                  <DialogTitle className="text-2xl font-bold leading-tight pr-16">
                    {selectedMatch.name}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Content */}
              <div ref={matchContentRef} className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Match Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {selectedMatch.investor_type && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{selectedMatch.investor_type}</span>
                        </div>
                      )}
                      {selectedMatch.investment_focus && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{selectedMatch.investment_focus}</span>
                        </div>
                      )}
                      {selectedMatch.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedMatch.location.split(',')[1]?.trim() || selectedMatch.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Why this match */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Why this match?
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedMatch.reason}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Explanation */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Match Score Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Overall Compatibility</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  selectedMatch.score >= 40 ? 'bg-green-500' :
                                  selectedMatch.score >= 25 ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${selectedMatch.score}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              selectedMatch.score >= 40 ? 'text-green-600' :
                              selectedMatch.score >= 25 ? 'text-yellow-600' :
                              'text-gray-600'
                            }`}>
                              {selectedMatch.score}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <p>• <strong>Sector:</strong> Direct or thematic match</p>
                          <p>• <strong>Maturity:</strong> Fit between your startup stage and investor type</p>
                          <p>• <strong>Needs:</strong> Alignment with investor&apos;s areas of interest</p>
                          <p>• <strong>Location:</strong> Geographic preference match</p>
                        </div>
                      </div>
                    </div>

                    {/* Investor Description */}
                    {selectedMatch.description && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          About this Investor
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {selectedMatch.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-col items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Ready to Connect?
                        </h3>
                        <p className="text-gray-600 text-center mb-4">
                          This investor has been matched with your startup based on compatibility analysis.
                          Take the next step towards potential investment opportunities.
                        </p>
                        <a
                          href={`mailto:?subject=Investment Interest in ${selectedMatch.name}&body=Dear ${selectedMatch.name},%0A%0AI am interested in discussing potential investment opportunities with your firm. Our startup has been matched with your investment criteria, and I would like to explore how we might work together.%0A%0ABest regards,%0A[Your Name]`}
                          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Mail className="w-5 h-5" />
                          Express Interest
                          <TrendingUp className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
