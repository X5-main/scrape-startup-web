(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`04768602-8e05-4799-9311-665d4c48d465`,e._sentryDebugIdIdentifier=`sentry-dbid-04768602-8e05-4799-9311-665d4c48d465`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Parametrized functions`,id:`parametrized-functions`,children:[{depth:2,value:`Looking up a parametrized function`,id:`looking-up-a-parametrized-function`},{depth:2,value:`Parametrized Web Functions`,id:`parametrized-web-functions`},{depth:2,value:`Using parametrized functions with lifecycle functions`,id:`using-parametrized-functions-with-lifecycle-functions`},{depth:2,value:`Performance`,id:`performance`}]}],rawContent:`# Parametrized functions

A single Modal Function can be parametrized by a set of arguments, so that each unique combination of arguments will behave like an individual
Modal Function with its own auto-scaling and lifecycle logic.

For example, you might want to have a separate pool of containers for each unique user that invokes your Function. In this scenario, you would
parametrize your Function by a user ID.

To parametrize a Modal Function, you need to use Modal's [class syntax](/docs/guide/lifecycle-functions) and the
[\`@app.cls\`](/docs/sdk/py/latest/App#cls) decorator. Specifically, you'll need to:

1. Convert your function to a method by making it a member of a class.
2. Decorate the class with \`@app.cls(...)\` with the same arguments you previously
   had for \`@app.function(...)\` or your [Web Function decorator](/docs/guide/webhooks).
3. If you previously used the \`@app.function()\` decorator on your function, replace it with \`@modal.method()\`.
4. Define dataclass-style, type-annotated instance attributes with \`modal.parameter()\` and optionally set default values:

\`\`\`python
import modal

app = modal.App()

@app.cls()
class MyClass:

    foo: str = modal.parameter()
    bar: int = modal.parameter(default=10)

    @modal.method()
    def baz(self, qux: str = "default") -> str:
        return f"This code is running in container pool ({self.foo}, {self.bar}), with input qux={qux}"
\`\`\`

The parameters create a keyword-only constructor for your class, and the methods can be called as follows:

\`\`\`python
@app.local_entrypoint()
def main():
    m1 = MyClass(foo="hedgehog", bar=7)
    m1.baz.remote()

    m2 = MyClass(foo="fox")
    m2.baz.remote(qux="override")
\`\`\`

Function calls for each unique combination of values for \`foo\` and \`bar\` will run in their own separate container pools.
If you re-constructed a \`MyClass\` with the same arguments in a different context, the calls to \`baz\` would be routed to the same set of containers as before.

Some things to note:

- The total size of the arguments is limited to 16 KiB.
- Modal classes can still annotate types of regular class attributes, which are independent of parametrization, by either omitting \`= modal.parameter()\` or using \`= modal.parameter(init=False)\` to satisfy type checkers.
- The support types are these primitives: \`str\`, \`int\`, \`bool\`, and \`bytes\`.
- The legacy \`__init__\` constructor method is being removed, see [the 1.0 migration for details.](/docs/guide/modal-1-0-migration#removing-support-for-custom-cls-constructors)

## Looking up a parametrized function

If you want to call your parametrized function from a Python script running
anywhere, you can use \`Cls.lookup\`:

\`\`\`python notest
import modal

MyClass = modal.Cls.from_name("parametrized-function-app", "MyClass")  # returns a class-like object
m = MyClass(foo="snake", bar=12)
m.baz.remote()
\`\`\`

## Parametrized Web Functions

Modal [Web Functions](/docs/guide/webhooks) can also be parametrized:

\`\`\`python
app = modal.App("parametrized-endpoint")

@app.cls()
class MyClass():

    foo: str = modal.parameter()
    bar: int = modal.parameter(default=10)

    @modal.fastapi_endpoint()
    def baz(self, qux: str = "default") -> str:
        ...
\`\`\`

Parameters are specified in the URL as query parameter values.

\`\`\`bash
curl "https://parametrized-endpoint.modal.run?foo=hedgehog&bar=7&qux=override"
curl "https://parametrized-endpoint.modal.run?foo=hedgehog&qux=override"
curl "https://parametrized-endpoint.modal.run?foo=hedgehog&bar=7"
curl "https://parametrized-endpoint.modal.run?foo=hedgehog"
\`\`\`

## Using parametrized functions with lifecycle functions

Parametrized functions can be used with [lifecycle functions](/docs/guide/lifecycle-functions).

For example, here is how you might parametrize the [\`@modal.enter\`](/docs/guide/lifecycle-functions#enter) lifecycle function to load a specific model:

\`\`\`python
@app.cls()
class Model:

    name: str = modal.parameter()
    size: int = modal.parameter(default=100)

    @modal.enter()
    def load_model(self):
        print(f"Loading model {self.name} with size {self.size}")
        self.model = load_model_util(self.name, self.size)

    @modal.method()
    def generate(self, prompt: str) -> str:
        return self.model.generate(prompt)
\`\`\`

## Performance

Currently, parametrized Function creation is rate limited to 1 per second, with the ability to burst to 1000. Please [get in touch](mailto:support@modal.com) if you need higher rate limits.
`,meta:{title:`Parametrized functions`,description:`A single Modal Function can be parametrized by a set of arguments, so that each unique combination of arguments will behave like an individual Modal Function with its own auto-scaling and lifecycle logic.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>@app.cls</code>`),b=t(`<code>@modal.enter</code>`),x=t(`<!> <p>A single Modal Function can be parametrized by a set of arguments, so that each unique combination of arguments will behave like an individual
Modal Function with its own auto-scaling and lifecycle logic.</p> <p>For example, you might want to have a separate pool of containers for each unique user that invokes your Function. In this scenario, you would
parametrize your Function by a user ID.</p> <p>To parametrize a Modal Function, you need to use Modal’s <!> and the <!> decorator. Specifically, you’ll need to:</p> <ol><li>Convert your function to a method by making it a member of a class.</li> <li>Decorate the class with <code>@app.cls(...)</code> with the same arguments you previously
had for <code>@app.function(...)</code> or your <!>.</li> <li>If you previously used the <code>@app.function()</code> decorator on your function, replace it with <code>@modal.method()</code>.</li> <li>Define dataclass-style, type-annotated instance attributes with <code>modal.parameter()</code> and optionally set default values:</li></ol> <!> <p>The parameters create a keyword-only constructor for your class, and the methods can be called as follows:</p> <!> <p>Function calls for each unique combination of values for <code>foo</code> and <code>bar</code> will run in their own separate container pools.
If you re-constructed a <code>MyClass</code> with the same arguments in a different context, the calls to <code>baz</code> would be routed to the same set of containers as before.</p> <p>Some things to note:</p> <ul><li>The total size of the arguments is limited to 16 KiB.</li> <li>Modal classes can still annotate types of regular class attributes, which are independent of parametrization, by either omitting <code>= modal.parameter()</code> or using <code>= modal.parameter(init=False)</code> to satisfy type checkers.</li> <li>The support types are these primitives: <code>str</code>, <code>int</code>, <code>bool</code>, and <code>bytes</code>.</li> <li>The legacy <code>__init__</code> constructor method is being removed, see <!></li></ul> <!> <p>If you want to call your parametrized function from a Python script running
anywhere, you can use <code>Cls.lookup</code>:</p> <!> <!> <p>Modal <!> can also be parametrized:</p> <!> <p>Parameters are specified in the URL as query parameter values.</p> <!> <!> <p>Parametrized functions can be used with <!>.</p> <p>For example, here is how you might parametrize the <!> lifecycle function to load a specific model:</p> <!> <!> <p>Currently, parametrized Function creation is rate limited to 1 per second, with the ability to burst to 1000. Please <!> if you need higher rate limits.</p>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`parametrized-functions`,children:(e,t)=>{l(),i(e,r(`Parametrized functions`))},$$slots:{default:!0}});var h=c(p,6),g=c(e(h));m(g,{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{l(),i(e,r(`class syntax`))},$$slots:{default:!0}}),m(c(g,2),{href:`/docs/sdk/py/latest/App#cls`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(h);var _=c(h,2),v=c(e(_),2);m(c(e(v),5),{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Function decorator`))},$$slots:{default:!0}}),l(),n(v),l(4),n(_);var S=c(_,2);f(S,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.cls()%0Aclass%20MyClass%3A%0A%0A%20%20%20%20foo%3A%20str%20%3D%20modal.parameter()%0A%20%20%20%20bar%3A%20int%20%3D%20modal.parameter(default%3D10)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20baz(self%2C%20qux%3A%20str%20%3D%20%22default%22)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20return%20f%22This%20code%20is%20running%20in%20container%20pool%20(%7Bself.foo%7D%2C%20%7Bself.bar%7D)%2C%20with%20input%20qux%3D%7Bqux%7D%22`,lang:`python`});var C=c(S,4);f(C,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20m1%20%3D%20MyClass(foo%3D%22hedgehog%22%2C%20bar%3D7)%0A%20%20%20%20m1.baz.remote()%0A%0A%20%20%20%20m2%20%3D%20MyClass(foo%3D%22fox%22)%0A%20%20%20%20m2.baz.remote(qux%3D%22override%22)`,lang:`python`});var w=c(C,6),T=c(e(w),6);m(c(e(T),3),{href:`/docs/guide/modal-1-0-migration#removing-support-for-custom-cls-constructors`,children:(e,t)=>{l(),i(e,r(`the 1.0 migration for details.`))},$$slots:{default:!0}}),n(T),n(w);var E=c(w,2);u(E,{id:`looking-up-a-parametrized-function`,children:(e,t)=>{l(),i(e,r(`Looking up a parametrized function`))},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`import%20modal%0A%0AMyClass%20%3D%20modal.Cls.from_name(%22parametrized-function-app%22%2C%20%22MyClass%22)%20%20%23%20returns%20a%20class-like%20object%0Am%20%3D%20MyClass(foo%3D%22snake%22%2C%20bar%3D12)%0Am.baz.remote()`,lang:`python`});var O=c(D,2);u(O,{id:`parametrized-web-functions`,children:(e,t)=>{l(),i(e,r(`Parametrized Web Functions`))},$$slots:{default:!0}});var k=c(O,2);m(c(e(k)),{href:`/docs/guide/webhooks`,children:(e,t)=>{l(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(A,{code:`app%20%3D%20modal.App(%22parametrized-endpoint%22)%0A%0A%40app.cls()%0Aclass%20MyClass()%3A%0A%0A%20%20%20%20foo%3A%20str%20%3D%20modal.parameter()%0A%20%20%20%20bar%3A%20int%20%3D%20modal.parameter(default%3D10)%0A%0A%20%20%20%20%40modal.fastapi_endpoint()%0A%20%20%20%20def%20baz(self%2C%20qux%3A%20str%20%3D%20%22default%22)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20...`,lang:`python`});var j=c(A,4);f(j,{code:`curl%20%22https%3A%2F%2Fparametrized-endpoint.modal.run%3Ffoo%3Dhedgehog%26bar%3D7%26qux%3Doverride%22%0Acurl%20%22https%3A%2F%2Fparametrized-endpoint.modal.run%3Ffoo%3Dhedgehog%26qux%3Doverride%22%0Acurl%20%22https%3A%2F%2Fparametrized-endpoint.modal.run%3Ffoo%3Dhedgehog%26bar%3D7%22%0Acurl%20%22https%3A%2F%2Fparametrized-endpoint.modal.run%3Ffoo%3Dhedgehog%22`,lang:`bash`});var M=c(j,2);u(M,{id:`using-parametrized-functions-with-lifecycle-functions`,children:(e,t)=>{l(),i(e,r(`Using parametrized functions with lifecycle functions`))},$$slots:{default:!0}});var N=c(M,2);m(c(e(N)),{href:`/docs/guide/lifecycle-functions`,children:(e,t)=>{l(),i(e,r(`lifecycle functions`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);m(c(e(P)),{href:`/docs/guide/lifecycle-functions#enter`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);f(F,{code:`%40app.cls()%0Aclass%20Model%3A%0A%0A%20%20%20%20name%3A%20str%20%3D%20modal.parameter()%0A%20%20%20%20size%3A%20int%20%3D%20modal.parameter(default%3D100)%0A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20load_model(self)%3A%0A%20%20%20%20%20%20%20%20print(f%22Loading%20model%20%7Bself.name%7D%20with%20size%20%7Bself.size%7D%22)%0A%20%20%20%20%20%20%20%20self.model%20%3D%20load_model_util(self.name%2C%20self.size)%0A%0A%20%20%20%20%40modal.method()%0A%20%20%20%20def%20generate(self%2C%20prompt%3A%20str)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20return%20self.model.generate(prompt)`,lang:`python`});var I=c(F,2);u(I,{id:`performance`,children:(e,t)=>{l(),i(e,r(`Performance`))},$$slots:{default:!0}});var L=c(I,2);m(c(e(L)),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`get in touch`))},$$slots:{default:!0}}),l(),n(L),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=Be9-Y2jY.js.map
