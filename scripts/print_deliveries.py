import os
import sys
from pathlib import Path
import django

# ensure project root is on sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from deliveries.models import Delivery

print('id,status,retailer,rider_id,rider_username,assigned_at,delivered_at')
for d in Delivery.objects.all().order_by('id'):
    print(f"{d.id},{d.status},{d.retailer.username if d.retailer else ''},{d.rider.id if d.rider else ''},{d.rider.username if d.rider else ''},{d.assigned_at},{d.delivered_at}")
