from django.test import TestCase

from admin_panel.models import Event, Founder, Investor, NewsDetail, Partner, StartupDetail


class SimpleTestCase(TestCase):
    def test_models_exist(self):
        """Simple test to verify models can be imported"""
        assert NewsDetail is not None
        assert Event is not None
        assert StartupDetail is not None
        assert Founder is not None
        assert Investor is not None
        assert Partner is not None


class NewsDetailModelTest(TestCase):
    def test_create_news_detail(self):
        """Test creating a NewsDetail instance"""
        news = NewsDetail.objects.create(
            id=1,
            title="Test News",
            news_date="2023-01-01",
            location="Test Location",
            category="Test Category",
            startup_id=1,
            description="Test description",
            image="test.jpg",
        )
        self.assertEqual(news.title, "Test News")
        self.assertEqual(str(news), f"NewsDetail {news.id}")  # Assuming __str__ method or default


class EventModelTest(TestCase):
    def test_create_event(self):
        """Test creating an Event instance"""
        event = Event.objects.create(
            id=1,
            name="Test Event",
            dates="2023-01-01",
            location="Test Location",
            description="Test description",
            event_type="Conference",
            target_audience="Entrepreneurs",
            image="event.jpg",
        )
        self.assertEqual(event.name, "Test Event")


class StartupDetailModelTest(TestCase):
    def test_create_startup_detail(self):
        """Test creating a StartupDetail instance"""
        startup = StartupDetail.objects.create(
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
        self.assertEqual(startup.name, "Test Startup")


class FounderModelTest(TestCase):
    def test_create_founder(self):
        """Test creating a Founder instance"""
        founder = Founder.objects.create(id=1, name="John Doe", startup_id=1)
        self.assertEqual(founder.name, "John Doe")


class InvestorModelTest(TestCase):
    def test_create_investor(self):
        """Test creating an Investor instance"""
        investor = Investor.objects.create(
            id=1,
            name="Test Investor",
            legal_status="SA",
            address="Test Address",
            email="investor@example.com",
            phone="123456789",
            created_at="2023-01-01",
            description="Test investor",
            investor_type="VC",
            investment_focus="Tech",
        )
        self.assertEqual(investor.name, "Test Investor")


class PartnerModelTest(TestCase):
    def test_create_partner(self):
        """Test creating a Partner instance"""
        partner = Partner.objects.create(
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
        self.assertEqual(partner.name, "Test Partner")
