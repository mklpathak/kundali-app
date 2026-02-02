import requests
import sys

def test_generate_kundali():
    url = "http://127.0.0.1:8000/generate_kundali"
    payload = {
        "name": "Mukul Pathak",
        "year": 1994,
        "month": 7,
        "day": 7,
        "hour": 17,
        "minute": 10,
        "lat": 26.8,
        "lon": 80.9,
        "timezone": 5.5
    }
    
    try:
        print(f"Sending request to {url}...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            filename = "kundali_traditional_cover.pdf"
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"Success! PDF saved as {filename}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Connection Error: {e}")
        print("Ensure the server is running on port 8000.")

if __name__ == "__main__":
    test_generate_kundali()
