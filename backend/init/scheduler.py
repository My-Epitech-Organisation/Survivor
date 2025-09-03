"""
Scheduler module for running periodic tasks to fetch and update data from JEB API.
"""

import atexit
import logging
import threading

from apscheduler.schedulers.background import BackgroundScheduler
from django.conf import settings

from .utils import (
    fetch_and_create_events,
    fetch_and_create_investors,
    fetch_and_create_news,
    fetch_and_create_partners,
    fetch_and_create_startups,
    fetch_and_create_users,
)

logger = logging.getLogger(__name__)
scheduler = None


def fetch_all_data():
    """
    Fetch all data from JEB API using the fetch_and_create methods
    """
    logger.info("=== API Data Sync Job Started ===")

    try:
        fetch_and_create_news()
    except Exception as e:
        logger.error(f"Error fetching news data: {e}")

    try:
        fetch_and_create_events()
    except Exception as e:
        logger.error(f"Error fetching events data: {e}")

    try:
        fetch_and_create_startups()
    except Exception as e:
        logger.error(f"Error fetching startups data: {e}")

    try:
        fetch_and_create_users()
    except Exception as e:
        logger.error(f"Error fetching users data: {e}")

    try:
        fetch_and_create_investors()
    except Exception as e:
        logger.error(f"Error fetching investors data: {e}")

    try:
        fetch_and_create_partners()
    except Exception as e:
        logger.error(f"Error fetching partners data: {e}")

    logger.info("=== API Data Sync Job Completed ===")


def start_scheduler():
    """
    Start the background scheduler to fetch data periodically
    """
    global scheduler

    if scheduler and scheduler.running:
        logger.info("Scheduler is already running, skipping start")
        return

    scheduler = BackgroundScheduler()
    interval_minutes = getattr(settings, "API_DATA_REFRESH_INTERVAL", 60)  # Default to 60 minutes if not set
    fetch_on_startup = getattr(settings, "API_DATA_FETCH_ON_STARTUP", False)  # Default to False

    scheduler.add_job(
        fetch_all_data, "interval", minutes=interval_minutes, id="fetch_all_data_job", replace_existing=True
    )

    # Start the scheduler in a daemon thread
    scheduler.start()
    logger.info(f"API Data Sync Scheduler initialized (interval: {interval_minutes}m)")

    # Register a safer shutdown function that handles errors
    def safe_shutdown():
        if scheduler:
            import contextlib
            with contextlib.suppress(Exception):
                scheduler.shutdown()

    atexit.register(safe_shutdown)

    if fetch_on_startup:
        thread = threading.Thread(target=fetch_all_data)
        thread.daemon = True
        thread.start()
