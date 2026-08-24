(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`113121ad-8ffd-41f9-9c73-677c71641136`,e._sentryDebugIdIdentifier=`sentry-dbid-113121ad-8ffd-41f9-9c73-677c71641136`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run cron jobs in the cloud to search Hacker News`,id:`run-cron-jobs-in-the-cloud-to-search-hacker-news`,children:[{depth:2,value:`Import and define the app`,id:`import-and-define-the-app`},{depth:2,value:`Defining the function and importing the secret`,id:`defining-the-function-and-importing-the-secret`},{depth:2,value:`Searching Hacker News`,id:`searching-hacker-news`},{depth:2,value:`Test running`,id:`test-running`},{depth:2,value:`Defining the schedule and deploying`,id:`defining-the-schedule-and-deploying`}]}],rawContent:`# Run cron jobs in the cloud to search Hacker News

In this example, we use Modal to deploy a cron job that periodically queries Hacker News for
new posts matching a given search term, and posts the results to Slack.

## Import and define the app

Let's start off with imports, and defining a Modal app.

\`\`\`python
import os
from datetime import datetime, timedelta

import modal

app = modal.App("example-hackernews-alerts")

\`\`\`

Now, let's define an image that has the \`slack-sdk\` package installed, in which we can run a function
that posts a slack message.

\`\`\`python
slack_sdk_image = modal.Image.debian_slim().uv_pip_install("slack-sdk")

\`\`\`

## Defining the function and importing the secret

Our Slack bot will need access to a bot token.
We can use Modal's [Secrets](https://modal.com/secrets) interface to accomplish this.
To quickly create a Slack bot secret, click the "Create new secret" button.
Then, select the Slack secret template from the list options,
and follow the instructions in the "Where to find the credentials?" panel.
Name your secret \`hn-bot-slack.\`

Now, we define the function \`post_to_slack\`, which simply instantiates the Slack client using our token,
and then uses it to post a message to a given channel name.

\`\`\`python
@app.function(
    image=slack_sdk_image,
    secrets=[modal.Secret.from_name("hn-bot-slack", required_keys=["SLACK_BOT_TOKEN"])],
)
async def post_to_slack(message: str):
    import slack_sdk

    client = slack_sdk.WebClient(token=os.environ["SLACK_BOT_TOKEN"])
    client.chat_postMessage(channel="hn-alerts", text=message)


\`\`\`

## Searching Hacker News

We are going to use Algolia's [Hacker News Search API](https://hn.algolia.com/api) to query for posts
matching a given search term in the past X days. Let's define our search term and query period.

\`\`\`python
QUERY = "serverless"
WINDOW_SIZE_DAYS = 1

\`\`\`

Let's also define an image that has the \`requests\` package installed, so we can query the API.

\`\`\`python
requests_image = modal.Image.debian_slim().uv_pip_install("requests")

\`\`\`

We can now define our main entrypoint, that queries Algolia for the term, and calls \`post_to_slack\`
on all the results. We specify a [schedule](https://modal.com/docs/guide/cron)
in the function decorator, which means that our function will run automatically at the given interval.

\`\`\`python
@app.function(image=requests_image)
def search_hackernews():
    import requests

    url = "http://hn.algolia.com/api/v1/search"

    threshold = datetime.utcnow() - timedelta(days=WINDOW_SIZE_DAYS)

    params = {
        "query": QUERY,
        "numericFilters": f"created_at_i>{threshold.timestamp()}",
    }

    response = requests.get(url, params, timeout=10).json()
    urls = [item["url"] for item in response["hits"] if item.get("url")]

    print(f"Query returned {len(urls)} items.")

    post_to_slack.for_each(urls)


\`\`\`

## Test running

We can now test run our scheduled function as follows: \`modal run hackernews_alerts.py::app.search_hackernews\`

## Defining the schedule and deploying

Let's define a function that will be called by Modal every day

\`\`\`python
@app.function(schedule=modal.Period(days=1))
def run_daily():
    search_hackernews.remote()


\`\`\`

In order to deploy this as a persistent cron job, you can run \`modal deploy hackernews_alerts.py\`,

Once the job is deployed, visit the [apps page](https://modal.com/apps) page to see
its execution history, logs and other stats.
`,meta:{title:`Run cron jobs in the cloud to search Hacker News`,description:`In this example, we use Modal to deploy a cron job that periodically queries Hacker News for new posts matching a given search term, and posts the results to Slack.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>In this example, we use Modal to deploy a cron job that periodically queries Hacker News for
new posts matching a given search term, and posts the results to Slack.</p> <!> <p>Let’s start off with imports, and defining a Modal app.</p> <!> <p>Now, let’s define an image that has the <code>slack-sdk</code> package installed, in which we can run a function
that posts a slack message.</p> <!> <!> <p>Our Slack bot will need access to a bot token.
We can use Modal’s <!> interface to accomplish this.
To quickly create a Slack bot secret, click the “Create new secret” button.
Then, select the Slack secret template from the list options,
and follow the instructions in the “Where to find the credentials?” panel.
Name your secret <code>hn-bot-slack.</code></p> <p>Now, we define the function <code>post_to_slack</code>, which simply instantiates the Slack client using our token,
and then uses it to post a message to a given channel name.</p> <!> <!> <p>We are going to use Algolia’s <!> to query for posts
matching a given search term in the past X days. Let’s define our search term and query period.</p> <!> <p>Let’s also define an image that has the <code>requests</code> package installed, so we can query the API.</p> <!> <p>We can now define our main entrypoint, that queries Algolia for the term, and calls <code>post_to_slack</code> on all the results. We specify a <!> in the function decorator, which means that our function will run automatically at the given interval.</p> <!> <!> <p>We can now test run our scheduled function as follows: <code>modal run hackernews_alerts.py::app.search_hackernews</code></p> <!> <p>Let’s define a function that will be called by Modal every day</p> <!> <p>In order to deploy this as a persistent cron job, you can run <code>modal deploy hackernews_alerts.py</code>,</p> <p>Once the job is deployed, visit the <!> page to see
its execution history, logs and other stats.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`run-cron-jobs-in-the-cloud-to-search-hacker-news`,children:(e,t)=>{l(),i(e,r(`Run cron jobs in the cloud to search Hacker News`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`import-and-define-the-app`,children:(e,t)=>{l(),i(e,r(`Import and define the app`))},$$slots:{default:!0}});var g=c(h,4);f(g,{code:`import%20os%0Afrom%20datetime%20import%20datetime%2C%20timedelta%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-hackernews-alerts%22)%0A`,lang:`python`});var _=c(g,4);f(_,{code:`slack_sdk_image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22slack-sdk%22)%0A`,lang:`python`});var v=c(_,2);u(v,{id:`defining-the-function-and-importing-the-secret`,children:(e,t)=>{l(),i(e,r(`Defining the function and importing the secret`))},$$slots:{default:!0}});var b=c(v,2);m(c(e(b)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}}),l(2),n(b);var x=c(b,4);f(x,{code:`%40app.function(%0A%20%20%20%20image%3Dslack_sdk_image%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22hn-bot-slack%22%2C%20required_keys%3D%5B%22SLACK_BOT_TOKEN%22%5D)%5D%2C%0A)%0Aasync%20def%20post_to_slack(message%3A%20str)%3A%0A%20%20%20%20import%20slack_sdk%0A%0A%20%20%20%20client%20%3D%20slack_sdk.WebClient(token%3Dos.environ%5B%22SLACK_BOT_TOKEN%22%5D)%0A%20%20%20%20client.chat_postMessage(channel%3D%22hn-alerts%22%2C%20text%3Dmessage)%0A%0A`,lang:`python`});var S=c(x,2);u(S,{id:`searching-hacker-news`,children:(e,t)=>{l(),i(e,r(`Searching Hacker News`))},$$slots:{default:!0}});var C=c(S,2);m(c(e(C)),{href:`https://hn.algolia.com/api`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hacker News Search API`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);f(w,{code:`QUERY%20%3D%20%22serverless%22%0AWINDOW_SIZE_DAYS%20%3D%201%0A`,lang:`python`});var T=c(w,4);f(T,{code:`requests_image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22requests%22)%0A`,lang:`python`});var E=c(T,2);m(c(e(E),3),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`schedule`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);f(D,{code:`%40app.function(image%3Drequests_image)%0Adef%20search_hackernews()%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20url%20%3D%20%22http%3A%2F%2Fhn.algolia.com%2Fapi%2Fv1%2Fsearch%22%0A%0A%20%20%20%20threshold%20%3D%20datetime.utcnow()%20-%20timedelta(days%3DWINDOW_SIZE_DAYS)%0A%0A%20%20%20%20params%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22query%22%3A%20QUERY%2C%0A%20%20%20%20%20%20%20%20%22numericFilters%22%3A%20f%22created_at_i%3E%7Bthreshold.timestamp()%7D%22%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20response%20%3D%20requests.get(url%2C%20params%2C%20timeout%3D10).json()%0A%20%20%20%20urls%20%3D%20%5Bitem%5B%22url%22%5D%20for%20item%20in%20response%5B%22hits%22%5D%20if%20item.get(%22url%22)%5D%0A%0A%20%20%20%20print(f%22Query%20returned%20%7Blen(urls)%7D%20items.%22)%0A%0A%20%20%20%20post_to_slack.for_each(urls)%0A%0A`,lang:`python`});var O=c(D,2);u(O,{id:`test-running`,children:(e,t)=>{l(),i(e,r(`Test running`))},$$slots:{default:!0}});var k=c(O,4);u(k,{id:`defining-the-schedule-and-deploying`,children:(e,t)=>{l(),i(e,r(`Defining the schedule and deploying`))},$$slots:{default:!0}});var A=c(k,4);f(A,{code:`%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20run_daily()%3A%0A%20%20%20%20search_hackernews.remote()%0A%0A`,lang:`python`});var j=c(A,4);m(c(e(j)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`apps page`))},$$slots:{default:!0}}),l(),n(j),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=CnbPqZPL2.js.map
