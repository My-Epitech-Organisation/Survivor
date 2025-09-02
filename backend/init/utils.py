##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## utils
##

import os
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
