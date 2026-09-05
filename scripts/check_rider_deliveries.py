import requests

BASE='http://127.0.0.1:8000/api'

rt=requests.post(BASE+'/token/', json={'username':'testrider','password':'riderpass'})
rt.raise_for_status()
access=rt.json()['access']
r=requests.get(BASE+'/deliveries/my/', headers={'Authorization':f'Bearer {access}'})
print(r.status_code)
print(r.text)
