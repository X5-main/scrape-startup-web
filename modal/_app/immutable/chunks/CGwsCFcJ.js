(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ac02f574-1b40-43bd-83e7-8a8c98b45226`,e._sentryDebugIdIdentifier=`sentry-dbid-ac02f574-1b40-43bd-83e7-8a8c98b45226`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import"./B6UiYoTw.js";var d={toc:[{depth:1,value:`parameter`,id:`parameter`}],rawContent:`# parameter

\`\`\`python
parameter(*, default=_no_default, init=True)
\`\`\`
Used to specify options for modal.cls parameters, similar to dataclass.field for dataclasses
\`\`\`
class A:
    a: str = modal.parameter()

\`\`\`

If \`init=False\` is specified, the field is not considered a parameter for the
Modal class and not used in the synthesized constructor. This can be used to
optionally annotate the type of a field that's used internally, for example values
being set by @enter lifecycle methods, without breaking type checkers, but it has
no runtime effect on the class.
`,meta:{title:`parameter`,description:`Used to specify options for modal.cls parameters, similar to dataclass.field for dataclasses`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <!> <p>Used to specify options for modal.cls parameters, similar to dataclass.field for dataclasses</p> <!> <p>If <code>init=False</code> is specified, the field is not considered a parameter for the
Modal class and not used in the synthesized constructor. This can be used to
optionally annotate the type of a field that’s used internally, for example values
being set by @enter lifecycle methods, without breaking type checkers, but it has
no runtime effect on the class.</p>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`parameter`,children:(e,r)=>{s(),n(e,t(`parameter`))},$$slots:{default:!0}});var d=o(u,2);l(d,{code:`parameter(*%2C%20default%3D_no_default%2C%20init%3DTrue)`,lang:`python`}),l(o(d,4),{code:`class%20A%3A%0A%20%20%20%20a%3A%20str%20%3D%20modal.parameter()%0A`,lang:`text`}),s(2),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=CGwsCFcJ.js.map
