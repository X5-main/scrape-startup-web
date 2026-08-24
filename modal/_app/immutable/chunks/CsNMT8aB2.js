(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`06442789-ee91-426e-a14a-ef09e811474e`,e._sentryDebugIdIdentifier=`sentry-dbid-06442789-ee91-426e-a14a-ef09e811474e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={crossLinks:[{text:`Hacker News Slackbot`,href:`/docs/examples/hackernews_alerts`}],toc:[{depth:1,value:`Scheduling remote cron jobs`,id:`scheduling-remote-cron-jobs`,children:[{depth:2,value:`Basic scheduling`,id:`basic-scheduling`},{depth:2,value:`Monitoring your scheduled runs`,id:`monitoring-your-scheduled-runs`},{depth:2,value:`Schedule types`,id:`schedule-types`}]}],rawContent:`# Scheduling remote cron jobs

A common requirement is to perform some task at a given time every day or week
automatically. Modal facilitates this through function schedules.

## Basic scheduling

Let's say we have a Python module \`heavy.py\` with a function,
\`perform_heavy_computation()\`.

\`\`\`python
# heavy.py
def perform_heavy_computation():
    ...

if __name__ == "__main__":
    perform_heavy_computation()
\`\`\`

To schedule this function to run once per day, we create a Modal App and attach
our function to it with the \`@app.function\` decorator and a schedule parameter:

\`\`\`python
# heavy.py
import modal

app = modal.App()

@app.function(schedule=modal.Period(days=1))
def perform_heavy_computation():
    ...
\`\`\`

To activate the schedule, deploy your App, either through the CLI:

\`\`\`shell
modal deploy --name daily_heavy heavy.py
\`\`\`

Or programmatically:

\`\`\`python
if __name__ == "__main__":
   app.deploy()
\`\`\`

Now the function will run every day, at the time of the initial deployment,
without any further interaction on your part.

When you make changes to your Function, just rerun the deploy command to
overwrite the old deployment.

Note that when you redeploy your Function, \`modal.Period\` resets, and the
schedule will run X hours after this most recent deployment.

If you want to run your Function at a regular schedule not disturbed by deploys,
\`modal.Cron\` (see below) is a better option.

## Monitoring your scheduled runs

To see past execution logs for the scheduled Function, go to the
[Apps](https://modal.com/apps) section on the Modal web site.

Schedules currently cannot be paused. Instead the schedule should be removed and
the App redeployed. Schedules can be started manually on the App's dashboard
page, using the "run now" button.

## Schedule types

There are two kinds of base schedule values -
[\`modal.Period\`](/docs/sdk/py/latest/Period) and
[\`modal.Cron\`](/docs/sdk/py/latest/Cron).

[\`modal.Period\`](/docs/sdk/py/latest/Period) lets you specify an interval
between function calls, e.g. \`Period(days=1)\` or \`Period(hours=5)\`:

\`\`\`python
# runs once every 5 hours
@app.function(schedule=modal.Period(hours=5))
def perform_heavy_computation():
    ...
\`\`\`

[\`modal.Cron\`](/docs/sdk/py/latest/Cron) gives you finer control using
[cron](https://en.wikipedia.org/wiki/Cron) syntax:

\`\`\`python
# runs at 8 am (UTC) every Monday
@app.function(schedule=modal.Cron("0 8 * * 1"))
def perform_heavy_computation():
    ...

# runs daily at 6 am (New York time)
@app.function(schedule=modal.Cron("0 6 * * *", timezone="America/New_York"))
def send_morning_report():
    ...
\`\`\`

For more details, see the API reference for
[Period](/docs/sdk/py/latest/Period), [Cron](/docs/sdk/py/latest/Cron) and
[Function](/docs/sdk/py/latest/Function)
`,meta:{title:`Scheduling remote cron jobs`,description:`A common requirement is to perform some task at a given time every day or week automatically. Modal facilitates this through function schedules.`}},{crossLinks:g,toc:_,rawContent:v,meta:y}=h,b=t(`<code>modal.Period</code>`),x=t(`<code>modal.Cron</code>`),S=t(`<code>modal.Period</code>`),C=t(`<code>modal.Cron</code>`),w=t(`<!> <p>A common requirement is to perform some task at a given time every day or week
automatically. Modal facilitates this through function schedules.</p> <!> <p>Let’s say we have a Python module <code>heavy.py</code> with a function, <code>perform_heavy_computation()</code>.</p> <!> <p>To schedule this function to run once per day, we create a Modal App and attach
our function to it with the <code>@app.function</code> decorator and a schedule parameter:</p> <!> <p>To activate the schedule, deploy your App, either through the CLI:</p> <!> <p>Or programmatically:</p> <!> <p>Now the function will run every day, at the time of the initial deployment,
without any further interaction on your part.</p> <p>When you make changes to your Function, just rerun the deploy command to
overwrite the old deployment.</p> <p>Note that when you redeploy your Function, <code>modal.Period</code> resets, and the
schedule will run X hours after this most recent deployment.</p> <p>If you want to run your Function at a regular schedule not disturbed by deploys, <code>modal.Cron</code> (see below) is a better option.</p> <!> <p>To see past execution logs for the scheduled Function, go to the <!> section on the Modal web site.</p> <p>Schedules currently cannot be paused. Instead the schedule should be removed and
the App redeployed. Schedules can be started manually on the App’s dashboard
page, using the “run now” button.</p> <!> <p>There are two kinds of base schedule values - <!> and <!>.</p> <p><!> lets you specify an interval
between function calls, e.g. <code>Period(days=1)</code> or <code>Period(hours=5)</code>:</p> <!> <p><!> gives you finer control using <!> syntax:</p> <!> <p>For more details, see the API reference for <!>, <!> and <!></p>`,1);function T(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=w(),p=s(o);d(p,{id:`scheduling-remote-cron-jobs`,children:(e,t)=>{l(),i(e,r(`Scheduling remote cron jobs`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`basic-scheduling`,children:(e,t)=>{l(),i(e,r(`Basic scheduling`))},$$slots:{default:!0}});var g=c(h,4);f(g,{code:`%23%20heavy.py%0Adef%20perform_heavy_computation()%3A%0A%20%20%20%20...%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20perform_heavy_computation()`,lang:`python`});var _=c(g,4);f(_,{code:`%23%20heavy.py%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20perform_heavy_computation()%3A%0A%20%20%20%20...`,lang:`python`});var v=c(_,4);f(v,{code:`modal%20deploy%20--name%20daily_heavy%20heavy.py`,lang:`shell`});var y=c(v,4);f(y,{code:`if%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20app.deploy()`,lang:`python`});var T=c(y,10);u(T,{id:`monitoring-your-scheduled-runs`,children:(e,t)=>{l(),i(e,r(`Monitoring your scheduled runs`))},$$slots:{default:!0}});var E=c(T,2);m(c(e(E)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Apps`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,4);u(D,{id:`schedule-types`,children:(e,t)=>{l(),i(e,r(`Schedule types`))},$$slots:{default:!0}});var O=c(D,2),k=c(e(O));m(k,{href:`/docs/sdk/py/latest/Period`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),m(c(k,2),{href:`/docs/sdk/py/latest/Cron`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(O);var A=c(O,2);m(e(A),{href:`/docs/sdk/py/latest/Period`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(5),n(A);var j=c(A,2);f(j,{code:`%23%20runs%20once%20every%205%20hours%0A%40app.function(schedule%3Dmodal.Period(hours%3D5))%0Adef%20perform_heavy_computation()%3A%0A%20%20%20%20...`,lang:`python`});var M=c(j,2),N=e(M);m(N,{href:`/docs/sdk/py/latest/Cron`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),m(c(N,2),{href:`https://en.wikipedia.org/wiki/Cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`cron`))},$$slots:{default:!0}}),l(),n(M);var P=c(M,2);f(P,{code:`%23%20runs%20at%208%20am%20(UTC)%20every%20Monday%0A%40app.function(schedule%3Dmodal.Cron(%220%208%20*%20*%201%22))%0Adef%20perform_heavy_computation()%3A%0A%20%20%20%20...%0A%0A%23%20runs%20daily%20at%206%20am%20(New%20York%20time)%0A%40app.function(schedule%3Dmodal.Cron(%220%206%20*%20*%20*%22%2C%20timezone%3D%22America%2FNew_York%22))%0Adef%20send_morning_report()%3A%0A%20%20%20%20...`,lang:`python`});var F=c(P,2),I=c(e(F));m(I,{href:`/docs/sdk/py/latest/Period`,children:(e,t)=>{l(),i(e,r(`Period`))},$$slots:{default:!0}});var L=c(I,2);m(L,{href:`/docs/sdk/py/latest/Cron`,children:(e,t)=>{l(),i(e,r(`Cron`))},$$slots:{default:!0}}),m(c(L,2),{href:`/docs/sdk/py/latest/Function`,children:(e,t)=>{l(),i(e,r(`Function`))},$$slots:{default:!0}}),n(F),i(t,o)},$$slots:{default:!0}}))}export{T as default,h as metadata};
//# sourceMappingURL=CsNMT8aB2.js.map
