(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1014499d-d5d4-4ebd-a117-09c39007ae7a`,e._sentryDebugIdIdentifier=`sentry-dbid-1014499d-d5d4-4ebd-a117-09c39007ae7a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Period`,id:`period`}],rawContent:`# Period


\`\`\`python
class Period(modal.schedule.Schedule)
\`\`\`

Create a schedule that runs every given time interval.

Only \`seconds\` can be a float. All other arguments are integers.

Note that \`days=1\` will trigger the function the same time every day.
This does not have the same behavior as \`seconds=84000\` since days have
different lengths due to daylight savings and leap seconds. Similarly,
using \`months=1\` will trigger the function on the same day each month.

This behaves similar to the
[dateutil](https://dateutil.readthedocs.io/en/latest/relativedelta.html)
package.

**Usage**

\`\`\`python
import modal
app = modal.App()

@app.function(schedule=modal.Period(days=1))
def f():
    print("This function will run every day")

modal.Period(hours=4)          # runs every 4 hours
modal.Period(minutes=15)       # runs every 15 minutes
modal.Period(seconds=math.pi)  # runs every 3.141592653589793 seconds
\`\`\`

\`\`\`python
__init__(self, *, years=0, months=0, weeks=0, days=0, hours=0, minutes=0,
    seconds=0)
\`\`\`
`,meta:{title:`Period`,description:`Create a schedule that runs every given time interval.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <!> <p>Create a schedule that runs every given time interval.</p> <p>Only <code>seconds</code> can be a float. All other arguments are integers.</p> <p>Note that <code>days=1</code> will trigger the function the same time every day.
This does not have the same behavior as <code>seconds=84000</code> since days have
different lengths due to daylight savings and leap seconds. Similarly,
using <code>months=1</code> will trigger the function on the same day each month.</p> <p>This behaves similar to the <!> package.</p> <p><strong>Usage</strong></p> <!> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`period`,children:(e,t)=>{l(),i(e,r(`Period`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`class%20Period(modal.schedule.Schedule)`,lang:`python`});var h=c(m,8);p(c(e(h)),{href:`https://dateutil.readthedocs.io/en/latest/relativedelta.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`dateutil`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);d(g,{code:`import%20modal%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20f()%3A%0A%20%20%20%20print(%22This%20function%20will%20run%20every%20day%22)%0A%0Amodal.Period(hours%3D4)%20%20%20%20%20%20%20%20%20%20%23%20runs%20every%204%20hours%0Amodal.Period(minutes%3D15)%20%20%20%20%20%20%20%23%20runs%20every%2015%20minutes%0Amodal.Period(seconds%3Dmath.pi)%20%20%23%20runs%20every%203.141592653589793%20seconds`,lang:`python`}),d(c(g,2),{code:`__init__(self%2C%20*%2C%20years%3D0%2C%20months%3D0%2C%20weeks%3D0%2C%20days%3D0%2C%20hours%3D0%2C%20minutes%3D0%2C%0A%20%20%20%20seconds%3D0)`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DItZJSds.js.map
