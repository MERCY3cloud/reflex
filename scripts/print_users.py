import os
import sys
from pathlib import Path
import django

# ensure project root is on sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

print("id,username,role,phone")
for u in User.objects.all():
    print(f"{u.id},{u.username},{u.role},{getattr(u, 'phone', '')}")
