"use client";
import React, { useState, useEffect, useRef } from "react";
import StartupNavigation from "@/components/StartupNavigation";
import { getAPIUrl } from "@/lib/config";

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

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const apiBase = getAPIUrl();
        const res = await fetch(`${apiBase}/partners/`);
        if (!res.ok) return;
        const data = await res.json();
        setPartners(data);
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
        twoItemsHeight = itemH * 2.5 + gap;
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
              <div
                ref={partnersListRef}
                className="space-y-4 overflow-y-auto flex-1"
              >
                {partners.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-app-text-secondary">
                    No partners available.
                  </div>
                ) : (
                  partners.map((p) => (
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
              <div ref={fundingListRef} className="space-y-4 overflow-y-auto flex-1">
                {investors.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-app-text-secondary">
                    No funding opportunities available.
                  </div>
                ) : (
                  investors.map((inv) => (
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
