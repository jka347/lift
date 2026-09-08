// Run with: node tests/body-tracking.test.cjs (no dependencies).
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const source = script.slice(script.indexOf('/* ============ body tracking'), script.indexOf('/* ============ GitHub gist API'));
const storage = new Map();
const ctx = vm.createContext({localStorage:{getItem:key=>storage.get(key) ?? null,setItem:(key,value)=>storage.set(key,value)}});
vm.runInContext('let data; let saved=0; function todayStr(){return "2026-09-08";} function scheduleSave(){saved++;}\n' + source + '\nglobalThis.api={setData:d=>data=d,getData:()=>data,saved:()=>saved,bodyDue,nextBodyDate,validateBodyEntry,saveBodyEntry,lastBodyValue,bodyReminderVisible,dismissBodyReminder};', ctx);
const api = ctx.api;
const clone = x => JSON.parse(JSON.stringify(x));
const core = {waistIn:35, chestIn:42, armIn:14, thighIn:23};

assert.equal(api.nextBodyDate('2026-01-31', true), '2026-02-28');
assert.equal(api.nextBodyDate('2024-01-31', true), '2024-02-29');
assert.equal(api.nextBodyDate('2026-12-31', true), '2027-01-31');
assert.equal(api.nextBodyDate('2026-03-06', false), '2026-03-13');
const original = {version:7,program:{days:[]},sessions:[{date:'2026-09-07',entries:[{done:true,reps:[10]}]}],settings:{units:'lb'}};
api.setData(clone(original));
assert.deepEqual(clone(api.bodyDue()),{weightDate:'2026-09-08',measurementDate:'2026-09-08',weight:true,measurements:true});
assert.deepEqual(clone(api.getData()),original); // Read-only prompts don't alter legacy data.
assert.equal(api.saveBodyEntry('2026-09-01',{weightLb:'190.5',...core}),null);
assert.equal(api.bodyDue('2026-09-07').weight,false);
assert.equal(api.bodyDue('2026-09-08').weight,true);
assert.equal(api.bodyDue('2026-09-08').measurements,false);
assert.equal(api.bodyDue('2026-10-01').measurements,true);
assert.equal(api.saveBodyEntry('2026-09-08',{weightLb:'190.2'}),null);
assert.equal(api.bodyDue().weight,false);
assert.equal(api.bodyDue().measurementDate,'2026-10-01');
assert.equal(api.saveBodyEntry('2026-09-08',{weightLb:'190.1',waistIn:'34.75'}),null);
assert.equal(api.getData().bodyMetrics.length,2); // Edit same date, no duplicate.
assert.equal(api.getData().bodyMetrics[1].waistIn,34.75);
assert.equal(api.getData().bodyMetrics[1].chestIn,undefined);
assert.equal(api.bodyDue().measurementDate,'2026-10-01'); // Partial entry doesn't postpone other fields.
assert.equal(api.lastBodyValue('weightLb','2026-09-08',false).weightLb,190.5);
const {bodyMetrics,...unchanged} = clone(api.getData()); assert.deepEqual(unchanged,original);
const before = JSON.stringify(api.getData()); const saves = api.saved();
for(const [date,values] of [['2026-02-30',{weightLb:'190'}],['2026-09-09',{weightLb:'190'}],['bad',{weightLb:'190'}],['2026-09-08',{}],['2026-09-08',{weightLb:'-1'}],['2026-09-08',{waistIn:'0'}],['2026-09-08',{weightLb:'Infinity'}],['2026-09-08',{weightLb:'1e3'}]]){
  assert.equal(typeof api.saveBodyEntry(date,values),'string');
}
assert.equal(JSON.stringify(api.getData()),before); assert.equal(api.saved(),saves);
api.setData({...clone(original),bodyMetrics:[{date:'2026-09-01',weightLb:190,waistIn:35},{date:'2027-09-01',...core,weightLb:191}]});
assert.equal(api.bodyDue().measurements,true); // Missing fields and future rows cannot silence prompts.
assert.equal(api.bodyDue().weight,true);
assert.equal(api.bodyReminderVisible(),true);
const dataBeforeDismiss=JSON.stringify(api.getData()),savesBeforeDismiss=api.saved();
api.dismissBodyReminder(); assert.equal(api.bodyReminderVisible(),false);
assert.equal(api.bodyReminderVisible('2026-09-09'),true);
assert.equal(JSON.stringify(api.getData()),dataBeforeDismiss); assert.equal(api.saved(),savesBeforeDismiss);
storage.clear(); assert.equal(api.bodyReminderVisible(),true); // Another device has its own dismissal.
api.setData({...clone(original),bodyMetrics:[{date:'2026-09-08',weightLb:190,...core}]});
assert.equal(api.bodyReminderVisible(),false); // Current check-ins never produce a banner.
console.log('PASS: syntax, calendar/DST boundaries, due cadence, partial check-ins, legacy preservation, same-date edits, decimals, invalid inputs, future-row exclusion, daily device-local dismissal without changing due dates.');
