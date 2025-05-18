import sys
import os

# Dynamically resolve and insert the absolute path to /Backend
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Backend'))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

