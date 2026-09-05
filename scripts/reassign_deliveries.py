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
from users.models import User
from tracking.models import StatusHistory
from django.utils import timezone

def reassign(delivery_ids, new_rider_id, changed_by_id=None):
    try:
        new_rider = User.objects.get(id=new_rider_id)
    except User.DoesNotExist:
        print(f"Rider id {new_rider_id} not found")
        return

    changed_by = None
    if changed_by_id:
        try:
            changed_by = User.objects.get(id=changed_by_id)
        except User.DoesNotExist:
            changed_by = None

    for did in delivery_ids:
        try:
            d = Delivery.objects.get(id=did)
        except Delivery.DoesNotExist:
            print(f"Delivery {did} not found")
            continue

        old_rider = d.rider
        old_status = d.status
        d.rider = new_rider
        d.assigned_at = timezone.now()
        d.status = Delivery.Status.ASSIGNED
        d.save(update_fields=["rider", "assigned_at", "status"])

        StatusHistory.objects.create(
            delivery=d,
            old_status=old_status,
            new_status=d.status,
            changed_by=changed_by if changed_by else new_rider,
        )

        print(f"Reassigned delivery {d.id} from {old_rider.username if old_rider else 'None'} to {new_rider.username}")

if __name__ == '__main__':
    # default: reassign delivery 6 to Mercy5 (id 9), changed_by dispatcher id 4
    reassign([6], 9, changed_by_id=4)
