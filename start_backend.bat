@echo off
cd /d "%~dp0backend"
if not exist venv python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python manage.py migrate
venv\Scripts\python manage.py runserver 0.0.0.0:8000
