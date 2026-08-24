(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2531906b-43df-436d-a0f3-0faed4f8e264`,e._sentryDebugIdIdentifier=`sentry-dbid-2531906b-43df-436d-a0f3-0faed4f8e264`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Write to Google Sheets from Postgres`,id:`write-to-google-sheets-from-postgres`,children:[{depth:2,value:`Entering credentials`,id:`entering-credentials`,children:[{depth:3,value:`Database`,id:`database`},{depth:3,value:`Google Sheets/GCP`,id:`google-sheetsgcp`}]},{depth:2,value:`Applying Python logic`,id:`applying-python-logic`},{depth:2,value:`Sending output to a Google Sheet`,id:`sending-output-to-a-google-sheet`}]}],rawContent:`# Write to Google Sheets from Postgres

In this tutorial, we'll show how to use Modal to schedule a daily report in a spreadsheet on Google Sheets
that combines data from a PostgreSQL database with data from an external API.

In particular, we'll extract the city of each user from the database, look up the current weather in that city,
and then build a count/histogram of how many users are experiencing each type of weather.

## Entering credentials

We begin by setting up some credentials that we'll need in order to access our database and output
spreadsheet. To do that in a secure manner, we log in to our Modal account on the web and go to
the [Secrets](https://modal.com/secrets) section.

### Database

First we will enter our database credentials. The easiest way to do this is to click **New
secret** and select the **Postgres compatible** Secret preset and fill in the requested
information. Then we press **Next** and name our Secret \`postgres-secret\` and click **Create**.

### Google Sheets/GCP

We'll now add another Secret for Google Sheets access through Google Cloud Platform. Click **New
secret** and select the Google Sheets preset.

In order to access the Google Sheets API, we'll need to create a *Service Account* in Google Cloud
Platform. You can skip this step if you already have a Service Account json file.

1. Sign up to Google Cloud Platform or log in if you haven't
   ([https://cloud.google.com/](https://cloud.google.com/)).

2. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/).

3. In the navigation pane on the left, go to **IAM & Admin** > **Service Accounts**.

4. Click the **+ CREATE SERVICE ACCOUNT** button.

5. Give the service account a suitable name, like "sheet-access-bot". Click **Done**. You don't
   have to grant it any specific access privileges at this time.

6. Click your new service account in the list view that appears and navigate to the **Keys**
   section.

7. Click **Add key** and choose **Create new key**. Use the **JSON** key type and confirm by
   clicking **Create**.

8. A json key file should be downloaded to your computer at this point. Copy the contents of that
   file and use it as the value for the \`SERVICE_ACCOUNT_JSON\` field in your new secret.

We'll name this other Secret \`"gsheets-secret"\`.

Now you can access the values of your Secrets from Modal Functions that you annotate with the
corresponding \`modal.Secret\`s, e.g.:

\`\`\`python
import os

import modal

app = modal.App("example-db-to-sheet")


@app.function(secrets=[modal.Secret.from_name("postgres-secret")])
def show_host():
    # automatically filled from the specified secret
    print("Host is " + os.environ["PGHOST"])


\`\`\`

Because these Secrets are Python objects, you can construct and manipulate them in your code.
We'll do that below by defining a variable to hold our Secret for accessing Postgres

You can additionally specify

\`\`\`python
pg_secret = modal.Secret.from_name(
    "postgres-secret",
    required_keys=["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"],
)


\`\`\`

In order to connect to the database, we'll use the \`psycopg2\` Python package. To make it available
to your Modal Function you need to supply it with an \`image\` argument that tells Modal how to
build the container image that contains that package. We'll base it off of the \`Image.debian_slim\` base
image that's built into Modal, and make sure to install the required binary packages as well as
the \`psycopg2\` package itself:

\`\`\`python
pg_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libpq-dev")
    .uv_pip_install("psycopg2~=2.9.9")
)

\`\`\`

Since the default keynames for a **Postgres compatible** secret correspond to the environment
variables that \`psycopg2\` looks for, we can now easily connect to the database even without
explicit credentials in your code. We'll create a simple function that queries the city for each
user in the \`users\` table.

\`\`\`python
@app.function(image=pg_image, secrets=[pg_secret])
def get_db_rows(verbose=True):
    import psycopg2

    conn = psycopg2.connect()  # no explicit credentials needed
    cur = conn.cursor()
    cur.execute("SELECT city FROM users")
    results = [row[0] for row in cur.fetchall()]
    if verbose:
        print(results)
    return results


\`\`\`

Note that we import \`psycopg2\` inside our function instead of the global scope. This allows us to
run this Modal Function even from an environment where \`psycopg2\` is not installed. We can test run
this function using the \`modal run\` shell command: \`modal run db_to_sheet.py::app.get_db_rows\`.

To run this function, make sure there is a table called \`users\` in your database with a column called \`city\`.
You can populate the table with some example data using the following SQL commands:

\`\`\`sql
CREATE TABLE users (city TEXT);
INSERT INTO users VALUES ('Stockholm,,Sweden');
INSERT INTO users VALUES ('New York,NY,USA');
INSERT INTO users VALUES ('Tokyo,,Japan');
\`\`\`

## Applying Python logic

For each row in our source data we'll run an online lookup of the current weather using the
[http://openweathermap.org](http://openweathermap.org) API. To do this, we'll add the API key to
another Modal Secret. We'll use a custom secret called "weather-secret" with the key
\`OPENWEATHER_API_KEY\` containing our API key for OpenWeatherMap.

\`\`\`python
requests_image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "requests~=2.31.0"
)


@app.function(
    image=requests_image,
    secrets=[
        modal.Secret.from_name("weather-secret", required_keys=["OPENWEATHER_API_KEY"])
    ],
)
def city_weather(city):
    import requests

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": os.environ["OPENWEATHER_API_KEY"]}
    response = requests.get(url, params=params)
    weather_label = response.json()["weather"][0]["main"]
    return weather_label


\`\`\`

We'll make use of Modal's built-in \`function.map\` method to create our report. \`function.map\`
makes it really easy to parallelize work by executing a Function on every element in a sequence of
data. For this example we'll just do a simple count of rows per weather type --
answering the question "how many of our users are experiencing each type of weather?".

\`\`\`python
from collections import Counter


@app.function()
def create_report(cities):
    # run city_weather for each city in parallel
    user_weather = city_weather.map(cities)
    count_users_by_weather = Counter(user_weather).items()
    return count_users_by_weather


\`\`\`

Let's try to run this! To make it simple to trigger the function with some
predefined input data, we create a "local entrypoint" that can be
run from the command line with

\`\`\`bash
modal run db_to_sheet.py
\`\`\`

\`\`\`python
@app.local_entrypoint()
def main():
    cities = [
        "Stockholm,,Sweden",
        "New York,NY,USA",
        "Tokyo,,Japan",
    ]
    print(create_report.remote(cities))


\`\`\`

Running the local entrypoint using \`modal run db_to_sheet.py\` should print something like:
\`dict_items([('Clouds', 3)])\`.
Note that since this file only has a single app, and the app has only one local entrypoint
we only have to specify the file to run it - the function/entrypoint is inferred.

In this case the logic is quite simple, but in a real world context you could have applied a
machine learning model or any other tool you could build into a container to transform the data.

## Sending output to a Google Sheet

We'll set up a new Google Sheet to send our report to. Using the "Sharing" dialog in Google
Sheets, share the document to the service account's email address (the value of the \`client_email\` field in the json file)
and make the service account an editor of the document.

You may also need to enable the Google Sheets API for your project in the Google Cloud Platform console.
If so, the URL will be printed inside the message of a 403 Forbidden error when you run the function.
It begins with https://console.developers.google.com/apis/api/sheets.googleapis.com/overview.

Lastly, we need to point our code to the correct Google Sheet. We'll need the *key* of the document.
You can find the key in the URL of the Google Sheet. It appears after the \`/d/\` in the URL, like:
\`https://docs.google.com/spreadsheets/d/1wOktal......IJR77jD8Do\`.

We'll make use of the \`pygsheets\` python package to authenticate with
Google Sheets and then update the spreadsheet with information from the report we just created:

\`\`\`python
pygsheets_image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "pygsheets~=2.0.6"
)


@app.function(
    image=pygsheets_image,
    secrets=[
        modal.Secret.from_name("gsheets-secret", required_keys=["SERVICE_ACCOUNT_JSON"])
    ],
)
def update_sheet_report(rows):
    import pygsheets

    gc = pygsheets.authorize(service_account_env_var="SERVICE_ACCOUNT_JSON")
    document_key = "1JxhGsht4wltyPFFOd2hP0eIv6lxZ5pVxJN_ZwNT-l3c"
    sh = gc.open_by_key(document_key)
    worksheet = sh.sheet1
    worksheet.clear("A2")

    worksheet.update_values("A2", [list(row) for row in rows])


\`\`\`

At this point, we have everything we need in order to run the full program. We can put it all together in
another Modal Function, and add a [\`schedule\`](https://modal.com/docs/guide/cron) argument so it runs every day automatically:

\`\`\`python
@app.function(schedule=modal.Period(days=1))
def db_to_sheet():
    rows = get_db_rows.remote()
    report = create_report.remote(rows)
    update_sheet_report.remote(report)
    print("Updated sheet with new weather distribution")
    for weather, count in report:
        print(f"{weather}: {count}")


\`\`\`

This entire app can now be deployed using \`modal deploy db_to_sheet.py\`. The [apps page](https://modal.com/apps)
shows our cron job's execution history and lets you navigate to each invocation's logs.
To trigger a manual run from your local code during development, you can also trigger this function using the cli:
\`modal run db_to_sheet.py::db_to_sheet\`

Note that all of the \`@app.function()\` annotated functions above run remotely in isolated containers that are specified per
function, but they are called as seamlessly as if we were using regular Python functions. This is a simple
showcase of how you can mix and match Modal Functions that use different environments and have them feed
into each other or even call each other as if they were all functions in the same local program.
`,meta:{title:`Write to Google Sheets from Postgres`,description:`In this tutorial, we’ll show how to use Modal to schedule a daily report in a spreadsheet on Google Sheets that combines data from a PostgreSQL database with data from an external API.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>schedule</code>`),x=t(`<!> <p>In this tutorial, we’ll show how to use Modal to schedule a daily report in a spreadsheet on Google Sheets
that combines data from a PostgreSQL database with data from an external API.</p> <p>In particular, we’ll extract the city of each user from the database, look up the current weather in that city,
and then build a count/histogram of how many users are experiencing each type of weather.</p> <!> <p>We begin by setting up some credentials that we’ll need in order to access our database and output
spreadsheet. To do that in a secure manner, we log in to our Modal account on the web and go to
the <!> section.</p> <!> <p>First we will enter our database credentials. The easiest way to do this is to click <strong>New
secret</strong> and select the <strong>Postgres compatible</strong> Secret preset and fill in the requested
information. Then we press <strong>Next</strong> and name our Secret <code>postgres-secret</code> and click <strong>Create</strong>.</p> <!> <p>We’ll now add another Secret for Google Sheets access through Google Cloud Platform. Click <strong>New
secret</strong> and select the Google Sheets preset.</p> <p>In order to access the Google Sheets API, we’ll need to create a <em>Service Account</em> in Google Cloud
Platform. You can skip this step if you already have a Service Account json file.</p> <ol><li><p>Sign up to Google Cloud Platform or log in if you haven’t
(<!>).</p></li> <li><p>Go to <!>.</p></li> <li><p>In the navigation pane on the left, go to <strong>IAM & Admin</strong> > <strong>Service Accounts</strong>.</p></li> <li><p>Click the <strong>+ CREATE SERVICE ACCOUNT</strong> button.</p></li> <li><p>Give the service account a suitable name, like “sheet-access-bot”. Click <strong>Done</strong>. You don’t
have to grant it any specific access privileges at this time.</p></li> <li><p>Click your new service account in the list view that appears and navigate to the <strong>Keys</strong> section.</p></li> <li><p>Click <strong>Add key</strong> and choose <strong>Create new key</strong>. Use the <strong>JSON</strong> key type and confirm by
clicking <strong>Create</strong>.</p></li> <li><p>A json key file should be downloaded to your computer at this point. Copy the contents of that
file and use it as the value for the <code>SERVICE_ACCOUNT_JSON</code> field in your new secret.</p></li></ol> <p>We’ll name this other Secret <code>"gsheets-secret"</code>.</p> <p>Now you can access the values of your Secrets from Modal Functions that you annotate with the
corresponding <code>modal.Secret</code>s, e.g.:</p> <!> <p>Because these Secrets are Python objects, you can construct and manipulate them in your code.
We’ll do that below by defining a variable to hold our Secret for accessing Postgres</p> <p>You can additionally specify</p> <!> <p>In order to connect to the database, we’ll use the <code>psycopg2</code> Python package. To make it available
to your Modal Function you need to supply it with an <code>image</code> argument that tells Modal how to
build the container image that contains that package. We’ll base it off of the <code>Image.debian_slim</code> base
image that’s built into Modal, and make sure to install the required binary packages as well as
the <code>psycopg2</code> package itself:</p> <!> <p>Since the default keynames for a <strong>Postgres compatible</strong> secret correspond to the environment
variables that <code>psycopg2</code> looks for, we can now easily connect to the database even without
explicit credentials in your code. We’ll create a simple function that queries the city for each
user in the <code>users</code> table.</p> <!> <p>Note that we import <code>psycopg2</code> inside our function instead of the global scope. This allows us to
run this Modal Function even from an environment where <code>psycopg2</code> is not installed. We can test run
this function using the <code>modal run</code> shell command: <code>modal run db_to_sheet.py::app.get_db_rows</code>.</p> <p>To run this function, make sure there is a table called <code>users</code> in your database with a column called <code>city</code>.
You can populate the table with some example data using the following SQL commands:</p> <!> <!> <p>For each row in our source data we’ll run an online lookup of the current weather using the <!> API. To do this, we’ll add the API key to
another Modal Secret. We’ll use a custom secret called “weather-secret” with the key <code>OPENWEATHER_API_KEY</code> containing our API key for OpenWeatherMap.</p> <!> <p>We’ll make use of Modal’s built-in <code>function.map</code> method to create our report. <code>function.map</code> makes it really easy to parallelize work by executing a Function on every element in a sequence of
data. For this example we’ll just do a simple count of rows per weather type —
answering the question “how many of our users are experiencing each type of weather?“.</p> <!> <p>Let’s try to run this! To make it simple to trigger the function with some
predefined input data, we create a “local entrypoint” that can be
run from the command line with</p> <!> <!> <p>Running the local entrypoint using <code>modal run db_to_sheet.py</code> should print something like: <code>dict_items([('Clouds', 3)])</code>.
Note that since this file only has a single app, and the app has only one local entrypoint
we only have to specify the file to run it - the function/entrypoint is inferred.</p> <p>In this case the logic is quite simple, but in a real world context you could have applied a
machine learning model or any other tool you could build into a container to transform the data.</p> <!> <p>We’ll set up a new Google Sheet to send our report to. Using the “Sharing” dialog in Google
Sheets, share the document to the service account’s email address (the value of the <code>client_email</code> field in the json file)
and make the service account an editor of the document.</p> <p>You may also need to enable the Google Sheets API for your project in the Google Cloud Platform console.
If so, the URL will be printed inside the message of a 403 Forbidden error when you run the function.
It begins with <!>.</p> <p>Lastly, we need to point our code to the correct Google Sheet. We’ll need the <em>key</em> of the document.
You can find the key in the URL of the Google Sheet. It appears after the <code>/d/</code> in the URL, like: <code>https://docs.google.com/spreadsheets/d/1wOktal......IJR77jD8Do</code>.</p> <p>We’ll make use of the <code>pygsheets</code> python package to authenticate with
Google Sheets and then update the spreadsheet with information from the report we just created:</p> <!> <p>At this point, we have everything we need in order to run the full program. We can put it all together in
another Modal Function, and add a <!> argument so it runs every day automatically:</p> <!> <p>This entire app can now be deployed using <code>modal deploy db_to_sheet.py</code>. The <!> shows our cron job’s execution history and lets you navigate to each invocation’s logs.
To trigger a manual run from your local code during development, you can also trigger this function using the cli: <code>modal run db_to_sheet.py::db_to_sheet</code></p> <p>Note that all of the <code>@app.function()</code> annotated functions above run remotely in isolated containers that are specified per
function, but they are called as seamlessly as if we were using regular Python functions. This is a simple
showcase of how you can mix and match Modal Functions that use different environments and have them feed
into each other or even call each other as if they were all functions in the same local program.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`write-to-google-sheets-from-postgres`,children:(e,t)=>{l(),i(e,r(`Write to Google Sheets from Postgres`))},$$slots:{default:!0}});var g=c(m,6);u(g,{id:`entering-credentials`,children:(e,t)=>{l(),i(e,r(`Entering credentials`))},$$slots:{default:!0}});var _=c(g,2);h(c(e(_)),{href:`https://modal.com/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secrets`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);d(v,{id:`database`,children:(e,t)=>{l(),i(e,r(`Database`))},$$slots:{default:!0}});var y=c(v,4);d(y,{id:`google-sheetsgcp`,children:(e,t)=>{l(),i(e,r(`Google Sheets/GCP`))},$$slots:{default:!0}});var S=c(y,6),C=e(S),w=e(C);h(c(e(w)),{href:`https://cloud.google.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://cloud.google.com/`))},$$slots:{default:!0}}),l(),n(w),n(C);var T=c(C,2),E=e(T);h(c(e(E)),{href:`https://console.cloud.google.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://console.cloud.google.com/`))},$$slots:{default:!0}}),l(),n(E),n(T),l(12),n(S);var D=c(S,6);p(D,{code:`import%20os%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-db-to-sheet%22)%0A%0A%0A%40app.function(secrets%3D%5Bmodal.Secret.from_name(%22postgres-secret%22)%5D)%0Adef%20show_host()%3A%0A%20%20%20%20%23%20automatically%20filled%20from%20the%20specified%20secret%0A%20%20%20%20print(%22Host%20is%20%22%20%2B%20os.environ%5B%22PGHOST%22%5D)%0A%0A`,lang:`python`});var O=c(D,6);p(O,{code:`pg_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22postgres-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%22PGHOST%22%2C%20%22PGPORT%22%2C%20%22PGDATABASE%22%2C%20%22PGUSER%22%2C%20%22PGPASSWORD%22%5D%2C%0A)%0A%0A`,lang:`python`});var k=c(O,4);p(k,{code:`pg_image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.apt_install(%22libpq-dev%22)%0A%20%20%20%20.uv_pip_install(%22psycopg2~%3D2.9.9%22)%0A)%0A`,lang:`python`});var A=c(k,4);p(A,{code:`%40app.function(image%3Dpg_image%2C%20secrets%3D%5Bpg_secret%5D)%0Adef%20get_db_rows(verbose%3DTrue)%3A%0A%20%20%20%20import%20psycopg2%0A%0A%20%20%20%20conn%20%3D%20psycopg2.connect()%20%20%23%20no%20explicit%20credentials%20needed%0A%20%20%20%20cur%20%3D%20conn.cursor()%0A%20%20%20%20cur.execute(%22SELECT%20city%20FROM%20users%22)%0A%20%20%20%20results%20%3D%20%5Brow%5B0%5D%20for%20row%20in%20cur.fetchall()%5D%0A%20%20%20%20if%20verbose%3A%0A%20%20%20%20%20%20%20%20print(results)%0A%20%20%20%20return%20results%0A%0A`,lang:`python`});var j=c(A,6);p(j,{code:`CREATE%20TABLE%20users%20(city%20TEXT)%3B%0AINSERT%20INTO%20users%20VALUES%20('Stockholm%2C%2CSweden')%3B%0AINSERT%20INTO%20users%20VALUES%20('New%20York%2CNY%2CUSA')%3B%0AINSERT%20INTO%20users%20VALUES%20('Tokyo%2C%2CJapan')%3B`,lang:`sql`});var M=c(j,2);u(M,{id:`applying-python-logic`,children:(e,t)=>{l(),i(e,r(`Applying Python logic`))},$$slots:{default:!0}});var N=c(M,2);h(c(e(N)),{href:`http://openweathermap.org`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`http://openweathermap.org`))},$$slots:{default:!0}}),l(3),n(N);var P=c(N,2);p(P,{code:`requests_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22requests~%3D2.31.0%22%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Drequests_image%2C%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22weather-secret%22%2C%20required_keys%3D%5B%22OPENWEATHER_API_KEY%22%5D)%0A%20%20%20%20%5D%2C%0A)%0Adef%20city_weather(city)%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20url%20%3D%20%22https%3A%2F%2Fapi.openweathermap.org%2Fdata%2F2.5%2Fweather%22%0A%20%20%20%20params%20%3D%20%7B%22q%22%3A%20city%2C%20%22appid%22%3A%20os.environ%5B%22OPENWEATHER_API_KEY%22%5D%7D%0A%20%20%20%20response%20%3D%20requests.get(url%2C%20params%3Dparams)%0A%20%20%20%20weather_label%20%3D%20response.json()%5B%22weather%22%5D%5B0%5D%5B%22main%22%5D%0A%20%20%20%20return%20weather_label%0A%0A`,lang:`python`});var F=c(P,4);p(F,{code:`from%20collections%20import%20Counter%0A%0A%0A%40app.function()%0Adef%20create_report(cities)%3A%0A%20%20%20%20%23%20run%20city_weather%20for%20each%20city%20in%20parallel%0A%20%20%20%20user_weather%20%3D%20city_weather.map(cities)%0A%20%20%20%20count_users_by_weather%20%3D%20Counter(user_weather).items()%0A%20%20%20%20return%20count_users_by_weather%0A%0A`,lang:`python`});var I=c(F,4);p(I,{code:`modal%20run%20db_to_sheet.py`,lang:`bash`});var L=c(I,2);p(L,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20cities%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22Stockholm%2C%2CSweden%22%2C%0A%20%20%20%20%20%20%20%20%22New%20York%2CNY%2CUSA%22%2C%0A%20%20%20%20%20%20%20%20%22Tokyo%2C%2CJapan%22%2C%0A%20%20%20%20%5D%0A%20%20%20%20print(create_report.remote(cities))%0A%0A`,lang:`python`});var R=c(L,6);u(R,{id:`sending-output-to-a-google-sheet`,children:(e,t)=>{l(),i(e,r(`Sending output to a Google Sheet`))},$$slots:{default:!0}});var z=c(R,4);h(c(e(z)),{href:`https://console.developers.google.com/apis/api/sheets.googleapis.com/overview`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://console.developers.google.com/apis/api/sheets.googleapis.com/overview`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,6);p(B,{code:`pygsheets_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22pygsheets~%3D2.0.6%22%0A)%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dpygsheets_image%2C%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22gsheets-secret%22%2C%20required_keys%3D%5B%22SERVICE_ACCOUNT_JSON%22%5D)%0A%20%20%20%20%5D%2C%0A)%0Adef%20update_sheet_report(rows)%3A%0A%20%20%20%20import%20pygsheets%0A%0A%20%20%20%20gc%20%3D%20pygsheets.authorize(service_account_env_var%3D%22SERVICE_ACCOUNT_JSON%22)%0A%20%20%20%20document_key%20%3D%20%221JxhGsht4wltyPFFOd2hP0eIv6lxZ5pVxJN_ZwNT-l3c%22%0A%20%20%20%20sh%20%3D%20gc.open_by_key(document_key)%0A%20%20%20%20worksheet%20%3D%20sh.sheet1%0A%20%20%20%20worksheet.clear(%22A2%22)%0A%0A%20%20%20%20worksheet.update_values(%22A2%22%2C%20%5Blist(row)%20for%20row%20in%20rows%5D)%0A%0A`,lang:`python`});var V=c(B,2);h(c(e(V)),{href:`https://modal.com/docs/guide/cron`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(V);var H=c(V,2);p(H,{code:`%40app.function(schedule%3Dmodal.Period(days%3D1))%0Adef%20db_to_sheet()%3A%0A%20%20%20%20rows%20%3D%20get_db_rows.remote()%0A%20%20%20%20report%20%3D%20create_report.remote(rows)%0A%20%20%20%20update_sheet_report.remote(report)%0A%20%20%20%20print(%22Updated%20sheet%20with%20new%20weather%20distribution%22)%0A%20%20%20%20for%20weather%2C%20count%20in%20report%3A%0A%20%20%20%20%20%20%20%20print(f%22%7Bweather%7D%3A%20%7Bcount%7D%22)%0A%0A`,lang:`python`});var U=c(H,2);h(c(e(U),3),{href:`https://modal.com/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`apps page`))},$$slots:{default:!0}}),l(2),n(U),l(2),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=qxQsCex5.js.map
