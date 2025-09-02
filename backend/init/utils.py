##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## utils
##

import os
import base64
import requests
from django.core.exceptions import ImproperlyConfigured
from django.apps import apps
from django.conf import settings
from django.core.files.base import ContentFile


def fetch_news_detail(news_id, headers):
    """
    Fetch details for a specific news item and create a NewsDetail object
    """
    NewsDetail = apps.get_model('admin_panel', 'NewsDetail')

    detail_url = settings.JEB_API_NEWS_DETAIL_URL.format(news_id=news_id)
    image_url = settings.JEB_API_NEWS_IMAGE_URL.format(news_id=news_id)

    try:
        detail_response = requests.get(detail_url, headers=headers)
        detail_response.raise_for_status()
        news_detail_data = detail_response.json()

        news_detail = NewsDetail(
            id=news_detail_data.get('id'),
            title=news_detail_data.get('title'),
            news_date=news_detail_data.get('news_date'),
            location=news_detail_data.get('location'),
            category=news_detail_data.get('category'),
            startup_id=news_detail_data.get('startup_id'),
            description=news_detail_data.get('description')
        )

        try:
            image_response = requests.get(image_url, headers=headers)
            if image_response.status_code == 200:
                news_detail.image = image_response.content
        except Exception as e:
            print(f"Error fetching image for news {news_id}: {e}")

        news_detail.save()
        return True
    except Exception as e:
        print(f"Error fetching news details for ID {news_id}: {e}")
        return False

def fetch_and_create_news():
    """
    Fetch news from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get('JEB_API_TOKEN')
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        print("Fetching news data from JEB API...")

        url = settings.JEB_API_NEWS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {
            **settings.JEB_API_HEADERS,
            "X-Group-Authorization": jeb_token
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        news_data = response.json()

        News = apps.get_model('admin_panel', 'News')

        for item in news_data:
            news = News(
                id=item.get('id'),
                title=item.get('title'),
                news_date=item.get('news_date'),
                location=item.get('location'),
                category=item.get('category'),
                startup_id=item.get('startup_id')
            )
            news.save()

            news_id = item.get('id')
            fetch_news_detail(news_id, headers)

    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except requests.RequestException as e:
        print(f"API request error: {e}")
    except Exception as e:
        print(f"Error creating news data: {e}")

def fetch_and_create_events():
    """
    Fetch events from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get('JEB_API_TOKEN')
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        print("Fetching events data from JEB API...")

        url = settings.JEB_API_EVENTS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {
            **settings.JEB_API_HEADERS,
            "X-Group-Authorization": jeb_token
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        events_data = response.json()

        Event = apps.get_model('admin_panel', 'Event')

        for item in events_data:
            event = Event(
                id=item.get('id'),
                name=item.get('name'),
                dates=item.get('dates'),
                location=item.get('location'),
                description=item.get('description'),
                event_type=item.get('event_type'),
                target_audience=item.get('target_audience')
            )

            try:
                event_id = item.get('id')
                image_url = settings.JEB_API_EVENT_IMAGE_URL.format(event_id=event_id)
                image_response = requests.get(image_url, headers=headers)
                if image_response.status_code == 200:
                    event.image = image_response.content
            except Exception as e:
                print(f"Error fetching image for event {item.get('id')}: {e}")

            event.save()

    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except requests.RequestException as e:
        print(f"API request error: {e}")
    except Exception as e:
        print(f"Error creating events data: {e}")

def fetch_startup_detail(startup_id, headers):
    """
    Fetch details for a specific startup and create a StartupDetail object
    """
    StartupDetail = apps.get_model('admin_panel', 'StartupDetail')
    Founder = apps.get_model('admin_panel', 'Founder')

    detail_url = settings.JEB_API_STARTUP_DETAIL_URL.format(startup_id=startup_id)

    try:
        detail_response = requests.get(detail_url, headers=headers)
        detail_response.raise_for_status()
        startup_detail_data = detail_response.json()

        startup_detail = StartupDetail(
            id=startup_detail_data.get('id'),
            name=startup_detail_data.get('name'),
            legal_status=startup_detail_data.get('legal_status'),
            address=startup_detail_data.get('address'),
            email=startup_detail_data.get('email'),
            phone=startup_detail_data.get('phone'),
            created_at=startup_detail_data.get('created_at'),
            description=startup_detail_data.get('description'),
            website_url=startup_detail_data.get('website_url'),
            social_media_url=startup_detail_data.get('social_media_url'),
            project_status=startup_detail_data.get('project_status'),
            needs=startup_detail_data.get('needs'),
            sector=startup_detail_data.get('sector'),
            maturity=startup_detail_data.get('maturity'),
            founders_images={}
        )
        startup_detail.save()

        founders_data = startup_detail_data.get('founders', [])
        founders_images = {}

        if founders_data:
            for founder_data in founders_data:
                founder_id = founder_data.get('id')
                founder_name = founder_data.get('name')

                if founder_id and founder_name:
                    founder = Founder(
                        id=founder_id,
                        name=founder_name,
                        startup_id=startup_id
                    )
                    founder.save()

                startup_detail.founders.add(founder)

                try:
                    image_url = settings.JEB_API_FOUNDER_IMAGE_URL.format(
                        startup_id=startup_id,
                        founder_id=founder_id
                    )
                    image_response = requests.get(image_url, headers=headers)

                    if image_response.status_code == 200:
                        image_base64 = base64.b64encode(image_response.content).decode('utf-8')
                        founders_images[str(founder_id)] = image_base64
                except Exception as e:
                    print(f"Error fetching image for founder {founder_id}: {e}")

            if founders_images:
                startup_detail.founders_images = founders_images
                startup_detail.save()

        return startup_detail
    except Exception as e:
        print(f"Error fetching startup details for ID {startup_id}: {e}")
        return None


def fetch_and_create_startups():
    """
    Fetch startups from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get('JEB_API_TOKEN')
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        print("Fetching startups data from JEB API...")

        url = settings.JEB_API_STARTUPS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {
            **settings.JEB_API_HEADERS,
            "X-Group-Authorization": jeb_token
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        startups_data = response.json()

        StartupList = apps.get_model('admin_panel', 'StartupList')

        for item in startups_data:
            startup = StartupList(
                id=item.get('id'),
                name=item.get('name'),
                legal_status=item.get('legal_status'),
                address=item.get('address'),
                email=item.get('email'),
                phone=item.get('phone'),
                sector=item.get('sector'),
                maturity=item.get('maturity')
            )
            startup.save()

            startup_id = item.get('id')
            fetch_startup_detail(startup_id, headers)

    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except requests.RequestException as e:
        print(f"API request error: {e}")
    except Exception as e:
        print(f"Error creating startups data: {e}")

def fetch_and_create_users():
    """
    Fetch users from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get('JEB_API_TOKEN')
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        print("Fetching users data from JEB API...")

        url = settings.JEB_API_USERS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {
            **settings.JEB_API_HEADERS,
            "X-Group-Authorization": jeb_token
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        users_data = response.json()

        User = apps.get_model('admin_panel', 'User')

        for item in users_data:
            user = User(
                id=item.get('id'),
                email=item.get('email'),
                name=item.get('name'),
                role=item.get('role'),
                founder_id=item.get('founder_id'),
                investor_id=item.get('investor_id')
            )

            try:
                user_id = item.get('id')
                image_url = settings.JEB_API_USER_IMAGE_URL.format(user_id=user_id)
                image_response = requests.get(image_url, headers=headers)
                if image_response.status_code == 200:
                    user.image = image_response.content
            except Exception as e:
                print(f"Error fetching image for user {item.get('id')}: {e}")

            user.save()

    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except requests.RequestException as e:
        print(f"API request error: {e}")
    except Exception as e:
        print(f"Error creating users data: {e}")

def fetch_and_create_investors():
    """
    Fetch investors from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get('JEB_API_TOKEN')
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        print("Fetching investors data from JEB API...")

        url = settings.JEB_API_INVESTORS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {
            **settings.JEB_API_HEADERS,
            "X-Group-Authorization": jeb_token
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        investors_data = response.json()

        Investor = apps.get_model('admin_panel', 'Investor')

        for item in investors_data:
            investor = Investor(
                id=item.get('id'),
                name=item.get('name'),
                legal_status=item.get('legal_status'),
                address=item.get('address'),
                email=item.get('email'),
                phone=item.get('phone'),
                created_at=item.get('created_at'),
                description=item.get('description'),
                investor_type=item.get('investor_type'),
                investment_focus=item.get('investment_focus')
            )
            investor.save()

    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except requests.RequestException as e:
        print(f"API request error: {e}")
    except Exception as e:
        print(f"Error creating investors data: {e}")

def fetch_and_create_partners():
    """
    Fetch partners from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get('JEB_API_TOKEN')
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        print("Fetching partners data from JEB API...")

        url = settings.JEB_API_PARTNERS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {
            **settings.JEB_API_HEADERS,
            "X-Group-Authorization": jeb_token
        }

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        partners_data = response.json()

        Partner = apps.get_model('admin_panel', 'Partner')

        for item in partners_data:
            partner = Partner(
                id=item.get('id'),
                name=item.get('name'),
                legal_status=item.get('legal_status'),
                address=item.get('address'),
                email=item.get('email'),
                phone=item.get('phone'),
                created_at=item.get('created_at'),
                description=item.get('description'),
                partnership_type=item.get('partnership_type')
            )
            partner.save()

    except ImproperlyConfigured as e:
        print(f"Configuration error: {e}")
    except requests.RequestException as e:
        print(f"API request error: {e}")
    except Exception as e:
        print(f"Error creating partners data: {e}")
