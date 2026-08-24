(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c379b66e-4814-478d-b4e0-9f1d21f8bb8d`,e._sentryDebugIdIdentifier=`sentry-dbid-c379b66e-4814-478d-b4e0-9f1d21f8bb8d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`MultiOn: Twitter News Agent`,id:`multion-twitter-news-agent`,children:[{depth:2,value:`Import and define the app`,id:`import-and-define-the-app`},{depth:2,value:`Searching for AI News`,id:`searching-for-ai-news`},{depth:2,value:`Set up MultiOn`,id:`set-up-multion`},{depth:2,value:`Test running`,id:`test-running`},{depth:2,value:`Defining the schedule and deploying`,id:`defining-the-schedule-and-deploying`}]}],rawContent:`# MultiOn: Twitter News Agent

In this example, we use Modal to deploy a cron job that periodically checks for AI news everyday and tweets it on Twitter using the MultiOn Agent API.

## Import and define the app

Let's start off with imports, and defining a Modal app.

\`\`\`python
import os

import modal

app = modal.App("example-multion-news-agent")

\`\`\`

## Searching for AI News

Let's also define an image that has the \`multion\` package installed, so we can query the API.

\`\`\`python
multion_image = modal.Image.debian_slim().uv_pip_install("multion")

\`\`\`

We can now define our main entrypoint, which uses [MultiOn](https://www.multion.ai/)
to scrape AI news everyday and post it on our Twitter account.
We specify a [schedule](https://modal.com/docs/guide/cron) in the function decorator, which
means that our function will run automatically at the given interval.

## Set up MultiOn

[MultiOn](https://multion.ai/) is a Web Action Agent that can take actions on behalf of the user.
You can watch it in action [here](https://www.youtube.com/watch?v=Rm67ry6bogw).

The MultiOn API enables building the next level of web automation & custom AI agents capable of performing complex actions on the internet with just a few lines of code.

To get started, first create an account with [MultiOn](https://www.multion.ai/),
install the [MultiOn chrome extension](https://chrome.google.com/webstore/detail/ddmjhdbknfidiopmbaceghhhbgbpenmm)
and login to your Twitter account in your browser.
To use the API, create a MultiOn API Key
and store it as a Modal Secret on [the dashboard](https://modal.com/secrets)

\`\`\`python
@app.function(image=multion_image, secrets=[modal.Secret.from_name("MULTION_API_KEY")])
def news_tweet_agent():
    # Import MultiOn
    import multion

    # Login to MultiOn using the API key
    multion.login(use_api=True, multion_api_key=os.environ["MULTION_API_KEY"])

    # Enable the Agent to run locally
    multion.set_remote(False)

    params = {
        "url": "https://www.multion.ai",
        "cmd": "Go to twitter (im already signed in). Search for the last tweets i made (check the last 10 tweets). Remember them so then you can go a search for super interesting AI news. Search the news on up to 3 different sources. If you see that the source has not really interesting AI news or i already made a tweet about that, then go to a different one. When you finish the research, go and make a few small and interesting AI tweets with the info you gathered. Make sure the tweet is small but informative and interesting for AI enthusiasts. Don't do more than 5 tweets",
        "maxSteps": 100,
    }

    response = multion.browse(params)

    print(f"MultiOn response: {response}")


\`\`\`

## Test running

We can now test run our scheduled function as follows: \`modal run multion_news_agent.py.py::app.news_tweet_agent\`

## Defining the schedule and deploying

Let's define a function that will be called by Modal every day.

\`\`\`python
@app.function(schedule=modal.Cron("0 9 * * *"))
def run_daily():
    news_tweet_agent.remote()


\`\`\`

In order to deploy this as a persistent cron job, you can run \`modal deploy multion_news_agent.py\`.

Once the job is deployed, visit the [apps page](https://modal.com/apps) page to see
its execution history, logs and other stats.
`,meta:{title:`MultiOn: Twitter News Agent`,description:`In this example, we use Modal to deploy a cron job that periodically checks for AI news everyday and tweets it on Twitter using the MultiOn Agent API.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>In this example, we use Modal to deploy a cron job that periodically checks for AI news everyday and tweets it on Twitter using the MultiOn Agent API.</p> <!> <p>Let’s start off with imports, and defining a Modal app.</p> <!> <!> <p>Let’s also define an image that has the <code>multion</code> package installed, so we can query the API.</p> <!> <p>We can now define our main entrypoint, which uses <!> to scrape AI news everyday and post it on our Twitter account.
We specify a <!> in the function decorator, which
means that our function will run automatically at the given interval.</p> <!> <p><!> is a Web Action Agent that can take actions on behalf of the user.
You can watch it in action <!>.</p> <p>The MultiOn API enables building the next level of web automation & custom AI agents capable of performing complex actions on the internet with just a few lines of code.</p> <p>To get started, first create an account with <!>,
install the <!> and login to your Twitter account in your browser.
To use the API, create a MultiOn API Key
and store it as a Modal Secret on <!></p> <!> <!> <p>We can now test run our scheduled function as follows: <code>modal run multion_news_agent.py.py::app.news_tweet_agent</code></p> <!> <p>Let’s define a function that will be called by Modal every day.</p> <!> <p>In order to deploy this as a persistent cron job, you can run <code>modal deploy multion_news_agent.py</code>.</p> <p>Once the job is deployed, visit the <!> page to see
its execution history, logs and other stats.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`multion-twitter-news-agent`,children:(e,t)=>{l(),i(e,r(`MultiOn: Twitter News Agent`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`import-and-define-the-app`,children:(e,t)=>{l(),i(e,r(`Import and define the app`))},$$slots:{default:!0}});var g=c(h,4);f(g,{code:`import%20os%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-multion-news-agent%22)%0A`,lang:`python`});var _=c(g,2);u(_,{id:`searching-for-ai-news`,children:(e,t)=>{l(),i(e,r(`Searching for AI News`))},$$slots:{default:!0}});var v=c(_,4);f(v,{code:`multion_image%20%3D%20modal.Image.debian_slim().uv_pip_install(%22multion%22)%0A`,lang:`python`});var b=c(v,2),x=c(e(b));m(x,{href:`https://www.multion.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MultiOn`))},$$slots:{default:!0}}),m(c(x,2),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`schedule`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,2);u(S,{id:`set-up-multion`,children:(e,t)=>{l(),i(e,r(`Set up MultiOn`))},$$slots:{default:!0}});var C=c(S,2),w=e(C);m(w,{href:`https://multion.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MultiOn`))},$$slots:{default:!0}}),m(c(w,2),{href:`https://www.youtube.com/watch?v=Rm67ry6bogw`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(C);var T=c(C,4),E=c(e(T));m(E,{href:`https://www.multion.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MultiOn`))},$$slots:{default:!0}});var D=c(E,2);m(D,{href:`https://chrome.google.com/webstore/detail/ddmjhdbknfidiopmbaceghhhbgbpenmm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MultiOn chrome extension`))},$$slots:{default:!0}}),m(c(D,2),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the dashboard`))},$$slots:{default:!0}}),n(T);var O=c(T,2);f(O,{code:`%40app.function(image%3Dmultion_image%2C%20secrets%3D%5Bmodal.Secret.from_name(%22MULTION_API_KEY%22)%5D)%0Adef%20news_tweet_agent()%3A%0A%20%20%20%20%23%20Import%20MultiOn%0A%20%20%20%20import%20multion%0A%0A%20%20%20%20%23%20Login%20to%20MultiOn%20using%20the%20API%20key%0A%20%20%20%20multion.login(use_api%3DTrue%2C%20multion_api_key%3Dos.environ%5B%22MULTION_API_KEY%22%5D)%0A%0A%20%20%20%20%23%20Enable%20the%20Agent%20to%20run%20locally%0A%20%20%20%20multion.set_remote(False)%0A%0A%20%20%20%20params%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fwww.multion.ai%22%2C%0A%20%20%20%20%20%20%20%20%22cmd%22%3A%20%22Go%20to%20twitter%20(im%20already%20signed%20in).%20Search%20for%20the%20last%20tweets%20i%20made%20(check%20the%20last%2010%20tweets).%20Remember%20them%20so%20then%20you%20can%20go%20a%20search%20for%20super%20interesting%20AI%20news.%20Search%20the%20news%20on%20up%20to%203%20different%20sources.%20If%20you%20see%20that%20the%20source%20has%20not%20really%20interesting%20AI%20news%20or%20i%20already%20made%20a%20tweet%20about%20that%2C%20then%20go%20to%20a%20different%20one.%20When%20you%20finish%20the%20research%2C%20go%20and%20make%20a%20few%20small%20and%20interesting%20AI%20tweets%20with%20the%20info%20you%20gathered.%20Make%20sure%20the%20tweet%20is%20small%20but%20informative%20and%20interesting%20for%20AI%20enthusiasts.%20Don't%20do%20more%20than%205%20tweets%22%2C%0A%20%20%20%20%20%20%20%20%22maxSteps%22%3A%20100%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20response%20%3D%20multion.browse(params)%0A%0A%20%20%20%20print(f%22MultiOn%20response%3A%20%7Bresponse%7D%22)%0A%0A`,lang:`python`});var k=c(O,2);u(k,{id:`test-running`,children:(e,t)=>{l(),i(e,r(`Test running`))},$$slots:{default:!0}});var A=c(k,4);u(A,{id:`defining-the-schedule-and-deploying`,children:(e,t)=>{l(),i(e,r(`Defining the schedule and deploying`))},$$slots:{default:!0}});var j=c(A,4);f(j,{code:`%40app.function(schedule%3Dmodal.Cron(%220%209%20*%20*%20*%22))%0Adef%20run_daily()%3A%0A%20%20%20%20news_tweet_agent.remote()%0A%0A`,lang:`python`});var M=c(j,4);m(c(e(M)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`apps page`))},$$slots:{default:!0}}),l(),n(M),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=TS6peIXL.js.map
