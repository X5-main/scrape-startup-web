(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`99c70756-d873-4768-92eb-94ac9e38ce46`,e._sentryDebugIdIdentifier=`sentry-dbid-99c70756-d873-4768-92eb-94ac9e38ce46`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";import"./B6UiYoTw.js";var m={toc:[{depth:1,value:`batched`,id:`batched`}],rawContent:`# batched

\`\`\`python
batched(*, max_batch_size, wait_ms)
\`\`\`
Decorator for functions or class methods that should be batched.

See the [dynamic batching guide](https://modal.com/docs/guide/dynamic-batching) for more information.

**Usage**

\`\`\`python
# Stack the decorator under \`@app.function()\` to enable dynamic batching
@app.function()
@modal.batched(max_batch_size=4, wait_ms=1000)
async def batched_multiply(xs: list[int], ys: list[int]) -> list[int]:
    return [x * y for x, y in zip(xs, ys)]

# call batched_multiply with individual inputs
# batched_multiply.remote.aio(2, 100)

# With \`@app.cls()\`, apply the decorator to a method (this may change in the future)
@app.cls()
class BatchedClass:
    @modal.batched(max_batch_size=4, wait_ms=1000)
    def batched_multiply(self, xs: list[int], ys: list[int]) -> list[int]:
        return [x * y for x, y in zip(xs, ys)]
\`\`\`
`,meta:{title:`batched`,description:`Decorator for functions or class methods that should be batched.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <!> <p>Decorator for functions or class methods that should be batched.</p> <p>See the <!> for more information.</p> <p><strong>Usage</strong></p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`batched`,children:(e,t)=>{l(),i(e,r(`batched`))},$$slots:{default:!0}});var m=c(f,2);d(m,{code:`batched(*%2C%20max_batch_size%2C%20wait_ms)`,lang:`python`});var h=c(m,4);p(c(e(h)),{href:`https://modal.com/docs/guide/dynamic-batching`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`dynamic batching guide`))},$$slots:{default:!0}}),l(),n(h),d(c(h,4),{code:`%23%20Stack%20the%20decorator%20under%20%60%40app.function()%60%20to%20enable%20dynamic%20batching%0A%40app.function()%0A%40modal.batched(max_batch_size%3D4%2C%20wait_ms%3D1000)%0Aasync%20def%20batched_multiply(xs%3A%20list%5Bint%5D%2C%20ys%3A%20list%5Bint%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20return%20%5Bx%20*%20y%20for%20x%2C%20y%20in%20zip(xs%2C%20ys)%5D%0A%0A%23%20call%20batched_multiply%20with%20individual%20inputs%0A%23%20batched_multiply.remote.aio(2%2C%20100)%0A%0A%23%20With%20%60%40app.cls()%60%2C%20apply%20the%20decorator%20to%20a%20method%20(this%20may%20change%20in%20the%20future)%0A%40app.cls()%0Aclass%20BatchedClass%3A%0A%20%20%20%20%40modal.batched(max_batch_size%3D4%2C%20wait_ms%3D1000)%0A%20%20%20%20def%20batched_multiply(self%2C%20xs%3A%20list%5Bint%5D%2C%20ys%3A%20list%5Bint%5D)%20-%3E%20list%5Bint%5D%3A%0A%20%20%20%20%20%20%20%20return%20%5Bx%20*%20y%20for%20x%2C%20y%20in%20zip(xs%2C%20ys)%5D`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=6xdPkxB42.js.map
