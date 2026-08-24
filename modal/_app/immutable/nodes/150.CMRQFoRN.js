(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`11fb7406-d71a-40b0-851d-2aa5b9abbd99`,e._sentryDebugIdIdentifier=`sentry-dbid-11fb7406-d71a-40b0-851d-2aa5b9abbd99`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,en as a,tn as o,wn as s}from"../chunks/F_ixKBiO.js";import"../chunks/B1sc9Zdx.js";import"../chunks/Bb2deiU3.js";import{t as c}from"../chunks/_5MIDWXk.js";import{t as l}from"../chunks/Bsr4b-v6.js";import{t as u}from"../chunks/9Ww0HFjc.js";import{t as d}from"../chunks/DJIHQEb_2.js";import{t as f}from"../chunks/42EvD_Xd.js";import{t as p}from"../chunks/DiGqloIJ.js";import{t as m}from"../chunks/Dw1TJ-HJ.js";import{t as h}from"../chunks/p984Gt1u.js";function g(e){l(e,{href:`/docs`,get iconTrailing(){return u},children:(e,t)=>{s(),i(e,r(`Read the docs`))},$$slots:{default:!0}})}var _=`<script lang="ts">
  import ExternalLink from "lucide-svelte/icons/external-link";

  import Button from "$lib/ui/system/Button.svelte";
<\/script>

<Button href="/docs" iconTrailing={ExternalLink}>Read the docs</Button>
`,v=`<script lang="ts">
  import Plus from "lucide-svelte/icons/plus";

  import Button from "$lib/ui/system/Button.svelte";
<\/script>

<div class="flex items-center gap-3">
  <Button color="accent" iconLeading={Plus}>Create app</Button>
  <Button>Cancel</Button>
</div>
`,y=t(`<div class="flex items-center gap-3"><!> <!> <!></div>`);function b(t){var a=y(),u=e(a);l(u,{get iconLeading(){return d},children:(e,t)=>{s(),i(e,r(`Download logs`))},$$slots:{default:!0}});var p=o(u,2);l(p,{get iconTrailing(){return f},color:`danger`,children:(e,t)=>{s(),i(e,r(`Delete`))},$$slots:{default:!0}}),l(o(p,2),{get iconLeading(){return c},tooltip:`Settings`}),n(a),i(t,a)}var x=`<script lang="ts">
  import Download from "lucide-svelte/icons/download";
  import Settings from "lucide-svelte/icons/settings";
  import Trash2 from "lucide-svelte/icons/trash-2";

  import Button from "$lib/ui/system/Button.svelte";
<\/script>

<div class="flex items-center gap-3">
  <Button iconLeading={Download}>Download logs</Button>
  <Button iconTrailing={Trash2} color="danger">Delete</Button>
  <Button iconLeading={Settings} tooltip="Settings" />
</div>
`,S=t(`<div class="flex items-center gap-3"><!> <!></div>`);function C(t){var a=S(),c=e(a);l(c,{size:`regular`,children:(e,t)=>{s(),i(e,r(`Regular`))},$$slots:{default:!0}}),l(o(c,2),{size:`small`,children:(e,t)=>{s(),i(e,r(`Small`))},$$slots:{default:!0}}),n(a),i(t,a)}var w=`<script lang="ts">
  import Button from "$lib/ui/system/Button.svelte";
<\/script>

<div class="flex items-center gap-3">
  <Button size="regular">Regular</Button>
  <Button size="small">Small</Button>
</div>
`,T=t(`<div class="flex flex-col gap-4"><div class="flex items-center gap-3"><!> <!> <!> <!></div> <div class="flex items-center gap-3"><!> <!> <!> <!></div></div>`);function E(t){var a=T(),c=e(a),u=e(c);l(u,{variant:`primary`,children:(e,t)=>{s(),i(e,r(`Primary`))},$$slots:{default:!0}});var d=o(u,2);l(d,{variant:`primary`,color:`accent`,children:(e,t)=>{s(),i(e,r(`Accent`))},$$slots:{default:!0}});var f=o(d,2);l(f,{variant:`primary`,color:`danger`,children:(e,t)=>{s(),i(e,r(`Danger`))},$$slots:{default:!0}}),l(o(f,2),{variant:`primary`,color:`warning`,children:(e,t)=>{s(),i(e,r(`Warning`))},$$slots:{default:!0}}),n(c);var p=o(c,2),m=e(p);l(m,{variant:`secondary`,children:(e,t)=>{s(),i(e,r(`Secondary`))},$$slots:{default:!0}});var h=o(m,2);l(h,{variant:`secondary`,color:`accent`,children:(e,t)=>{s(),i(e,r(`Accent`))},$$slots:{default:!0}});var g=o(h,2);l(g,{variant:`secondary`,color:`danger`,children:(e,t)=>{s(),i(e,r(`Danger`))},$$slots:{default:!0}}),l(o(g,2),{variant:`secondary`,color:`warning`,children:(e,t)=>{s(),i(e,r(`Warning`))},$$slots:{default:!0}}),n(p),n(a),i(t,a)}var D=`<script lang="ts">
  import Button from "$lib/ui/system/Button.svelte";
<\/script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3">
    <Button variant="primary">Primary</Button>
    <Button variant="primary" color="accent">Accent</Button>
    <Button variant="primary" color="danger">Danger</Button>
    <Button variant="primary" color="warning">Warning</Button>
  </div>
  <div class="flex items-center gap-3">
    <Button variant="secondary">Secondary</Button>
    <Button variant="secondary" color="accent">Accent</Button>
    <Button variant="secondary" color="danger">Danger</Button>
    <Button variant="secondary" color="warning">Warning</Button>
  </div>
</div>
`,O=t(`<!> <!> <!> <p class="text-foreground-secondary mt-4 max-w-2xl">Use <code>primary</code> (outlined) for the main call to action and <code>secondary</code> (plain text) for medium-emphasis actions next to it.
  Reserve <code>color="danger"</code> for destructive actions, and pair it with
  a <a class="text-foreground-accent hover:underline" href="/internal/storybook/?path=/docs/system-confirm--docs">Confirm</a> dialog when the action is irreversible.</p> <!> <!> <p class="text-foreground-secondary mt-4 max-w-2xl">Icons auto-size to the button size. An icon-only button (no children) becomes
  square — always give it a <code>tooltip</code> so the action stays discoverable.</p> <!>`,1);function k(e){var t=O(),n=a(t);m(n,{title:`Button`,description:`Polymorphic button for the dashboard UI. Renders as an <a> when href is provided, and as a <button> otherwise. Native attributes (disabled, onclick, …) are spread through.`,storybookId:`system-button`,sourcePath:`src/lib/ui/system/Button.svelte`});var r=o(n,2);h(r,{get source(){return v},children:(e,t)=>{p(e,{})},$$slots:{default:!0}});var s=o(r,2);h(s,{title:`Variants and colors`,get source(){return D},children:(e,t)=>{E(e,{})},$$slots:{default:!0}});var c=o(s,4);h(c,{title:`Sizes`,get source(){return w},children:(e,t)=>{C(e,{})},$$slots:{default:!0}});var l=o(c,2);h(l,{title:`Icons`,get source(){return x},children:(e,t)=>{b(e,{})},$$slots:{default:!0}}),h(o(l,4),{title:`As a link`,get source(){return _},children:(e,t)=>{g(e,{})},$$slots:{default:!0}}),i(e,t)}export{k as component};
//# sourceMappingURL=150.CMRQFoRN.js.map
