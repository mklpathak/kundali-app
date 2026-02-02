#!/usr/bin/env python3
"""
Test script to verify all Kundali API endpoints
Run with: python3 test_website_api.py
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"
DOB = "07/07/1994"
TOB = "17:10"
LAT = "26.4499"
LON = "80.3319"
PLACE = "Kanpur"

def test_health():
    print("Testing Health Check...")
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"  Status: {r.status_code}")
        print(f"  Response: {r.json()}")
        return r.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_calculate():
    print("\nTesting /astro/calculate...")
    try:
        r = requests.post(f"{BASE_URL}/astro/calculate?dob={DOB}&tob={TOB}&lat={LAT}&lon={LON}&place={PLACE}")
        print(f"  Status: {r.status_code}")
        data = r.json()
        print(f"  Ascendant: {data.get('astrological_details', {}).get('ascendant', 'N/A')}")
        print(f"  Sign: {data.get('astrological_details', {}).get('sign', 'N/A')}")
        return r.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_charts():
    print("\nTesting /astro/calculate/charts...")
    try:
        r = requests.post(f"{BASE_URL}/astro/calculate/charts?dob={DOB}&tob={TOB}&lat={LAT}&lon={LON}")
        print(f"  Status: {r.status_code}")
        data = r.json()
        print(f"  Lagna Chart: {data.get('lagna_chart', {}).get('chart_name', 'N/A')}")
        return r.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_dasha():
    print("\nTesting /astro/calculate/dasha...")
    try:
        r = requests.post(f"{BASE_URL}/astro/calculate/dasha?dob={DOB}&tob={TOB}&lat={LAT}&lon={LON}")
        print(f"  Status: {r.status_code}")
        data = r.json()
        print(f"  Birth Nakshatra: {data.get('birth_nakshatra', 'N/A')}")
        print(f"  Birth Lord: {data.get('birth_lord', 'N/A')}")
        return r.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_current_dasha():
    print("\nTesting /astro/calculate/dasha/current...")
    try:
        r = requests.post(f"{BASE_URL}/astro/calculate/dasha/current?dob={DOB}&tob={TOB}&lat={LAT}&lon={LON}")
        print(f"  Status: {r.status_code}")
        data = r.json()
        print(f"  Mahadasha: {data.get('mahadasha', {}).get('lord', 'N/A')}")
        print(f"  Antardasha: {data.get('antardasha', {}).get('lord', 'N/A')}")
        return r.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_ascendant_report():
    print("\nTesting /astro/calculate/ascendant-report...")
    try:
        r = requests.post(f"{BASE_URL}/astro/calculate/ascendant-report?dob={DOB}&tob={TOB}&lat={LAT}&lon={LON}")
        print(f"  Status: {r.status_code}")
        data = r.json()
        print(f"  Ascendant: {data.get('ascendant', 'N/A')}")
        print(f"  Nakshatra: {data.get('nakshatra', 'N/A')}")
        return r.status_code == 200
    except Exception as e:
        print(f"  Error: {e}")
        return False

def test_cors():
    print("\nTesting CORS Headers...")
    try:
        r = requests.options(f"{BASE_URL}/astro/calculate", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST"
        })
        print(f"  Status: {r.status_code}")
        print(f"  CORS Headers: {dict(r.headers)}")
        return "access-control-allow-origin" in [h.lower() for h in r.headers.keys()]
    except Exception as e:
        print(f"  Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("KUNDALI API TEST SUITE")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Data: {DOB} @ {TOB}, {PLACE} ({LAT}, {LON})")
    print("=" * 50)
    
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Calculate", test_calculate()))
    results.append(("Charts", test_charts()))
    results.append(("Dasha", test_dasha()))
    results.append(("Current Dasha", test_current_dasha()))
    results.append(("Ascendant Report", test_ascendant_report()))
    results.append(("CORS", test_cors()))
    
    print("\n" + "=" * 50)
    print("RESULTS SUMMARY")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {name}: {status}")
    
    total_passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {total_passed}/{len(results)} tests passed")
