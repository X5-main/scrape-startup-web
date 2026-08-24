(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`b69ca727-f5fe-487d-8a76-ba352bf7fbe7`,e._sentryDebugIdIdentifier=`sentry-dbid-b69ca727-f5fe-487d-8a76-ba352bf7fbe7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,en as a,tn as o,wn as s}from"../chunks/F_ixKBiO.js";import"../chunks/B1sc9Zdx.js";import"../chunks/Bb2deiU3.js";import{t as c}from"../chunks/i7gH-_8P2.js";import{t as l}from"../chunks/B0q7FL19.js";import{t as u}from"../chunks/Dw1TJ-HJ.js";import{t as d}from"../chunks/p984Gt1u.js";var f=t(`<div class="flex flex-col gap-2"><!> <!></div>`);function p(t){var a=f(),l=e(a);c(l,{variant:`circle`,children:(e,t)=>{s(),i(e,r(`Click me`))},$$slots:{default:!0}}),c(o(l,2),{variant:`circle`,disabled:!0,children:(e,t)=>{s(),i(e,r(`Disabled`))},$$slots:{default:!0}}),n(a),i(t,a)}var m=`<script lang="ts">
  import Checkbox from "$lib/ui/system/Checkbox.svelte";
<\/script>

<div class="flex flex-col gap-2">
  <Checkbox variant="circle">Click me</Checkbox>
  <Checkbox variant="circle" disabled>Disabled</Checkbox>
</div>
`,h=`<script lang="ts">
  import Checkbox from "$lib/ui/system/Checkbox.svelte";
<\/script>

<div class="flex flex-col gap-2">
  <Checkbox>Enable email filtering</Checkbox>
  <Checkbox checked>Send weekly usage report</Checkbox>
  <Checkbox disabled>This is disabled</Checkbox>
</div>
`,g=t(`<!> <!> <p class="text-foreground-secondary mt-4 max-w-2xl">Use a checkbox when the setting takes effect on form submit. For settings that
  apply immediately, use a <a class="text-foreground-accent hover:underline" href="/internal/design/components">Toggle</a> instead.</p> <!>`,1);function _(e){var t=g(),n=a(t);u(n,{title:`Checkbox`,description:`Checkbox input for forms and simple settings. Works alone or in a group with other inputs; bind:checked to read the state.`,sourcePath:`src/lib/ui/system/Checkbox.svelte`});var r=o(n,2);d(r,{get source(){return h},children:(e,t)=>{l(e,{})},$$slots:{default:!0}}),d(o(r,4),{title:`Circle variant`,get source(){return m},children:(e,t)=>{p(e,{})},$$slots:{default:!0}}),i(e,t)}export{_ as component};
//# sourceMappingURL=151.DUvFjR6i.js.map
