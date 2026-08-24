(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fbefc909-a94a-41e6-bcf9-b4773103edee`,e._sentryDebugIdIdentifier=`sentry-dbid-fbefc909-a94a-41e6-bcf9-b4773103edee`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Scheduling remote jobs`,id:`scheduling-remote-jobs`}],rawContent:`# Scheduling remote jobs

This example shows how you can schedule remote jobs on Modal.
You can do this either with:

- [\`modal.Period\`](https://modal.com/docs/reference/modal.Period) - a time interval between function calls.
- [\`modal.Cron\`](https://modal.com/docs/reference/modal.Cron) - a cron expression to specify the schedule.

In the code below, the first function runs every
5 seconds, and the second function runs every minute. We use the \`schedule\`
argument to specify the schedule for each function. The \`schedule\` argument can
take a \`modal.Period\` object to specify a time interval or a \`modal.Cron\` object
to specify a cron expression.

\`\`\`python
import time
from datetime import datetime

import modal

app = modal.App("example-schedule-simple")


@app.function(schedule=modal.Period(seconds=5))
def print_time_1():
    print(
        f"Printing with period 5 seconds: {datetime.now().strftime('%m/%d/%Y, %H:%M:%S')}"
    )


@app.function(schedule=modal.Cron("* * * * *"))
def print_time_2():
    print(
        f"Printing with cron every minute: {datetime.now().strftime('%m/%d/%Y, %H:%M:%S')}"
    )


if __name__ == "__main__":
    with modal.enable_output():
        with app.run():
            time.sleep(60)

\`\`\`
`,meta:{title:`Scheduling remote jobs`,description:`This example shows how you can schedule remote jobs on Modal. You can do this either with:`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>modal.Period</code>`),y=t(`<code>modal.Cron</code>`),b=t(`<!> <p>This example shows how you can schedule remote jobs on Modal.
You can do this either with:</p> <ul><li><!> - a time interval between function calls.</li> <li><!> - a cron expression to specify the schedule.</li></ul> <p>In the code below, the first function runs every
5 seconds, and the second function runs every minute. We use the <code>schedule</code> argument to specify the schedule for each function. The <code>schedule</code> argument can
take a <code>modal.Period</code> object to specify a time interval or a <code>modal.Cron</code> object
to specify a cron expression.</p> <!>`,1);function x(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=b(),f=s(o);u(f,{id:`scheduling-remote-jobs`,children:(e,t)=>{l(),i(e,r(`Scheduling remote jobs`))},$$slots:{default:!0}});var m=c(f,4),h=e(m);p(e(h),{href:`https://modal.com/docs/reference/modal.Period`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);p(e(g),{href:`https://modal.com/docs/reference/modal.Cron`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(g),n(m),d(c(m,4),{code:`import%20time%0Afrom%20datetime%20import%20datetime%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-schedule-simple%22)%0A%0A%0A%40app.function(schedule%3Dmodal.Period(seconds%3D5))%0Adef%20print_time_1()%3A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22Printing%20with%20period%205%20seconds%3A%20%7Bdatetime.now().strftime('%25m%2F%25d%2F%25Y%2C%20%25H%3A%25M%3A%25S')%7D%22%0A%20%20%20%20)%0A%0A%0A%40app.function(schedule%3Dmodal.Cron(%22*%20*%20*%20*%20*%22))%0Adef%20print_time_2()%3A%0A%20%20%20%20print(%0A%20%20%20%20%20%20%20%20f%22Printing%20with%20cron%20every%20minute%3A%20%7Bdatetime.now().strftime('%25m%2F%25d%2F%25Y%2C%20%25H%3A%25M%3A%25S')%7D%22%0A%20%20%20%20)%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20with%20modal.enable_output()%3A%0A%20%20%20%20%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(60)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,m as metadata};
//# sourceMappingURL=k3HqXaE_2.js.map
