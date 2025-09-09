import os
import time
import uuid
from threading import Thread

from groq import Groq
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Investor, StartupDetail

ai_analysis_status = {}


class OpportunitiesMatchesView(APIView):
    """Return matching investors for a given startup or filter set.

    Supports:
    - ?startup_id=<id>
    - ?sectors=deeptech,saas&tags=iot&location=France&stage=seed
    - ?include_ai=true (optional, includes AI analysis)

    Response: {"matches": [{"investor_id": id, "name": str, "score": int, "reason": str}, ...]}
    """

    permission_classes = [AllowAny]

    def _get_ai_score(self, investor, startup):
        """Use Groq AI to analyze the match and provide a score and reason."""
        try:
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            prompt = f"""
Analyze the compatibility between this investor and startup on a scale of 0-100.

Investor:
- Name: {investor.name}
- Type: {investor.investor_type or 'N/A'}
- Focus: {investor.investment_focus or 'N/A'}
- Description: {investor.description or 'N/A'}
- Location: {investor.address or 'N/A'}

Startup:
- Name: {startup.name}
- Sector: {startup.sector or 'N/A'}
- Maturity: {startup.maturity or 'N/A'}
- Needs: {startup.needs or 'N/A'}
- Description: {startup.description or 'N/A'}
- Location: {startup.address or 'N/A'}

Provide a score (0-100) and a brief reason for the match.
Format: Score: X, Reason: explanation
"""
            response = client.chat.completions.create(
                model="llama3-8b-8192", messages=[{"role": "user", "content": prompt}], max_tokens=150, temperature=0.5
            )
            content = response.choices[0].message.content.strip()
            if "Score:" in content and "Reason:" in content:
                score_part = content.split("Score:")[1].split(",")[0].strip()
                reason_part = content.split("Reason:")[1].strip()
                try:
                    ai_score = int(score_part)
                    return ai_score, reason_part
                except ValueError:
                    pass
            return 50, "AI analysis: Moderate match"
        except Exception as e:
            print(f"AI scoring failed: {e}")
            return 0, "AI unavailable"

    def _score_investor_against_startup(self, investor, startup, include_ai=False):
        rule_score = 0
        reasons = []

        inv_focus = (investor.investment_focus or "").lower()
        startup_sector = (startup.sector or "").lower()

        if startup_sector and startup_sector not in ["string", ""] and inv_focus:
            if startup_sector in inv_focus:
                rule_score += 50
                reasons.append("sector match")
            elif self._is_tech_sector_match(startup_sector, inv_focus):
                rule_score += 40
                reasons.append("tech sector match")
            elif "tech" in inv_focus and startup_sector in [
                "deeptech",
                "fintech",
                "biotech",
                "greentech",
                "healthtech",
            ]:
                rule_score += 35
                reasons.append("technology sector")

        inv_focus_lower = inv_focus
        startup_needs = (startup.needs or "").lower()
        if startup_needs and startup_needs not in ["string", ""] and inv_focus_lower:
            if any(need.strip() and need.strip().lower() in inv_focus_lower for need in startup_needs.split(",")):
                rule_score += 30
                reasons.append("needs match")

        inv_location = (investor.address or "").lower()
        startup_location = (startup.address or "").lower()
        if startup_location and startup_location not in ["string", ""] and inv_location:
            startup_country = startup_location.split()[-1] if startup_location.split() else ""
            if startup_country and startup_country.lower() in inv_location:
                rule_score += 10
                reasons.append("location match")

        inv_type = (investor.investor_type or "").lower()
        startup_maturity = (startup.maturity or "").lower()
        if startup_maturity and startup_maturity not in ["string", ""] and inv_type:
            if startup_maturity in inv_type:
                rule_score += 10
                reasons.append("maturity fit")

        if len(reasons) > 1:
            rule_score += len(reasons) * 5
            reasons.append(f"multiple matches bonus (+{len(reasons) * 5})")

        total_score = rule_score
        ai_score = 0
        ai_reason = ""

        if include_ai:
            ai_score, ai_reason = self._get_ai_score(investor, startup)
            if ai_score > 0:
                total_score = int((rule_score + ai_score) / 2)
                reasons.append(f"AI: {ai_reason}")

        return total_score, rule_score, ai_score, ", ".join(reasons) if reasons else "no strong signal"

    def _is_tech_sector_match(self, startup_sector, investor_focus):
        """Check for broader tech sector matches"""
        tech_mappings = {
            "deeptech": ["tech", "innovation", "research", "ai", "artificial intelligence"],
            "fintech": ["finance", "financial", "banking", "payment", "blockchain"],
            "biotech": ["health", "medical", "life science", "pharma", "biotechnology"],
            "greentech": ["green", "sustainability", "environment", "clean energy", "renewable"],
            "healthtech": ["health", "medical", "wellness", "fitness", "telemedicine"],
        }

        startup_lower = startup_sector.lower()
        if startup_lower in tech_mappings:
            for keyword in tech_mappings[startup_lower]:
                if keyword in investor_focus:
                    return True
        return False

    def _score_investor_against_filters(self, investor, filters, include_ai=False):
        rule_score = 0
        reasons = []

        sectors = filters.get("sectors")
        if sectors:
            inv_focus = (investor.investment_focus or "").lower()
            if any(s.strip() and s.strip().lower() in inv_focus for s in sectors.split(",")):
                rule_score += 50
                reasons.append("sector match")

        tags = filters.get("tags")
        if tags:
            inv_focus_lower = (investor.investment_focus or "").lower()
            if any(t.strip() and t.strip().lower() in inv_focus_lower for t in tags.split(",")):
                rule_score += 30
                reasons.append("tags match")

        location = filters.get("location")
        if location and investor.address and location.lower() in (investor.address or "").lower():
            rule_score += 10
            reasons.append("location match")

        stage = filters.get("stage")
        if stage and investor.investor_type and stage.lower() in (investor.investor_type or "").lower():
            rule_score += 10
            reasons.append("stage fit")

        if len(reasons) > 1:
            rule_score += len(reasons) * 5
            reasons.append(f"multiple matches bonus (+{len(reasons) * 5})")

        total_score = rule_score
        ai_score = 0
        if include_ai and (sectors or tags or location or stage):
            ai_score, ai_reason = self._get_ai_score_filters(investor, filters)
            if ai_score > 0:
                total_score = int((rule_score + ai_score) / 2)
                reasons.append(f"AI: {ai_reason}")

        return total_score, rule_score, ai_score, ", ".join(reasons) if reasons else "no strong signal"

    def _get_ai_score_filters(self, investor, filters):
        """Use Groq AI to analyze the match based on filters."""
        try:
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            filter_text = []
            if filters.get("sectors"):
                filter_text.append(f"Sectors: {filters['sectors']}")
            if filters.get("tags"):
                filter_text.append(f"Tags: {filters['tags']}")
            if filters.get("location"):
                filter_text.append(f"Location: {filters['location']}")
            if filters.get("stage"):
                filter_text.append(f"Stage: {filters['stage']}")
            prompt = f"""
Analyze the compatibility between this investor and the given filters on a scale of 0-100.

Investor:
- Name: {investor.name}
- Type: {investor.investor_type or 'N/A'}
- Focus: {investor.investment_focus or 'N/A'}
- Description: {investor.description or 'N/A'}
- Location: {investor.address or 'N/A'}

Filters:
{', '.join(filter_text)}

Provide a score (0-100) and a brief reason for the match.
Format: Score: X, Reason: explanation
"""
            response = client.chat.completions.create(
                model="llama3-8b-8192", messages=[{"role": "user", "content": prompt}], max_tokens=150, temperature=0.5
            )
            content = response.choices[0].message.content.strip()
            if "Score:" in content and "Reason:" in content:
                score_part = content.split("Score:")[1].split(",")[0].strip()
                reason_part = content.split("Reason:")[1].strip()
                try:
                    ai_score = int(score_part)
                    return ai_score, reason_part
                except ValueError:
                    pass
            return 50, "AI analysis: Moderate match"
        except Exception as e:
            print(f"AI scoring failed: {e}")
            return 0, "AI unavailable"

    def _is_startup_data_incomplete(self, startup):
        """Check if startup has incomplete/default data"""
        return (
            not startup.sector
            or startup.sector.lower() in ["string", ""]
            or not startup.maturity
            or startup.maturity.lower() in ["string", ""]
            or not startup.needs
            or startup.needs.lower() in ["string", ""]
            or not startup.address
            or startup.address.lower() in ["string", ""]
        )

    def get(self, request):
        startup_id = request.GET.get("startup_id")
        include_ai = request.GET.get("include_ai", "false").lower() == "true"

        if startup_id:
            try:
                startup = StartupDetail.objects.get(id=int(startup_id))
            except (StartupDetail.DoesNotExist, ValueError):
                return Response({"error": "startup not found"}, status=400)

            investors = Investor.objects.all()
            scored = []
            for inv in investors:
                total_score, rule_score, ai_score, reason = self._score_investor_against_startup(
                    inv, startup, include_ai
                )
                if total_score > 0:
                    scored.append(
                        {
                            "investor_id": inv.id,
                            "name": inv.name,
                            "score": total_score,
                            "rule_score": rule_score,
                            "ai_score": ai_score,
                            "reason": reason,
                            "investor_type": inv.investor_type,
                            "investment_focus": inv.investment_focus,
                            "description": inv.description,
                            "location": inv.address,
                        }
                    )

            if not scored:
                investors_list = list(investors)
                for inv in investors_list[:8]:
                    base_score = 20
                    reason = "general suggestion"

                    if inv.investor_type and "venture" in inv.investor_type.lower():
                        base_score = 25
                        reason = "venture capitalist"
                    elif inv.investor_type and "angel" in inv.investor_type.lower():
                        base_score = 22
                        reason = "angel investor"

                    scored.append(
                        {
                            "investor_id": inv.id,
                            "name": inv.name,
                            "score": base_score,
                            "rule_score": base_score,
                            "ai_score": 0,
                            "reason": reason,
                            "investor_type": inv.investor_type,
                            "investment_focus": inv.investment_focus,
                            "description": inv.description,
                            "location": inv.address,
                        }
                    )

            scored.sort(key=lambda x: x["score"], reverse=True)
            scored = [match for match in scored if match["score"] >= 5]
            return Response({"matches": scored})

        filters = {
            "sectors": request.GET.get("sectors"),
            "tags": request.GET.get("tags"),
            "location": request.GET.get("location"),
            "stage": request.GET.get("stage"),
        }

        investors = Investor.objects.all()
        scored = []
        for inv in investors:
            total_score, rule_score, ai_score, reason = self._score_investor_against_filters(inv, filters, include_ai)
            if total_score > 0:
                scored.append(
                    {
                        "investor_id": inv.id,
                        "name": inv.name,
                        "score": total_score,
                        "rule_score": rule_score,
                        "ai_score": ai_score,
                        "reason": reason,
                    }
                )

        scored.sort(key=lambda x: x["score"], reverse=True)
        return Response({"matches": scored})


class AIAnalysisView(APIView):
    """Handle asynchronous AI analysis for investor matches."""

    permission_classes = [AllowAny]

    def _score_investor_against_startup(self, investor, startup, include_ai=False):
        """Calculate rule-based score for investor-startup match."""
        rule_score = 0
        reasons = []

        inv_focus = (investor.investment_focus or "").lower()
        startup_sector = (startup.sector or "").lower()

        if startup_sector and startup_sector not in ["string", ""] and inv_focus:
            if startup_sector in inv_focus:
                rule_score += 50
                reasons.append("sector match")
            elif self._is_tech_sector_match(startup_sector, inv_focus):
                rule_score += 40
                reasons.append("tech sector match")
            elif "tech" in inv_focus and startup_sector in [
                "deeptech",
                "fintech",
                "biotech",
                "greentech",
                "healthtech",
            ]:
                rule_score += 35
                reasons.append("technology sector")

        inv_focus_lower = inv_focus
        startup_needs = (startup.needs or "").lower()
        if startup_needs and startup_needs not in ["string", ""] and inv_focus_lower:
            if any(need.strip() and need.strip().lower() in inv_focus_lower for need in startup_needs.split(",")):
                rule_score += 30
                reasons.append("needs match")

        inv_location = (investor.address or "").lower()
        startup_location = (startup.address or "").lower()
        if startup_location and startup_location not in ["string", ""] and inv_location:
            startup_country = startup_location.split()[-1] if startup_location.split() else ""
            if startup_country and startup_country.lower() in inv_location:
                rule_score += 10
                reasons.append("location match")

        inv_type = (investor.investor_type or "").lower()
        startup_maturity = (startup.maturity or "").lower()
        if startup_maturity and startup_maturity not in ["string", ""] and inv_type:
            if startup_maturity in inv_type:
                rule_score += 10
                reasons.append("maturity fit")

        if len(reasons) > 1:
            rule_score += len(reasons) * 5
            reasons.append(f"multiple matches bonus (+{len(reasons) * 5})")

        return rule_score, ", ".join(reasons) if reasons else "no strong signal"

    def _is_tech_sector_match(self, startup_sector, investor_focus):
        """Check for broader tech sector matches"""
        tech_mappings = {
            "deeptech": ["tech", "innovation", "research", "ai", "artificial intelligence"],
            "fintech": ["finance", "financial", "banking", "payment", "blockchain"],
            "biotech": ["health", "medical", "life science", "pharma", "biotechnology"],
            "greentech": ["green", "sustainability", "environment", "clean energy", "renewable"],
            "healthtech": ["health", "medical", "wellness", "fitness", "telemedicine"],
        }

        startup_lower = startup_sector.lower()
        if startup_lower in tech_mappings:
            for keyword in tech_mappings[startup_lower]:
                if keyword in investor_focus:
                    return True
        return False

    def _get_ai_score(self, investor, startup):
        """Use Groq AI to analyze the match and provide a score and reason."""
        try:
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            prompt = f"""
Analyze the compatibility between this investor and startup on a scale of 0-100.

Investor:
- Name: {investor.name}
- Type: {investor.investor_type or 'N/A'}
- Focus: {investor.investment_focus or 'N/A'}
- Description: {investor.description or 'N/A'}
- Location: {investor.address or 'N/A'}

Startup:
- Name: {startup.name}
- Sector: {startup.sector or 'N/A'}
- Maturity: {startup.maturity or 'N/A'}
- Needs: {startup.needs or 'N/A'}
- Description: {startup.description or 'N/A'}
- Location: {startup.address or 'N/A'}

Provide a score (0-100) and a brief reason for the match.
Format: Score: X, Reason: explanation
"""
            response = client.chat.completions.create(
                model="llama3-8b-8192", messages=[{"role": "user", "content": prompt}], max_tokens=150, temperature=0.5
            )
            content = response.choices[0].message.content.strip()
            if "Score:" in content and "Reason:" in content:
                score_part = content.split("Score:")[1].split(",")[0].strip()
                reason_part = content.split("Reason:")[1].strip()
                try:
                    ai_score = int(score_part)
                    return ai_score, reason_part
                except ValueError:
                    pass
            return 50, "AI analysis: Moderate match"
        except Exception as e:
            print(f"AI scoring failed: {e}")
            return 0, "AI unavailable"

    def _run_ai_analysis(self, analysis_id, startup_id):
        """Run AI analysis in background thread."""
        try:
            ai_analysis_status[analysis_id] = {"status": "processing", "progress": 0, "results": []}

            startup = StartupDetail.objects.get(id=int(startup_id))
            investors = Investor.objects.all()

            results = []
            total_investors = len(list(investors))

            for i, inv in enumerate(investors):
                ai_analysis_status[analysis_id]["progress"] = int((i / total_investors) * 100)

                rule_score, rule_reason = self._score_investor_against_startup(inv, startup, include_ai=False)

                ai_score, ai_reason = self._get_ai_score(inv, startup)

                total_score = rule_score
                if ai_score > 0:
                    total_score = int((rule_score + ai_score) / 2)

                final_reason = rule_reason
                if ai_score > 0:
                    final_reason += f", AI: {ai_reason}"

                results.append(
                    {
                        "investor_id": inv.id,
                        "name": inv.name,
                        "score": total_score,
                        "rule_score": rule_score,
                        "ai_score": ai_score,
                        "reason": final_reason,
                        "investor_type": inv.investor_type,
                        "investment_focus": inv.investment_focus,
                        "description": inv.description,
                        "location": inv.address,
                    }
                )

                time.sleep(0.1)

            results.sort(key=lambda x: x["score"], reverse=True)

            results = [match for match in results if match["score"] >= 5]

            ai_analysis_status[analysis_id] = {"status": "completed", "progress": 100, "results": results}

        except Exception as e:
            ai_analysis_status[analysis_id] = {"status": "error", "progress": 0, "error": str(e), "results": []}

    def post(self, request):
        """Start AI analysis for a startup."""
        startup_id = request.data.get("startup_id")
        if not startup_id:
            return Response({"error": "startup_id is required"}, status=400)

        try:
            startup = StartupDetail.objects.get(id=int(startup_id))
        except (StartupDetail.DoesNotExist, ValueError):
            return Response({"error": "startup not found"}, status=400)

        analysis_id = str(uuid.uuid4())

        thread = Thread(target=self._run_ai_analysis, args=(analysis_id, startup_id))
        thread.daemon = True
        thread.start()

        return Response(
            {
                "analysis_id": analysis_id,
                "status": "started",
                "message": "AI analysis started. Use GET /api/opportunities/ai-analysis/{analysis_id}/ to check status.",
            }
        )

    def get(self, request, analysis_id=None):
        """Get AI analysis status or results."""
        if not analysis_id:
            return Response({"error": "analysis_id is required"}, status=400)

        if analysis_id not in ai_analysis_status:
            return Response({"error": "analysis not found"}, status=404)

        status_data = ai_analysis_status[analysis_id]
        return Response(status_data)
