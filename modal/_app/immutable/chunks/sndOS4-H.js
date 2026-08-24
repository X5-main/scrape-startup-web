(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d5eab28b-cf97-4453-a5f2-3d387eed0ca1`,e._sentryDebugIdIdentifier=`sentry-dbid-d5eab28b-cf97-4453-a5f2-3d387eed0ca1`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`A simple web scraper`,id:`a-simple-web-scraper`,children:[{depth:2,value:`Set up your first Modal app`,id:`set-up-your-first-modal-app`},{depth:2,value:`Scrape links locally`,id:`scrape-links-locally`},{depth:2,value:`Run it on Modal`,id:`run-it-on-modal`},{depth:2,value:`Add dependencies`,id:`add-dependencies`},{depth:2,value:`Scale out`,id:`scale-out`},{depth:2,value:`Deploy it and run it on a schedule`,id:`deploy-it-and-run-it-on-a-schedule`},{depth:2,value:`Add Secrets and integrate with other systems`,id:`add-secrets-and-integrate-with-other-systems`},{depth:2,value:`Summary`,id:`summary`}]}],rawContent:`# A simple web scraper

In this guide we'll introduce you to Modal by writing a simple web scraper.
We'll explain the foundations of a Modal application step by step.

## Set up your first Modal app

Modal Apps are orchestrated as Python scripts but can theoretically run
anything you can run in a container. To get you started, make sure to install
the latest \`modal\` Python package and set up an API token (the first two steps
[here](https://modal.com/docs/guide)).

## Scrape links locally

First, we create an empty Python file \`webscraper.py\`. This file will contain our
application code. Let's write some basic Python code to fetch the contents of a
web page and print the links (\`href\` attributes) it finds in the document:

\`\`\`python
import re
import sys
import urllib.request


def get_links(url):
    response = urllib.request.urlopen(url)
    html = response.read().decode("utf8")
    links = []
    for match in re.finditer('href="(.*?)"', html):
        links.append(match.group(1))
    return links


if __name__ == "__main__":
    links = get_links(sys.argv[1])
    print(links)
\`\`\`

Now obviously this is just pure standard library Python code, and you can run it
on your machine:

\`\`\`bash
$ python webscraper.py http://example.com
['https://www.iana.org/domains/example']
\`\`\`

## Run it on Modal

To make the \`get_links\` function run on Modal instead of your local machine, all
you need to do is

- Import \`modal\`
- Create a [\`modal.App\`](/docs/reference/modal.App) instance
- Add an \`@app.function()\` annotation to your function
- Replace the \`if __name__ == "__main__":\` block with a function decorated with
  [\`@app.local_entrypoint()\`](/docs/reference/modal.App#local_entrypoint)
- Call \`get_links\` using \`get_links.remote\`

\`\`\`python
import re
import urllib.request
import modal

app = modal.App(name="example-webscraper")


@app.function()
def get_links(url):
    response = urllib.request.urlopen(url)
    html = response.read().decode("utf8")
    links = []
    for match in re.finditer('href="(.*?)"', html):
        links.append(match.group(1))
    return links


@app.local_entrypoint()
def main(url):
    links = get_links.remote(url)
    print(links)
\`\`\`

You can now run this with the Modal CLI, using \`modal run\` instead of \`python\`.
This time, you'll see additional progress indicators while the script is
running, something like:

\`\`\`bash
$ modal run webscraper.py --url http://example.com
✓ Initialized.
✓ Created objects.
['https://www.iana.org/domains/example']
✓ App completed.
\`\`\`

## Add dependencies

In the code above we make use of the Python standard library \`urllib\` library.
This works great for static web pages, but many pages these days use javascript
to dynamically load content, which wouldn't appear in the loaded html file.
Let's use the [Playwright](https://playwright.dev/python/docs/intro) package to
instead launch a headless Chromium browser which can interpret any javascript
that might be on the page.

We can pass [custom container images](/docs/guide/images) (defined using
[\`modal.Image\`](/docs/reference/modal.Image)) to the \`@app.function()\`
decorator. We'll make use of the \`modal.Image.debian_slim\` pre-bundled Image add
the shell commands to install Playwright and its dependencies:

\`\`\`python
import modal

app = modal.App("example-webscraper")
playwright_image = modal.Image.debian_slim(python_version="3.10").run_commands(
    "apt-get update",
    "apt-get install -y software-properties-common",
    "apt-add-repository non-free",
    "apt-add-repository contrib",
    "pip install playwright==1.42.0",
    "playwright install-deps chromium",
    "playwright install chromium",
)

\`\`\`

Note that we don't have to install Playwright or Chromium on our development
machine since this will all run in Modal. We can now modify our \`get_links\`
function to make use of the new tools.

\`\`\`python
@app.function(image=playwright_image)
async def get_links(cur_url: str) -> list[str]:
    from playwright.async_api import (
        TimeoutError as PlaywrightTimeoutError,
        async_playwright,
    )

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto(cur_url, timeout=10_000)  # ten seconds
        except PlaywrightTimeoutError:
            print(f"Timeout loading {cur_url}, skipping")
            await browser.close()
            return []

        links = await page.eval_on_selector_all(
            "a[href]", "elements => elements.map(element => element.href)"
        )
        await browser.close()

    print("Links", links)
    return list(set(links))


\`\`\`

Since Playwright has a nice async interface, we'll redeclare our \`get_links\`
function as async (Modal works with both sync and async functions).

The first time you run the function after making this change, you'll notice that
the output first shows the progress of building the image you specified,
after which your function runs like before. This image is then cached so that on
subsequent runs of the function it will not be rebuilt as long as the image
definition is the same.

## Scale out

So far, our script only fetches the links for a single page. What if we want to
scrape a large list of links in parallel?

We can do this easily with Modal, because of some magic: the function we wrapped
with the \`@app.function()\` decorator is no longer an ordinary function, but a
Modal [Function](https://modal.com/docs/reference/modal.Function) object. This
means it comes with a \`map\` property built in, that lets us run this function
for all inputs in parallel, scaling up to as many workers as needed.

Let's change our code to scrape all urls we feed to it in parallel:

\`\`\`python
@app.local_entrypoint()
def main():
    urls = ["http://modal.com", "http://github.com"]
    for links in get_links.map(urls):
        for link in links:
            print(link)
\`\`\`

## Deploy it and run it on a schedule

Let's say we want to log the scraped links daily. We move the print loop into
its own Modal function and annotate it with a \`modal.Period(days=1)\` schedule -
indicating we want to run it once per day. Since the scheduled function will not
run from our command line, we also add a hard-coded list of links to crawl for
now. In a more realistic setting we could read this from a database or other
accessible data source.

\`\`\`python
@app.function(schedule=modal.Period(days=1))
def daily_scrape():
    urls = ["http://modal.com", "http://github.com"]
    for links in get_links.map(urls):
        for link in links:
            print(link)
\`\`\`

To deploy App permanently, run the command

\`\`\`
modal deploy webscraper.py
\`\`\`

Running this command deploys this function and then closes immediately. We can
see the deployment and all of its runs, including the printed links, on the
Modal [Apps page](https://modal.com/apps). Rerunning the script will redeploy
the code with any changes you have made - overwriting an existing deploy with
the same name ("example-webscraper" in this case).

## Add Secrets and integrate with other systems

Instead of looking at the links in the run logs of our deployments, let's say we
wanted to post them to a \`#scraped-links\` Slack channel. To do this, we can
make use of the [Slack API](https://api.slack.com/) and the \`slack-sdk\`
[PyPI package](https://pypi.org/project/slack-sdk/).

The Slack SDK WebClient requires an API token to get access to our Slack
Workspace, and since it's bad practice to hardcode credentials into application
code we make use of Modal's **Secrets**. Secrets are snippets of data that will
be injected as environment variables in the containers running your functions.

The easiest way to create Secrets is to go to the
[Secrets section of modal.com](https://modal.com/secrets). You can both create a
free-form secret with any environment variables, or make use of presets for
common services. We'll use the Slack preset and after filling in the necessary
information we are presented with a snippet of code that can be used to post to
Slack using our credentials, which looks something like:

\`\`\`python
import os

slack_sdk_image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "slack-sdk"
)


@app.function(
    image=slack_sdk_image,
    secrets=[
        modal.Secret.from_name(
            "scraper-slack-secret", required_keys=["SLACK_BOT_TOKEN"]
        )
    ],
    retries=3,
)
def bot_token_msg(channel, message):
    import slack_sdk

    client = slack_sdk.WebClient(token=os.environ["SLACK_BOT_TOKEN"])
    print(f"Posting {message} to #{channel}")
    client.chat_postMessage(channel=channel, text=message)


\`\`\`

Notice the \`retries\` in the \`@app.function\` decorator.
That parameter adds automatic retries when Function calls fail
due to temporary issues, like rate limits. Read more [here](https://modal.com/docs/guide/retries)

Copy that code, then amend the \`daily_scrape\` function to call
\`bot_token_msg\`. We also add a per-URL \`limit\` for good measure.

\`\`\`python
@app.function(schedule=modal.Period(days=1))
def daily_scrape(limit: int = 50):
    urls = ["http://modal.com", "http://github.com"]

    for links in get_links.map(urls):
        for link in links[:limit]:
            bot_token_msg.remote("scraped-links", link)


@app.local_entrypoint()
def main():
    urls = ["http://modal.com", "http://github.com"]
    for links in get_links.map(urls):
        for link in links:
            print(link)


\`\`\`

Note that we are freely making function calls across completely different
container images, as if they were regular Python functions in the same program!

We keep the \`local_entrypoint\` the same so that we can still \`modal run\`
this script to test the scraping behavior without posting to Slack.

\`\`\`bash
modal run webscraper.py  # runs get_links.map via the local_entrypoint
\`\`\`

If we want to test the \`daily_scrape\` or \`bot_token_msg\` Functions themselves, we can do that too!
We just add the name of the Function to the end of our \`modal run\` command:

\`\`\`bash
modal run webscraper.py::daily_scrape --limit 1  # quick test
\`\`\`

Now redeploy the script to overwrite the old deploy with our updated code, and
you'll get a daily feed of scraped links in your Slack channel 🎉

\`\`\`bash
modal deploy webscraper.py
\`\`\`

## Summary

We have shown how you can use Modal to develop distributed Python data
applications using custom containers. Through simple constructs we were able to
add parallel execution. With the change of a single line of code were were able
to go from experimental development code to a deployed application. We hope
this overview gives you a glimpse of what you are able to build using Modal.
`,meta:{title:`A simple web scraper`,description:`In this guide we’ll introduce you to Modal by writing a simple web scraper. We’ll explain the foundations of a Modal application step by step.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>modal.App</code>`),b=t(`<code>@app.local_entrypoint()</code>`),x=t(`<code>modal.Image</code>`),S=t(`<!> <p>In this guide we’ll introduce you to Modal by writing a simple web scraper.
We’ll explain the foundations of a Modal application step by step.</p> <!> <p>Modal Apps are orchestrated as Python scripts but can theoretically run
anything you can run in a container. To get you started, make sure to install
the latest <code>modal</code> Python package and set up an API token (the first two steps <!>).</p> <!> <p>First, we create an empty Python file <code>webscraper.py</code>. This file will contain our
application code. Let’s write some basic Python code to fetch the contents of a
web page and print the links (<code>href</code> attributes) it finds in the document:</p> <!> <p>Now obviously this is just pure standard library Python code, and you can run it
on your machine:</p> <!> <!> <p>To make the <code>get_links</code> function run on Modal instead of your local machine, all
you need to do is</p> <ul><li>Import <code>modal</code></li> <li>Create a <!> instance</li> <li>Add an <code>@app.function()</code> annotation to your function</li> <li>Replace the <code>if __name__ == "__main__":</code> block with a function decorated with <!></li> <li>Call <code>get_links</code> using <code>get_links.remote</code></li></ul> <!> <p>You can now run this with the Modal CLI, using <code>modal run</code> instead of <code>python</code>.
This time, you’ll see additional progress indicators while the script is
running, something like:</p> <!> <!> <p>In the code above we make use of the Python standard library <code>urllib</code> library.
This works great for static web pages, but many pages these days use javascript
to dynamically load content, which wouldn’t appear in the loaded html file.
Let’s use the <!> package to
instead launch a headless Chromium browser which can interpret any javascript
that might be on the page.</p> <p>We can pass <!> (defined using <!>) to the <code>@app.function()</code> decorator. We’ll make use of the <code>modal.Image.debian_slim</code> pre-bundled Image add
the shell commands to install Playwright and its dependencies:</p> <!> <p>Note that we don’t have to install Playwright or Chromium on our development
machine since this will all run in Modal. We can now modify our <code>get_links</code> function to make use of the new tools.</p> <!> <p>Since Playwright has a nice async interface, we’ll redeclare our <code>get_links</code> function as async (Modal works with both sync and async functions).</p> <p>The first time you run the function after making this change, you’ll notice that
the output first shows the progress of building the image you specified,
after which your function runs like before. This image is then cached so that on
subsequent runs of the function it will not be rebuilt as long as the image
definition is the same.</p> <!> <p>So far, our script only fetches the links for a single page. What if we want to
scrape a large list of links in parallel?</p> <p>We can do this easily with Modal, because of some magic: the function we wrapped
with the <code>@app.function()</code> decorator is no longer an ordinary function, but a
Modal <!> object. This
means it comes with a <code>map</code> property built in, that lets us run this function
for all inputs in parallel, scaling up to as many workers as needed.</p> <p>Let’s change our code to scrape all urls we feed to it in parallel:</p> <!> <!> <p>Let’s say we want to log the scraped links daily. We move the print loop into
its own Modal function and annotate it with a <code>modal.Period(days=1)</code> schedule -
indicating we want to run it once per day. Since the scheduled function will not
run from our command line, we also add a hard-coded list of links to crawl for
now. In a more realistic setting we could read this from a database or other
accessible data source.</p> <!> <p>To deploy App permanently, run the command</p> <!> <p>Running this command deploys this function and then closes immediately. We can
see the deployment and all of its runs, including the printed links, on the
Modal <!>. Rerunning the script will redeploy
the code with any changes you have made - overwriting an existing deploy with
the same name (“example-webscraper” in this case).</p> <!> <p>Instead of looking at the links in the run logs of our deployments, let’s say we
wanted to post them to a <code>#scraped-links</code> Slack channel. To do this, we can
make use of the <!> and the <code>slack-sdk</code> <!>.</p> <p>The Slack SDK WebClient requires an API token to get access to our Slack
Workspace, and since it’s bad practice to hardcode credentials into application
code we make use of Modal’s <strong>Secrets</strong>. Secrets are snippets of data that will
be injected as environment variables in the containers running your functions.</p> <p>The easiest way to create Secrets is to go to the <!>. You can both create a
free-form secret with any environment variables, or make use of presets for
common services. We’ll use the Slack preset and after filling in the necessary
information we are presented with a snippet of code that can be used to post to
Slack using our credentials, which looks something like:</p> <!> <p>Notice the <code>retries</code> in the <code>@app.function</code> decorator.
That parameter adds automatic retries when Function calls fail
due to temporary issues, like rate limits. Read more <!></p> <p>Copy that code, then amend the <code>daily_scrape</code> function to call <code>bot_token_msg</code>. We also add a per-URL <code>limit</code> for good measure.</p> <!> <p>Note that we are freely making function calls across completely different
container images, as if they were regular Python functions in the same program!</p> <p>We keep the <code>local_entrypoint</code> the same so that we can still <code>modal run</code> this script to test the scraping behavior without posting to Slack.</p> <!> <p>If we want to test the <code>daily_scrape</code> or <code>bot_token_msg</code> Functions themselves, we can do that too!
We just add the name of the Function to the end of our <code>modal run</code> command:</p> <!> <p>Now redeploy the script to overwrite the old deploy with our updated code, and
you’ll get a daily feed of scraped links in your Slack channel 🎉</p> <!> <!> <p>We have shown how you can use Modal to develop distributed Python data
applications using custom containers. Through simple constructs we were able to
add parallel execution. With the change of a single line of code were were able
to go from experimental development code to a deployed application. We hope
this overview gives you a glimpse of what you are able to build using Modal.</p>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`a-simple-web-scraper`,children:(e,t)=>{l(),i(e,r(`A simple web scraper`))},$$slots:{default:!0}});var h=c(p,4);u(h,{id:`set-up-your-first-modal-app`,children:(e,t)=>{l(),i(e,r(`Set up your first Modal app`))},$$slots:{default:!0}});var g=c(h,2);m(c(e(g),3),{href:`https://modal.com/docs/guide`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);u(_,{id:`scrape-links-locally`,children:(e,t)=>{l(),i(e,r(`Scrape links locally`))},$$slots:{default:!0}});var v=c(_,4);f(v,{code:`import%20re%0Aimport%20sys%0Aimport%20urllib.request%0A%0A%0Adef%20get_links(url)%3A%0A%20%20%20%20response%20%3D%20urllib.request.urlopen(url)%0A%20%20%20%20html%20%3D%20response.read().decode(%22utf8%22)%0A%20%20%20%20links%20%3D%20%5B%5D%0A%20%20%20%20for%20match%20in%20re.finditer('href%3D%22(.*%3F)%22'%2C%20html)%3A%0A%20%20%20%20%20%20%20%20links.append(match.group(1))%0A%20%20%20%20return%20links%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20links%20%3D%20get_links(sys.argv%5B1%5D)%0A%20%20%20%20print(links)`,lang:`python`});var C=c(v,4);f(C,{code:`%24%20python%20webscraper.py%20http%3A%2F%2Fexample.com%0A%5B'https%3A%2F%2Fwww.iana.org%2Fdomains%2Fexample'%5D`,lang:`bash`});var w=c(C,2);u(w,{id:`run-it-on-modal`,children:(e,t)=>{l(),i(e,r(`Run it on Modal`))},$$slots:{default:!0}});var T=c(w,4),E=c(e(T),2);m(c(e(E)),{href:`/docs/reference/modal.App`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(E);var D=c(E,4);m(c(e(D),3),{href:`/docs/reference/modal.App#local_entrypoint`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),n(D),l(2),n(T);var O=c(T,2);f(O,{code:`import%20re%0Aimport%20urllib.request%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22example-webscraper%22)%0A%0A%0A%40app.function()%0Adef%20get_links(url)%3A%0A%20%20%20%20response%20%3D%20urllib.request.urlopen(url)%0A%20%20%20%20html%20%3D%20response.read().decode(%22utf8%22)%0A%20%20%20%20links%20%3D%20%5B%5D%0A%20%20%20%20for%20match%20in%20re.finditer('href%3D%22(.*%3F)%22'%2C%20html)%3A%0A%20%20%20%20%20%20%20%20links.append(match.group(1))%0A%20%20%20%20return%20links%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(url)%3A%0A%20%20%20%20links%20%3D%20get_links.remote(url)%0A%20%20%20%20print(links)`,lang:`python`});var k=c(O,4);f(k,{code:`%24%20modal%20run%20webscraper.py%20--url%20http%3A%2F%2Fexample.com%0A%E2%9C%93%20Initialized.%0A%E2%9C%93%20Created%20objects.%0A%5B'https%3A%2F%2Fwww.iana.org%2Fdomains%2Fexample'%5D%0A%E2%9C%93%20App%20completed.`,lang:`bash`});var A=c(k,2);u(A,{id:`add-dependencies`,children:(e,t)=>{l(),i(e,r(`Add dependencies`))},$$slots:{default:!0}});var j=c(A,2);m(c(e(j),3),{href:`https://playwright.dev/python/docs/intro`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Playwright`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2),N=c(e(M));m(N,{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`custom container images`))},$$slots:{default:!0}}),m(c(N,2),{href:`/docs/reference/modal.Image`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(5),n(M);var P=c(M,2);f(P,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-webscraper%22)%0Aplaywright_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.10%22).run_commands(%0A%20%20%20%20%22apt-get%20update%22%2C%0A%20%20%20%20%22apt-get%20install%20-y%20software-properties-common%22%2C%0A%20%20%20%20%22apt-add-repository%20non-free%22%2C%0A%20%20%20%20%22apt-add-repository%20contrib%22%2C%0A%20%20%20%20%22pip%20install%20playwright%3D%3D1.42.0%22%2C%0A%20%20%20%20%22playwright%20install-deps%20chromium%22%2C%0A%20%20%20%20%22playwright%20install%20chromium%22%2C%0A)%0A`,lang:`python`});var F=c(P,4);f(F,{code:`%40app.function(image%3Dplaywright_image)%0Aasync%20def%20get_links(cur_url%3A%20str)%20-%3E%20list%5Bstr%5D%3A%0A%20%20%20%20from%20playwright.async_api%20import%20(%0A%20%20%20%20%20%20%20%20TimeoutError%20as%20PlaywrightTimeoutError%2C%0A%20%20%20%20%20%20%20%20async_playwright%2C%0A%20%20%20%20)%0A%0A%20%20%20%20async%20with%20async_playwright()%20as%20p%3A%0A%20%20%20%20%20%20%20%20browser%20%3D%20await%20p.chromium.launch()%0A%20%20%20%20%20%20%20%20page%20%3D%20await%20browser.new_page()%0A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20page.goto(cur_url%2C%20timeout%3D10_000)%20%20%23%20ten%20seconds%0A%20%20%20%20%20%20%20%20except%20PlaywrightTimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Timeout%20loading%20%7Bcur_url%7D%2C%20skipping%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20browser.close()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20links%20%3D%20await%20page.eval_on_selector_all(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22a%5Bhref%5D%22%2C%20%22elements%20%3D%3E%20elements.map(element%20%3D%3E%20element.href)%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20await%20browser.close()%0A%0A%20%20%20%20print(%22Links%22%2C%20links)%0A%20%20%20%20return%20list(set(links))%0A%0A`,lang:`python`});var I=c(F,6);u(I,{id:`scale-out`,children:(e,t)=>{l(),i(e,r(`Scale out`))},$$slots:{default:!0}});var L=c(I,4);m(c(e(L),3),{href:`https://modal.com/docs/reference/modal.Function`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Function`))},$$slots:{default:!0}}),l(3),n(L);var R=c(L,4);f(R,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20urls%20%3D%20%5B%22http%3A%2F%2Fmodal.com%22%2C%20%22http%3A%2F%2Fgithub.com%22%5D%0A%20%20%20%20for%20links%20in%20get_links.map(urls)%3A%0A%20%20%20%20%20%20%20%20for%20link%20in%20links%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(link)`,lang:`python`});var z=c(R,2);u(z,{id:`deploy-it-and-run-it-on-a-schedule`,children:(e,t)=>{l(),i(e,r(`Deploy it and run it on a schedule`))},$$slots:{default:!0}});var B=c(z,4);f(B,{code:`%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20daily_scrape()%3A%0A%20%20%20%20urls%20%3D%20%5B%22http%3A%2F%2Fmodal.com%22%2C%20%22http%3A%2F%2Fgithub.com%22%5D%0A%20%20%20%20for%20links%20in%20get_links.map(urls)%3A%0A%20%20%20%20%20%20%20%20for%20link%20in%20links%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(link)`,lang:`python`});var V=c(B,4);f(V,{code:`modal%20deploy%20webscraper.py`,lang:`text`});var H=c(V,2);m(c(e(H)),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Apps page`))},$$slots:{default:!0}}),l(),n(H);var U=c(H,2);u(U,{id:`add-secrets-and-integrate-with-other-systems`,children:(e,t)=>{l(),i(e,r(`Add Secrets and integrate with other systems`))},$$slots:{default:!0}});var W=c(U,2),G=c(e(W),3);m(G,{href:`https://api.slack.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Slack API`))},$$slots:{default:!0}}),m(c(G,4),{href:`https://pypi.org/project/slack-sdk/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`PyPI package`))},$$slots:{default:!0}}),l(),n(W);var K=c(W,4);m(c(e(K)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets section of modal.com`))},$$slots:{default:!0}}),l(),n(K);var q=c(K,2);f(q,{code:`import%20os%0A%0Aslack_sdk_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.10%22).uv_pip_install(%0A%20%20%20%20%22slack-sdk%22%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dslack_sdk_image%2C%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22scraper-slack-secret%22%2C%20required_keys%3D%5B%22SLACK_BOT_TOKEN%22%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%5D%2C%0A%20%20%20%20retries%3D3%2C%0A)%0Adef%20bot_token_msg(channel%2C%20message)%3A%0A%20%20%20%20import%20slack_sdk%0A%0A%20%20%20%20client%20%3D%20slack_sdk.WebClient(token%3Dos.environ%5B%22SLACK_BOT_TOKEN%22%5D)%0A%20%20%20%20print(f%22Posting%20%7Bmessage%7D%20to%20%23%7Bchannel%7D%22)%0A%20%20%20%20client.chat_postMessage(channel%3Dchannel%2C%20text%3Dmessage)%0A%0A`,lang:`python`});var J=c(q,2);m(c(e(J),5),{href:`https://modal.com/docs/guide/retries`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),n(J);var Y=c(J,4);f(Y,{code:`%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20daily_scrape(limit%3A%20int%20%3D%2050)%3A%0A%20%20%20%20urls%20%3D%20%5B%22http%3A%2F%2Fmodal.com%22%2C%20%22http%3A%2F%2Fgithub.com%22%5D%0A%0A%20%20%20%20for%20links%20in%20get_links.map(urls)%3A%0A%20%20%20%20%20%20%20%20for%20link%20in%20links%5B%3Alimit%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bot_token_msg.remote(%22scraped-links%22%2C%20link)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20urls%20%3D%20%5B%22http%3A%2F%2Fmodal.com%22%2C%20%22http%3A%2F%2Fgithub.com%22%5D%0A%20%20%20%20for%20links%20in%20get_links.map(urls)%3A%0A%20%20%20%20%20%20%20%20for%20link%20in%20links%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(link)%0A%0A`,lang:`python`});var X=c(Y,6);f(X,{code:`modal%20run%20webscraper.py%20%20%23%20runs%20get_links.map%20via%20the%20local_entrypoint`,lang:`bash`});var Z=c(X,4);f(Z,{code:`modal%20run%20webscraper.py%3A%3Adaily_scrape%20--limit%201%20%20%23%20quick%20test`,lang:`bash`});var Q=c(Z,4);f(Q,{code:`modal%20deploy%20webscraper.py`,lang:`bash`}),u(c(Q,2),{id:`summary`,children:(e,t)=>{l(),i(e,r(`Summary`))},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=sndOS4-H.js.map
