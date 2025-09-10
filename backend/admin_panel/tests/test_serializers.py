from django.test import TestCase
from rest_framework.test import APITestCase

from admin_panel.models import Event, Founder, NewsDetail, Partner, StartupDetail
from admin_panel.serializers import (
    EventSerializer,
    FounderSerializer,
    NewsDetailSerializer,
    PartnerSerializer,
    StartupDetailSerializer,
)


class NewsDetailSerializerTest(TestCase):
    def setUp(self):
        self.news = NewsDetail.objects.create(
            id=1,
            title="Test News",
            news_date="2023-01-01",
            location="Test Location",
            category="Test Category",
            startup_id=1,
            description="Test description",
            image="test.jpg",
        )

    def test_news_detail_serialization(self):
        """Test NewsDetail serialization"""
        serializer = NewsDetailSerializer(self.news)
        data = serializer.data
        self.assertEqual(data["title"], "Test News")
        self.assertEqual(data["category"], "Test Category")


class EventSerializerTest(TestCase):
    def setUp(self):
        self.event = Event.objects.create(
            id=1,
            name="Test Event",
            dates="2023-01-01",
            location="Test Location",
            description="Test description",
            event_type="Conference",
            target_audience="Entrepreneurs",
            image="event.jpg",
        )

    def test_event_serialization(self):
        """Test Event serialization"""
        serializer = EventSerializer(self.event)
        data = serializer.data
        self.assertEqual(data["name"], "Test Event")
        self.assertEqual(data["event_type"], "Conference")


class FounderSerializerTest(TestCase):
    def setUp(self):
        self.founder = Founder.objects.create(id=1, name="John Doe", startup_id=1)

    def test_founder_serialization(self):
        """Test Founder serialization"""
        serializer = FounderSerializer(self.founder)
        data = serializer.data
        self.assertEqual(data["name"], "John Doe")
        self.assertEqual(data["id"], 1)


class StartupDetailSerializerTest(TestCase):
    def setUp(self):
        self.startup = StartupDetail.objects.create(
            id=1,
            name="Test Startup",
            legal_status="SARL",
            address="Test Address",
            email="test@example.com",
            phone="123456789",
            created_at="2023-01-01",
            description="Test startup",
            website_url="http://test.com",
            social_media_url="http://fb.com/test",
            project_status="Active",
            needs="Funding",
            sector="Tech",
            maturity="Early",
        )
        self.founder = Founder.objects.create(id=1, name="John Doe", startup_id=1)
        self.startup.founders.add(self.founder)

    def test_startup_detail_serialization(self):
        """Test StartupDetail serialization"""
        serializer = StartupDetailSerializer(self.startup)
        data = serializer.data
        self.assertEqual(data["name"], "Test Startup")
        self.assertEqual(data["sector"], "Tech")
        self.assertEqual(len(data["founders"]), 1)


class PartnerSerializerTest(TestCase):
    def setUp(self):
        self.partner = Partner.objects.create(
            id=1,
            name="Test Partner",
            legal_status="Association",
            address="Test Address",
            email="partner@example.com",
            phone="123456789",
            created_at="2023-01-01",
            description="Test partner",
            partnership_type="Strategic",
        )

    def test_partner_serialization(self):
        """Test Partner serialization"""
        serializer = PartnerSerializer(self.partner)
        data = serializer.data
        self.assertEqual(data["name"], "Test Partner")
        self.assertEqual(data["partnership_type"], "Strategic")
