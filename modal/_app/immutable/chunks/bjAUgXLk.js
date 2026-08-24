(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d73ff504-9b42-4f0b-8a01-15d52326b1fe`,e._sentryDebugIdIdentifier=`sentry-dbid-d73ff504-9b42-4f0b-8a01-15d52326b1fe`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g=`/_app/immutable/assets/dbt_docs.BwfMuDI8.png`,_={toc:[{depth:1,value:`Build your own data warehouse with DuckDB, DBT, and Modal`,id:`build-your-own-data-warehouse-with-duckdb-dbt-and-modal`,children:[{depth:2,value:`Configure Modal, S3, and DBT`,id:`configure-modal-s3-and-dbt`},{depth:2,value:`Upload seed data`,id:`upload-seed-data`},{depth:2,value:`Run DBT on the cloud with Modal`,id:`run-dbt-on-the-cloud-with-modal`},{depth:2,value:`Serve fresh data documentation with FastAPI and Modal`,id:`serve-fresh-data-documentation-with-fastapi-and-modal`},{depth:2,value:`Schedule daily updates`,id:`schedule-daily-updates`}]}],rawContent:`# Build your own data warehouse with DuckDB, DBT, and Modal

This example contains a minimal but capable [data warehouse](https://en.wikipedia.org/wiki/Data_warehouse).
It's comprised of the following:

- [DuckDB](https://duckdb.org) as the warehouse's [OLAP](https://en.wikipedia.org/wiki/Online_analytical_processing) database engine

- [AWS S3](https://aws.amazon.com/s3/) as the data storage provider

- [DBT](https://docs.getdbt.com/docs/introduction) as the data transformation tool

Meet your new serverless cloud data warehouse, powered by Modal!

## Configure Modal, S3, and DBT

The only thing in the source code that you must update is the S3 bucket name.
AWS S3 bucket names are globally unique, and the one in this source is used by us to host this example.

Update the \`BUCKET_NAME\` variable below and also any references to the original value
within \`sample_proj_duckdb_s3/models/\`. The AWS IAM policy below also includes the bucket
name and that must be updated.

\`\`\`python
from pathlib import Path

import modal

BUCKET_NAME = "modal-example-dbt-duckdb-s3"
LOCAL_DBT_PROJECT = (  # local path
    Path(__file__).parent / "sample_proj_duckdb_s3"
)
PROJ_PATH = "/root/dbt"  # remote paths
PROFILES_PATH = "/root/dbt_profile"
TARGET_PATH = "/root/target"
\`\`\`

Most of the DBT code and configuration is taken directly from the classic
[Jaffle Shop](https://github.com/dbt-labs/jaffle_shop) demo and modified to support
using \`dbt-duckdb\` with an S3 bucket.

The DBT \`profiles.yml\` configuration is taken from
[the \`dbt-duckdb\` docs](https://github.com/jwills/dbt-duckdb#configuring-your-profile).

We also define the environment our application will run in --
a container image, as in Docker.
See [this guide](https://modal.com/docs/guide/custom-container) for details.

\`\`\`python
dbt_image = (  # start from a slim Linux image
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install(  # install python packages
        "boto3~=1.34",  # aws client sdk
        "dbt-duckdb~=1.8.1",  # dbt and duckdb and a connector
        "pandas~=2.2.2",  # dataframes
        "pyarrow~=16.1.0",  # columnar data lib
        "fastapi[standard]~=0.115.4",  # web app
    )
    .env(  # configure DBT environment variables
        {
            "DBT_PROJECT_DIR": PROJ_PATH,
            "DBT_PROFILES_DIR": PROFILES_PATH,
            "DBT_TARGET_PATH": TARGET_PATH,
        }
    )
    # Here we add all local code and configuration into the Modal Image
    # so that it will be available when we run DBT on Modal.
    .add_local_dir(LOCAL_DBT_PROJECT, remote_path=PROJ_PATH)
    .add_local_file(
        LOCAL_DBT_PROJECT / "profiles.yml",
        remote_path=f"{PROFILES_PATH}/profiles.yml",
    )
)

app = modal.App(name="example-dbt-duckdb", image=dbt_image)

dbt_target = modal.Volume.from_name("dbt-target-vol", create_if_missing=True)

\`\`\`

We'll also need to authenticate with AWS to store data in S3.

\`\`\`python
s3_secret = modal.Secret.from_name(
    "modal-examples-aws-user",
    required_keys=["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
)

\`\`\`

Create this Secret using the "AWS" template from the [Secrets dashboard](https://modal.com/secrets).
Below we will use the provided credentials in a Modal Function to create an S3 bucket and
populate it with \`.parquet\` data, so be sure to provide credentials for a user
with permission to create S3 buckets and read & write data from them.

The policy required for this example is the following.
Not that you *must* update the bucket name listed in the policy to your
own bucket name.

\`\`\`json
{
    "Statement": [
        {
            "Action": "s3:*",
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::modal-example-dbt-duckdb-s3/*",
                "arn:aws:s3:::modal-example-dbt-duckdb-s3"
            ],
            "Sid": "duckdbs3access"
        }
    ],
    "Version": "2012-10-17"
}
\`\`\`

## Upload seed data

In order to provide source data for DBT to ingest and transform,
we have the below \`create_source_data\` function which creates an AWS S3 bucket and
populates it with Parquet files based off the CSV data in the \`seeds/\` directory.

You can kick it off by running this script on Modal:

\`\`\`bash
modal run dbt_duckdb.py
\`\`\`

This script also runs the full data warehouse setup, and the whole process takes a minute or two.
We'll walk through the rest of the steps below. See the \`app.local_entrypoint\`
below for details.

Note that this is not the typical way that \`seeds/\` data is used, but it's useful for this
demonstration. See [the DBT docs](https://docs.getdbt.com/docs/build/seeds) for more info.

\`\`\`python
@app.function(
    secrets=[s3_secret],
)
def create_source_data():
    import boto3
    import pandas as pd
    from botocore.exceptions import ClientError

    s3_client = boto3.client("s3")
    s3_client.create_bucket(Bucket=BUCKET_NAME)

    for seed_csv_path in Path(PROJ_PATH, "seeds").glob("*.csv"):
        print(f"Found seed file {seed_csv_path}")
        name = seed_csv_path.stem
        parquet_filename = f"{name}.parquet"
        object_key = f"sources/{parquet_filename}"
        try:
            s3_client.head_object(Bucket=BUCKET_NAME, Key=object_key)
            print(
                f"File '{object_key}' already exists in bucket '{BUCKET_NAME}'. Skipping."
            )
        except ClientError:
            df = pd.read_csv(seed_csv_path)
            df.to_parquet(parquet_filename)
            print(f"Uploading '{object_key}' to S3 bucket '{BUCKET_NAME}'")
            s3_client.upload_file(parquet_filename, BUCKET_NAME, object_key)
            print(f"File '{object_key}' uploaded successfully.")


\`\`\`

## Run DBT on the cloud with Modal

Modal makes it easy to run Python code in the cloud.
And DBT is a Python tool, so it's easy to run DBT with Modal:
below, we import the \`dbt\` library's \`dbtRunner\` to pass commands from our
Python code, running on Modal, the same way we'd pass commands on a command line.

Note that this Modal Function has access to our AWS S3 Secret,
the local files associated with our DBT project and profiles,
and a remote Modal Volume that acts as a distributed file system.

\`\`\`python
@app.function(
    secrets=[s3_secret],
    volumes={TARGET_PATH: dbt_target},
)
def run(command: str) -> None:
    from dbt.cli.main import dbtRunner

    res = dbtRunner().invoke(command.split(" "))
    if res.exception:
        print(res.exception)


\`\`\`

You can run this Modal Function from the command line with

\`modal run dbt_duckdb.py::run --command run\`

A successful run will log something like the following:

\`\`\`
03:41:04  Running with dbt=1.5.0
03:41:05  Found 5 models, 8 tests, 0 snapshots, 0 analyses, 313 macros, 0 operations, 3 seed files, 3 sources, 0 exposures, 0 metrics, 0 groups
03:41:05
03:41:06  Concurrency: 1 threads (target='modal')
03:41:06
03:41:06  1 of 5 START sql table model main.stg_customers ................................ [RUN]
03:41:06  1 of 5 OK created sql table model main.stg_customers ........................... [OK in 0.45s]
03:41:06  2 of 5 START sql table model main.stg_orders ................................... [RUN]
03:41:06  2 of 5 OK created sql table model main.stg_orders .............................. [OK in 0.34s]
03:41:06  3 of 5 START sql table model main.stg_payments ................................. [RUN]
03:41:07  3 of 5 OK created sql table model main.stg_payments ............................ [OK in 0.36s]
03:41:07  4 of 5 START sql external model main.customers ................................. [RUN]
03:41:07  4 of 5 OK created sql external model main.customers ............................ [OK in 0.72s]
03:41:07  5 of 5 START sql table model main.orders ....................................... [RUN]
03:41:08  5 of 5 OK created sql table model main.orders .................................. [OK in 0.22s]
03:41:08
03:41:08  Finished running 4 table models, 1 external model in 0 hours 0 minutes and 3.15 seconds (3.15s).
03:41:08  Completed successfully
03:41:08
03:41:08  Done. PASS=5 WARN=0 ERROR=0 SKIP=0 TOTAL=5
\`\`\`

Look for the \`'materialized='external'\` DBT config in the SQL templates
to see how \`dbt-duckdb\` is able to write back the transformed data to AWS S3!

After running the \`run\` command and seeing it succeed, check what's contained
under the bucket's \`out/\` key prefix. You'll see that DBT has run the transformations
defined in \`sample_proj_duckdb_s3/models/\` and produced output \`.parquet\` files.

## Serve fresh data documentation with FastAPI and Modal

DBT also automatically generates [rich, interactive data docs](https://docs.getdbt.com/docs/collaborate/explore-projects).
You can serve these docs on Modal.
Just define a simple [FastAPI](https://fastapi.tiangolo.com/) app:

\`\`\`python
@app.function(volumes={TARGET_PATH: dbt_target})
@modal.concurrent(max_inputs=100)
@modal.asgi_app()  # wrap a function that returns a FastAPI app in this decorator to host on Modal
def serve_dbt_docs():
    import fastapi
    from fastapi.staticfiles import StaticFiles

    web_app = fastapi.FastAPI()
    web_app.mount(
        "/",
        StaticFiles(  # dbt docs are automatically generated and sitting in the Volume
            directory=TARGET_PATH, html=True
        ),
        name="static",
    )

    return web_app


\`\`\`

And deploy that app to Modal with

\`\`\`bash
modal deploy dbt_duckdb.py
# ...
# Created web function serve_dbt_docs => <output-url>
\`\`\`

If you navigate to the output URL, you should see something like
[![example dbt docs](./dbt_docs.png)](https://modal-labs-examples--example-dbt-duckdb-serve-dbt-docs.modal.run)

You can also check out our instance of the docs [here](https://modal-labs-examples--example-dbt-duckdb-serve-dbt-docs.modal.run).
The app will be served "serverlessly" -- it will automatically scale up or down
during periods of increased or decreased usage, and you won't be charged at all
when it has scaled to zero.

## Schedule daily updates

The following \`daily_build\` function [runs on a schedule](https://modal.com/docs/guide/cron)
to keep the DuckDB data warehouse up-to-date. It is also deployed by the same \`modal deploy\` command for the docs app.

The source data for this warehouse is static,
so the daily executions don't really "update" anything, just re-build. But this example could be extended
to have sources which continually provide new data across time.
It will also generate the DBT docs daily to keep them fresh.

\`\`\`python
@app.function(
    schedule=modal.Period(days=1),
    secrets=[s3_secret],
    volumes={TARGET_PATH: dbt_target},
)
def daily_build() -> None:
    run.remote("build")
    run.remote("docs generate")


@app.local_entrypoint()
def main():
    create_source_data.remote()
    run.remote("run")
    daily_build.remote()

\`\`\`
`,meta:{title:`Build your own data warehouse with DuckDB, DBT, and Modal`,description:`This example contains a minimal but capable data warehouse. It’s comprised of the following:`}},{toc:v,rawContent:y,meta:b}=_,x=t(`the <code>dbt-duckdb</code> docs`,1),S=t(`<!> <p>This example contains a minimal but capable <!>.
It’s comprised of the following:</p> <ul><li><p><!> as the warehouse’s <!> database engine</p></li> <li><p><!> as the data storage provider</p></li> <li><p><!> as the data transformation tool</p></li></ul> <p>Meet your new serverless cloud data warehouse, powered by Modal!</p> <!> <p>The only thing in the source code that you must update is the S3 bucket name.
AWS S3 bucket names are globally unique, and the one in this source is used by us to host this example.</p> <p>Update the <code>BUCKET_NAME</code> variable below and also any references to the original value
within <code>sample_proj_duckdb_s3/models/</code>. The AWS IAM policy below also includes the bucket
name and that must be updated.</p> <!> <p>Most of the DBT code and configuration is taken directly from the classic <!> demo and modified to support
using <code>dbt-duckdb</code> with an S3 bucket.</p> <p>The DBT <code>profiles.yml</code> configuration is taken from <!>.</p> <p>We also define the environment our application will run in —
a container image, as in Docker.
See <!> for details.</p> <!> <p>We’ll also need to authenticate with AWS to store data in S3.</p> <!> <p>Create this Secret using the “AWS” template from the <!>.
Below we will use the provided credentials in a Modal Function to create an S3 bucket and
populate it with <code>.parquet</code> data, so be sure to provide credentials for a user
with permission to create S3 buckets and read & write data from them.</p> <p>The policy required for this example is the following.
Not that you <em>must</em> update the bucket name listed in the policy to your
own bucket name.</p> <!> <!> <p>In order to provide source data for DBT to ingest and transform,
we have the below <code>create_source_data</code> function which creates an AWS S3 bucket and
populates it with Parquet files based off the CSV data in the <code>seeds/</code> directory.</p> <p>You can kick it off by running this script on Modal:</p> <!> <p>This script also runs the full data warehouse setup, and the whole process takes a minute or two.
We’ll walk through the rest of the steps below. See the <code>app.local_entrypoint</code> below for details.</p> <p>Note that this is not the typical way that <code>seeds/</code> data is used, but it’s useful for this
demonstration. See <!> for more info.</p> <!> <!> <p>Modal makes it easy to run Python code in the cloud.
And DBT is a Python tool, so it’s easy to run DBT with Modal:
below, we import the <code>dbt</code> library’s <code>dbtRunner</code> to pass commands from our
Python code, running on Modal, the same way we’d pass commands on a command line.</p> <p>Note that this Modal Function has access to our AWS S3 Secret,
the local files associated with our DBT project and profiles,
and a remote Modal Volume that acts as a distributed file system.</p> <!> <p>You can run this Modal Function from the command line with</p> <p><code>modal run dbt_duckdb.py::run --command run</code></p> <p>A successful run will log something like the following:</p> <!> <p>Look for the <code>'materialized='external'</code> DBT config in the SQL templates
to see how <code>dbt-duckdb</code> is able to write back the transformed data to AWS S3!</p> <p>After running the <code>run</code> command and seeing it succeed, check what’s contained
under the bucket’s <code>out/</code> key prefix. You’ll see that DBT has run the transformations
defined in <code>sample_proj_duckdb_s3/models/</code> and produced output <code>.parquet</code> files.</p> <!> <p>DBT also automatically generates <!>.
You can serve these docs on Modal.
Just define a simple <!> app:</p> <!> <p>And deploy that app to Modal with</p> <!> <p>If you navigate to the output URL, you should see something like <!></p> <p>You can also check out our instance of the docs <!>.
The app will be served “serverlessly” — it will automatically scale up or down
during periods of increased or decreased usage, and you won’t be charged at all
when it has scaled to zero.</p> <!> <p>The following <code>daily_build</code> function <!> to keep the DuckDB data warehouse up-to-date. It is also deployed by the same <code>modal deploy</code> command for the docs app.</p> <p>The source data for this warehouse is static,
so the daily executions don’t really “update” anything, just re-build. But this example could be extended
to have sources which continually provide new data across time.
It will also generate the DBT docs daily to keep them fresh.</p> <!>`,1);function C(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=S(),m=s(o);d(m,{id:`build-your-own-data-warehouse-with-duckdb-dbt-and-modal`,children:(e,t)=>{l(),i(e,r(`Build your own data warehouse with DuckDB, DBT, and Modal`))},$$slots:{default:!0}});var _=c(m,2);h(c(e(_)),{href:`https://en.wikipedia.org/wiki/Data_warehouse`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`data warehouse`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2),y=e(v),b=e(y),C=e(b);h(C,{href:`https://duckdb.org`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`DuckDB`))},$$slots:{default:!0}}),h(c(C,2),{href:`https://en.wikipedia.org/wiki/Online_analytical_processing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OLAP`))},$$slots:{default:!0}}),l(),n(b),n(y);var w=c(y,2),T=e(w);h(e(T),{href:`https://aws.amazon.com/s3/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS S3`))},$$slots:{default:!0}}),l(),n(T),n(w);var E=c(w,2),D=e(E);h(e(D),{href:`https://docs.getdbt.com/docs/introduction`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`DBT`))},$$slots:{default:!0}}),l(),n(D),n(E),n(v);var O=c(v,4);u(O,{id:`configure-modal-s3-and-dbt`,children:(e,t)=>{l(),i(e,r(`Configure Modal, S3, and DBT`))},$$slots:{default:!0}});var k=c(O,6);p(k,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0ABUCKET_NAME%20%3D%20%22modal-example-dbt-duckdb-s3%22%0ALOCAL_DBT_PROJECT%20%3D%20(%20%20%23%20local%20path%0A%20%20%20%20Path(__file__).parent%20%2F%20%22sample_proj_duckdb_s3%22%0A)%0APROJ_PATH%20%3D%20%22%2Froot%2Fdbt%22%20%20%23%20remote%20paths%0APROFILES_PATH%20%3D%20%22%2Froot%2Fdbt_profile%22%0ATARGET_PATH%20%3D%20%22%2Froot%2Ftarget%22`,lang:`python`});var A=c(k,2);h(c(e(A)),{href:`https://github.com/dbt-labs/jaffle_shop`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Jaffle Shop`))},$$slots:{default:!0}}),l(3),n(A);var j=c(A,2);h(c(e(j),3),{href:`https://github.com/jwills/dbt-duckdb#configuring-your-profile`,rel:`nofollow`,children:(e,t)=>{l();var n=x();l(2),i(e,n)},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);h(c(e(M)),{href:`https://modal.com/docs/guide/custom-container`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this guide`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);p(N,{code:`dbt_image%20%3D%20(%20%20%23%20start%20from%20a%20slim%20Linux%20image%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.uv_pip_install(%20%20%23%20install%20python%20packages%0A%20%20%20%20%20%20%20%20%22boto3~%3D1.34%22%2C%20%20%23%20aws%20client%20sdk%0A%20%20%20%20%20%20%20%20%22dbt-duckdb~%3D1.8.1%22%2C%20%20%23%20dbt%20and%20duckdb%20and%20a%20connector%0A%20%20%20%20%20%20%20%20%22pandas~%3D2.2.2%22%2C%20%20%23%20dataframes%0A%20%20%20%20%20%20%20%20%22pyarrow~%3D16.1.0%22%2C%20%20%23%20columnar%20data%20lib%0A%20%20%20%20%20%20%20%20%22fastapi%5Bstandard%5D~%3D0.115.4%22%2C%20%20%23%20web%20app%0A%20%20%20%20)%0A%20%20%20%20.env(%20%20%23%20configure%20DBT%20environment%20variables%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22DBT_PROJECT_DIR%22%3A%20PROJ_PATH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22DBT_PROFILES_DIR%22%3A%20PROFILES_PATH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22DBT_TARGET_PATH%22%3A%20TARGET_PATH%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20)%0A%20%20%20%20%23%20Here%20we%20add%20all%20local%20code%20and%20configuration%20into%20the%20Modal%20Image%0A%20%20%20%20%23%20so%20that%20it%20will%20be%20available%20when%20we%20run%20DBT%20on%20Modal.%0A%20%20%20%20.add_local_dir(LOCAL_DBT_PROJECT%2C%20remote_path%3DPROJ_PATH)%0A%20%20%20%20.add_local_file(%0A%20%20%20%20%20%20%20%20LOCAL_DBT_PROJECT%20%2F%20%22profiles.yml%22%2C%0A%20%20%20%20%20%20%20%20remote_path%3Df%22%7BPROFILES_PATH%7D%2Fprofiles.yml%22%2C%0A%20%20%20%20)%0A)%0A%0Aapp%20%3D%20modal.App(name%3D%22example-dbt-duckdb%22%2C%20image%3Ddbt_image)%0A%0Adbt_target%20%3D%20modal.Volume.from_name(%22dbt-target-vol%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var P=c(N,4);p(P,{code:`s3_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22modal-examples-aws-user%22%2C%0A%20%20%20%20required_keys%3D%5B%22AWS_ACCESS_KEY_ID%22%2C%20%22AWS_SECRET_ACCESS_KEY%22%2C%20%22AWS_REGION%22%5D%2C%0A)%0A`,lang:`python`});var F=c(P,2);h(c(e(F)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets dashboard`))},$$slots:{default:!0}}),l(3),n(F);var I=c(F,4);p(I,{code:`%7B%0A%20%20%20%20%22Statement%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Action%22%3A%20%22s3%3A*%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Effect%22%3A%20%22Allow%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Resource%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22arn%3Aaws%3As3%3A%3A%3Amodal-example-dbt-duckdb-s3%2F*%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22arn%3Aaws%3As3%3A%3A%3Amodal-example-dbt-duckdb-s3%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Sid%22%3A%20%22duckdbs3access%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%5D%2C%0A%20%20%20%20%22Version%22%3A%20%222012-10-17%22%0A%7D`,lang:`json`});var L=c(I,2);u(L,{id:`upload-seed-data`,children:(e,t)=>{l(),i(e,r(`Upload seed data`))},$$slots:{default:!0}});var R=c(L,6);p(R,{code:`modal%20run%20dbt_duckdb.py`,lang:`bash`});var z=c(R,4);h(c(e(z),3),{href:`https://docs.getdbt.com/docs/build/seeds`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the DBT docs`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,2);p(B,{code:`%40app.function(%0A%20%20%20%20secrets%3D%5Bs3_secret%5D%2C%0A)%0Adef%20create_source_data()%3A%0A%20%20%20%20import%20boto3%0A%20%20%20%20import%20pandas%20as%20pd%0A%20%20%20%20from%20botocore.exceptions%20import%20ClientError%0A%0A%20%20%20%20s3_client%20%3D%20boto3.client(%22s3%22)%0A%20%20%20%20s3_client.create_bucket(Bucket%3DBUCKET_NAME)%0A%0A%20%20%20%20for%20seed_csv_path%20in%20Path(PROJ_PATH%2C%20%22seeds%22).glob(%22*.csv%22)%3A%0A%20%20%20%20%20%20%20%20print(f%22Found%20seed%20file%20%7Bseed_csv_path%7D%22)%0A%20%20%20%20%20%20%20%20name%20%3D%20seed_csv_path.stem%0A%20%20%20%20%20%20%20%20parquet_filename%20%3D%20f%22%7Bname%7D.parquet%22%0A%20%20%20%20%20%20%20%20object_key%20%3D%20f%22sources%2F%7Bparquet_filename%7D%22%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20s3_client.head_object(Bucket%3DBUCKET_NAME%2C%20Key%3Dobject_key)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22File%20'%7Bobject_key%7D'%20already%20exists%20in%20bucket%20'%7BBUCKET_NAME%7D'.%20Skipping.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20except%20ClientError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20df%20%3D%20pd.read_csv(seed_csv_path)%0A%20%20%20%20%20%20%20%20%20%20%20%20df.to_parquet(parquet_filename)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Uploading%20'%7Bobject_key%7D'%20to%20S3%20bucket%20'%7BBUCKET_NAME%7D'%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20s3_client.upload_file(parquet_filename%2C%20BUCKET_NAME%2C%20object_key)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22File%20'%7Bobject_key%7D'%20uploaded%20successfully.%22)%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`run-dbt-on-the-cloud-with-modal`,children:(e,t)=>{l(),i(e,r(`Run DBT on the cloud with Modal`))},$$slots:{default:!0}});var H=c(V,6);p(H,{code:`%40app.function(%0A%20%20%20%20secrets%3D%5Bs3_secret%5D%2C%0A%20%20%20%20volumes%3D%7BTARGET_PATH%3A%20dbt_target%7D%2C%0A)%0Adef%20run(command%3A%20str)%20-%3E%20None%3A%0A%20%20%20%20from%20dbt.cli.main%20import%20dbtRunner%0A%0A%20%20%20%20res%20%3D%20dbtRunner().invoke(command.split(%22%20%22))%0A%20%20%20%20if%20res.exception%3A%0A%20%20%20%20%20%20%20%20print(res.exception)%0A%0A`,lang:`python`});var U=c(H,8);p(U,{code:`03%3A41%3A04%20%20Running%20with%20dbt%3D1.5.0%0A03%3A41%3A05%20%20Found%205%20models%2C%208%20tests%2C%200%20snapshots%2C%200%20analyses%2C%20313%20macros%2C%200%20operations%2C%203%20seed%20files%2C%203%20sources%2C%200%20exposures%2C%200%20metrics%2C%200%20groups%0A03%3A41%3A05%0A03%3A41%3A06%20%20Concurrency%3A%201%20threads%20(target%3D'modal')%0A03%3A41%3A06%0A03%3A41%3A06%20%201%20of%205%20START%20sql%20table%20model%20main.stg_customers%20................................%20%5BRUN%5D%0A03%3A41%3A06%20%201%20of%205%20OK%20created%20sql%20table%20model%20main.stg_customers%20...........................%20%5BOK%20in%200.45s%5D%0A03%3A41%3A06%20%202%20of%205%20START%20sql%20table%20model%20main.stg_orders%20...................................%20%5BRUN%5D%0A03%3A41%3A06%20%202%20of%205%20OK%20created%20sql%20table%20model%20main.stg_orders%20..............................%20%5BOK%20in%200.34s%5D%0A03%3A41%3A06%20%203%20of%205%20START%20sql%20table%20model%20main.stg_payments%20.................................%20%5BRUN%5D%0A03%3A41%3A07%20%203%20of%205%20OK%20created%20sql%20table%20model%20main.stg_payments%20............................%20%5BOK%20in%200.36s%5D%0A03%3A41%3A07%20%204%20of%205%20START%20sql%20external%20model%20main.customers%20.................................%20%5BRUN%5D%0A03%3A41%3A07%20%204%20of%205%20OK%20created%20sql%20external%20model%20main.customers%20............................%20%5BOK%20in%200.72s%5D%0A03%3A41%3A07%20%205%20of%205%20START%20sql%20table%20model%20main.orders%20.......................................%20%5BRUN%5D%0A03%3A41%3A08%20%205%20of%205%20OK%20created%20sql%20table%20model%20main.orders%20..................................%20%5BOK%20in%200.22s%5D%0A03%3A41%3A08%0A03%3A41%3A08%20%20Finished%20running%204%20table%20models%2C%201%20external%20model%20in%200%20hours%200%20minutes%20and%203.15%20seconds%20(3.15s).%0A03%3A41%3A08%20%20Completed%20successfully%0A03%3A41%3A08%0A03%3A41%3A08%20%20Done.%20PASS%3D5%20WARN%3D0%20ERROR%3D0%20SKIP%3D0%20TOTAL%3D5`,lang:`text`});var W=c(U,6);u(W,{id:`serve-fresh-data-documentation-with-fastapi-and-modal`,children:(e,t)=>{l(),i(e,r(`Serve fresh data documentation with FastAPI and Modal`))},$$slots:{default:!0}});var G=c(W,2),K=c(e(G));h(K,{href:`https://docs.getdbt.com/docs/collaborate/explore-projects`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`rich, interactive data docs`))},$$slots:{default:!0}}),h(c(K,2),{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastAPI`))},$$slots:{default:!0}}),l(),n(G);var q=c(G,2);p(q,{code:`%40app.function(volumes%3D%7BTARGET_PATH%3A%20dbt_target%7D)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%20%20%23%20wrap%20a%20function%20that%20returns%20a%20FastAPI%20app%20in%20this%20decorator%20to%20host%20on%20Modal%0Adef%20serve_dbt_docs()%3A%0A%20%20%20%20import%20fastapi%0A%20%20%20%20from%20fastapi.staticfiles%20import%20StaticFiles%0A%0A%20%20%20%20web_app%20%3D%20fastapi.FastAPI()%0A%20%20%20%20web_app.mount(%0A%20%20%20%20%20%20%20%20%22%2F%22%2C%0A%20%20%20%20%20%20%20%20StaticFiles(%20%20%23%20dbt%20docs%20are%20automatically%20generated%20and%20sitting%20in%20the%20Volume%0A%20%20%20%20%20%20%20%20%20%20%20%20directory%3DTARGET_PATH%2C%20html%3DTrue%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20name%3D%22static%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var J=c(q,4);p(J,{code:`modal%20deploy%20dbt_duckdb.py%0A%23%20...%0A%23%20Created%20web%20function%20serve_dbt_docs%20%3D%3E%20%3Coutput-url%3E`,lang:`bash`});var Y=c(J,2);h(c(e(Y)),{href:`https://modal-labs-examples--example-dbt-duckdb-serve-dbt-docs.modal.run`,rel:`nofollow`,children:(e,t)=>{f(e,{get src(){return g},alt:`example dbt docs`})},$$slots:{default:!0}}),n(Y);var X=c(Y,2);h(c(e(X)),{href:`https://modal-labs-examples--example-dbt-duckdb-serve-dbt-docs.modal.run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(X);var Z=c(X,2);u(Z,{id:`schedule-daily-updates`,children:(e,t)=>{l(),i(e,r(`Schedule daily updates`))},$$slots:{default:!0}});var Q=c(Z,2);h(c(e(Q),3),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`runs on a schedule`))},$$slots:{default:!0}}),l(3),n(Q),p(c(Q,4),{code:`%40app.function(%0A%20%20%20%20schedule%3Dmodal.Period(days%3D1)%2C%0A%20%20%20%20secrets%3D%5Bs3_secret%5D%2C%0A%20%20%20%20volumes%3D%7BTARGET_PATH%3A%20dbt_target%7D%2C%0A)%0Adef%20daily_build()%20-%3E%20None%3A%0A%20%20%20%20run.remote(%22build%22)%0A%20%20%20%20run.remote(%22docs%20generate%22)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20create_source_data.remote()%0A%20%20%20%20run.remote(%22run%22)%0A%20%20%20%20daily_build.remote()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{C as default,_ as metadata};
//# sourceMappingURL=bjAUgXLk.js.map
