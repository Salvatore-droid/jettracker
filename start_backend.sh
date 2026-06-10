#!/bin/bash
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
  python3 -m venv venv
  venv/bin/pip install -r requirements.txt
fi
venv/bin/python manage.py migrate
venv/bin/python manage.py runserver 0.0.0.0:8000
