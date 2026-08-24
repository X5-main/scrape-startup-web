(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`77e62bee-7b36-49b2-98f2-6a41122c6d52`,e._sentryDebugIdIdentifier=`sentry-dbid-77e62bee-7b36-49b2-98f2-6a41122c6d52`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as ne}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import{t as d}from"./DeWGVqas2.js";var f={toc:[{depth:1,value:`Serve a Discord Bot on Modal`,id:`serve-a-discord-bot-on-modal`,children:[{depth:2,value:`Set up our App and its Image`,id:`set-up-our-app-and-its-image`},{depth:2,value:`Hit the Free Public APIs API`,id:`hit-the-free-public-apis-api`},{depth:2,value:`Integrate our Modal Function with Discord Interactions`,id:`integrate-our-modal-function-with-discord-interactions`},{depth:2,value:`Set up a Discord app`,id:`set-up-a-discord-app`},{depth:2,value:`Register a Slash Command`,id:`register-a-slash-command`},{depth:2,value:`Host a Discord Interactions endpoint on Modal`,id:`host-a-discord-interactions-endpoint-on-modal`},{depth:2,value:`Deploy on Modal`,id:`deploy-on-modal`},{depth:2,value:`Finish setting up Discord bot`,id:`finish-setting-up-discord-bot`}]}],rawContent:`# Serve a Discord Bot on Modal

In this example we will demonstrate how to use Modal to build and serve a Discord bot that uses
[slash commands](https://discord.com/developers/docs/interactions/application-commands).

Slash commands send information from Discord server members to a service at a URL.
Here, we set up a simple [FastAPI app](https://fastapi.tiangolo.com/)
to run that service and deploy it easily  Modal’s
[\`@asgi_app\`](https://modal.com/docs/guide/webhooks#serving-asgi-and-wsgi-apps) decorator.

As our example service, we hit a simple free API:
the [Free Public APIs API](https://www.freepublicapis.com/api),
a directory of free public APIs.

[Try it out on Discord](https://discord.gg/PmG7P47EPQ)!

## Set up our App and its Image

First, we define the [container image](https://modal.com/docs/guide/images)
that all the pieces of our bot will run in.

We set that as the default image for a Modal [App](https://modal.com/docs/guide/apps).
The App is where we'll attach all the components of our bot.

\`\`\`python
import json
from enum import Enum

import modal

image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "fastapi[standard]==0.115.4", "pynacl~=1.5.0", "requests~=2.32.3"
)

app = modal.App("example-discord-bot", image=image)

\`\`\`

## Hit the Free Public APIs API

We start by defining the core service that our bot will provide.

In a real application, this might be [music generation](https://modal.com/docs/examples/musicgen),
a [chatbot](https://modal.com/docs/examples/chat_with_pdf_vision),
or [interacting with a database](https://modal.com/docs/examples/cron_datasette).

Here, we just hit a simple free public API:
the [Free Public APIs](https://www.freepublicapis.com) API,
an "API of APIs" that returns information about free public APIs,
like the [Global Shark Attack API](https://www.freepublicapis.com/global-shark-attack-api)
and the [Corporate Bullshit Generator](https://www.freepublicapis.com/corporate-bullshit-generator).
We convert the response into a Markdown-formatted message.

We turn our Python function into a Modal Function by attaching the \`app.function\` decorator.
We make the function \`async\` and add \`@modal.concurrent()\` with a large \`max_inputs\` value, because
communicating with an external API is a classic case for better performance from asynchronous execution.
Modal handles things like the async event loop for us.

\`\`\`python
@app.function()
@modal.concurrent(max_inputs=100)
async def fetch_api() -> str:
    import aiohttp

    url = "https://www.freepublicapis.com/api/random"

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                response.raise_for_status()
                data = await response.json()
                message = (
                    f"# {data.get('emoji') or '🤖'} [{data['title']}]({data['source']})"
                )
                message += f"\\n _{''.join(data['description'].splitlines())}_"
        except Exception as e:
            message = f"# 🤖: Oops! {e}"

    return message


\`\`\`

This core component has nothing to do with Discord,
and it's nice to be able to interact with and test it in isolation.

For that, we add a \`local_entrypoint\` that calls the Modal Function.
Notice that we add \`.remote\` to the function's name.

Later, when you replace this component of the app with something more interesting,
test it by triggering this entrypoint with  \`modal run discord_bot.py\`.

\`\`\`python
@app.local_entrypoint()
def test_fetch_api():
    result = fetch_api.remote()
    if result.startswith("# 🤖: Oops! "):
        raise Exception(result)
    else:
        print(result)


\`\`\`

## Integrate our Modal Function with Discord Interactions

Now we need to map this function onto Discord's interface --
in particular the [Interactions API](https://discord.com/developers/docs/interactions/overview).

Reviewing the documentation, we see that we need to send a JSON payload
to a specific API URL that will include an \`app_id\` that identifies our bot
and a \`token\` that identifies the interaction (loosely, message) that we're participating in.

So let's write that out. This function doesn't need to live on Modal,
since it's just encapsulating some logic -- we don't want to turn it into a service or an API on its own.
That means we don't need any Modal decorators.

\`\`\`python
async def send_to_discord(payload: dict, app_id: str, interaction_token: str):
    import aiohttp

    interaction_url = f"https://discord.com/api/v10/webhooks/{app_id}/{interaction_token}/messages/@original"

    async with aiohttp.ClientSession() as session:
        async with session.patch(interaction_url, json=payload) as resp:
            print("🤖 Discord response: " + await resp.text())


\`\`\`

Other parts of our application might want to both hit the Free Public APIs API and send the result to Discord,
so we both write a Python function for this and we promote it to a Modal Function with a decorator.

Notice that we use the \`.local\` suffix to call our \`fetch_api\` Function. That means we run
the Function the same way we run all the other Python functions, rather than treating it as a special
Modal Function. This reduces a bit of extra latency, but couples these two Functions more tightly.

\`\`\`python
@app.function()
@modal.concurrent(max_inputs=100)
async def reply(app_id: str, interaction_token: str):
    message = await fetch_api.local()
    await send_to_discord({"content": message}, app_id, interaction_token)


\`\`\`

## Set up a Discord app

Now, we need to actually connect to Discord.
We start by creating an application on the Discord Developer Portal.

1. Go to the
   [Discord Developer Portal](https://discord.com/developers/applications) and
   log in with your Discord account.
2. On the portal, go to **Applications** and create a new application by
   clicking **New Application** in the top right next to your profile picture.
3. [Create a custom Modal Secret](https://modal.com/docs/guide/secrets) for your Discord bot.
   On Modal's Secret creation page, select 'Discord'. Copy your Discord application’s
   **Public Key** and **Application ID** (from the **General Information** tab in the Discord Developer Portal)
   and paste them as the value of \`DISCORD_PUBLIC_KEY\` and \`DISCORD_CLIENT_ID\`.
   Additionally, head to the **Bot** tab and use the **Reset Token** button to create a new bot token.
   Paste this in the value of an additional key in the Secret, \`DISCORD_BOT_TOKEN\`.
   Name this Secret \`discord-secret\`.

We access that Secret in code like so:

\`\`\`python
discord_secret = modal.Secret.from_name(
    "discord-secret",
    required_keys=[  # included so we get nice error messages if we forgot a key
        "DISCORD_BOT_TOKEN",
        "DISCORD_CLIENT_ID",
        "DISCORD_PUBLIC_KEY",
    ],
)

\`\`\`

## Register a Slash Command

Next, we’re going to register a [Slash Command](https://discord.com/developers/docs/interactions/application-commands#slash-commands)
for our Discord app. Slash Commands are triggered by users in servers typing \`/\` and the name of the command.

The Modal Function below will register a Slash Command for your bot named \`bored\`.
More information about Slash Commands can be found in the Discord docs
[here](https://discord.com/developers/docs/interactions/application-commands).

You can run this Function with

\`\`\`bash
modal run discord_bot::create_slash_command
\`\`\`

\`\`\`python
@app.function(secrets=[discord_secret], image=image)
def create_slash_command(force: bool = False):
    """Registers the slash command with Discord. Pass the force flag to re-register."""
    import os

    import requests

    BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
    CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bot {BOT_TOKEN}",
    }
    url = f"https://discord.com/api/v10/applications/{CLIENT_ID}/commands"

    command_description = {
        "name": "api",
        "description": "Information about a random free, public API",
    }

    # first, check if the command already exists
    response = requests.get(url, headers=headers)
    try:
        response.raise_for_status()
    except Exception as e:
        raise Exception("Failed to create slash command") from e

    commands = response.json()
    command_exists = any(
        command.get("name") == command_description["name"] for command in commands
    )

    # and only recreate it if the force flag is set
    if command_exists and not force:
        print(f"🤖: command {command_description['name']} exists")
        return

    response = requests.post(url, headers=headers, json=command_description)
    try:
        response.raise_for_status()
    except Exception as e:
        raise Exception("Failed to create slash command") from e
    print(f"🤖: command {command_description['name']} created")


\`\`\`

## Host a Discord Interactions endpoint on Modal

If you look carefully at the definition of the Slash Command above,
you'll notice that it doesn't know anything about our bot besides an ID.

To hook the Slash Commands in the Discord UI up to our logic for hitting the Bored API,
we need to set up a service that listens at some URL and follows a specific protocol,
described [here](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url).

Here are some of the most important facets:

1. We'll need to respond within five seconds or Discord will assume we are dead.
Modal's fast-booting serverless containers usually start faster than that,
but it's not guaranteed. So we'll add the \`min_containers\` parameter to our
Function so that there's at least one live copy ready to respond quickly at any time.
Modal charges a minimum of about 2¢ an hour for live containers (pricing details [here](https://modal.com/pricing)).
Note that that still fits within Modal's $30/month of credits on the free tier.

2. We have to respond to Discord that quickly, but we don't have to respond to the user that quickly.
We instead send an acknowledgement so that they know we're alive and they can close their connection to us.
We also trigger our \`reply\` Modal Function, which will respond to the user via Discord's Interactions API,
but we don't wait for the result, we just \`spawn\` the call.

3. The protocol includes some authentication logic that is mandatory
and checked by Discord. We'll explain in more detail in the next section.

We can set up our interaction endpoint by deploying a FastAPI app on Modal.
This is as easy as creating a Python Function that returns a FastAPI app
and adding the \`modal.asgi_app\` decorator.
For more details on serving Python web apps on Modal, see
[this guide](https://modal.com/docs/guide/webhooks).

\`\`\`python
@app.function(secrets=[discord_secret], min_containers=1)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def web_app():
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.middleware.cors import CORSMiddleware

    web_app = FastAPI()

    # must allow requests from other domains, e.g. from Discord's servers
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @web_app.post("/api")
    async def get_api(request: Request):
        body = await request.body()

        # confirm this is a request from Discord
        authenticate(request.headers, body)

        print("🤖: parsing request")
        data = json.loads(body.decode())
        if data.get("type") == DiscordInteractionType.PING.value:
            print("🤖: acking PING from Discord during auth check")
            return {"type": DiscordResponseType.PONG.value}

        if data.get("type") == DiscordInteractionType.APPLICATION_COMMAND.value:
            print("🤖: handling slash command")
            app_id = data["application_id"]
            interaction_token = data["token"]

            # kick off request asynchronously, will respond when ready
            reply.spawn(app_id, interaction_token)

            # respond immediately with defer message
            return {
                "type": DiscordResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE.value
            }

        print(f"🤖: unable to parse request with type {data.get('type')}")
        raise HTTPException(status_code=400, detail="Bad request")

    return web_app


\`\`\`

The authentication for Discord is a bit involved and there aren't,
to our knowledge, any good Python libraries for it.

So we have to implement the protocol "by hand".

Essentially, Discord sends a header in their request
that we can use to verify the request comes from them.
For that, we use the \`DISCORD_PUBLIC_KEY\` from
our Application Information page.

The details aren't super important, but they appear in the \`authenticate\` function below
(which defers the real cryptography work to [PyNaCl](https://pypi.org/project/PyNaCl/),
a Python wrapper for [\`libsodium\`](https://github.com/jedisct1/libsodium)).

Discord will also check that we reject unauthorized requests,
so we have to be sure to get this right!

\`\`\`python
def authenticate(headers, body):
    import os

    from fastapi.exceptions import HTTPException
    from nacl.exceptions import BadSignatureError
    from nacl.signing import VerifyKey

    print("🤖: authenticating request")
    # verify the request is from Discord using their public key
    public_key = os.getenv("DISCORD_PUBLIC_KEY")
    verify_key = VerifyKey(bytes.fromhex(public_key))

    signature = headers.get("X-Signature-Ed25519")
    timestamp = headers.get("X-Signature-Timestamp")

    message = timestamp.encode() + body

    try:
        verify_key.verify(message, bytes.fromhex(signature))
    except BadSignatureError:
        # either an unauthorized request or Discord's "negative control" check
        raise HTTPException(status_code=401, detail="Invalid request")


\`\`\`

The code above used a few enums to abstract bits of the Discord protocol.
Now that we've walked through all of it,
we're in a position to understand what those are
and so the code for them appears below.

\`\`\`python
class DiscordInteractionType(Enum):
    PING = 1  # hello from Discord during auth check
    APPLICATION_COMMAND = 2  # an actual command


class DiscordResponseType(Enum):
    PONG = 1  # hello back during auth check
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5  # we'll send a message later


\`\`\`

## Deploy on Modal

You can deploy this app on Modal by running the following commands:

\`\`\` shell
modal run discord_bot.py  # checks the API wrapper, little test
modal run discord_bot.py::create_slash_command  # creates the slash command, if missing
modal deploy discord_bot.py  # deploys the web app and the API wrapper
\`\`\`

Copy the Modal URL that is printed in the output and go back to the **General Information** section on the
[Discord Developer Portal](https://discord.com/developers/applications).
Paste the URL, making sure to append the path of your \`POST\` route (here, \`/api\`), in the
**Interactions Endpoint URL** field, then click **Save Changes**. If your
endpoint URL is incorrect or if authentication is incorrectly implemented,
Discord will refuse to save the URL. Once it saves, you can start
handling interactions!

## Finish setting up Discord bot

To start using the Slash Command you just set up, you need to invite the bot to
a Discord server. To do so, go to your application's **Installation** section on the
[Discord Developer Portal](https://discord.com/developers/applications).
Copy the **Discored Provided Link** and visit it to invite the bot to your bot to the server.

Now you can open your Discord server and type \`/api\` in a channel to trigger the bot.
You can see a working version [in our test Discord server](https://discord.gg/PmG7P47EPQ).
`,meta:{title:`Serve a Discord Bot on Modal`,description:`In this example we will demonstrate how to use Modal to build and serve a Discord bot that uses slash commands.`}},{toc:p,rawContent:m,meta:h}=f,re=t(`<code>@asgi_app</code>`),ie=t(`<code>libsodium</code>`),ae=t(`<!> <p>In this example we will demonstrate how to use Modal to build and serve a Discord bot that uses <!>.</p> <p>Slash commands send information from Discord server members to a service at a URL.
Here, we set up a simple <!> to run that service and deploy it easily  Modal’s <!> decorator.</p> <p>As our example service, we hit a simple free API:
the <!>,
a directory of free public APIs.</p> <p><!>!</p> <!> <p>First, we define the <!> that all the pieces of our bot will run in.</p> <p>We set that as the default image for a Modal <!>.
The App is where we’ll attach all the components of our bot.</p> <!> <!> <p>We start by defining the core service that our bot will provide.</p> <p>In a real application, this might be <!>,
a <!>,
or <!>.</p> <p>Here, we just hit a simple free public API:
the <!> API,
an “API of APIs” that returns information about free public APIs,
like the <!> and the <!>.
We convert the response into a Markdown-formatted message.</p> <p>We turn our Python function into a Modal Function by attaching the <code>app.function</code> decorator.
We make the function <code>async</code> and add <code>@modal.concurrent()</code> with a large <code>max_inputs</code> value, because
communicating with an external API is a classic case for better performance from asynchronous execution.
Modal handles things like the async event loop for us.</p> <!> <p>This core component has nothing to do with Discord,
and it’s nice to be able to interact with and test it in isolation.</p> <p>For that, we add a <code>local_entrypoint</code> that calls the Modal Function.
Notice that we add <code>.remote</code> to the function’s name.</p> <p>Later, when you replace this component of the app with something more interesting,
test it by triggering this entrypoint with <code>modal run discord_bot.py</code>.</p> <!> <!> <p>Now we need to map this function onto Discord’s interface —
in particular the <!>.</p> <p>Reviewing the documentation, we see that we need to send a JSON payload
to a specific API URL that will include an <code>app_id</code> that identifies our bot
and a <code>token</code> that identifies the interaction (loosely, message) that we’re participating in.</p> <p>So let’s write that out. This function doesn’t need to live on Modal,
since it’s just encapsulating some logic — we don’t want to turn it into a service or an API on its own.
That means we don’t need any Modal decorators.</p> <!> <p>Other parts of our application might want to both hit the Free Public APIs API and send the result to Discord,
so we both write a Python function for this and we promote it to a Modal Function with a decorator.</p> <p>Notice that we use the <code>.local</code> suffix to call our <code>fetch_api</code> Function. That means we run
the Function the same way we run all the other Python functions, rather than treating it as a special
Modal Function. This reduces a bit of extra latency, but couples these two Functions more tightly.</p> <!> <!> <p>Now, we need to actually connect to Discord.
We start by creating an application on the Discord Developer Portal.</p> <ol><li>Go to the <!> and
log in with your Discord account.</li> <li>On the portal, go to <strong>Applications</strong> and create a new application by
clicking <strong>New Application</strong> in the top right next to your profile picture.</li> <li><!> for your Discord bot.
On Modal’s Secret creation page, select ‘Discord’. Copy your Discord application’s <strong>Public Key</strong> and <strong>Application ID</strong> (from the <strong>General Information</strong> tab in the Discord Developer Portal)
and paste them as the value of <code>DISCORD_PUBLIC_KEY</code> and <code>DISCORD_CLIENT_ID</code>.
Additionally, head to the <strong>Bot</strong> tab and use the <strong>Reset Token</strong> button to create a new bot token.
Paste this in the value of an additional key in the Secret, <code>DISCORD_BOT_TOKEN</code>.
Name this Secret <code>discord-secret</code>.</li></ol> <p>We access that Secret in code like so:</p> <!> <!> <p>Next, we’re going to register a <!> for our Discord app. Slash Commands are triggered by users in servers typing <code>/</code> and the name of the command.</p> <p>The Modal Function below will register a Slash Command for your bot named <code>bored</code>.
More information about Slash Commands can be found in the Discord docs <!>.</p> <p>You can run this Function with</p> <!> <!> <!> <p>If you look carefully at the definition of the Slash Command above,
you’ll notice that it doesn’t know anything about our bot besides an ID.</p> <p>To hook the Slash Commands in the Discord UI up to our logic for hitting the Bored API,
we need to set up a service that listens at some URL and follows a specific protocol,
described <!>.</p> <p>Here are some of the most important facets:</p> <ol><li><p>We’ll need to respond within five seconds or Discord will assume we are dead.
Modal’s fast-booting serverless containers usually start faster than that,
but it’s not guaranteed. So we’ll add the <code>min_containers</code> parameter to our
Function so that there’s at least one live copy ready to respond quickly at any time.
Modal charges a minimum of about 2¢ an hour for live containers (pricing details <!>).
Note that that still fits within Modal’s $30/month of credits on the free tier.</p></li> <li><p>We have to respond to Discord that quickly, but we don’t have to respond to the user that quickly.
We instead send an acknowledgement so that they know we’re alive and they can close their connection to us.
We also trigger our <code>reply</code> Modal Function, which will respond to the user via Discord’s Interactions API,
but we don’t wait for the result, we just <code>spawn</code> the call.</p></li> <li><p>The protocol includes some authentication logic that is mandatory
and checked by Discord. We’ll explain in more detail in the next section.</p></li></ol> <p>We can set up our interaction endpoint by deploying a FastAPI app on Modal.
This is as easy as creating a Python Function that returns a FastAPI app
and adding the <code>modal.asgi_app</code> decorator.
For more details on serving Python web apps on Modal, see <!>.</p> <!> <p>The authentication for Discord is a bit involved and there aren’t,
to our knowledge, any good Python libraries for it.</p> <p>So we have to implement the protocol “by hand”.</p> <p>Essentially, Discord sends a header in their request
that we can use to verify the request comes from them.
For that, we use the <code>DISCORD_PUBLIC_KEY</code> from
our Application Information page.</p> <p>The details aren’t super important, but they appear in the <code>authenticate</code> function below
(which defers the real cryptography work to <!>,
a Python wrapper for <!>).</p> <p>Discord will also check that we reject unauthorized requests,
so we have to be sure to get this right!</p> <!> <p>The code above used a few enums to abstract bits of the Discord protocol.
Now that we’ve walked through all of it,
we’re in a position to understand what those are
and so the code for them appears below.</p> <!> <!> <p>You can deploy this app on Modal by running the following commands:</p> <!> <p>Copy the Modal URL that is printed in the output and go back to the <strong>General Information</strong> section on the <!>.
Paste the URL, making sure to append the path of your <code>POST</code> route (here, <code>/api</code>), in the <strong>Interactions Endpoint URL</strong> field, then click <strong>Save Changes</strong>. If your
endpoint URL is incorrect or if authentication is incorrectly implemented,
Discord will refuse to save the URL. Once it saves, you can start
handling interactions!</p> <!> <p>To start using the Slash Command you just set up, you need to invite the bot to
a Discord server. To do so, go to your application’s <strong>Installation</strong> section on the <!>.
Copy the <strong>Discored Provided Link</strong> and visit it to invite the bot to your bot to the server.</p> <p>Now you can open your Discord server and type <code>/api</code> in a channel to trigger the bot.
You can see a working version <!>.</p>`,1);function g(t,p){let m=ee(p,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(t,a(()=>m,()=>f,{children:(t,ee)=>{var a=ae(),u=te(a);ne(u,{id:`serve-a-discord-bot-on-modal`,children:(e,t)=>{s(),i(e,r(`Serve a Discord Bot on Modal`))},$$slots:{default:!0}});var f=o(u,2);d(o(e(f)),{href:`https://discord.com/developers/docs/interactions/application-commands`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`slash commands`))},$$slots:{default:!0}}),s(),n(f);var p=o(f,2),m=o(e(p));d(m,{href:`https://fastapi.tiangolo.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI app`))},$$slots:{default:!0}}),d(o(m,2),{href:`https://modal.com/docs/guide/webhooks#serving-asgi-and-wsgi-apps`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(p);var h=o(p,2);d(o(e(h)),{href:`https://www.freepublicapis.com/api`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Free Public APIs API`))},$$slots:{default:!0}}),s(),n(h);var g=o(h,2);d(e(g),{href:`https://discord.gg/PmG7P47EPQ`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Try it out on Discord`))},$$slots:{default:!0}}),s(),n(g);var _=o(g,2);c(_,{id:`set-up-our-app-and-its-image`,children:(e,t)=>{s(),i(e,r(`Set up our App and its Image`))},$$slots:{default:!0}});var v=o(_,2);d(o(e(v)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`container image`))},$$slots:{default:!0}}),s(),n(v);var y=o(v,2);d(o(e(y)),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`App`))},$$slots:{default:!0}}),s(),n(y);var b=o(y,2);l(b,{code:`import%20json%0Afrom%20enum%20import%20Enum%0A%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%20%22pynacl~%3D1.5.0%22%2C%20%22requests~%3D2.32.3%22%0A)%0A%0Aapp%20%3D%20modal.App(%22example-discord-bot%22%2C%20image%3Dimage)%0A`,lang:`python`});var x=o(b,2);c(x,{id:`hit-the-free-public-apis-api`,children:(e,t)=>{s(),i(e,r(`Hit the Free Public APIs API`))},$$slots:{default:!0}});var S=o(x,4),C=o(e(S));d(C,{href:`https://modal.com/docs/examples/musicgen`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`music generation`))},$$slots:{default:!0}});var oe=o(C,2);d(oe,{href:`https://modal.com/docs/examples/chat_with_pdf_vision`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`chatbot`))},$$slots:{default:!0}}),d(o(oe,2),{href:`https://modal.com/docs/examples/cron_datasette`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`interacting with a database`))},$$slots:{default:!0}}),s(),n(S);var w=o(S,2),se=o(e(w));d(se,{href:`https://www.freepublicapis.com`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Free Public APIs`))},$$slots:{default:!0}});var T=o(se,2);d(T,{href:`https://www.freepublicapis.com/global-shark-attack-api`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Global Shark Attack API`))},$$slots:{default:!0}}),d(o(T,2),{href:`https://www.freepublicapis.com/corporate-bullshit-generator`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Corporate Bullshit Generator`))},$$slots:{default:!0}}),s(),n(w);var E=o(w,4);l(E,{code:`%40app.function()%0A%40modal.concurrent(max_inputs%3D100)%0Aasync%20def%20fetch_api()%20-%3E%20str%3A%0A%20%20%20%20import%20aiohttp%0A%0A%20%20%20%20url%20%3D%20%22https%3A%2F%2Fwww.freepublicapis.com%2Fapi%2Frandom%22%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession()%20as%20session%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20async%20with%20session.get(url)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20response.raise_for_status()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20await%20response.json()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20message%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%23%20%7Bdata.get('emoji')%20or%20'%F0%9F%A4%96'%7D%20%5B%7Bdata%5B'title'%5D%7D%5D(%7Bdata%5B'source'%5D%7D)%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20message%20%2B%3D%20f%22%5Cn%20_%7B''.join(data%5B'description'%5D.splitlines())%7D_%22%0A%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20message%20%3D%20f%22%23%20%F0%9F%A4%96%3A%20Oops!%20%7Be%7D%22%0A%0A%20%20%20%20return%20message%0A%0A`,lang:`python`});var D=o(E,8);l(D,{code:`%40app.local_entrypoint()%0Adef%20test_fetch_api()%3A%0A%20%20%20%20result%20%3D%20fetch_api.remote()%0A%20%20%20%20if%20result.startswith(%22%23%20%F0%9F%A4%96%3A%20Oops!%20%22)%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(result)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(result)%0A%0A`,lang:`python`});var O=o(D,2);c(O,{id:`integrate-our-modal-function-with-discord-interactions`,children:(e,t)=>{s(),i(e,r(`Integrate our Modal Function with Discord Interactions`))},$$slots:{default:!0}});var k=o(O,2);d(o(e(k)),{href:`https://discord.com/developers/docs/interactions/overview`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Interactions API`))},$$slots:{default:!0}}),s(),n(k);var A=o(k,6);l(A,{code:`async%20def%20send_to_discord(payload%3A%20dict%2C%20app_id%3A%20str%2C%20interaction_token%3A%20str)%3A%0A%20%20%20%20import%20aiohttp%0A%0A%20%20%20%20interaction_url%20%3D%20f%22https%3A%2F%2Fdiscord.com%2Fapi%2Fv10%2Fwebhooks%2F%7Bapp_id%7D%2F%7Binteraction_token%7D%2Fmessages%2F%40original%22%0A%0A%20%20%20%20async%20with%20aiohttp.ClientSession()%20as%20session%3A%0A%20%20%20%20%20%20%20%20async%20with%20session.patch(interaction_url%2C%20json%3Dpayload)%20as%20resp%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22%F0%9F%A4%96%20Discord%20response%3A%20%22%20%2B%20await%20resp.text())%0A%0A`,lang:`python`});var j=o(A,6);l(j,{code:`%40app.function()%0A%40modal.concurrent(max_inputs%3D100)%0Aasync%20def%20reply(app_id%3A%20str%2C%20interaction_token%3A%20str)%3A%0A%20%20%20%20message%20%3D%20await%20fetch_api.local()%0A%20%20%20%20await%20send_to_discord(%7B%22content%22%3A%20message%7D%2C%20app_id%2C%20interaction_token)%0A%0A`,lang:`python`});var M=o(j,2);c(M,{id:`set-up-a-discord-app`,children:(e,t)=>{s(),i(e,r(`Set up a Discord app`))},$$slots:{default:!0}});var N=o(M,4),P=e(N);d(o(e(P)),{href:`https://discord.com/developers/applications`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Discord Developer Portal`))},$$slots:{default:!0}}),s(),n(P);var F=o(P,4);d(e(F),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Create a custom Modal Secret`))},$$slots:{default:!0}}),s(19),n(F),n(N);var I=o(N,4);l(I,{code:`discord_secret%20%3D%20modal.Secret.from_name(%0A%20%20%20%20%22discord-secret%22%2C%0A%20%20%20%20required_keys%3D%5B%20%20%23%20included%20so%20we%20get%20nice%20error%20messages%20if%20we%20forgot%20a%20key%0A%20%20%20%20%20%20%20%20%22DISCORD_BOT_TOKEN%22%2C%0A%20%20%20%20%20%20%20%20%22DISCORD_CLIENT_ID%22%2C%0A%20%20%20%20%20%20%20%20%22DISCORD_PUBLIC_KEY%22%2C%0A%20%20%20%20%5D%2C%0A)%0A`,lang:`python`});var L=o(I,2);c(L,{id:`register-a-slash-command`,children:(e,t)=>{s(),i(e,r(`Register a Slash Command`))},$$slots:{default:!0}});var R=o(L,2);d(o(e(R)),{href:`https://discord.com/developers/docs/interactions/application-commands#slash-commands`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Slash Command`))},$$slots:{default:!0}}),s(3),n(R);var z=o(R,2);d(o(e(z),3),{href:`https://discord.com/developers/docs/interactions/application-commands`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(z);var B=o(z,4);l(B,{code:`modal%20run%20discord_bot%3A%3Acreate_slash_command`,lang:`bash`});var ce=o(B,2);l(ce,{code:`%40app.function(secrets%3D%5Bdiscord_secret%5D%2C%20image%3Dimage)%0Adef%20create_slash_command(force%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20%22%22%22Registers%20the%20slash%20command%20with%20Discord.%20Pass%20the%20force%20flag%20to%20re-register.%22%22%22%0A%20%20%20%20import%20os%0A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20BOT_TOKEN%20%3D%20os.getenv(%22DISCORD_BOT_TOKEN%22)%0A%20%20%20%20CLIENT_ID%20%3D%20os.getenv(%22DISCORD_CLIENT_ID%22)%0A%0A%20%20%20%20headers%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22Content-Type%22%3A%20%22application%2Fjson%22%2C%0A%20%20%20%20%20%20%20%20%22Authorization%22%3A%20f%22Bot%20%7BBOT_TOKEN%7D%22%2C%0A%20%20%20%20%7D%0A%20%20%20%20url%20%3D%20f%22https%3A%2F%2Fdiscord.com%2Fapi%2Fv10%2Fapplications%2F%7BCLIENT_ID%7D%2Fcommands%22%0A%0A%20%20%20%20command_description%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22name%22%3A%20%22api%22%2C%0A%20%20%20%20%20%20%20%20%22description%22%3A%20%22Information%20about%20a%20random%20free%2C%20public%20API%22%2C%0A%20%20%20%20%7D%0A%0A%20%20%20%20%23%20first%2C%20check%20if%20the%20command%20already%20exists%0A%20%20%20%20response%20%3D%20requests.get(url%2C%20headers%3Dheaders)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20response.raise_for_status()%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%22Failed%20to%20create%20slash%20command%22)%20from%20e%0A%0A%20%20%20%20commands%20%3D%20response.json()%0A%20%20%20%20command_exists%20%3D%20any(%0A%20%20%20%20%20%20%20%20command.get(%22name%22)%20%3D%3D%20command_description%5B%22name%22%5D%20for%20command%20in%20commands%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20and%20only%20recreate%20it%20if%20the%20force%20flag%20is%20set%0A%20%20%20%20if%20command_exists%20and%20not%20force%3A%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%A4%96%3A%20command%20%7Bcommand_description%5B'name'%5D%7D%20exists%22)%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20response%20%3D%20requests.post(url%2C%20headers%3Dheaders%2C%20json%3Dcommand_description)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20response.raise_for_status()%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20raise%20Exception(%22Failed%20to%20create%20slash%20command%22)%20from%20e%0A%20%20%20%20print(f%22%F0%9F%A4%96%3A%20command%20%7Bcommand_description%5B'name'%5D%7D%20created%22)%0A%0A`,lang:`python`});var V=o(ce,2);c(V,{id:`host-a-discord-interactions-endpoint-on-modal`,children:(e,t)=>{s(),i(e,r(`Host a Discord Interactions endpoint on Modal`))},$$slots:{default:!0}});var H=o(V,4);d(o(e(H)),{href:`https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,4),W=e(U),G=e(W);d(o(e(G),3),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`here`))},$$slots:{default:!0}}),s(),n(G),n(W),s(4),n(U);var K=o(U,2);d(o(e(K),3),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`this guide`))},$$slots:{default:!0}}),s(),n(K);var q=o(K,2);l(q,{code:`%40app.function(secrets%3D%5Bdiscord_secret%5D%2C%20min_containers%3D1)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20web_app()%3A%0A%20%20%20%20from%20fastapi%20import%20FastAPI%2C%20HTTPException%2C%20Request%0A%20%20%20%20from%20fastapi.middleware.cors%20import%20CORSMiddleware%0A%0A%20%20%20%20web_app%20%3D%20FastAPI()%0A%0A%20%20%20%20%23%20must%20allow%20requests%20from%20other%20domains%2C%20e.g.%20from%20Discord's%20servers%0A%20%20%20%20web_app.add_middleware(%0A%20%20%20%20%20%20%20%20CORSMiddleware%2C%0A%20%20%20%20%20%20%20%20allow_origins%3D%5B%22*%22%5D%2C%0A%20%20%20%20%20%20%20%20allow_credentials%3DTrue%2C%0A%20%20%20%20%20%20%20%20allow_methods%3D%5B%22*%22%5D%2C%0A%20%20%20%20%20%20%20%20allow_headers%3D%5B%22*%22%5D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%40web_app.post(%22%2Fapi%22)%0A%20%20%20%20async%20def%20get_api(request%3A%20Request)%3A%0A%20%20%20%20%20%20%20%20body%20%3D%20await%20request.body()%0A%0A%20%20%20%20%20%20%20%20%23%20confirm%20this%20is%20a%20request%20from%20Discord%0A%20%20%20%20%20%20%20%20authenticate(request.headers%2C%20body)%0A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%A4%96%3A%20parsing%20request%22)%0A%20%20%20%20%20%20%20%20data%20%3D%20json.loads(body.decode())%0A%20%20%20%20%20%20%20%20if%20data.get(%22type%22)%20%3D%3D%20DiscordInteractionType.PING.value%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22%F0%9F%A4%96%3A%20acking%20PING%20from%20Discord%20during%20auth%20check%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22type%22%3A%20DiscordResponseType.PONG.value%7D%0A%0A%20%20%20%20%20%20%20%20if%20data.get(%22type%22)%20%3D%3D%20DiscordInteractionType.APPLICATION_COMMAND.value%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(%22%F0%9F%A4%96%3A%20handling%20slash%20command%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20app_id%20%3D%20data%5B%22application_id%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20interaction_token%20%3D%20data%5B%22token%22%5D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20kick%20off%20request%20asynchronously%2C%20will%20respond%20when%20ready%0A%20%20%20%20%20%20%20%20%20%20%20%20reply.spawn(app_id%2C%20interaction_token)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%23%20respond%20immediately%20with%20defer%20message%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20DiscordResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE.value%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%A4%96%3A%20unable%20to%20parse%20request%20with%20type%20%7Bdata.get('type')%7D%22)%0A%20%20%20%20%20%20%20%20raise%20HTTPException(status_code%3D400%2C%20detail%3D%22Bad%20request%22)%0A%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var J=o(q,8),Y=o(e(J),3);d(Y,{href:`https://pypi.org/project/PyNaCl/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`PyNaCl`))},$$slots:{default:!0}}),d(o(Y,2),{href:`https://github.com/jedisct1/libsodium`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(J);var X=o(J,4);l(X,{code:`def%20authenticate(headers%2C%20body)%3A%0A%20%20%20%20import%20os%0A%0A%20%20%20%20from%20fastapi.exceptions%20import%20HTTPException%0A%20%20%20%20from%20nacl.exceptions%20import%20BadSignatureError%0A%20%20%20%20from%20nacl.signing%20import%20VerifyKey%0A%0A%20%20%20%20print(%22%F0%9F%A4%96%3A%20authenticating%20request%22)%0A%20%20%20%20%23%20verify%20the%20request%20is%20from%20Discord%20using%20their%20public%20key%0A%20%20%20%20public_key%20%3D%20os.getenv(%22DISCORD_PUBLIC_KEY%22)%0A%20%20%20%20verify_key%20%3D%20VerifyKey(bytes.fromhex(public_key))%0A%0A%20%20%20%20signature%20%3D%20headers.get(%22X-Signature-Ed25519%22)%0A%20%20%20%20timestamp%20%3D%20headers.get(%22X-Signature-Timestamp%22)%0A%0A%20%20%20%20message%20%3D%20timestamp.encode()%20%2B%20body%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20verify_key.verify(message%2C%20bytes.fromhex(signature))%0A%20%20%20%20except%20BadSignatureError%3A%0A%20%20%20%20%20%20%20%20%23%20either%20an%20unauthorized%20request%20or%20Discord's%20%22negative%20control%22%20check%0A%20%20%20%20%20%20%20%20raise%20HTTPException(status_code%3D401%2C%20detail%3D%22Invalid%20request%22)%0A%0A`,lang:`python`});var Z=o(X,4);l(Z,{code:`class%20DiscordInteractionType(Enum)%3A%0A%20%20%20%20PING%20%3D%201%20%20%23%20hello%20from%20Discord%20during%20auth%20check%0A%20%20%20%20APPLICATION_COMMAND%20%3D%202%20%20%23%20an%20actual%20command%0A%0A%0Aclass%20DiscordResponseType(Enum)%3A%0A%20%20%20%20PONG%20%3D%201%20%20%23%20hello%20back%20during%20auth%20check%0A%20%20%20%20DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE%20%3D%205%20%20%23%20we'll%20send%20a%20message%20later%0A%0A`,lang:`python`});var le=o(Z,2);c(le,{id:`deploy-on-modal`,children:(e,t)=>{s(),i(e,r(`Deploy on Modal`))},$$slots:{default:!0}});var ue=o(le,4);l(ue,{code:`modal%20run%20discord_bot.py%20%20%23%20checks%20the%20API%20wrapper%2C%20little%20test%0Amodal%20run%20discord_bot.py%3A%3Acreate_slash_command%20%20%23%20creates%20the%20slash%20command%2C%20if%20missing%0Amodal%20deploy%20discord_bot.py%20%20%23%20deploys%20the%20web%20app%20and%20the%20API%20wrapper`,lang:`shell`});var Q=o(ue,2);d(o(e(Q),3),{href:`https://discord.com/developers/applications`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Discord Developer Portal`))},$$slots:{default:!0}}),s(9),n(Q);var de=o(Q,2);c(de,{id:`finish-setting-up-discord-bot`,children:(e,t)=>{s(),i(e,r(`Finish setting up Discord bot`))},$$slots:{default:!0}});var $=o(de,2);d(o(e($),3),{href:`https://discord.com/developers/applications`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Discord Developer Portal`))},$$slots:{default:!0}}),s(3),n($);var fe=o($,2);d(o(e(fe),3),{href:`https://discord.gg/PmG7P47EPQ`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`in our test Discord server`))},$$slots:{default:!0}}),s(),n(fe),i(t,a)},$$slots:{default:!0}}))}export{g as default,f as metadata};
//# sourceMappingURL=D-5gchik.js.map
