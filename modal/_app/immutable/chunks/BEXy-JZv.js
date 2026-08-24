(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f355421b-e04a-4908-8b07-91421f1e9c10`,e._sentryDebugIdIdentifier=`sentry-dbid-f355421b-e04a-4908-8b07-91421f1e9c10`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Feature Maturity`,id:`feature-maturity`,children:[{depth:2,value:`Release Phases`,id:`release-phases`,children:[{depth:3,value:`Alpha`,id:`alpha`},{depth:3,value:`Beta`,id:`beta`},{depth:3,value:`General Availability (GA)`,id:`general-availability-ga`}]},{depth:2,value:`Experimental SDK`,id:`experimental-sdk`},{depth:2,value:`SDK Deprecations`,id:`sdk-deprecations`},{depth:2,value:`Other interfaces`,id:`other-interfaces`},{depth:2,value:`Providing Feedback`,id:`providing-feedback`}]}],rawContent:`# Feature Maturity

New features at Modal evolve through several stages. To help you understand their stability, we use two separate concepts:

- [Release phases](#release-phases) ([Alpha](#alpha), [Beta](#beta) or [GA](#general-availability-ga)): signals the stability of a feature's underlying infrastructure
- [Experimental SDK](#experimental-sdk): signals API stability in the code interface

This separation allows the SDK to remain stable even while we are still refining the performance or scaling of a backend feature.

## Release Phases

We use the following release phases to signal the maturity of a feature's underlying design and infrastructure:

### Alpha

Alpha is reserved for features that might still be fragile and have known limitations. We provide these early so you can experiment with them, but you should expect significant changes to how the feature works. The documentation will clearly state their limitations.

Some Alpha features are private, meaning you need to contact us to get access.

### Beta

Beta is our default phase for new features. Beta features are generally self-serve, functional, and mostly stable. Beta features are often suitable for production use, though we may still be refining the final behavior, pricing, or scale limits.

Some Beta features are private, meaning you need to contact us to get access.

### General Availability (GA)

GA features are stable and fully ready for production grade usage. No breaking changes are planned. Any feature not marked as Alpha or Beta in the Modal docs can be considered GA.

## Experimental SDK

In addition to the release phases described above, you may see certain parts of the Modal SDK marked as experimental (e.g., \`_experimental_snapshot()\`).

This is strictly an SDK concept which indicates API stability, not infrastructure maturity. It often correlates with the Alpha → Beta → GA progression, but not always. Some features stabilize their API early while the backend is still maturing, but experimental APIs may also be introduced later in a feature's lifecycle to provide additional depth of configuration.

An experimental tag means we're still gathering feedback and iterating on the interface: method names, parameters, or return types may change. Once we're confident in the design, we remove the experimental marker and commit to backwards compatibility.

## SDK Deprecations

Features that are exposed via stable API in the SDK may become _deprecated_, either because we are discontinuing support for the associated platform feature, or because the API is being adjusted, e.g. to reduce a persistent confusion or to accommodate unanticipated extensions.

Deprecated API will remain functional and will issue deprecation warnings. We recommend heeding these warnings, since deprecations will eventually be enforced and code that exercises the deprecated API will break. Breaking changes are limited to increments of the \`Y\` version in our \`X.Y.Z\` versioning scheme.

## Other interfaces

Only the official SDKs are currently considered to be stable. Any other public interfaces are undocumented, subject to change without warning, and use-at-your-own risk.

## Providing Feedback

We value your feedback on Alpha and Beta features! If you're using a feature at any release phase and have suggestions or encounter issues:

- Join our [Slack community](https://modal.com/slack) to discuss with the team and other users
- Reach out to support@modal.com with specific feedback or bug reports
`,meta:{title:`Feature Maturity`,description:`New features at Modal evolve through several stages. To help you understand their stability, we use two separate concepts:`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>New features at Modal evolve through several stages. To help you understand their stability, we use two separate concepts:</p> <ul><li><!> (<!>, <!> or <!>): signals the stability of a feature’s underlying infrastructure</li> <li><!>: signals API stability in the code interface</li></ul> <p>This separation allows the SDK to remain stable even while we are still refining the performance or scaling of a backend feature.</p> <!> <p>We use the following release phases to signal the maturity of a feature’s underlying design and infrastructure:</p> <!> <p>Alpha is reserved for features that might still be fragile and have known limitations. We provide these early so you can experiment with them, but you should expect significant changes to how the feature works. The documentation will clearly state their limitations.</p> <p>Some Alpha features are private, meaning you need to contact us to get access.</p> <!> <p>Beta is our default phase for new features. Beta features are generally self-serve, functional, and mostly stable. Beta features are often suitable for production use, though we may still be refining the final behavior, pricing, or scale limits.</p> <p>Some Beta features are private, meaning you need to contact us to get access.</p> <!> <p>GA features are stable and fully ready for production grade usage. No breaking changes are planned. Any feature not marked as Alpha or Beta in the Modal docs can be considered GA.</p> <!> <p>In addition to the release phases described above, you may see certain parts of the Modal SDK marked as experimental (e.g., <code>_experimental_snapshot()</code>).</p> <p>This is strictly an SDK concept which indicates API stability, not infrastructure maturity. It often correlates with the Alpha → Beta → GA progression, but not always. Some features stabilize their API early while the backend is still maturing, but experimental APIs may also be introduced later in a feature’s lifecycle to provide additional depth of configuration.</p> <p>An experimental tag means we’re still gathering feedback and iterating on the interface: method names, parameters, or return types may change. Once we’re confident in the design, we remove the experimental marker and commit to backwards compatibility.</p> <!> <p>Features that are exposed via stable API in the SDK may become <em>deprecated</em>, either because we are discontinuing support for the associated platform feature, or because the API is being adjusted, e.g. to reduce a persistent confusion or to accommodate unanticipated extensions.</p> <p>Deprecated API will remain functional and will issue deprecation warnings. We recommend heeding these warnings, since deprecations will eventually be enforced and code that exercises the deprecated API will break. Breaking changes are limited to increments of the <code>Y</code> version in our <code>X.Y.Z</code> versioning scheme.</p> <!> <p>Only the official SDKs are currently considered to be stable. Any other public interfaces are undocumented, subject to change without warning, and use-at-your-own risk.</p> <!> <p>We value your feedback on Alpha and Beta features! If you’re using a feature at any release phase and have suggestions or encounter issues:</p> <ul><li>Join our <!> to discuss with the team and other users</li> <li>Reach out to <!> with specific feedback or bug reports</li></ul>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);f(p,{id:`feature-maturity`,children:(e,t)=>{l(),i(e,r(`Feature Maturity`))},$$slots:{default:!0}});var h=c(p,4),g=e(h),_=e(g);m(_,{href:`#release-phases`,children:(e,t)=>{l(),i(e,r(`Release phases`))},$$slots:{default:!0}});var v=c(_,2);m(v,{href:`#alpha`,children:(e,t)=>{l(),i(e,r(`Alpha`))},$$slots:{default:!0}});var b=c(v,2);m(b,{href:`#beta`,children:(e,t)=>{l(),i(e,r(`Beta`))},$$slots:{default:!0}}),m(c(b,2),{href:`#general-availability-ga`,children:(e,t)=>{l(),i(e,r(`GA`))},$$slots:{default:!0}}),l(),n(g);var x=c(g,2);m(e(x),{href:`#experimental-sdk`,children:(e,t)=>{l(),i(e,r(`Experimental SDK`))},$$slots:{default:!0}}),l(),n(x),n(h);var S=c(h,4);u(S,{id:`release-phases`,children:(e,t)=>{l(),i(e,r(`Release Phases`))},$$slots:{default:!0}});var C=c(S,4);d(C,{id:`alpha`,children:(e,t)=>{l(),i(e,r(`Alpha`))},$$slots:{default:!0}});var w=c(C,6);d(w,{id:`beta`,children:(e,t)=>{l(),i(e,r(`Beta`))},$$slots:{default:!0}});var T=c(w,6);d(T,{id:`general-availability-ga`,children:(e,t)=>{l(),i(e,r(`General Availability (GA)`))},$$slots:{default:!0}});var E=c(T,4);u(E,{id:`experimental-sdk`,children:(e,t)=>{l(),i(e,r(`Experimental SDK`))},$$slots:{default:!0}});var D=c(E,8);u(D,{id:`sdk-deprecations`,children:(e,t)=>{l(),i(e,r(`SDK Deprecations`))},$$slots:{default:!0}});var O=c(D,6);u(O,{id:`other-interfaces`,children:(e,t)=>{l(),i(e,r(`Other interfaces`))},$$slots:{default:!0}});var k=c(O,4);u(k,{id:`providing-feedback`,children:(e,t)=>{l(),i(e,r(`Providing Feedback`))},$$slots:{default:!0}});var A=c(k,4),j=e(A);m(c(e(j)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Slack community`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);m(c(e(M)),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(M),n(A),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BEXy-JZv.js.map
