const {Builder} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const {createServer} = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'test-results');
fs.mkdirSync(out, {recursive:true});
const tmp = fs.mkdtempSync('/tmp/ajfs-test-');
execFileSync('openssl', ['req','-x509','-newkey','rsa:2048','-nodes','-keyout',tmp+'/key.pem','-out',tmp+'/cert.pem','-days','1','-subj','/CN=www.amazon.co.jp'], {stdio:'ignore'});
const cases = [
  ['ja','無料配送',true], ['ja2','送料 無料',true], ['en','FREE SHIPPING',true],
  ['ko','무료 배송',true], ['cn','免运费',true], ['tw','免費配送',true],
  ['conditional','¥3,500以上の注文で無料配送',true], ['paid','送料 ¥500',false],
  ['threshold','¥3,500以上の注文',false], ['negative','Not eligible for free shipping',false],
  ['negativeJA','無料配送対象外',false], ['negativeTW','不提供免運',false],
  ['title','送料 ¥500',false], ['mobile','免費運送',true]
];
const fixture = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Amazon 免運標示測試（人工版型）</title>
<style>body{font:16px sans-serif;margin:16px;background:white;color:#111}.s-result-item{padding:10px;margin:8px;border:1px solid #ccc}h2{font-size:16px;margin:0}</style>
<h1>免運商品標示測試</h1>${cases.map(([id,text])=>`<div id="${id}" class="s-result-item" data-asin="${id}" ${id==='mobile'?'':'data-component-type="s-search-result"'}><h2>${id==='title'?'Free shipping bag':'商品 '+id}</h2><span>${text}</span></div>`).join('')}`;
let driver;
const results = [];
const server = createServer({key:fs.readFileSync(tmp+'/key.pem'),cert:fs.readFileSync(tmp+'/cert.pem')},(req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fixture);});
const marked = id => driver.executeScript('return document.getElementById(arguments[0]).classList.contains("ajfs-free-shipping")',id);
process.env.MOZ_REMOTE_ALLOW_SYSTEM_ACCESS='1';
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const opts = new firefox.Options().addArguments('-headless','--allow-system-access')
    .setPreference('network.dns.localDomains','www.amazon.co.jp')
    .setPreference('xpinstall.signatures.required',true)
    .setPreference('network.proxy.type',0).setAcceptInsecureCerts(true);
  driver = await new Builder().forBrowser('firefox').setFirefoxOptions(opts).build();
  await driver.manage().setTimeouts({pageLoad:30000,script:10000});
  const addonPath = process.env.AJFS_SIGNED_XPI || path.join(root,'dist/amazon-jp-free-shipping-1.0.0-unsigned.xpi');
  const id = await driver.installAddon(addonPath,!process.env.AJFS_SIGNED_XPI);
  assert.equal(id,'amazon-jp-free-shipping@local.hpd');
  results.push({name:process.env.AJFS_SIGNED_XPI ? 'Mozilla signed XPI permanent install with default signature checking' : 'unchanged production XPI temporary install',passed:true});
  if (process.env.AJFS_SIGNED_XPI) {
    await driver.setContext(firefox.Context.CHROME);
    const state = await driver.executeAsyncScript(`const done=arguments[arguments.length-1];
      const {AddonManager}=ChromeUtils.importESModule('resource://gre/modules/AddonManager.sys.mjs');
      AddonManager.getAddonByID('amazon-jp-free-shipping@local.hpd').then(a=>done({
        signedState:a.signedState,isActive:a.isActive,appDisabled:a.appDisabled,
        temporarilyInstalled:a.temporarilyInstalled,signatureRequired:Services.prefs.getBoolPref('xpinstall.signatures.required')
      }));`);
    assert.ok(state.signedState>0);
    assert.equal(state.isActive,true);
    assert.equal(state.appDisabled,false);
    assert.equal(state.temporarilyInstalled,false);
    assert.equal(state.signatureRequired,true);
    results.push({name:'Firefox AddonManager signature and permanent-install state',passed:true,state});
    await driver.setContext(firefox.Context.CONTENT);
  }
  await driver.get(`https://www.amazon.co.jp:${server.address().port}/s?k=fixture`);
  await driver.wait(()=>marked('ja'),10000);
  for (const [id,,expected] of cases) {
    assert.equal(await marked(id),expected,id);
    assert.notEqual(await driver.executeScript('return getComputedStyle(document.getElementById(arguments[0])).display',id),'none');
    results.push({name:id,passed:true});
  }
  assert.equal(await driver.executeScript('return getComputedStyle(document.getElementById("ja")).backgroundColor'),'rgb(231, 244, 228)');
  await driver.executeScript('document.getElementById("ja").querySelector("span").firstChild.data="配送 ¥500"');
  await driver.wait(async()=>!await marked('ja'),5000);
  results.push({name:'characterData mutation removes stale highlight',passed:true});
  await driver.executeScript('document.getElementById("paid").querySelector("span").textContent="Free delivery"');
  await driver.wait(()=>marked('paid'),5000);
  await driver.executeScript('const n=document.createElement("div");n.id="dynamic";n.className="a-carousel-card";n.textContent="配送無料";document.body.append(n)');
  await driver.wait(()=>marked('dynamic'),5000);
  results.push({name:'replacement and newly inserted carousel card',passed:true});
  await driver.manage().window().setRect({width:1100,height:1000});
  fs.writeFileSync(path.join(out,'desktop.png'),await driver.takeScreenshot(),'base64');
  await driver.manage().window().setRect({width:390,height:844});
  assert.ok(await driver.executeScript('return document.documentElement.scrollWidth <= innerWidth'));
  fs.writeFileSync(path.join(out,'mobile-width.png'),await driver.takeScreenshot(),'base64');
  results.push({name:'390px desktop Firefox viewport (NOT Android runtime)',passed:true});
  // Host boundary: same fixture at localhost must not get the content script.
  await driver.get(`https://localhost:${server.address().port}/s`);
  assert.equal(await marked('ja'),false);
  results.push({name:'non-Amazon host excluded',passed:true});
  fs.writeFileSync(path.join(out,process.env.AJFS_SIGNED_XPI?'firefox-signed.json':'firefox.json'),JSON.stringify({date:new Date().toISOString(),browser:(await driver.getCapabilities()).get('browserVersion'),fixtureOrigin:'Amazon hostname mapped to loopback in isolated profile only',results},null,2));
  console.log(`${results.length} checks passed`);
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:String(e),results},null,2));process.exitCode=1;})
.finally(async()=>{if(driver)await driver.quit();server.close();fs.rmSync(tmp,{recursive:true,force:true});});
