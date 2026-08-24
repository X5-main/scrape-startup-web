(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cf6ddbaf-e4c6-41c9-8e44-7404409797de`,e._sentryDebugIdIdentifier=`sentry-dbid-cf6ddbaf-e4c6-41c9-8e44-7404409797de`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as re}from"./JPsrybyr.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";var p={toc:[{depth:1,value:`Run LLM inference at maximum throughput`,id:`run-llm-inference-at-maximum-throughput`,children:[{depth:2,value:`Organizing a batch job on Modal`,id:`organizing-a-batch-job-on-modal`},{depth:2,value:`Serving tokens at maximum throughput`,id:`serving-tokens-at-maximum-throughput`,children:[{depth:3,value:`Configuring vLLM for maximum throughput`,id:`configuring-vllm-for-maximum-throughput`},{depth:3,value:`Deploying vLLM on Modal`,id:`deploying-vllm-on-modal`}]},{depth:2,value:`Transforming SEC filings for batch processing`,id:`transforming-sec-filings-for-batch-processing`},{depth:2,value:`Loading filings from the SEC EDGAR Feed`,id:`loading-filings-from-the-sec-edgar-feed`},{depth:2,value:`Addenda`,id:`addenda`,children:[{depth:3,value:`Utilities for transforming SEC Filings`,id:`utilities-for-transforming-sec-filings`},{depth:3,value:`Utilities for loading filings from the SEC EDGAR Feed`,id:`utilities-for-loading-filings-from-the-sec-edgar-feed`}]}]}],rawContent:`# Run LLM inference at maximum throughput

This example demonstrates some techniques for running LLM inference
at the highest possible throughput on Modal.

For more on other aspects of maximizing the performance of LLM inference, see
[our guide](https://modal.com/docs/guide/high-performance-llm-inference).
For a simpler introduction to LLM serving, see
[this example](https://modal.com/docs/examples/llm_inference).

As our sample application, we use an LLM to summarize thousands of filings with
the U.S. federal government's Securities and Exchange Commission (SEC),
made available to the public for free in daily data dumps
via the SEC's Electronic Data Gathering, Analysis, and Retrieval System
([EDGAR](https://www.sec.gov/submit-filings/about-edgar)).
We like to check out the [Form 4s](https://www.sec.gov/files/form4data.pdf),
which detail (legal) insider trading.

Using the Qwen 3 8B parameter LLM on this task,
which has inputs that average a few thousand tokens
and outputs that average a few hundred tokens,
we observe processing speeds of ~30,000 input tok/s
and ~2,000 output tok/s per H100 GPU,
as in the sample Modal Dashboard screenshot below.
Note the [100% GPU utilization](https://modal.com/blog/gpu-utilization-guide),
indicating the absence of [host overhead](https://modal.com/blog/host-overhead-inference-efficiency),
and the high [GPU power utilization](https://modal.com/docs/guide/gpu-metrics),
further indicating we are close to the hardware's physical limits.

![Modal Dashboard indicating 30k tok/s input and 2k tok/s output on a single H100 GPU](https://modal-cdn.com/example-vllm-throughput-dashboard.png)

At Modal's [current rates](https://modal.com/pricing) as of early 2026,
that comes out to roughly 4¢ per million tokens.
[According to Artificial Analysis](https://artificialanalysis.ai/models/qwen3-8b-instruct),
API providers charge roughly five times as much for the same workload.

## Organizing a batch job on Modal

We start by defining a Modal [App](https://modal.com/docs/guide/apps),
which collects together the Modal resources our batch job uses.
While we're at it, we import a bunch of the libraries we will need later.

\`\`\`python
import datetime as dt
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import modal

MINUTES = 60  # seconds

app = modal.App("example-vllm-throughput")

\`\`\`

Many batch jobs work nicely as scripts -- code that is run
from a shell, ad hoc, rather than deployed.
For that, we define a \`local_entrypoint\` with code that runs
locally, when we pass our script to \`modal run\`,
and triggers/orchestrates remote execution.

We demonstrate two techniques for collecting the results of a batch job,
toggled by passing the \`--wait-for-results\`/\`--no-wait-for-results\`
flag via the command line.

When we \`--wait-for-results\`, we pass the \`modal.FunctionCall\` IDs
that make up our batch job to \`FunctionCall.gather\`, which
returns once our job is done. Here, we just print the results,
but in a more realistic setting you might save them to disk.

Instead of waiting for results, we can retrieve them asynchronously
based on the \`FunctionCall\` ID -- a simple string.
Results are stored in Modal for one week.
In the \`local_entrypoint\` below, these IDs are printed,
but you might store them in a file on disk, add them to your database,
or put them in a Modal
[Queue](https://modal.com/docs/guide/queues)
or [Dict](https://modal.com/docs/guide/dicts)
for later retrieval.

\`\`\`python
@app.local_entrypoint()
def main(lookback: int = 5, wait_for_results: bool = True):
    jobs = orchestrate.remote(lookback=lookback)  # trigger remote job orchestration

    if wait_for_results:
        print("Collecting results locally")
        batches = modal.FunctionCall.gather(*jobs)
        for batch in batches:
            print(*(result.summary for result in batch if result.form == "4"), sep="\\n")
            print("\\n")
        print("Done")
    else:
        print("Collect results asynchronously with modal.FunctionCall.from_id")
        print("FunctionCall IDs:", *[job.object_id for job in jobs], sep="\\n\\t")


\`\`\`

The meat of the work is done in our \`orchestrate\` function.
It manages the overall pipeline of execution,
starting with \`extract\`ing data from the raw data source,
followed by \`transform\`ing it into a cleaner format
and then \`process\`ing it with the LLM.

For both extraction and transformation, we use
[\`.map\`](https://modal.com/docs/guide/scale),
which fans out inputs over containers in parallel.
Each invocation handles at most 1,500 rows,
which leads to runtimes of about five minutes per call
By parallelizing the calls, we finish processing everything in about five minutes.

"Rechunking" our data from a list of filings by day
into a list of filings of fixed size requires a little
helper function:

\`\`\`python
def rechunk(lists, size: int = 1_500):
    from itertools import chain, islice

    it = iter(chain.from_iterable(lists))
    while chunk := list(islice(it, size)):
        yield chunk


\`\`\`

For the LLM call, we use
[\`.spawn\`](https://modal.com/docs/guide/job-queue),
which triggers asynchronous execution of the LLM, immediately
returning the \`FunctionCall\` that can later be used to \`.get\` the result
(or \`.gather\` several results).

We run it as a \`.remote\` Modal Function call
so that it can keep running even after our local client disconnects
(so long as we use \`modal run --detach\`).
In that case, we dump the \`FunctionCall\` IDs into the logs,
but you might also write them to an external store for later retrieval.

The \`app.function\` decorator below is all we need to set turn this Python function
into a remote Modal Function!

\`\`\`python
@app.function(timeout=30 * MINUTES)
def orchestrate(lookback: int) -> list[modal.FunctionCall]:
    llm = Vllm()

    today = datetime.now(tz=ZoneInfo("America/New_York")).date()  # Eastern Time
    print(f"Loading SEC filing data for the last {lookback} days")
    folders = list(extract.map(today - dt.timedelta(days=ii) for ii in range(lookback)))
    folders = list(
        filter(  # drop days with no data (weekends, holidays)
            lambda f: f is not None, folders
        )
    )

    print("Transforming raw SEC filings for these dates:", *folders)
    filing_batches = list(transform.map(folders))
    n_filings = sum(map(len, filing_batches))
    submission_batches_gen = rechunk(filing_batches)

    print(f"Submitting {n_filings} SEC filings to LLM for summarization")
    jobs = list(llm.process.spawn(batch) for batch in submission_batches_gen)
    if jobs:
        print("FunctionCall IDs:", *[job.object_id for job in jobs], sep="\\n\\t")

    return jobs


\`\`\`

Before going any further, we should agree on the format that our
\`transform\` and \`llm.process\` functions will use to communicate
individual elements.

We'll use a lightweight Python \`dataclass\` to represent
each SEC \`Filing\`.

For our task, we're going to take the \`text\` of a filing and produce
a \`summary\`. So the \`text\` is mandatory and the \`summary\` starts out empty (\`None\`),
to be filled in by the LLM.

We'll also keep a bit of metadata that should be included.
But we're not sure all of these fields will exist (API data is messy!),
so we reserve the right to set them to \`None\`.

\`\`\`python
@dataclass
class Filing:
    accession_number: str | None
    form: str | None
    cik: str | None
    text: str
    summary: str | None = None


\`\`\`

With the basic orchestration set up,
let's implement each component in turn.

## Serving tokens at maximum throughput

First, the LLM service.

### Configuring vLLM for maximum throughput

We choose the [vLLM](https://vllm.ai)
inference engine. You might alternatively use [SGLang](https://docs.sglang.io).
In our experience, new models and other features
are implemented first in vLLM, and vLLM has a small edge in throughput
over SGLang, but either can work well.

\`\`\`python
vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.9.0-devel-ubuntu22.04", add_python="3.13")
    .entrypoint([])
    .uv_pip_install("vllm==0.13.0", "huggingface-hub==0.36.0")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})  # faster model transfers
)

\`\`\`

vLLM will automatically download the model for us and produce some compilation artifacts,
all of which are saved to disk.
Modal Functions are serverless and disks are ephemeral,
so we attach a [Modal Volume](https://modal.com/docs/guide/volumes)
to the locations where vLLM saves these files to ensure that they persist.

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

\`\`\`

Like a database or web server, an LLM inference engine
typically has a few knobs to twiddle to adjust performance
on different workloads.

First and foremost, you need to pick the hardware it will run on.
We'll be running a smaller model in 8bit floating point format.
Hopper and later GPUs have native support for this format.
To maximize throughput, we want to ensure our inference is
[compute-bound](https://modal.com/gpu-glossary/perf/compute-bound):
the bottleneck is not loading weights/KV cache from memory,
it's performing computations on those values.
Roughly speaking, we want to be able to put together a batch
whose size is within an order of magnitude of the
[ridge point arithmetic intensity](https://modal.com/gpu-glossary/perf/roofline-model)
of the GPU for our floating point format, which is
[~600 for an H100 SXM Tensor Code on FP8 data](https://modal.com/gpu-glossary/perf/arithmetic-intensity).

A single H100 GPU has enough
[GPU RAM](https://modal.com/gpu-glossary/device-hardware/gpu-ram)
for pretty large batches of this data for this model,
so we stick with one of those -- and just one!
Deploying onto multiple GPUs would increase throughput _per replica_,
but not throughput _per GPU_ and so not throughput _per dollar_.

\`\`\`python
GPU = "h100"

\`\`\`

The dictionary of arguments below cover the knobs we found it
important to tune in this case. Specifically, we
set a maximum sequence length, based on the data,
to give the engine more hints about how to pack batches.
We select [FlashInfer](https://github.com/flashinfer-ai/flashinfer)
as the provider of the attention kernels, which vLLM recommends
for higher throughput in offline serving. Finally, we
turn on the asynchronous batch scheduler, which gives a small boost
to throughput.

\`\`\`python
vllm_throughput_kwargs = {
    "max_model_len": 4096 * 4,  # based on data
    "attention_backend": "flashinfer",  # best for throughput
    "async_scheduling": True,  # usually faster, but not all features supported
}

\`\`\`

For details on these and other arguments, we recommend checking out the [vLLM docs](https://vllm.ai),
which include lots of recipes and recommendations for different workloads and models.

### Deploying vLLM on Modal

For offline, throughput-oriented serving,
we can use the \`LLM\` interface of the vLLM SDK.
This interface processes batches of inputs synchronously,
unlike the \`AsyncLLM\` or HTTP serving interfaces.
Dumping a large batch all at once exposes
the maximum amount of parallelism to the engine
and adds the least request management overhead,
so we can expect it to maximize throughput.
Critically, though, this means we don't get any results
until all of them are finished -- a key engineering degree of freedom
for throughput-oriented offline/batch jobs!

We use a Modal [Cls](https://modal.com/docs/guide/lifecycle-functions)
to control the spinup and shutdown logic for the \`LLM\` engine.
Specifically, we create it (and warm it up with a test request)
in a method decorated with \`modal.enter\`
and we shut it down in a method decorated with \`modal.exit\`.
The code in these methods will run only once per replica,
when it is created and destroyed, respectively.

In between, we run a batch of \`Filings\` through the engine,
adding the model's output text to the \`summary\` field.

\`\`\`python
@app.cls(
    image=vllm_image,
    gpu=GPU,
    timeout=10 * MINUTES,
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
)
class Vllm:
    @modal.enter()
    def start(self):
        import vllm

        self.llm = vllm.LLM(model="Qwen/Qwen3-8B-FP8", **vllm_throughput_kwargs)
        self.sampling_params = self.llm.get_default_sampling_params()
        self.sampling_params.max_tokens = 1000

        self.llm.chat([{"role": "user", "content": "Is this thing on?"}])

    @modal.method()
    def process(self, filings: list[Filing]) -> list[Filing]:
        messages = [
            [
                {
                    "role": "user",
                    "content": f"/no_think Summarize this SEC filing in a single, short paragraph.\\n\\n{filing.text}",
                }
            ]
            for filing in filings
        ]

        start = time.time()
        responses = self.llm.chat(messages, sampling_params=self.sampling_params)
        duration_s = time.time() - start

        in_token_count = sum(len(response.prompt_token_ids) for response in responses)
        out_token_count = sum(
            len(response.outputs[0].token_ids) for response in responses
        )

        print(f"processed {in_token_count} prompt tokens in {int(duration_s)} seconds")
        print(f"generated {out_token_count} output tokens in {int(duration_s)} seconds")

        for response, filing in zip(responses, filings):
            filing.summary = response.outputs[0].text

        return filings

    @modal.exit()
    def stop(self):
        del self.llm


\`\`\`

And that's it for the LLM portion of the pipeline!
The remainder of this document is code and explanation
for the data loading and processing steps.
The details are mostly specific to this dataset,
but there are a few general Modal tips and tricks
for batch processing along the way.

## Transforming SEC filings for batch processing

We can avoid having to deal directly with the low-level
details of the SEC's data format by using the
[\`edgartools\` library](https://pypi.org/project/edgartools/).
And we can avoid worrying about compatibility with the other libraries
in our project by putting it in a separate container Image.

\`\`\`python
data_proc_image = modal.Image.debian_slim(python_version="3.13").uv_pip_install(
    # pin transitive deps to avoid surprises like this one:
    # https://www.edgartools.io/pandas-3-0-and-edgartools/
    "edgartools==5.8.3",
    "httpx==0.28.1",
    "httpxthrottlecache==0.3.0",
    "pandas<3",
    "pyrate-limiter==3.9.0",
)

\`\`\`

Instead of hitting the SEC's EDGAR Feed API every time we want to run a job,
we'll cache the results for each day in a Modal Volume.
We use Modal's [v2 Volumes](https://modal.com/docs/guide/volumes#volumes-v2-overview),
which have no limit on the number of total stored files.

\`\`\`python
sec_edgar_feed = modal.Volume.from_name(
    "example-sec-edgar-daily", create_if_missing=True, version=2
)
data_root = Path("/data")

\`\`\`

Note that v2 Volumes are still in beta, so data loss may be possible.
This is acceptable for most batch jobs, which extract data from an external
source of truth.

The \`transform\` function below operates on a folder containing data
with one filing per file
(in [NetCDF](https://en.wikipedia.org/wiki/NetCDF)/\`.nc\` format).

Loading thousands of filings with \`edgartools\` takes tens of seconds.
We can speed it up by running in parallel on Modal instead!
But running each file in a separate container would add too much overhead.
So we group up the files into \`chunks\` of ~100 and pass those to
the Modal Function that actually does the work.
Again, we use \`map\` to transparently scale out across containers.

\`\`\`python
@app.function(
    volumes={data_root: sec_edgar_feed}, timeout=10 * MINUTES, scaledown_window=5
)
def transform(folder: str | None) -> list[Filing]:
    if folder is None:
        return []

    folder_path = data_root / folder
    paths = [p for p in folder_path.iterdir() if p.is_file() and p.suffix == ".nc"]

    print(f"Processing {len(paths)} filings")

    chunks: list[list[Path]] = [paths[i : i + 100] for i in range(0, len(paths), 100)]

    batches = list(_transform_filing_batch.map(chunks))

    filings = [f for batch in batches for f in batch if f is not None]

    print(f"Found documents for {len(filings)} filings out of {len(paths)}")

    return filings


@app.function(
    volumes={data_root: sec_edgar_feed},
    scaledown_window=5,
    image=data_proc_image,
    timeout=10 * MINUTES,
)
def _transform_filing_batch(raw_filing_paths: list[Path]) -> list[Filing | None]:
    from edgar.sgml import FilingSGML

    out = []
    for raw_filing_path in raw_filing_paths:
        sgml = FilingSGML.from_source(raw_filing_path)
        text = extract_text(sgml)
        if text is None:
            out.append(None)
            continue
        out.append(
            Filing(
                accession_number=sgml.accession_number,
                form=sgml.form,
                cik=sgml.cik,
                text=text,
            )
        )
    return out


\`\`\`

Because these containers are cheap to scale up and are only needed for
a brief burst during the pipeline, we set the \`scaledown_window\` for the containers
to a much lower value than the default of five minutes -- here, five seconds.

## Loading filings from the SEC EDGAR Feed

We complete our reverse tour of the pipeline by loading the data from the original source:
the [SEC EDGAR Feed](https://www.sec.gov/Archives/edgar/Feed/),
an archive of daily filings going back over three decades.

We use the \`requests\` library to pull data from the API.
We'll be downloading large (maybe megabytes to few gigabytes)
files with low concurrency, so there's little benefit to running an asynchronous web client.

\`\`\`python
scraper_image = modal.Image.debian_slim(python_version="3.13").uv_pip_install(
    "requests==2.32.5"
)

\`\`\`

Our concurrency is limited by the policies of the SEC EDGAR API.
The limit is 10 RPS, which we aim to stay under by setting the \`max\` number of \`containers\`
running our extraction to 10.

We add [retries](https://modal.com/docs/guide/retries)
via our Modal decorator as well, so that we can tolerate temporary outages or rate limits.

Note that we also attach the same Volume used in the \`transform\` Functions above
and we explicitly [\`.commit\`](https://modal.com/docs/reference/modal.Volume#commit) our writes
so that they will be visible to future containers running \`transform\`.

\`\`\`python
@app.function(
    max_containers=10,
    volumes={data_root: sec_edgar_feed},
    retries=5,
    image=scraper_image,
    scaledown_window=5,
)
def extract(day: dt.date) -> str | None:
    target_folder = str(day)
    day_dir = data_root / target_folder
    daily_name = f"{day:%Y%m%d}.nc.tar.gz"
    tar_path = day_dir / daily_name

    # If the folder doesn't exist yet, try downloading the day's tarball
    if not tar_path.exists():
        print(f"Looking for data for {day} in SEC EDGAR Feed")
        ok = _download_from_sec_edgar(day, day_dir)
        if not ok:
            return None

    if not any(p.suffix == ".nc" for p in day_dir.iterdir()):
        print(f"Loading data for {day} from {tar_path}")
        _extract_tarfile(tar_path, day_dir)

    sec_edgar_feed.commit()
    print(f"Data for {day} loaded")

    return target_folder


\`\`\`

## Addenda

The remainder of this code consists of utility functions and boiler plate used in the
main code above.

### Utilities for transforming SEC Filings

The code in this section is used to transform, normalize, and otherwise munge
the raw filings downloaded from the SEC.

For LLM serving, the most important piece here is the function to truncate
documents. A maximum document length can be used to set a loose bound
on the sequence length in the LLM engine configuration.

\`\`\`python
def normalize_text(text: str) -> str:
    text = text.replace("\\r\\n", "\\n").replace("\\r", "\\n")
    text = clean_xml(text)
    return text


def clean_xml(xml: str) -> str:
    import re

    _XMLNS_ATTR_RE = re.compile(r'\\s+xmlns(:\\w+)?="[^"]*"', re.I)
    _XML_DECL_RE = re.compile(r"^\\s*<\\?xml[^>]*\\?>\\s*", re.I)
    _EMPTY_TAG_RE = re.compile(r"<(\\w+)([^>]*)>\\s*</\\1>", re.S)
    _BETWEEN_TAG_WS_RE = re.compile(r">\\s+<")

    xml = xml.replace("\\r\\n", "\\n").replace("\\r", "\\n").strip()

    # drop xml declaration, remove xmlns attributes
    xml = _XML_DECL_RE.sub("", xml)
    xml = _XMLNS_ATTR_RE.sub("", xml)

    # replace whitespace between tags with a single newline
    xml = _BETWEEN_TAG_WS_RE.sub("><", xml).replace("><", ">\\n<")

    return xml.strip()


def truncate_head_tail(text: str, head: int = 13_000, tail: int = 2_000) -> str:
    if len(text) <= head + tail:
        return text
    return text[:head].rstrip() + "\\n\\n[...TRUNCATED...]\\n\\n" + text[-tail:].lstrip()


def extract_text(sgml) -> str | None:
    doc = sgml.xml()
    return truncate_head_tail(normalize_text(doc)) if doc else None


\`\`\`

### Utilities for loading filings from the SEC EDGAR Feed

The code in this section is used to load raw data from the Feed
section of SEC EDGAR.

Daily dumps are stored in [tar](https://www.math.utah.edu/docs/info/tar_4.html)
archives, which the code below extracts.
Archives for particular days are located by searching the SEC EDGAR Feed indices
for the appropriate URL.

For full compliance with SEC EDGAR etiquette,
we recommend updating the \`SEC_USER_AGENT\` environment variable
below with your name and email.

\`\`\`python
def _download_from_sec_edgar(day: dt.date, day_dir: Path) -> bool:
    import os

    import requests

    SEC_UA = os.environ.get("SEC_USER_AGENT", "YourName your.email@example.com")
    session = requests.Session()
    session.headers.update({"User-Agent": SEC_UA, "Accept-Encoding": "gzip, deflate"})

    base = "https://www.sec.gov/Archives/edgar/Feed"

    def quarter(d: dt.date) -> str:
        return f"QTR{(d.month - 1) // 3 + 1}"

    qtr = quarter(day)
    daily_name = f"{day:%Y%m%d}.nc.tar.gz"
    qtr_index = f"{base}/{day.year}/{qtr}/index.json"

    if not check_index(session, qtr_index, daily_name):
        print(f"no data for {day} in SEC EDGAR Feed")
        return False

    day_dir.mkdir(parents=True, exist_ok=True)

    tar_path = day_dir / daily_name
    if not tar_path.exists() or tar_path.stat().st_size == 0:
        url = f"{base}/{day.year}/{qtr}/{daily_name}"
        print(f"Downloading from {url}")
        print("This can take several minutes")
        _download_tar(session, url, tar_path)

    return True


def _extract_tarfile(from_tar_path, to_dir):
    import tarfile

    with tarfile.open(from_tar_path, "r:gz") as tf:
        for member in tf:
            if not (member.isfile() and member.name.endswith(".nc")):
                continue
            dest = to_dir / Path(member.name).name
            if dest.exists() and dest.stat().st_size > 0:
                continue
            f = tf.extractfile(member)
            if f is None:
                continue
            dest.write_bytes(f.read())


def check_index(session, index_url, name) -> bool:
    r = session.get(index_url, timeout=30)
    if r.status_code == 404:
        return False
    r.raise_for_status()
    for it in r.json().get("directory", {}).get("item", []):
        if it.get("type") == "file" and it.get("name") == name:
            return True
    return False


def _download_tar(session, url, tar_path):
    resp = session.get(url, timeout=500)
    resp.raise_for_status()
    tmp = tar_path.with_suffix(tar_path.suffix + ".part")
    tmp.write_bytes(resp.content)
    tmp.replace(tar_path)

\`\`\`
`,meta:{title:`Run LLM inference at maximum throughput`,description:`This example demonstrates some techniques for running LLM inference at the highest possible throughput on Modal.`}},{toc:m,rawContent:h,meta:ie}=p,ae=t(`<code>.map</code>`),oe=t(`<code>.spawn</code>`),se=t(`<code>edgartools</code> library`,1),ce=t(`<code>.commit</code>`),le=t(`<!> <p>This example demonstrates some techniques for running LLM inference
at the highest possible throughput on Modal.</p> <p>For more on other aspects of maximizing the performance of LLM inference, see <!>.
For a simpler introduction to LLM serving, see <!>.</p> <p>As our sample application, we use an LLM to summarize thousands of filings with
the U.S. federal government’s Securities and Exchange Commission (SEC),
made available to the public for free in daily data dumps
via the SEC’s Electronic Data Gathering, Analysis, and Retrieval System
(<!>).
We like to check out the <!>,
which detail (legal) insider trading.</p> <p>Using the Qwen 3 8B parameter LLM on this task,
which has inputs that average a few thousand tokens
and outputs that average a few hundred tokens,
we observe processing speeds of ~30,000 input tok/s
and ~2,000 output tok/s per H100 GPU,
as in the sample Modal Dashboard screenshot below.
Note the <!>,
indicating the absence of <!>,
and the high <!>,
further indicating we are close to the hardware’s physical limits.</p> <p><!></p> <p>At Modal’s <!> as of early 2026,
that comes out to roughly 4¢ per million tokens. <!>,
API providers charge roughly five times as much for the same workload.</p> <!> <p>We start by defining a Modal <!>,
which collects together the Modal resources our batch job uses.
While we’re at it, we import a bunch of the libraries we will need later.</p> <!> <p>Many batch jobs work nicely as scripts — code that is run
from a shell, ad hoc, rather than deployed.
For that, we define a <code>local_entrypoint</code> with code that runs
locally, when we pass our script to <code>modal run</code>,
and triggers/orchestrates remote execution.</p> <p>We demonstrate two techniques for collecting the results of a batch job,
toggled by passing the <code>--wait-for-results</code>/<code>--no-wait-for-results</code> flag via the command line.</p> <p>When we <code>--wait-for-results</code>, we pass the <code>modal.FunctionCall</code> IDs
that make up our batch job to <code>FunctionCall.gather</code>, which
returns once our job is done. Here, we just print the results,
but in a more realistic setting you might save them to disk.</p> <p>Instead of waiting for results, we can retrieve them asynchronously
based on the <code>FunctionCall</code> ID — a simple string.
Results are stored in Modal for one week.
In the <code>local_entrypoint</code> below, these IDs are printed,
but you might store them in a file on disk, add them to your database,
or put them in a Modal <!> or <!> for later retrieval.</p> <!> <p>The meat of the work is done in our <code>orchestrate</code> function.
It manages the overall pipeline of execution,
starting with <code>extract</code>ing data from the raw data source,
followed by <code>transform</code>ing it into a cleaner format
and then <code>process</code>ing it with the LLM.</p> <p>For both extraction and transformation, we use <!>,
which fans out inputs over containers in parallel.
Each invocation handles at most 1,500 rows,
which leads to runtimes of about five minutes per call
By parallelizing the calls, we finish processing everything in about five minutes.</p> <p>“Rechunking” our data from a list of filings by day
into a list of filings of fixed size requires a little
helper function:</p> <!> <p>For the LLM call, we use <!>,
which triggers asynchronous execution of the LLM, immediately
returning the <code>FunctionCall</code> that can later be used to <code>.get</code> the result
(or <code>.gather</code> several results).</p> <p>We run it as a <code>.remote</code> Modal Function call
so that it can keep running even after our local client disconnects
(so long as we use <code>modal run --detach</code>).
In that case, we dump the <code>FunctionCall</code> IDs into the logs,
but you might also write them to an external store for later retrieval.</p> <p>The <code>app.function</code> decorator below is all we need to set turn this Python function
into a remote Modal Function!</p> <!> <p>Before going any further, we should agree on the format that our <code>transform</code> and <code>llm.process</code> functions will use to communicate
individual elements.</p> <p>We’ll use a lightweight Python <code>dataclass</code> to represent
each SEC <code>Filing</code>.</p> <p>For our task, we’re going to take the <code>text</code> of a filing and produce
a <code>summary</code>. So the <code>text</code> is mandatory and the <code>summary</code> starts out empty (<code>None</code>),
to be filled in by the LLM.</p> <p>We’ll also keep a bit of metadata that should be included.
But we’re not sure all of these fields will exist (API data is messy!),
so we reserve the right to set them to <code>None</code>.</p> <!> <p>With the basic orchestration set up,
let’s implement each component in turn.</p> <!> <p>First, the LLM service.</p> <!> <p>We choose the <!> inference engine. You might alternatively use <!>.
In our experience, new models and other features
are implemented first in vLLM, and vLLM has a small edge in throughput
over SGLang, but either can work well.</p> <!> <p>vLLM will automatically download the model for us and produce some compilation artifacts,
all of which are saved to disk.
Modal Functions are serverless and disks are ephemeral,
so we attach a <!> to the locations where vLLM saves these files to ensure that they persist.</p> <!> <p>Like a database or web server, an LLM inference engine
typically has a few knobs to twiddle to adjust performance
on different workloads.</p> <p>First and foremost, you need to pick the hardware it will run on.
We’ll be running a smaller model in 8bit floating point format.
Hopper and later GPUs have native support for this format.
To maximize throughput, we want to ensure our inference is <!>:
the bottleneck is not loading weights/KV cache from memory,
it’s performing computations on those values.
Roughly speaking, we want to be able to put together a batch
whose size is within an order of magnitude of the <!> of the GPU for our floating point format, which is <!>.</p> <p>A single H100 GPU has enough <!> for pretty large batches of this data for this model,
so we stick with one of those — and just one!
Deploying onto multiple GPUs would increase throughput <em>per replica</em>,
but not throughput <em>per GPU</em> and so not throughput <em>per dollar</em>.</p> <!> <p>The dictionary of arguments below cover the knobs we found it
important to tune in this case. Specifically, we
set a maximum sequence length, based on the data,
to give the engine more hints about how to pack batches.
We select <!> as the provider of the attention kernels, which vLLM recommends
for higher throughput in offline serving. Finally, we
turn on the asynchronous batch scheduler, which gives a small boost
to throughput.</p> <!> <p>For details on these and other arguments, we recommend checking out the <!>,
which include lots of recipes and recommendations for different workloads and models.</p> <!> <p>For offline, throughput-oriented serving,
we can use the <code>LLM</code> interface of the vLLM SDK.
This interface processes batches of inputs synchronously,
unlike the <code>AsyncLLM</code> or HTTP serving interfaces.
Dumping a large batch all at once exposes
the maximum amount of parallelism to the engine
and adds the least request management overhead,
so we can expect it to maximize throughput.
Critically, though, this means we don’t get any results
until all of them are finished — a key engineering degree of freedom
for throughput-oriented offline/batch jobs!</p> <p>We use a Modal <!> to control the spinup and shutdown logic for the <code>LLM</code> engine.
Specifically, we create it (and warm it up with a test request)
in a method decorated with <code>modal.enter</code> and we shut it down in a method decorated with <code>modal.exit</code>.
The code in these methods will run only once per replica,
when it is created and destroyed, respectively.</p> <p>In between, we run a batch of <code>Filings</code> through the engine,
adding the model’s output text to the <code>summary</code> field.</p> <!> <p>And that’s it for the LLM portion of the pipeline!
The remainder of this document is code and explanation
for the data loading and processing steps.
The details are mostly specific to this dataset,
but there are a few general Modal tips and tricks
for batch processing along the way.</p> <!> <p>We can avoid having to deal directly with the low-level
details of the SEC’s data format by using the <!>.
And we can avoid worrying about compatibility with the other libraries
in our project by putting it in a separate container Image.</p> <!> <p>Instead of hitting the SEC’s EDGAR Feed API every time we want to run a job,
we’ll cache the results for each day in a Modal Volume.
We use Modal’s <!>,
which have no limit on the number of total stored files.</p> <!> <p>Note that v2 Volumes are still in beta, so data loss may be possible.
This is acceptable for most batch jobs, which extract data from an external
source of truth.</p> <p>The <code>transform</code> function below operates on a folder containing data
with one filing per file
(in <!>/<code>.nc</code> format).</p> <p>Loading thousands of filings with <code>edgartools</code> takes tens of seconds.
We can speed it up by running in parallel on Modal instead!
But running each file in a separate container would add too much overhead.
So we group up the files into <code>chunks</code> of ~100 and pass those to
the Modal Function that actually does the work.
Again, we use <code>map</code> to transparently scale out across containers.</p> <!> <p>Because these containers are cheap to scale up and are only needed for
a brief burst during the pipeline, we set the <code>scaledown_window</code> for the containers
to a much lower value than the default of five minutes — here, five seconds.</p> <!> <p>We complete our reverse tour of the pipeline by loading the data from the original source:
the <!>,
an archive of daily filings going back over three decades.</p> <p>We use the <code>requests</code> library to pull data from the API.
We’ll be downloading large (maybe megabytes to few gigabytes)
files with low concurrency, so there’s little benefit to running an asynchronous web client.</p> <!> <p>Our concurrency is limited by the policies of the SEC EDGAR API.
The limit is 10 RPS, which we aim to stay under by setting the <code>max</code> number of <code>containers</code> running our extraction to 10.</p> <p>We add <!> via our Modal decorator as well, so that we can tolerate temporary outages or rate limits.</p> <p>Note that we also attach the same Volume used in the <code>transform</code> Functions above
and we explicitly <!> our writes
so that they will be visible to future containers running <code>transform</code>.</p> <!> <!> <p>The remainder of this code consists of utility functions and boiler plate used in the
main code above.</p> <!> <p>The code in this section is used to transform, normalize, and otherwise munge
the raw filings downloaded from the SEC.</p> <p>For LLM serving, the most important piece here is the function to truncate
documents. A maximum document length can be used to set a loose bound
on the sequence length in the LLM engine configuration.</p> <!> <!> <p>The code in this section is used to load raw data from the Feed
section of SEC EDGAR.</p> <p>Daily dumps are stored in <!> archives, which the code below extracts.
Archives for particular days are located by searching the SEC EDGAR Feed indices
for the appropriate URL.</p> <p>For full compliance with SEC EDGAR etiquette,
we recommend updating the <code>SEC_USER_AGENT</code> environment variable
below with your name and email.</p> <!>`,1);function g(t,m){let h=ee(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>h,()=>p,{children:(t,ee)=>{var a=le(),d=te(a);ne(d,{id:`run-llm-inference-at-maximum-throughput`,children:(e,t)=>{s(),i(e,r(`Run LLM inference at maximum throughput`))},$$slots:{default:!0}});var p=o(d,4),m=o(e(p));f(m,{href:`https://modal.com/docs/guide/high-performance-llm-inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`our guide`))},$$slots:{default:!0}}),f(o(m,2),{href:`https://modal.com/docs/examples/llm_inference`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this example`))},$$slots:{default:!0}}),s(),n(p);var h=o(p,2),ie=o(e(h));f(ie,{href:`https://www.sec.gov/submit-filings/about-edgar`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`EDGAR`))},$$slots:{default:!0}}),f(o(ie,2),{href:`https://www.sec.gov/files/form4data.pdf`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Form 4s`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2),_=o(e(g));f(_,{href:`https://modal.com/blog/gpu-utilization-guide`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`100% GPU utilization`))},$$slots:{default:!0}});var v=o(_,2);f(v,{href:`https://modal.com/blog/host-overhead-inference-efficiency`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`host overhead`))},$$slots:{default:!0}}),f(o(v,2),{href:`https://modal.com/docs/guide/gpu-metrics`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU power utilization`))},$$slots:{default:!0}}),s(),n(g);var y=o(g,2);re(e(y),{src:`https://modal-cdn.com/example-vllm-throughput-dashboard.png`,alt:`Modal Dashboard indicating 30k tok/s input and 2k tok/s output on a single H100 GPU`}),n(y);var b=o(y,2),ue=o(e(b));f(ue,{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`current rates`))},$$slots:{default:!0}}),f(o(ue,2),{href:`https://artificialanalysis.ai/models/qwen3-8b-instruct`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`According to Artificial Analysis`))},$$slots:{default:!0}}),s(),n(b);var de=o(b,2);c(de,{id:`organizing-a-batch-job-on-modal`,children:(e,t)=>{s(),i(e,r(`Organizing a batch job on Modal`))},$$slots:{default:!0}});var x=o(de,2);f(o(e(x)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`App`))},$$slots:{default:!0}}),s(),n(x);var fe=o(x,2);u(fe,{code:`import%20datetime%20as%20dt%0Aimport%20time%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20datetime%20import%20datetime%0Afrom%20pathlib%20import%20Path%0Afrom%20zoneinfo%20import%20ZoneInfo%0A%0Aimport%20modal%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(%22example-vllm-throughput%22)%0A`,lang:`python`});var S=o(fe,8),pe=o(e(S),5);f(pe,{href:`https://modal.com/docs/guide/queues`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Queue`))},$$slots:{default:!0}}),f(o(pe,2),{href:`https://modal.com/docs/guide/dicts`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Dict`))},$$slots:{default:!0}}),s(),n(S);var me=o(S,2);u(me,{code:`%40app.local_entrypoint()%0Adef%20main(lookback%3A%20int%20%3D%205%2C%20wait_for_results%3A%20bool%20%3D%20True)%3A%0A%20%20%20%20jobs%20%3D%20orchestrate.remote(lookback%3Dlookback)%20%20%23%20trigger%20remote%20job%20orchestration%0A%0A%20%20%20%20if%20wait_for_results%3A%0A%20%20%20%20%20%20%20%20print(%22Collecting%20results%20locally%22)%0A%20%20%20%20%20%20%20%20batches%20%3D%20modal.FunctionCall.gather(*jobs)%0A%20%20%20%20%20%20%20%20for%20batch%20in%20batches%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(*(result.summary%20for%20result%20in%20batch%20if%20result.form%20%3D%3D%20%224%22)%2C%20sep%3D%22%5Cn%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22%5Cn%22)%0A%20%20%20%20%20%20%20%20print(%22Done%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22Collect%20results%20asynchronously%20with%20modal.FunctionCall.from_id%22)%0A%20%20%20%20%20%20%20%20print(%22FunctionCall%20IDs%3A%22%2C%20*%5Bjob.object_id%20for%20job%20in%20jobs%5D%2C%20sep%3D%22%5Cn%5Ct%22)%0A%0A`,lang:`python`});var C=o(me,4);f(o(e(C)),{href:`https://modal.com/docs/guide/scale`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(C);var w=o(C,4);u(w,{code:`def%20rechunk(lists%2C%20size%3A%20int%20%3D%201_500)%3A%0A%20%20%20%20from%20itertools%20import%20chain%2C%20islice%0A%0A%20%20%20%20it%20%3D%20iter(chain.from_iterable(lists))%0A%20%20%20%20while%20chunk%20%3A%3D%20list(islice(it%2C%20size))%3A%0A%20%20%20%20%20%20%20%20yield%20chunk%0A%0A`,lang:`python`});var T=o(w,2);f(o(e(T)),{href:`https://modal.com/docs/guide/job-queue`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(7),n(T);var E=o(T,6);u(E,{code:`%40app.function(timeout%3D30%20*%20MINUTES)%0Adef%20orchestrate(lookback%3A%20int)%20-%3E%20list%5Bmodal.FunctionCall%5D%3A%0A%20%20%20%20llm%20%3D%20Vllm()%0A%0A%20%20%20%20today%20%3D%20datetime.now(tz%3DZoneInfo(%22America%2FNew_York%22)).date()%20%20%23%20Eastern%20Time%0A%20%20%20%20print(f%22Loading%20SEC%20filing%20data%20for%20the%20last%20%7Blookback%7D%20days%22)%0A%20%20%20%20folders%20%3D%20list(extract.map(today%20-%20dt.timedelta(days%3Dii)%20for%20ii%20in%20range(lookback)))%0A%20%20%20%20folders%20%3D%20list(%0A%20%20%20%20%20%20%20%20filter(%20%20%23%20drop%20days%20with%20no%20data%20(weekends%2C%20holidays)%0A%20%20%20%20%20%20%20%20%20%20%20%20lambda%20f%3A%20f%20is%20not%20None%2C%20folders%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20)%0A%0A%20%20%20%20print(%22Transforming%20raw%20SEC%20filings%20for%20these%20dates%3A%22%2C%20*folders)%0A%20%20%20%20filing_batches%20%3D%20list(transform.map(folders))%0A%20%20%20%20n_filings%20%3D%20sum(map(len%2C%20filing_batches))%0A%20%20%20%20submission_batches_gen%20%3D%20rechunk(filing_batches)%0A%0A%20%20%20%20print(f%22Submitting%20%7Bn_filings%7D%20SEC%20filings%20to%20LLM%20for%20summarization%22)%0A%20%20%20%20jobs%20%3D%20list(llm.process.spawn(batch)%20for%20batch%20in%20submission_batches_gen)%0A%20%20%20%20if%20jobs%3A%0A%20%20%20%20%20%20%20%20print(%22FunctionCall%20IDs%3A%22%2C%20*%5Bjob.object_id%20for%20job%20in%20jobs%5D%2C%20sep%3D%22%5Cn%5Ct%22)%0A%0A%20%20%20%20return%20jobs%0A%0A`,lang:`python`});var D=o(E,10);u(D,{code:`%40dataclass%0Aclass%20Filing%3A%0A%20%20%20%20accession_number%3A%20str%20%7C%20None%0A%20%20%20%20form%3A%20str%20%7C%20None%0A%20%20%20%20cik%3A%20str%20%7C%20None%0A%20%20%20%20text%3A%20str%0A%20%20%20%20summary%3A%20str%20%7C%20None%20%3D%20None%0A%0A`,lang:`python`});var O=o(D,4);c(O,{id:`serving-tokens-at-maximum-throughput`,children:(e,t)=>{s(),i(e,r(`Serving tokens at maximum throughput`))},$$slots:{default:!0}});var k=o(O,4);l(k,{id:`configuring-vllm-for-maximum-throughput`,children:(e,t)=>{s(),i(e,r(`Configuring vLLM for maximum throughput`))},$$slots:{default:!0}});var A=o(k,2),j=o(e(A));f(j,{href:`https://vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM`))},$$slots:{default:!0}}),f(o(j,2),{href:`https://docs.sglang.io`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SGLang`))},$$slots:{default:!0}}),s(),n(A);var M=o(A,2);u(M,{code:`vllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.9.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.13%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.uv_pip_install(%22vllm%3D%3D0.13.0%22%2C%20%22huggingface-hub%3D%3D0.36.0%22)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%20%20%23%20faster%20model%20transfers%0A)%0A`,lang:`python`});var N=o(M,2);f(o(e(N)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Volume`))},$$slots:{default:!0}}),s(),n(N);var P=o(N,2);u(P,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0Avllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var F=o(P,4),I=o(e(F));f(I,{href:`https://modal.com/gpu-glossary/perf/compute-bound`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`compute-bound`))},$$slots:{default:!0}});var L=o(I,2);f(L,{href:`https://modal.com/gpu-glossary/perf/roofline-model`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`ridge point arithmetic intensity`))},$$slots:{default:!0}}),f(o(L,2),{href:`https://modal.com/gpu-glossary/perf/arithmetic-intensity`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`~600 for an H100 SXM Tensor Code on FP8 data`))},$$slots:{default:!0}}),s(),n(F);var R=o(F,2);f(o(e(R)),{href:`https://modal.com/gpu-glossary/device-hardware/gpu-ram`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU RAM`))},$$slots:{default:!0}}),s(7),n(R);var z=o(R,2);u(z,{code:`GPU%20%3D%20%22h100%22%0A`,lang:`python`});var B=o(z,2);f(o(e(B)),{href:`https://github.com/flashinfer-ai/flashinfer`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FlashInfer`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,2);u(V,{code:`vllm_throughput_kwargs%20%3D%20%7B%0A%20%20%20%20%22max_model_len%22%3A%204096%20*%204%2C%20%20%23%20based%20on%20data%0A%20%20%20%20%22attention_backend%22%3A%20%22flashinfer%22%2C%20%20%23%20best%20for%20throughput%0A%20%20%20%20%22async_scheduling%22%3A%20True%2C%20%20%23%20usually%20faster%2C%20but%20not%20all%20features%20supported%0A%7D%0A`,lang:`python`});var H=o(V,2);f(o(e(H)),{href:`https://vllm.ai`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`vLLM docs`))},$$slots:{default:!0}}),s(),n(H);var he=o(H,2);l(he,{id:`deploying-vllm-on-modal`,children:(e,t)=>{s(),i(e,r(`Deploying vLLM on Modal`))},$$slots:{default:!0}});var U=o(he,4);f(o(e(U)),{href:`https://modal.com/docs/guide/lifecycle-functions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Cls`))},$$slots:{default:!0}}),s(7),n(U);var W=o(U,4);u(W,{code:`%40app.cls(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3DGPU%2C%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%7D%2C%0A)%0Aclass%20Vllm%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20start(self)%3A%0A%20%20%20%20%20%20%20%20import%20vllm%0A%0A%20%20%20%20%20%20%20%20self.llm%20%3D%20vllm.LLM(model%3D%22Qwen%2FQwen3-8B-FP8%22%2C%20**vllm_throughput_kwargs)%0A%20%20%20%20%20%20%20%20self.sampling_params%20%3D%20self.llm.get_default_sampling_params()%0A%20%20%20%20%20%20%20%20self.sampling_params.max_tokens%20%3D%201000%0A%0A%20%20%20%20%20%20%20%20self.llm.chat(%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Is%20this%20thing%20on%3F%22%7D%5D)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20process(self%2C%20filings%3A%20list%5BFiling%5D)%20-%3E%20list%5BFiling%5D%3A%0A%20%20%20%20%20%20%20%20messages%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22role%22%3A%20%22user%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22content%22%3A%20f%22%2Fno_think%20Summarize%20this%20SEC%20filing%20in%20a%20single%2C%20short%20paragraph.%5Cn%5Cn%7Bfiling.text%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20filing%20in%20filings%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20start%20%3D%20time.time()%0A%20%20%20%20%20%20%20%20responses%20%3D%20self.llm.chat(messages%2C%20sampling_params%3Dself.sampling_params)%0A%20%20%20%20%20%20%20%20duration_s%20%3D%20time.time()%20-%20start%0A%0A%20%20%20%20%20%20%20%20in_token_count%20%3D%20sum(len(response.prompt_token_ids)%20for%20response%20in%20responses)%0A%20%20%20%20%20%20%20%20out_token_count%20%3D%20sum(%0A%20%20%20%20%20%20%20%20%20%20%20%20len(response.outputs%5B0%5D.token_ids)%20for%20response%20in%20responses%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20print(f%22processed%20%7Bin_token_count%7D%20prompt%20tokens%20in%20%7Bint(duration_s)%7D%20seconds%22)%0A%20%20%20%20%20%20%20%20print(f%22generated%20%7Bout_token_count%7D%20output%20tokens%20in%20%7Bint(duration_s)%7D%20seconds%22)%0A%0A%20%20%20%20%20%20%20%20for%20response%2C%20filing%20in%20zip(responses%2C%20filings)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20filing.summary%20%3D%20response.outputs%5B0%5D.text%0A%0A%20%20%20%20%20%20%20%20return%20filings%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%3A%0A%20%20%20%20%20%20%20%20del%20self.llm%0A%0A`,lang:`python`});var G=o(W,4);c(G,{id:`transforming-sec-filings-for-batch-processing`,children:(e,t)=>{s(),i(e,r(`Transforming SEC filings for batch processing`))},$$slots:{default:!0}});var K=o(G,2);f(o(e(K)),{href:`https://pypi.org/project/edgartools/`,rel:`nofollow`,children:(e,t)=>{var n=se();s(),i(e,n)},$$slots:{default:!0}}),s(),n(K);var ge=o(K,2);u(ge,{code:`data_proc_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.13%22).uv_pip_install(%0A%20%20%20%20%23%20pin%20transitive%20deps%20to%20avoid%20surprises%20like%20this%20one%3A%0A%20%20%20%20%23%20https%3A%2F%2Fwww.edgartools.io%2Fpandas-3-0-and-edgartools%2F%0A%20%20%20%20%22edgartools%3D%3D5.8.3%22%2C%0A%20%20%20%20%22httpx%3D%3D0.28.1%22%2C%0A%20%20%20%20%22httpxthrottlecache%3D%3D0.3.0%22%2C%0A%20%20%20%20%22pandas%3C3%22%2C%0A%20%20%20%20%22pyrate-limiter%3D%3D3.9.0%22%2C%0A)%0A`,lang:`python`});var q=o(ge,2);f(o(e(q)),{href:`https://modal.com/docs/guide/volumes#volumes-v2-overview`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`v2 Volumes`))},$$slots:{default:!0}}),s(),n(q);var _e=o(q,2);u(_e,{code:`sec_edgar_feed%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22example-sec-edgar-daily%22%2C%20create_if_missing%3DTrue%2C%20version%3D2%0A)%0Adata_root%20%3D%20Path(%22%2Fdata%22)%0A`,lang:`python`});var J=o(_e,4);f(o(e(J),3),{href:`https://en.wikipedia.org/wiki/NetCDF`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`NetCDF`))},$$slots:{default:!0}}),s(3),n(J);var Y=o(J,4);u(Y,{code:`%40app.function(%0A%20%20%20%20volumes%3D%7Bdata_root%3A%20sec_edgar_feed%7D%2C%20timeout%3D10%20*%20MINUTES%2C%20scaledown_window%3D5%0A)%0Adef%20transform(folder%3A%20str%20%7C%20None)%20-%3E%20list%5BFiling%5D%3A%0A%20%20%20%20if%20folder%20is%20None%3A%0A%20%20%20%20%20%20%20%20return%20%5B%5D%0A%0A%20%20%20%20folder_path%20%3D%20data_root%20%2F%20folder%0A%20%20%20%20paths%20%3D%20%5Bp%20for%20p%20in%20folder_path.iterdir()%20if%20p.is_file()%20and%20p.suffix%20%3D%3D%20%22.nc%22%5D%0A%0A%20%20%20%20print(f%22Processing%20%7Blen(paths)%7D%20filings%22)%0A%0A%20%20%20%20chunks%3A%20list%5Blist%5BPath%5D%5D%20%3D%20%5Bpaths%5Bi%20%3A%20i%20%2B%20100%5D%20for%20i%20in%20range(0%2C%20len(paths)%2C%20100)%5D%0A%0A%20%20%20%20batches%20%3D%20list(_transform_filing_batch.map(chunks))%0A%0A%20%20%20%20filings%20%3D%20%5Bf%20for%20batch%20in%20batches%20for%20f%20in%20batch%20if%20f%20is%20not%20None%5D%0A%0A%20%20%20%20print(f%22Found%20documents%20for%20%7Blen(filings)%7D%20filings%20out%20of%20%7Blen(paths)%7D%22)%0A%0A%20%20%20%20return%20filings%0A%0A%0A%40app.function(%0A%20%20%20%20volumes%3D%7Bdata_root%3A%20sec_edgar_feed%7D%2C%0A%20%20%20%20scaledown_window%3D5%2C%0A%20%20%20%20image%3Ddata_proc_image%2C%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%0A)%0Adef%20_transform_filing_batch(raw_filing_paths%3A%20list%5BPath%5D)%20-%3E%20list%5BFiling%20%7C%20None%5D%3A%0A%20%20%20%20from%20edgar.sgml%20import%20FilingSGML%0A%0A%20%20%20%20out%20%3D%20%5B%5D%0A%20%20%20%20for%20raw_filing_path%20in%20raw_filing_paths%3A%0A%20%20%20%20%20%20%20%20sgml%20%3D%20FilingSGML.from_source(raw_filing_path)%0A%20%20%20%20%20%20%20%20text%20%3D%20extract_text(sgml)%0A%20%20%20%20%20%20%20%20if%20text%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20out.append(None)%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20out.append(%0A%20%20%20%20%20%20%20%20%20%20%20%20Filing(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20accession_number%3Dsgml.accession_number%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20form%3Dsgml.form%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cik%3Dsgml.cik%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20text%3Dtext%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20return%20out%0A%0A`,lang:`python`});var ve=o(Y,4);c(ve,{id:`loading-filings-from-the-sec-edgar-feed`,children:(e,t)=>{s(),i(e,r(`Loading filings from the SEC EDGAR Feed`))},$$slots:{default:!0}});var X=o(ve,2);f(o(e(X)),{href:`https://www.sec.gov/Archives/edgar/Feed/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SEC EDGAR Feed`))},$$slots:{default:!0}}),s(),n(X);var ye=o(X,4);u(ye,{code:`scraper_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.13%22).uv_pip_install(%0A%20%20%20%20%22requests%3D%3D2.32.5%22%0A)%0A`,lang:`python`});var Z=o(ye,4);f(o(e(Z)),{href:`https://modal.com/docs/guide/retries`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`retries`))},$$slots:{default:!0}}),s(),n(Z);var Q=o(Z,2);f(o(e(Q),3),{href:`https://modal.com/docs/reference/modal.Volume#commit`,rel:`nofollow`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),s(3),n(Q);var be=o(Q,2);u(be,{code:`%40app.function(%0A%20%20%20%20max_containers%3D10%2C%0A%20%20%20%20volumes%3D%7Bdata_root%3A%20sec_edgar_feed%7D%2C%0A%20%20%20%20retries%3D5%2C%0A%20%20%20%20image%3Dscraper_image%2C%0A%20%20%20%20scaledown_window%3D5%2C%0A)%0Adef%20extract(day%3A%20dt.date)%20-%3E%20str%20%7C%20None%3A%0A%20%20%20%20target_folder%20%3D%20str(day)%0A%20%20%20%20day_dir%20%3D%20data_root%20%2F%20target_folder%0A%20%20%20%20daily_name%20%3D%20f%22%7Bday%3A%25Y%25m%25d%7D.nc.tar.gz%22%0A%20%20%20%20tar_path%20%3D%20day_dir%20%2F%20daily_name%0A%0A%20%20%20%20%23%20If%20the%20folder%20doesn't%20exist%20yet%2C%20try%20downloading%20the%20day's%20tarball%0A%20%20%20%20if%20not%20tar_path.exists()%3A%0A%20%20%20%20%20%20%20%20print(f%22Looking%20for%20data%20for%20%7Bday%7D%20in%20SEC%20EDGAR%20Feed%22)%0A%20%20%20%20%20%20%20%20ok%20%3D%20_download_from_sec_edgar(day%2C%20day_dir)%0A%20%20%20%20%20%20%20%20if%20not%20ok%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20None%0A%0A%20%20%20%20if%20not%20any(p.suffix%20%3D%3D%20%22.nc%22%20for%20p%20in%20day_dir.iterdir())%3A%0A%20%20%20%20%20%20%20%20print(f%22Loading%20data%20for%20%7Bday%7D%20from%20%7Btar_path%7D%22)%0A%20%20%20%20%20%20%20%20_extract_tarfile(tar_path%2C%20day_dir)%0A%0A%20%20%20%20sec_edgar_feed.commit()%0A%20%20%20%20print(f%22Data%20for%20%7Bday%7D%20loaded%22)%0A%0A%20%20%20%20return%20target_folder%0A%0A`,lang:`python`});var xe=o(be,2);c(xe,{id:`addenda`,children:(e,t)=>{s(),i(e,r(`Addenda`))},$$slots:{default:!0}});var Se=o(xe,4);l(Se,{id:`utilities-for-transforming-sec-filings`,children:(e,t)=>{s(),i(e,r(`Utilities for transforming SEC Filings`))},$$slots:{default:!0}});var Ce=o(Se,6);u(Ce,{code:`def%20normalize_text(text%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20text%20%3D%20text.replace(%22%5Cr%5Cn%22%2C%20%22%5Cn%22).replace(%22%5Cr%22%2C%20%22%5Cn%22)%0A%20%20%20%20text%20%3D%20clean_xml(text)%0A%20%20%20%20return%20text%0A%0A%0Adef%20clean_xml(xml%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20import%20re%0A%0A%20%20%20%20_XMLNS_ATTR_RE%20%3D%20re.compile(r'%5Cs%2Bxmlns(%3A%5Cw%2B)%3F%3D%22%5B%5E%22%5D*%22'%2C%20re.I)%0A%20%20%20%20_XML_DECL_RE%20%3D%20re.compile(r%22%5E%5Cs*%3C%5C%3Fxml%5B%5E%3E%5D*%5C%3F%3E%5Cs*%22%2C%20re.I)%0A%20%20%20%20_EMPTY_TAG_RE%20%3D%20re.compile(r%22%3C(%5Cw%2B)(%5B%5E%3E%5D*)%3E%5Cs*%3C%2F%5C1%3E%22%2C%20re.S)%0A%20%20%20%20_BETWEEN_TAG_WS_RE%20%3D%20re.compile(r%22%3E%5Cs%2B%3C%22)%0A%0A%20%20%20%20xml%20%3D%20xml.replace(%22%5Cr%5Cn%22%2C%20%22%5Cn%22).replace(%22%5Cr%22%2C%20%22%5Cn%22).strip()%0A%0A%20%20%20%20%23%20drop%20xml%20declaration%2C%20remove%20xmlns%20attributes%0A%20%20%20%20xml%20%3D%20_XML_DECL_RE.sub(%22%22%2C%20xml)%0A%20%20%20%20xml%20%3D%20_XMLNS_ATTR_RE.sub(%22%22%2C%20xml)%0A%0A%20%20%20%20%23%20replace%20whitespace%20between%20tags%20with%20a%20single%20newline%0A%20%20%20%20xml%20%3D%20_BETWEEN_TAG_WS_RE.sub(%22%3E%3C%22%2C%20xml).replace(%22%3E%3C%22%2C%20%22%3E%5Cn%3C%22)%0A%0A%20%20%20%20return%20xml.strip()%0A%0A%0Adef%20truncate_head_tail(text%3A%20str%2C%20head%3A%20int%20%3D%2013_000%2C%20tail%3A%20int%20%3D%202_000)%20-%3E%20str%3A%0A%20%20%20%20if%20len(text)%20%3C%3D%20head%20%2B%20tail%3A%0A%20%20%20%20%20%20%20%20return%20text%0A%20%20%20%20return%20text%5B%3Ahead%5D.rstrip()%20%2B%20%22%5Cn%5Cn%5B...TRUNCATED...%5D%5Cn%5Cn%22%20%2B%20text%5B-tail%3A%5D.lstrip()%0A%0A%0Adef%20extract_text(sgml)%20-%3E%20str%20%7C%20None%3A%0A%20%20%20%20doc%20%3D%20sgml.xml()%0A%20%20%20%20return%20truncate_head_tail(normalize_text(doc))%20if%20doc%20else%20None%0A%0A`,lang:`python`});var we=o(Ce,2);l(we,{id:`utilities-for-loading-filings-from-the-sec-edgar-feed`,children:(e,t)=>{s(),i(e,r(`Utilities for loading filings from the SEC EDGAR Feed`))},$$slots:{default:!0}});var $=o(we,4);f(o(e($)),{href:`https://www.math.utah.edu/docs/info/tar_4.html`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`tar`))},$$slots:{default:!0}}),s(),n($),u(o($,4),{code:`def%20_download_from_sec_edgar(day%3A%20dt.date%2C%20day_dir%3A%20Path)%20-%3E%20bool%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20SEC_UA%20%3D%20os.environ.get(%22SEC_USER_AGENT%22%2C%20%22YourName%20your.email%40example.com%22)%0A%20%20%20%20session%20%3D%20requests.Session()%0A%20%20%20%20session.headers.update(%7B%22User-Agent%22%3A%20SEC_UA%2C%20%22Accept-Encoding%22%3A%20%22gzip%2C%20deflate%22%7D)%0A%0A%20%20%20%20base%20%3D%20%22https%3A%2F%2Fwww.sec.gov%2FArchives%2Fedgar%2FFeed%22%0A%0A%20%20%20%20def%20quarter(d%3A%20dt.date)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20return%20f%22QTR%7B(d.month%20-%201)%20%2F%2F%203%20%2B%201%7D%22%0A%0A%20%20%20%20qtr%20%3D%20quarter(day)%0A%20%20%20%20daily_name%20%3D%20f%22%7Bday%3A%25Y%25m%25d%7D.nc.tar.gz%22%0A%20%20%20%20qtr_index%20%3D%20f%22%7Bbase%7D%2F%7Bday.year%7D%2F%7Bqtr%7D%2Findex.json%22%0A%0A%20%20%20%20if%20not%20check_index(session%2C%20qtr_index%2C%20daily_name)%3A%0A%20%20%20%20%20%20%20%20print(f%22no%20data%20for%20%7Bday%7D%20in%20SEC%20EDGAR%20Feed%22)%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%20%20%20%20day_dir.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20tar_path%20%3D%20day_dir%20%2F%20daily_name%0A%20%20%20%20if%20not%20tar_path.exists()%20or%20tar_path.stat().st_size%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20url%20%3D%20f%22%7Bbase%7D%2F%7Bday.year%7D%2F%7Bqtr%7D%2F%7Bdaily_name%7D%22%0A%20%20%20%20%20%20%20%20print(f%22Downloading%20from%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20print(%22This%20can%20take%20several%20minutes%22)%0A%20%20%20%20%20%20%20%20_download_tar(session%2C%20url%2C%20tar_path)%0A%0A%20%20%20%20return%20True%0A%0A%0Adef%20_extract_tarfile(from_tar_path%2C%20to_dir)%3A%0A%20%20%20%20import%20tarfile%0A%0A%20%20%20%20with%20tarfile.open(from_tar_path%2C%20%22r%3Agz%22)%20as%20tf%3A%0A%20%20%20%20%20%20%20%20for%20member%20in%20tf%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20(member.isfile()%20and%20member.name.endswith(%22.nc%22))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20dest%20%3D%20to_dir%20%2F%20Path(member.name).name%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20dest.exists()%20and%20dest.stat().st_size%20%3E%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20f%20%3D%20tf.extractfile(member)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20f%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%20%20%20%20%20%20%20%20%20%20%20%20dest.write_bytes(f.read())%0A%0A%0Adef%20check_index(session%2C%20index_url%2C%20name)%20-%3E%20bool%3A%0A%20%20%20%20r%20%3D%20session.get(index_url%2C%20timeout%3D30)%0A%20%20%20%20if%20r.status_code%20%3D%3D%20404%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%20%20%20%20r.raise_for_status()%0A%20%20%20%20for%20it%20in%20r.json().get(%22directory%22%2C%20%7B%7D).get(%22item%22%2C%20%5B%5D)%3A%0A%20%20%20%20%20%20%20%20if%20it.get(%22type%22)%20%3D%3D%20%22file%22%20and%20it.get(%22name%22)%20%3D%3D%20name%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20True%0A%20%20%20%20return%20False%0A%0A%0Adef%20_download_tar(session%2C%20url%2C%20tar_path)%3A%0A%20%20%20%20resp%20%3D%20session.get(url%2C%20timeout%3D500)%0A%20%20%20%20resp.raise_for_status()%0A%20%20%20%20tmp%20%3D%20tar_path.with_suffix(tar_path.suffix%20%2B%20%22.part%22)%0A%20%20%20%20tmp.write_bytes(resp.content)%0A%20%20%20%20tmp.replace(tar_path)%0A`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{g as default,p as metadata};
//# sourceMappingURL=CFxOfzQP.js.map
