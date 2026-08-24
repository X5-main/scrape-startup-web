(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2932b25b-2051-407f-82c9-6207dc3363f3`,e._sentryDebugIdIdentifier=`sentry-dbid-2932b25b-2051-407f-82c9-6207dc3363f3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g=`/_app/immutable/assets/nyc_yellow_taxi_trips_s3_mount.DW1A9-sb.png`,_={toc:[{depth:1,value:`Analyze NYC yellow taxi data with DuckDB on Parquet files from S3`,id:`analyze-nyc-yellow-taxi-data-with-duckdb-on-parquet-files-from-s3`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`},{depth:2,value:`Download New York City’s taxi data`,id:`download-new-york-citys-taxi-data`},{depth:2,value:`Analyze data with DuckDB`,id:`analyze-data-with-duckdb`},{depth:2,value:`Plot daily taxi rides`,id:`plot-daily-taxi-rides`},{depth:2,value:`Run everything`,id:`run-everything`}]}],rawContent:`# Analyze NYC yellow taxi data with DuckDB on Parquet files from S3

This example shows how to use Modal for a classic data science task: loading table-structured data into cloud stores,
analyzing it, and plotting the results.

In particular, we'll load public NYC taxi ride data into S3 as Parquet files,
then run SQL queries on it with DuckDB.

We'll mount the S3 bucket in a Modal app with [\`CloudBucketMount\`](https://modal.com/docs/reference/modal.CloudBucketMount).
We will write to and then read from that bucket, in each case using
Modal's [parallel execution features](https://modal.com/docs/guide/scale) to handle many files at once.

## Basic setup

You will need to have an S3 bucket and AWS credentials to run this example. Refer to the documentation
for the exact [IAM permissions](https://modal.com/docs/guide/cloud-bucket-mounts#iam-permissions) your credentials will need.

After you are done creating a bucket and configuring IAM settings,
you now need to create a [\`Secret\`](https://modal.com/docs/guide/secrets) to share
the relevant AWS credentials with your Modal apps.

\`\`\`python
from datetime import datetime
from pathlib import Path, PosixPath

import modal

image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "requests==2.31.0", "duckdb==0.10.0", "matplotlib==3.8.3"
)
app = modal.App("example-s3-bucket-mount", image=image)

secret = modal.Secret.from_name(
    "s3-bucket-secret",
    required_keys=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
)

MOUNT_PATH = PosixPath("/bucket")
YELLOW_TAXI_DATA_PATH = MOUNT_PATH / "yellow_taxi"

\`\`\`

The dependencies installed above are not available locally. The following block instructs Modal
to only import them inside the container.

\`\`\`python
with image.imports():
    import duckdb
    import requests


\`\`\`

## Download New York City's taxi data

NYC makes data about taxi rides publicly available. The city's [Taxi & Limousine Commission (TLC)](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
publishes files in the Parquet format. Files are organized by year and month.

We are going to download all available files and store them in an S3 bucket. We do this by
attaching a \`modal.CloudBucketMount\` with the S3 bucket name and its respective credentials.
The files in the bucket will then be available at \`MOUNT_PATH\`.

As we'll see below, this operation can be massively sped up by running it in parallel on Modal.

\`\`\`python
@app.function(
    volumes={
        MOUNT_PATH: modal.CloudBucketMount("modal-s3mount-test-bucket", secret=secret),
    },
)
def download_data(year: int, month: int) -> str:
    filename = f"yellow_tripdata_{year}-{month:02d}.parquet"
    url = f"https://d37ci6vzurychx.cloudfront.net/trip-data/{filename}"
    s3_path = MOUNT_PATH / filename
    # Skip downloading if file exists.
    if not s3_path.exists():
        if not YELLOW_TAXI_DATA_PATH.exists():
            YELLOW_TAXI_DATA_PATH.mkdir(parents=True, exist_ok=True)
            with requests.get(url, stream=True) as r:
                r.raise_for_status()
                print(f"downloading => {s3_path}")
                # It looks like we writing locally, but this is actually writing to S3!
                with open(s3_path, "wb") as file:
                    for chunk in r.iter_content(chunk_size=8192):
                        file.write(chunk)

    return s3_path.as_posix()


\`\`\`

## Analyze data with DuckDB

[DuckDB](https://duckdb.org/) is an analytical database with rich support for Parquet files.
It is also very fast. Below, we define a Modal Function that aggregates yellow taxi trips
within a month (each file contains all the rides from a specific month).

\`\`\`python
@app.function(
    volumes={
        MOUNT_PATH: modal.CloudBucketMount(
            "modal-s3mount-test-bucket",
            secret=modal.Secret.from_name("s3-bucket-secret"),
        )
    },
)
def aggregate_data(path: str) -> list[tuple[datetime, int]]:
    print(f"processing => {path}")

    # Parse file.
    year_month_part = path.split("yellow_tripdata_")[1]
    year, month = year_month_part.split("-")
    month = month.replace(".parquet", "")

    # Make DuckDB query using in-memory storage.
    con = duckdb.connect(database=":memory:")
    q = """
    with sub as (
        select tpep_pickup_datetime::date d, count(1) c
        from read_parquet(?)
        group by 1
    )
    select d, c from sub
    where date_part('year', d) = ?  -- filter out garbage
    and date_part('month', d) = ?   -- same
    """
    con.execute(q, (path, year, month))
    return list(con.fetchall())


\`\`\`

## Plot daily taxi rides

Finally, we want to plot our results.
The plot created shows the number of yellow taxi rides per day in NYC.
This function runs remotely, on Modal, so we don't need to install plotting libraries locally.

\`\`\`python
@app.function()
def plot(dataset) -> bytes:
    import io

    import matplotlib.pyplot as plt

    # Sorting data by date
    dataset.sort(key=lambda x: x[0])

    # Unpacking dates and values
    dates, values = zip(*dataset)

    # Plotting
    plt.figure(figsize=(10, 6))
    plt.plot(dates, values)
    plt.title("Number of NYC yellow taxi trips by weekday, 2018-2023")
    plt.ylabel("Number of daily trips")
    plt.grid(True)
    plt.tight_layout()

    # Saving plot as raw bytes to send back
    buf = io.BytesIO()

    plt.savefig(buf, format="png")

    buf.seek(0)

    return buf.getvalue()


\`\`\`

## Run everything

The \`@app.local_entrypoint()\` defines what happens when we run our Modal program locally.
We invoke it from the CLI by calling \`modal run s3_bucket_mount.py\`.
We first call \`download_data()\` and \`starmap\` (named because it's kind of like \`map(*args)\`)
on tuples of inputs \`(year, month)\`. This will download, in parallel,
all yellow taxi data files into our locally mounted S3 bucket and return a list of
Parquet file paths. Then, we call \`aggregate_data()\` with \`map\` on that list. These files are
also read from our S3 bucket. So one function writes files to S3 and the other
reads files from S3 in; both run across many files in parallel.

Finally, we call \`plot\` to generate the following figure:

![Number of NYC yellow taxi trips by weekday, 2018-2023](./nyc_yellow_taxi_trips_s3_mount.png)

This program should run in less than 30 seconds.

\`\`\`python
@app.local_entrypoint()
def main():
    # List of tuples[year, month].
    inputs = [(year, month) for year in range(2018, 2023) for month in range(1, 13)]

    # List of file paths in S3.
    parquet_files: list[str] = []
    for path in download_data.starmap(inputs):
        print(f"done => {path}")
        parquet_files.append(path)

    # List of datetimes and number of yellow taxi trips.
    dataset = []
    for r in aggregate_data.map(parquet_files):
        dataset += r

    dir = Path("/tmp") / "s3_bucket_mount"
    if not dir.exists():
        dir.mkdir(exist_ok=True, parents=True)

    figure = plot.remote(dataset)
    path = dir / "nyc_yellow_taxi_trips_s3_mount.png"
    with open(path, "wb") as file:
        print(f"Saving figure to {path}")
        file.write(figure)

\`\`\`
`,meta:{title:`Analyze NYC yellow taxi data with DuckDB on Parquet files from S3`,description:`This example shows how to use Modal for a classic data science task: loading table-structured data into cloud stores, analyzing it, and plotting the results.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<code>CloudBucketMount</code>`),S=t(`<code>Secret</code>`),C=t(`<!> <p>This example shows how to use Modal for a classic data science task: loading table-structured data into cloud stores,
analyzing it, and plotting the results.</p> <p>In particular, we’ll load public NYC taxi ride data into S3 as Parquet files,
then run SQL queries on it with DuckDB.</p> <p>We’ll mount the S3 bucket in a Modal app with <!>.
We will write to and then read from that bucket, in each case using
Modal’s <!> to handle many files at once.</p> <!> <p>You will need to have an S3 bucket and AWS credentials to run this example. Refer to the documentation
for the exact <!> your credentials will need.</p> <p>After you are done creating a bucket and configuring IAM settings,
you now need to create a <!> to share
the relevant AWS credentials with your Modal apps.</p> <!> <p>The dependencies installed above are not available locally. The following block instructs Modal
to only import them inside the container.</p> <!> <!> <p>NYC makes data about taxi rides publicly available. The city’s <!> publishes files in the Parquet format. Files are organized by year and month.</p> <p>We are going to download all available files and store them in an S3 bucket. We do this by
attaching a <code>modal.CloudBucketMount</code> with the S3 bucket name and its respective credentials.
The files in the bucket will then be available at <code>MOUNT_PATH</code>.</p> <p>As we’ll see below, this operation can be massively sped up by running it in parallel on Modal.</p> <!> <!> <p><!> is an analytical database with rich support for Parquet files.
It is also very fast. Below, we define a Modal Function that aggregates yellow taxi trips
within a month (each file contains all the rides from a specific month).</p> <!> <!> <p>Finally, we want to plot our results.
The plot created shows the number of yellow taxi rides per day in NYC.
This function runs remotely, on Modal, so we don’t need to install plotting libraries locally.</p> <!> <!> <p>The <code>@app.local_entrypoint()</code> defines what happens when we run our Modal program locally.
We invoke it from the CLI by calling <code>modal run s3_bucket_mount.py</code>.
We first call <code>download_data()</code> and <code>starmap</code> (named because it’s kind of like <code>map(*args)</code>)
on tuples of inputs <code>(year, month)</code>. This will download, in parallel,
all yellow taxi data files into our locally mounted S3 bucket and return a list of
Parquet file paths. Then, we call <code>aggregate_data()</code> with <code>map</code> on that list. These files are
also read from our S3 bucket. So one function writes files to S3 and the other
reads files from S3 in; both run across many files in parallel.</p> <p>Finally, we call <code>plot</code> to generate the following figure:</p> <p><!></p> <p>This program should run in less than 30 seconds.</p> <!>`,1);function w(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=C(),m=s(o);d(m,{id:`analyze-nyc-yellow-taxi-data-with-duckdb-on-parquet-files-from-s3`,children:(e,t)=>{l(),i(e,r(`Analyze NYC yellow taxi data with DuckDB on Parquet files from S3`))},$$slots:{default:!0}});var _=c(m,6),v=c(e(_));h(v,{href:`https://modal.com/docs/reference/modal.CloudBucketMount`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),h(c(v,2),{href:`https://modal.com/docs/guide/scale`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`parallel execution features`))},$$slots:{default:!0}}),l(),n(_);var y=c(_,2);u(y,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var b=c(y,2);h(c(e(b)),{href:`https://modal.com/docs/guide/cloud-bucket-mounts#iam-permissions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`IAM permissions`))},$$slots:{default:!0}}),l(),n(b);var w=c(b,2);h(c(e(w)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);p(T,{code:`from%20datetime%20import%20datetime%0Afrom%20pathlib%20import%20Path%2C%20PosixPath%0A%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22requests%3D%3D2.31.0%22%2C%20%22duckdb%3D%3D0.10.0%22%2C%20%22matplotlib%3D%3D3.8.3%22%0A)%0Aapp%20%3D%20modal.App(%22example-s3-bucket-mount%22%2C%20image%3Dimage)%0A%0Asecret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22s3-bucket-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%22AWS_ACCESS_KEY_ID%22%2C%20%22AWS_SECRET_ACCESS_KEY%22%5D%2C%0A)%0A%0AMOUNT_PATH%20%3D%20PosixPath(%22%2Fbucket%22)%0AYELLOW_TAXI_DATA_PATH%20%3D%20MOUNT_PATH%20%2F%20%22yellow_taxi%22%0A`,lang:`python`});var E=c(T,4);p(E,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20duckdb%0A%20%20%20%20import%20requests%0A%0A`,lang:`python`});var D=c(E,2);u(D,{id:`download-new-york-citys-taxi-data`,children:(e,t)=>{l(),i(e,r(`Download New York City’s taxi data`))},$$slots:{default:!0}});var O=c(D,2);h(c(e(O)),{href:`https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Taxi & Limousine Commission (TLC)`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,6);p(k,{code:`%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20MOUNT_PATH%3A%20modal.CloudBucketMount(%22modal-s3mount-test-bucket%22%2C%20secret%3Dsecret)%2C%0A%20%20%20%20%7D%2C%0A)%0Adef%20download_data(year%3A%20int%2C%20month%3A%20int)%20-%3E%20str%3A%0A%20%20%20%20filename%20%3D%20f%22yellow_tripdata_%7Byear%7D-%7Bmonth%3A02d%7D.parquet%22%0A%20%20%20%20url%20%3D%20f%22https%3A%2F%2Fd37ci6vzurychx.cloudfront.net%2Ftrip-data%2F%7Bfilename%7D%22%0A%20%20%20%20s3_path%20%3D%20MOUNT_PATH%20%2F%20filename%0A%20%20%20%20%23%20Skip%20downloading%20if%20file%20exists.%0A%20%20%20%20if%20not%20s3_path.exists()%3A%0A%20%20%20%20%20%20%20%20if%20not%20YELLOW_TAXI_DATA_PATH.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20YELLOW_TAXI_DATA_PATH.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20requests.get(url%2C%20stream%3DTrue)%20as%20r%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20r.raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22downloading%20%3D%3E%20%7Bs3_path%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20It%20looks%20like%20we%20writing%20locally%2C%20but%20this%20is%20actually%20writing%20to%20S3!%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20open(s3_path%2C%20%22wb%22)%20as%20file%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20chunk%20in%20r.iter_content(chunk_size%3D8192)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20file.write(chunk)%0A%0A%20%20%20%20return%20s3_path.as_posix()%0A%0A`,lang:`python`});var A=c(k,2);u(A,{id:`analyze-data-with-duckdb`,children:(e,t)=>{l(),i(e,r(`Analyze data with DuckDB`))},$$slots:{default:!0}});var j=c(A,2);h(e(j),{href:`https://duckdb.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`DuckDB`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);p(M,{code:`%40app.function(%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20MOUNT_PATH%3A%20modal.CloudBucketMount(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22modal-s3mount-test-bucket%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20secret%3Dmodal.Secret.from_name(%22s3-bucket-secret%22)%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%7D%2C%0A)%0Adef%20aggregate_data(path%3A%20str)%20-%3E%20list%5Btuple%5Bdatetime%2C%20int%5D%5D%3A%0A%20%20%20%20print(f%22processing%20%3D%3E%20%7Bpath%7D%22)%0A%0A%20%20%20%20%23%20Parse%20file.%0A%20%20%20%20year_month_part%20%3D%20path.split(%22yellow_tripdata_%22)%5B1%5D%0A%20%20%20%20year%2C%20month%20%3D%20year_month_part.split(%22-%22)%0A%20%20%20%20month%20%3D%20month.replace(%22.parquet%22%2C%20%22%22)%0A%0A%20%20%20%20%23%20Make%20DuckDB%20query%20using%20in-memory%20storage.%0A%20%20%20%20con%20%3D%20duckdb.connect(database%3D%22%3Amemory%3A%22)%0A%20%20%20%20q%20%3D%20%22%22%22%0A%20%20%20%20with%20sub%20as%20(%0A%20%20%20%20%20%20%20%20select%20tpep_pickup_datetime%3A%3Adate%20d%2C%20count(1)%20c%0A%20%20%20%20%20%20%20%20from%20read_parquet(%3F)%0A%20%20%20%20%20%20%20%20group%20by%201%0A%20%20%20%20)%0A%20%20%20%20select%20d%2C%20c%20from%20sub%0A%20%20%20%20where%20date_part('year'%2C%20d)%20%3D%20%3F%20%20--%20filter%20out%20garbage%0A%20%20%20%20and%20date_part('month'%2C%20d)%20%3D%20%3F%20%20%20--%20same%0A%20%20%20%20%22%22%22%0A%20%20%20%20con.execute(q%2C%20(path%2C%20year%2C%20month))%0A%20%20%20%20return%20list(con.fetchall())%0A%0A`,lang:`python`});var N=c(M,2);u(N,{id:`plot-daily-taxi-rides`,children:(e,t)=>{l(),i(e,r(`Plot daily taxi rides`))},$$slots:{default:!0}});var P=c(N,4);p(P,{code:`%40app.function()%0Adef%20plot(dataset)%20-%3E%20bytes%3A%0A%20%20%20%20import%20io%0A%0A%20%20%20%20import%20matplotlib.pyplot%20as%20plt%0A%0A%20%20%20%20%23%20Sorting%20data%20by%20date%0A%20%20%20%20dataset.sort(key%3Dlambda%20x%3A%20x%5B0%5D)%0A%0A%20%20%20%20%23%20Unpacking%20dates%20and%20values%0A%20%20%20%20dates%2C%20values%20%3D%20zip(*dataset)%0A%0A%20%20%20%20%23%20Plotting%0A%20%20%20%20plt.figure(figsize%3D(10%2C%206))%0A%20%20%20%20plt.plot(dates%2C%20values)%0A%20%20%20%20plt.title(%22Number%20of%20NYC%20yellow%20taxi%20trips%20by%20weekday%2C%202018-2023%22)%0A%20%20%20%20plt.ylabel(%22Number%20of%20daily%20trips%22)%0A%20%20%20%20plt.grid(True)%0A%20%20%20%20plt.tight_layout()%0A%0A%20%20%20%20%23%20Saving%20plot%20as%20raw%20bytes%20to%20send%20back%0A%20%20%20%20buf%20%3D%20io.BytesIO()%0A%0A%20%20%20%20plt.savefig(buf%2C%20format%3D%22png%22)%0A%0A%20%20%20%20buf.seek(0)%0A%0A%20%20%20%20return%20buf.getvalue()%0A%0A`,lang:`python`});var F=c(P,2);u(F,{id:`run-everything`,children:(e,t)=>{l(),i(e,r(`Run everything`))},$$slots:{default:!0}});var I=c(F,6);f(e(I),{get src(){return g},alt:`Number of NYC yellow taxi trips by weekday, 2018-2023`}),n(I),p(c(I,4),{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20List%20of%20tuples%5Byear%2C%20month%5D.%0A%20%20%20%20inputs%20%3D%20%5B(year%2C%20month)%20for%20year%20in%20range(2018%2C%202023)%20for%20month%20in%20range(1%2C%2013)%5D%0A%0A%20%20%20%20%23%20List%20of%20file%20paths%20in%20S3.%0A%20%20%20%20parquet_files%3A%20list%5Bstr%5D%20%3D%20%5B%5D%0A%20%20%20%20for%20path%20in%20download_data.starmap(inputs)%3A%0A%20%20%20%20%20%20%20%20print(f%22done%20%3D%3E%20%7Bpath%7D%22)%0A%20%20%20%20%20%20%20%20parquet_files.append(path)%0A%0A%20%20%20%20%23%20List%20of%20datetimes%20and%20number%20of%20yellow%20taxi%20trips.%0A%20%20%20%20dataset%20%3D%20%5B%5D%0A%20%20%20%20for%20r%20in%20aggregate_data.map(parquet_files)%3A%0A%20%20%20%20%20%20%20%20dataset%20%2B%3D%20r%0A%0A%20%20%20%20dir%20%3D%20Path(%22%2Ftmp%22)%20%2F%20%22s3_bucket_mount%22%0A%20%20%20%20if%20not%20dir.exists()%3A%0A%20%20%20%20%20%20%20%20dir.mkdir(exist_ok%3DTrue%2C%20parents%3DTrue)%0A%0A%20%20%20%20figure%20%3D%20plot.remote(dataset)%0A%20%20%20%20path%20%3D%20dir%20%2F%20%22nyc_yellow_taxi_trips_s3_mount.png%22%0A%20%20%20%20with%20open(path%2C%20%22wb%22)%20as%20file%3A%0A%20%20%20%20%20%20%20%20print(f%22Saving%20figure%20to%20%7Bpath%7D%22)%0A%20%20%20%20%20%20%20%20file.write(figure)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{w as default,_ as metadata};
//# sourceMappingURL=DW24LVpO2.js.map
