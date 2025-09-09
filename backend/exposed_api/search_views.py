"""
Advanced search views for the Survivor project.
These views provide the API endpoints for searching across different entity types.
"""

import re

from django.db.models import Q
from drf_spectacular.utils import OpenApiExample, OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import status, views
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from admin_panel.models import Event, Founder, NewsDetail, StartupDetail

from .search_filters import EventFilter, FounderFilter, NewsFilter, StartupDetailFilter
from .search_serializers import (
    EventSearchResultSerializer,
    FounderSearchSerializer,
    NewsSearchResultSerializer,
    SearchResultSerializer,
    StartupSearchResultSerializer,
)


class CustomSearchPagination(PageNumberPagination):
    """
    Custom pagination class for search results.

    Enforces a maximum page size to ensure API performance.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class AdvancedSearchView(views.APIView):
    """
    Advanced search view combining filters with text search.

    This view provides a unified search endpoint that returns results from
    different entity types (projects, events, news) with relevance scoring
    and consistent pagination.
    """

    permission_classes = [AllowAny]
    pagination_class = CustomSearchPagination

    def get_bm25_score(self, obj, search_term, fields):
        """
        Calculate a simplified BM25-like relevance score.

        Args:
            obj: The object to score
            search_term: The search term to score against
            fields: List of field names to consider for scoring

        Returns:
            float: The calculated relevance score
        """
        if not search_term:
            return 0.0

        score = 0.0
        search_terms = search_term.lower().split()

        field_weights = {
            "name": 2.0,
            "title": 2.0,
            "description": 1.0,
            "sector": 1.5,
            "needs": 1.0,
            "event_type": 1.5,
            "category": 1.5,
        }

        for field_name in fields:
            if not hasattr(obj, field_name):
                continue

            field_value = getattr(obj, field_name)
            if not field_value or not isinstance(field_value, str):
                continue

            field_text = field_value.lower()
            field_weight = field_weights.get(field_name, 1.0)

            for term in search_terms:
                if re.search(r"\b" + re.escape(term) + r"\b", field_text):
                    score += 2.0 * field_weight
                elif term in field_text:
                    score += 1.0 * field_weight

        return score

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="search", description="Global search term to find across all entities", required=False, type=str
            ),
            OpenApiParameter(name="sector", description="Filter projects by sector", required=False, type=str),
            OpenApiParameter(
                name="maturity", description="Filter projects by maturity level", required=False, type=str
            ),
            OpenApiParameter(
                name="location", description="Filter by location (address or city)", required=False, type=str
            ),
            OpenApiParameter(
                name="type",
                description="Filter by result type (project, event, news)",
                required=False,
                type=str,
                enum=["project", "event", "news"],
            ),
            OpenApiParameter(name="page", description="Page number for pagination", required=False, type=int),
            OpenApiParameter(
                name="page_size", description="Number of results per page (max 50)", required=False, type=int
            ),
        ],
        examples=[
            OpenApiExample(
                name="ai-projects",
                value={"search": "artificial intelligence", "sector": "tech", "page": 1, "page_size": 10},
            ),
            OpenApiExample(name="paris-events", value={"search": "pitch", "location": "Paris", "type": "event"}),
        ],
        responses={
            200: OpenApiResponse(
                response=SearchResultSerializer(many=True),
                description="Combined search results with relevance scoring",
            )
        },
        description="""
        Advanced search endpoint that combines filters with text search across
        different entity types (projects, events, news).

        Results are scored based on relevance to the search term and sorted
        by score (descending) and then title for deterministic ordering.

        Results are paginated with a maximum page size of 50 items.
        """,
    )
    def get(self, request):
        """
        Handle GET requests for the advanced search endpoint.

        Processes search parameters, applies filters, calculates relevance scores,
        and returns paginated normalized results.
        """
        search_term = request.query_params.get("search", "")
        result_type = request.query_params.get("type", None)

        all_results = []

        if not result_type or result_type == "project":
            project_filter = StartupDetailFilter(
                request.query_params, queryset=StartupDetail.objects.all().prefetch_related("founders")
            )
            filtered_projects = project_filter.qs

            for project in filtered_projects:
                score = self.get_bm25_score(project, search_term, ["name", "description", "sector", "needs"])
                if score > 0 or not search_term:
                    serialized_project = StartupSearchResultSerializer(project).data
                    all_results.append(
                        {
                            "id": project.id,
                            "title": project.name,
                            "description": project.description or "",
                            "type": "project",
                            "score": score,
                            "entity": serialized_project,
                        }
                    )

        if not result_type or result_type == "event":
            event_filter = EventFilter(request.query_params, queryset=Event.objects.all())
            filtered_events = event_filter.qs

            for event in filtered_events:
                score = self.get_bm25_score(event, search_term, ["name", "description", "event_type", "location"])
                if score > 0 or not search_term:
                    serialized_event = EventSearchResultSerializer(event).data
                    all_results.append(
                        {
                            "id": event.id,
                            "title": event.name,
                            "description": event.description or "",
                            "type": "event",
                            "score": score,
                            "entity": serialized_event,
                        }
                    )

        if not result_type or result_type == "news":
            news_filter = NewsFilter(request.query_params, queryset=NewsDetail.objects.all())
            filtered_news = news_filter.qs

            for news in filtered_news:
                score = self.get_bm25_score(news, search_term, ["title", "description", "category", "location"])
                if score > 0 or not search_term:
                    serialized_news = NewsSearchResultSerializer(news).data
                    all_results.append(
                        {
                            "id": news.id,
                            "title": news.title,
                            "description": news.description or "",
                            "type": "news",
                            "score": score,
                            "entity": serialized_news,
                        }
                    )

        if (not result_type or result_type == "project") and search_term:
            founder_filter = FounderFilter(
                {"search": search_term}, queryset=Founder.objects.all().prefetch_related("startups")
            )
            filtered_founders = founder_filter.qs

            for founder in filtered_founders:
                for startup in founder.startups.all():
                    score = self.get_bm25_score(startup, search_term, ["name", "description", "sector"])
                    founder_match_score = 2.0
                    total_score = score + founder_match_score

                    existing_entry = next(
                        (item for item in all_results if item["type"] == "project" and item["id"] == startup.id), None
                    )

                    if existing_entry:
                        existing_entry["score"] = max(existing_entry["score"], total_score)
                    else:
                        serialized_project = StartupSearchResultSerializer(startup).data
                        all_results.append(
                            {
                                "id": startup.id,
                                "title": startup.name,
                                "description": startup.description or "",
                                "type": "project",
                                "score": total_score,
                                "entity": serialized_project,
                            }
                        )

        sorted_results = sorted(all_results, key=lambda x: (-x["score"], x.get("title", "")))

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(sorted_results, request)

        if page is not None:
            return paginator.get_paginated_response(page)

        return Response(sorted_results)
