"""Import smoke: every tracked .py module must import without SyntaxError/NameError.

ImportError (missing optional third-party dep) is allowed; syntax/name defects fail.
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

failures = 0
for path in sorted(ROOT.rglob("*.py")):
    if ".git" in path.parts:
        continue
    mod = ".".join(path.relative_to(ROOT).with_suffix("").parts)
    print(f"--- importing {mod} ---")
    try:
        __import__(mod)
        print("  OK")
    except ImportError as e:
        print(f"  ImportError (allowed): {e}")
    except (SyntaxError, NameError) as e:
        print(f"  FAIL ({type(e).__name__}): {e}")
        failures += 1

sys.exit(1 if failures else 0)
