import assert from 'node:assert/strict';
import {contour,step,motionProfile,shadowFilter} from '../extensions/engines/material.mjs';
import {isoWeek,weekStart,calendarDays,parseDate} from '../extensions/engines/forms.mjs';
assert.notEqual(contour(200,50,12,180,20,1),contour(200,50,12,180,20,-1));
assert.match(contour(200,50,12,180,20,0),/^M .* Z$/);
let v=0,velocity=0;
for(let i=0;i<240;i++)[v,velocity]=step(v,velocity,1,1/60);
assert.ok(Math.abs(v-1)<.001);
for(const [date,week] of [['2026-11-26','2026-W48'],['2021-01-01','2020-W53'],['2024-12-30','2025-W01']]){
  assert.equal(isoWeek(parseDate(date)),week);
  assert.equal(isoWeek(weekStart(week)),week);
}
assert.equal(weekStart('2021-W53'),null);
assert.equal(calendarDays(2026,10).length,42);
assert.equal(parseDate('2026-02-29'),null);
console.log('Material geometry, spring convergence, ISO week boundaries and calendar tests passed.');

assert.equal(motionProfile('none','0ms').instant,true);
assert.equal(motionProfile('minimal','100ms').hover,0);
assert.ok(motionProfile('minimal','100ms').press<1);
assert.ok(motionProfile('fluid','280ms').speed<1);
assert.equal(motionProfile('default','180ms').speed,1);
assert.equal(shadowFilter('none'),'');
assert.equal(shadowFilter('rgba(0, 0, 0, 0.2) 0px 4px 16px 0px'),'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))');
assert.equal(shadowFilter('rgba(0, 0, 0, 0.2) 0px 4px 16px 2px'),null);
assert.equal(shadowFilter('rgba(0, 0, 0, 0.2) 0px 4px 16px 0px inset'),null);
assert.equal(contour(200,50,0,100,25,0),'M 36 36 H 236 V 86 H 36 Z');
console.log('Motion profile, exact resting geometry and inherited shadow conversion tests passed.');
