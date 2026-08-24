(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`088d5089-f192-45a5-882f-729a8b623b0f`,e._sentryDebugIdIdentifier=`sentry-dbid-088d5089-f192-45a5-882f-729a8b623b0f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Product updates: WebSocket support, interactive commands & more`,description:`We've been busy in 2024 so far, bringing you WebSockets, interactive commands, H100s and more. Learn about what's new at Modal.`,date:`2024-02-15T12:00:00.000Z`,published:!0,length:`2 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`🐚 Interactive commands`,id:`-interactive-commands`},{depth:2,value:`🔗 WebSocket support`,id:`-websocket-support`},{depth:2,value:`🚀 H100 GPUs`,id:`-h100-gpus`},{depth:2,value:`👩‍💻 Client updates`,id:`-client-updates`},{depth:2,value:`🍉 Fresh examples`,id:`-fresh-examples`}],rawContent:`We've been busy in 2024 so far, bringing you WebSockets, interactive commands,
H100s and more. Learn about what's new at Modal.

## 🐚 Interactive commands

You can use \`modal container exec\` to run interactive commands inside active
Modal containers. Inspect the filesystem of an in-progress job, monitor
processes, or debug environment issues.

<Cta href="https://modal.com/docs/guide/developing-debugging#modal-container-exec" primary>Read
the docs</Cta>

![Demo of container exec feature](https://modal-cdn.com/cdnbot/modal-exec.gif)

## 🔗 WebSocket support

Modal functions now support the WebSocket protocol. This unlocks the ability to
host frameworks like
[Streamlit](https://modal.com/docs/examples/serve_streamlit)
out of the box. Stay tuned
for more native WebSocket-based Modal examples.

<Cta href="https://modal.com/docs/guide/webhooks#websockets" primary>Read the
docs</Cta>

![Uber pickups image](https://modal-cdn.com/cdnbot/uber-pickups.png)

## 🚀 H100 GPUs

You asked, and we delivered. H100s are now available on Modal!

<Cta href="https://modal.com/blog/introducing-h100" primary>Read the
announcement</Cta>

![Code example of using H100](https://modal-cdn.com/cdnbot/h100-code-snippet.jpg)

## 👩‍💻 Client updates

\`pip install --upgrade modal\` to get the latest features:

- [@build Decorated-based lifecycle hooks](https://modal.com/docs/guide/lifecycle-functions#build)
- **Volumes** can now have automatic
  [background commits](https://modal.com/docs/guide/volumes#background-commits).
- **Volumes** have more
  [CLI commands](https://modal.com/docs/reference/cli/volume) including get, put
  and rm.
- **Sandboxes** support
  [lookup from ID](https://modal.com/docs/reference/modal.Sandbox#from_id),
  [terminate](https://modal.com/docs/reference/modal.Sandbox#terminate) and
  [poll](https://modal.com/docs/reference/modal.Sandbox#poll).
- [with image.imports()](https://modal.com/docs/guide/images#importing-python-packages)
  for declaring global image-specific imports
- [Image.from_registry](https://modal.com/docs/reference/modal.Image#from_registry)
  supports private Docker registry authentication.
- **Dicts** can now be
  [cleared](https://modal.com/docs/reference/modal.Dict#clear).

Want more updates? The Modal client now has a
[detailed changelog](https://modal.com/docs/reference/changelog).

## 🍉 Fresh examples

- [Turbo.art, a playground for creative exploration](https://turbo.art/)
- [Embedding English Wikipedia in under 15 minutes](https://modal.com/blog/embedding-wikipedia)
- [How to fine-tune an LLM on Modal](https://modal.com/docs/examples/llm-finetuning)

If you've built anything else using Modal, share it with us on the community
[Slack](https://modal.com/slack).
`,meta:{description:`We've been busy in 2024 so far, bringing you WebSockets, interactive commands, H100s and more. Learn about what's new at Modal.`}},{title:h,description:g,date:_,published:v,length:y,category:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>We’ve been busy in 2024 so far, bringing you WebSockets, interactive commands,
H100s and more. Learn about what’s new at Modal.</p> <h2 id="-interactive-commands">🐚 Interactive commands</h2> <p>You can use <code>modal container exec</code> to run interactive commands inside active
Modal containers. Inspect the filesystem of an in-progress job, monitor
processes, or debug environment issues.</p> <!> <p><!></p> <h2 id="-websocket-support">🔗 WebSocket support</h2> <p>Modal functions now support the WebSocket protocol. This unlocks the ability to
host frameworks like <!> out of the box. Stay tuned
for more native WebSocket-based Modal examples.</p> <!> <p><!></p> <h2 id="-h100-gpus">🚀 H100 GPUs</h2> <p>You asked, and we delivered. H100s are now available on Modal!</p> <!> <p><!></p> <h2 id="-client-updates">👩‍💻 Client updates</h2> <p><code>pip install --upgrade modal</code> to get the latest features:</p> <ul><li><!></li> <li><strong>Volumes</strong> can now have automatic <!>.</li> <li><strong>Volumes</strong> have more <!> including get, put
and rm.</li> <li><strong>Sandboxes</strong> support <!>, <!> and <!>.</li> <li><!> for declaring global image-specific imports</li> <li><!> supports private Docker registry authentication.</li> <li><strong>Dicts</strong> can now be <!>.</li></ul> <p>Want more updates? The Modal client now has a <!>.</p> <h2 id="-fresh-examples">🍉 Fresh examples</h2> <ul><li><!></li> <li><!></li> <li><!></li></ul> <p>If you’ve built anything else using Modal, share it with us on the community <!>.</p>`,1);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),6);f(p,{href:`https://modal.com/docs/guide/developing-debugging#modal-container-exec`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read
the docs`))},$$slots:{default:!0}});var m=c(p,2);u(e(m),{src:`https://modal-cdn.com/cdnbot/modal-exec.gif`,alt:`Demo of container exec feature`}),n(m);var h=c(m,4);d(c(e(h)),{href:`https://modal.com/docs/examples/serve_streamlit`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Streamlit`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);f(g,{href:`https://modal.com/docs/guide/webhooks#websockets`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the
docs`))},$$slots:{default:!0}});var _=c(g,2);u(e(_),{src:`https://modal-cdn.com/cdnbot/uber-pickups.png`,alt:`Uber pickups image`}),n(_);var v=c(_,6);f(v,{href:`https://modal.com/blog/introducing-h100`,primary:!0,children:(e,t)=>{l(),i(e,r(`Read the
announcement`))},$$slots:{default:!0}});var y=c(v,2);u(e(y),{src:`https://modal-cdn.com/cdnbot/h100-code-snippet.jpg`,alt:`Code example of using H100`}),n(y);var b=c(y,6),x=e(b);d(e(x),{href:`https://modal.com/docs/guide/lifecycle-functions#build`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`@build Decorated-based lifecycle hooks`))},$$slots:{default:!0}}),n(x);var S=c(x,2);d(c(e(S),2),{href:`https://modal.com/docs/guide/volumes#background-commits`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`background commits`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);d(c(e(C),2),{href:`https://modal.com/docs/reference/cli/volume`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CLI commands`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,2),E=c(e(w),2);d(E,{href:`https://modal.com/docs/reference/modal.Sandbox#from_id`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`lookup from ID`))},$$slots:{default:!0}});var D=c(E,2);d(D,{href:`https://modal.com/docs/reference/modal.Sandbox#terminate`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`terminate`))},$$slots:{default:!0}}),d(c(D,2),{href:`https://modal.com/docs/reference/modal.Sandbox#poll`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`poll`))},$$slots:{default:!0}}),l(),n(w);var O=c(w,2);d(e(O),{href:`https://modal.com/docs/guide/images#importing-python-packages`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`with image.imports()`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);d(e(k),{href:`https://modal.com/docs/reference/modal.Image#from_registry`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image.from_registry`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);d(c(e(A),2),{href:`https://modal.com/docs/reference/modal.Dict#clear`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`cleared`))},$$slots:{default:!0}}),l(),n(A),n(b);var j=c(b,2);d(c(e(j)),{href:`https://modal.com/docs/reference/changelog`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`detailed changelog`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,4),N=e(M);d(e(N),{href:`https://turbo.art/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Turbo.art, a playground for creative exploration`))},$$slots:{default:!0}}),n(N);var P=c(N,2);d(e(P),{href:`https://modal.com/blog/embedding-wikipedia`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Embedding English Wikipedia in under 15 minutes`))},$$slots:{default:!0}}),n(P);var F=c(P,2);d(e(F),{href:`https://modal.com/docs/examples/llm-finetuning`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`How to fine-tune an LLM on Modal`))},$$slots:{default:!0}}),n(F),n(M);var I=c(M,2);d(c(e(I)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Slack`))},$$slots:{default:!0}}),l(),n(I),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=Gpg7IFRg.js.map
