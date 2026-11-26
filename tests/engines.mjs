import assert from 'node:assert/strict';
import {contour,step,motionProfile,shadowFilter,touchPhase,defaults,overlayPath,mediaFrame} from '../extensions/engines/material.mjs';
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

const rise=defaults.touchAttractionTime,press=defaults.touchCompressionTime;
assert.equal(touchPhase(0,null,true),'attract');
assert.equal(touchPhase(rise+1,null,true),'press');
assert.equal(touchPhase(rise+press+1,null,true),'press');
assert.equal(touchPhase(0,5,true),'attract');
assert.equal(touchPhase(rise+1,5,true),'press');
assert.equal(touchPhase(rise+press,5,true),'rest');
assert.equal(touchPhase(0,5,false),'attract');
assert.equal(touchPhase(rise,5,false),'rest');
assert.equal(touchPhase(rise+press+1,null,false),'attract');
assert.equal(touchPhase(500,500,true),'rest');
assert.equal(touchPhase(0,0,true,0,press),'press');
assert.equal(touchPhase(0,0,false,0,press),'rest');
// Verify the quick-tap sequence generates both positive and negative displacement
// and then settles to the exact resting shape, without requiring a hover event.
let force=0,speed=0,maximum=0,minimum=0;
for(let age=0;age<1800;age+=1000/60){
  const phase=touchPhase(age,8,true);
  [force,speed]=step(force,speed,phase==='attract'?defaults.attraction:phase==='press'?-defaults.pressure:0,1/60);
  maximum=Math.max(maximum,force);minimum=Math.min(minimum,force);
}
assert.ok(maximum>.1);assert.ok(minimum<-.1);assert.equal(force,0);assert.equal(speed,0);
console.log('Touch attraction, compression, passive contact and release tests passed.');

assert.equal(overlayPath(320,180,12,160,90,0),contour(320,180,12,160,90,0,0,defaults.amplitude,defaults.overlayMaximum,0));
assert.equal(overlayPath(320,180,12,160,90,-1),overlayPath(320,180,12,160,90,0));
assert.notEqual(overlayPath(320,180,12,20,30,1),overlayPath(320,180,12,300,30,1));
assert.notEqual(overlayPath(320,180,12,300,30,1),overlayPath(320,180,12,300,30,1,{...defaults,overlaySkew:0}));
console.log('Overlay resting contour, passive force and directional skew tests passed.');

const mediaRest=mediaFrame(320,180,8,160,90,0);
assert.equal(mediaRest.inner,mediaRest.outer);
assert.deepEqual(mediaFrame(320,180,8,160,90,-1),mediaRest);
const mediaLeft=mediaFrame(320,180,8,20,90,1),mediaRight=mediaFrame(320,180,8,300,90,1);
assert.notEqual(mediaLeft.outer,mediaRight.outer);
assert.equal(mediaLeft.inner,mediaRight.inner);
assert.ok(mediaLeft.skew<0&&mediaRight.skew>0);
assert.equal(mediaLeft.outset,mediaRight.outset);
assert.ok(mediaFrame(300,40,20,20,20,1).outset<mediaLeft.outset);
assert.ok(mediaFrame(320,180,8,300,90,1,{...defaults,mediaSkew:0}).skew===0);
console.log('Native media frame geometry, passive response and smaller audio-size response passed.');
