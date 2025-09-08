"""
Search filters for the Survivor project.
These filters allow advanced searching across different entity types.
"""

import django_filters
from django.db.models import Q

from admin_panel.models import Event, Founder, NewsDetail, StartupDetail


class TextSearchFilter(django_filters.CharFilter):
    """
    Custom filter for text search with relevance scoring.

    This filter performs a case-insensitive search across specified fields
    and provides a method for relevance scoring during filtering.
    """

    def __init__(self, *args, **kwargs):
        """Initialize the filter.

        Parameters
        ----------
        *args : tuple
            Positional arguments forwarded to the superclass initializer.
        **kwargs : dict
            Keyword arguments forwarded to the superclass initializer. Recognized key:
            - search_fields (list, optional): list of field names used for searching.
                If present, it is popped from kwargs and assigned to self.search_fields.
                Defaults to an empty list.

        Returns:
        -------
        None
        """
        self.search_fields = kwargs.pop("search_fields", [])
        super().__init__(*args, **kwargs)

    def filter(self, qs, value):
        if not value:
            return qs

        q_objects = Q()

        for field in self.search_fields:
            q_objects |= Q(**{f"{field}__icontains": value})

        return qs.filter(q_objects)


class StartupDetailFilter(django_filters.FilterSet):
    """
    Filter for StartupDetail model.

    Allows filtering by search terms, sector, maturity, and location.
    """

    search = TextSearchFilter(search_fields=["name", "description", "sector", "needs"])
    sector = django_filters.CharFilter(lookup_expr="iexact")
    maturity = django_filters.CharFilter(lookup_expr="iexact")
    location = django_filters.CharFilter(field_name="address", lookup_expr="icontains")

    class Meta:
        model = StartupDetail
        fields = ["search", "sector", "maturity", "location"]


class EventFilter(django_filters.FilterSet):
    """
    Filter for Event model.

    Allows filtering by search terms, event type, and location.
    """

    search = TextSearchFilter(search_fields=["name", "description", "event_type"])
    event_type = django_filters.CharFilter(lookup_expr="iexact")
    location = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Event
        fields = ["search", "event_type", "location"]


class NewsFilter(django_filters.FilterSet):
    """
    Filter for NewsDetail model.

    Allows filtering by search terms, category, and location.
    """

    search = TextSearchFilter(search_fields=["title", "description", "category"])
    category = django_filters.CharFilter(lookup_expr="iexact")
    location = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = NewsDetail
        fields = ["search", "category", "location"]


class FounderFilter(django_filters.FilterSet):
    """
    Filter for Founder model.

    Allows filtering by search terms on founder name.
    """

    search = TextSearchFilter(search_fields=["name"])

    class Meta:
        model = Founder
        fields = ["search"]
