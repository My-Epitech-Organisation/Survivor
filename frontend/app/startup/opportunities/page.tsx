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

type PartnerItem = {
  id: string;
  name: string;
  partnership_type?: string;
  location?: string;
  description: string;
  contact_email?: string;
};

type InvestorMatch = {
  id: string;
  name: string;
  investor_type?: string;
  investment_focus?: string;
  score: number;
  description: string;
};

const MOCK_INVESTORS: InvestorMatch[] = [
  {
    id: "i1",
    name: "SeedOne Capital",
    investor_type: "VC - seed",
    investment_focus: "SaaS, DeepTech, Health",
    score: 86,
    description:
      "Fonds seed axé sur les équipes techniques ayant validé un MVP. Favorise levées de 200k-1M€.",
  },
  {
    id: "i2",
    name: "Angel Collective",
    investor_type: "Angel Network",
    investment_focus: "Climate, Energy",
    score: 72,
    description:
      "Réseau d'anges investisseurs intéressés par early-stage impact projects.",
  },
];

export default function StartupOpportunities() {
  const [tab, setTab] = useState<"opportunities" | "matches">(
    "opportunities"
  );
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [investors, setInvestors] = useState<InvestorMatch[]>([]);
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
            data.map((investor: InvestorMatch) => investor.investor_type).filter(Boolean)
          ),
        ];
        const uniqueFocuses = [
          ...new Set(
            data.map((investor: InvestorMatch) => investor.investment_focus).filter(Boolean)
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
              className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none ${
                tab === "opportunities"
                  ? "bg-app-surface border border-app-border text-app-text-primary"
                  : "bg-white border border-app-border text-app-text-secondary"
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setTab("matches")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none ${
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
                  <span className="text-lg font-medium text-app-text-primary">Filters</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-app-blue-primary" />
                      <span className="text-sm font-medium text-app-text-primary">Type</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {activePartnerFilters.types.length === 0
                            ? "All Types"
                            : activePartnerFilters.types.length === 1
                            ? activePartnerFilters.types[0]
                            : `${activePartnerFilters.types.length} selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select Type</DropdownMenuLabel>
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
                      className="text-app-text-secondary hover:text-app-text-primary whitespace-nowrap"
                      onClick={() => handlePartnerFiltersChange({ types: [] })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <div
                ref={partnersListRef}
                className="space-y-4 overflow-y-auto flex-1"
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
                            {p.partnership_type} • {p.location}
                          </div>
                        </div>
                        <div className="text-sm text-app-text-secondary">{p.contact_email}</div>
                      </div>
                      <p className="mt-3 text-app-text-secondary">{p.description}</p>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm">
                          Voir
                        </button>
                        <button className="px-3 py-1 rounded border border-app-border text-sm">
                          Contacter
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
                        <Button variant="outline" className="w-full justify-between">
                          {activeInvestorFilters.types.length === 0
                            ? "All Types"
                            : activeInvestorFilters.types.length === 1
                            ? activeInvestorFilters.types[0]
                            : `${activeInvestorFilters.types.length} selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select Type</DropdownMenuLabel>
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
                        <Button variant="outline" className="w-full justify-between">
                          {activeInvestorFilters.focuses.length === 0
                            ? "All Focuses"
                            : activeInvestorFilters.focuses.length === 1
                            ? activeInvestorFilters.focuses[0]
                            : `${activeInvestorFilters.focuses.length} selected`}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuLabel>Select Focus</DropdownMenuLabel>
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
                      className="text-app-text-secondary hover:text-app-text-primary whitespace-nowrap"
                      onClick={() => handleInvestorFiltersChange({ types: [], focuses: [] })}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <div ref={fundingListRef} className="space-y-4 overflow-y-auto flex-1">
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
                        <button className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm">
                          Détails
                        </button>
                        <button className="px-3 py-1 rounded border border-app-border text-sm">
                          Demander info
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
            <p className="text-app-text-secondary mb-6">Matches générés automatiquement (placeholder).</p>

            <div className="space-y-4">
              {MOCK_INVESTORS.map((m) => (
                <div
                  key={m.id}
                  className="border border-app-border rounded-md p-4 bg-white flex justify-between items-start"
                >
                  <div>
                    <h4 className="text-lg font-medium text-app-text-primary">{m.name}</h4>
                    <div className="text-sm text-app-text-secondary">{m.investor_type} • {m.investment_focus}</div>
                    <p className="mt-2 text-app-text-secondary">{m.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-app-text-primary">{m.score}%</div>
                    <div className="text-sm text-app-text-secondary">match</div>
                    <div className="mt-3 flex flex-col gap-2">
                      <button className="px-3 py-1 rounded bg-app-blue-primary text-white text-sm">Contacter</button>
                      <button className="px-3 py-1 rounded border border-app-border text-sm">Sauvegarder</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
