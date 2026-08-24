(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`38875438-f7d6-49c3-acbc-75731a7ecf1a`,e._sentryDebugIdIdentifier=`sentry-dbid-38875438-f7d6-49c3-acbc-75731a7ecf1a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,i as f,o as p}from"./CPby7b1n.js";import{t as m}from"./BILrvr3I.js";import{t as h}from"./B4L_if842.js";import{t as g}from"./DeWGVqas2.js";var _={toc:[{depth:1,value:`Jupyter notebooks`,id:`jupyter-notebooks`,children:[{depth:2,value:`Modal inside Jupyter`,id:`modal-inside-jupyter`,children:[{depth:3,value:`Known issues`,id:`known-issues`}]},{depth:2,value:`Jupyter inside Modal`,id:`jupyter-inside-modal`},{depth:2,value:`Further examples`,id:`further-examples`}]}],rawContent:`# Jupyter notebooks

This guide page documents integrations between Jupyter notebooks and Modal.

<Callout variant="info">

For our hosted notebooks product with real-time collaboration, see [Modal Notebooks](/docs/guide/notebooks).

</Callout>

## Modal inside Jupyter

You can use the Modal client library in notebook environments like Jupyter! Just
\`import modal\` and use as normal. You will likely need to use [\`app.run\`](/docs/guide/apps#ephemeral-apps) to create an ephemeral App to run your Functions:

\`\`\`python,notest
# Cell 1

import modal

app = modal.App()

@app.function()
def my_function(x):
    ...

# Cell 2

with modal.enable_output():
    with app.run():
        my_function.remote(42)
\`\`\`

### Known issues

- **Interactive shell and interactive functions are not supported.**

  These can only be run within a live terminal session, so they are not
  supported in notebooks.

- **Local and remote Python versions must match.**

  When defining Modal Functions in a Jupyter notebook, the Function automatically
  has \`serialized=True\` set. This implies that the versions of Python and any third-
  party libraries used in your Modal container must match the version you have locally,
  so that the Function can be deserialized remotely without errors.

If you encounter issues not documented above, try restarting the notebook kernel, as it may be
in a broken state, which is common in notebook development.

If the issue persists, contact us [in our Slack](https://modal.com/slack).

We are working on removing these known issues so that writing Modal applications
in a notebook feels just like developing in regular Python modules and scripts.

## Jupyter inside Modal

You can run Jupyter in Modal using the \`modal launch\` command. For example:

\`\`\`
$ modal launch jupyter --gpu a10g
\`\`\`

That will start a Jupyter instance with an A10G GPU attached. You'll be able to
access the app with via a
[Modal Tunnel URL](https://modal.com/docs/guide/tunnels). Jupyter
will stop running whenever you stop Modal call in your terminal.

See \`--help\` for additional options.

## Further examples

- [Basic demonstration of running Modal in a notebook](https://github.com/modal-labs/modal-examples/blob/main/11_notebooks/basic.ipynb)
- [Running Jupyter server within a Modal Function](https://github.com/modal-labs/modal-examples/blob/main/11_notebooks/jupyter_inside_modal.py)
`,meta:{title:`Jupyter notebooks`,description:`This guide page documents integrations between Jupyter notebooks and Modal.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<p>For our hosted notebooks product with real-time collaboration, see <!>.</p>`),S=t(`<code>app.run</code>`),C=t(`<!> <p>This guide page documents integrations between Jupyter notebooks and Modal.</p> <!> <!> <p>You can use the Modal client library in notebook environments like Jupyter! Just <code>import modal</code> and use as normal. You will likely need to use <!> to create an ephemeral App to run your Functions:</p> <!> <!> <ul><li><p><strong>Interactive shell and interactive functions are not supported.</strong></p> <p>These can only be run within a live terminal session, so they are not
supported in notebooks.</p></li> <li><p><strong>Local and remote Python versions must match.</strong></p> <p>When defining Modal Functions in a Jupyter notebook, the Function automatically
has <code>serialized=True</code> set. This implies that the versions of Python and any third-
party libraries used in your Modal container must match the version you have locally,
so that the Function can be deserialized remotely without errors.</p></li></ul> <p>If you encounter issues not documented above, try restarting the notebook kernel, as it may be
in a broken state, which is common in notebook development.</p> <p>If the issue persists, contact us <!>.</p> <p>We are working on removing these known issues so that writing Modal applications
in a notebook feels just like developing in regular Python modules and scripts.</p> <!> <p>You can run Jupyter in Modal using the <code>modal launch</code> command. For example:</p> <!> <p>That will start a Jupyter instance with an A10G GPU attached. You’ll be able to
access the app with via a <!>. Jupyter
will stop running whenever you stop Modal call in your terminal.</p> <p>See <code>--help</code> for additional options.</p> <!> <ul><li><!></li> <li><!></li></ul>`,1);function w(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);h(t,o(()=>y,()=>_,{children:(t,a)=>{var o=C(),h=s(o);p(h,{id:`jupyter-notebooks`,children:(e,t)=>{l(),i(e,r(`Jupyter notebooks`))},$$slots:{default:!0}});var _=c(h,4);u(_,{variant:`info`,children:(t,a)=>{var o=x();g(c(e(o)),{href:`/docs/guide/notebooks`,children:(e,t)=>{l(),i(e,r(`Modal Notebooks`))},$$slots:{default:!0}}),l(),n(o),i(t,o)},$$slots:{default:!0}});var v=c(_,2);d(v,{id:`modal-inside-jupyter`,children:(e,t)=>{l(),i(e,r(`Modal inside Jupyter`))},$$slots:{default:!0}});var y=c(v,2);g(c(e(y),3),{href:`/docs/guide/apps#ephemeral-apps`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(),n(y);var b=c(y,2);m(b,{code:`%23%20Cell%201%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function()%0Adef%20my_function(x)%3A%0A%20%20%20%20...%0A%0A%23%20Cell%202%0A%0Awith%20modal.enable_output()%3A%0A%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20my_function.remote(42)`,lang:`python,notest`});var w=c(b,2);f(w,{id:`known-issues`,children:(e,t)=>{l(),i(e,r(`Known issues`))},$$slots:{default:!0}});var T=c(w,6);g(c(e(T)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`in our Slack`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,4);d(E,{id:`jupyter-inside-modal`,children:(e,t)=>{l(),i(e,r(`Jupyter inside Modal`))},$$slots:{default:!0}});var D=c(E,4);m(D,{code:`%24%20modal%20launch%20jupyter%20--gpu%20a10g`,lang:`text`});var O=c(D,2);g(c(e(O)),{href:`https://modal.com/docs/guide/tunnels`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Tunnel URL`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);d(k,{id:`further-examples`,children:(e,t)=>{l(),i(e,r(`Further examples`))},$$slots:{default:!0}});var A=c(k,2),j=e(A);g(e(j),{href:`https://github.com/modal-labs/modal-examples/blob/main/11_notebooks/basic.ipynb`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Basic demonstration of running Modal in a notebook`))},$$slots:{default:!0}}),n(j);var M=c(j,2);g(e(M),{href:`https://github.com/modal-labs/modal-examples/blob/main/11_notebooks/jupyter_inside_modal.py`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Running Jupyter server within a Modal Function`))},$$slots:{default:!0}}),n(M),n(A),i(t,o)},$$slots:{default:!0}}))}export{w as default,_ as metadata};
//# sourceMappingURL=DQj5_Vqg.js.map
