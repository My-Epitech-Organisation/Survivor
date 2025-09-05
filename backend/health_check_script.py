#!/usr/bin/env python
import sys
import time

import requests
from requests.exceptions import ConnectionError as RequestsConnectionError
from requests.exceptions import Timeout

MAX_RETRIES = 5
RETRY_DELAY = 1
BASE_URL = "http://localhost:8000"
HEALTH_ENDPOINT = "/healthz/"

for i in range(MAX_RETRIES):
    try:
        response = requests.get(f"{BASE_URL}{HEALTH_ENDPOINT}", timeout=2)
        if response.status_code == 200:
            print("Health check passed")
            sys.exit(0)
        else:
            print(f"Health check failed with status code: {response.status_code}")
    except (RequestsConnectionError, Timeout) as e:
        print(f"Health check attempt {i+1}/{MAX_RETRIES} failed: {e!s}")

    if i < MAX_RETRIES - 1:
        time.sleep(RETRY_DELAY)

print("Health check failed after maximum retries")
sys.exit(1)
