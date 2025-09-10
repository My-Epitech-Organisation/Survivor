##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## utils
##

import base64
import logging
import os
import time

import requests
from django.apps import apps
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files.base import ContentFile


def fetch_with_retry(url, headers=None, params=None, max_retries=3, retry_delay=0.5, allow_404=False):
    """
    Make a GET request with retry logic

    Args:
        url (str): URL to fetch
        headers (dict, optional): Request headers. Defaults to None.
        params (dict, optional): Request parameters. Defaults to None.
        max_retries (int, optional): Maximum number of retry attempts. Defaults to 3.
        retry_delay (float, optional): Delay between retries in seconds. Defaults to 0.5.
        allow_404 (bool, optional): If True, return None for 404 responses instead of raising. Defaults to False.

    Returns:
        requests.Response: The response object if successful, or None if allow_404=True and a 404 is encountered

    Raises:
        requests.RequestException: If all retry attempts fail
    """
    retries = 0
    last_exception = None

    while retries < max_retries:
        try:
            response = requests.get(url, headers=headers, params=params)

            if allow_404 and response.status_code == 404:
                return None

            response.raise_for_status()
            return response
        except requests.RequestException as e:
            last_exception = e
            retries += 1
            if retries < max_retries:
                if not (allow_404 and hasattr(e, "response") and e.response.status_code == 404):
                    logging.warning(f"Request failed for {url}, retrying ({retries}/{max_retries})...")
                time.sleep(retry_delay)

    if not (allow_404 and hasattr(last_exception, "response") and last_exception.response.status_code == 404):
        logging.error(f"All {max_retries} retry attempts failed for {url}")

    if allow_404 and hasattr(last_exception, "response") and last_exception.response.status_code == 404:
        return None

    raise last_exception


def fetch_news_detail(news_id, headers):
    """
    Fetch details for a specific news item and create a NewsDetail object
    """
    NewsDetail = apps.get_model("admin_panel", "NewsDetail")
    detail_url = settings.JEB_API_NEWS_DETAIL_URL.format(news_id=news_id)
    image_url = settings.JEB_API_NEWS_IMAGE_URL.format(news_id=news_id)

    try:
        detail_response = fetch_with_retry(detail_url, headers=headers)
        news_detail_data = detail_response.json()

        news_detail = NewsDetail(
            id=news_detail_data.get("id"),
            title=news_detail_data.get("title"),
            news_date=news_detail_data.get("news_date"),
            location=news_detail_data.get("location"),
            category=news_detail_data.get("category"),
            startup_id=news_detail_data.get("startup_id"),
            description=news_detail_data.get("description"),
        )

        try:
            image_response = fetch_with_retry(image_url, headers=headers, allow_404=True)

            if image_response:
                image_path = f"media/news/{news_id}.jpg"
                os.makedirs(os.path.dirname(image_path), exist_ok=True)

                with open(image_path, "wb") as f:
                    f.write(image_response.content)

                news_detail.image = f"news/{news_id}.jpg"
        except Exception as e:
            logging.error(f"Error fetching news image for ID {news_id}: {e}")

        news_detail.save()
        return True
    except requests.RequestException as e:
        logging.error(f"Error fetching news details for ID {news_id}: {e}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error processing news details for ID {news_id}: {e}")
        return False


def fetch_and_create_news():
    """
    Fetch news from JEB API and create them in database using NewsDetail model
    """
    try:
        jeb_token = os.environ.get("JEB_API_TOKEN")
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        url = settings.JEB_API_NEWS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {**settings.JEB_API_HEADERS, "X-Group-Authorization": jeb_token}

        print("\tFetching news from JEB API...")
        response = fetch_with_retry(url, params=params, headers=headers)
        news_data = response.json()

        for item in news_data:
            news_id = item.get("id")
            fetch_news_detail(news_id, headers)

    except ImproperlyConfigured as e:
        logging.error(f"Configuration error: {e}")
    except requests.RequestException as e:
        logging.error(f"API request error: {e}")
    except Exception as e:
        logging.error(f"Error creating news data: {e}")


def fetch_and_create_events():
    """
    Fetch events from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get("JEB_API_TOKEN")
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        url = settings.JEB_API_EVENTS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {**settings.JEB_API_HEADERS, "X-Group-Authorization": jeb_token}

        print("\tFetching events from JEB API...")
        response = fetch_with_retry(url, params=params, headers=headers)
        events_data = response.json()

        Event = apps.get_model("admin_panel", "Event")

        for item in events_data:
            event = Event(
                id=item.get("id"),
                name=item.get("name"),
                dates=item.get("dates"),
                location=item.get("location"),
                description=item.get("description"),
                event_type=item.get("event_type"),
                target_audience=item.get("target_audience"),
            )

            try:
                event_id = item.get("id")
                image_url = settings.JEB_API_EVENT_IMAGE_URL.format(event_id=event_id)
                image_response = fetch_with_retry(image_url, headers=headers, allow_404=True)

                if image_response:
                    image_path = f"media/events/{event_id}.jpg"
                    os.makedirs(os.path.dirname(image_path), exist_ok=True)

                    with open(image_path, "wb") as f:
                        f.write(image_response.content)

                    event.image = f"events/{event_id}.jpg"
            except Exception as e:
                logging.error(f"Error fetching event image for {event_id}: {e}")

            event.save()

    except ImproperlyConfigured as e:
        logging.error(f"Configuration error: {e}")
    except requests.RequestException as e:
        logging.error(f"API request error: {e}")
    except Exception as e:
        logging.error(f"Error creating events data: {e}")


def fetch_startup_detail(startup_id, headers):
    """
    Fetch details for a specific startup and create a StartupDetail object
    """
    StartupDetail = apps.get_model("admin_panel", "StartupDetail")
    Founder = apps.get_model("admin_panel", "Founder")

    detail_url = settings.JEB_API_STARTUP_DETAIL_URL.format(startup_id=startup_id)

    try:
        detail_response = fetch_with_retry(detail_url, headers=headers)
        startup_detail_data = detail_response.json()

        try:
            startup_detail = StartupDetail.objects.get(id=startup_detail_data.get("id"))
            startup_detail.name = startup_detail_data.get("name")
            startup_detail.legal_status = startup_detail_data.get("legal_status")
            startup_detail.address = startup_detail_data.get("address")
            startup_detail.email = startup_detail_data.get("email")
            startup_detail.phone = startup_detail_data.get("phone")
            startup_detail.created_at = startup_detail_data.get("created_at")
            startup_detail.description = startup_detail_data.get("description")
            startup_detail.website_url = startup_detail_data.get("website_url")
            startup_detail.social_media_url = startup_detail_data.get("social_media_url")
            startup_detail.project_status = startup_detail_data.get("project_status")
            startup_detail.needs = startup_detail_data.get("needs")
            startup_detail.sector = startup_detail_data.get("sector")
            startup_detail.maturity = startup_detail_data.get("maturity")
            startup_detail.founders_images = {}
        except StartupDetail.DoesNotExist:
            startup_detail = StartupDetail(
                id=startup_detail_data.get("id"),
                name=startup_detail_data.get("name"),
                legal_status=startup_detail_data.get("legal_status"),
                address=startup_detail_data.get("address"),
                email=startup_detail_data.get("email"),
                phone=startup_detail_data.get("phone"),
                created_at=startup_detail_data.get("created_at"),
                description=startup_detail_data.get("description"),
                website_url=startup_detail_data.get("website_url"),
                social_media_url=startup_detail_data.get("social_media_url"),
                project_status=startup_detail_data.get("project_status"),
                needs=startup_detail_data.get("needs"),
                sector=startup_detail_data.get("sector"),
                maturity=startup_detail_data.get("maturity"),
                founders_images={},
            )

        startup_detail.save()
        startup_detail.founders.clear()

        founders_data = startup_detail_data.get("founders", [])
        founders_images = {}

        if founders_data:
            for founder_data in founders_data:
                founder_id = founder_data.get("id")
                founder_name = founder_data.get("name")

                if not founder_id:
                    logging.warning(f"Missing founder ID for startup {startup_id}, skipping this founder")
                    continue

                if not founder_name:
                    founder_name = f"Unnamed Founder {founder_id}"
                    logging.warning(f"Missing founder name for ID {founder_id}, using default: {founder_name}")

                try:
                    founder, _ = Founder.objects.get_or_create(
                        id=founder_id, defaults={"name": founder_name, "startup_id": startup_id}
                    )

                    founder.name = founder_name
                    founder.startup_id = startup_id
                    founder.save()

                    if not startup_detail.founders.filter(id=founder_id).exists():
                        startup_detail.founders.add(founder)

                except Exception as e:
                    logging.error(f"Error creating/updating founder {founder_id} for startup {startup_id}: {e}")
                    continue

                try:
                    image_url = settings.JEB_API_FOUNDER_IMAGE_URL.format(startup_id=startup_id, founder_id=founder_id)
                    image_response = fetch_with_retry(image_url, headers=headers, allow_404=True)

                    if image_response:
                        image_path = f"media/founders/{startup_id}_{founder_id}.jpg"
                        os.makedirs(os.path.dirname(image_path), exist_ok=True)

                        with open(image_path, "wb") as f:
                            f.write(image_response.content)

                        founders_images[str(founder_id)] = f"founders/{startup_id}_{founder_id}.jpg"
                except Exception as e:
                    logging.error(f"Error fetching founder image for {founder_id}: {e}")

            startup_detail.founders_images = founders_images
            startup_detail.save()

        return startup_detail
    except requests.RequestException as e:
        logging.error(f"Error fetching startup details for ID {startup_id}: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error processing startup details for ID {startup_id}: {e}")
        return None


def fetch_and_create_startups():
    """
    Fetch startups from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get("JEB_API_TOKEN")
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        url = settings.JEB_API_STARTUPS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {**settings.JEB_API_HEADERS, "X-Group-Authorization": jeb_token}

        print("\tFetching startups from JEB API...")
        response = fetch_with_retry(url, params=params, headers=headers)
        startups_data = response.json()

        for item in startups_data:
            startup_id = item.get("id")
            fetch_startup_detail(startup_id, headers)

    except ImproperlyConfigured as e:
        logging.error(f"Configuration error: {e}")
    except requests.RequestException as e:
        logging.error(f"API request error: {e}")
    except Exception as e:
        logging.error(f"Error creating startups data: {e}")


def fetch_and_create_users():
    """
    Fetch users from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get("JEB_API_TOKEN")
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        url = settings.JEB_API_USERS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {**settings.JEB_API_HEADERS, "X-Group-Authorization": jeb_token}

        print("\tFetching users from JEB API...")
        response = fetch_with_retry(url, params=params, headers=headers)
        users_data = response.json()

        User = apps.get_model("authentication", "CustomUser")

        from django.utils import timezone

        for item in users_data:
            user = User(
                id=item.get("id"),
                email=item.get("email"),
                name=item.get("name"),
                role=item.get("role"),
                founder_id=item.get("founder_id"),
                investor_id=item.get("investor_id"),
                date_joined=timezone.now(),
            )

            try:
                user_id = item.get("id")
                image_url = settings.JEB_API_USER_IMAGE_URL.format(user_id=user_id)
                image_response = fetch_with_retry(image_url, headers=headers, allow_404=True)

                if image_response:
                    image_path = f"media/users/{user_id}.jpg"
                    os.makedirs(os.path.dirname(image_path), exist_ok=True)
                    with open(image_path, "wb") as f:
                        f.write(image_response.content)
                    user.image = f"users/{user_id}.jpg"
            except Exception as e:
                logging.error(f"Error fetching image for user {item.get('id')}: {e}")

            user.save()

    except ImproperlyConfigured as e:
        logging.error(f"Configuration error: {e}")
    except requests.RequestException as e:
        logging.error(f"API request error: {e}")
    except Exception as e:
        logging.error(f"Error creating users data: {e}")


def fetch_and_create_investors():
    """
    Fetch investors from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get("JEB_API_TOKEN")
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        url = settings.JEB_API_INVESTORS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {**settings.JEB_API_HEADERS, "X-Group-Authorization": jeb_token}

        print("\tFetching investors from JEB API...")
        response = fetch_with_retry(url, params=params, headers=headers)
        investors_data = response.json()

        Investor = apps.get_model("admin_panel", "Investor")

        for item in investors_data:
            investor = Investor(
                id=item.get("id"),
                name=item.get("name"),
                legal_status=item.get("legal_status"),
                address=item.get("address"),
                email=item.get("email"),
                phone=item.get("phone"),
                created_at=item.get("created_at"),
                description=item.get("description"),
                investor_type=item.get("investor_type"),
                investment_focus=item.get("investment_focus"),
            )
            investor.save()

    except ImproperlyConfigured as e:
        logging.error(f"Configuration error: {e}")
    except requests.RequestException as e:
        logging.error(f"API request error: {e}")
    except Exception as e:
        logging.error(f"Error creating investors data: {e}")


def fetch_and_create_partners():
    """
    Fetch partners from JEB API and create them in database
    """
    try:
        jeb_token = os.environ.get("JEB_API_TOKEN")
        if not jeb_token:
            raise ImproperlyConfigured("JEB_API_TOKEN environment variable is required")

        url = settings.JEB_API_PARTNERS_URL
        params = settings.JEB_API_DEFAULT_PARAMS
        headers = {**settings.JEB_API_HEADERS, "X-Group-Authorization": jeb_token}

        print("\tFetching partners from JEB API...")
        response = fetch_with_retry(url, params=params, headers=headers)
        partners_data = response.json()

        Partner = apps.get_model("admin_panel", "Partner")

        for item in partners_data:
            partner = Partner(
                id=item.get("id"),
                name=item.get("name"),
                legal_status=item.get("legal_status"),
                address=item.get("address"),
                email=item.get("email"),
                phone=item.get("phone"),
                created_at=item.get("created_at"),
                description=item.get("description"),
                partnership_type=item.get("partnership_type"),
            )
            partner.save()

    except ImproperlyConfigured as e:
        logging.error(f"Configuration error: {e}")
    except requests.RequestException as e:
        logging.error(f"API request error: {e}")
    except Exception as e:
        logging.error(f"Error creating partners data: {e}")
