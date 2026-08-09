#!/usr/bin/env python3
"""Pulls the previous day's Garmin metrics and pushes them to HealthFit's ingest endpoint."""

import json
import os
import sys
from datetime import date, timedelta

import requests
from garminconnect import Garmin, GarminConnectAuthenticationError

TOKENSTORE = os.environ.get("GARMINTOKENS", os.path.expanduser("~/.garminconnect"))


def get_client() -> Garmin:
    try:
        garmin = Garmin()
        garmin.login(TOKENSTORE)
        return garmin
    except (FileNotFoundError, GarminConnectAuthenticationError):
        garmin = Garmin(
            email=os.environ["GARMIN_EMAIL"],
            password=os.environ["GARMIN_PASSWORD"],
        )
        garmin.login()
        garmin.garth.dump(TOKENSTORE)
        return garmin


def safe_get(fn, *args):
    try:
        return fn(*args)
    except Exception as exc:  # noqa: BLE001 - keep the sync alive on any single metric failure
        print(f"Warning: {fn.__name__} failed: {exc}", file=sys.stderr)
        return None


def main() -> None:
    target_date = os.environ.get("SYNC_DATE") or (
        date.today() - timedelta(days=1)
    ).isoformat()

    garmin = get_client()

    stats = safe_get(garmin.get_stats, target_date)
    sleep = safe_get(garmin.get_sleep_data, target_date)

    steps = None
    active_calories = None
    resting_heart_rate = None
    avg_heart_rate = None

    if stats:
        steps = stats.get("totalSteps")
        active_calories = stats.get("activeKilocalories")
        resting_heart_rate = stats.get("restingHeartRate")
        avg_heart_rate = stats.get("averageHeartRate") or stats.get("avgHeartRate")

    sleep_minutes = None
    if sleep:
        daily_sleep = sleep.get("dailySleepDTO") or {}
        seconds = daily_sleep.get("sleepTimeSeconds")
        if seconds:
            sleep_minutes = round(seconds / 60)

    payload = {
        "date": target_date,
        "steps": steps,
        "active_calories": active_calories,
        "resting_heart_rate": resting_heart_rate,
        "avg_heart_rate": avg_heart_rate,
        "sleep_minutes": sleep_minutes,
        "raw_payload": {"stats": stats, "sleep": sleep},
    }

    response = requests.post(
        os.environ["APP_INGEST_URL"],
        json=payload,
        headers={"Authorization": f"Bearer {os.environ['GARMIN_INGEST_SECRET']}"},
        timeout=30,
    )
    response.raise_for_status()
    print(f"Synced Garmin data for {target_date}: {json.dumps(payload)}")


if __name__ == "__main__":
    main()
