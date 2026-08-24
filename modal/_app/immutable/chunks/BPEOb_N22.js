(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2a71742e-6064-4f3e-a4f8-394cb15881d7`,e._sentryDebugIdIdentifier=`sentry-dbid-2a71742e-6064-4f3e-a4f8-394cb15881d7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import{t as d}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./DeWGVqas2.js";import{t as m}from"./CdZDxCfO2.js";var h={title:`How Quora uses Modal to run thousands of Python sandboxes simultaneously`,description:`Quora is building Poe, a platform where anyone can deploy a public AI chatbot. Quora uses Modal Sandboxes at scale to safely run LLM-generated code in the context of user chats.`,date:`2025-06-30T12:00:00.000Z`,length:`3 minute read`,category:`Customer Stories`,published:!0,layout:`blog`,toc:[{depth:2,value:`Hello, Poe`,id:`hello-poe`},{depth:2,value:`A code interpreter for Poe`,id:`a-code-interpreter-for-poe`},{depth:2,value:`A Modal Function by any other name`,id:`a-modal-function-by-any-other-name`},{depth:2,value:`Build fast like Quora`,id:`build-fast-like-quora`}],rawContent:`[Quora](https://www.quora.com/) is a Q&A platform where users can ask, answer, and peruse questions on a variety of topics. With 400 million monthly unique visitors, it’s an invaluable contributor to the world’s knowledge-sharing. Quora uses [Modal Sandboxes](/docs/guide/sandboxes) to securely execute LLM-generated code in Poe, their AI chatbot platform. The team shipped months earlier using Modal rather than building in-house. They're also saving an ongoing 2 engineers' worth of infrastructure maintenance time!

## Hello, Poe

In 2023, Quora launched [Poe](https://poe.com/), an AI chatbot platform where anyone can deploy a public chatbot. With millions of monthly active users, Poe is the default destination for many AI builders to experiment with different models. Quora has since raised $75M to keep expanding Poe.

## A code interpreter for Poe

Many of the LLM bots in Poe can generate code, and users expected to run that code in Poe rather than copy-pasting it to their editors. The Quora team needed a way to safely execute code in Poe in a completely isolated way, keeping that code separate from both the main Quora infrastructure and any other user’s session.

![poe gif](https://modal-cdn.com/blog/images/poe.gif)
<modal-img-caption>
In-chat Python execution in a Poe chatbot
</modal-img-caption>

There were three key requirements for this feature.

1. Security, since LLM-generated code can’t be trusted by default.
2. Low latency, since chatbot responses need to be fast in order to feel conversational.
3. Reliability, since the product has millions of users and is expected to be polished.

Low latency, reliable systems are effortful to construct. While a basic sandbox prototype would have been easy to build, the Quora team knew that orchestrating a fast-scaling system for millions of users would have taken months. And that was just considering the core code execution primitive. If they wanted security features like outbound networking restrictions or debugging features like container-level observability, that would have taken even longer.

Modal’s Sandbox product was fully featured and scalable right out of the box. Quora was already familiar with Modal and, due to Modal’s superior reliability over alternatives, had it recommended as the default deployment solution for users publishing their own Poe bots. This gave Quora the confidence to expand their usage into Modal Sandboxes.

<Quote authorName="Hwan Seung Yeo" authorTitle="Director of Engineering">
    <span>
        There would be a lot of edge cases and unknowns if we built code sandboxes ourselves: dealing with setting separate environments, minimizing risk areas—this is not just for set-up but needs continuous consideration. We offloaded this to Modal and are actively saving 2 engineers' worth of ongoing engineering time.
    </span>
</Quote>

## A Modal Function by any other name

[Modal Sandboxes](/docs/guide/sandboxes) are really just our core primitive—Modal Functions—minus our client running inside of them. This means that Quora got a battle-tested and continuously improving product right out of the box.

✅\xA0Modal’s custom container stack, which we have invested years into making robust and secure, is already built on gVisor for enterprise-grade container isolation.

✅\xA0Fast scalability is built in. Quora stress-tested Sandbox creation throughput to 1000 Sandboxes per second with no issue, allowing them to support thousands of users who might be generating code at any given point in time.

✅\xA0Powerful [networking primitives](/docs/guide/sandbox-networking) like Tunnels and IP allowlisting come for free, too, allowing Quora to have full customizability and control over Sandbox communications.

This is just the beginning. The Poe team is working on an under-the-wraps new product that will also leverage Modal Sandboxes for code execution. We’re looking forward to sharing more once they launch!

## Build fast like Quora

Want to ship LLM coding features in days rather than months? Get started today with [Modal Sandboxes](/docs/guide/sandboxes).

1. Install Modal:\xA0\`pip install modal\`
2. Create an account:\xA0\`python -m modal setup\`
3. Run:

\`\`\`python
import modal
app = modal.App.lookup("sandbox-manager", create_if_missing=True)
sb = modal.Sandbox.create(app=app)

p = sb.exec("python", "-c", "print('hello')")
print(p.stdout.read())
sb.terminate()
\`\`\`
`,meta:{description:`Quora is building Poe, a platform where anyone can deploy a public AI chatbot. Quora uses Modal Sandboxes at scale to safely run LLM-generated code in the context of user chats.`}},{title:g,description:_,date:v,length:y,category:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=h,E=t(`<span>There would be a lot of edge cases and unknowns if we built code sandboxes ourselves: dealing with setting separate environments, minimizing risk areas—this is not just for set-up but needs continuous consideration. We offloaded this to Modal and are actively saving 2 engineers' worth of ongoing engineering time.</span>`),D=t(`<p><!> is a Q&A platform where users can ask, answer, and peruse questions on a variety of topics. With 400 million monthly unique visitors, it’s an invaluable contributor to the world’s knowledge-sharing. Quora uses <!> to securely execute LLM-generated code in Poe, their AI chatbot platform. The team shipped months earlier using Modal rather than building in-house. They’re also saving an ongoing 2 engineers’ worth of infrastructure maintenance time!</p> <h2 id="hello-poe">Hello, Poe</h2> <p>In 2023, Quora launched <!>, an AI chatbot platform where anyone can deploy a public chatbot. With millions of monthly active users, Poe is the default destination for many AI builders to experiment with different models. Quora has since raised $75M to keep expanding Poe.</p> <h2 id="a-code-interpreter-for-poe">A code interpreter for Poe</h2> <p>Many of the LLM bots in Poe can generate code, and users expected to run that code in Poe rather than copy-pasting it to their editors. The Quora team needed a way to safely execute code in Poe in a completely isolated way, keeping that code separate from both the main Quora infrastructure and any other user’s session.</p> <p><!> <modal-img-caption>In-chat Python execution in a Poe chatbot</modal-img-caption></p> <p>There were three key requirements for this feature.</p> <ol><li>Security, since LLM-generated code can’t be trusted by default.</li> <li>Low latency, since chatbot responses need to be fast in order to feel conversational.</li> <li>Reliability, since the product has millions of users and is expected to be polished.</li></ol> <p>Low latency, reliable systems are effortful to construct. While a basic sandbox prototype would have been easy to build, the Quora team knew that orchestrating a fast-scaling system for millions of users would have taken months. And that was just considering the core code execution primitive. If they wanted security features like outbound networking restrictions or debugging features like container-level observability, that would have taken even longer.</p> <p>Modal’s Sandbox product was fully featured and scalable right out of the box. Quora was already familiar with Modal and, due to Modal’s superior reliability over alternatives, had it recommended as the default deployment solution for users publishing their own Poe bots. This gave Quora the confidence to expand their usage into Modal Sandboxes.</p> <!> <h2 id="a-modal-function-by-any-other-name">A Modal Function by any other name</h2> <p><!> are really just our core primitive—Modal Functions—minus our client running inside of them. This means that Quora got a battle-tested and continuously improving product right out of the box.</p> <p>✅\xA0Modal’s custom container stack, which we have invested years into making robust and secure, is already built on gVisor for enterprise-grade container isolation.</p> <p>✅\xA0Fast scalability is built in. Quora stress-tested Sandbox creation throughput to 1000 Sandboxes per second with no issue, allowing them to support thousands of users who might be generating code at any given point in time.</p> <p>✅\xA0Powerful <!> like Tunnels and IP allowlisting come for free, too, allowing Quora to have full customizability and control over Sandbox communications.</p> <p>This is just the beginning. The Poe team is working on an under-the-wraps new product that will also leverage Modal Sandboxes for code execution. We’re looking forward to sharing more once they launch!</p> <h2 id="build-fast-like-quora">Build fast like Quora</h2> <p>Want to ship LLM coding features in days rather than months? Get started today with <!>.</p> <ol><li>Install Modal:\xA0<code>pip install modal</code></li> <li>Create an account:\xA0<code>python -m modal setup</code></li> <li>Run:</li></ol> <!>`,3);function O(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>_,()=>h,{children:(t,a)=>{var o=D(),m=s(o),h=e(m);p(h,{href:`https://www.quora.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Quora`))},$$slots:{default:!0}}),p(c(h,2),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),l(),n(m);var g=c(m,4);p(c(e(g)),{href:`https://poe.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Poe`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,6),v=e(_);d(v,{src:`https://modal-cdn.com/blog/images/poe.gif`,alt:`poe gif`}),c(v,2),n(_);var y=c(_,10);u(y,{authorName:`Hwan Seung Yeo`,authorTitle:`Director of Engineering`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var b=c(y,4);p(e(b),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,6);p(c(e(x)),{href:`/docs/guide/sandbox-networking`,children:(e,t)=>{l(),i(e,r(`networking primitives`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,6);p(c(e(S)),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),l(),n(S),f(c(S,4),{code:`import%20modal%0Aapp%20%3D%20modal.App.lookup(%22sandbox-manager%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0Ap%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20%22print('hello')%22)%0Aprint(p.stdout.read())%0Asb.terminate()`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{O as default,h as metadata};
//# sourceMappingURL=BPEOb_N22.js.map
