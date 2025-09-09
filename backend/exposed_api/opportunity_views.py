from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Investor, StartupDetail


class OpportunitiesMatchesView(APIView):
    """Return matching investors for a given startup or filter set.

    Supports:
    - ?startup_id=<id>
    - ?sectors=deeptech,saas&tags=iot&location=France&stage=seed

    Response: {"matches": [{"investor_id": id, "name": str, "score": int, "reason": str}, ...]}
    """

    permission_classes = [AllowAny]

    def _score_investor_against_startup(self, investor, startup):
        score = 0
        reasons = []

        inv_focus = (investor.investment_focus or "").lower()
        startup_sector = (startup.sector or "").lower()

        if startup_sector and startup_sector not in ["string", ""] and inv_focus:
            if startup_sector in inv_focus:
                score += 50
                reasons.append("sector match")
            elif self._is_tech_sector_match(startup_sector, inv_focus):
                score += 40
                reasons.append("tech sector match")
            elif "tech" in inv_focus and startup_sector in [
                "deeptech",
                "fintech",
                "biotech",
                "greentech",
                "healthtech",
            ]:
                score += 35
                reasons.append("technology sector")

        inv_focus_lower = inv_focus
        startup_needs = (startup.needs or "").lower()
        if startup_needs and startup_needs not in ["string", ""] and inv_focus_lower:
            if any(need.strip() and need.strip().lower() in inv_focus_lower for need in startup_needs.split(",")):
                score += 30
                reasons.append("needs match")

        inv_location = (investor.address or "").lower()
        startup_location = (startup.address or "").lower()
        if startup_location and startup_location not in ["string", ""] and inv_location:
            startup_country = startup_location.split()[-1] if startup_location.split() else ""
            if startup_country and startup_country.lower() in inv_location:
                score += 10
                reasons.append("location match")

        inv_type = (investor.investor_type or "").lower()
        startup_maturity = (startup.maturity or "").lower()
        if startup_maturity and startup_maturity not in ["string", ""] and inv_type:
            if startup_maturity in inv_type:
                score += 10
                reasons.append("maturity fit")

        if len(reasons) > 1:
            score += len(reasons) * 5
            reasons.append(f"multiple matches bonus (+{len(reasons) * 5})")

        return score, ", ".join(reasons) if reasons else "no strong signal"

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

    def _score_investor_against_filters(self, investor, filters):
        score = 0
        reasons = []

        sectors = filters.get("sectors")
        if sectors:
            inv_focus = (investor.investment_focus or "").lower()
            if any(s.strip() and s.strip().lower() in inv_focus for s in sectors.split(",")):
                score += 50
                reasons.append("sector match")

        tags = filters.get("tags")
        if tags:
            inv_focus_lower = (investor.investment_focus or "").lower()
            if any(t.strip() and t.strip().lower() in inv_focus_lower for t in tags.split(",")):
                score += 30
                reasons.append("tags match")

        location = filters.get("location")
        if location and investor.address and location.lower() in (investor.address or "").lower():
            score += 10
            reasons.append("location match")

        stage = filters.get("stage")
        if stage and investor.investor_type and stage.lower() in (investor.investor_type or "").lower():
            score += 10
            reasons.append("stage fit")

        if len(reasons) > 1:
            score += len(reasons) * 5
            reasons.append(f"multiple matches bonus (+{len(reasons) * 5})")

        return score, ", ".join(reasons) if reasons else "no strong signal"

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
        if startup_id:
            try:
                startup = StartupDetail.objects.get(id=int(startup_id))
            except (StartupDetail.DoesNotExist, ValueError):
                return Response({"error": "startup not found"}, status=400)

            investors = Investor.objects.all()
            scored = []
            for inv in investors:
                score, reason = self._score_investor_against_startup(inv, startup)
                if score > 0:
                    scored.append(
                        {
                            "investor_id": inv.id,
                            "name": inv.name,
                            "score": score,
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
                            "reason": reason,
                            "investor_type": inv.investor_type,
                            "investment_focus": inv.investment_focus,
                            "description": inv.description,
                            "location": inv.address,
                        }
                    )

            scored.sort(key=lambda x: x["score"], reverse=True)
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
            score, reason = self._score_investor_against_filters(inv, filters)
            if score > 0:
                scored.append({"investor_id": inv.id, "name": inv.name, "score": score, "reason": reason})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return Response({"matches": scored})
