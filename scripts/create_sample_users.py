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

users = [
    {'username': 'admin', 'password': 'adminpass', 'role': 'DISPATCHER', 'is_superuser': True, 'is_staff': True},
    {'username': 'testrider', 'password': 'riderpass', 'role': 'RIDER'},
    {'username': 'Mercy5', 'password': 'riderpass2', 'role': 'RIDER'},
    {'username': 'dispatcher', 'password': 'dispatchpass', 'role': 'DISPATCHER'},
    {'username': 'retailer', 'password': 'retailerpass', 'role': 'RETAILER'},
]

for u in users:
    if User.objects.filter(username=u['username']).exists():
        print(f"User {u['username']} exists")
        continue
    is_super = u.get('is_superuser', False)
    is_staff = u.get('is_staff', False)
    user = User.objects.create_user(username=u['username'], password=u['password'])
    user.role = u['role']
    user.is_superuser = is_super
    user.is_staff = is_staff
    user.save()
    print(f"Created {u['username']}")

print('Done')
