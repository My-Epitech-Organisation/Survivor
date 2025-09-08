"""
Tests for the advanced search functionality.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from admin_panel.models import StartupDetail, Event, NewsDetail, Founder
from authentication.models import CustomUser


class AdvancedSearchTests(TestCase):
    """Test suite for the advanced search functionality."""
    
    def setUp(self):
        """Set up test data for each test."""
        self.client = APIClient()
        
        # Create a test user and authenticate
        self.test_user = CustomUser.objects.create_user(
            email='test@example.com',
            password='test_password',
            name='Test User',
            role='admin'  # Use admin role to ensure full access
        )
        
        # Get JWT token for the test user
        refresh = RefreshToken.for_user(self.test_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Create test projects
        self.ai_project = StartupDetail.objects.create(
            id=101,  # Use high IDs to avoid conflicts
            name="AI Innovation Platform",
            description="A platform leveraging artificial intelligence for business solutions",
            sector="Tech",
            maturity="Early stage",
            address="Paris"
        )
        
        self.bio_project = StartupDetail.objects.create(
            id=102,  # Use high IDs to avoid conflicts
            name="BioTech Solutions",
            description="Biotechnology solutions for healthcare",
            sector="Healthcare",
            maturity="Growth",
            address="Lyon"
        )
        
        # Create test founders
        self.founder1 = Founder.objects.create(
            id=101,  # Use high IDs to avoid conflicts
            name="John AI Expert",
            startup_id=101
        )
        self.ai_project.founders.add(self.founder1)
        
        self.founder2 = Founder.objects.create(
            id=102,  # Use high IDs to avoid conflicts
            name="Jane BioTech",
            startup_id=102
        )
        self.bio_project.founders.add(self.founder2)
        
        # Create test events
        Event.objects.create(
            id=101,  # Use high IDs to avoid conflicts
            name="AI Conference 2025",
            description="Conference about artificial intelligence innovations",
            event_type="Conference",
            location="Paris"
        )
        
        Event.objects.create(
            id=102,  # Use high IDs to avoid conflicts
            name="BioTech Meetup",
            description="Networking event for biotech professionals",
            event_type="Meetup",
            location="Lyon"
        )
        
        # Create test news
        NewsDetail.objects.create(
            id=101,  # Use high IDs to avoid conflicts
            title="AI Breakthrough in 2025",
            description="Major breakthrough in artificial intelligence research",
            category="Tech",
            location="Paris"
        )
        
        NewsDetail.objects.create(
            id=102,  # Use high IDs to avoid conflicts
            title="BioTech Industry Growth",
            description="The biotech industry shows significant growth this year",
            category="Healthcare",
            location="Lyon"
        )
    
    def test_search_without_parameters(self):
        """Test search endpoint with no parameters returns all results."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include at least our test objects
        self.assertGreaterEqual(len(response.data['results']), 6)
    
    def test_search_by_keyword(self):
        """Test search by keyword across all entity types."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'search': 'artificial intelligence'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include our AI-related test objects
        ai_results = [result for result in response.data['results'] 
                     if 'AI' in result['title'] or 'artificial intelligence' in result['description'].lower()]
        self.assertGreaterEqual(len(ai_results), 2)
        
        # Check if our test project is in the results
        ai_project_in_results = any(
            result['title'] == 'AI Innovation Platform' and result['type'] == 'project' 
            for result in response.data['results']
        )
        self.assertTrue(ai_project_in_results)
    
    def test_filter_by_type(self):
        """Test filtering results by entity type."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'search': 'tech', 'type': 'project'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return projects matching 'tech'
        self.assertTrue(all(result['type'] == 'project' for result in response.data['results']))
    
    def test_filter_by_sector(self):
        """Test filtering projects by sector."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'sector': 'Healthcare', 'type': 'project'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'BioTech Solutions')
    
    def test_filter_by_location(self):
        """Test filtering by location across all entity types."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'location': 'Paris'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include our Paris-located test objects
        paris_results = [result for result in response.data['results'] 
                        if result['id'] in [101, 102] or 'Paris' in str(result['entity'])]
        self.assertGreaterEqual(len(paris_results), 2)
    
    def test_combined_filters(self):
        """Test combining multiple filters."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {
            'search': 'biotech', 
            'sector': 'Healthcare', 
            'location': 'Lyon'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if our BioTech project is in the results
        biotech_in_lyon = any(
            result['title'] == 'BioTech Solutions' and result['type'] == 'project' 
            for result in response.data['results']
        )
        self.assertTrue(biotech_in_lyon)
    
    def test_search_by_founder(self):
        """Test search that includes founder information."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'search': 'John AI'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return the AI project due to founder match
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'AI Innovation Platform')
    
    def test_pagination(self):
        """Test pagination of search results."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'page_size': 2})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return only 2 results
        self.assertEqual(len(response.data['results']), 2)
        # Should have next page link
        self.assertIsNotNone(response.data['next'])
    
    def test_max_page_size(self):
        """Test maximum page size enforcement."""
        url = reverse('exposed_api:advanced_search')
        response = self.client.get(url, {'page_size': 100})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should respect max page size (50)
        self.assertTrue(len(response.data['results']) <= 50)
