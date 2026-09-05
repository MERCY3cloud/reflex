import requests

BASE = "http://127.0.0.1:8000/api"

def login(username, password):
    r = requests.post(f"{BASE}/token/", json={"username": username, "password": password})
    r.raise_for_status()
    return r.json()

def auth_headers(access):
    return {"Authorization": f"Bearer {access}", "Content-Type": "application/json"}

def verify_location(access, delivery_id):
    r = requests.post(f"{BASE}/deliveries/{delivery_id}/verify-location/", headers=auth_headers(access))
    return r

def list_riders(access):
    r = requests.get(f"{BASE}/deliveries/riders/", headers=auth_headers(access))
    return r

def assign_rider(access, delivery_id, rider_id):
    r = requests.post(f"{BASE}/deliveries/{delivery_id}/assign-rider/", json={"rider_id": rider_id}, headers=auth_headers(access))
    return r

if __name__ == '__main__':
    tokens = login('dispatcher', 'dispatchpass')
    access = tokens['access']

    print('Verifying location...')
    r = verify_location(access, 1)
    print(r.status_code, r.text)

    print('Listing riders...')
    r = list_riders(access)
    print(r.status_code, r.text)
    riders = r.json().get('riders', [])
    if not riders:
        print('No riders found')
        raise SystemExit(1)

    rider_id = riders[0]['id']
    print('Assigning rider', rider_id)
    r = assign_rider(access, 1, rider_id)
    print(r.status_code, r.text)
