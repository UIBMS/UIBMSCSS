import assert from 'node:assert/strict';
import {tabDestination} from '../extensions/engines/components/tabs.mjs';
import {floatingPosition} from '../extensions/engines/components/floating.mjs';
import {menuDestination} from '../extensions/engines/components/dropdown.mjs';
import {toastDuration} from '../extensions/engines/components/toast.mjs';
import {pageWindow} from '../extensions/engines/components/pagination.mjs';
import {commandMatches} from '../extensions/engines/components/command.mjs';
import {splitBounds,clampSplit} from '../extensions/engines/dashboard/split-workspace.mjs';
import {sparklinePoints} from '../extensions/engines/dashboard/sparkline.mjs';
import {progressRatio} from '../extensions/engines/dashboard/progress-ring.mjs';
import {contour,step,motionProfile,shadowFilter,touchPhase,defaults,overlayPath,mediaFrame} from '../extensions/engines/material.mjs';
import {meshPoint,objectRectangle} from '../extensions/engines/media-deformation.mjs';
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

assert.deepEqual(meshPoint(.5,.5,320,180,300,50,0,24,80),[160,90]);
assert.ok(meshPoint(1,.5,320,180,315,90,1,24,80)[0]>330);
assert.ok(meshPoint(.9,.5,320,180,315,90,1,24,80)[0]>288);
assert.ok(meshPoint(0,.5,320,180,5,90,1,24,80)[0]<-10);
assert.deepEqual(objectRectangle(100,100,200,100,'cover','50% 50%'),{x:-50,y:0,w:200,h:100});
assert.deepEqual(objectRectangle(100,100,200,100,'contain','50% 50%'),{x:0,y:25,w:100,h:50});
assert.deepEqual(objectRectangle(100,100,50,50,'scale-down','right bottom'),{x:50,y:50,w:50,h:50});
assert.equal(objectRectangle(100,100,50,50,'contain','right 10px bottom 20px'),null);
console.log('Shared media mesh and object-fit calculations passed.');

assert.equal(tabDestination(0,3,'ArrowRight'),1);
assert.equal(tabDestination(2,3,'ArrowRight'),0);
assert.equal(tabDestination(0,3,'ArrowLeft'),2);
assert.equal(tabDestination(0,3,'ArrowLeft',false,true),1);
assert.equal(tabDestination(1,3,'ArrowDown',true),2);
assert.equal(tabDestination(1,3,'ArrowRight',true),-1);
assert.equal(tabDestination(1,3,'Home'),0);
assert.equal(tabDestination(1,3,'End'),2);
assert.equal(tabDestination(1,0,'Home'),-1);
console.log('Optional tab keyboard navigation passed.');

const vp={left:0,top:0,width:390,height:800};
const f=floatingPosition({left:320,right:370,top:730,bottom:774},{width:210,height:180},vp);
assert.equal(f.side,'above');assert.equal(f.left,170);assert.equal(f.top,544);
assert.equal(floatingPosition({left:20,right:80,top:70,bottom:110},{width:150,height:50},vp,{prefer:'above'}).side,'above');
assert.equal(floatingPosition({left:20,right:80,top:15,bottom:55},{width:150,height:50},vp,{prefer:'above'}).side,'below');
assert.equal(floatingPosition({left:40,right:220,top:20,bottom:64},{width:120,height:50},vp,{rtl:true}).left,100);
assert.equal(menuDestination(2,3,'ArrowDown'),0);
assert.equal(menuDestination(0,3,'ArrowUp'),2);
assert.equal(menuDestination(-1,3,'ArrowUp'),2);
assert.equal(menuDestination(1,3,'Home'),0);
assert.equal(menuDestination(1,0,'End'),-1);
console.log('Floating placement, viewport flipping, RTL alignment and menu navigation passed.');

for(const [value,tone,expected] of [[0,'info',0],[500,'info',5000],[10000,'success',10000],[6000,'warning',0],[6000,'danger',0],[Infinity,'info',0],[-1,'info',0],[1e12,'info',2147483647]])assert.equal(toastDuration(value,tone),expected);
console.log('Toast duration and persistent critical-message policy passed.');

assert.deepEqual(pageWindow(1,1),[1]);
assert.deepEqual(pageWindow(1,10),[1,2,3,'ellipsis',10]);
assert.deepEqual(pageWindow(5,10),[1,'ellipsis',4,5,6,'ellipsis',10]);
assert.deepEqual(pageWindow(10,10),[1,'ellipsis',8,9,10]);
assert.deepEqual(pageWindow(3,5),[1,2,3,4,5]);
assert.deepEqual(pageWindow(0,3),[1,2,3]);
assert.deepEqual(pageWindow(Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,0),[1,'ellipsis',Number.MAX_SAFE_INTEGER]);
assert.equal(commandMatches('Open project settings','SET project'),true);
assert.equal(commandMatches('Résumé du projet','resume'),true);
assert.equal(commandMatches('Create new project','delete'),false);
assert.equal(commandMatches('Any action',' '),true);
console.log('Bounded pagination and command search tests passed.');

assert.deepEqual(splitBounds(800,160,240),[.2,.7]);
assert.equal(clampSplit(.1,800,160,240),.2);
assert.equal(clampSplit(.9,800,160,240),.7);
assert.equal(clampSplit(.42,800,160,240),.42);
assert.deepEqual(splitBounds(300,160,240),[.4,.4]);
assert.deepEqual(splitBounds(0,0,0),[.5,.5]);
console.log('Dashboard split workspace bounds passed.');

assert.deepEqual(sparklinePoints([]),[]);
assert.deepEqual(sparklinePoints([5]),[[50,20]]);
assert.deepEqual(sparklinePoints([2,2]),[[4,20],[96,20]]);
assert.deepEqual(sparklinePoints([-5,0,5]),[[4,36],[50,20],[96,4]]);
assert.deepEqual(sparklinePoints([-Number.MAX_VALUE,Number.MAX_VALUE]),[[4,36],[96,4]]);
assert.throws(()=>sparklinePoints([NaN]),TypeError);
assert.equal(progressRatio(75,100),.75);
assert.equal(progressRatio(0,5),0);
assert.equal(progressRatio(20,10),1);
assert.equal(progressRatio(-1,10),0);
assert.equal(progressRatio(1,0),null);
console.log('Widget native SVG geometry and progress normalization passed.');
