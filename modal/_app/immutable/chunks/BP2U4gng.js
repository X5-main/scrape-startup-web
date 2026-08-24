(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fafd48c4-e8aa-4910-a68d-c67c1f16ab6c`,e._sentryDebugIdIdentifier=`sentry-dbid-fafd48c4-e8aa-4910-a68d-c67c1f16ab6c`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Web Scraping on Modal`,id:`web-scraping-on-modal`}],rawContent:`# Web Scraping on Modal

This example shows how you can scrape links from a website and post them to a Slack channel using Modal.

\`\`\`python
import os

import modal

app = modal.App("example-webscraper")


playwright_image = modal.Image.debian_slim(
    python_version="3.10"
).run_commands(  # Doesn't work with 3.11 yet
    "apt-get update",
    "apt-get install -y software-properties-common",
    "apt-add-repository non-free",
    "apt-add-repository contrib",
    "pip install playwright==1.42.0",
    "playwright install-deps chromium",
    "playwright install chromium",
)


@app.function(image=playwright_image)
async def get_links(url: str) -> set[str]:
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(url)
        links = await page.eval_on_selector_all(
            "a[href]", "elements => elements.map(element => element.href)"
        )
        await browser.close()

    return set(links)


slack_sdk_image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "slack-sdk==3.27.1"
)


@app.function(
    image=slack_sdk_image,
    secrets=[
        modal.Secret.from_name(
            "scraper-slack-secret", required_keys=["SLACK_BOT_TOKEN"]
        )
    ],
)
def bot_token_msg(channel, message):
    import slack_sdk
    from slack_sdk.http_retry.builtin_handlers import RateLimitErrorRetryHandler

    client = slack_sdk.WebClient(token=os.environ["SLACK_BOT_TOKEN"])
    rate_limit_handler = RateLimitErrorRetryHandler(max_retry_count=3)
    client.retry_handlers.append(rate_limit_handler)

    print(f"Posting {message} to #{channel}")
    client.chat_postMessage(channel=channel, text=message)


@app.function()
def scrape():
    links_of_interest = ["http://modal.com"]

    for links in get_links.map(links_of_interest):
        for link in links:
            bot_token_msg.remote("scraped-links", link)


@app.function(schedule=modal.Period(days=1))
def daily_scrape():
    scrape.remote()


@app.local_entrypoint()
def run():
    scrape.remote()

\`\`\`
`,meta:{title:`Web Scraping on Modal`,description:`This example shows how you can scrape links from a website and post them to a Slack channel using Modal.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This example shows how you can scrape links from a website and post them to a Slack channel using Modal.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`web-scraping-on-modal`,children:(e,r)=>{s(),n(e,t(`Web Scraping on Modal`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20os%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-webscraper%22)%0A%0A%0Aplaywright_image%20%3D%20modal.Image.debian_slim(%0A%20%20%20%20python_version%3D%223.10%22%0A).run_commands(%20%20%23%20Doesn't%20work%20with%203.11%20yet%0A%20%20%20%20%22apt-get%20update%22%2C%0A%20%20%20%20%22apt-get%20install%20-y%20software-properties-common%22%2C%0A%20%20%20%20%22apt-add-repository%20non-free%22%2C%0A%20%20%20%20%22apt-add-repository%20contrib%22%2C%0A%20%20%20%20%22pip%20install%20playwright%3D%3D1.42.0%22%2C%0A%20%20%20%20%22playwright%20install-deps%20chromium%22%2C%0A%20%20%20%20%22playwright%20install%20chromium%22%2C%0A)%0A%0A%0A%40app.function(image%3Dplaywright_image)%0Aasync%20def%20get_links(url%3A%20str)%20-%3E%20set%5Bstr%5D%3A%0A%20%20%20%20from%20playwright.async_api%20import%20async_playwright%0A%0A%20%20%20%20async%20with%20async_playwright()%20as%20p%3A%0A%20%20%20%20%20%20%20%20browser%20%3D%20await%20p.chromium.launch()%0A%20%20%20%20%20%20%20%20page%20%3D%20await%20browser.new_page()%0A%20%20%20%20%20%20%20%20await%20page.goto(url)%0A%20%20%20%20%20%20%20%20links%20%3D%20await%20page.eval_on_selector_all(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22a%5Bhref%5D%22%2C%20%22elements%20%3D%3E%20elements.map(element%20%3D%3E%20element.href)%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20await%20browser.close()%0A%0A%20%20%20%20return%20set(links)%0A%0A%0Aslack_sdk_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.10%22).uv_pip_install(%0A%20%20%20%20%22slack-sdk%3D%3D3.27.1%22%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dslack_sdk_image%2C%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22scraper-slack-secret%22%2C%20required_keys%3D%5B%22SLACK_BOT_TOKEN%22%5D%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%5D%2C%0A)%0Adef%20bot_token_msg(channel%2C%20message)%3A%0A%20%20%20%20import%20slack_sdk%0A%20%20%20%20from%20slack_sdk.http_retry.builtin_handlers%20import%20RateLimitErrorRetryHandler%0A%0A%20%20%20%20client%20%3D%20slack_sdk.WebClient(token%3Dos.environ%5B%22SLACK_BOT_TOKEN%22%5D)%0A%20%20%20%20rate_limit_handler%20%3D%20RateLimitErrorRetryHandler(max_retry_count%3D3)%0A%20%20%20%20client.retry_handlers.append(rate_limit_handler)%0A%0A%20%20%20%20print(f%22Posting%20%7Bmessage%7D%20to%20%23%7Bchannel%7D%22)%0A%20%20%20%20client.chat_postMessage(channel%3Dchannel%2C%20text%3Dmessage)%0A%0A%0A%40app.function()%0Adef%20scrape()%3A%0A%20%20%20%20links_of_interest%20%3D%20%5B%22http%3A%2F%2Fmodal.com%22%5D%0A%0A%20%20%20%20for%20links%20in%20get_links.map(links_of_interest)%3A%0A%20%20%20%20%20%20%20%20for%20link%20in%20links%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20bot_token_msg.remote(%22scraped-links%22%2C%20link)%0A%0A%0A%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20daily_scrape()%3A%0A%20%20%20%20scrape.remote()%0A%0A%0A%40app.local_entrypoint()%0Adef%20run()%3A%0A%20%20%20%20scrape.remote()%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=BP2U4gng.js.map
