@echo off
title LifeTrack Pro - Backend Server
echo ==============================================
echo  Starting LifeTrack Pro Django API on :8000
echo ==============================================
cd /d "%~dp0backend"
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
