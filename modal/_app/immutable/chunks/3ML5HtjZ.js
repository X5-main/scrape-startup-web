(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`917f50f3-53bb-4c78-8303-b6b9b4f7695c`,e._sentryDebugIdIdentifier=`sentry-dbid-917f50f3-53bb-4c78-8303-b6b9b4f7695c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Why you should move your ETL stack to Modal`,description:`Easily develop and deploy custom ETL jobs while saving 99% on sync costs.`,authors:[{name:`Kenny Ning`,avatarUrl:`https://modal-cdn.com/kenny-ning.jpg`,jobTitle:`Data Engineer`,twitterHandle:`kenny_ning`}],date:`2024-04-18T12:00:00.000Z`,length:`7 minute read`,category:`Tutorials`,published:!0,layout:`blog`,toc:[{depth:2,value:`Example 1: Copy 12m ClickHouse rows to Snowflake at .01% of the cost of Fivetran`,id:`example-1-copy-12m-clickhouse-rows-to-snowflake-at-01-of-the-cost-of-fivetran`},{depth:2,value:`Example 2: Enrich user data with the Github API`,id:`example-2-enrich-user-data-with-the-github-api`},{depth:2,value:`Conclusion (when to not use Modal for ETL)`,id:`conclusion-when-to-not-use-modal-for-etl`},{depth:2,value:`More examples`,id:`more-examples`}],rawContent:`![ETL diagram](https://modal-cdn.com/cdnbot/etl-diagram.jpg)

ETL (Extract, Transform, Load) is the process of moving data from point A to
point B.

Most commonly, ETL means moving data from some **source system** (e.g. a
production database, Slack API) into an analytical **data warehouse** (e.g.
Snowflake) where the data is easier to combine and analyze. Most data teams use
a vendor like Fivetran or an orchestration platform like Airflow to do this.

Modal is a great solution for ETL if you are primarily looking for:

- **Cost savings on large-scale data transfers.** Modal's usage-based pricing
  means you pay for how much compute you use and not how many rows you sync,
  making it a far more cost-effective option for moving large amounts of data
- **An** **easy and flexible platform for custom code.** Orchestration platforms
  like Airflow are notoriously difficult to set up and are often overkill for
  95% of data jobs that call for a simple cron-like scheduling pattern. Modal is
  the easiest way to get those kinds of custom ETL jobs running.

In this post, I'll walk through two examples inspired by how we do our internal
analytics that clearly show the cost and flexibility advantages of using Modal
for ETL.

## Example 1: Copy 12m ClickHouse rows to Snowflake at .01% of the cost of Fivetran

We use ClickHouse to serve metrics on resource usage and run time for our
customers' jobs. We'd like to move this data into Snowflake so that we can
combine this data with other information we have on our customers and answer
questions like “what is the conversion from a Modal workspace creation to using
1 hour of compute?”.

First, we extract from ClickHouse using their native
[Python connector](https://clickhouse.com/docs/en/integrations/python#querying-data-with-clickhouse-connect--advanced-usage):

\`\`\`python
def extract_from_clickhouse(date):
    import clickhouse_connect

    query = f"""
        select
            timestamp_minute,
            workspace_id,
            billing_type,
            cpu_ns / 3600e9 as cpu_hr,
            mem_ns / 3600e9 as mem_hr,
            gpu_ns / 3600e9 as gpu_hr
        from metrics
        prewhere toDate(timestamp_minute) == '{date}'
    """

    client = clickhouse_connect.get_client(
        host=os.environ["CLICKHOUSE_HOST"]
        port=os.environ["CLICHOUSE_PORT"]
        username="default",
        password=os.environ["CLICKHOUSE_PASSWORD"],
        secure=True,
    )
    result = client.query(query)
    print(f"Fetched clickhouse data for {date}")
    return result.result_rows
\`\`\`

This returns the query results as a list of tuples, where each tuple is a row.
Then we batch load the results into Snowflake:

\`\`\`python
def load_to_snowflake(data: list[tuple], date):
    target_table = 'USAGE_BY_MINUTE'
    batch_size = 10000
    insert_sql = f"""
    insert into CLICKHOUSE.{target_table} (timestamp_minute, workspace_id, billing_type, cpu_hr, mem_hr, gpu_hr, inserted_at)
    values (%s, %s, %s, %s, %s, %s, current_timestamp())
    """
    for i in range(0, len(data), batch_size):
        batch = data[i : i + batch_size]
        print(f"Loading batch {date}:{i}-{i+batch_size}")
        cursor.executemany(insert_sql, batch)
        conn.commit()

    # Close the cursor and connection
    cursor.close()
    conn.close()

    print(f"Data inserted successfully.")
\`\`\`

Here we are using Snowflake's
[executemany](https://community.snowflake.com/s/article/How-To-Insert-JSON-data-using-Executemany-in-Python)
function, which batch inserts 10,000 rows at a time. We set the batch size to
10,000 because Snowflake's insert statement has a limit of
[16,384 rows](https://docs.snowflake.com/en/sql-reference/sql/insert#usage-notes)
in a single call.

Now, we add some Modal 🪄magic🪄:

\`\`\`python
@app.function(
    secrets=[
        modal.Secret.from_name("snowflake-secret"),
        modal.Secret.from_name("clickhouse-prod")
    ],
    timeout=3000
)
def run_etl(date):
    results = extract_from_clickhouse(date)
    load_to_snowflake(results, date)

@app.local_entrypoint()
def main():
    dates = [
        '2024-04-07',
        '2024-04-08',
        '2024-04-09',
        '2024-04-10',
        '2024-04-11'
    ]
    run_etl.for_each(dates)
\`\`\`

We use \`@app.function\` to execute \`run_etl\` in the cloud with the following
parameters:

- Database credentials as environment variables via
  [Secrets](https://modal.com/docs/guide/secrets)
- A [timeout](https://modal.com/docs/guide/timeouts#timeouts) of 50 minutes
  (default is 5 minutes)

In \`main()\`, we kick off 5 \`run_etl\` jobs in parallel by date using
[for_each](https://modal.com/docs/reference/modal.Function#for_each) to greatly
speed up processing time.

Here are the statistics of an example run:

![ETL example metrics](https://modal-cdn.com/cdnbot/etl-example-metrics.png)

This job copied 12m rows from Clickhouse to Snowflake in 16 minutes using:

- **5 CPUs**: at $0.192 / CPU hour that comes out to $0.26
- **4.4 GiB** of memory: at $0.024 / GiB per hour that comes out to $0.03

Even if Fivetran had a ClickHouse connector
([it doesn't](https://www.fivetran.com/connectors?q=clickhouse&noresults=true)
at the time of this writing), syncing 12m rows would
[cost ~$3300](https://www.fivetran.com/pricing). The total cost of this Modal
job is **$0.29** (0.01% of Fivetran).

You could argue that the Modal job costs more in developer time compared to an
ETL vendor. In my opinion (and hopefully yours too after reading the code
snippets!), this example was quite simple; I'd estimate an analytics engineer
could write this in less than a day and spend at most a few hours a month
maintaining it.

And this is where the real cost savings come in: by making your engineers more
productive. In this next example, we'll show how easy it is to write your own
custom data jobs on Modal.

## Example 2: Enrich user data with the Github API

Most of our customers first sign up using their username. However, we also want
to know what company they work for so we can see if they would be interested in
our [Team or Enterprise tier](https://modal.com/pricing). One way to get that
information is from a user's Github profile:

![ETL Github screenshot](https://modal-cdn.com/cdnbot/etl-github-screenshot.png)

<modal-img-caption>
  The only thing we know about the ComfyUI creator...
</modal-img-caption>

First, we extract some user ids and associated Github usernames from our data
warehouse:

\`\`\`python
def get_usernames():
    import snowflake.connector
    conn = snowflake.connector.connect(
        user="snowflake_user",
        password=os.environ["SNOWFLAKE_PASSWORD"],
        account=os.environ["SNOWFLAKE_ACCOUNT"],
    )
    cursor = conn.cursor()
    q = """
    select
        id,
        github_username

    from user

    where github_username is not null
    """
    cursor.execute(q)
    df = cursor.fetch_pandas_all()
    print(f"Got {df.shape[0]} rows.")
    cursor.close()
    conn.close()
    return df
\`\`\`

Then, we write a function to query the
[Github API](https://github.com/PyGithub/PyGithub) for a user's company:

\`\`\`python
def get_company(user):
    from github import Auth, Github, GithubException

    auth = Auth.Token(os.environ['PAT'])

    g = Github(auth=auth)

    try:
        user = g.get_user(user)
    except GithubException:
        print(f"Request for {user} failed, skipping.")
        return None

    return user.company
\`\`\`

Finally, we apply that function on our user data to get an enriched dataset with
a user's Github-listed company. To query the Github API, first create a
[personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
and add it to Modal as a Secret:

\`\`\`python
def get_user_companies(df):
    print("Querying Github API...")
    df['company'] = df['GITHUB_USERNAME'].apply(get_company)
    return df

@app.function(
    secrets=[
        modal.Secret.from_name("kenny-github-secret"),
        modal.Secret.from_name("snowflake-secret")
    ],
)
def main():
    users_df = get_usernames()
    enriched_df = get_user_companies(users_df)
    print(enriched_df.head())
\`\`\`

Running this script gives us:

\`\`\`python
Got 100 rows.
Querying Github API...
Request for xxxx failed, skipping.
       ID GITHUB_USERNAME          company
0  us-abc        xxxxxxxx  Duke University
1  us-def      xxxxxxxxxx             None
2  us-ghi         xxxxxxx             None
3  us-jkl    xxxxxxxxxxxx             None
4  us-mno       xxxxxxxxx             None
\`\`\`

Looks like we need to schedule some college tours, starting with Duke 🔵😈

Let's say you want to schedule this to run every day. This is as simple as
attaching a [Period](https://modal.com/docs/reference/modal.Period) or
[Cron](https://modal.com/docs/reference/modal.Cron) argument into
\`@app.function\`:

\`\`\`python
@app.function(
    secrets=[
        modal.Secret.from_name("kenny-github-secret"),
        modal.Secret.from_name("snowflake-secret")
    ],
    # run this cloud function every day at 6am UTC
    schedule=modal.Cron("0 6 * * *")
)
\`\`\`

The ETL vendors want you to be afraid of writing custom code, but hopefully this
example shows you how easy it is to add your own custom logic to make simple,
yet powerful data enrichments.

## Conclusion (when to not use Modal for ETL)

Traditional ETL solutions are still quite powerful when it comes to:

- **Common connectors with small-medium data volumes**: we still have a lot of
  respect for companies like Fivetran, who have really nailed the user
  experience for the most common ETL use cases, like syncing Zendesk tickets or
  a production Postgres read replica into Snowflake. The only criticism we have
  is the pricing model, especially for larger data volumes.
- **Long-running, business-critical, multi-stage pipelines**: this is where you
  will get the value from an orchestration platform like Airflow e.g. function
  caching, partial retries, granular observability metrics. For what it's worth,
  Modal is also actively thinking about how to address some of these use cases
  better.

The data community is going through a sea change, where people are realizing
that writing custom code is actually an **asset** and not a cost. It reduces
your risk of vendor lock-in, expands your universe of data solutions, and is
orders of magnitude cheaper. Powered by Modal, your ETL process can finally
unlock the flexibility, speed, and cost savings necessary in the new modern data
era.

## More examples

Check out these other Modal examples for common data and analytics use cases:

- [Deploying a dbt project](https://github.com/modal-labs/modal-examples/blob/main/10_integrations/dbt/dbt_duckdb.py)
  that transforms S3 data using the duckdb adapter
- [Hosting Streamlit apps](https://modal.com/docs/examples/serve_streamlit)
- [Sending daily reports to Google Sheets](https://modal.com/docs/examples/db_to_sheet)
`,meta:{description:`Easily develop and deploy custom ETL jobs while saving 99% on sync costs.`}},{title:h,description:g,authors:_,date:v,length:y,category:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=m,E=t(`<p><!></p> <p>ETL (Extract, Transform, Load) is the process of moving data from point A to
point B.</p> <p>Most commonly, ETL means moving data from some <strong>source system</strong> (e.g. a
production database, Slack API) into an analytical <strong>data warehouse</strong> (e.g.
Snowflake) where the data is easier to combine and analyze. Most data teams use
a vendor like Fivetran or an orchestration platform like Airflow to do this.</p> <p>Modal is a great solution for ETL if you are primarily looking for:</p> <ul><li><strong>Cost savings on large-scale data transfers.</strong> Modal’s usage-based pricing
means you pay for how much compute you use and not how many rows you sync,
making it a far more cost-effective option for moving large amounts of data</li> <li><strong>An</strong> <strong>easy and flexible platform for custom code.</strong> Orchestration platforms
like Airflow are notoriously difficult to set up and are often overkill for
95% of data jobs that call for a simple cron-like scheduling pattern. Modal is
the easiest way to get those kinds of custom ETL jobs running.</li></ul> <p>In this post, I’ll walk through two examples inspired by how we do our internal
analytics that clearly show the cost and flexibility advantages of using Modal
for ETL.</p> <h2 id="example-1-copy-12m-clickhouse-rows-to-snowflake-at-01-of-the-cost-of-fivetran">Example 1: Copy 12m ClickHouse rows to Snowflake at .01% of the cost of Fivetran</h2> <p>We use ClickHouse to serve metrics on resource usage and run time for our
customers’ jobs. We’d like to move this data into Snowflake so that we can
combine this data with other information we have on our customers and answer
questions like “what is the conversion from a Modal workspace creation to using
1 hour of compute?”.</p> <p>First, we extract from ClickHouse using their native <!>:</p> <!> <p>This returns the query results as a list of tuples, where each tuple is a row.
Then we batch load the results into Snowflake:</p> <!> <p>Here we are using Snowflake’s <!> function, which batch inserts 10,000 rows at a time. We set the batch size to
10,000 because Snowflake’s insert statement has a limit of <!> in a single call.</p> <p>Now, we add some Modal 🪄magic🪄:</p> <!> <p>We use <code>@app.function</code> to execute <code>run_etl</code> in the cloud with the following
parameters:</p> <ul><li>Database credentials as environment variables via <!></li> <li>A <!> of 50 minutes
(default is 5 minutes)</li></ul> <p>In <code>main()</code>, we kick off 5 <code>run_etl</code> jobs in parallel by date using <!> to greatly
speed up processing time.</p> <p>Here are the statistics of an example run:</p> <p><!></p> <p>This job copied 12m rows from Clickhouse to Snowflake in 16 minutes using:</p> <ul><li><strong>5 CPUs</strong>: at $0.192 / CPU hour that comes out to $0.26</li> <li><strong>4.4 GiB</strong> of memory: at $0.024 / GiB per hour that comes out to $0.03</li></ul> <p>Even if Fivetran had a ClickHouse connector
(<!> at the time of this writing), syncing 12m rows would <!>. The total cost of this Modal
job is <strong>$0.29</strong> (0.01% of Fivetran).</p> <p>You could argue that the Modal job costs more in developer time compared to an
ETL vendor. In my opinion (and hopefully yours too after reading the code
snippets!), this example was quite simple; I’d estimate an analytics engineer
could write this in less than a day and spend at most a few hours a month
maintaining it.</p> <p>And this is where the real cost savings come in: by making your engineers more
productive. In this next example, we’ll show how easy it is to write your own
custom data jobs on Modal.</p> <h2 id="example-2-enrich-user-data-with-the-github-api">Example 2: Enrich user data with the Github API</h2> <p>Most of our customers first sign up using their username. However, we also want
to know what company they work for so we can see if they would be interested in
our <!>. One way to get that
information is from a user’s Github profile:</p> <p><!></p> <modal-img-caption>The only thing we know about the ComfyUI creator...</modal-img-caption> <p>First, we extract some user ids and associated Github usernames from our data
warehouse:</p> <!> <p>Then, we write a function to query the <!> for a user’s company:</p> <!> <p>Finally, we apply that function on our user data to get an enriched dataset with
a user’s Github-listed company. To query the Github API, first create a <!> and add it to Modal as a Secret:</p> <!> <p>Running this script gives us:</p> <!> <p>Looks like we need to schedule some college tours, starting with Duke 🔵😈</p> <p>Let’s say you want to schedule this to run every day. This is as simple as
attaching a <!> or <!> argument into <code>@app.function</code>:</p> <!> <p>The ETL vendors want you to be afraid of writing custom code, but hopefully this
example shows you how easy it is to add your own custom logic to make simple,
yet powerful data enrichments.</p> <h2 id="conclusion-when-to-not-use-modal-for-etl">Conclusion (when to not use Modal for ETL)</h2> <p>Traditional ETL solutions are still quite powerful when it comes to:</p> <ul><li><strong>Common connectors with small-medium data volumes</strong>: we still have a lot of
respect for companies like Fivetran, who have really nailed the user
experience for the most common ETL use cases, like syncing Zendesk tickets or
a production Postgres read replica into Snowflake. The only criticism we have
is the pricing model, especially for larger data volumes.</li> <li><strong>Long-running, business-critical, multi-stage pipelines</strong>: this is where you
will get the value from an orchestration platform like Airflow e.g. function
caching, partial retries, granular observability metrics. For what it’s worth,
Modal is also actively thinking about how to address some of these use cases
better.</li></ul> <p>The data community is going through a sea change, where people are realizing
that writing custom code is actually an <strong>asset</strong> and not a cost. It reduces
your risk of vendor lock-in, expands your universe of data solutions, and is
orders of magnitude cheaper. Powered by Modal, your ETL process can finally
unlock the flexibility, speed, and cost savings necessary in the new modern data
era.</p> <h2 id="more-examples">More examples</h2> <p>Check out these other Modal examples for common data and analytics use cases:</p> <ul><li><!> that transforms S3 data using the duckdb adapter</li> <li><!></li> <li><!></li></ul>`,3);function D(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=E(),p=s(o);u(e(p),{src:`https://modal-cdn.com/cdnbot/etl-diagram.jpg`,alt:`ETL diagram`}),n(p);var m=c(p,16);f(c(e(m)),{href:`https://clickhouse.com/docs/en/integrations/python#querying-data-with-clickhouse-connect--advanced-usage`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Python connector`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);d(h,{code:`def%20extract_from_clickhouse(date)%3A%0A%20%20%20%20import%20clickhouse_connect%0A%0A%20%20%20%20query%20%3D%20f%22%22%22%0A%20%20%20%20%20%20%20%20select%0A%20%20%20%20%20%20%20%20%20%20%20%20timestamp_minute%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20workspace_id%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20billing_type%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20cpu_ns%20%2F%203600e9%20as%20cpu_hr%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20mem_ns%20%2F%203600e9%20as%20mem_hr%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20gpu_ns%20%2F%203600e9%20as%20gpu_hr%0A%20%20%20%20%20%20%20%20from%20metrics%0A%20%20%20%20%20%20%20%20prewhere%20toDate(timestamp_minute)%20%3D%3D%20'%7Bdate%7D'%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20client%20%3D%20clickhouse_connect.get_client(%0A%20%20%20%20%20%20%20%20host%3Dos.environ%5B%22CLICKHOUSE_HOST%22%5D%0A%20%20%20%20%20%20%20%20port%3Dos.environ%5B%22CLICHOUSE_PORT%22%5D%0A%20%20%20%20%20%20%20%20username%3D%22default%22%2C%0A%20%20%20%20%20%20%20%20password%3Dos.environ%5B%22CLICKHOUSE_PASSWORD%22%5D%2C%0A%20%20%20%20%20%20%20%20secure%3DTrue%2C%0A%20%20%20%20)%0A%20%20%20%20result%20%3D%20client.query(query)%0A%20%20%20%20print(f%22Fetched%20clickhouse%20data%20for%20%7Bdate%7D%22)%0A%20%20%20%20return%20result.result_rows`,lang:`python`});var g=c(h,4);d(g,{code:`def%20load_to_snowflake(data%3A%20list%5Btuple%5D%2C%20date)%3A%0A%20%20%20%20target_table%20%3D%20'USAGE_BY_MINUTE'%0A%20%20%20%20batch_size%20%3D%2010000%0A%20%20%20%20insert_sql%20%3D%20f%22%22%22%0A%20%20%20%20insert%20into%20CLICKHOUSE.%7Btarget_table%7D%20(timestamp_minute%2C%20workspace_id%2C%20billing_type%2C%20cpu_hr%2C%20mem_hr%2C%20gpu_hr%2C%20inserted_at)%0A%20%20%20%20values%20(%25s%2C%20%25s%2C%20%25s%2C%20%25s%2C%20%25s%2C%20%25s%2C%20current_timestamp())%0A%20%20%20%20%22%22%22%0A%20%20%20%20for%20i%20in%20range(0%2C%20len(data)%2C%20batch_size)%3A%0A%20%20%20%20%20%20%20%20batch%20%3D%20data%5Bi%20%3A%20i%20%2B%20batch_size%5D%0A%20%20%20%20%20%20%20%20print(f%22Loading%20batch%20%7Bdate%7D%3A%7Bi%7D-%7Bi%2Bbatch_size%7D%22)%0A%20%20%20%20%20%20%20%20cursor.executemany(insert_sql%2C%20batch)%0A%20%20%20%20%20%20%20%20conn.commit()%0A%0A%20%20%20%20%23%20Close%20the%20cursor%20and%20connection%0A%20%20%20%20cursor.close()%0A%20%20%20%20conn.close()%0A%0A%20%20%20%20print(f%22Data%20inserted%20successfully.%22)`,lang:`python`});var _=c(g,2),v=c(e(_));f(v,{href:`https://community.snowflake.com/s/article/How-To-Insert-JSON-data-using-Executemany-in-Python`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`executemany`))},$$slots:{default:!0}}),f(c(v,2),{href:`https://docs.snowflake.com/en/sql-reference/sql/insert#usage-notes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`16,384 rows`))},$$slots:{default:!0}}),l(),n(_);var y=c(_,4);d(y,{code:`%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22snowflake-secret%22)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22clickhouse-prod%22)%0A%20%20%20%20%5D%2C%0A%20%20%20%20timeout%3D3000%0A)%0Adef%20run_etl(date)%3A%0A%20%20%20%20results%20%3D%20extract_from_clickhouse(date)%0A%20%20%20%20load_to_snowflake(results%2C%20date)%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20dates%20%3D%20%5B%0A%20%20%20%20%20%20%20%20'2024-04-07'%2C%0A%20%20%20%20%20%20%20%20'2024-04-08'%2C%0A%20%20%20%20%20%20%20%20'2024-04-09'%2C%0A%20%20%20%20%20%20%20%20'2024-04-10'%2C%0A%20%20%20%20%20%20%20%20'2024-04-11'%0A%20%20%20%20%5D%0A%20%20%20%20run_etl.for_each(dates)`,lang:`python`});var b=c(y,4),x=e(b);f(c(e(x)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}}),n(x);var S=c(x,2);f(c(e(S)),{href:`https://modal.com/docs/guide/timeouts#timeouts`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`timeout`))},$$slots:{default:!0}}),l(),n(S),n(b);var C=c(b,2);f(c(e(C),5),{href:`https://modal.com/docs/reference/modal.Function#for_each`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`for_each`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,4);u(e(w),{src:`https://modal-cdn.com/cdnbot/etl-example-metrics.png`,alt:`ETL example metrics`}),n(w);var T=c(w,6),D=c(e(T));f(D,{href:`https://www.fivetran.com/connectors?q=clickhouse&noresults=true`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`it doesn’t`))},$$slots:{default:!0}}),f(c(D,2),{href:`https://www.fivetran.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`cost ~$3300`))},$$slots:{default:!0}}),l(3),n(T);var O=c(T,8);f(c(e(O)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Team or Enterprise tier`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);u(e(k),{src:`https://modal-cdn.com/cdnbot/etl-github-screenshot.png`,alt:`ETL Github screenshot`}),n(k);var A=c(c(k,2),4);d(A,{code:`def%20get_usernames()%3A%0A%20%20%20%20import%20snowflake.connector%0A%20%20%20%20conn%20%3D%20snowflake.connector.connect(%0A%20%20%20%20%20%20%20%20user%3D%22snowflake_user%22%2C%0A%20%20%20%20%20%20%20%20password%3Dos.environ%5B%22SNOWFLAKE_PASSWORD%22%5D%2C%0A%20%20%20%20%20%20%20%20account%3Dos.environ%5B%22SNOWFLAKE_ACCOUNT%22%5D%2C%0A%20%20%20%20)%0A%20%20%20%20cursor%20%3D%20conn.cursor()%0A%20%20%20%20q%20%3D%20%22%22%22%0A%20%20%20%20select%0A%20%20%20%20%20%20%20%20id%2C%0A%20%20%20%20%20%20%20%20github_username%0A%0A%20%20%20%20from%20user%0A%0A%20%20%20%20where%20github_username%20is%20not%20null%0A%20%20%20%20%22%22%22%0A%20%20%20%20cursor.execute(q)%0A%20%20%20%20df%20%3D%20cursor.fetch_pandas_all()%0A%20%20%20%20print(f%22Got%20%7Bdf.shape%5B0%5D%7D%20rows.%22)%0A%20%20%20%20cursor.close()%0A%20%20%20%20conn.close()%0A%20%20%20%20return%20df`,lang:`python`});var j=c(A,2);f(c(e(j)),{href:`https://github.com/PyGithub/PyGithub`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Github API`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);d(M,{code:`def%20get_company(user)%3A%0A%20%20%20%20from%20github%20import%20Auth%2C%20Github%2C%20GithubException%0A%0A%20%20%20%20auth%20%3D%20Auth.Token(os.environ%5B'PAT'%5D)%0A%0A%20%20%20%20g%20%3D%20Github(auth%3Dauth)%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20user%20%3D%20g.get_user(user)%0A%20%20%20%20except%20GithubException%3A%0A%20%20%20%20%20%20%20%20print(f%22Request%20for%20%7Buser%7D%20failed%2C%20skipping.%22)%0A%20%20%20%20%20%20%20%20return%20None%0A%0A%20%20%20%20return%20user.company`,lang:`python`});var N=c(M,2);f(c(e(N)),{href:`https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`personal access token`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);d(P,{code:`def%20get_user_companies(df)%3A%0A%20%20%20%20print(%22Querying%20Github%20API...%22)%0A%20%20%20%20df%5B'company'%5D%20%3D%20df%5B'GITHUB_USERNAME'%5D.apply(get_company)%0A%20%20%20%20return%20df%0A%0A%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22kenny-github-secret%22)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22snowflake-secret%22)%0A%20%20%20%20%5D%2C%0A)%0Adef%20main()%3A%0A%20%20%20%20users_df%20%3D%20get_usernames()%0A%20%20%20%20enriched_df%20%3D%20get_user_companies(users_df)%0A%20%20%20%20print(enriched_df.head())`,lang:`python`});var F=c(P,4);d(F,{code:`Got%20100%20rows.%0AQuerying%20Github%20API...%0ARequest%20for%20xxxx%20failed%2C%20skipping.%0A%20%20%20%20%20%20%20ID%20GITHUB_USERNAME%20%20%20%20%20%20%20%20%20%20company%0A0%20%20us-abc%20%20%20%20%20%20%20%20xxxxxxxx%20%20Duke%20University%0A1%20%20us-def%20%20%20%20%20%20xxxxxxxxxx%20%20%20%20%20%20%20%20%20%20%20%20%20None%0A2%20%20us-ghi%20%20%20%20%20%20%20%20%20xxxxxxx%20%20%20%20%20%20%20%20%20%20%20%20%20None%0A3%20%20us-jkl%20%20%20%20xxxxxxxxxxxx%20%20%20%20%20%20%20%20%20%20%20%20%20None%0A4%20%20us-mno%20%20%20%20%20%20%20xxxxxxxxx%20%20%20%20%20%20%20%20%20%20%20%20%20None`,lang:`python`});var I=c(F,4),L=c(e(I));f(L,{href:`https://modal.com/docs/reference/modal.Period`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Period`))},$$slots:{default:!0}}),f(c(L,2),{href:`https://modal.com/docs/reference/modal.Cron`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cron`))},$$slots:{default:!0}}),l(3),n(I);var R=c(I,2);d(R,{code:`%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22kenny-github-secret%22)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22snowflake-secret%22)%0A%20%20%20%20%5D%2C%0A%20%20%20%20%23%20run%20this%20cloud%20function%20every%20day%20at%206am%20UTC%0A%20%20%20%20schedule%3Dmodal.Cron(%220%206%20*%20*%20*%22)%0A)`,lang:`python`});var z=c(R,16),B=e(z);f(e(B),{href:`https://github.com/modal-labs/modal-examples/blob/main/10_integrations/dbt/dbt_duckdb.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Deploying a dbt project`))},$$slots:{default:!0}}),l(),n(B);var V=c(B,2);f(e(V),{href:`https://modal.com/docs/examples/serve_streamlit`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hosting Streamlit apps`))},$$slots:{default:!0}}),n(V);var H=c(V,2);f(e(H),{href:`https://modal.com/docs/examples/db_to_sheet`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sending daily reports to Google Sheets`))},$$slots:{default:!0}}),n(H),n(z),i(t,o)},$$slots:{default:!0}}))}export{D as default,m as metadata};
//# sourceMappingURL=3ML5HtjZ.js.map
