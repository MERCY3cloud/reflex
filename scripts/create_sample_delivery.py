import os
import sys
import django
from pathlib import Path

# Ensure project root is on sys.path so `config` can be imported
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from deliveries.models import Delivery

retailer = User.objects.filter(username='retailer').first()
if not retailer:
    print('retailer user not found')
    sys.exit(1)

delivery = Delivery.objects.create(
    customer_name='Test Customer',
    customer_phone='0712345678',
    address='123 Test Lane',
    item_description='Sample items',
    quantity=1,
    total_amount='1500.00',
    deposit_paid='500.00',
    retailer=retailer,
)

print(f'Created delivery {delivery.id}')
