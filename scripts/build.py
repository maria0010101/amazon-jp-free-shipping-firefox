from pathlib import Path
import zipfile
import json

root = Path(__file__).resolve().parents[1]
out = root / 'dist' / 'amazon-jp-free-shipping-1.0.0-unsigned.xpi'
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ('manifest.json', 'content.js', 'content.css'):
        z.write(root / 'extension' / name, name)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == {'manifest.json', 'content.js', 'content.css'}
    assert json.loads(z.read('manifest.json'))['version'] == '1.0.0'
print(out)
