(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9dc6839f-71b4-4db4-aa32-25c32db2787b`,e._sentryDebugIdIdentifier=`sentry-dbid-9dc6839f-71b4-4db4-aa32-25c32db2787b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{n as f}from"./JPsrybyr.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Run untrusted code with Restricted Functions`,id:`run-untrusted-code-with-restricted-functions`,children:[{depth:2,value:`Create a Restricted Function`,id:`create-a-restricted-function`},{depth:2,value:`Sandboxes offer an alternative interface for untrusted code`,id:`sandboxes-offer-an-alternative-interface-for-untrusted-code`},{depth:2,value:`Best Practices`,id:`best-practices`},{depth:2,value:`Example: Running LLM-generated Code`,id:`example-running-llm-generated-code`},{depth:2,value:`Error Handling`,id:`error-handling`}]}],rawContent:`# Run untrusted code with Restricted Functions

This guide page documents Restricted Functions, which can be used to safely execute untrusted code in Modal Functions.

## Create a Restricted Function

To create a Restricted Function, set \`restrict_modal_access=True\` in the Function definition:

\`\`\`python
@app.function(restrict_modal_access=True)
def run_untrusted_code(code_input: str):
    # This code cannot access Modal resources
    return eval(code_input)
\`\`\`

When \`restrict_modal_access\` is enabled, the Function cannot

- access Modal resources (Queues, Dicts, etc.)
- call other Functions
- access Modal's internal APIs

## Sandboxes offer an alternative interface for untrusted code

Modal provides two primitives for running untrusted code: Restricted Functions and [Sandboxes](/docs/guide/sandboxes).
While both can be used for running untrusted code, they provide different interfaces:
Sandboxes provide a process interface,
while Restricted Functions provide a function-calling interface.
Process interfaces are especially useful for stateful, multi-stage communication,
while function-calling interfaces are especially useful for stateless, input/output communication.

These differences are summarized in the table below.

| Feature   | Restricted Function            | Sandbox                                        |
| --------- | ------------------------------ | ---------------------------------------------- |
| State     | Stateless                      | Stateful                                       |
| Interface | Function-like                  | Container-like                                 |
| Setup     | Simple decorator               | Requires explicit creation/termination         |
| Use case  | Quick, isolated code execution | Interactive development, long-running sessions |

## Best Practices

When running untrusted code, consider these additional security measures:

1. Use \`single_use_containers=True\` to ensure each container only handles one request. Containers that get reused could cause information leakage between users.

\`\`\`python
@app.function(restrict_modal_access=True, single_use_containers=True)
def isolated_function(input_data):
    # Each input gets a fresh container
    return process(input_data)
\`\`\`

Note: Prior to v1.3.0, single-use containers were configured by setting \`max_inputs=1\`.

2. Set appropriate timeouts to prevent long-running operations:

\`\`\`python
@app.function(
    restrict_modal_access=True,
    timeout=30,  # 30 second timeout
    single_use_containers=True
)
def time_limited_function(input_data):
    return process(input_data)
\`\`\`

3. Consider using \`block_network=True\` to prevent the container from making outbound network requests:

\`\`\`python
@app.function(
    restrict_modal_access=True,
    block_network=True,
    single_use_containers=True
)
def network_isolated_function(input_data):
    return process(input_data)
\`\`\`

4. Minimize the App source that's included in the container

A restricted Modal Function will have read access to its source files in the
container, so you'll want to avoid including anything that would be harmful
if exfiltrated by the untrusted process.

If deploying an App from within a [larger package](/docs/guide/project-structure),
the entire package source may be automatically included by default. A best
practice would be to make the untrusted Function part of a standalone App that
includes the minimum necessary files to run:

\`\`\`python
restricted_app = modal.App("restricted-app", include_source=False)

image = (
    modal.Image.debian_slim()
    .add_local_file("restricted_executor.py", "/root/restricted_executor.py")
)

@restricted_app.function(
    restrict_modal_access=True,
    block_network=True,
    single_use_containers=True
)
def isolated_function(input_data):
    return process(input_data)
\`\`\`

## Example: Running LLM-generated Code

Below is a complete example of running code generated by a language model:

\`\`\`python
import modal

app = modal.App("restricted-access-example")


@app.function(restrict_modal_access=True, single_use_containers=True, timeout=30, block_network=True)
def run_llm_code(generated_code: str):
    try:
        # Create a restricted environment
        execution_scope = {}

        # Execute the generated code
        exec(generated_code, execution_scope)

        # Return the result if it exists
        return execution_scope.get("result", None)
    except Exception as e:
        return f"Error executing code: {str(e)}"


@app.local_entrypoint()
def main():
    # Example LLM-generated code
    code = """
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

result = calculate_fibonacci(10)
    """

    result = run_llm_code.remote(code)
    print(f"Result: {result}")

\`\`\`

This example locks down the container to ensure that the code is safe to execute by:

- Restricting Modal access
- Using a fresh container for each execution
- Setting a timeout
- Blocking network access
- Catching and handling potential errors

## Error Handling

When a Restricted Function attempts to access Modal resources, it will raise an \`AuthError\`:

\`\`\`python
@app.function(restrict_modal_access=True)
def restricted_function(q: modal.Queue):
    try:
        # This will fail because the Function is restricted
        return q.get()
    except modal.exception.AuthError as e:
        return f"Access denied: {e}"
\`\`\`

The error message will indicate that the operation is not permitted due to restricted Modal access.
`,meta:{title:`Run untrusted code with Restricted Functions`,description:`This guide page documents Restricted Functions, which can be used to safely execute untrusted code in Modal Functions.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<thead><tr><th>Feature</th><th>Restricted Function</th><th>Sandbox</th></tr></thead> <tbody><tr><td>State</td><td>Stateless</td><td>Stateful</td></tr><tr><td>Interface</td><td>Function-like</td><td>Container-like</td></tr><tr><td>Setup</td><td>Simple decorator</td><td>Requires explicit creation/termination</td></tr><tr><td>Use case</td><td>Quick, isolated code execution</td><td>Interactive development, long-running sessions</td></tr></tbody>`,1),x=t(`<!> <p>This guide page documents Restricted Functions, which can be used to safely execute untrusted code in Modal Functions.</p> <!> <p>To create a Restricted Function, set <code>restrict_modal_access=True</code> in the Function definition:</p> <!> <p>When <code>restrict_modal_access</code> is enabled, the Function cannot</p> <ul><li>access Modal resources (Queues, Dicts, etc.)</li> <li>call other Functions</li> <li>access Modal’s internal APIs</li></ul> <!> <p>Modal provides two primitives for running untrusted code: Restricted Functions and <!>.
While both can be used for running untrusted code, they provide different interfaces:
Sandboxes provide a process interface,
while Restricted Functions provide a function-calling interface.
Process interfaces are especially useful for stateful, multi-stage communication,
while function-calling interfaces are especially useful for stateless, input/output communication.</p> <p>These differences are summarized in the table below.</p> <!> <!> <p>When running untrusted code, consider these additional security measures:</p> <ol><li>Use <code>single_use_containers=True</code> to ensure each container only handles one request. Containers that get reused could cause information leakage between users.</li></ol> <!> <p>Note: Prior to v1.3.0, single-use containers were configured by setting <code>max_inputs=1</code>.</p> <ol start="2"><li>Set appropriate timeouts to prevent long-running operations:</li></ol> <!> <ol start="3"><li>Consider using <code>block_network=True</code> to prevent the container from making outbound network requests:</li></ol> <!> <ol start="4"><li>Minimize the App source that’s included in the container</li></ol> <p>A restricted Modal Function will have read access to its source files in the
container, so you’ll want to avoid including anything that would be harmful
if exfiltrated by the untrusted process.</p> <p>If deploying an App from within a <!>,
the entire package source may be automatically included by default. A best
practice would be to make the untrusted Function part of a standalone App that
includes the minimum necessary files to run:</p> <!> <!> <p>Below is a complete example of running code generated by a language model:</p> <!> <p>This example locks down the container to ensure that the code is safe to execute by:</p> <ul><li>Restricting Modal access</li> <li>Using a fresh container for each execution</li> <li>Setting a timeout</li> <li>Blocking network access</li> <li>Catching and handling potential errors</li></ul> <!> <p>When a Restricted Function attempts to access Modal resources, it will raise an <code>AuthError</code>:</p> <!> <p>The error message will indicate that the operation is not permitted due to restricted Modal access.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);d(m,{id:`run-untrusted-code-with-restricted-functions`,children:(e,t)=>{l(),i(e,r(`Run untrusted code with Restricted Functions`))},$$slots:{default:!0}});var g=c(m,4);u(g,{id:`create-a-restricted-function`,children:(e,t)=>{l(),i(e,r(`Create a Restricted Function`))},$$slots:{default:!0}});var _=c(g,4);p(_,{code:`%40app.function(restrict_modal_access%3DTrue)%0Adef%20run_untrusted_code(code_input%3A%20str)%3A%0A%20%20%20%20%23%20This%20code%20cannot%20access%20Modal%20resources%0A%20%20%20%20return%20eval(code_input)`,lang:`python`});var v=c(_,6);u(v,{id:`sandboxes-offer-an-alternative-interface-for-untrusted-code`,children:(e,t)=>{l(),i(e,r(`Sandboxes offer an alternative interface for untrusted code`))},$$slots:{default:!0}});var y=c(v,2);h(c(e(y)),{href:`/docs/guide/sandboxes`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),l(),n(y);var S=c(y,4);f(S,{children:(e,t)=>{var n=b();l(2),i(e,n)},$$slots:{default:!0}});var C=c(S,2);u(C,{id:`best-practices`,children:(e,t)=>{l(),i(e,r(`Best Practices`))},$$slots:{default:!0}});var w=c(C,6);p(w,{code:`%40app.function(restrict_modal_access%3DTrue%2C%20single_use_containers%3DTrue)%0Adef%20isolated_function(input_data)%3A%0A%20%20%20%20%23%20Each%20input%20gets%20a%20fresh%20container%0A%20%20%20%20return%20process(input_data)`,lang:`python`});var T=c(w,6);p(T,{code:`%40app.function(%0A%20%20%20%20restrict_modal_access%3DTrue%2C%0A%20%20%20%20timeout%3D30%2C%20%20%23%2030%20second%20timeout%0A%20%20%20%20single_use_containers%3DTrue%0A)%0Adef%20time_limited_function(input_data)%3A%0A%20%20%20%20return%20process(input_data)`,lang:`python`});var E=c(T,4);p(E,{code:`%40app.function(%0A%20%20%20%20restrict_modal_access%3DTrue%2C%0A%20%20%20%20block_network%3DTrue%2C%0A%20%20%20%20single_use_containers%3DTrue%0A)%0Adef%20network_isolated_function(input_data)%3A%0A%20%20%20%20return%20process(input_data)`,lang:`python`});var D=c(E,6);h(c(e(D)),{href:`/docs/guide/project-structure`,children:(e,t)=>{l(),i(e,r(`larger package`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);p(O,{code:`restricted_app%20%3D%20modal.App(%22restricted-app%22%2C%20include_source%3DFalse)%0A%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.add_local_file(%22restricted_executor.py%22%2C%20%22%2Froot%2Frestricted_executor.py%22)%0A)%0A%0A%40restricted_app.function(%0A%20%20%20%20restrict_modal_access%3DTrue%2C%0A%20%20%20%20block_network%3DTrue%2C%0A%20%20%20%20single_use_containers%3DTrue%0A)%0Adef%20isolated_function(input_data)%3A%0A%20%20%20%20return%20process(input_data)`,lang:`python`});var k=c(O,2);u(k,{id:`example-running-llm-generated-code`,children:(e,t)=>{l(),i(e,r(`Example: Running LLM-generated Code`))},$$slots:{default:!0}});var A=c(k,4);p(A,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22restricted-access-example%22)%0A%0A%0A%40app.function(restrict_modal_access%3DTrue%2C%20single_use_containers%3DTrue%2C%20timeout%3D30%2C%20block_network%3DTrue)%0Adef%20run_llm_code(generated_code%3A%20str)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%23%20Create%20a%20restricted%20environment%0A%20%20%20%20%20%20%20%20execution_scope%20%3D%20%7B%7D%0A%0A%20%20%20%20%20%20%20%20%23%20Execute%20the%20generated%20code%0A%20%20%20%20%20%20%20%20exec(generated_code%2C%20execution_scope)%0A%0A%20%20%20%20%20%20%20%20%23%20Return%20the%20result%20if%20it%20exists%0A%20%20%20%20%20%20%20%20return%20execution_scope.get(%22result%22%2C%20None)%0A%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20return%20f%22Error%20executing%20code%3A%20%7Bstr(e)%7D%22%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20Example%20LLM-generated%20code%0A%20%20%20%20code%20%3D%20%22%22%22%0Adef%20calculate_fibonacci(n)%3A%0A%20%20%20%20if%20n%20%3C%3D%201%3A%0A%20%20%20%20%20%20%20%20return%20n%0A%20%20%20%20return%20calculate_fibonacci(n-1)%20%2B%20calculate_fibonacci(n-2)%0A%0Aresult%20%3D%20calculate_fibonacci(10)%0A%20%20%20%20%22%22%22%0A%0A%20%20%20%20result%20%3D%20run_llm_code.remote(code)%0A%20%20%20%20print(f%22Result%3A%20%7Bresult%7D%22)%0A`,lang:`python`});var j=c(A,6);u(j,{id:`error-handling`,children:(e,t)=>{l(),i(e,r(`Error Handling`))},$$slots:{default:!0}}),p(c(j,4),{code:`%40app.function(restrict_modal_access%3DTrue)%0Adef%20restricted_function(q%3A%20modal.Queue)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%23%20This%20will%20fail%20because%20the%20Function%20is%20restricted%0A%20%20%20%20%20%20%20%20return%20q.get()%0A%20%20%20%20except%20modal.exception.AuthError%20as%20e%3A%0A%20%20%20%20%20%20%20%20return%20f%22Access%20denied%3A%20%7Be%7D%22`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=e5FmwjFw2.js.map
