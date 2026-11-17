"""Read existing submission; optionally download approved XPI without resubmission."""
from pathlib import Path
import base64
import hashlib
import hmac
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import zipfile

root = Path(__file__).resolve().parents[1]
note = Path(sys.argv[1]).read_text()
issuer = re.findall(r'user:\d+:\d+', note)
secret = re.findall(r'''(?m)^\s*[`"']?([A-Za-z0-9_+/.=-]{40,})[`"']?\s*$''', note)
assert len(issuer) == len(secret) == 1, 'Ambiguous credential format'
def encode(obj):
    return base64.urlsafe_b64encode(json.dumps(obj, separators=(',', ':')).encode()).rstrip(b'=')
msg = encode({'alg':'HS256','typ':'JWT'}) + b'.' + encode({
    'iss':issuer[0], 'iat':int(time.time()), 'exp':int(time.time())+60})
token = msg + b'.' + base64.urlsafe_b64encode(hmac.new(secret[0].encode(),msg,hashlib.sha256).digest()).rstrip(b'=')
auth = {'Authorization':'JWT '+token.decode()}
guid = 'amazon-jp-free-shipping@local.hpd'
url = 'https://addons.mozilla.org/api/v5/addons/addon/'+urllib.parse.quote(guid,safe='')+'/versions/?filter=all_with_unlisted'
with urllib.request.urlopen(urllib.request.Request(url,headers=auth),timeout=30) as response:
    data = json.load(response)
items = []
for v in data.get('results', []):
    f = v.get('file', {})
    items.append({
        'version':v.get('version'), 'id':v.get('id'), 'channel':v.get('channel'),
        'edit_url':v.get('edit_url'), 'compatibility':v.get('compatibility'),
        'file':{k:f.get(k) for k in ('id','status','is_signed','size','url')}
    })
(root/'test-results').mkdir(exist_ok=True)
(root/'test-results/amo-status.json').write_text(json.dumps(items,indent=2))
print(json.dumps(items,indent=2))
if '--download' in sys.argv:
    item = next(v for v in items if v['version']=='1.0.0' and v['channel']=='unlisted')
    if item['file']['status'] != 'public':
        print('PENDING: not approved; no download and no resubmission.')
        sys.exit(0)
    url = item['file']['url']
    assert urllib.parse.urlparse(url).scheme == 'https'
    assert urllib.parse.urlparse(url).hostname == 'addons.mozilla.org'
    dest = root/'dist/amazon-jp-free-shipping-1.0.0-signed.xpi'
    with urllib.request.urlopen(urllib.request.Request(url,headers=auth),timeout=60) as response:
        payload = response.read(2_000_000)
    with zipfile.ZipFile(__import__('io').BytesIO(payload)) as z:
        assert z.testzip() is None
        assert 'META-INF/mozilla.rsa' in z.namelist(), 'Missing Mozilla signature'
        m = json.loads(z.read('manifest.json'))
        assert m['version']=='1.0.0' and m['browser_specific_settings']['gecko']['id']==guid
        for name in ('manifest.json','content.js','content.css'):
            assert z.read(name)==(root/'extension'/name).read_bytes(), 'Payload differs: '+name
    dest.write_bytes(payload)
    print('Downloaded signed XPI; payload matches extension/.')
