(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`df4eab4f-64fe-4b5d-a04a-43d8991383ea`,e._sentryDebugIdIdentifier=`sentry-dbid-df4eab4f-64fe-4b5d-a04a-43d8991383ea`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./B6UiYoTw.js";var h={toc:[{depth:1,value:`Cron`,id:`cron`}],rawContent:`# Cron


\`\`\`python
class Cron(modal.schedule.Schedule)
\`\`\`

Cron jobs are a type of schedule, specified using the
[Unix cron tab](https://crontab.guru/) syntax.

The alternative schedule type is the [\`modal.Period\`](https://modal.com/docs/sdk/py/latest/Period).

\`\`\`python
__init__(self, cron_string, timezone="UTC")
\`\`\`
Construct a schedule that runs according to a cron expression string.

**Parameters**

<Parameter name="cron_string" type="str" description="Cron expression (see crontab.guru)." />
<Parameter name="timezone" type="str" defaultValue="&quot;UTC&quot;" description="IANA timezone name; defaults to UTC." />

**Usage**

\`\`\`python
import modal
app = modal.App()


@app.function(schedule=modal.Cron("* * * * *"))
def f():
    print("This function will run every minute")
\`\`\`

We can specify different schedules with cron strings, for example:

\`\`\`python
modal.Cron("5 4 * * *")  # run at 4:05am UTC every night
modal.Cron("0 9 * * 4")  # runs every Thursday at 9am UTC
\`\`\`

We can also optionally specify a timezone, for example:

\`\`\`python
modal.Cron("0 6 * * *", timezone="America/New_York")
\`\`\`

If no timezone is specified, the default is UTC.
`,meta:{title:`Cron`,description:`Cron jobs are a type of schedule, specified using the Unix cron tab syntax.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>modal.Period</code>`),b=t(`<!> <!> <p>Cron jobs are a type of schedule, specified using the <!> syntax.</p> <p>The alternative schedule type is the <!>.</p> <!> <p>Construct a schedule that runs according to a cron expression string.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <p>We can specify different schedules with cron strings, for example:</p> <!> <p>We can also optionally specify a timezone, for example:</p> <!> <p>If no timezone is specified, the default is UTC.</p>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),f=s(o);u(f,{id:`cron`,children:(e,t)=>{l(),i(e,r(`Cron`))},$$slots:{default:!0}});var h=c(f,2);d(h,{code:`class%20Cron(modal.schedule.Schedule)`,lang:`python`});var g=c(h,2);p(c(e(g)),{href:`https://crontab.guru/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Unix cron tab`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);p(c(e(_)),{href:`https://modal.com/docs/sdk/py/latest/Period`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);d(v,{code:`__init__(self%2C%20cron_string%2C%20timezone%3D%22UTC%22)`,lang:`python`});var x=c(v,6);m(x,{name:`cron_string`,type:`str`,description:`Cron expression (see crontab.guru).`});var S=c(x,2);m(S,{name:`timezone`,type:`str`,defaultValue:`"UTC"`,description:`IANA timezone name; defaults to UTC.`});var C=c(S,4);d(C,{code:`import%20modal%0Aapp%20%3D%20modal.App()%0A%0A%0A%40app.function(schedule%3Dmodal.Cron(%22*%20*%20*%20*%20*%22))%0Adef%20f()%3A%0A%20%20%20%20print(%22This%20function%20will%20run%20every%20minute%22)`,lang:`python`});var w=c(C,4);d(w,{code:`modal.Cron(%225%204%20*%20*%20*%22)%20%20%23%20run%20at%204%3A05am%20UTC%20every%20night%0Amodal.Cron(%220%209%20*%20*%204%22)%20%20%23%20runs%20every%20Thursday%20at%209am%20UTC`,lang:`python`}),d(c(w,4),{code:`modal.Cron(%220%206%20*%20*%20*%22%2C%20timezone%3D%22America%2FNew_York%22)`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=DU1zcPND.js.map
