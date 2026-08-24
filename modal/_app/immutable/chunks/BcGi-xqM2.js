(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eb28d6e5-a87e-409e-a54e-be3faf48b88f`,e._sentryDebugIdIdentifier=`sentry-dbid-eb28d6e5-a87e-409e-a54e-be3faf48b88f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as c}from"./JPsrybyr.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./DeWGVqas2.js";import{t as d}from"./CdZDxCfO2.js";var f={title:`Building a cost-effective analytics stack with Modal, dlt, and dbt`,description:`A step-by-step guide to building a scalable analytics stack using Modal, dlt, and dbt for efficient data loading, transformation, and deployment.`,authors:[{name:`Kenny Ning`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`,jobTitle:`Growth Engineer`,twitterHandle:`kenny_ning`},{name:`Kasper Ramström`,avatarUrl:`https://modal-cdn.com/kasper-ramstrom.jpg`,jobTitle:`Forward Deployed Engineer`}],date:`2024-09-10T12:00:00.000Z`,length:`13 minute read`,category:`Engineering`,published:!0,layout:`blog`,toc:[{depth:2,value:`Project structure`,id:`project-structure`},{depth:2,value:`Data loading with dlt`,id:`data-loading-with-dlt`,children:[{depth:3,value:`How to run dlt on Modal`,id:`how-to-run-dlt-on-modal`},{depth:3,value:`Advanced configuration`,id:`advanced-configuration`}]},{depth:2,value:`Transform with dbt`,id:`transform-with-dbt`},{depth:2,value:`CI/CD`,id:`cicd`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`We've previously talked about why you should [move your ETL stack to Modal](https://modal.com/blog/etl), highlighting:

- Cost savings of thousands of dollars compared to the largest ETL vendors
- Flexibility in your ETL logic
- No management of infrastructure

This post expands upon that simple example and shows you how to run your entire analytics stack on Modal:

- Data loading with [dlt](https://github.com/dlt-hub/dlt)
- Transformation with [dbt](https://github.com/dbt-labs/dbt-core)
- CI/CD with [Github Actions](https://docs.github.com/en/actions)

We've been using this system ourselves and are enjoying:

- Moving millions of rows of data a day for **less than $1** a day
- Clean code built on open source frameworks with strong community support

![etl-arch-diagram](https://modal-cdn.com/cdnbot/analytics-stackfyc1_4fl_9f76d573.webp)

## Project structure

Here's a snapshot of how our project is laid out:

\`\`\`bash
.github/workflows/
├── ci-cd.yml # manages auto deploy
dbt
├── models/ # dbt transformation code
├── build_dbt.py # invoke dbt build via python sdk, this is what gets run by Github Actions in CI/CD
├── dbt_project.yml
├── modal_profiles.yml # specifies snowflake credentials, sensitive info uses env variables which will be passed via Modal Secrets
└── packages.yml
dlt
├── clickhouse_pipeline.py
├── postgres_pipeline.py
└── sql_database/ # dlt helpers
.pre-commit-config.yml # ruff and sqlfmt
cicd.py # script to find and deploy jobs on Modal
requirements.txt
\`\`\`

## Data loading with dlt

At Modal, one of our most important data loading use cases is **copying our production read replica** Postgres instance to Snowflake, our data warehouse. Some of these tables write millions of rows a day, leaving vendor solutions like Fivetran out of the question.

The first version of this system used each database's client SDK and passed the data as a list of tuples:

\`\`\`python
import psycopg2

conn = psycopg2.connect(
  host=os.environ["PGHOST"],
  database=os.environ["PGDATABASE"],
  user=os.environ["PGUSER"],
  password=os.environ["PGPASSWORD"],
  port=os.environ["PGPORT"],
)
cur = conn.cursor()

cur.execute(
  """
  select * from task
  """
)
result = cur.fetchall()
cur.close()
conn.close()

return [tuple(row) for row in result]
\`\`\`

However, we quickly realized we were spending a lot of time writing boilerplate ETL tasks like:

- **Automatic schema inference**: Snowflake needs to [know the schema of the data](https://stackoverflow.com/questions/60009977/copy-into-snowflake-table-without-defining-the-table-schema) before it can create a table; to solve this we were manually defining columns and their types for every table we wanted to sync, which we knew wouldn't scale well
- **Snowflake DDL:** Creating a table, uploading raw data as a stage, running copy commands; there's a lot of boilerplate Snowflake DDL required to simply copy data into a Snowflake table
- **Incremental loading**: We were hand-rolling our own incremental logic to only copy data from the last X days. This was error prone and often resulted in duplicates

We had been following the momentum around [dlt](https://github.com/dlt-hub/dlt), an open source data loading Python library; we even noticed that some of our own Modal users were [using Modal to run dlt](https://dlthub.com/blog/replacing-saas-elt). We gave it a spin and were impressed with how straightforward it was to deploy on Modal and how much cleaner it made our data loading pipeline code.

### How to run dlt on Modal

Here's our dlt setup copying data from our Postgres read replica into Snowflake:

1. Run the dlt [SQL database setup](https://dlthub.com/docs/dlt-ecosystem/verified-sources/sql_database) to initialize their [sql_database_pipeline.py](https://github.com/dlt-hub/verified-sources/blob/master/sources/sql_database_pipeline.py) template:

\`\`\`python
dlt init sql_database snowflake
\`\`\`

2. Open the file and define the Modal Image you want to run dlt in:

\`\`\`python
import dlt
import pendulum

from sql_database import sql_database, ConnectionStringCredentials, sql_table

import modal
import os

image = (
    modal.Image.debian_slim()
    .apt_install(["libpq-dev"]) # system requirement for postgres driver
    .pip_install(
        "sqlalchemy>=1.4", # how dlt establishes connections
        "dlt[snowflake]>=0.4.11",
        "psycopg2-binary", # postgres driver
        "dlt[parquet]",
        "psutil==6.0.0", # for dlt logging
        "connectorx", # creates arrow tables from database for fast data extraction
    )
)

app = modal.App("dlt-postgres-pipeline", image=image)
\`\`\`

3. Wrap the provided \`load_table_from_database\` with the Modal Function decorator, [Modal Secrets](https://modal.com/docs/guide/secrets) containing your database credentials, and a [daily cron schedule](https://modal.com/docs/guide/cron)

\`\`\`python
@app.function(
    secrets=[
        modal.Secret.from_name("snowflake-secret"),
        modal.Secret.from_name("postgres-read-replica-prod"),
    ],
    # run this pipeline daily
    schedule=modal.Cron("24 6 * * *"),
    timeout=3000,
)
def load_table_from_database(
    table: str,
    incremental_col: str,
    dev: bool = False,
) -> None:
\`\`\`

4. Write your dlt pipeline:

\`\`\`python
    # Modal Secrets are loaded as environment variables which are used here to create the SQLALchemy connection string
    pg_url = f'postgresql://{os.environ["PGUSER"]}:{os.environ["PGPASSWORD"]}@localhost:{os.environ["PGPORT"]}/{os.environ["PGDATABASE"]}'
    snowflake_url = f'snowflake://{os.environ["SNOWFLAKE_USER"]}:{os.environ["SNOWFLAKE_PASSWORD"]}@{os.environ["SNOWFLAKE_ACCOUNT"]}/{os.environ["SNOWFLAKE_DATABASE"]}'

    # Create a pipeline
    schema = "POSTGRES_DLT_DEV" if dev else "POSTGRES_DLT"
    pipeline = dlt.pipeline(
        pipeline_name="task",
        destination=dlt.destinations.snowflake(snowflake_url),
        dataset_name=schema,
        progress="log",
    )

    credentials = ConnectionStringCredentials(pg_url)

    # defines the postgres table to sync (in this case, the "task" table)
    source_1 = sql_database(credentials, backend="connectorx").with_resources("task")

    # defines which column to reference for incremental loading (i.e. only load newer rows)
    source_1.task.apply_hints(
        incremental=dlt.sources.incremental(
            "enqueued_at",
            initial_value=pendulum.datetime(2024, 7, 24, 0, 0, 0, tz="UTC"),
        )
    )

    # if there are duplicates, merge the latest values
    info = pipeline.run(source_1, write_disposition="merge")
    print(info)
\`\`\`

The last run of this job wrote 1,375,896 rows (~20MB) in 47 seconds.

![modal-dlt-runtime](https://modal-cdn.com/modal-dlt-runtime.png)

Syncing over 1 million rows a day (30 million rows a month) on Fivetran would cost you [$4,738 a month](https://www.fivetran.com/pricing). Meanwhile, here's how the math works out for Modal:

- [$0.000038 / CPU core / sec](https://modal.com/pricing) • 0.125 cores • 47 seconds = $0.0002 in compute cost
- $0.00000667 / GiB / sec • .02 GiB • 47 seconds = $0.000006 in memory cost

This comes out to **$0.006 a month**; it's effectively free to move 30 million rows a month if you use dlt with Modal.

### Advanced configuration

**Modal Proxy**

If your database is in a private VPN, you can use [Modal Proxy](https://modal.com/docs/reference/modal.Proxy) as a bastion server (only available to Enterprise customers). We use Modal Proxy to connect to our production read replica by attaching it to the Function definition and changing the hostname to \`localhost\`:

\`\`\`python
@app.function(
    secrets=[
        modal.Secret.from_name("snowflake-secret"),
        modal.Secret.from_name("postgres-read-replica-prod"),
    ],
    schedule=modal.Cron("24 6 * * *"),
    proxy=modal.Proxy.from_name("prod-postgres-proxy", environment_name="main"),
    timeout=3000,
)
def task_pipeline(dev: bool = False) -> None:
    pg_url = f'postgresql://{os.environ["PGUSER"]}:{os.environ["PGPASSWORD"]}@localhost:{os.environ["PGPORT"]}/{os.environ["PGDATABASE"]}'
\`\`\`

**Capturing deletes**

One limitation of our simple approach above is that it does not capture updates or deletions of data. This isn't a hard requirement yet for our use cases, but it appears that dlt does have a [Postgres CDC replication](https://dlthub.com/docs/dlt-ecosystem/verified-sources/pg_replication) feature that we are considering.

**Scaling out**

The example above syncs one table from our Postgres data source. In practice, we are syncing multiple tables and mapping each table copy job to a single container using [Modal.starmap](https://modal.com/docs/reference/modal.Function#starmap):

\`\`\`python
@app.function(timeout=3000, schedule=modal.Cron("29 11 * * *"))
def main(dev: bool = False):
    tables = [
        ("task", "enqueued_at", dev),
        ("worker", "launched_at", dev),
        ...
    ]
    list(load_table_from_database.starmap(tables))
\`\`\`

This allows us to easily add more tables to our ETL batch processing system without increasing the overall runtime of our ETL system.

## Transform with dbt

After our data has been loaded into Snowflake, we still need to transform it to make it analysis ready. [dbt](https://github.com/dbt-labs/dbt-core) is the de facto standard for this and also works great with Modal.

Data gets transformed in this order:

- \`base\`: one base model per table for basic sanitizing e.g. conforming namespaces, removing deleted rows, removing banned users
- \`activities\`: [activity schema](https://github.com/ActivitySchema/ActivitySchema/blob/main/2.0.md)-inspired data modeling format where base models are combined into customer events unique on a Modal workspace (i.e. “account” or “business”) and timestamp

Each model is materialized as a **view**, which is effectively a “saved query”. This means that querying a view will always return the most recent data, and we don't have to rebuild the data more than once.

Let's show how the example \`task\` table synced in the above section gets transformed with dbt.

1. Create a base model ( \`base_prod__task\` ) that standardizes column names:

\`\`\`sql
select
    -- ids
    id as task_id,
    account_id as workspace_id,

    -- numerics
    gpu_count,

    -- timestamps
    enqueued_at,
    started_at,
    finished_at

from {{ source('postgres_dlt', 'task') }}
\`\`\`

2. Create two activities: one for \`workspace_stream_started_task\` and one for \`workspace_stream_finished_task\`

\`\`\`sql
# workspace_stream_started_task.sql
select
    workspace_id,
    started_at as ts,
    gpu_count

from {{ ref('base_prod__task') }}
\`\`\`

\`\`\`sql
# workspace_stream_finished_task.sql
select
    workspace_id,
    finished_at as ts,
    gpu_count

from {{ ref('base_prod__task') }}
\`\`\`

This transformation makes it easy to combine activities into a long stream of events which can be a very convenient data structure to query. For instance, we can calculate the number of concurrent GPU tasks a workspace is running at any given time in a pretty straightforward way:

\`\`\`sql
with activity_stream as (
    select *

    from workspace_stream_started_task

    union all

    select

    from workspace_stream_finished_task
)

select
    *,
    sum(
        case when activity = 'started_task'
        then gpu_count
        else -gpu_count
        end
    ) over (partition by workspace_id order by ts) as concurrent_tasks
from activity_stream

\`\`\`

We use this query to monitor workspaces that are getting close to their [GPU concurrency limit](https://modal.com/pricing) (10 for Starter, 30 for Team) and send them an email to upgrade if they are close to their limit.

**Data modeling strategy**

We are fans of of the events-style architecture of [Activity Schema](https://github.com/ActivitySchema/ActivitySchema/blob/main/2.0.md), but ultimately found its strict schema guidelines too hard to query to buy into it 100%:

- Querying data from \`feature_json\` object is annoying and AI autocomplete won't be able to help since it generally doesn't know the contents of your data
- Modal's primarily engineering workforce wants to query data in as raw a form as possible and doesn't like unnecessary abstractions
- There aren't many use cases for a single \`workspace_stream\` table of all events and it can be a burden to materialize because it's so large

Instead, we use an Activity Schema "lite" version as a guideline for data modeling:

- Require all activity columns to have an \`activity_id\` primary key column, a \`workspace_id\` column and a \`ts\` column, but can add arbitrary number of additional metadata columns
- Build as much BI on \`base\` tables as possible so the lineage from raw data to metric is very clear; only build a dbt activity model if it will be used by more than 3 or more reports
- Break out each activity table into its own view (i.e. no single huge activity table)

## CI/CD

We use Github workflows for our CI/CD and have set up the following workflow to deploy and run our ETL applications on PRs and whenever we merge to main:

\`\`\`yaml
name: CI/CD

on:
  push:
    branches:
      - main
  pull_request:

# Cancel previous runs of the same PR but do not cancel previous runs on main
concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: \${{ github.ref != 'refs/heads/main' }}

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    env:
      MODAL_ENVIRONMENT: modal-etl
      MODAL_TOKEN_ID: \${{ secrets.MODAL_TOKEN_ID }}
      MODAL_TOKEN_SECRET: \${{ secrets.MODAL_TOKEN_SECRET }}

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v6

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.10"

      - name: Install Packages
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: CD job
        if: github.ref == 'refs/heads/main'
        run: |
          sha=\${{ github.sha }}
          sha_short=$(git rev-parse --short $sha)
          python cicd.py --cd --tag $sha_short

      - name: CI job
        if: github.ref != 'refs/heads/main'
        run: |
          branch=\${{ github.head_ref }}
          python cicd.py --ci --tag $branch
\`\`\`

It's a version of the workflow guide on our [docs page](/docs/guide/continuous-deployment#github-actions) with some additions.
Instead of running \`modal deploy\` directly from our workflow we invoke a python script \`cicd.py\` with either the short commit sha (for deployments) or the branch name (for CI) which discovers all the modal apps in our repository and runs or deploys them as necessary based on the flags passed.
This is great if you (like us) have multiple directories and subdirectories within your project and each of them contain one or more modal apps. Another alternative is to use \`modal deploy pkg\` which is great if you have [apps spanning multiple files](/docs/guide/project-structure#apps-spanning-multiple-files).

The script below is the \`cicd.py\` code that gets called by Github Actions.

\`\`\`python
import os
import re
import shutil
import subprocess
import sys
import pathlib
import argparse
from typing import Dict

def get_modules():
    modules_to_deploy = []
    modules_to_run_on_cd = []
    modules_to_run_on_ci = []
    current_dir = pathlib.Path.cwd()

    for subdir, dirs, files in os.walk(current_dir):
        subdir_path = pathlib.Path(subdir)
        relative_subdir = subdir_path.relative_to(current_dir)

        if re.match(r"^(\\.|__)", str(relative_subdir)):
            continue

        for file in files:
            filepath = subdir_path / file

            if filepath.suffix == ".py":
                with open(filepath, "r") as f:
                    content = f.read()

                    if "# deploy: true" in content:
                        modules_to_deploy.append({"fp": filepath})
                    if "# cd-run: true" in content:
                        modules_to_run_on_cd.append({"fp": filepath})
                    if "# ci-run: true" in content:
                        modules_to_run_on_ci.append({"fp": filepath})

    return {
        "cd": {
            "deploy": modules_to_deploy,
            "run": modules_to_run_on_cd,
        },
        "ci": {
            "run": modules_to_run_on_ci,
        },
    }


def run_command(cmd, extra_env: Dict[str, str] = {}):
    print(f"  Running command: {cmd}")
    env = {
        "MODAL_ENVIRONMENT": os.environ.get("MODAL_ENVIRONMENT"),
        "MODAL_TOKEN_ID": os.environ.get("MODAL_TOKEN_ID"),
        "MODAL_TOKEN_SECRET": os.environ.get("MODAL_TOKEN_SECRET"),
        **extra_env,
    }
    print(f"  Environment: {env}")
    subprocess.run(
        cmd,
        env={k: v for k, v in env.items() if v},
        check=True,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ci", action="store_true")
    parser.add_argument("--cd", action="store_true")
    parser.add_argument("--tag")
    args = parser.parse_args()


    if args.ci and args.cd:
        raise ValueError("Please provide either --ci or --cd flag, not both")

    modules = get_modules()
    bin_path = shutil.which("modal")

    extra_env = {"tag": args.tag} if args.tag else {}

    if args.cd:
        print(f"Deploying {len(modules['cd']['deploy'])} apps")

        tag = ["--tag", args.tag] if args.tag else []

        for module in modules['cd']['deploy']:
            print(f"\\n- Deploying {str(module['fp'])}")
            run_command([bin_path, "deploy", module["fp"]] + tag, extra_env)

        print(f"Running {len(modules['cd']['run'])} apps")
        for module in modules['cd']['run']:
            print(f"\\n- Running {str(module['fp'])}")
            run_command([bin_path, "run", module["fp"]], extra_env)
    elif args.ci:
        print(f"Running {len(modules['ci']['run'])} apps")
        for module in modules['ci']['run']:
            print(f"\\n- Running {str(module['fp'])}")
            run_command([bin_path, "run", module["fp"]], extra_env)
    else:
        raise ValueError("Please provide either --ci or --cd flag")

\`\`\`

This script will find all python files with the following comments and run the appropriate command:

- \`# deploy: true\` - deploy the app with \`modal deploy <filepath> ...\` and tag the deployment with the short commit sha
- \`# cd-run: true\` - run the app on a CD workflow with \`modal run <filepath> ...\`
- \`# ci-run: true\` - run the app on a CI workflow with \`modal run <filepath> ...\`

The \`ci-run\` flag is useful for running the applications in the CI steps to make sure they don't break before you merge. This is especially handy for things like \`dbt\` where we both want to deploy the new modal function which runs \`dbt\` but also run \`dbt\` for all the changed models.

With our [deployment rollback feature](/docs/guide/managing-deployments#updating-deployments) (available on Team and Enterprise plans) you could roll back your deployments automatically in the workflow in case they fail with \`modal app rollback <app-name>\`.

We are using dbt's [custom schema name macro](https://docs.getdbt.com/docs/build/custom-schemas) to generate the schema name based on the git branch or tag name so we can have multiple environments on Modal with different schema names.
This allows us to write our dbt models to custom CI schemas per branch and run dbt CI tests without worrying about conflicting with other branches or production.

\`\`\`sql
{% macro generate_schema_name(custom_schema_name, node) -%}

    {%- set default_schema = target.schema -%}
    {%- set tag = var('tag', 'local').replace('-', '_').replace('/', '_').replace('.', '_') -%}

    {%- if target.name == 'ci' -%}

        {%- if custom_schema_name is none -%}

            ci_{{ tag }}

        {%- else -%}

            ci_{{ tag }}_{{ custom_schema_name | trim }}

        {%- endif -%}

    {%- elif custom_schema_name is none -%}

        {{ default_schema }}

    {%- else -%}

        {{ default_schema }}_{{ custom_schema_name | trim }}

    {%- endif -%}

{%- endmacro %}

\`\`\`

## Conclusion

dlt and dbt abstracts away the boilerplate code data engineers would previously have had to write for ETL. This includes things like managing and updating database state, automatic schema inference, and incremental loading.

Modal abstracts away the process of cloud deployment and running things in production. Combined, dlt X dbt X Modal multiplies the productivity of data engineers, saves you thousands of dollars of cost per month, and keeps your code base clean as you scale your data team.
`,meta:{description:`A step-by-step guide to building a scalable analytics stack using Modal, dlt, and dbt for efficient data loading, transformation, and deployment.`}},{title:p,description:m,authors:h,date:g,length:_,category:v,published:y,layout:b,toc:x,rawContent:S,meta:C}=f,ne=t(`<p>We’ve previously talked about why you should <!>, highlighting:</p> <ul><li>Cost savings of thousands of dollars compared to the largest ETL vendors</li> <li>Flexibility in your ETL logic</li> <li>No management of infrastructure</li></ul> <p>This post expands upon that simple example and shows you how to run your entire analytics stack on Modal:</p> <ul><li>Data loading with <!></li> <li>Transformation with <!></li> <li>CI/CD with <!></li></ul> <p>We’ve been using this system ourselves and are enjoying:</p> <ul><li>Moving millions of rows of data a day for <strong>less than $1</strong> a day</li> <li>Clean code built on open source frameworks with strong community support</li></ul> <p><!></p> <h2 id="project-structure">Project structure</h2> <p>Here’s a snapshot of how our project is laid out:</p> <!> <h2 id="data-loading-with-dlt">Data loading with dlt</h2> <p>At Modal, one of our most important data loading use cases is <strong>copying our production read replica</strong> Postgres instance to Snowflake, our data warehouse. Some of these tables write millions of rows a day, leaving vendor solutions like Fivetran out of the question.</p> <p>The first version of this system used each database’s client SDK and passed the data as a list of tuples:</p> <!> <p>However, we quickly realized we were spending a lot of time writing boilerplate ETL tasks like:</p> <ul><li><strong>Automatic schema inference</strong>: Snowflake needs to <!> before it can create a table; to solve this we were manually defining columns and their types for every table we wanted to sync, which we knew wouldn’t scale well</li> <li><strong>Snowflake DDL:</strong> Creating a table, uploading raw data as a stage, running copy commands; there’s a lot of boilerplate Snowflake DDL required to simply copy data into a Snowflake table</li> <li><strong>Incremental loading</strong>: We were hand-rolling our own incremental logic to only copy data from the last X days. This was error prone and often resulted in duplicates</li></ul> <p>We had been following the momentum around <!>, an open source data loading Python library; we even noticed that some of our own Modal users were <!>. We gave it a spin and were impressed with how straightforward it was to deploy on Modal and how much cleaner it made our data loading pipeline code.</p> <h3 id="how-to-run-dlt-on-modal">How to run dlt on Modal</h3> <p>Here’s our dlt setup copying data from our Postgres read replica into Snowflake:</p> <ol><li>Run the dlt <!> to initialize their <!> template:</li></ol> <!> <ol start="2"><li>Open the file and define the Modal Image you want to run dlt in:</li></ol> <!> <ol start="3"><li>Wrap the provided <code>load_table_from_database</code> with the Modal Function decorator, <!> containing your database credentials, and a <!></li></ol> <!> <ol start="4"><li>Write your dlt pipeline:</li></ol> <!> <p>The last run of this job wrote 1,375,896 rows (~20MB) in 47 seconds.</p> <p><!></p> <p>Syncing over 1 million rows a day (30 million rows a month) on Fivetran would cost you <!>. Meanwhile, here’s how the math works out for Modal:</p> <ul><li><!> • 0.125 cores • 47 seconds = $0.0002 in compute cost</li> <li>$0.00000667 / GiB / sec • .02 GiB • 47 seconds = $0.000006 in memory cost</li></ul> <p>This comes out to <strong>$0.006 a month</strong>; it’s effectively free to move 30 million rows a month if you use dlt with Modal.</p> <h3 id="advanced-configuration">Advanced configuration</h3> <p><strong>Modal Proxy</strong></p> <p>If your database is in a private VPN, you can use <!> as a bastion server (only available to Enterprise customers). We use Modal Proxy to connect to our production read replica by attaching it to the Function definition and changing the hostname to <code>localhost</code>:</p> <!> <p><strong>Capturing deletes</strong></p> <p>One limitation of our simple approach above is that it does not capture updates or deletions of data. This isn’t a hard requirement yet for our use cases, but it appears that dlt does have a <!> feature that we are considering.</p> <p><strong>Scaling out</strong></p> <p>The example above syncs one table from our Postgres data source. In practice, we are syncing multiple tables and mapping each table copy job to a single container using <!>:</p> <!> <p>This allows us to easily add more tables to our ETL batch processing system without increasing the overall runtime of our ETL system.</p> <h2 id="transform-with-dbt">Transform with dbt</h2> <p>After our data has been loaded into Snowflake, we still need to transform it to make it analysis ready. <!> is the de facto standard for this and also works great with Modal.</p> <p>Data gets transformed in this order:</p> <ul><li><code>base</code>: one base model per table for basic sanitizing e.g. conforming namespaces, removing deleted rows, removing banned users</li> <li><code>activities</code>: <!>-inspired data modeling format where base models are combined into customer events unique on a Modal workspace (i.e. “account” or “business”) and timestamp</li></ul> <p>Each model is materialized as a <strong>view</strong>, which is effectively a “saved query”. This means that querying a view will always return the most recent data, and we don’t have to rebuild the data more than once.</p> <p>Let’s show how the example <code>task</code> table synced in the above section gets transformed with dbt.</p> <ol><li>Create a base model ( <code>base_prod__task</code> ) that standardizes column names:</li></ol> <!> <ol start="2"><li>Create two activities: one for <code>workspace_stream_started_task</code> and one for <code>workspace_stream_finished_task</code></li></ol> <!> <!> <p>This transformation makes it easy to combine activities into a long stream of events which can be a very convenient data structure to query. For instance, we can calculate the number of concurrent GPU tasks a workspace is running at any given time in a pretty straightforward way:</p> <!> <p>We use this query to monitor workspaces that are getting close to their <!> (10 for Starter, 30 for Team) and send them an email to upgrade if they are close to their limit.</p> <p><strong>Data modeling strategy</strong></p> <p>We are fans of of the events-style architecture of <!>, but ultimately found its strict schema guidelines too hard to query to buy into it 100%:</p> <ul><li>Querying data from <code>feature_json</code> object is annoying and AI autocomplete won’t be able to help since it generally doesn’t know the contents of your data</li> <li>Modal’s primarily engineering workforce wants to query data in as raw a form as possible and doesn’t like unnecessary abstractions</li> <li>There aren’t many use cases for a single <code>workspace_stream</code> table of all events and it can be a burden to materialize because it’s so large</li></ul> <p>Instead, we use an Activity Schema “lite” version as a guideline for data modeling:</p> <ul><li>Require all activity columns to have an <code>activity_id</code> primary key column, a <code>workspace_id</code> column and a <code>ts</code> column, but can add arbitrary number of additional metadata columns</li> <li>Build as much BI on <code>base</code> tables as possible so the lineage from raw data to metric is very clear; only build a dbt activity model if it will be used by more than 3 or more reports</li> <li>Break out each activity table into its own view (i.e. no single huge activity table)</li></ul> <h2 id="cicd">CI/CD</h2> <p>We use Github workflows for our CI/CD and have set up the following workflow to deploy and run our ETL applications on PRs and whenever we merge to main:</p> <!> <p>It’s a version of the workflow guide on our <!> with some additions.
Instead of running <code>modal deploy</code> directly from our workflow we invoke a python script <code>cicd.py</code> with either the short commit sha (for deployments) or the branch name (for CI) which discovers all the modal apps in our repository and runs or deploys them as necessary based on the flags passed.
This is great if you (like us) have multiple directories and subdirectories within your project and each of them contain one or more modal apps. Another alternative is to use <code>modal deploy pkg</code> which is great if you have <!>.</p> <p>The script below is the <code>cicd.py</code> code that gets called by Github Actions.</p> <!> <p>This script will find all python files with the following comments and run the appropriate command:</p> <ul><li><code># deploy: true</code> - deploy the app with <code>modal deploy &lt;filepath&gt; ...</code> and tag the deployment with the short commit sha</li> <li><code># cd-run: true</code> - run the app on a CD workflow with <code>modal run &lt;filepath&gt; ...</code></li> <li><code># ci-run: true</code> - run the app on a CI workflow with <code>modal run &lt;filepath&gt; ...</code></li></ul> <p>The <code>ci-run</code> flag is useful for running the applications in the CI steps to make sure they don’t break before you merge. This is especially handy for things like <code>dbt</code> where we both want to deploy the new modal function which runs <code>dbt</code> but also run <code>dbt</code> for all the changed models.</p> <p>With our <!> (available on Team and Enterprise plans) you could roll back your deployments automatically in the workflow in case they fail with <code>modal app rollback &lt;app-name&gt;</code>.</p> <p>We are using dbt’s <!> to generate the schema name based on the git branch or tag name so we can have multiple environments on Modal with different schema names.
This allows us to write our dbt models to custom CI schemas per branch and run dbt CI tests without worrying about conflicting with other branches or production.</p> <!> <h2 id="conclusion">Conclusion</h2> <p>dlt and dbt abstracts away the boilerplate code data engineers would previously have had to write for ETL. This includes things like managing and updating database state, automatic schema inference, and incremental loading.</p> <p>Modal abstracts away the process of cloud deployment and running things in production. Combined, dlt X dbt X Modal multiplies the productivity of data engineers, saves you thousands of dollars of cost per month, and keeps your code base clean as you scale your data team.</p>`,1);function w(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ne(),d=te(a);u(o(e(d)),{href:`https://modal.com/blog/etl`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`move your ETL stack to Modal`))},$$slots:{default:!0}}),s(),n(d);var f=o(d,6),p=e(f);u(o(e(p)),{href:`https://github.com/dlt-hub/dlt`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`dlt`))},$$slots:{default:!0}}),n(p);var m=o(p,2);u(o(e(m)),{href:`https://github.com/dbt-labs/dbt-core`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`dbt`))},$$slots:{default:!0}}),n(m);var h=o(m,2);u(o(e(h)),{href:`https://docs.github.com/en/actions`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Github Actions`))},$$slots:{default:!0}}),n(h),n(f);var g=o(f,6);c(e(g),{src:`https://modal-cdn.com/cdnbot/analytics-stackfyc1_4fl_9f76d573.webp`,alt:`etl-arch-diagram`}),n(g);var _=o(g,6);l(_,{code:`.github%2Fworkflows%2F%0A%E2%94%9C%E2%94%80%E2%94%80%20ci-cd.yml%20%23%20manages%20auto%20deploy%0Adbt%0A%E2%94%9C%E2%94%80%E2%94%80%20models%2F%20%23%20dbt%20transformation%20code%0A%E2%94%9C%E2%94%80%E2%94%80%20build_dbt.py%20%23%20invoke%20dbt%20build%20via%20python%20sdk%2C%20this%20is%20what%20gets%20run%20by%20Github%20Actions%20in%20CI%2FCD%0A%E2%94%9C%E2%94%80%E2%94%80%20dbt_project.yml%0A%E2%94%9C%E2%94%80%E2%94%80%20modal_profiles.yml%20%23%20specifies%20snowflake%20credentials%2C%20sensitive%20info%20uses%20env%20variables%20which%20will%20be%20passed%20via%20Modal%20Secrets%0A%E2%94%94%E2%94%80%E2%94%80%20packages.yml%0Adlt%0A%E2%94%9C%E2%94%80%E2%94%80%20clickhouse_pipeline.py%0A%E2%94%9C%E2%94%80%E2%94%80%20postgres_pipeline.py%0A%E2%94%94%E2%94%80%E2%94%80%20sql_database%2F%20%23%20dlt%20helpers%0A.pre-commit-config.yml%20%23%20ruff%20and%20sqlfmt%0Acicd.py%20%23%20script%20to%20find%20and%20deploy%20jobs%20on%20Modal%0Arequirements.txt`,lang:`bash`});var v=o(_,8);l(v,{code:`import%20psycopg2%0A%0Aconn%20%3D%20psycopg2.connect(%0A%20%20host%3Dos.environ%5B%22PGHOST%22%5D%2C%0A%20%20database%3Dos.environ%5B%22PGDATABASE%22%5D%2C%0A%20%20user%3Dos.environ%5B%22PGUSER%22%5D%2C%0A%20%20password%3Dos.environ%5B%22PGPASSWORD%22%5D%2C%0A%20%20port%3Dos.environ%5B%22PGPORT%22%5D%2C%0A)%0Acur%20%3D%20conn.cursor()%0A%0Acur.execute(%0A%20%20%22%22%22%0A%20%20select%20*%20from%20task%0A%20%20%22%22%22%0A)%0Aresult%20%3D%20cur.fetchall()%0Acur.close()%0Aconn.close()%0A%0Areturn%20%5Btuple(row)%20for%20row%20in%20result%5D`,lang:`python`});var y=o(v,4),b=e(y);u(o(e(b),2),{href:`https://stackoverflow.com/questions/60009977/copy-into-snowflake-table-without-defining-the-table-schema`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`know the schema of the data`))},$$slots:{default:!0}}),s(),n(b),s(4),n(y);var x=o(y,2),S=o(e(x));u(S,{href:`https://github.com/dlt-hub/dlt`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`dlt`))},$$slots:{default:!0}}),u(o(S,2),{href:`https://dlthub.com/blog/replacing-saas-elt`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`using Modal to run dlt`))},$$slots:{default:!0}}),s(),n(x);var C=o(x,6),w=e(C),T=o(e(w));u(T,{href:`https://dlthub.com/docs/dlt-ecosystem/verified-sources/sql_database`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`SQL database setup`))},$$slots:{default:!0}}),u(o(T,2),{href:`https://github.com/dlt-hub/verified-sources/blob/master/sources/sql_database_pipeline.py`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`sql_database_pipeline.py`))},$$slots:{default:!0}}),s(),n(w),n(C);var E=o(C,2);l(E,{code:`dlt%20init%20sql_database%20snowflake`,lang:`python`});var D=o(E,4);l(D,{code:`import%20dlt%0Aimport%20pendulum%0A%0Afrom%20sql_database%20import%20sql_database%2C%20ConnectionStringCredentials%2C%20sql_table%0A%0Aimport%20modal%0Aimport%20os%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.apt_install(%5B%22libpq-dev%22%5D)%20%23%20system%20requirement%20for%20postgres%20driver%0A%20%20%20%20.pip_install(%0A%20%20%20%20%20%20%20%20%22sqlalchemy%3E%3D1.4%22%2C%20%23%20how%20dlt%20establishes%20connections%0A%20%20%20%20%20%20%20%20%22dlt%5Bsnowflake%5D%3E%3D0.4.11%22%2C%0A%20%20%20%20%20%20%20%20%22psycopg2-binary%22%2C%20%23%20postgres%20driver%0A%20%20%20%20%20%20%20%20%22dlt%5Bparquet%5D%22%2C%0A%20%20%20%20%20%20%20%20%22psutil%3D%3D6.0.0%22%2C%20%23%20for%20dlt%20logging%0A%20%20%20%20%20%20%20%20%22connectorx%22%2C%20%23%20creates%20arrow%20tables%20from%20database%20for%20fast%20data%20extraction%0A%20%20%20%20)%0A)%0A%0Aapp%20%3D%20modal.App(%22dlt-postgres-pipeline%22%2C%20image%3Dimage)`,lang:`python`});var O=o(D,2),re=e(O),ie=o(e(re),3);u(ie,{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Secrets`))},$$slots:{default:!0}}),u(o(ie,2),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`daily cron schedule`))},$$slots:{default:!0}}),n(re),n(O);var k=o(O,2);l(k,{code:`%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22snowflake-secret%22)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22postgres-read-replica-prod%22)%2C%0A%20%20%20%20%5D%2C%0A%20%20%20%20%23%20run%20this%20pipeline%20daily%0A%20%20%20%20schedule%3Dmodal.Cron(%2224%206%20*%20*%20*%22)%2C%0A%20%20%20%20timeout%3D3000%2C%0A)%0Adef%20load_table_from_database(%0A%20%20%20%20table%3A%20str%2C%0A%20%20%20%20incremental_col%3A%20str%2C%0A%20%20%20%20dev%3A%20bool%20%3D%20False%2C%0A)%20-%3E%20None%3A`,lang:`python`});var A=o(k,4);l(A,{code:`%20%20%20%20%23%20Modal%20Secrets%20are%20loaded%20as%20environment%20variables%20which%20are%20used%20here%20to%20create%20the%20SQLALchemy%20connection%20string%0A%20%20%20%20pg_url%20%3D%20f'postgresql%3A%2F%2F%7Bos.environ%5B%22PGUSER%22%5D%7D%3A%7Bos.environ%5B%22PGPASSWORD%22%5D%7D%40localhost%3A%7Bos.environ%5B%22PGPORT%22%5D%7D%2F%7Bos.environ%5B%22PGDATABASE%22%5D%7D'%0A%20%20%20%20snowflake_url%20%3D%20f'snowflake%3A%2F%2F%7Bos.environ%5B%22SNOWFLAKE_USER%22%5D%7D%3A%7Bos.environ%5B%22SNOWFLAKE_PASSWORD%22%5D%7D%40%7Bos.environ%5B%22SNOWFLAKE_ACCOUNT%22%5D%7D%2F%7Bos.environ%5B%22SNOWFLAKE_DATABASE%22%5D%7D'%0A%0A%20%20%20%20%23%20Create%20a%20pipeline%0A%20%20%20%20schema%20%3D%20%22POSTGRES_DLT_DEV%22%20if%20dev%20else%20%22POSTGRES_DLT%22%0A%20%20%20%20pipeline%20%3D%20dlt.pipeline(%0A%20%20%20%20%20%20%20%20pipeline_name%3D%22task%22%2C%0A%20%20%20%20%20%20%20%20destination%3Ddlt.destinations.snowflake(snowflake_url)%2C%0A%20%20%20%20%20%20%20%20dataset_name%3Dschema%2C%0A%20%20%20%20%20%20%20%20progress%3D%22log%22%2C%0A%20%20%20%20)%0A%0A%20%20%20%20credentials%20%3D%20ConnectionStringCredentials(pg_url)%0A%0A%20%20%20%20%23%20defines%20the%20postgres%20table%20to%20sync%20(in%20this%20case%2C%20the%20%22task%22%20table)%0A%20%20%20%20source_1%20%3D%20sql_database(credentials%2C%20backend%3D%22connectorx%22).with_resources(%22task%22)%0A%0A%20%20%20%20%23%20defines%20which%20column%20to%20reference%20for%20incremental%20loading%20(i.e.%20only%20load%20newer%20rows)%0A%20%20%20%20source_1.task.apply_hints(%0A%20%20%20%20%20%20%20%20incremental%3Ddlt.sources.incremental(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22enqueued_at%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20initial_value%3Dpendulum.datetime(2024%2C%207%2C%2024%2C%200%2C%200%2C%200%2C%20tz%3D%22UTC%22)%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20if%20there%20are%20duplicates%2C%20merge%20the%20latest%20values%0A%20%20%20%20info%20%3D%20pipeline.run(source_1%2C%20write_disposition%3D%22merge%22)%0A%20%20%20%20print(info)`,lang:`python`});var j=o(A,4);c(e(j),{src:`https://modal-cdn.com/modal-dlt-runtime.png`,alt:`modal-dlt-runtime`}),n(j);var M=o(j,2);u(o(e(M)),{href:`https://www.fivetran.com/pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`$4,738 a month`))},$$slots:{default:!0}}),s(),n(M);var N=o(M,2),P=e(N);u(e(P),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`$0.000038 / CPU core / sec`))},$$slots:{default:!0}}),s(),n(P),s(2),n(N);var F=o(N,8);u(o(e(F)),{href:`https://modal.com/docs/reference/modal.Proxy`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Proxy`))},$$slots:{default:!0}}),s(3),n(F);var I=o(F,2);l(I,{code:`%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22snowflake-secret%22)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22postgres-read-replica-prod%22)%2C%0A%20%20%20%20%5D%2C%0A%20%20%20%20schedule%3Dmodal.Cron(%2224%206%20*%20*%20*%22)%2C%0A%20%20%20%20proxy%3Dmodal.Proxy.from_name(%22prod-postgres-proxy%22%2C%20environment_name%3D%22main%22)%2C%0A%20%20%20%20timeout%3D3000%2C%0A)%0Adef%20task_pipeline(dev%3A%20bool%20%3D%20False)%20-%3E%20None%3A%0A%20%20%20%20pg_url%20%3D%20f'postgresql%3A%2F%2F%7Bos.environ%5B%22PGUSER%22%5D%7D%3A%7Bos.environ%5B%22PGPASSWORD%22%5D%7D%40localhost%3A%7Bos.environ%5B%22PGPORT%22%5D%7D%2F%7Bos.environ%5B%22PGDATABASE%22%5D%7D'`,lang:`python`});var L=o(I,4);u(o(e(L)),{href:`https://dlthub.com/docs/dlt-ecosystem/verified-sources/pg_replication`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Postgres CDC replication`))},$$slots:{default:!0}}),s(),n(L);var R=o(L,4);u(o(e(R)),{href:`https://modal.com/docs/reference/modal.Function#starmap`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal.starmap`))},$$slots:{default:!0}}),s(),n(R);var z=o(R,2);l(z,{code:`%40app.function(timeout%3D3000%2C%20schedule%3Dmodal.Cron(%2229%2011%20*%20*%20*%22))%0Adef%20main(dev%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20tables%20%3D%20%5B%0A%20%20%20%20%20%20%20%20(%22task%22%2C%20%22enqueued_at%22%2C%20dev)%2C%0A%20%20%20%20%20%20%20%20(%22worker%22%2C%20%22launched_at%22%2C%20dev)%2C%0A%20%20%20%20%20%20%20%20...%0A%20%20%20%20%5D%0A%20%20%20%20list(load_table_from_database.starmap(tables))`,lang:`python`});var B=o(z,6);u(o(e(B)),{href:`https://github.com/dbt-labs/dbt-core`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`dbt`))},$$slots:{default:!0}}),s(),n(B);var V=o(B,4),H=o(e(V),2);u(o(e(H),2),{href:`https://github.com/ActivitySchema/ActivitySchema/blob/main/2.0.md`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`activity schema`))},$$slots:{default:!0}}),s(),n(H),n(V);var U=o(V,8);l(U,{code:`select%0A%20%20%20%20--%20ids%0A%20%20%20%20id%20as%20task_id%2C%0A%20%20%20%20account_id%20as%20workspace_id%2C%0A%0A%20%20%20%20--%20numerics%0A%20%20%20%20gpu_count%2C%0A%0A%20%20%20%20--%20timestamps%0A%20%20%20%20enqueued_at%2C%0A%20%20%20%20started_at%2C%0A%20%20%20%20finished_at%0A%0Afrom%20%7B%7B%20source('postgres_dlt'%2C%20'task')%20%7D%7D`,lang:`sql`});var W=o(U,4);l(W,{code:`%23%20workspace_stream_started_task.sql%0Aselect%0A%20%20%20%20workspace_id%2C%0A%20%20%20%20started_at%20as%20ts%2C%0A%20%20%20%20gpu_count%0A%0Afrom%20%7B%7B%20ref('base_prod__task')%20%7D%7D`,lang:`sql`});var G=o(W,2);l(G,{code:`%23%20workspace_stream_finished_task.sql%0Aselect%0A%20%20%20%20workspace_id%2C%0A%20%20%20%20finished_at%20as%20ts%2C%0A%20%20%20%20gpu_count%0A%0Afrom%20%7B%7B%20ref('base_prod__task')%20%7D%7D`,lang:`sql`});var K=o(G,4);l(K,{code:`with%20activity_stream%20as%20(%0A%20%20%20%20select%20*%0A%0A%20%20%20%20from%20workspace_stream_started_task%0A%0A%20%20%20%20union%20all%0A%0A%20%20%20%20select%0A%0A%20%20%20%20from%20workspace_stream_finished_task%0A)%0A%0Aselect%0A%20%20%20%20*%2C%0A%20%20%20%20sum(%0A%20%20%20%20%20%20%20%20case%20when%20activity%20%3D%20'started_task'%0A%20%20%20%20%20%20%20%20then%20gpu_count%0A%20%20%20%20%20%20%20%20else%20-gpu_count%0A%20%20%20%20%20%20%20%20end%0A%20%20%20%20)%20over%20(partition%20by%20workspace_id%20order%20by%20ts)%20as%20concurrent_tasks%0Afrom%20activity_stream%0A`,lang:`sql`});var q=o(K,2);u(o(e(q)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`GPU concurrency limit`))},$$slots:{default:!0}}),s(),n(q);var J=o(q,4);u(o(e(J)),{href:`https://github.com/ActivitySchema/ActivitySchema/blob/main/2.0.md`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Activity Schema`))},$$slots:{default:!0}}),s(),n(J);var Y=o(J,12);l(Y,{code:`name%3A%20CI%2FCD%0A%0Aon%3A%0A%20%20push%3A%0A%20%20%20%20branches%3A%0A%20%20%20%20%20%20-%20main%0A%20%20pull_request%3A%0A%0A%23%20Cancel%20previous%20runs%20of%20the%20same%20PR%20but%20do%20not%20cancel%20previous%20runs%20on%20main%0Aconcurrency%3A%0A%20%20group%3A%20%24%7B%7B%20github.workflow%20%7D%7D-%24%7B%7B%20github.ref%20%7D%7D%0A%20%20cancel-in-progress%3A%20%24%7B%7B%20github.ref%20!%3D%20'refs%2Fheads%2Fmain'%20%7D%7D%0A%0Ajobs%3A%0A%20%20deploy%3A%0A%20%20%20%20name%3A%20Deploy%0A%20%20%20%20runs-on%3A%20ubuntu-latest%0A%20%20%20%20env%3A%0A%20%20%20%20%20%20MODAL_ENVIRONMENT%3A%20modal-etl%0A%20%20%20%20%20%20MODAL_TOKEN_ID%3A%20%24%7B%7B%20secrets.MODAL_TOKEN_ID%20%7D%7D%0A%20%20%20%20%20%20MODAL_TOKEN_SECRET%3A%20%24%7B%7B%20secrets.MODAL_TOKEN_SECRET%20%7D%7D%0A%0A%20%20%20%20steps%3A%0A%20%20%20%20%20%20-%20name%3A%20Checkout%20Repository%0A%20%20%20%20%20%20%20%20uses%3A%20actions%2Fcheckout%40v6%0A%0A%20%20%20%20%20%20-%20name%3A%20Install%20Python%0A%20%20%20%20%20%20%20%20uses%3A%20actions%2Fsetup-python%40v5%0A%20%20%20%20%20%20%20%20with%3A%0A%20%20%20%20%20%20%20%20%20%20python-version%3A%20%223.10%22%0A%0A%20%20%20%20%20%20-%20name%3A%20Install%20Packages%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20python%20-m%20pip%20install%20--upgrade%20pip%0A%20%20%20%20%20%20%20%20%20%20pip%20install%20-r%20requirements.txt%0A%0A%20%20%20%20%20%20-%20name%3A%20CD%20job%0A%20%20%20%20%20%20%20%20if%3A%20github.ref%20%3D%3D%20'refs%2Fheads%2Fmain'%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20sha%3D%24%7B%7B%20github.sha%20%7D%7D%0A%20%20%20%20%20%20%20%20%20%20sha_short%3D%24(git%20rev-parse%20--short%20%24sha)%0A%20%20%20%20%20%20%20%20%20%20python%20cicd.py%20--cd%20--tag%20%24sha_short%0A%0A%20%20%20%20%20%20-%20name%3A%20CI%20job%0A%20%20%20%20%20%20%20%20if%3A%20github.ref%20!%3D%20'refs%2Fheads%2Fmain'%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20branch%3D%24%7B%7B%20github.head_ref%20%7D%7D%0A%20%20%20%20%20%20%20%20%20%20python%20cicd.py%20--ci%20--tag%20%24branch`,lang:`yaml`});var X=o(Y,2),Z=o(e(X));u(Z,{href:`/docs/guide/continuous-deployment#github-actions`,children:(e,t)=>{s(),i(e,r(`docs page`))},$$slots:{default:!0}}),u(o(Z,8),{href:`/docs/guide/project-structure#apps-spanning-multiple-files`,children:(e,t)=>{s(),i(e,r(`apps spanning multiple files`))},$$slots:{default:!0}}),s(),n(X);var ae=o(X,4);l(ae,{code:`import%20os%0Aimport%20re%0Aimport%20shutil%0Aimport%20subprocess%0Aimport%20sys%0Aimport%20pathlib%0Aimport%20argparse%0Afrom%20typing%20import%20Dict%0A%0Adef%20get_modules()%3A%0A%20%20%20%20modules_to_deploy%20%3D%20%5B%5D%0A%20%20%20%20modules_to_run_on_cd%20%3D%20%5B%5D%0A%20%20%20%20modules_to_run_on_ci%20%3D%20%5B%5D%0A%20%20%20%20current_dir%20%3D%20pathlib.Path.cwd()%0A%0A%20%20%20%20for%20subdir%2C%20dirs%2C%20files%20in%20os.walk(current_dir)%3A%0A%20%20%20%20%20%20%20%20subdir_path%20%3D%20pathlib.Path(subdir)%0A%20%20%20%20%20%20%20%20relative_subdir%20%3D%20subdir_path.relative_to(current_dir)%0A%0A%20%20%20%20%20%20%20%20if%20re.match(r%22%5E(%5C.%7C__)%22%2C%20str(relative_subdir))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20for%20file%20in%20files%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20filepath%20%3D%20subdir_path%20%2F%20file%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20filepath.suffix%20%3D%3D%20%22.py%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%20open(filepath%2C%20%22r%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20content%20%3D%20f.read()%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20%22%23%20deploy%3A%20true%22%20in%20content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modules_to_deploy.append(%7B%22fp%22%3A%20filepath%7D)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20%22%23%20cd-run%3A%20true%22%20in%20content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modules_to_run_on_cd.append(%7B%22fp%22%3A%20filepath%7D)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20%22%23%20ci-run%3A%20true%22%20in%20content%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modules_to_run_on_ci.append(%7B%22fp%22%3A%20filepath%7D)%0A%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22cd%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22deploy%22%3A%20modules_to_deploy%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22run%22%3A%20modules_to_run_on_cd%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%22ci%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22run%22%3A%20modules_to_run_on_ci%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%7D%0A%0A%0Adef%20run_command(cmd%2C%20extra_env%3A%20Dict%5Bstr%2C%20str%5D%20%3D%20%7B%7D)%3A%0A%20%20%20%20print(f%22%20%20Running%20command%3A%20%7Bcmd%7D%22)%0A%20%20%20%20env%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22MODAL_ENVIRONMENT%22%3A%20os.environ.get(%22MODAL_ENVIRONMENT%22)%2C%0A%20%20%20%20%20%20%20%20%22MODAL_TOKEN_ID%22%3A%20os.environ.get(%22MODAL_TOKEN_ID%22)%2C%0A%20%20%20%20%20%20%20%20%22MODAL_TOKEN_SECRET%22%3A%20os.environ.get(%22MODAL_TOKEN_SECRET%22)%2C%0A%20%20%20%20%20%20%20%20**extra_env%2C%0A%20%20%20%20%7D%0A%20%20%20%20print(f%22%20%20Environment%3A%20%7Benv%7D%22)%0A%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20cmd%2C%0A%20%20%20%20%20%20%20%20env%3D%7Bk%3A%20v%20for%20k%2C%20v%20in%20env.items()%20if%20v%7D%2C%0A%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20%20%20%20%20stdout%3Dsys.stdout%2C%0A%20%20%20%20%20%20%20%20stderr%3Dsys.stderr%2C%0A%20%20%20%20)%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20parser%20%3D%20argparse.ArgumentParser()%0A%20%20%20%20parser.add_argument(%22--ci%22%2C%20action%3D%22store_true%22)%0A%20%20%20%20parser.add_argument(%22--cd%22%2C%20action%3D%22store_true%22)%0A%20%20%20%20parser.add_argument(%22--tag%22)%0A%20%20%20%20args%20%3D%20parser.parse_args()%0A%0A%0A%20%20%20%20if%20args.ci%20and%20args.cd%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(%22Please%20provide%20either%20--ci%20or%20--cd%20flag%2C%20not%20both%22)%0A%0A%20%20%20%20modules%20%3D%20get_modules()%0A%20%20%20%20bin_path%20%3D%20shutil.which(%22modal%22)%0A%0A%20%20%20%20extra_env%20%3D%20%7B%22tag%22%3A%20args.tag%7D%20if%20args.tag%20else%20%7B%7D%0A%0A%20%20%20%20if%20args.cd%3A%0A%20%20%20%20%20%20%20%20print(f%22Deploying%20%7Blen(modules%5B'cd'%5D%5B'deploy'%5D)%7D%20apps%22)%0A%0A%20%20%20%20%20%20%20%20tag%20%3D%20%5B%22--tag%22%2C%20args.tag%5D%20if%20args.tag%20else%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20for%20module%20in%20modules%5B'cd'%5D%5B'deploy'%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%5Cn-%20Deploying%20%7Bstr(module%5B'fp'%5D)%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20run_command(%5Bbin_path%2C%20%22deploy%22%2C%20module%5B%22fp%22%5D%5D%20%2B%20tag%2C%20extra_env)%0A%0A%20%20%20%20%20%20%20%20print(f%22Running%20%7Blen(modules%5B'cd'%5D%5B'run'%5D)%7D%20apps%22)%0A%20%20%20%20%20%20%20%20for%20module%20in%20modules%5B'cd'%5D%5B'run'%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%5Cn-%20Running%20%7Bstr(module%5B'fp'%5D)%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20run_command(%5Bbin_path%2C%20%22run%22%2C%20module%5B%22fp%22%5D%5D%2C%20extra_env)%0A%20%20%20%20elif%20args.ci%3A%0A%20%20%20%20%20%20%20%20print(f%22Running%20%7Blen(modules%5B'ci'%5D%5B'run'%5D)%7D%20apps%22)%0A%20%20%20%20%20%20%20%20for%20module%20in%20modules%5B'ci'%5D%5B'run'%5D%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%5Cn-%20Running%20%7Bstr(module%5B'fp'%5D)%7D%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20run_command(%5Bbin_path%2C%20%22run%22%2C%20module%5B%22fp%22%5D%5D%2C%20extra_env)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(%22Please%20provide%20either%20--ci%20or%20--cd%20flag%22)%0A`,lang:`python`});var Q=o(ae,8);u(o(e(Q)),{href:`/docs/guide/managing-deployments#updating-deployments`,children:(e,t)=>{s(),i(e,r(`deployment rollback feature`))},$$slots:{default:!0}}),s(3),n(Q);var $=o(Q,2);u(o(e($)),{href:`https://docs.getdbt.com/docs/build/custom-schemas`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`custom schema name macro`))},$$slots:{default:!0}}),s(),n($),l(o($,2),{code:`%7B%25%20macro%20generate_schema_name(custom_schema_name%2C%20node)%20-%25%7D%0A%0A%20%20%20%20%7B%25-%20set%20default_schema%20%3D%20target.schema%20-%25%7D%0A%20%20%20%20%7B%25-%20set%20tag%20%3D%20var('tag'%2C%20'local').replace('-'%2C%20'_').replace('%2F'%2C%20'_').replace('.'%2C%20'_')%20-%25%7D%0A%0A%20%20%20%20%7B%25-%20if%20target.name%20%3D%3D%20'ci'%20-%25%7D%0A%0A%20%20%20%20%20%20%20%20%7B%25-%20if%20custom_schema_name%20is%20none%20-%25%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20ci_%7B%7B%20tag%20%7D%7D%0A%0A%20%20%20%20%20%20%20%20%7B%25-%20else%20-%25%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20ci_%7B%7B%20tag%20%7D%7D_%7B%7B%20custom_schema_name%20%7C%20trim%20%7D%7D%0A%0A%20%20%20%20%20%20%20%20%7B%25-%20endif%20-%25%7D%0A%0A%20%20%20%20%7B%25-%20elif%20custom_schema_name%20is%20none%20-%25%7D%0A%0A%20%20%20%20%20%20%20%20%7B%7B%20default_schema%20%7D%7D%0A%0A%20%20%20%20%7B%25-%20else%20-%25%7D%0A%0A%20%20%20%20%20%20%20%20%7B%7B%20default_schema%20%7D%7D_%7B%7B%20custom_schema_name%20%7C%20trim%20%7D%7D%0A%0A%20%20%20%20%7B%25-%20endif%20-%25%7D%0A%0A%7B%25-%20endmacro%20%25%7D%0A`,lang:`sql`}),s(6),i(t,a)},$$slots:{default:!0}}))}export{w as default,f as metadata};
//# sourceMappingURL=BcGi-xqM2.js.map
