import os
import sys
import subprocess

current_dir = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(current_dir, ".venv", "Scripts", "python.exe")

# If local venv exists and current python is not the venv python, auto-switch to project venv
if os.path.exists(venv_python) and os.path.abspath(sys.executable).lower() != os.path.abspath(venv_python).lower():
    print(f"[*] Utilisation automatique de l'environnement virtuel du projet : {venv_python}")
    env = os.environ.copy()
    env["PYTHONPATH"] = current_dir + (os.pathsep + env.get("PYTHONPATH", "") if "PYTHONPATH" in env else "")
    res = subprocess.run([venv_python] + sys.argv, env=env)
    sys.exit(res.returncode)

# Ensure backend root is on sys.path and in PYTHONPATH for reloader subprocesses
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
os.environ["PYTHONPATH"] = current_dir + (os.pathsep + os.environ.get("PYTHONPATH", "") if "PYTHONPATH" in os.environ else "")

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
