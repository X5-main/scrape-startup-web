(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`25737bc1-b7bf-4ee6-9966-8b2774f52653`,e._sentryDebugIdIdentifier=`sentry-dbid-25737bc1-b7bf-4ee6-9966-8b2774f52653`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How to run cron jobs`,description:`A brief explanation of cron jobs, cron syntax, and how to run cron jobs on Modal.`,authors:[{name:`Kenny Ning`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`,jobTitle:`Data Engineer`,twitterHandle:`kenny_ning`}],date:`2024-04-30T12:00:00.000Z`,length:`3 minute read`,category:`Article`,subcategory:`Data Infrastructure`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is a cron job?`,id:`what-is-a-cron-job`},{depth:2,value:`Cron syntax`,id:`cron-syntax`},{depth:2,value:`Crontab`,id:`crontab`},{depth:2,value:`Limitations of cron`,id:`limitations-of-cron`,children:[{depth:3,value:`Primarily made for shell scripts`,id:`primarily-made-for-shell-scripts`},{depth:3,value:`No monitoring`,id:`no-monitoring`},{depth:3,value:`Requires cloud provisioning`,id:`requires-cloud-provisioning`}]},{depth:2,value:`How to run cron jobs on Modal`,id:`how-to-run-cron-jobs-on-modal`},{depth:2,value:`Examples (built on Modal cron jobs)`,id:`examples-built-on-modal-cron-jobs`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`## What is a cron job?

A cron job is a scheduled task. You can use cron jobs to automate work by running a script at a regular interval (e.g. every hour, every day).

There are many use cases for cron jobs:

- Running data jobs
- Sending reports or alerts
- System maintenance e.g. removing old Docker images

## Cron syntax

A cron schedule is specified with 5 numbers that specify (in order):

- Minute (0-59)
- Hour (0-23)
- Day of month (1-31)
- Month (1-12)
- Day of week (0-6)

The most common configuration you'll see is \`* * * * *\`, which means "run every minute". The second most common configuration is something like \`0 * * * *\`, which means "run hourly" or more specifically "run at minute zero of every hour".

Cron uses the time zone of the host machine, which is likely UTC.

Here's some other examples:

| Cron Example     | Explanation                                                              | Syntax Note                                             |
| ---------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| 0,30 \\* \\* \\* \\* | Twice an hour, once at the 0 minute mark and again at the 30 minute mark | \`,\` means "and"                                         |
| 0 6 \\* \\* 0      | Every Sunday at 6am UTC                                                  | Last value is day of week (0=Sunday)                    |
| \\* \\* 1 3,9 \\*   | Every minute on the 1st of March and September                           | 3rd and 4th values represent day of month and the month |
| \\* \\* \\* \\* 1-5  | Every minute, Mon-Fri                                                    | \`-\` defines a range of values                           |
| \\*/5 \\* \\* \\* \\* | Every 5 minutes                                                          | \`/\` defines step values or intervals                    |

[crontab.guru](https://crontab.guru/) is a great tool to double check your cron expressions.

## Crontab

The crontab is the file that specifies all your cron jobs using the cron syntax described above. On computers with a Unix-like operating system (e.g. MacOS, most cloud servers), you can add a cron job to the crontab by typing \`crontab -e\` from your terminal and adding your job in the format \`<cron schedule syntax> <path to executable script>\`. For example,

\`*/5 * * * * /Users/modal/run_job.sh\`

Once this is added to the crontab, your computer will execute the \`/Users/modal/run_job.sh\` script every 5 minutes.

## Limitations of cron

### Primarily made for shell scripts

This makes running data jobs annoying since they are most often written in Python or SQL and require additional configuration to get working.

### No monitoring

Cron jobs do not provide notifications or output when a job fails.

### Requires cloud provisioning

If you want to run cron jobs in the cloud, you need to set up an EC2 and go through the manual process of uploading your script, editing the crontab remotely, making sure the script stays updated, etc.

An alternative to cron jobs are orchestrator tools like Airflow, but this is often overkill for simple scheduled tasks.

## How to run cron jobs on Modal

We believe Modal is the best way to [run cron jobs in the cloud](https://modal.com/docs/guide/cron). Write your Python code locally, and decorate it with a [modal.Period](/docs/reference/modal.Period#modalperiod):

\`\`\`python
@app.function(schedule=modal.Period(days=1))
def f():
    print("This function will run every day")
\`\`\`

Or if you prefer using cron syntax, you can attach that as well:

\`\`\`python
@app.function(schedule=modal.Cron("0 0 * * *"))
def f():
    print("This function will run every day at midnight UTC")
\`\`\`

You can now schedule your Python script directly and get basic monitoring, all without having to touch any cloud providers or edit any crontab files.

## Examples (built on Modal cron jobs)

- [Scrape a comedy club's website every 10 minutes](https://twitter.com/_nateraw/status/1779588270424277483) and text yourself when new shows are added
- [Schedule ETL jobs](https://modal.com/blog/etl)
- Build a [Hacker News Slackbot](https://modal.com/docs/examples/hackernews_alerts#defining-the-schedule-and-deploying) that queries the Hacker News API every day and posts the results to a Slack channel

## Conclusion

Cron has been around for decades and is one of the most battle-tested pieces of software out there. You can't go wrong using cron jobs for simple scheduled tasks, and Modal has made it even easier to manage cron jobs for your data and automation needs.
`,meta:{description:`A brief explanation of cron jobs, cron syntax, and how to run cron jobs on Modal.`}},{title:h,description:g,authors:_,date:v,length:y,category:b,subcategory:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=m,D=t(`<thead><tr><th>Cron Example</th><th>Explanation</th><th>Syntax Note</th></tr></thead> <tbody><tr><td>0,30 * * * *</td><td>Twice an hour, once at the 0 minute mark and again at the 30 minute mark</td><td><code>,</code> means “and”</td></tr><tr><td>0 6 * * 0</td><td>Every Sunday at 6am UTC</td><td>Last value is day of week (0=Sunday)</td></tr><tr><td>* * 1 3,9 *</td><td>Every minute on the 1st of March and September</td><td>3rd and 4th values represent day of month and the month</td></tr><tr><td>* * * * 1-5</td><td>Every minute, Mon-Fri</td><td><code>-</code> defines a range of values</td></tr><tr><td>*/5 * * * *</td><td>Every 5 minutes</td><td><code>/</code> defines step values or intervals</td></tr></tbody>`,1),O=t(`<h2 id="what-is-a-cron-job">What is a cron job?</h2> <p>A cron job is a scheduled task. You can use cron jobs to automate work by running a script at a regular interval (e.g. every hour, every day).</p> <p>There are many use cases for cron jobs:</p> <ul><li>Running data jobs</li> <li>Sending reports or alerts</li> <li>System maintenance e.g. removing old Docker images</li></ul> <h2 id="cron-syntax">Cron syntax</h2> <p>A cron schedule is specified with 5 numbers that specify (in order):</p> <ul><li>Minute (0-59)</li> <li>Hour (0-23)</li> <li>Day of month (1-31)</li> <li>Month (1-12)</li> <li>Day of week (0-6)</li></ul> <p>The most common configuration you’ll see is <code>* * * * *</code>, which means “run every minute”. The second most common configuration is something like <code>0 * * * *</code>, which means “run hourly” or more specifically “run at minute zero of every hour”.</p> <p>Cron uses the time zone of the host machine, which is likely UTC.</p> <p>Here’s some other examples:</p> <!> <p><!> is a great tool to double check your cron expressions.</p> <h2 id="crontab">Crontab</h2> <p>The crontab is the file that specifies all your cron jobs using the cron syntax described above. On computers with a Unix-like operating system (e.g. MacOS, most cloud servers), you can add a cron job to the crontab by typing <code>crontab -e</code> from your terminal and adding your job in the format <code>&lt;cron schedule syntax&gt; &lt;path to executable script&gt;</code>. For example,</p> <p><code>*/5 * * * * /Users/modal/run_job.sh</code></p> <p>Once this is added to the crontab, your computer will execute the <code>/Users/modal/run_job.sh</code> script every 5 minutes.</p> <h2 id="limitations-of-cron">Limitations of cron</h2> <h3 id="primarily-made-for-shell-scripts">Primarily made for shell scripts</h3> <p>This makes running data jobs annoying since they are most often written in Python or SQL and require additional configuration to get working.</p> <h3 id="no-monitoring">No monitoring</h3> <p>Cron jobs do not provide notifications or output when a job fails.</p> <h3 id="requires-cloud-provisioning">Requires cloud provisioning</h3> <p>If you want to run cron jobs in the cloud, you need to set up an EC2 and go through the manual process of uploading your script, editing the crontab remotely, making sure the script stays updated, etc.</p> <p>An alternative to cron jobs are orchestrator tools like Airflow, but this is often overkill for simple scheduled tasks.</p> <h2 id="how-to-run-cron-jobs-on-modal">How to run cron jobs on Modal</h2> <p>We believe Modal is the best way to <!>. Write your Python code locally, and decorate it with a <!>:</p> <!> <p>Or if you prefer using cron syntax, you can attach that as well:</p> <!> <p>You can now schedule your Python script directly and get basic monitoring, all without having to touch any cloud providers or edit any crontab files.</p> <h2 id="examples-built-on-modal-cron-jobs">Examples (built on Modal cron jobs)</h2> <ul><li><!> and text yourself when new shows are added</li> <li><!></li> <li>Build a <!> that queries the Hacker News API every day and posts the results to a Slack channel</li></ul> <h2 id="conclusion">Conclusion</h2> <p>Cron has been around for decades and is one of the most battle-tested pieces of software out there. You can’t go wrong using cron jobs for simple scheduled tasks, and Modal has made it even easier to manage cron jobs for your data and automation needs.</p>`,1);function k(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=O(),p=c(s(o),20);u(p,{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}});var m=c(p,2);f(e(m),{href:`https://crontab.guru/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`crontab.guru`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,28),g=c(e(h));f(g,{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`run cron jobs in the cloud`))},$$slots:{default:!0}}),f(c(g,2),{href:`/docs/reference/modal.Period#modalperiod`,children:(e,t)=>{l(),i(e,r(`modal.Period`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);d(_,{code:`%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20f()%3A%0A%20%20%20%20print(%22This%20function%20will%20run%20every%20day%22)`,lang:`python`});var v=c(_,4);d(v,{code:`%40app.function(schedule%3Dmodal.Cron(%220%200%20*%20*%20*%22))%0Adef%20f()%3A%0A%20%20%20%20print(%22This%20function%20will%20run%20every%20day%20at%20midnight%20UTC%22)`,lang:`python`});var y=c(v,6),b=e(y);f(e(b),{href:`https://twitter.com/_nateraw/status/1779588270424277483`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Scrape a comedy club’s website every 10 minutes`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);f(e(x),{href:`https://modal.com/blog/etl`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Schedule ETL jobs`))},$$slots:{default:!0}}),n(x);var S=c(x,2);f(c(e(S)),{href:`https://modal.com/docs/examples/hackernews_alerts#defining-the-schedule-and-deploying`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hacker News Slackbot`))},$$slots:{default:!0}}),l(),n(S),n(y),l(4),i(t,o)},$$slots:{default:!0}}))}export{k as default,m as metadata};
//# sourceMappingURL=CIy64WT2.js.map
