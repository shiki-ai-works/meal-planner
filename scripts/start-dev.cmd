@echo off
cd /d D:\Codex\meal-planner
"C:\Program Files\nodejs\npm.cmd" run dev >> "dev-server.log" 2>> "dev-server.err.log"
