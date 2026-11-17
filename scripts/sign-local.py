"""Use a local Mozilla credential note; never copy its values into the add-on."""
import os
from pathlib import Path
import re
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
note = Path(sys.argv[1]).read_text()
issuers = re.findall(r'user:\d+:\d+', note)
secrets = re.findall(r'''(?m)^\s*[`"']?([A-Za-z0-9_+/.=-]{40,})[`"']?\s*$''', note)
if len(issuers) != 1 or len(secrets) != 1:
    raise SystemExit('Credential format is ambiguous; values were not displayed.')
env = os.environ.copy()
env['WEB_EXT_API_KEY'] = issuers[0]
env['WEB_EXT_API_SECRET'] = secrets[0]
webext = env.get('AJFS_WEB_EXT', str(root / 'node_modules/.bin/web-ext'))
args = [webext, 'sign', '--source-dir', str(root/'extension'),
        '--artifacts-dir', str(root/'dist'), '--channel', 'unlisted',
        '--amo-metadata', str(root/'docs/amo-metadata.json'),
        '--timeout', '180000', '--approval-timeout', '300000',
        '--no-config-discovery', '--no-input']
(root/'test-results').mkdir(exist_ok=True)
with (root/'test-results/signing.log').open('a') as log:
    p = subprocess.Popen(args, cwd=root, env=env, stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT, text=True)
    for line in p.stdout:
        line = line.replace(issuers[0], '[REDACTED_ISSUER]').replace(secrets[0], '[REDACTED_SECRET]')
        line = re.sub(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '[REDACTED_JWT]', line)
        print(line, end='', flush=True)
        log.write(line)
        log.flush()
    raise SystemExit(p.wait())
