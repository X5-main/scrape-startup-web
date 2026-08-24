(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a4767df7-8f2c-4cd3-8e79-f04c0e45b50e`,e._sentryDebugIdIdentifier=`sentry-dbid-a4767df7-8f2c-4cd3-8e79-f04c0e45b50e`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Claude Slack GIF Creator`,id:`claude-slack-gif-creator`,children:[{depth:2,value:`Features`,id:`features`},{depth:2,value:`Architecture`,id:`architecture`,children:[{depth:3,value:`Slack Bot Server`,id:`slack-bot-server`},{depth:3,value:`Claude Agent Sandbox`,id:`claude-agent-sandbox`},{depth:3,value:`Anthropic API Proxy`,id:`anthropic-api-proxy`}]},{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Setup`,id:`setup`,children:[{depth:3,value:`1. Install Dependencies`,id:`1-install-dependencies`},{depth:3,value:`2. Configure Slack App`,id:`2-configure-slack-app`},{depth:3,value:`3. Configure Modal Secrets`,id:`3-configure-modal-secrets`},{depth:3,value:`4. Deploy to Modal`,id:`4-deploy-to-modal`}]},{depth:2,value:`Usage`,id:`usage`,children:[{depth:3,value:`Mention the Bot`,id:`mention-the-bot`},{depth:3,value:`Upload Images`,id:`upload-images`},{depth:3,value:`Background Removal`,id:`background-removal`},{depth:3,value:`Thread Replies`,id:`thread-replies`}]},{depth:2,value:`How It Works`,id:`how-it-works`},{depth:2,value:`Debug Mode`,id:`debug-mode`},{depth:2,value:`Resources`,id:`resources`}]}],rawContent:`# Claude Slack GIF Creator

<p align="center">
  <img src="https://modal-cdn.com/claude-slack-gif-creator/claude-pelican-bicycle.gif" alt="GIF of a pelican riding a bicycle" style="display:inline-block;">
  <img src="https://modal-cdn.com/claude-slack-gif-creator/agi-party.gif" alt="GIF of an AGI party" style="display:inline-block;">
  <img src="https://modal-cdn.com/claude-slack-gif-creator/gongy-ships.gif" alt="GIF of Gongy shipping" style="display:inline-block;">
</p>

[This repo](https://github.com/modal-projects/claude-slack-gif-creator)
shows how to build
a bot powered by Claude that creates custom Slackmoji-ready GIFs.

Or, in GIF form:

![A bot powered by Claude that creates custom Slackmoji-ready GIFs](https://modal-cdn.com/claude-slack-gif-creator/claude-gif-gif.gif)

The bot runs on [Modal](https://modal.com/) and uses the [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)
with the [\`slack-gif-creator\` skill from Anthropic](https://github.com/anthropics/skills/).

## Features

- **Natural Language GIF Generation**: Describe what you want and Claude will create a 128x128 emoji-optimized GIF
- **Persistent Threads**: Each Slack thread creates a conversation context, persisted on Modal
- **Image Upload Support**: Upload images to the bot to incorporate them into your GIFs
- **Background Removal**: Backgrounds removed using the \`rembg\` tool, so you can make GIFs of your friends
- **Real-time Tool Logging**: See Claude's tool usage in the Slack thread as it works

## Architecture

The bot consists of three main components:
a Slack Bot Server,
a Claude Agent Sandbox,
and an Anthropic API Proxy.

### Slack Bot Server

This component handles Slack events (mentions and thread replies) and manages [Modal Sandboxes](https://modal.com/docs/guide/sandbox).
It's a simple [FastAPI ASGI app](https://modal.com/docs/guide/webhooks) hosted on Modal.

### Claude Agent Sandbox

This component runs a Claude client and executes Claude skills,
like Bash execution and GIF creation.

Because these skills are tantamount to giving the agent total control over the computing environment
and we are going to allow anyone who can access the bot to prompt the agent,
we need to isolate and secure this component.
To that tend, it runs inside a Modal [Sandbox](https://modal.com/docs/guide/sandbox).
Modal can readily scale to [hundreds or thousands of Sandboxes](https://modal.com/blog/modal-vibe).

Each Slack thread gets its own persistent [Modal Sandbox](https://modal.com/docs/guide/sandbox) with a dedicated [Volume](https://modal.com/docs/guide/volumes) for storing generated GIFs and session data.

### Anthropic API Proxy

This component proxies requests to the Anthropic API.

The proxy keeps the API key out of the Sandbox.
It's included so that Claude can't leak your API key when
a naughty prompt hacker asks for a GIF containing it,
as in the (mock) example below.

![Fake API keys revealed in a GIF](https://modal-cdn.com/claude-slack-gif-creator/mocked-pwn.gif)

## Prerequisites

- Python 3.10 or higher
- A [Modal](https://modal.com/) account
- A Slack workspace
- An Anthropic API key

## Setup

### 1. Install Dependencies

\`\`\`bash
pip install modal
\`\`\`

That's it!

If you've never used Modal before on this machine, also run

\`\`\`bash
modal setup
\`\`\`

### 2. Configure Slack App

[Create a new Slack app](https://api.slack.com/apps) in your workspace.

Your Slack app needs:

[**OAuth Scopes**](https://api.slack.com/scopes)

- \`app_mentions:read\`
- \`chat:write\`
- \`files:read\`
- \`files:write\`
- \`channels:history\`
- \`groups:history\`
- \`im:history\`
- \`mpim:history\`

[**Event Subscriptions**](https://api.slack.com/apis/connections/events-api):

- \`app_mention\`
- \`message.channels\`
- \`message.groups\`
- \`message.im\`
- \`message.mpim\`

### 3. Configure Modal Secrets

Create two Modal [Secrets](https://modal.com/docs/guide/secrets):

**anthropic-secret** with:

- \`ANTHROPIC_API_KEY\`: Your Anthropic API key

**claude-code-slackbot-secret** with:

- \`SLACK_BOT_TOKEN\`: Your [Slack bot token](https://api.slack.com/authentication/token-types#bot) (starts with \`xoxb-\`)
- \`SLACK_SIGNING_SECRET\`: Your Slack app's [signing secret](https://api.slack.com/authentication/verifying-requests-from-slack#about)

### 4. Deploy to Modal

\`\`\`bash
modal deploy src/main.py
\`\`\`

After deployment, Modal will provide a webhook URL. Add this URL to your Slack app's [Event Subscriptions Request URL](https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls).

Finally, [install the app to your workspace](https://api.slack.com/start/quickstart#installing) and invite the bot to the channels where you want to use it.

## Usage

### Mention the Bot

Mention the bot in any channel with a description of the GIF you want:

> @GIFBot create a GIF of a pelican riding a bicycle

![Pelican riding a bicycle](https://modal-cdn.com/claude-slack-gif-creator/claude-pelican-bicycle.gif)

### Upload Images

Attach images to your message for the bot to incorporate:

> @GIFBot make a party GIF of this entity that flashes the letters "AGI"

> [attach image]

![Are you feeling the AGI?](https://modal-cdn.com/claude-slack-gif-creator/agi-party.gif)

### Background Removal

Request background removal for transparent GIFs:

> @GIFBot make a GIF of this guy riding on a boat

> [attach image with background]

![Gongy ships](https://modal-cdn.com/claude-slack-gif-creator/gongy-ships.gif)

### Thread Replies

Reply to the bot's messages in a thread to continue the conversation:

> @GIFBot make a GIF showing "A bot powered by Claude that creates custom Slackmoji-ready GIFs." on a screen

> the text runs off the screen, fix the wrapping

![A bot powered by Claude that creates custom Slackmoji-ready GIFs](https://modal-cdn.com/claude-slack-gif-creator/claude-gif-gif.gif)

## How It Works

1. User mentions the bot or replies in a thread
2. Slack sends an event to the Modal webhook
3. The bot creates or resumes a Modal Sandbox for that thread
4. Images attached to the message are downloaded and uploaded to the Sandbox
5. Claude Agent SDK runs inside the Sandbox with the user's message
6. Claude uses the \`slack-gif-creator\` skill to generate the GIF
7. The generated GIF is uploaded back to the Slack thread
8. The Sandbox remains alive for 20 minutes for follow-up requests

## Debug Mode

Set \`DEBUG_TOOL_USE = True\` in \`src/main.py\` to enable real-time tool logging in Slack threads.

## Resources

- [Modal Documentation](https://modal.com/docs)
- [Modal Sandboxes](https://modal.com/products/sandboxes)
- [Claude Agent SDK](https://github.com/anthropics/anthropic-sdk-python)
- [Slack API Documentation](https://api.slack.com/)
- [Slack Bolt Framework](https://slack.dev/bolt-python/)
- [Building Slack Apps](https://api.slack.com/start)
- [\`slack-gif-creator\` Skill](https://github.com/anthropics/skills/)
`,meta:{title:`Claude Slack GIF Creator`,description:`This repo shows how to build a bot powered by Claude that creates custom Slackmoji-ready GIFs.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>slack-gif-creator</code> skill from Anthropic`,1),ae=t(`<strong>OAuth Scopes</strong>`),oe=t(`<strong>Event Subscriptions</strong>`),se=t(`<code>slack-gif-creator</code> Skill`,1),ce=t(`<!> <p align="center"><img src="https://modal-cdn.com/claude-slack-gif-creator/claude-pelican-bicycle.gif" alt="GIF of a pelican riding a bicycle" style="display:inline-block;"/> <img src="https://modal-cdn.com/claude-slack-gif-creator/agi-party.gif" alt="GIF of an AGI party" style="display:inline-block;"/> <img src="https://modal-cdn.com/claude-slack-gif-creator/gongy-ships.gif" alt="GIF of Gongy shipping" style="display:inline-block;"/></p> <p><!> shows how to build
a bot powered by Claude that creates custom Slackmoji-ready GIFs.</p> <p>Or, in GIF form:</p> <p><!></p> <p>The bot runs on <!> and uses the <!> with the <!>.</p> <!> <ul><li><strong>Natural Language GIF Generation</strong>: Describe what you want and Claude will create a 128x128 emoji-optimized GIF</li> <li><strong>Persistent Threads</strong>: Each Slack thread creates a conversation context, persisted on Modal</li> <li><strong>Image Upload Support</strong>: Upload images to the bot to incorporate them into your GIFs</li> <li><strong>Background Removal</strong>: Backgrounds removed using the <code>rembg</code> tool, so you can make GIFs of your friends</li> <li><strong>Real-time Tool Logging</strong>: See Claude’s tool usage in the Slack thread as it works</li></ul> <!> <p>The bot consists of three main components:
a Slack Bot Server,
a Claude Agent Sandbox,
and an Anthropic API Proxy.</p> <!> <p>This component handles Slack events (mentions and thread replies) and manages <!>.
It’s a simple <!> hosted on Modal.</p> <!> <p>This component runs a Claude client and executes Claude skills,
like Bash execution and GIF creation.</p> <p>Because these skills are tantamount to giving the agent total control over the computing environment
and we are going to allow anyone who can access the bot to prompt the agent,
we need to isolate and secure this component.
To that tend, it runs inside a Modal <!>.
Modal can readily scale to <!>.</p> <p>Each Slack thread gets its own persistent <!> with a dedicated <!> for storing generated GIFs and session data.</p> <!> <p>This component proxies requests to the Anthropic API.</p> <p>The proxy keeps the API key out of the Sandbox.
It’s included so that Claude can’t leak your API key when
a naughty prompt hacker asks for a GIF containing it,
as in the (mock) example below.</p> <p><!></p> <!> <ul><li>Python 3.10 or higher</li> <li>A <!> account</li> <li>A Slack workspace</li> <li>An Anthropic API key</li></ul> <!> <!> <!> <p>That’s it!</p> <p>If you’ve never used Modal before on this machine, also run</p> <!> <!> <p><!> in your workspace.</p> <p>Your Slack app needs:</p> <p><!></p> <ul><li><code>app_mentions:read</code></li> <li><code>chat:write</code></li> <li><code>files:read</code></li> <li><code>files:write</code></li> <li><code>channels:history</code></li> <li><code>groups:history</code></li> <li><code>im:history</code></li> <li><code>mpim:history</code></li></ul> <p><!>:</p> <ul><li><code>app_mention</code></li> <li><code>message.channels</code></li> <li><code>message.groups</code></li> <li><code>message.im</code></li> <li><code>message.mpim</code></li></ul> <!> <p>Create two Modal <!>:</p> <p><strong>anthropic-secret</strong> with:</p> <ul><li><code>ANTHROPIC_API_KEY</code>: Your Anthropic API key</li></ul> <p><strong>claude-code-slackbot-secret</strong> with:</p> <ul><li><code>SLACK_BOT_TOKEN</code>: Your <!> (starts with <code>xoxb-</code>)</li> <li><code>SLACK_SIGNING_SECRET</code>: Your Slack app’s <!></li></ul> <!> <!> <p>After deployment, Modal will provide a webhook URL. Add this URL to your Slack app’s <!>.</p> <p>Finally, <!> and invite the bot to the channels where you want to use it.</p> <!> <!> <p>Mention the bot in any channel with a description of the GIF you want:</p> <blockquote><p>@GIFBot create a GIF of a pelican riding a bicycle</p></blockquote> <p><!></p> <!> <p>Attach images to your message for the bot to incorporate:</p> <blockquote><p>@GIFBot make a party GIF of this entity that flashes the letters “AGI”</p></blockquote> <blockquote><p>[attach image]</p></blockquote> <p><!></p> <!> <p>Request background removal for transparent GIFs:</p> <blockquote><p>@GIFBot make a GIF of this guy riding on a boat</p></blockquote> <blockquote><p>[attach image with background]</p></blockquote> <p><!></p> <!> <p>Reply to the bot’s messages in a thread to continue the conversation:</p> <blockquote><p>@GIFBot make a GIF showing “A bot powered by Claude that creates custom Slackmoji-ready GIFs.” on a screen</p></blockquote> <blockquote><p>the text runs off the screen, fix the wrapping</p></blockquote> <p><!></p> <!> <ol><li>User mentions the bot or replies in a thread</li> <li>Slack sends an event to the Modal webhook</li> <li>The bot creates or resumes a Modal Sandbox for that thread</li> <li>Images attached to the message are downloaded and uploaded to the Sandbox</li> <li>Claude Agent SDK runs inside the Sandbox with the user’s message</li> <li>Claude uses the <code>slack-gif-creator</code> skill to generate the GIF</li> <li>The generated GIF is uploaded back to the Slack thread</li> <li>The Sandbox remains alive for 20 minutes for follow-up requests</li></ol> <!> <p>Set <code>DEBUG_TOOL_USE = True</code> in <code>src/main.py</code> to enable real-time tool logging in Slack threads.</p> <!> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ce(),f=te(a);ne(f,{id:`claude-slack-gif-creator`,children:(e,t)=>{s(),i(e,r(`Claude Slack GIF Creator`))},$$slots:{default:!0}});var m=o(f,4);p(e(m),{href:`https://github.com/modal-projects/claude-slack-gif-creator`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`This repo`))},$$slots:{default:!0}}),s(),n(m);var h=o(m,4);u(e(h),{src:`https://modal-cdn.com/claude-slack-gif-creator/claude-gif-gif.gif`,alt:`A bot powered by Claude that creates custom Slackmoji-ready GIFs`}),n(h);var g=o(h,2),re=o(e(g));p(re,{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}});var _=o(re,2);p(_,{href:`https://platform.claude.com/docs/en/agent-sdk/overview`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Claude Agent SDK`))},$$slots:{default:!0}}),p(o(_,2),{href:`https://github.com/anthropics/skills/`,rel:`nofollow`,children:(e,t)=>{var n=ie();s(),i(e,n)},$$slots:{default:!0}}),s(),n(g);var v=o(g,2);c(v,{id:`features`,children:(e,t)=>{s(),i(e,r(`Features`))},$$slots:{default:!0}});var y=o(v,4);c(y,{id:`architecture`,children:(e,t)=>{s(),i(e,r(`Architecture`))},$$slots:{default:!0}});var b=o(y,4);l(b,{id:`slack-bot-server`,children:(e,t)=>{s(),i(e,r(`Slack Bot Server`))},$$slots:{default:!0}});var x=o(b,2),S=o(e(x));p(S,{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),p(o(S,2),{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`FastAPI ASGI app`))},$$slots:{default:!0}}),s(),n(x);var le=o(x,2);l(le,{id:`claude-agent-sandbox`,children:(e,t)=>{s(),i(e,r(`Claude Agent Sandbox`))},$$slots:{default:!0}});var C=o(le,4),ue=o(e(C));p(ue,{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),p(o(ue,2),{href:`https://modal.com/blog/modal-vibe`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`hundreds or thousands of Sandboxes`))},$$slots:{default:!0}}),s(),n(C);var w=o(C,2),de=o(e(w));p(de,{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Sandbox`))},$$slots:{default:!0}}),p(o(de,2),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Volume`))},$$slots:{default:!0}}),s(),n(w);var fe=o(w,2);l(fe,{id:`anthropic-api-proxy`,children:(e,t)=>{s(),i(e,r(`Anthropic API Proxy`))},$$slots:{default:!0}});var T=o(fe,6);u(e(T),{src:`https://modal-cdn.com/claude-slack-gif-creator/mocked-pwn.gif`,alt:`Fake API keys revealed in a GIF`}),n(T);var pe=o(T,2);c(pe,{id:`prerequisites`,children:(e,t)=>{s(),i(e,r(`Prerequisites`))},$$slots:{default:!0}});var E=o(pe,2),me=o(e(E),2);p(o(e(me)),{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal`))},$$slots:{default:!0}}),s(),n(me),s(4),n(E);var D=o(E,2);c(D,{id:`setup`,children:(e,t)=>{s(),i(e,r(`Setup`))},$$slots:{default:!0}});var O=o(D,2);l(O,{id:`1-install-dependencies`,children:(e,t)=>{s(),i(e,r(`1. Install Dependencies`))},$$slots:{default:!0}});var k=o(O,2);d(k,{code:`pip%20install%20modal`,lang:`bash`});var A=o(k,6);d(A,{code:`modal%20setup`,lang:`bash`});var j=o(A,2);l(j,{id:`2-configure-slack-app`,children:(e,t)=>{s(),i(e,r(`2. Configure Slack App`))},$$slots:{default:!0}});var M=o(j,2);p(e(M),{href:`https://api.slack.com/apps`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Create a new Slack app`))},$$slots:{default:!0}}),s(),n(M);var N=o(M,4);p(e(N),{href:`https://api.slack.com/scopes`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),n(N);var P=o(N,4);p(e(P),{href:`https://api.slack.com/apis/connections/events-api`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(P);var F=o(P,4);l(F,{id:`3-configure-modal-secrets`,children:(e,t)=>{s(),i(e,r(`3. Configure Modal Secrets`))},$$slots:{default:!0}});var I=o(F,2);p(o(e(I)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Secrets`))},$$slots:{default:!0}}),s(),n(I);var L=o(I,8),R=e(L);p(o(e(R),2),{href:`https://api.slack.com/authentication/token-types#bot`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Slack bot token`))},$$slots:{default:!0}}),s(3),n(R);var z=o(R,2);p(o(e(z),2),{href:`https://api.slack.com/authentication/verifying-requests-from-slack#about`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`signing secret`))},$$slots:{default:!0}}),n(z),n(L);var B=o(L,2);l(B,{id:`4-deploy-to-modal`,children:(e,t)=>{s(),i(e,r(`4. Deploy to Modal`))},$$slots:{default:!0}});var V=o(B,2);d(V,{code:`modal%20deploy%20src%2Fmain.py`,lang:`bash`});var H=o(V,2);p(o(e(H)),{href:`https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Event Subscriptions Request URL`))},$$slots:{default:!0}}),s(),n(H);var U=o(H,2);p(o(e(U)),{href:`https://api.slack.com/start/quickstart#installing`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`install the app to your workspace`))},$$slots:{default:!0}}),s(),n(U);var he=o(U,2);c(he,{id:`usage`,children:(e,t)=>{s(),i(e,r(`Usage`))},$$slots:{default:!0}});var ge=o(he,2);l(ge,{id:`mention-the-bot`,children:(e,t)=>{s(),i(e,r(`Mention the Bot`))},$$slots:{default:!0}});var W=o(ge,6);u(e(W),{src:`https://modal-cdn.com/claude-slack-gif-creator/claude-pelican-bicycle.gif`,alt:`Pelican riding a bicycle`}),n(W);var _e=o(W,2);l(_e,{id:`upload-images`,children:(e,t)=>{s(),i(e,r(`Upload Images`))},$$slots:{default:!0}});var G=o(_e,8);u(e(G),{src:`https://modal-cdn.com/claude-slack-gif-creator/agi-party.gif`,alt:`Are you feeling the AGI?`}),n(G);var ve=o(G,2);l(ve,{id:`background-removal`,children:(e,t)=>{s(),i(e,r(`Background Removal`))},$$slots:{default:!0}});var K=o(ve,8);u(e(K),{src:`https://modal-cdn.com/claude-slack-gif-creator/gongy-ships.gif`,alt:`Gongy ships`}),n(K);var ye=o(K,2);l(ye,{id:`thread-replies`,children:(e,t)=>{s(),i(e,r(`Thread Replies`))},$$slots:{default:!0}});var q=o(ye,8);u(e(q),{src:`https://modal-cdn.com/claude-slack-gif-creator/claude-gif-gif.gif`,alt:`A bot powered by Claude that creates custom Slackmoji-ready GIFs`}),n(q);var be=o(q,2);c(be,{id:`how-it-works`,children:(e,t)=>{s(),i(e,r(`How It Works`))},$$slots:{default:!0}});var xe=o(be,4);c(xe,{id:`debug-mode`,children:(e,t)=>{s(),i(e,r(`Debug Mode`))},$$slots:{default:!0}});var Se=o(xe,4);c(Se,{id:`resources`,children:(e,t)=>{s(),i(e,r(`Resources`))},$$slots:{default:!0}});var Ce=o(Se,2),J=e(Ce);p(e(J),{href:`https://modal.com/docs`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Documentation`))},$$slots:{default:!0}}),n(J);var Y=o(J,2);p(e(Y),{href:`https://modal.com/products/sandboxes`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),n(Y);var X=o(Y,2);p(e(X),{href:`https://github.com/anthropics/anthropic-sdk-python`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Claude Agent SDK`))},$$slots:{default:!0}}),n(X);var Z=o(X,2);p(e(Z),{href:`https://api.slack.com/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Slack API Documentation`))},$$slots:{default:!0}}),n(Z);var Q=o(Z,2);p(e(Q),{href:`https://slack.dev/bolt-python/`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Slack Bolt Framework`))},$$slots:{default:!0}}),n(Q);var $=o(Q,2);p(e($),{href:`https://api.slack.com/start`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`Building Slack Apps`))},$$slots:{default:!0}}),n($);var we=o($,2);p(e(we),{href:`https://github.com/anthropics/skills/`,rel:`nofollow`,children:(e,t)=>{var n=se();s(),i(e,n)},$$slots:{default:!0}}),n(we),n(Ce),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=CcrxJ608.js.map
