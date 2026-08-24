(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`e07d3d57-9b85-433a-b2f0-2d884c4e3723`,e._sentryDebugIdIdentifier=`sentry-dbid-e07d3d57-9b85-433a-b2f0-2d884c4e3723`)}catch{}})();import{$t as e,H as t,St as n,Tn as r,Tt as i,bt as a,c as o,d as s,en as c,l,qt as u,tn as d,wn as f}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as p}from"./DOmA201S.js";import{a as m,i as h,o as ee}from"./CPby7b1n.js";import{t as g}from"./JPsrybyr.js";import{t as _}from"./BILrvr3I.js";import{t as v}from"./B4L_if842.js";import{t as y}from"./DeWGVqas2.js";var te=`/_app/immutable/assets/train-loss.DFD7oOI8.png`,b=n(`<div class="float-right -mt-[54px] mr-2 py-1 pl-4"><a class="btn btn-outlined btn-primary" target="_blank" rel="noopener noreferrer"><!></a></div>`);function x(n,i){let o=l(i,`url`,8);var s=b(),c=e(s);p(e(c),{size:16,class:`text-c-green-100`}),r(c),r(s),u(()=>t(c,`href`,o())),a(n,s)}var S={description:`Fine-tune Llama on Slack messages to create a bot that mimics your writing style. Full serverless training and inference.`,toc:[{depth:1,value:`DoppelBot: Fine-tune an LLM to replace your CEO`,id:`doppelbot-fine-tune-an-llm-to-replace-your-ceo`,children:[{depth:2,value:`How it works`,id:`how-it-works`,children:[{depth:3,value:`Scraping slack`,id:`scraping-slack`},{depth:3,value:`Fine-tuning`,id:`fine-tuning`},{depth:3,value:`Inference`,id:`inference`},{depth:3,value:`Slack Bot`,id:`slack-bot`},{depth:3,value:`Multi-Workspace Support`,id:`multi-workspace-support`}]},{depth:2,value:`Next Steps`,id:`next-steps`}]}],rawContent:`# DoppelBot: Fine-tune an LLM to replace your CEO

_(quick links:
[add to your own Slack](https://github.com/modal-labs/doppel-bot#usage);
[source code](https://github.com/modal-labs/doppel-bot))_

Internally at Modal, we spend a _lot_ of time talking to each other on Slack.
Now, with the advent of open-source large language models, we had started to
wonder if all of this wasn't a bit redundant. Could we have these language
models bike-shed on Slack for us, so we could spend our time on higher leverage
activities such as
[paddleboarding in Tahiti](https://x.com/modal/status/1642262543757352960)
instead?

To test this, we fine-tuned
[Llama 3.1](https://ai.meta.com/blog/meta-llama-3-1/) on
[Erik](https://twitter.com/bernhardsson)'s Slack messages, and \`@erik-bot\` was
born.

![erik-bot](https://modal-cdn.com/erik-bot-1.jpeg)

Since then, \`@erik-bot\` has been an invaluable asset to us, in areas ranging
from [API design](https://modal-cdn.com/erik-bot-2.png) to
[legal advice](https://modal-cdn.com/erik-bot-3.png) to thought leadership.

![erik-bot-3](https://modal-cdn.com/erik-bot-4.png)

We were planning on releasing the weights for \`@erik-bot\` to the world, but all
our metrics have been going up and to the right a little too much since we've
launched him...

So, we are releasing the next best thing. \`DoppelBot\` is a Slack bot that you
can install in your own workspace, and fine-tune on your own Slack messages.
Follow the instructions [here](https://github.com/modal-labs/doppel-bot#usage)
to replace your own CEO with an LLM today.

All the components—scraping, fine-tuning, inference and slack event handlers run
on Modal, and the code itself is open-source and available
[here](https://github.com/modal-labs/doppel-bot). If you're new to Modal, it's
worth reiterating that **all of these components are also serverless and scale
to zero**. This means that you can deploy and forget about them, because you'll
only pay for compute when your app is used!

## How it works

DoppelBot uses the Slack SDK to scrape messages from a Slack workspace, and
converts them into prompt/response pairs. It uses these to fine-tune a language
model using [Low-Rank Adaptation (LoRA)](https://arxiv.org/abs/2106.09685), a
technique that produces a small adapter that can be merged with the base model
when needed, instead of modifying all the parameters in the base model. The
fine-tuned adapters for each user are stored in a Modal
[Volume](/docs/guide/volumes). When a user \`@\`s the bot,
Slack sends a webhook call to Modal, which loads the adapter for that user and
generates a response.

We go into detail into each of these steps below, and provide commands for
running each of them individually. To follow along,
[clone the repo](https://github.com/modal-labs/doppel-bot) and
[set up a Slack token](https://github.com/modal-labs/doppel-bot#create-a-slack-app)
for yourself.

### Scraping slack

<GuideGithubLink url="https://github.com/modal-labs/doppel-bot/blob/main/src/scrape.py" />

The scraper uses Modal's [\`.map()\`](/docs/guide/scale#scaling-out) to fetch
messages from all public channels in parallel. Each thread is split into
contiguous messages from the target users and continguous messages from other
users. These will be fed into the model as prompts in the following format:

\`\`\`
[system]: You are {user}, employee at a fast-growing startup. Below is an input conversation that takes place in the company's internal Slack. Write a response that appropriately continues the conversation.

[user]: <slack thread>

[assistant]: <target user's response>
\`\`\`

Initial versions of the model were prone to generating short responses
—\xA0unsurprising, because a majority of Slack communication is pretty terse.
Adding a minimum character length for the target user's messages fixed this.

If you're following along at home, you can run the scraper with the following
command:

\`\`\`bash
modal run -m src.scrape::scrape --user="<user>"
\`\`\`

Scraped results are stored in a Modal
[Volume](/docs/guide/volumes), so they can be used by the next step.

### Fine-tuning

<GuideGithubLink url="https://github.com/modal-labs/doppel-bot/blob/main/src/finetune.py" />

Next, we use the prompts to fine-tune a language model. We chose
[Llama 3.1](https://ai.meta.com/blog/meta-llama-3-1/) because of its permissive license and high quality relative to its small size. Fine-tuning is
done using [Low-Rank Adaptation (LoRA)](https://arxiv.org/abs/2106.09685), a
[parameter-efficient fine-tuning](https://huggingface.co/blog/peft) technique
that produces a small adapter that can be merged with the base model when needed
(~60MB for the rank we're using).

Our fine-tuning implementation uses [torchtune](https://github.com/pytorch/torchtune), a new PyTorch library for easily configuring fine-tuning runs.

Because of the typically small sample sizes we're working with, training for
longer than a couple hundred steps (with our batch size of 128) quickly led to
overfitting. Admittedly, we haven't thoroughly evaluated the hyperparameter
space yet — do reach out to us if you're interested in collaborating on this!

![train-loss](../../assets/docs/train-loss.png)

To try this step yourself, run:

\`\`\`bash
modal run -m src.finetune --user="<user>"
\`\`\`

### Inference

<GuideGithubLink url="https://github.com/modal-labs/doppel-bot/blob/main/src/inference.py" />

We use [vLLM](https://github.com/vllm-project/vllm) as our inference engine, which now comes with support for dynamically swapping LoRA adapters [out of the box](https://docs.vllm.ai/en/latest/features/lora.html).

With parametrized functions, every user model gets its own pool of containers
that scales up when there are incoming requests, and scales to 0 when there's
none. Here's what that looks like stripped down to the essentials:

\`\`\`python notest
@app.cls(gpu="L40S")
class Model():
    @modal.enter()
    def enter(self):
        self.engine = AsyncLLMEngine.from_engine_args(AsyncEngineArgs(...))
        self.loras: dict[str, int] = dict()  # per replica LoRA identifier

    @modal.method()
    def generate(self, input: str):
        if (ident := f"{user}-{team_id}") not in self.loras:
            self.loras[ident] = len(self.loras) + 1

        lora_request = LoRARequest(
            ident, self.loras[ident], lora_local_path=checkpoint_path
        )

        tokenizer = await self.engine.get_tokenizer(lora_request=lora_request)

        prompt = tokenizer.apply_chat_template(
            conversation=inpt, tokenize=False, add_generation_prompt=True
        )

        results_generator = self.engine.generate(prompt, lora_request=lora_request,)
\`\`\`

If you've fine-tuned a model already in the previous step, you can run inference
using it now:

\`\`\`bash
modal run -m src.inference --user="<user>"
\`\`\`

(We have a list of sample inputs in the file, but you can also try it out with
your own messages!)

### Slack Bot

<GuideGithubLink url="https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py" />

Finally, it all comes together in
[\`bot.py\`](https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py). As
you might have guessed, all events from Slack are handled by serverless Modal
functions. We handle 3 types of events:

- [\`url_verification\`](https://github.com/modal-labs/doppel-bot/blob/24609583c43c0e722f56f85a1c00bb55b46c7754/src/bot.py#L112):
  To verify that this is a Slack app, Slack expects us to return a challenge
  string.
- [\`app_mention\`](https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py#L118):
  When the bot is mentioned in a channel, we retrieve the recent messages from
  that thread, do some basic cleaning and call the user's model to generate a
  response.

\`\`\`python notest
model = OpenLlamaModel.remote(user, team_id)
result = model.generate(messages)
\`\`\`

- [\`doppel\` slash command](https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py#L182):
  This command kicks off the scraping -> finetuning pipeline for the user.

To deploy the slackbot in its entirety, you need to run:

\`\`\`shell
modal deploy -m src.bot
\`\`\`

<div>

### Multi-Workspace Support

</div>

Everything we've talked about so far is for a single-workspace Slack app. To
make it work with multiple workspaces, we'll need to handle
[workspace installation and authentication with OAuth](https://api.slack.com/authentication/oauth-v2),
and also store some state for each workspace.

Luckily, Slack's [Bolt](https://slack.dev/bolt-python/concepts) framework
provides a complete (but frugally documented) OAuth implemention. A neat feature
is that the OAuth state can be backed by a file system, so all we need to do is
[point Bolt](https://github.com/modal-labs/doppel-bot/blob/24609583c43c0e722f56f85a1c00bb55b46c7754/src/bot.py#L78)
at a Modal [Volume](/docs/guide/volumes), and then we don't need to worry about
managing this state ourselves.

To store state for each workspace, we're using [Neon](https://neon.tech/), a
serverless Postgres database that's really easy to set up and _just works_. If
you're interested in developing a multi-workspace app,
[follow our instructions](https://github.com/modal-labs/doppel-bot#optional-multi-workspace-app)
on how to set up Neon with Modal.

## Next Steps

If you've made it this far, you have just found a way to increase your team's
productivity by 10x! Congratulations on the well-earned vacation! 🎉

If you're interested in learning more about Modal, check out our [docs](/docs)
and other [examples](/examples).
`,meta:{title:`DoppelBot: Fine-tune an LLM to replace your CEO`,description:`Fine-tune Llama on Slack messages to create a bot that mimics your writing style. Full serverless training and inference.`}},{description:C,toc:w,rawContent:T,meta:E}=S,ne=n(`<code>.map()</code>`),re=n(`<code>bot.py</code>`),ie=n(`<code>url_verification</code>`),ae=n(`<code>app_mention</code>`),oe=n(`<code>doppel</code> slash command`,1),se=n(`<!> <p><em>(quick links: <!>; <!>)</em></p> <p>Internally at Modal, we spend a <em>lot</em> of time talking to each other on Slack.
Now, with the advent of open-source large language models, we had started to
wonder if all of this wasn’t a bit redundant. Could we have these language
models bike-shed on Slack for us, so we could spend our time on higher leverage
activities such as <!> instead?</p> <p>To test this, we fine-tuned <!> on <!>’s Slack messages, and <code>@erik-bot</code> was
born.</p> <p><!></p> <p>Since then, <code>@erik-bot</code> has been an invaluable asset to us, in areas ranging
from <!> to <!> to thought leadership.</p> <p><!></p> <p>We were planning on releasing the weights for <code>@erik-bot</code> to the world, but all
our metrics have been going up and to the right a little too much since we’ve
launched him…</p> <p>So, we are releasing the next best thing. <code>DoppelBot</code> is a Slack bot that you
can install in your own workspace, and fine-tune on your own Slack messages.
Follow the instructions <!> to replace your own CEO with an LLM today.</p> <p>All the components—scraping, fine-tuning, inference and slack event handlers run
on Modal, and the code itself is open-source and available <!>. If you’re new to Modal, it’s
worth reiterating that <strong>all of these components are also serverless and scale
to zero</strong>. This means that you can deploy and forget about them, because you’ll
only pay for compute when your app is used!</p> <!> <p>DoppelBot uses the Slack SDK to scrape messages from a Slack workspace, and
converts them into prompt/response pairs. It uses these to fine-tune a language
model using <!>, a
technique that produces a small adapter that can be merged with the base model
when needed, instead of modifying all the parameters in the base model. The
fine-tuned adapters for each user are stored in a Modal <!>. When a user <code>@</code>s the bot,
Slack sends a webhook call to Modal, which loads the adapter for that user and
generates a response.</p> <p>We go into detail into each of these steps below, and provide commands for
running each of them individually. To follow along, <!> and <!> for yourself.</p> <!> <!> <p>The scraper uses Modal’s <!> to fetch
messages from all public channels in parallel. Each thread is split into
contiguous messages from the target users and continguous messages from other
users. These will be fed into the model as prompts in the following format:</p> <!> <p>Initial versions of the model were prone to generating short responses
—\xA0unsurprising, because a majority of Slack communication is pretty terse.
Adding a minimum character length for the target user’s messages fixed this.</p> <p>If you’re following along at home, you can run the scraper with the following
command:</p> <!> <p>Scraped results are stored in a Modal <!>, so they can be used by the next step.</p> <!> <!> <p>Next, we use the prompts to fine-tune a language model. We chose <!> because of its permissive license and high quality relative to its small size. Fine-tuning is
done using <!>, a <!> technique
that produces a small adapter that can be merged with the base model when needed
(~60MB for the rank we’re using).</p> <p>Our fine-tuning implementation uses <!>, a new PyTorch library for easily configuring fine-tuning runs.</p> <p>Because of the typically small sample sizes we’re working with, training for
longer than a couple hundred steps (with our batch size of 128) quickly led to
overfitting. Admittedly, we haven’t thoroughly evaluated the hyperparameter
space yet — do reach out to us if you’re interested in collaborating on this!</p> <p><!></p> <p>To try this step yourself, run:</p> <!> <!> <!> <p>We use <!> as our inference engine, which now comes with support for dynamically swapping LoRA adapters <!>.</p> <p>With parametrized functions, every user model gets its own pool of containers
that scales up when there are incoming requests, and scales to 0 when there’s
none. Here’s what that looks like stripped down to the essentials:</p> <!> <p>If you’ve fine-tuned a model already in the previous step, you can run inference
using it now:</p> <!> <p>(We have a list of sample inputs in the file, but you can also try it out with
your own messages!)</p> <!> <!> <p>Finally, it all comes together in <!>. As
you might have guessed, all events from Slack are handled by serverless Modal
functions. We handle 3 types of events:</p> <ul><li><!>:
To verify that this is a Slack app, Slack expects us to return a challenge
string.</li> <li><!>:
When the bot is mentioned in a channel, we retrieve the recent messages from
that thread, do some basic cleaning and call the user’s model to generate a
response.</li></ul> <!> <ul><li><!>:
This command kicks off the scraping -> finetuning pipeline for the user.</li></ul> <p>To deploy the slackbot in its entirety, you need to run:</p> <!> <div><!></div> <p>Everything we’ve talked about so far is for a single-workspace Slack app. To
make it work with multiple workspaces, we’ll need to handle <!>,
and also store some state for each workspace.</p> <p>Luckily, Slack’s <!> framework
provides a complete (but frugally documented) OAuth implemention. A neat feature
is that the OAuth state can be backed by a file system, so all we need to do is <!> at a Modal <!>, and then we don’t need to worry about
managing this state ourselves.</p> <p>To store state for each workspace, we’re using <!>, a
serverless Postgres database that’s really easy to set up and <em>just works</em>. If
you’re interested in developing a multi-workspace app, <!> on how to set up Neon with Modal.</p> <!> <p>If you’ve made it this far, you have just found a way to increase your team’s
productivity by 10x! Congratulations on the well-earned vacation! 🎉</p> <p>If you’re interested in learning more about Modal, check out our <!> and other <!>.</p>`,1);function D(t,n){let l=o(n,[`children`,`$$slots`,`$$events`,`$$legacy`]);v(t,s(()=>l,()=>S,{children:(t,n)=>{var o=se(),s=c(o);ee(s,{id:`doppelbot-fine-tune-an-llm-to-replace-your-ceo`,children:(e,t)=>{f(),a(e,i(`DoppelBot: Fine-tune an LLM to replace your CEO`))},$$slots:{default:!0}});var l=d(s,2),u=e(l),p=d(e(u));y(p,{href:`https://github.com/modal-labs/doppel-bot#usage`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`add to your own Slack`))},$$slots:{default:!0}}),y(d(p,2),{href:`https://github.com/modal-labs/doppel-bot`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`source code`))},$$slots:{default:!0}}),f(),r(u),r(l);var v=d(l,2);y(d(e(v),3),{href:`https://x.com/modal/status/1642262543757352960`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`paddleboarding in Tahiti`))},$$slots:{default:!0}}),f(),r(v);var b=d(v,2),S=d(e(b));y(S,{href:`https://ai.meta.com/blog/meta-llama-3-1/`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Llama 3.1`))},$$slots:{default:!0}}),y(d(S,2),{href:`https://twitter.com/bernhardsson`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Erik`))},$$slots:{default:!0}}),f(3),r(b);var C=d(b,2);g(e(C),{src:`https://modal-cdn.com/erik-bot-1.jpeg`,alt:`erik-bot`}),r(C);var w=d(C,2),T=d(e(w),3);y(T,{href:`https://modal-cdn.com/erik-bot-2.png`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`API design`))},$$slots:{default:!0}}),y(d(T,2),{href:`https://modal-cdn.com/erik-bot-3.png`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`legal advice`))},$$slots:{default:!0}}),f(),r(w);var E=d(w,2);g(e(E),{src:`https://modal-cdn.com/erik-bot-4.png`,alt:`erik-bot-3`}),r(E);var D=d(E,4);y(d(e(D),3),{href:`https://github.com/modal-labs/doppel-bot#usage`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`here`))},$$slots:{default:!0}}),f(),r(D);var O=d(D,2);y(d(e(O)),{href:`https://github.com/modal-labs/doppel-bot`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`here`))},$$slots:{default:!0}}),f(3),r(O);var ce=d(O,2);m(ce,{id:`how-it-works`,children:(e,t)=>{f(),a(e,i(`How it works`))},$$slots:{default:!0}});var k=d(ce,2),le=d(e(k));y(le,{href:`https://arxiv.org/abs/2106.09685`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Low-Rank Adaptation (LoRA)`))},$$slots:{default:!0}}),y(d(le,2),{href:`/docs/guide/volumes`,children:(e,t)=>{f(),a(e,i(`Volume`))},$$slots:{default:!0}}),f(3),r(k);var A=d(k,2),ue=d(e(A));y(ue,{href:`https://github.com/modal-labs/doppel-bot`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`clone the repo`))},$$slots:{default:!0}}),y(d(ue,2),{href:`https://github.com/modal-labs/doppel-bot#create-a-slack-app`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`set up a Slack token`))},$$slots:{default:!0}}),f(),r(A);var de=d(A,2);h(de,{id:`scraping-slack`,children:(e,t)=>{f(),a(e,i(`Scraping slack`))},$$slots:{default:!0}});var fe=d(de,2);x(fe,{url:`https://github.com/modal-labs/doppel-bot/blob/main/src/scrape.py`});var j=d(fe,2);y(d(e(j)),{href:`/docs/guide/scale#scaling-out`,children:(e,t)=>{a(e,ne())},$$slots:{default:!0}}),f(),r(j);var M=d(j,2);_(M,{code:`%5Bsystem%5D%3A%20You%20are%20%7Buser%7D%2C%20employee%20at%20a%20fast-growing%20startup.%20Below%20is%20an%20input%20conversation%20that%20takes%20place%20in%20the%20company's%20internal%20Slack.%20Write%20a%20response%20that%20appropriately%20continues%20the%20conversation.%0A%0A%5Buser%5D%3A%20%3Cslack%20thread%3E%0A%0A%5Bassistant%5D%3A%20%3Ctarget%20user's%20response%3E`,lang:`text`});var N=d(M,6);_(N,{code:`modal%20run%20-m%20src.scrape%3A%3Ascrape%20--user%3D%22%3Cuser%3E%22`,lang:`bash`});var P=d(N,2);y(d(e(P)),{href:`/docs/guide/volumes`,children:(e,t)=>{f(),a(e,i(`Volume`))},$$slots:{default:!0}}),f(),r(P);var F=d(P,2);h(F,{id:`fine-tuning`,children:(e,t)=>{f(),a(e,i(`Fine-tuning`))},$$slots:{default:!0}});var I=d(F,2);x(I,{url:`https://github.com/modal-labs/doppel-bot/blob/main/src/finetune.py`});var L=d(I,2),R=d(e(L));y(R,{href:`https://ai.meta.com/blog/meta-llama-3-1/`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Llama 3.1`))},$$slots:{default:!0}});var z=d(R,2);y(z,{href:`https://arxiv.org/abs/2106.09685`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Low-Rank Adaptation (LoRA)`))},$$slots:{default:!0}}),y(d(z,2),{href:`https://huggingface.co/blog/peft`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`parameter-efficient fine-tuning`))},$$slots:{default:!0}}),f(),r(L);var B=d(L,2);y(d(e(B)),{href:`https://github.com/pytorch/torchtune`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`torchtune`))},$$slots:{default:!0}}),f(),r(B);var V=d(B,4);g(e(V),{get src(){return te},alt:`train-loss`}),r(V);var H=d(V,4);_(H,{code:`modal%20run%20-m%20src.finetune%20--user%3D%22%3Cuser%3E%22`,lang:`bash`});var U=d(H,2);h(U,{id:`inference`,children:(e,t)=>{f(),a(e,i(`Inference`))},$$slots:{default:!0}});var W=d(U,2);x(W,{url:`https://github.com/modal-labs/doppel-bot/blob/main/src/inference.py`});var G=d(W,2),pe=d(e(G));y(pe,{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`vLLM`))},$$slots:{default:!0}}),y(d(pe,2),{href:`https://docs.vllm.ai/en/latest/features/lora.html`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`out of the box`))},$$slots:{default:!0}}),f(),r(G);var me=d(G,4);_(me,{code:`%40app.cls(gpu%3D%22L40S%22)%0Aclass%20Model()%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20enter(self)%3A%0A%20%20%20%20%20%20%20%20self.engine%20%3D%20AsyncLLMEngine.from_engine_args(AsyncEngineArgs(...))%0A%20%20%20%20%20%20%20%20self.loras%3A%20dict%5Bstr%2C%20int%5D%20%3D%20dict()%20%20%23%20per%20replica%20LoRA%20identifier%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20input%3A%20str)%3A%0A%20%20%20%20%20%20%20%20if%20(ident%20%3A%3D%20f%22%7Buser%7D-%7Bteam_id%7D%22)%20not%20in%20self.loras%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.loras%5Bident%5D%20%3D%20len(self.loras)%20%2B%201%0A%0A%20%20%20%20%20%20%20%20lora_request%20%3D%20LoRARequest(%0A%20%20%20%20%20%20%20%20%20%20%20%20ident%2C%20self.loras%5Bident%5D%2C%20lora_local_path%3Dcheckpoint_path%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20tokenizer%20%3D%20await%20self.engine.get_tokenizer(lora_request%3Dlora_request)%0A%0A%20%20%20%20%20%20%20%20prompt%20%3D%20tokenizer.apply_chat_template(%0A%20%20%20%20%20%20%20%20%20%20%20%20conversation%3Dinpt%2C%20tokenize%3DFalse%2C%20add_generation_prompt%3DTrue%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%20%20%20%20results_generator%20%3D%20self.engine.generate(prompt%2C%20lora_request%3Dlora_request%2C)`,lang:`python`});var he=d(me,4);_(he,{code:`modal%20run%20-m%20src.inference%20--user%3D%22%3Cuser%3E%22`,lang:`bash`});var ge=d(he,4);h(ge,{id:`slack-bot`,children:(e,t)=>{f(),a(e,i(`Slack Bot`))},$$slots:{default:!0}});var _e=d(ge,2);x(_e,{url:`https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py`});var K=d(_e,2);y(d(e(K)),{href:`https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py`,rel:`nofollow`,children:(e,t)=>{a(e,re())},$$slots:{default:!0}}),f(),r(K);var q=d(K,2),J=e(q);y(e(J),{href:`https://github.com/modal-labs/doppel-bot/blob/24609583c43c0e722f56f85a1c00bb55b46c7754/src/bot.py#L112`,rel:`nofollow`,children:(e,t)=>{a(e,ie())},$$slots:{default:!0}}),f(),r(J);var ve=d(J,2);y(e(ve),{href:`https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py#L118`,rel:`nofollow`,children:(e,t)=>{a(e,ae())},$$slots:{default:!0}}),f(),r(ve),r(q);var ye=d(q,2);_(ye,{code:`model%20%3D%20OpenLlamaModel.remote(user%2C%20team_id)%0Aresult%20%3D%20model.generate(messages)`,lang:`python`});var Y=d(ye,2),be=e(Y);y(e(be),{href:`https://github.com/modal-labs/doppel-bot/blob/main/src/bot.py#L182`,rel:`nofollow`,children:(e,t)=>{var n=oe();f(),a(e,n)},$$slots:{default:!0}}),f(),r(be),r(Y);var xe=d(Y,4);_(xe,{code:`modal%20deploy%20-m%20src.bot`,lang:`shell`});var X=d(xe,2);h(e(X),{id:`multi-workspace-support`,children:(e,t)=>{f(),a(e,i(`Multi-Workspace Support`))},$$slots:{default:!0}}),r(X);var Z=d(X,2);y(d(e(Z)),{href:`https://api.slack.com/authentication/oauth-v2`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`workspace installation and authentication with OAuth`))},$$slots:{default:!0}}),f(),r(Z);var Q=d(Z,2),Se=d(e(Q));y(Se,{href:`https://slack.dev/bolt-python/concepts`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Bolt`))},$$slots:{default:!0}});var Ce=d(Se,2);y(Ce,{href:`https://github.com/modal-labs/doppel-bot/blob/24609583c43c0e722f56f85a1c00bb55b46c7754/src/bot.py#L78`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`point Bolt`))},$$slots:{default:!0}}),y(d(Ce,2),{href:`/docs/guide/volumes`,children:(e,t)=>{f(),a(e,i(`Volume`))},$$slots:{default:!0}}),f(),r(Q);var $=d(Q,2),we=d(e($));y(we,{href:`https://neon.tech/`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`Neon`))},$$slots:{default:!0}}),y(d(we,4),{href:`https://github.com/modal-labs/doppel-bot#optional-multi-workspace-app`,rel:`nofollow`,children:(e,t)=>{f(),a(e,i(`follow our instructions`))},$$slots:{default:!0}}),f(),r($);var Te=d($,2);m(Te,{id:`next-steps`,children:(e,t)=>{f(),a(e,i(`Next Steps`))},$$slots:{default:!0}});var Ee=d(Te,4),De=d(e(Ee));y(De,{href:`/docs`,children:(e,t)=>{f(),a(e,i(`docs`))},$$slots:{default:!0}}),y(d(De,2),{href:`/examples`,children:(e,t)=>{f(),a(e,i(`examples`))},$$slots:{default:!0}}),f(),r(Ee),a(t,o)},$$slots:{default:!0}}))}export{D as default,S as metadata};
//# sourceMappingURL=CcxC1R7e.js.map
