import requests
import sys
import time

BASE_URL = "http://127.0.0.1:8000"

def test_headless_flow():
    # 0. Health Check
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"Health: {r.json()}")
    except Exception as e:
        print(f"Server not up: {e}")
        return

    # 1. Create Profile
    payload = {
        "name": "Mukul Headless",
        "dob": "1994-07-07",
        "tob": "17:10:00",
        "lat": 26.8,
        "lon": 80.9,
        "location_name": "Lucknow"
    }
    
    print("Creating Profile...")
    r = requests.post(f"{BASE_URL}/profiles/", json=payload)
    if r.status_code != 200:
        print(f"Failed to create profile: {r.text}")
        sys.exit(1)
        
    data = r.json()
    profile_id = data["id"]
    print(f"Profile Created: {profile_id}")
    
    # 2. Fetch Planets
    print("Fetching Planets...")
    r = requests.get(f"{BASE_URL}/astro/{profile_id}/planets?chart=D1")
    if r.status_code != 200:
        print(f"Failed to fetch planets: {r.text}")
        sys.exit(1)
        
    planets = r.json()
    print(f"Got {len(planets)} planetary positions.")
    
    # 3. Fetch Extended Birth Details
    print("Fetching Extended Birth Details...")
    r = requests.get(f"{BASE_URL}/astro/{profile_id}/birth_details")
    if r.status_code != 200:
        print(f"Failed to fetch birth details: {r.text}")
    else:
        details = r.json()
        print("\n--- Birth Particulars ---")
        for k, v in details['birth_particulars'].items():
            print(f"{k}: {v}")
            
        print("\n--- Family ---")
        for k, v in details.get('family_particulars', {}).items():
             print(f"{k}: {v}")

        print("\n--- Sun / Moon ---")
        for k, v in details['sun_moon_params'].items():
            print(f"{k}: {v}")

        print("\n--- Hindu Calendar ---")
        for k, v in details['hindu_calendar'].items():
            print(f"{k}: {v}")
            
        print("\n--- Tamil Calendar ---")
        for k, v in details.get('tamil_calendar', {}).items():
            print(f"{k}: {v}")
            
        print("\n--- Panchang Timing ---")
        for k, v in details.get('panchang', {}).items():
            print(f"{k}: {v}")
            
        print("\n--- Avakhada ---")
        for k, v in details.get('avakhada_chakra', {}).items():
            print(f"{k}: {v}")
            
    if len(planets) > 5:
        print("\nSUCCESS: Headless API is working!")
    else:
        print("\nFAILURE: Not enough planets returned.")

if __name__ == "__main__":
    time.sleep(2) # Wait for server
    test_headless_flow()
