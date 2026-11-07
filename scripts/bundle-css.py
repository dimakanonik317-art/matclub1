"""Regenerate the single stylesheet loaded by the buildless site."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1] / 'dist'
files = ['style.css', 'settings.css', 'learning.css', 'studio.css', 'physics.css', 'modern.css', 'redesign.css']
css = '\n'.join((root / name).read_text() for name in files)
css = re.sub(r'^@import[^\n]*\n', '', css, flags=re.M)
(root / 'app.css').write_text(css)
