(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`bb09da58-ee87-4981-9ba0-01bf09ed5149`,e._sentryDebugIdIdentifier=`sentry-dbid-bb09da58-ee87-4981-9ba0-01bf09ed5149`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as s}from"./CPby7b1n.js";import{t as c}from"./BILrvr3I.js";import{t as l}from"./B4L_if842.js";var u={toc:[{depth:1,value:`Parallel execution on Modal with spawn and gather`,id:`parallel-execution-on-modal-with-spawn-and-gather`}],rawContent:`# Parallel execution on Modal with \`spawn\` and \`gather\`

This example shows how you can run multiple functions in parallel on Modal.
We use the \`spawn\` method to start a function and return a handle to its result.
The \`get\` method is used to retrieve the result of the function call.

\`\`\`python
import time

import modal

app = modal.App("example-parallel-execution")


@app.function()
def step1(word):
    time.sleep(2)
    print("step1 done")
    return word


@app.function()
def step2(number):
    time.sleep(1)
    print("step2 done")
    if number == 0:
        raise ValueError("custom error")
    return number


@app.local_entrypoint()
def main():
    # Start running a function and return a handle to its result.
    word_call = step1.spawn("foo")
    number_call = step2.spawn(2)

    # Print "foofoo" after 2 seconds.
    print(word_call.get() * number_call.get())

    # Alternatively, use \`modal.FunctionCall.gather(...)\` as a convenience wrapper,
    # which returns an error if either call fails.
    results = modal.FunctionCall.gather(step1.spawn("bar"), step2.spawn(4))
    assert results == ["bar", 4]

    # Raise exception after 2 seconds.
    try:
        modal.FunctionCall.gather(step1.spawn("bar"), step2.spawn(0))
    except ValueError as exc:
        assert str(exc) == "custom error"

\`\`\`
`,meta:{title:`Parallel execution on Modal with spawn and gather`,description:`This example shows how you can run multiple functions in parallel on Modal. We use the spawn method to start a function and return a handle to its result. The get method is used to retrieve the result of the function call.`}},{toc:d,rawContent:f,meta:p}=u,m=e(`Parallel execution on Modal with <code>spawn</code> and <code>gather</code>`,1),h=e(`<!> <p>This example shows how you can run multiple functions in parallel on Modal.
We use the <code>spawn</code> method to start a function and return a handle to its result.
The <code>get</code> method is used to retrieve the result of the function call.</p> <!>`,1);function g(e,d){let f=n(d,[`children`,`$$slots`,`$$events`,`$$legacy`]);l(e,r(()=>f,()=>u,{children:(e,n)=>{var r=h(),l=i(r);s(l,{id:`parallel-execution-on-modal-with-spawn-and-gather`,children:(e,n)=>{o();var r=m();o(3),t(e,r)},$$slots:{default:!0}}),c(a(l,4),{code:`import%20time%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-parallel-execution%22)%0A%0A%0A%40app.function()%0Adef%20step1(word)%3A%0A%20%20%20%20time.sleep(2)%0A%20%20%20%20print(%22step1%20done%22)%0A%20%20%20%20return%20word%0A%0A%0A%40app.function()%0Adef%20step2(number)%3A%0A%20%20%20%20time.sleep(1)%0A%20%20%20%20print(%22step2%20done%22)%0A%20%20%20%20if%20number%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(%22custom%20error%22)%0A%20%20%20%20return%20number%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20Start%20running%20a%20function%20and%20return%20a%20handle%20to%20its%20result.%0A%20%20%20%20word_call%20%3D%20step1.spawn(%22foo%22)%0A%20%20%20%20number_call%20%3D%20step2.spawn(2)%0A%0A%20%20%20%20%23%20Print%20%22foofoo%22%20after%202%20seconds.%0A%20%20%20%20print(word_call.get()%20*%20number_call.get())%0A%0A%20%20%20%20%23%20Alternatively%2C%20use%20%60modal.FunctionCall.gather(...)%60%20as%20a%20convenience%20wrapper%2C%0A%20%20%20%20%23%20which%20returns%20an%20error%20if%20either%20call%20fails.%0A%20%20%20%20results%20%3D%20modal.FunctionCall.gather(step1.spawn(%22bar%22)%2C%20step2.spawn(4))%0A%20%20%20%20assert%20results%20%3D%3D%20%5B%22bar%22%2C%204%5D%0A%0A%20%20%20%20%23%20Raise%20exception%20after%202%20seconds.%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20modal.FunctionCall.gather(step1.spawn(%22bar%22)%2C%20step2.spawn(0))%0A%20%20%20%20except%20ValueError%20as%20exc%3A%0A%20%20%20%20%20%20%20%20assert%20str(exc)%20%3D%3D%20%22custom%20error%22%0A`,lang:`python`}),t(e,r)},$$slots:{default:!0}}))}export{g as default,u as metadata};
//# sourceMappingURL=DDsEyA-v.js.map
