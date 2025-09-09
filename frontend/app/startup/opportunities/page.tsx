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
import { ChevronDown, Filter, Users, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type PartnerItem = {
  id: string;
  name: string;
  partnership_type?: string;
  address?: string;
  description: string;
  contact_email?: string;
};

type InvestorItem = {
  id: string;
  name: string;
  investor_type?: string;
  investment_focus?: string;
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

  const [partnerTypes, setPartnerTypes] = useState<string[]>([]);
  const [investorTypes, setInvestorTypes] = useState<string[]>([]);
  const [investmentFocuses, setInvestmentFocuses] = useState<string[]>([]);

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
      const top = card.getBoundingClientRect().top;
      const available = window.innerHeight - top - 24;
      const firstChild = list.firstElementChild as HTMLElement | null;
      let twoItemsHeight = 0;
      if (firstChild) {
        const itemH = firstChild.getBoundingClientRect().height;
        let gap = 16;
        if (list.children.length > 1) {
          const second = list.children[1] as HTMLElement;
          const firstRect = firstChild.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();
          gap = Math.max(0, secondRect.top - (firstRect.top + firstRect.height));
        }
        twoItemsHeight = itemH * 2 + gap;
      }

      const min = 120;
      const desired = twoItemsHeight > 0 ? Math.max(min, twoItemsHeight) : Math.max(min, available);
      list.style.maxHeight = `${Math.min(available, desired)}px`;
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

  useEffect(() => {
    const computeFor = (card: HTMLDivElement | null, list: HTMLDivElement | null) => {
      if (!card || !list) return;
      const top = card.getBoundingClientRect().top;
      const available = window.innerHeight - top - 24;
      const firstChild = list.firstElementChild as HTMLElement | null;
      let twoItemsHeight = 0;
      if (firstChild) {
        const itemH = firstChild.getBoundingClientRect().height;
        let gap = 16;
        if (list.children.length > 1) {
          const second = list.children[1] as HTMLElement;
          const firstRect = firstChild.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();
          gap = Math.max(0, secondRect.top - (firstRect.top + firstRect.height));
        }
        twoItemsHeight = itemH * 2 + gap;
      }

      const min = 120;
      const desired = twoItemsHeight > 0 ? Math.max(min, twoItemsHeight) : Math.max(min, available);
      list.style.maxHeight = `${Math.min(available, desired)}px`;
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
                className="space-y-4 overflow-y-auto flex-1 max-h-90"
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
                        <div className="text-sm text-app-text-secondary">{p.contact_email}</div>
                      </div>
                      <p className="mt-3 text-app-text-secondary">{p.description}</p>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm cursor-pointer">
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

              <div ref={fundingListRef} className="space-y-4 overflow-y-auto flex-1 max-h-90">
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
                        <button className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm cursor-pointer">
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
                      <button className="px-4 py-2 rounded bg-app-blue-primary text-white text-sm font-medium hover:bg-app-blue-primary/90 transition-colors cursor-pointer">
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
    </div>
  );
}
