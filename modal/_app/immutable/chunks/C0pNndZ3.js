(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`957e4af7-1f8c-4066-bcb0-06a7dc5c50ee`,e._sentryDebugIdIdentifier=`sentry-dbid-957e4af7-1f8c-4066-bcb0-06a7dc5c50ee`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Use Modal Dicts and Queues together`,id:`use-modal-dicts-and-queues-together`}],rawContent:`# Use Modal Dicts and Queues together

Modal Dicts and Queues store and communicate objects in distributed applications on Modal.

To illustrate how Dicts and Queues can interact together in a simple distributed
system, consider the following example program that crawls the web, starting
from some initial page and traversing links to many sites in breadth-first order.

The Modal Queue acts as a job queue, accepting new pages to crawl as they are discovered
by the crawlers and doling them out to be crawled via [\`.spawn\`](https://modal.com/docs/reference/modal.Function#spawn).

The Dict is used to coordinate termination once the maximum number of URLs to crawl is reached.

Starting from Wikipedia, this spawns several dozen containers (auto-scaled on
demand) and crawls about 100,000 URLs per minute.

\`\`\`python
import queue
import sys
from datetime import datetime

import modal

app = modal.App(
    "example-dicts-and-queues",
    image=modal.Image.debian_slim().uv_pip_install(
        "requests~=2.32.4", "beautifulsoup4~=4.13.4"
    ),
)


def extract_links(url: str) -> list[str]:
    """Extract links from a given URL."""
    import urllib.parse

    import requests
    from bs4 import BeautifulSoup

    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    links = []
    for link in soup.find_all("a"):
        links.append(urllib.parse.urljoin(url, link.get("href")))
    return links


@app.function()
def crawl_pages(q: modal.Queue, d: modal.Dict, urls: set[str]) -> None:
    for url in urls:
        if "stop" in d:
            return
        try:
            s = datetime.now()
            links = extract_links(url)
            print(f"Crawled: {url} in {datetime.now() - s}, with {len(links)} links")
            q.put_many(links)
        except Exception as exc:
            print(
                f"Failed to crawl: {url} with error {exc}, skipping...", file=sys.stderr
            )


@app.function()
def scrape(url: str, max_urls: int = 50_000):
    start_time = datetime.now()

    # Create ephemeral dicts and queues
    with modal.Dict.ephemeral() as d, modal.Queue.ephemeral() as q:
        # The dict is used to signal the scraping to stop
        # The queue contains the URLs that have been crawled

        # Initialize queue with a starting URL
        q.put(url)

        # Crawl until the queue is empty, or reaching some number of URLs
        visited = set()
        max_urls = min(max_urls, 50_000)
        while True:
            try:
                next_urls = q.get_many(2000, timeout=5)
            except queue.Empty:
                break
            new_urls = set(next_urls) - visited
            visited |= new_urls
            if len(visited) < max_urls:
                crawl_pages.spawn(q, d, new_urls)
            else:
                d["stop"] = True

        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"Crawled {len(visited)} URLs in {elapsed:.2f} seconds")


@app.local_entrypoint()
def main(starting_url=None, max_urls: int = 10_000):
    starting_url = starting_url or "https://www.wikipedia.org/"
    scrape.remote(starting_url, max_urls=max_urls)

\`\`\`
`,meta:{title:`Use Modal Dicts and Queues together`,description:`Modal Dicts and Queues store and communicate objects in distributed applications on Modal.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>.spawn</code>`),y=t(`<!> <p>Modal Dicts and Queues store and communicate objects in distributed applications on Modal.</p> <p>To illustrate how Dicts and Queues can interact together in a simple distributed
system, consider the following example program that crawls the web, starting
from some initial page and traversing links to many sites in breadth-first order.</p> <p>The Modal Queue acts as a job queue, accepting new pages to crawl as they are discovered
by the crawlers and doling them out to be crawled via <!>.</p> <p>The Dict is used to coordinate termination once the maximum number of URLs to crawl is reached.</p> <p>Starting from Wikipedia, this spawns several dozen containers (auto-scaled on
demand) and crawls about 100,000 URLs per minute.</p> <!>`,1);function b(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=y(),f=s(o);u(f,{id:`use-modal-dicts-and-queues-together`,children:(e,t)=>{l(),i(e,r(`Use Modal Dicts and Queues together`))},$$slots:{default:!0}});var m=c(f,6);p(c(e(m)),{href:`https://modal.com/docs/reference/modal.Function#spawn`,rel:`nofollow`,children:(e,t)=>{i(e,v())},$$slots:{default:!0}}),l(),n(m),d(c(m,6),{code:`import%20queue%0Aimport%20sys%0Afrom%20datetime%20import%20datetime%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-dicts-and-queues%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim().uv_pip_install(%0A%20%20%20%20%20%20%20%20%22requests~%3D2.32.4%22%2C%20%22beautifulsoup4~%3D4.13.4%22%0A%20%20%20%20)%2C%0A)%0A%0A%0Adef%20extract_links(url%3A%20str)%20-%3E%20list%5Bstr%5D%3A%0A%20%20%20%20%22%22%22Extract%20links%20from%20a%20given%20URL.%22%22%22%0A%20%20%20%20import%20urllib.parse%0A%0A%20%20%20%20import%20requests%0A%20%20%20%20from%20bs4%20import%20BeautifulSoup%0A%0A%20%20%20%20resp%20%3D%20requests.get(url%2C%20timeout%3D10)%0A%20%20%20%20resp.raise_for_status()%0A%20%20%20%20soup%20%3D%20BeautifulSoup(resp.text%2C%20%22html.parser%22)%0A%20%20%20%20links%20%3D%20%5B%5D%0A%20%20%20%20for%20link%20in%20soup.find_all(%22a%22)%3A%0A%20%20%20%20%20%20%20%20links.append(urllib.parse.urljoin(url%2C%20link.get(%22href%22)))%0A%20%20%20%20return%20links%0A%0A%0A%40app.function()%0Adef%20crawl_pages(q%3A%20modal.Queue%2C%20d%3A%20modal.Dict%2C%20urls%3A%20set%5Bstr%5D)%20-%3E%20None%3A%0A%20%20%20%20for%20url%20in%20urls%3A%0A%20%20%20%20%20%20%20%20if%20%22stop%22%20in%20d%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20s%20%3D%20datetime.now()%0A%20%20%20%20%20%20%20%20%20%20%20%20links%20%3D%20extract_links(url)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Crawled%3A%20%7Burl%7D%20in%20%7Bdatetime.now()%20-%20s%7D%2C%20with%20%7Blen(links)%7D%20links%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20q.put_many(links)%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20exc%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Failed%20to%20crawl%3A%20%7Burl%7D%20with%20error%20%7Bexc%7D%2C%20skipping...%22%2C%20file%3Dsys.stderr%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%0A%40app.function()%0Adef%20scrape(url%3A%20str%2C%20max_urls%3A%20int%20%3D%2050_000)%3A%0A%20%20%20%20start_time%20%3D%20datetime.now()%0A%0A%20%20%20%20%23%20Create%20ephemeral%20dicts%20and%20queues%0A%20%20%20%20with%20modal.Dict.ephemeral()%20as%20d%2C%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20%20%20%20%20%23%20The%20dict%20is%20used%20to%20signal%20the%20scraping%20to%20stop%0A%20%20%20%20%20%20%20%20%23%20The%20queue%20contains%20the%20URLs%20that%20have%20been%20crawled%0A%0A%20%20%20%20%20%20%20%20%23%20Initialize%20queue%20with%20a%20starting%20URL%0A%20%20%20%20%20%20%20%20q.put(url)%0A%0A%20%20%20%20%20%20%20%20%23%20Crawl%20until%20the%20queue%20is%20empty%2C%20or%20reaching%20some%20number%20of%20URLs%0A%20%20%20%20%20%20%20%20visited%20%3D%20set()%0A%20%20%20%20%20%20%20%20max_urls%20%3D%20min(max_urls%2C%2050_000)%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20next_urls%20%3D%20q.get_many(2000%2C%20timeout%3D5)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20queue.Empty%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20new_urls%20%3D%20set(next_urls)%20-%20visited%0A%20%20%20%20%20%20%20%20%20%20%20%20visited%20%7C%3D%20new_urls%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20len(visited)%20%3C%20max_urls%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20crawl_pages.spawn(q%2C%20d%2C%20new_urls)%0A%20%20%20%20%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20d%5B%22stop%22%5D%20%3D%20True%0A%0A%20%20%20%20%20%20%20%20elapsed%20%3D%20(datetime.now()%20-%20start_time).total_seconds()%0A%20%20%20%20%20%20%20%20print(f%22Crawled%20%7Blen(visited)%7D%20URLs%20in%20%7Belapsed%3A.2f%7D%20seconds%22)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main(starting_url%3DNone%2C%20max_urls%3A%20int%20%3D%2010_000)%3A%0A%20%20%20%20starting_url%20%3D%20starting_url%20or%20%22https%3A%2F%2Fwww.wikipedia.org%2F%22%0A%20%20%20%20scrape.remote(starting_url%2C%20max_urls%3Dmax_urls)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,m as metadata};
//# sourceMappingURL=C0pNndZ3.js.map
