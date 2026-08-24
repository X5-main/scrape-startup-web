(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a826c4d6-61db-4eb1-87e9-9fe4ed5f5da2`,e._sentryDebugIdIdentifier=`sentry-dbid-a826c4d6-61db-4eb1-87e9-9fe4ed5f5da2`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Dynamic batching for ASCII and character conversion`,id:`dynamic-batching-for-ascii-and-character-conversion`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Defining a Batched Function`,id:`defining-a-batched-function`},{depth:2,value:`Defining a class with a Batched Method`,id:`defining-a-class-with-a-batched-method`},{depth:2,value:`ASCII and character conversion`,id:`ascii-and-character-conversion`}]}],rawContent:`# Dynamic batching for ASCII and character conversion

This example demonstrates how to dynamically batch a simple
application that converts ASCII codes to characters and vice versa.

For more details about using dynamic batching and optimizing
the batching configurations for your application, see
the [dynamic batching guide](https://modal.com/docs/guide/dynamic-batching).

## Setup

Let's start by defining the image for the application.

\`\`\`python
import modal

app = modal.App(
    "example-dynamic-batching",
    image=modal.Image.debian_slim(python_version="3.11"),
)


\`\`\`

## Defining a Batched Function

Now, let's define a function that converts ASCII codes to characters. This
async Batched Function allows us to convert up to four ASCII codes at once.

\`\`\`python
@app.function()
@modal.batched(max_batch_size=4, wait_ms=1000)
async def asciis_to_chars(asciis: list[int]) -> list[str]:
    return [chr(ascii) for ascii in asciis]


\`\`\`

If there are fewer than four ASCII codes in the batch, the Function will wait
for one second, as specified by \`wait_ms\`, to allow more inputs to arrive before
returning the result.

The input \`asciis\` to the Function is a list of integers, and the
output is a list of strings. To allow batching, the input list \`asciis\`
and the output list must have the same length.

You must invoke the Function with an individual ASCII input, and a single
character will be returned in response.

## Defining a class with a Batched Method

Next, let's define a class that converts characters to ASCII codes. This
class has an async Batched Method \`chars_to_asciis\` that converts characters
to ASCII codes.

Note that if a class has a Batched Method, it cannot have other Batched Methods
or Methods.

\`\`\`python
@app.cls()
class AsciiConverter:
    @modal.batched(max_batch_size=4, wait_ms=1000)
    async def chars_to_asciis(self, chars: list[str]) -> list[int]:
        asciis = [ord(char) for char in chars]
        return asciis


\`\`\`

## ASCII and character conversion

Finally, let's define the \`local_entrypoint\` that uses the Batched Function
and Class Method to convert ASCII codes to characters and
vice versa.

We use [\`map.aio\`](https://modal.com/docs/reference/modal.Function#map) to asynchronously map
over the ASCII codes and characters. This allows us to invoke the Batched
Function and the Batched Method over a range of ASCII codes and characters
in parallel.

Run this script to see which characters correspond to ASCII codes 33 through 38!

\`\`\`python
@app.local_entrypoint()
async def main():
    ascii_converter = AsciiConverter()
    chars = []
    async for char in asciis_to_chars.map.aio(range(33, 39)):
        chars.append(char)

    print("Characters:", chars)

    asciis = []
    async for ascii in ascii_converter.chars_to_asciis.map.aio(chars):
        asciis.append(ascii)

    print("ASCII codes:", asciis)

\`\`\`
`,meta:{title:`Dynamic batching for ASCII and character conversion`,description:`This example demonstrates how to dynamically batch a simple application that converts ASCII codes to characters and vice versa.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>map.aio</code>`),b=t(`<!> <p>This example demonstrates how to dynamically batch a simple
application that converts ASCII codes to characters and vice versa.</p> <p>For more details about using dynamic batching and optimizing
the batching configurations for your application, see
the <!>.</p> <!> <p>Let’s start by defining the image for the application.</p> <!> <!> <p>Now, let’s define a function that converts ASCII codes to characters. This
async Batched Function allows us to convert up to four ASCII codes at once.</p> <!> <p>If there are fewer than four ASCII codes in the batch, the Function will wait
for one second, as specified by <code>wait_ms</code>, to allow more inputs to arrive before
returning the result.</p> <p>The input <code>asciis</code> to the Function is a list of integers, and the
output is a list of strings. To allow batching, the input list <code>asciis</code> and the output list must have the same length.</p> <p>You must invoke the Function with an individual ASCII input, and a single
character will be returned in response.</p> <!> <p>Next, let’s define a class that converts characters to ASCII codes. This
class has an async Batched Method <code>chars_to_asciis</code> that converts characters
to ASCII codes.</p> <p>Note that if a class has a Batched Method, it cannot have other Batched Methods
or Methods.</p> <!> <!> <p>Finally, let’s define the <code>local_entrypoint</code> that uses the Batched Function
and Class Method to convert ASCII codes to characters and
vice versa.</p> <p>We use <!> to asynchronously map
over the ASCII codes and characters. This allows us to invoke the Batched
Function and the Batched Method over a range of ASCII codes and characters
in parallel.</p> <p>Run this script to see which characters correspond to ASCII codes 33 through 38!</p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`dynamic-batching-for-ascii-and-character-conversion`,children:(e,t)=>{l(),i(e,r(`Dynamic batching for ASCII and character conversion`))},$$slots:{default:!0}});var h=c(p,4);m(c(e(h)),{href:`https://modal.com/docs/guide/dynamic-batching`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`dynamic batching guide`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var _=c(g,4);f(_,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-dynamic-batching%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim(python_version%3D%223.11%22)%2C%0A)%0A%0A`,lang:`python`});var v=c(_,2);u(v,{id:`defining-a-batched-function`,children:(e,t)=>{l(),i(e,r(`Defining a Batched Function`))},$$slots:{default:!0}});var x=c(v,4);f(x,{code:`%40app.function()%0A%40modal.batched(max_batch_size%3D4%2C%20wait_ms%3D1000)%0Aasync%20def%20asciis_to_chars(asciis%3A%20list%5Bint%5D)%20-%3E%20list%5Bstr%5D%3A%0A%20%20%20%20return%20%5Bchr(ascii)%20for%20ascii%20in%20asciis%5D%0A%0A`,lang:`python`});var S=c(x,8);u(S,{id:`defining-a-class-with-a-batched-method`,children:(e,t)=>{l(),i(e,r(`Defining a class with a Batched Method`))},$$slots:{default:!0}});var C=c(S,6);f(C,{code:`%40app.cls()%0Aclass%20AsciiConverter%3A%0A%20%20%20%20%40modal.batched(max_batch_size%3D4%2C%20wait_ms%3D1000)%0A%20%20%20%20async%20def%20chars_to_asciis(self%2C%20chars%3A%20list%5Bstr%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20%20%20%20%20asciis%20%3D%20%5Bord(char)%20for%20char%20in%20chars%5D%0A%20%20%20%20%20%20%20%20return%20asciis%0A%0A`,lang:`python`});var w=c(C,2);u(w,{id:`ascii-and-character-conversion`,children:(e,t)=>{l(),i(e,r(`ASCII and character conversion`))},$$slots:{default:!0}});var T=c(w,4);m(c(e(T)),{href:`https://modal.com/docs/reference/modal.Function#map`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(T),f(c(T,4),{code:`%40app.local_entrypoint()%0Aasync%20def%20main()%3A%0A%20%20%20%20ascii_converter%20%3D%20AsciiConverter()%0A%20%20%20%20chars%20%3D%20%5B%5D%0A%20%20%20%20async%20for%20char%20in%20asciis_to_chars.map.aio(range(33%2C%2039))%3A%0A%20%20%20%20%20%20%20%20chars.append(char)%0A%0A%20%20%20%20print(%22Characters%3A%22%2C%20chars)%0A%0A%20%20%20%20asciis%20%3D%20%5B%5D%0A%20%20%20%20async%20for%20ascii%20in%20ascii_converter.chars_to_asciis.map.aio(chars)%3A%0A%20%20%20%20%20%20%20%20asciis.append(ascii)%0A%0A%20%20%20%20print(%22ASCII%20codes%3A%22%2C%20asciis)%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=D8vCyKmo2.js.map
