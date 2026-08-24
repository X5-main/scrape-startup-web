(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0b5b7bcd-77ef-4c23-a6ac-977ffa806de5`,e._sentryDebugIdIdentifier=`sentry-dbid-0b5b7bcd-77ef-4c23-a6ac-977ffa806de5`)}catch{}})();import{Ft as e,St as t,Tt as n,_n as r,bt as i,cn as a,dt as o,en as s,fn as c,on as l,qt as u,tn as d,vn as f,vt as p,wn as m,xt as h}from"../chunks/F_ixKBiO.js";import"../chunks/B1sc9Zdx.js";import"../chunks/Bb2deiU3.js";import{n as g}from"../chunks/BjoSM1kg2.js";import{t as _}from"../chunks/CTOUdCkL2.js";import{t as v}from"../chunks/B7pb01xV2.js";import{t as y}from"../chunks/Vgt0T3PW.js";import{t as b}from"../chunks/Dw1TJ-HJ.js";import{t as x}from"../chunks/p984Gt1u.js";var S=t(`<button class="btn btn-outlined btn-primary">Pick a fruit</button>`);function C(t,d){f(d,!0);let y=[`Apple`,`Banana`,`Cherry`,`Grape`,`Mango`,`Orange`,`Peach`,`Pineapple`,`Strawberry`],b=a(``),x=c(()=>e(b)?y.filter(t=>t.toLowerCase().includes(e(b).toLowerCase())):y);g(t,{filterPlaceholder:`Filter fruits…`,onFilter:e=>l(b,e,!0),button:e=>{i(e,S())},children:(t,r)=>{v(t,{children:(t,r)=>{var a=h();o(s(a),16,()=>e(x),e=>e,(e,t)=>{_(e,{children:(e,r)=>{m();var a=n();u(()=>p(a,t)),i(e,a)},$$slots:{default:!0}})}),i(t,a)},$$slots:{default:!0}})},$$slots:{button:!0,default:!0}}),r()}var w=`<script lang="ts">
  import Dropdown from "$lib/ui/system/Dropdown.svelte";
  import DropdownItem from "$lib/ui/system/DropdownItem.svelte";
  import DropdownItemGroup from "$lib/ui/system/DropdownItemGroup.svelte";

  const allFruits = [
    "Apple",
    "Banana",
    "Cherry",
    "Grape",
    "Mango",
    "Orange",
    "Peach",
    "Pineapple",
    "Strawberry",
  ];

  let filterQuery = $state("");

  const filteredFruits = $derived(
    filterQuery
      ? allFruits.filter((fruit) =>
          fruit.toLowerCase().includes(filterQuery.toLowerCase()),
        )
      : allFruits,
  );
<\/script>

<Dropdown
  filterPlaceholder="Filter fruits…"
  onFilter={(query) => (filterQuery = query)}
>
  {#snippet button()}
    <button class="btn btn-outlined btn-primary">Pick a fruit</button>
  {/snippet}

  <DropdownItemGroup>
    {#each filteredFruits as fruit (fruit)}
      <DropdownItem>{fruit}</DropdownItem>
    {/each}
  </DropdownItemGroup>
</Dropdown>
`,T=`<script lang="ts">
  import Pizza from "lucide-svelte/icons/pizza";

  import Dropdown from "$lib/ui/system/Dropdown.svelte";
  import DropdownItem from "$lib/ui/system/DropdownItem.svelte";
  import DropdownItemGroup from "$lib/ui/system/DropdownItemGroup.svelte";
<\/script>

<Dropdown>
  {#snippet button()}
    <button class="btn btn-outlined btn-primary">Open dropdown</button>
  {/snippet}

  <DropdownItemGroup>
    <DropdownItem href="/home">Go home</DropdownItem>
    <DropdownItem href="/home">Go to work</DropdownItem>
    <DropdownItem href="/home">Go to the park</DropdownItem>
  </DropdownItemGroup>

  <hr />

  <DropdownItemGroup>
    <DropdownItem href="/home">
      {#snippet icon()}
        <Pizza size={20} class="text-c-gray-60" />
      {/snippet}
      Go to Joe's Pizza
    </DropdownItem>
  </DropdownItemGroup>
</Dropdown>
`,E=t(`<!> <!> <p class="text-foreground-secondary mt-4 max-w-2xl">Prefer <code>href</code> items for navigation (right-click and middle-click
  work, no JS needed) and <code>onclick</code> items for in-place actions.
  Separate logical groups with <code>DropdownItemGroup</code> and an <code>&lt;hr /&gt;</code>. For selecting a value from a list, use <code>DropdownSelect</code>; for free-text entry with suggestions, use <code>Combobox</code>.</p> <!> <p class="text-foreground-secondary mt-4 max-w-2xl">Passing <code>onFilter</code> renders a filter input pinned to the top of the menu.
  The dropdown does not filter for you — keep the query in state and derive the visible
  items, so filtering logic (fuzzy match, grouping) stays in the caller's control.</p>`,1);function D(e){var t=E(),n=s(t);b(n,{title:`Dropdown`,description:`Flexible context menu for links and user actions, built on melt-ui. Supports item groups, icons, submenus, filtering, and keyboard navigation.`,sourcePath:`src/lib/ui/system/Dropdown.svelte`});var r=d(n,2);x(r,{get source(){return T},children:(e,t)=>{y(e,{})},$$slots:{default:!0}}),x(d(r,4),{title:`Filtering`,get source(){return w},children:(e,t)=>{C(e,{})},$$slots:{default:!0}}),m(2),i(e,t)}export{D as component};
//# sourceMappingURL=152.BHzyv3sq.js.map
