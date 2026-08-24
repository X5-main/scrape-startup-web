(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`18b90a50-c95d-4855-8cf3-6042c1f70815`,e._sentryDebugIdIdentifier=`sentry-dbid-18b90a50-c95d-4855-8cf3-6042c1f70815`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Publish interactive datasets with Datasette`,id:`publish-interactive-datasets-with-datasette`,children:[{depth:2,value:`Basic setup`,id:`basic-setup`},{depth:2,value:`Persistent dataset storage`,id:`persistent-dataset-storage`},{depth:2,value:`Getting a dataset`,id:`getting-a-dataset`},{depth:2,value:`Data processing`,id:`data-processing`},{depth:2,value:`Inserting into SQLite`,id:`inserting-into-sqlite`},{depth:2,value:`Keep it fresh`,id:`keep-it-fresh`},{depth:2,value:`Web Function`,id:`web-function`},{depth:2,value:`Publishing to the web`,id:`publishing-to-the-web`}]}],rawContent:`# Publish interactive datasets with Datasette

![Datasette user interface](https://modal-cdn.com/cdnbot/imdb_datasetteqzaj3q9d_a83d82fd.webp)

Build and deploy an interactive movie database that automatically updates daily with the latest IMDb data.
This example shows how to serve a Datasette application on Modal with millions of movie and TV show records.

Try it out for yourself [here](https://modal-labs-examples--example-cron-datasette-ui.modal.run).

Along the way, we will learn how to use the following Modal features:

* [Volumes](https://modal.com/docs/guide/volumes): a persisted volume lets us store and grow the published dataset over time.

* [Scheduled functions](https://modal.com/docs/guide/cron): the underlying dataset is refreshed daily, so we schedule a function to run daily.

* [Web Functions](https://modal.com/docs/guide/webhooks): exposes the Datasette application for web browser interaction and API requests.

## Basic setup

Let's get started writing code.
For the Modal container image we need a few Python packages.

\`\`\`python
import asyncio
import gzip
import pathlib
import shutil
import tempfile
from datetime import datetime
from urllib.request import urlretrieve

import modal

app = modal.App("example-cron-datasette")
cron_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "datasette==0.65.1", "sqlite-utils==3.38", "tqdm~=4.67.1", "setuptools<80"
)

\`\`\`

## Persistent dataset storage

To separate database creation and maintenance from serving, we'll need the underlying
database file to be stored persistently. To achieve this we use a
[Volume](https://modal.com/docs/guide/volumes).

\`\`\`python
volume = modal.Volume.from_name(
    "example-cron-datasette-cache-vol", create_if_missing=True
)
DB_FILENAME = "imdb.db"
VOLUME_DIR = "/cache-vol"
DATA_DIR = pathlib.Path(VOLUME_DIR, "imdb-data")
DB_PATH = pathlib.Path(VOLUME_DIR, DB_FILENAME)

\`\`\`

## Getting a dataset

[IMDb Datasets](https://datasets.imdbws.com/) are available publicly and are updated daily.
We will download the title.basics.tsv.gz file which contains basic information about all titles (movies, TV shows, etc.).
Since we are serving an interactive database which updates daily, we will download the files into a temporary directory and then move them to the volume to prevent downtime.

\`\`\`python
BASE_URL = "https://datasets.imdbws.com/"
IMDB_FILES = [
    "title.basics.tsv.gz",
]


@app.function(
    image=cron_image,
    volumes={VOLUME_DIR: volume},
    retries=2,
    timeout=1800,
)
def download_dataset(force_refresh=False):
    """Download IMDb dataset files."""
    if DATA_DIR.exists() and not force_refresh:
        print(
            f"Dataset already present and force_refresh={force_refresh}. Skipping download."
        )
        return

    TEMP_DATA_DIR = pathlib.Path(VOLUME_DIR, "imdb-data-temp")
    if TEMP_DATA_DIR.exists():
        shutil.rmtree(TEMP_DATA_DIR)

    TEMP_DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("Downloading IMDb dataset...")

    try:
        for filename in IMDB_FILES:
            print(f"Downloading {filename}...")
            url = BASE_URL + filename
            output_path = TEMP_DATA_DIR / filename

            urlretrieve(url, output_path)
            print(f"Successfully downloaded {filename}")

        if DATA_DIR.exists():
            # move the current data to a backup location
            OLD_DATA_DIR = pathlib.Path(VOLUME_DIR, "imdb-data-old")
            if OLD_DATA_DIR.exists():
                shutil.rmtree(OLD_DATA_DIR)
            shutil.move(DATA_DIR, OLD_DATA_DIR)

            # move the new data into place
            shutil.move(TEMP_DATA_DIR, DATA_DIR)

            # clean up the old data
            shutil.rmtree(OLD_DATA_DIR)
        else:
            shutil.move(TEMP_DATA_DIR, DATA_DIR)

        volume.commit()
        print("Finished downloading dataset.")

    except Exception as e:
        print(f"Error during download: {e}")
        if TEMP_DATA_DIR.exists():
            shutil.rmtree(TEMP_DATA_DIR)
        raise


\`\`\`

## Data processing

This dataset is no swamp, but a bit of data cleaning is still in order.
The following function reads a .tsv file, cleans the data and yields batches of records.

\`\`\`python
def parse_tsv_file(filepath, batch_size=50000, filter_year=None):
    """Parse a gzipped TSV file and yield batches of records."""
    import csv

    with gzip.open(filepath, "rt", encoding="utf-8") as gz_file:
        reader = csv.DictReader(gz_file, delimiter="\\t")
        batch = []
        total_processed = 0

        for row in reader:
            # map missing values to None
            row = {k: (None if v == "\\\\N" else v) for k, v in row.items()}

            # remove nsfw data
            if row.get("isAdult") == "1":
                continue

            if filter_year:
                start_year = int(row.get("startYear", 0) or 0)
                if start_year < filter_year:
                    continue

            batch.append(row)
            total_processed += 1

            if len(batch) >= batch_size:
                yield batch
                batch = []

        # Yield any remaining records
        if batch:
            yield batch

        print(f"Finished processing {total_processed:,} titles.")


\`\`\`

## Inserting into SQLite

With the TSV processing out of the way, we’re ready to create a SQLite database and feed data into it.

Importantly, the \`prep_db\` function mounts the same volume used by \`download_dataset\`, and rows are batch inserted with progress logged after each batch,
as the full IMDb dataset has millions of rows and does take some time to be fully inserted.

A more sophisticated implementation would only load new data instead of performing a full refresh,
but we’re keeping things simple for this example!
We will also create indexes for the titles table to speed up queries.

\`\`\`python
@app.function(
    image=cron_image,
    volumes={VOLUME_DIR: volume},
    timeout=900,
)
def prep_db(filter_year=None):
    """Process IMDb data files and create SQLite database."""
    import sqlite_utils
    import tqdm

    volume.reload()

    # Create database in a temporary directory first
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = pathlib.Path(tmpdir)
        tmp_db_path = tmpdir_path / DB_FILENAME

        db = sqlite_utils.Database(tmp_db_path)

        # Process title.basics.tsv.gz
        titles_file = DATA_DIR / "title.basics.tsv.gz"

        if titles_file.exists():
            titles_table = db["titles"]
            batch_count = 0
            total_processed = 0

            with tqdm.tqdm(desc="Processing titles", unit="batch", leave=True) as pbar:
                for i, batch in enumerate(
                    parse_tsv_file(
                        titles_file, batch_size=50000, filter_year=filter_year
                    )
                ):
                    titles_table.insert_all(batch, batch_size=50000, truncate=(i == 0))
                    batch_count += len(batch)
                    total_processed += len(batch)
                    pbar.update(1)
                    pbar.set_postfix({"titles": f"{total_processed:,}"})

            print(f"Total titles in database: {batch_count:,}")

            # Create indexes for titles so we can query the database faster
            print("Creating indexes...")
            titles_table.create_index(["tconst"], if_not_exists=True, unique=True)
            titles_table.create_index(["primaryTitle"], if_not_exists=True)
            titles_table.create_index(["titleType"], if_not_exists=True)
            titles_table.create_index(["startYear"], if_not_exists=True)
            titles_table.create_index(["genres"], if_not_exists=True)
            print("Created indexes for titles table")

        db.close()

        # Copy the database to the volume
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(tmp_db_path, DB_PATH)

    print("Syncing DB with volume.")
    volume.commit()
    print("Volume changes committed.")


\`\`\`

## Keep it fresh

IMDb updates their data daily, so we set up
a [scheduled](https://modal.com/docs/guide/cron) function to automatically refresh the database
every 24 hours.

\`\`\`python
@app.function(schedule=modal.Period(hours=24), timeout=4000)
def refresh_db():
    """Scheduled function to refresh the database daily."""
    print(f"Running scheduled refresh at {datetime.now()}")
    download_dataset.remote(force_refresh=True)
    prep_db.remote()


\`\`\`

## Web Function

Hooking up the SQLite database to a Modal Function is as simple as it gets.
The Modal \`@asgi_app\` decorator wraps a few lines of code: one \`import\` and a couple more
that instantiate the \`Datasette\` instance and return its app server.

First, let's define a metadata object for the database.
This will be used to configure Datasette to display a custom UI with some pre-defined queries.

\`\`\`python
columns = {
    "tconst": "Unique identifier",
    "titleType": "Type (movie, tvSeries, short, etc.)",
    "primaryTitle": "Main title",
    "originalTitle": "Original language title",
    "startYear": "Release year",
    "endYear": "End year (for TV series)",
    "runtimeMinutes": "Runtime in minutes",
    "genres": "Comma-separated genres",
}

queries = {
    "movies_2024": {
        "sql": """
                        SELECT
                            primaryTitle as title,
                            genres,
                            runtimeMinutes as runtime
                        FROM titles
                        WHERE titleType = 'movie'
                        AND startYear = 2024
                        ORDER BY primaryTitle
                        LIMIT 100
                    """,
        "title": "Movies Released in 2024",
    },
    "longest_movies": {
        "sql": """
                        SELECT
                            primaryTitle as title,
                            startYear as year,
                            runtimeMinutes as runtime,
                            genres
                        FROM titles
                        WHERE titleType = 'movie'
                        AND runtimeMinutes IS NOT NULL
                        AND runtimeMinutes > 180
                        ORDER BY runtimeMinutes DESC
                        LIMIT 50
                    """,
        "title": "Longest Movies (3+ hours)",
    },
    "genre_breakdown": {
        "sql": """
                        SELECT
                            genres,
                            COUNT(*) as count
                        FROM titles
                        WHERE titleType = 'movie'
                        AND genres IS NOT NULL
                        GROUP BY genres
                        ORDER BY count DESC
                        LIMIT 25
                    """,
        "title": "Popular Genres",
    },
}


metadata = {
    "title": "IMDb Database Explorer",
    "description": "Explore IMDb movie and TV show data",
    "databases": {
        "imdb": {
            "tables": {
                "titles": {
                    "description": "Basic information about all titles (movies, TV shows, etc.)",
                    "columns": columns,
                }
            },
            "queries": {
                "movies_2024": queries["movies_2024"],
                "longest_movies": queries["longest_movies"],
                "genre_breakdown": queries["genre_breakdown"],
            },
        }
    },
}

\`\`\`

Now we can define the Web Function that will serve the Datasette application

\`\`\`python
@app.function(
    image=cron_image,
    volumes={VOLUME_DIR: volume},
)
@modal.concurrent(max_inputs=16)
@modal.asgi_app()
def ui():
    """Web Function backing the Datasette UI."""
    from datasette.app import Datasette

    ds = Datasette(
        files=[DB_PATH],
        settings={
            "sql_time_limit_ms": 60000,
            "max_returned_rows": 10000,
            "allow_download": True,
            "facet_time_limit_ms": 5000,
            "allow_facet": True,
        },
        metadata=metadata,
    )
    asyncio.run(ds.invoke_startup())
    return ds.app()


\`\`\`

## Publishing to the web

Run this script using \`modal run cron_datasette.py\` and it will create the database under 5 minutes!

If you would like to force a refresh of the dataset, you can use:

\`modal run cron_datasette.py --force-refresh\`

If you would like to filter the data to be after a specific year, you can use:

\`modal run cron_datasette.py --filter-year year\`

You can then use \`modal serve cron_datasette.py\` to create a short-lived web URL
that exists until you terminate the script.

When publishing the interactive Datasette app you'll want to create a persistent URL.
Just run \`modal deploy cron_datasette.py\` and your app will be deployed in seconds!

\`\`\`python
@app.local_entrypoint()
def run(force_refresh: bool = False, filter_year: int = None):
    if force_refresh:
        print("Force refreshing the dataset...")

    if filter_year:
        print(f"Filtering data to be after {filter_year}")

    print("Downloading IMDb dataset...")
    download_dataset.remote(force_refresh=force_refresh)
    print("Processing data and creating SQLite DB...")
    prep_db.remote(filter_year=filter_year)
    print("\\nDatabase ready! You can now run:")
    print("  modal serve cron_datasette.py  # For development")
    print("  modal deploy cron_datasette.py  # For production deployment")


\`\`\`

You can explore the data at the [deployed Web Function](https://modal-labs-examples--example-cron-datasette-ui.modal.run).
`,meta:{title:`Publish interactive datasets with Datasette`,description:`Build and deploy an interactive movie database that automatically updates daily with the latest IMDb data. This example shows how to serve a Datasette application on Modal with millions of movie and TV show records.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p><!></p> <p>Build and deploy an interactive movie database that automatically updates daily with the latest IMDb data.
This example shows how to serve a Datasette application on Modal with millions of movie and TV show records.</p> <p>Try it out for yourself <!>.</p> <p>Along the way, we will learn how to use the following Modal features:</p> <ul><li><p><!>: a persisted volume lets us store and grow the published dataset over time.</p></li> <li><p><!>: the underlying dataset is refreshed daily, so we schedule a function to run daily.</p></li> <li><p><!>: exposes the Datasette application for web browser interaction and API requests.</p></li></ul> <!> <p>Let’s get started writing code.
For the Modal container image we need a few Python packages.</p> <!> <!> <p>To separate database creation and maintenance from serving, we’ll need the underlying
database file to be stored persistently. To achieve this we use a <!>.</p> <!> <!> <p><!> are available publicly and are updated daily.
We will download the title.basics.tsv.gz file which contains basic information about all titles (movies, TV shows, etc.).
Since we are serving an interactive database which updates daily, we will download the files into a temporary directory and then move them to the volume to prevent downtime.</p> <!> <!> <p>This dataset is no swamp, but a bit of data cleaning is still in order.
The following function reads a .tsv file, cleans the data and yields batches of records.</p> <!> <!> <p>With the TSV processing out of the way, we’re ready to create a SQLite database and feed data into it.</p> <p>Importantly, the <code>prep_db</code> function mounts the same volume used by <code>download_dataset</code>, and rows are batch inserted with progress logged after each batch,
as the full IMDb dataset has millions of rows and does take some time to be fully inserted.</p> <p>A more sophisticated implementation would only load new data instead of performing a full refresh,
but we’re keeping things simple for this example!
We will also create indexes for the titles table to speed up queries.</p> <!> <!> <p>IMDb updates their data daily, so we set up
a <!> function to automatically refresh the database
every 24 hours.</p> <!> <!> <p>Hooking up the SQLite database to a Modal Function is as simple as it gets.
The Modal <code>@asgi_app</code> decorator wraps a few lines of code: one <code>import</code> and a couple more
that instantiate the <code>Datasette</code> instance and return its app server.</p> <p>First, let’s define a metadata object for the database.
This will be used to configure Datasette to display a custom UI with some pre-defined queries.</p> <!> <p>Now we can define the Web Function that will serve the Datasette application</p> <!> <!> <p>Run this script using <code>modal run cron_datasette.py</code> and it will create the database under 5 minutes!</p> <p>If you would like to force a refresh of the dataset, you can use:</p> <p><code>modal run cron_datasette.py --force-refresh</code></p> <p>If you would like to filter the data to be after a specific year, you can use:</p> <p><code>modal run cron_datasette.py --filter-year year</code></p> <p>You can then use <code>modal serve cron_datasette.py</code> to create a short-lived web URL
that exists until you terminate the script.</p> <p>When publishing the interactive Datasette app you’ll want to create a persistent URL.
Just run <code>modal deploy cron_datasette.py</code> and your app will be deployed in seconds!</p> <!> <p>You can explore the data at the <!>.</p>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);d(m,{id:`publish-interactive-datasets-with-datasette`,children:(e,t)=>{l(),i(e,r(`Publish interactive datasets with Datasette`))},$$slots:{default:!0}});var g=c(m,2);f(e(g),{src:`https://modal-cdn.com/cdnbot/imdb_datasetteqzaj3q9d_a83d82fd.webp`,alt:`Datasette user interface`}),n(g);var _=c(g,4);h(c(e(_)),{href:`https://modal-labs-examples--example-cron-datasette-ui.modal.run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4),y=e(v),x=e(y);h(e(x),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(x),n(y);var S=c(y,2),C=e(S);h(e(C),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Scheduled functions`))},$$slots:{default:!0}}),l(),n(C),n(S);var w=c(S,2),T=e(w);h(e(T),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),l(),n(T),n(w),n(v);var E=c(v,2);u(E,{id:`basic-setup`,children:(e,t)=>{l(),i(e,r(`Basic setup`))},$$slots:{default:!0}});var D=c(E,4);p(D,{code:`import%20asyncio%0Aimport%20gzip%0Aimport%20pathlib%0Aimport%20shutil%0Aimport%20tempfile%0Afrom%20datetime%20import%20datetime%0Afrom%20urllib.request%20import%20urlretrieve%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-cron-datasette%22)%0Acron_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22datasette%3D%3D0.65.1%22%2C%20%22sqlite-utils%3D%3D3.38%22%2C%20%22tqdm~%3D4.67.1%22%2C%20%22setuptools%3C80%22%0A)%0A`,lang:`python`});var O=c(D,2);u(O,{id:`persistent-dataset-storage`,children:(e,t)=>{l(),i(e,r(`Persistent dataset storage`))},$$slots:{default:!0}});var k=c(O,2);h(c(e(k)),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);p(A,{code:`volume%20%3D%20modal.Volume.from_name(%0A%20%20%20%20%22example-cron-datasette-cache-vol%22%2C%20create_if_missing%3DTrue%0A)%0ADB_FILENAME%20%3D%20%22imdb.db%22%0AVOLUME_DIR%20%3D%20%22%2Fcache-vol%22%0ADATA_DIR%20%3D%20pathlib.Path(VOLUME_DIR%2C%20%22imdb-data%22)%0ADB_PATH%20%3D%20pathlib.Path(VOLUME_DIR%2C%20DB_FILENAME)%0A`,lang:`python`});var j=c(A,2);u(j,{id:`getting-a-dataset`,children:(e,t)=>{l(),i(e,r(`Getting a dataset`))},$$slots:{default:!0}});var M=c(j,2);h(e(M),{href:`https://datasets.imdbws.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`IMDb Datasets`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);p(N,{code:`BASE_URL%20%3D%20%22https%3A%2F%2Fdatasets.imdbws.com%2F%22%0AIMDB_FILES%20%3D%20%5B%0A%20%20%20%20%22title.basics.tsv.gz%22%2C%0A%5D%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dcron_image%2C%0A%20%20%20%20volumes%3D%7BVOLUME_DIR%3A%20volume%7D%2C%0A%20%20%20%20retries%3D2%2C%0A%20%20%20%20timeout%3D1800%2C%0A)%0Adef%20download_dataset(force_refresh%3DFalse)%3A%0A%20%20%20%20%22%22%22Download%20IMDb%20dataset%20files.%22%22%22%0A%20%20%20%20if%20DATA_DIR.exists()%20and%20not%20force_refresh%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22Dataset%20already%20present%20and%20force_refresh%3D%7Bforce_refresh%7D.%20Skipping%20download.%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20TEMP_DATA_DIR%20%3D%20pathlib.Path(VOLUME_DIR%2C%20%22imdb-data-temp%22)%0A%20%20%20%20if%20TEMP_DATA_DIR.exists()%3A%0A%20%20%20%20%20%20%20%20shutil.rmtree(TEMP_DATA_DIR)%0A%0A%20%20%20%20TEMP_DATA_DIR.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%0A%20%20%20%20print(%22Downloading%20IMDb%20dataset...%22)%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20for%20filename%20in%20IMDB_FILES%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Downloading%20%7Bfilename%7D...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20BASE_URL%20%2B%20filename%0A%20%20%20%20%20%20%20%20%20%20%20%20output_path%20%3D%20TEMP_DATA_DIR%20%2F%20filename%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20urlretrieve(url%2C%20output_path)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Successfully%20downloaded%20%7Bfilename%7D%22)%0A%0A%20%20%20%20%20%20%20%20if%20DATA_DIR.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20move%20the%20current%20data%20to%20a%20backup%20location%0A%20%20%20%20%20%20%20%20%20%20%20%20OLD_DATA_DIR%20%3D%20pathlib.Path(VOLUME_DIR%2C%20%22imdb-data-old%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20OLD_DATA_DIR.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20shutil.rmtree(OLD_DATA_DIR)%0A%20%20%20%20%20%20%20%20%20%20%20%20shutil.move(DATA_DIR%2C%20OLD_DATA_DIR)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20move%20the%20new%20data%20into%20place%0A%20%20%20%20%20%20%20%20%20%20%20%20shutil.move(TEMP_DATA_DIR%2C%20DATA_DIR)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20clean%20up%20the%20old%20data%0A%20%20%20%20%20%20%20%20%20%20%20%20shutil.rmtree(OLD_DATA_DIR)%0A%20%20%20%20%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20shutil.move(TEMP_DATA_DIR%2C%20DATA_DIR)%0A%0A%20%20%20%20%20%20%20%20volume.commit()%0A%20%20%20%20%20%20%20%20print(%22Finished%20downloading%20dataset.%22)%0A%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20print(f%22Error%20during%20download%3A%20%7Be%7D%22)%0A%20%20%20%20%20%20%20%20if%20TEMP_DATA_DIR.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20shutil.rmtree(TEMP_DATA_DIR)%0A%20%20%20%20%20%20%20%20raise%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`data-processing`,children:(e,t)=>{l(),i(e,r(`Data processing`))},$$slots:{default:!0}});var F=c(P,4);p(F,{code:`def%20parse_tsv_file(filepath%2C%20batch_size%3D50000%2C%20filter_year%3DNone)%3A%0A%20%20%20%20%22%22%22Parse%20a%20gzipped%20TSV%20file%20and%20yield%20batches%20of%20records.%22%22%22%0A%20%20%20%20import%20csv%0A%0A%20%20%20%20with%20gzip.open(filepath%2C%20%22rt%22%2C%20encoding%3D%22utf-8%22)%20as%20gz_file%3A%0A%20%20%20%20%20%20%20%20reader%20%3D%20csv.DictReader(gz_file%2C%20delimiter%3D%22%5Ct%22)%0A%20%20%20%20%20%20%20%20batch%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20total_processed%20%3D%200%0A%0A%20%20%20%20%20%20%20%20for%20row%20in%20reader%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20map%20missing%20values%20to%20None%0A%20%20%20%20%20%20%20%20%20%20%20%20row%20%3D%20%7Bk%3A%20(None%20if%20v%20%3D%3D%20%22%5C%5CN%22%20else%20v)%20for%20k%2C%20v%20in%20row.items()%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20remove%20nsfw%20data%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20row.get(%22isAdult%22)%20%3D%3D%20%221%22%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20filter_year%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20start_year%20%3D%20int(row.get(%22startYear%22%2C%200)%20or%200)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20start_year%20%3C%20filter_year%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20batch.append(row)%0A%20%20%20%20%20%20%20%20%20%20%20%20total_processed%20%2B%3D%201%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20len(batch)%20%3E%3D%20batch_size%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20yield%20batch%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20batch%20%3D%20%5B%5D%0A%0A%20%20%20%20%20%20%20%20%23%20Yield%20any%20remaining%20records%0A%20%20%20%20%20%20%20%20if%20batch%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20yield%20batch%0A%0A%20%20%20%20%20%20%20%20print(f%22Finished%20processing%20%7Btotal_processed%3A%2C%7D%20titles.%22)%0A%0A`,lang:`python`});var I=c(F,2);u(I,{id:`inserting-into-sqlite`,children:(e,t)=>{l(),i(e,r(`Inserting into SQLite`))},$$slots:{default:!0}});var L=c(I,8);p(L,{code:`%40app.function(%0A%20%20%20%20image%3Dcron_image%2C%0A%20%20%20%20volumes%3D%7BVOLUME_DIR%3A%20volume%7D%2C%0A%20%20%20%20timeout%3D900%2C%0A)%0Adef%20prep_db(filter_year%3DNone)%3A%0A%20%20%20%20%22%22%22Process%20IMDb%20data%20files%20and%20create%20SQLite%20database.%22%22%22%0A%20%20%20%20import%20sqlite_utils%0A%20%20%20%20import%20tqdm%0A%0A%20%20%20%20volume.reload()%0A%0A%20%20%20%20%23%20Create%20database%20in%20a%20temporary%20directory%20first%0A%20%20%20%20with%20tempfile.TemporaryDirectory()%20as%20tmpdir%3A%0A%20%20%20%20%20%20%20%20tmpdir_path%20%3D%20pathlib.Path(tmpdir)%0A%20%20%20%20%20%20%20%20tmp_db_path%20%3D%20tmpdir_path%20%2F%20DB_FILENAME%0A%0A%20%20%20%20%20%20%20%20db%20%3D%20sqlite_utils.Database(tmp_db_path)%0A%0A%20%20%20%20%20%20%20%20%23%20Process%20title.basics.tsv.gz%0A%20%20%20%20%20%20%20%20titles_file%20%3D%20DATA_DIR%20%2F%20%22title.basics.tsv.gz%22%0A%0A%20%20%20%20%20%20%20%20if%20titles_file.exists()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20titles_table%20%3D%20db%5B%22titles%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20batch_count%20%3D%200%0A%20%20%20%20%20%20%20%20%20%20%20%20total_processed%20%3D%200%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20tqdm.tqdm(desc%3D%22Processing%20titles%22%2C%20unit%3D%22batch%22%2C%20leave%3DTrue)%20as%20pbar%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20for%20i%2C%20batch%20in%20enumerate(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20parse_tsv_file(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20titles_file%2C%20batch_size%3D50000%2C%20filter_year%3Dfilter_year%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20titles_table.insert_all(batch%2C%20batch_size%3D50000%2C%20truncate%3D(i%20%3D%3D%200))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20batch_count%20%2B%3D%20len(batch)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20total_processed%20%2B%3D%20len(batch)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pbar.update(1)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pbar.set_postfix(%7B%22titles%22%3A%20f%22%7Btotal_processed%3A%2C%7D%22%7D)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Total%20titles%20in%20database%3A%20%7Bbatch_count%3A%2C%7D%22)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20Create%20indexes%20for%20titles%20so%20we%20can%20query%20the%20database%20faster%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Creating%20indexes...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20titles_table.create_index(%5B%22tconst%22%5D%2C%20if_not_exists%3DTrue%2C%20unique%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20titles_table.create_index(%5B%22primaryTitle%22%5D%2C%20if_not_exists%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20titles_table.create_index(%5B%22titleType%22%5D%2C%20if_not_exists%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20titles_table.create_index(%5B%22startYear%22%5D%2C%20if_not_exists%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20titles_table.create_index(%5B%22genres%22%5D%2C%20if_not_exists%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22Created%20indexes%20for%20titles%20table%22)%0A%0A%20%20%20%20%20%20%20%20db.close()%0A%0A%20%20%20%20%20%20%20%20%23%20Copy%20the%20database%20to%20the%20volume%0A%20%20%20%20%20%20%20%20DB_PATH.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20%20%20%20%20shutil.copyfile(tmp_db_path%2C%20DB_PATH)%0A%0A%20%20%20%20print(%22Syncing%20DB%20with%20volume.%22)%0A%20%20%20%20volume.commit()%0A%20%20%20%20print(%22Volume%20changes%20committed.%22)%0A%0A`,lang:`python`});var R=c(L,2);u(R,{id:`keep-it-fresh`,children:(e,t)=>{l(),i(e,r(`Keep it fresh`))},$$slots:{default:!0}});var z=c(R,2);h(c(e(z)),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`scheduled`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,2);p(B,{code:`%40app.function(schedule%3Dmodal.Period(hours%3D24)%2C%20timeout%3D4000)%0Adef%20refresh_db()%3A%0A%20%20%20%20%22%22%22Scheduled%20function%20to%20refresh%20the%20database%20daily.%22%22%22%0A%20%20%20%20print(f%22Running%20scheduled%20refresh%20at%20%7Bdatetime.now()%7D%22)%0A%20%20%20%20download_dataset.remote(force_refresh%3DTrue)%0A%20%20%20%20prep_db.remote()%0A%0A`,lang:`python`});var V=c(B,2);u(V,{id:`web-function`,children:(e,t)=>{l(),i(e,r(`Web Function`))},$$slots:{default:!0}});var H=c(V,6);p(H,{code:`columns%20%3D%20%7B%0A%20%20%20%20%22tconst%22%3A%20%22Unique%20identifier%22%2C%0A%20%20%20%20%22titleType%22%3A%20%22Type%20(movie%2C%20tvSeries%2C%20short%2C%20etc.)%22%2C%0A%20%20%20%20%22primaryTitle%22%3A%20%22Main%20title%22%2C%0A%20%20%20%20%22originalTitle%22%3A%20%22Original%20language%20title%22%2C%0A%20%20%20%20%22startYear%22%3A%20%22Release%20year%22%2C%0A%20%20%20%20%22endYear%22%3A%20%22End%20year%20(for%20TV%20series)%22%2C%0A%20%20%20%20%22runtimeMinutes%22%3A%20%22Runtime%20in%20minutes%22%2C%0A%20%20%20%20%22genres%22%3A%20%22Comma-separated%20genres%22%2C%0A%7D%0A%0Aqueries%20%3D%20%7B%0A%20%20%20%20%22movies_2024%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22sql%22%3A%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20SELECT%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20primaryTitle%20as%20title%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20genres%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtimeMinutes%20as%20runtime%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20FROM%20titles%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20WHERE%20titleType%20%3D%20'movie'%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20startYear%20%3D%202024%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ORDER%20BY%20primaryTitle%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LIMIT%20100%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%2C%0A%20%20%20%20%20%20%20%20%22title%22%3A%20%22Movies%20Released%20in%202024%22%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20%22longest_movies%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22sql%22%3A%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20SELECT%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20primaryTitle%20as%20title%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20startYear%20as%20year%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20runtimeMinutes%20as%20runtime%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20genres%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20FROM%20titles%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20WHERE%20titleType%20%3D%20'movie'%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20runtimeMinutes%20IS%20NOT%20NULL%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20runtimeMinutes%20%3E%20180%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ORDER%20BY%20runtimeMinutes%20DESC%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LIMIT%2050%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%2C%0A%20%20%20%20%20%20%20%20%22title%22%3A%20%22Longest%20Movies%20(3%2B%20hours)%22%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20%22genre_breakdown%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22sql%22%3A%20%22%22%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20SELECT%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20genres%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20COUNT(*)%20as%20count%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20FROM%20titles%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20WHERE%20titleType%20%3D%20'movie'%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20AND%20genres%20IS%20NOT%20NULL%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20GROUP%20BY%20genres%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20ORDER%20BY%20count%20DESC%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20LIMIT%2025%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22%22%22%2C%0A%20%20%20%20%20%20%20%20%22title%22%3A%20%22Popular%20Genres%22%2C%0A%20%20%20%20%7D%2C%0A%7D%0A%0A%0Ametadata%20%3D%20%7B%0A%20%20%20%20%22title%22%3A%20%22IMDb%20Database%20Explorer%22%2C%0A%20%20%20%20%22description%22%3A%20%22Explore%20IMDb%20movie%20and%20TV%20show%20data%22%2C%0A%20%20%20%20%22databases%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22imdb%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22tables%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22titles%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22description%22%3A%20%22Basic%20information%20about%20all%20titles%20(movies%2C%20TV%20shows%2C%20etc.)%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22columns%22%3A%20columns%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22queries%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22movies_2024%22%3A%20queries%5B%22movies_2024%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22longest_movies%22%3A%20queries%5B%22longest_movies%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22genre_breakdown%22%3A%20queries%5B%22genre_breakdown%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%2C%0A%7D%0A`,lang:`python`});var U=c(H,4);p(U,{code:`%40app.function(%0A%20%20%20%20image%3Dcron_image%2C%0A%20%20%20%20volumes%3D%7BVOLUME_DIR%3A%20volume%7D%2C%0A)%0A%40modal.concurrent(max_inputs%3D16)%0A%40modal.asgi_app()%0Adef%20ui()%3A%0A%20%20%20%20%22%22%22Web%20Function%20backing%20the%20Datasette%20UI.%22%22%22%0A%20%20%20%20from%20datasette.app%20import%20Datasette%0A%0A%20%20%20%20ds%20%3D%20Datasette(%0A%20%20%20%20%20%20%20%20files%3D%5BDB_PATH%5D%2C%0A%20%20%20%20%20%20%20%20settings%3D%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22sql_time_limit_ms%22%3A%2060000%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22max_returned_rows%22%3A%2010000%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22allow_download%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22facet_time_limit_ms%22%3A%205000%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22allow_facet%22%3A%20True%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20metadata%3Dmetadata%2C%0A%20%20%20%20)%0A%20%20%20%20asyncio.run(ds.invoke_startup())%0A%20%20%20%20return%20ds.app()%0A%0A`,lang:`python`});var W=c(U,2);u(W,{id:`publishing-to-the-web`,children:(e,t)=>{l(),i(e,r(`Publishing to the web`))},$$slots:{default:!0}});var G=c(W,16);p(G,{code:`%40app.local_entrypoint()%0Adef%20run(force_refresh%3A%20bool%20%3D%20False%2C%20filter_year%3A%20int%20%3D%20None)%3A%0A%20%20%20%20if%20force_refresh%3A%0A%20%20%20%20%20%20%20%20print(%22Force%20refreshing%20the%20dataset...%22)%0A%0A%20%20%20%20if%20filter_year%3A%0A%20%20%20%20%20%20%20%20print(f%22Filtering%20data%20to%20be%20after%20%7Bfilter_year%7D%22)%0A%0A%20%20%20%20print(%22Downloading%20IMDb%20dataset...%22)%0A%20%20%20%20download_dataset.remote(force_refresh%3Dforce_refresh)%0A%20%20%20%20print(%22Processing%20data%20and%20creating%20SQLite%20DB...%22)%0A%20%20%20%20prep_db.remote(filter_year%3Dfilter_year)%0A%20%20%20%20print(%22%5CnDatabase%20ready!%20You%20can%20now%20run%3A%22)%0A%20%20%20%20print(%22%20%20modal%20serve%20cron_datasette.py%20%20%23%20For%20development%22)%0A%20%20%20%20print(%22%20%20modal%20deploy%20cron_datasette.py%20%20%23%20For%20production%20deployment%22)%0A%0A`,lang:`python`});var K=c(G,2);h(c(e(K)),{href:`https://modal-labs-examples--example-cron-datasette-ui.modal.run`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`deployed Web Function`))},$$slots:{default:!0}}),l(),n(K),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=BmYIIHsB.js.map
