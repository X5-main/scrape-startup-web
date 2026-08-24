(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,201849,e=>{"use strict";var t=e.i(843476),n=e.i(271645),r=e.i(363178),i=e.i(977336),a=e.i(935564),s=e.i(247167),o=e.i(337822),l=e.i(519455),d=e.i(793479),c=e.i(96892),p=e.i(77071),u=e.i(395925),g=e.i(328623),m=e.i(263676),h=e.i(975157);let y=s.default.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;function f({children:e}){let{brand:r,status:i,error:s,fetchBrand:b,reset:x}=(0,a.useBrand)(),[v,w]=n.useState(!1),[j,k]=n.useState(""),[S,C]=n.useState(!1),[A,T]=n.useState([]),[I,_]=n.useState(!1),[L,R]=n.useState(0),P=n.useRef(!1),E=n.useRef(null),z=n.useRef(0),[B,N]=n.useState(!1),q=n.useRef(!1),D=n.useCallback(()=>{q.current||(q.current=!0,N(!1))},[]);n.useEffect(()=>{if(v){P.current=!0,k(r?.domain??""),T([]),R(0);let e=window.setTimeout(()=>E.current?.focus(),30);return()=>window.clearTimeout(e)}},[v,r?.domain]),n.useEffect(()=>{if(P.current){P.current=!1;return}let e=j.trim();if(e.length<2){T([]),_(!1);return}let t=window.setTimeout(async()=>{let t=++z.current;_(!0);try{let n=new URL(`https://api.brandfetch.io/v2/search/${encodeURIComponent(e)}`);y&&n.searchParams.set("c",y);let r=await fetch(n,{cache:"no-store"});if(t!==z.current)return;let i=await r.json().catch(()=>[]),a=(Array.isArray(i)?i:[]).filter(e=>!!e.domain&&!!e.name).slice(0,8).map(e=>({name:e.name,domain:e.domain,icon:e.icon??null,claimed:!!e.claimed}));T(a),R(0)}catch{t===z.current&&T([])}finally{t===z.current&&_(!1)}},180);return()=>window.clearTimeout(t)},[j]);let K=n.useRef(i);n.useEffect(()=>{"loading"===K.current&&"idle"===i&&w(!1),K.current=i},[i]),n.useEffect(()=>{if(r)return;let e=document.querySelector(".fha-app-layer .browser-body");if(!e)return;let t=null,n=null,i=()=>{e.removeEventListener("pointerdown",i),q.current||(t=window.setTimeout(()=>{q.current||(N(!0),n=window.setTimeout(()=>D(),6e3))},3500))};return e.addEventListener("pointerdown",i),()=>{e.removeEventListener("pointerdown",i),t&&window.clearTimeout(t),n&&window.clearTimeout(n)}},[r,D]),n.useEffect(()=>{B&&v&&D()},[v,B,D]);let $=e=>{let t=e.trim();t&&(P.current=!0,k(t),T([]),window.posthog?.capture("brand_picker_applied",{brand:t}),b(t))};return(0,t.jsxs)("span",{style:{position:"relative",display:"inline-flex"},children:[(0,t.jsxs)(o.Popover,{open:v,onOpenChange:w,children:[(0,t.jsx)(o.PopoverTrigger,{render:(0,t.jsxs)("button",{type:"button","aria-label":"Customize this demo with your brand",onMouseEnter:()=>C(!0),onMouseLeave:()=>C(!1),style:{display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",padding:"4px 6px",margin:"-4px -6px",background:"transparent",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",color:"inherit",transition:"background 140ms ease",outline:"none"},children:[(0,t.jsx)("span",{"aria-hidden":S||v,style:{display:"inline-flex",transition:"filter 180ms ease, opacity 180ms ease",filter:S||v?"blur(4px)":"none",opacity:S||v?.5:1},children:e}),(0,t.jsxs)("span",{"aria-hidden":!0,style:{position:"absolute",top:"50%",left:0,transform:"translateY(-50%)",display:"inline-flex",alignItems:"center",gap:4,height:22,padding:"0 8px",borderRadius:999,background:"var(--accent-bg)",color:"var(--brand-fg)",border:"1px solid var(--accent-border)",fontSize:11,fontWeight:600,letterSpacing:"-0.005em",whiteSpace:"nowrap",opacity:S||v?1:0,transition:"opacity 180ms ease",pointerEvents:"none"},children:[(0,t.jsx)(p.Plus,{size:12,strokeWidth:2.5}),"Add your brand"]})]})}),(0,t.jsxs)(o.PopoverContent,{align:"start",sideOffset:10,className:"w-80 gap-3 p-3",onClick:e=>e.stopPropagation(),children:[(0,t.jsxs)("div",{className:"flex items-start justify-between gap-2",children:[(0,t.jsxs)("div",{className:"flex flex-col gap-0.5",children:[(0,t.jsxs)("div",{className:"flex items-center gap-1.5 text-sm font-medium",children:[(0,t.jsx)(g.Sparkles,{size:13,className:"text-muted-foreground"}),"Try it with your brand"]}),(0,t.jsx)("p",{className:"text-muted-foreground text-xs leading-snug",children:"Enter your brand to style this demo."})]}),(0,t.jsx)("button",{type:"button","aria-label":"Close",onClick:()=>w(!1),className:"text-muted-foreground hover:text-foreground -mt-0.5 -mr-1 cursor-pointer rounded-md p-1 transition-colors",children:(0,t.jsx)(m.X,{size:14})})]}),(0,t.jsxs)("form",{onSubmit:e=>{(e.preventDefault(),A.length>0&&L<A.length)?$(A[L].domain):$(j)},className:"flex flex-col gap-2",children:[(0,t.jsxs)("div",{className:"relative flex items-center gap-2",children:[(0,t.jsx)(d.Input,{ref:E,type:"text",inputMode:"text",autoComplete:"off",autoCapitalize:"off",spellCheck:!1,value:j,onChange:e=>k(e.target.value),onKeyDown:e=>{0!==A.length&&("ArrowDown"===e.key?(e.preventDefault(),R(e=>(e+1)%A.length)):"ArrowUp"===e.key?(e.preventDefault(),R(e=>(e-1+A.length)%A.length)):"Escape"===e.key&&T([]))},placeholder:"Search a brand",className:"h-8 flex-1 text-sm",disabled:"loading"===i,role:"combobox","aria-expanded":A.length>0,"aria-controls":"brand-picker-results","aria-activedescendant":A.length>0?`brand-picker-option-${L}`:void 0}),(0,t.jsx)(l.Button,{type:"submit",size:"sm",className:"h-8 px-3",disabled:"loading"===i||!j.trim(),children:"loading"===i?"Loading…":"Apply"})]}),j.trim().length>=2&&(A.length>0||I)?(0,t.jsx)("ul",{id:"brand-picker-results",role:"listbox",className:"bg-background border-border max-h-56 overflow-y-auto rounded-md border p-1 shadow-sm",children:0===A.length&&I?(0,t.jsx)("li",{className:"text-muted-foreground px-1.5 py-1 text-xs",children:"Searching…"}):A.map((e,n)=>(0,t.jsx)("li",{id:`brand-picker-option-${n}`,role:"option","aria-selected":n===L,children:(0,t.jsxs)("button",{type:"button",onMouseEnter:()=>R(n),onClick:()=>$(e.domain),className:(0,h.cn)("flex w-full cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-left text-xs transition-colors",n===L?"bg-foreground/[0.08] text-foreground":"hover:bg-foreground/[0.04]"),children:[(0,t.jsx)("span",{className:"bg-foreground/[0.04] inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded",children:e.icon?(0,t.jsx)("img",{src:e.icon,alt:"",className:"h-3.5 w-3.5 object-contain",loading:"lazy"}):null}),(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate font-medium",children:e.name}),(0,t.jsx)("span",{className:"text-muted-foreground truncate text-[11px]",children:e.domain})]})},`${e.domain}-${n}`))}):null,"error"===i&&s?(0,t.jsx)("p",{className:"text-destructive text-xs leading-snug",children:s}):null]}),r?(0,t.jsxs)("div",{className:"flex items-center justify-between gap-2 border-t pt-2.5",children:[(0,t.jsxs)("div",{className:"flex min-w-0 items-center gap-2",children:[r.logoLight?(0,t.jsx)("span",{className:"bg-foreground/[0.03] inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded",children:(0,t.jsx)("img",{src:r.logoLight,alt:"",className:"h-4 w-4 object-contain"})}):r.color?(0,t.jsx)("span",{className:"h-4 w-4 rounded ring-1 ring-black/10",style:{background:r.color}}):null,(0,t.jsx)("span",{className:"text-foreground truncate text-xs font-medium",children:r.name})]}),(0,t.jsxs)("button",{type:"button",onClick:()=>{x(),k(""),T([]),w(!1)},className:"text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-xs",children:[(0,t.jsx)(u.RotateCcw,{size:11}),"Reset"]})]}):null]})]}),B?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{"aria-hidden":!0,className:"brand-picker-hint-caret",style:{position:"absolute",top:"calc(100% + 9px)",left:14,width:8,height:8,borderTopWidth:1,borderLeftWidth:1,borderTopStyle:"solid",borderLeftStyle:"solid",zIndex:9002}}),(0,t.jsxs)("span",{role:"status","aria-live":"polite",className:"brand-picker-hint",style:{position:"absolute",top:"calc(100% + 12px)",left:0,display:"inline-flex",alignItems:"center",gap:6,height:30,padding:"0 8px 0 10px",borderRadius:16,borderWidth:1,borderStyle:"solid",fontSize:12,fontWeight:600,letterSpacing:"-0.005em",whiteSpace:"nowrap",overflow:"hidden",zIndex:9001,pointerEvents:"auto"},children:[(0,t.jsx)(c.ArrowUp,{className:"brand-picker-hint-icon",size:13,strokeWidth:2.5}),"Try it with your own brand",(0,t.jsx)("button",{type:"button","aria-label":"Dismiss hint",className:"brand-picker-hint-close",onClick:e=>{e.stopPropagation(),D()},style:{marginLeft:2,display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:999,background:"transparent",border:"none",cursor:"pointer",padding:0,transition:"color 120ms ease"},children:(0,t.jsx)(m.X,{size:12,strokeWidth:2.5})}),(0,t.jsx)("span",{"aria-hidden":!0,className:"brand-picker-hint-progress"})]})]}):null]})}function b(){return(0,t.jsxs)("svg",{width:"107",height:"17",viewBox:"0 0 107 17",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-label":"Your Company",style:{display:"block"},children:[(0,t.jsx)("path",{d:"M4.38676 0.887908L6.29551 8.01149V0.17967C6.44687 0.144352 6.59985 0.113247 6.75431 0.0864867V8.01223L8.90117 0C9.05589 0.0140063 9.20939 0.032333 9.36143 0.0548581L7.19729 8.13167L11.4991 0.680697C11.6392 0.743743 11.7773 0.810635 11.9131 0.881228L7.59524 8.35996L13.7595 2.19569C13.8707 2.30078 13.9788 2.40897 14.0839 2.52011L7.91874 8.68532L15.3983 4.36693C15.469 4.50274 15.5358 4.6408 15.5988 4.78096L8.14974 9.08172L16.2243 6.91811C16.2468 7.07021 16.2652 7.22368 16.2791 7.3784L8.26701 9.52526H16.1925C16.1658 9.67974 16.1347 9.83267 16.0993 9.98405H8.26579L15.3907 11.8932C15.3176 12.0332 15.2405 12.171 15.1595 12.3062L8.14907 10.4278L14.0044 13.8083C13.8936 13.9223 13.7795 14.0331 13.6621 14.1404L7.92019 10.8254L12.265 15.1702C12.1276 15.2505 11.9876 15.3269 11.8452 15.3992L7.5953 11.1493L10.3799 15.9723C10.2274 16.0154 10.0731 16.0542 9.9172 16.0886L7.19757 11.378L8.50885 16.2716C8.39197 16.2766 8.27443 16.2791 8.15633 16.2791C8.11602 16.2791 8.07578 16.2788 8.03561 16.2782L6.75431 11.4964V16.159C6.59984 16.1323 6.44687 16.1012 6.29551 16.0659V11.4971L5.16576 15.7134C5.02166 15.6566 4.87957 15.5958 4.73963 15.5312L5.85218 11.379L3.76368 14.9964C3.63438 14.9136 3.50757 14.8273 3.38339 14.7375L5.45548 11.1485L2.55367 14.0504C2.44253 13.9453 2.33433 13.8371 2.22924 13.7259L5.13014 10.8251L1.54221 12.8965C1.45243 12.7724 1.36607 12.6455 1.28325 12.5163L4.90235 10.4268L0.748159 11.5399C0.6835 11.4 0.622688 11.2579 0.565862 11.1138L4.78214 9.98405H0.213329C0.178 9.83267 0.146887 9.67974 0.120118 9.52526H4.78091L0.000888909 8.24447C0.000296988 8.20393 0 8.16339 0 8.12278C0 8.00499 0.00249676 7.88778 0.00744024 7.77121L4.90168 9.08261L0.190421 6.36258C0.224726 6.20662 0.263494 6.05234 0.306584 5.89988L5.13158 8.68556L0.879897 4.43391C0.952235 4.2915 1.02862 4.15152 1.10892 4.01409L5.45553 8.3607L2.1391 2.61647C2.24648 2.49918 2.35726 2.38504 2.47126 2.27421L5.85246 8.13061L3.97372 1.11907C4.10891 1.03816 4.24664 0.961062 4.38676 0.887908Z",style:{fill:"var(--brand-fg)"},fillOpacity:"0.95"}),(0,t.jsx)("path",{d:"M24.0287 9.06806L20.5312 3.87411H22.0973L24.6942 7.7761L27.2782 3.87411H28.8311L25.3337 9.06806V13.0092H24.0287V9.06806ZM31.4122 13.1919C30.7858 13.1919 30.2246 13.0527 29.7287 12.7743C29.2416 12.4959 28.8587 12.1044 28.5803 11.5998C28.3106 11.0952 28.1758 10.5166 28.1758 9.86412C28.1758 9.21161 28.3106 8.6374 28.5803 8.1415C28.8587 7.63689 29.2416 7.24539 29.7287 6.96699C30.2246 6.68859 30.7858 6.54938 31.4122 6.54938C32.0473 6.54938 32.6085 6.68859 33.0957 6.96699C33.5828 7.24539 33.9613 7.63689 34.231 8.1415C34.5094 8.6374 34.6486 9.21161 34.6486 9.86412C34.6486 10.5253 34.5094 11.1082 34.231 11.6128C33.9613 12.1087 33.5828 12.4959 33.0957 12.7743C32.6085 13.0527 32.0473 13.1919 31.4122 13.1919ZM29.4808 9.86412C29.4808 10.5166 29.6592 11.043 30.0158 11.4432C30.3725 11.8434 30.838 12.0435 31.4122 12.0435C31.9951 12.0435 32.4605 11.8434 32.8086 11.4432C33.1652 11.043 33.3436 10.5166 33.3436 9.86412C33.3436 9.22034 33.1652 8.69833 32.8086 8.2981C32.4605 7.89789 31.9951 7.69779 31.4122 7.69779C30.838 7.69779 30.3725 7.89789 30.0158 8.2981C29.6592 8.69833 29.4808 9.22034 29.4808 9.86412ZM38.5756 13.1919C37.8013 13.1919 37.1967 12.9613 36.7616 12.5002C36.3266 12.0392 36.1091 11.3779 36.1091 10.5166V6.73209H37.375V10.3992C37.375 10.9473 37.4968 11.3606 37.7404 11.6389C37.9927 11.9087 38.3494 12.0435 38.8105 12.0435C39.289 12.0435 39.6675 11.8912 39.9458 11.5867C40.2329 11.2735 40.3765 10.8647 40.3765 10.36V6.73209H41.6424V13.0092H40.52V12.2914C40.32 12.5873 40.0502 12.8134 39.7109 12.97C39.3716 13.1179 38.9932 13.1919 38.5756 13.1919ZM43.581 6.73209H44.7033V7.75C44.7816 7.42809 44.9382 7.18014 45.1731 7.00614C45.408 6.82344 45.7081 6.73209 46.0735 6.73209H47.2741V7.84135H45.9561C45.5732 7.84135 45.2905 7.95009 45.1078 8.1676C44.9338 8.3764 44.8468 8.69833 44.8468 9.13331V13.0092H43.581V6.73209ZM55.6504 13.1919C54.8327 13.1919 54.1149 13.0135 53.4972 12.6568C52.8795 12.3002 52.401 11.7694 52.0617 11.0647C51.7224 10.3513 51.5527 9.48134 51.5527 8.4547C51.5527 6.91479 51.9181 5.73593 52.6489 4.91812C53.3797 4.10031 54.389 3.69141 55.6766 3.69141C56.6684 3.69141 57.4819 3.96546 58.1169 4.51356C58.7608 5.06167 59.1523 5.82292 59.2914 6.79734H57.9212C57.8255 6.20573 57.5732 5.74462 57.1643 5.41402C56.7554 5.07472 56.2595 4.90507 55.6766 4.90507C54.8066 4.90507 54.1236 5.19652 53.6277 5.77943C53.1405 6.36233 52.8969 7.24539 52.8969 8.4286C52.8969 9.59439 53.1448 10.4775 53.6407 11.0778C54.1454 11.6781 54.8152 11.9782 55.6504 11.9782C56.2682 11.9782 56.7728 11.7955 57.1643 11.4301C57.5645 11.056 57.8168 10.5645 57.9212 9.95547H59.2784C59.1131 10.9385 58.7172 11.726 58.0908 12.3175C57.4644 12.9005 56.651 13.1919 55.6504 13.1919ZM63.6043 13.1919C62.9779 13.1919 62.4167 13.0527 61.9208 12.7743C61.4335 12.4959 61.0508 12.1044 60.7724 11.5998C60.5027 11.0952 60.3678 10.5166 60.3678 9.86412C60.3678 9.21161 60.5027 8.6374 60.7724 8.1415C61.0508 7.63689 61.4335 7.24539 61.9208 6.96699C62.4167 6.68859 62.9779 6.54938 63.6043 6.54938C64.2393 6.54938 64.8005 6.68859 65.2877 6.96699C65.7749 7.24539 66.1534 7.63689 66.4231 8.1415C66.7015 8.6374 66.8407 9.21161 66.8407 9.86412C66.8407 10.5253 66.7015 11.1082 66.4231 11.6128C66.1534 12.1087 65.7749 12.4959 65.2877 12.7743C64.8005 13.0527 64.2393 13.1919 63.6043 13.1919ZM61.6728 9.86412C61.6728 10.5166 61.8511 11.043 62.2079 11.4432C62.5646 11.8434 63.0301 12.0435 63.6043 12.0435C64.1871 12.0435 64.6526 11.8434 65.0006 11.4432C65.3573 11.043 65.5357 10.5166 65.5357 9.86412C65.5357 9.22034 65.3573 8.69833 65.0006 8.2981C64.6526 7.89789 64.1871 7.69779 63.6043 7.69779C63.0301 7.69779 62.5646 7.89789 62.2079 8.2981C61.8511 8.69833 61.6728 9.22034 61.6728 9.86412ZM68.4195 6.73209H69.5418V7.50204C69.8985 6.86693 70.4684 6.54938 71.2514 6.54938C71.6777 6.54938 72.0474 6.64944 72.3606 6.84954C72.6739 7.04094 72.9044 7.31499 73.0523 7.67169C73.4525 6.92349 74.0789 6.54938 74.9315 6.54938C75.6536 6.54938 76.2061 6.76253 76.5889 7.18884C76.9804 7.60644 77.1762 8.20675 77.1762 8.98976V13.0092H75.9233V9.05501C75.9233 8.62003 75.8189 8.28505 75.6101 8.05015C75.4101 7.81525 75.1099 7.69779 74.7097 7.69779C74.3355 7.69779 74.0267 7.8283 73.7831 8.0893C73.5482 8.3503 73.4308 8.68528 73.4308 9.09416V13.0092H72.1649V9.05501C72.1649 8.62003 72.0605 8.28505 71.8517 8.05015C71.6516 7.81525 71.3601 7.69779 70.9773 7.69779C70.5946 7.69779 70.2814 7.8283 70.0377 8.0893C69.8028 8.3503 69.6854 8.68528 69.6854 9.09416V13.0092H68.4195V6.73209ZM79.0737 6.73209H80.196V7.61949C80.3961 7.28019 80.6876 7.01919 81.0704 6.83649C81.4532 6.64508 81.8881 6.54938 82.3758 6.54938C82.9671 6.54938 83.4891 6.68859 83.9418 6.96699C84.4027 7.24539 84.7591 7.63689 85.0119 8.1415C85.264 8.6374 85.3904 9.21161 85.3904 9.86412C85.3904 10.5253 85.264 11.1082 85.0119 11.6128C84.7591 12.1087 84.4027 12.4959 83.9418 12.7743C83.4891 13.0527 82.9671 13.1919 82.3758 13.1919C81.9231 13.1919 81.5184 13.1093 81.1617 12.9439C80.8137 12.7786 80.5397 12.5437 80.3396 12.2392V15.3582H79.0737V6.73209ZM80.3135 9.86412C80.3135 10.5166 80.4831 11.043 80.8224 11.4432C81.1705 11.8434 81.6271 12.0435 82.1931 12.0435C82.7583 12.0435 83.2151 11.8434 83.5634 11.4432C83.9108 11.043 84.0854 10.5166 84.0854 9.86412C84.0854 9.22034 83.9108 8.69833 83.5634 8.2981C83.2151 7.89789 82.7583 7.69779 82.1931 7.69779C81.6271 7.69779 81.1705 7.89789 80.8224 8.2981C80.4831 8.69833 80.3135 9.22034 80.3135 9.86412ZM88.8144 13.1919C88.0926 13.1919 87.5184 13.0179 87.0918 12.6699C86.666 12.3132 86.4523 11.8347 86.4523 11.2344C86.4523 10.6514 86.6481 10.1816 87.0396 9.82497C87.4311 9.45956 88.0012 9.25508 88.7492 9.21161L90.6545 9.10721V8.75486C90.6545 8.34598 90.5501 8.05015 90.3413 7.86745C90.1414 7.68475 89.8242 7.59339 89.3886 7.59339C88.9629 7.59339 88.6407 7.66299 88.4229 7.8022C88.2141 7.9327 88.0836 8.15887 88.0314 8.4808H86.7655C86.8357 7.837 87.0918 7.35414 87.5355 7.03224C87.9882 6.71033 88.6366 6.54938 89.48 6.54938C90.2369 6.54938 90.8201 6.73643 91.2287 7.11054C91.6463 7.47594 91.8551 8.0023 91.8551 8.68961V11.7564C91.8551 11.8956 91.9252 11.9652 92.0639 11.9652H92.599V13.0092H91.581C91.3641 13.0092 91.1944 12.9527 91.0721 12.8395C90.9595 12.7264 90.9024 12.5655 90.9024 12.3567V12.174C90.7197 12.4959 90.4457 12.7482 90.0803 12.9309C89.7238 13.1049 89.3022 13.1919 88.8144 13.1919ZM87.7182 11.1952C87.7182 11.4823 87.8275 11.7129 88.0445 11.8869C88.2712 12.0609 88.5754 12.1479 88.958 12.1479C89.48 12.1479 89.8935 12.0043 90.1977 11.7172C90.5028 11.4214 90.6545 11.0125 90.6545 10.4905V10.086L88.9058 10.2165C88.5143 10.2426 88.219 10.347 88.0184 10.5297C87.8185 10.7036 87.7182 10.9255 87.7182 11.1952ZM93.9333 6.73209H95.0556V7.55424C95.2383 7.22364 95.5042 6.97569 95.8517 6.81039C96.2089 6.63639 96.6045 6.54938 97.0393 6.54938C97.8223 6.54938 98.4356 6.78429 98.8793 7.25409C99.323 7.71519 99.5449 8.37208 99.5449 9.22466V13.0092H98.279V9.34211C98.279 8.79401 98.1485 8.38513 97.8875 8.1154C97.6355 7.837 97.2742 7.69779 96.8044 7.69779C96.3174 7.69779 95.9259 7.8544 95.6298 8.1676C95.3427 8.47208 95.1992 8.87663 95.1992 9.38126V13.0092H93.9333V6.73209ZM100.546 14.2229H101.668C101.877 14.2229 102.037 14.188 102.151 14.1185C102.272 14.0489 102.368 13.9314 102.438 13.7661L102.986 12.5785L100.35 6.73209H101.798L103.652 11.1561L105.505 6.73209H106.927L103.482 14.3925C103.333 14.7318 103.147 14.9754 102.921 15.1233C102.694 15.2799 102.373 15.3582 101.955 15.3582H100.546V14.2229Z",fill:"currentColor",fillOpacity:"0.85"})]})}function x({theme:e}){let{brand:n}=(0,a.useBrand)();if(!n)return(0,t.jsx)(b,{});let r="dark"===e?n.logoDark??n.logoLight:n.logoLight??n.logoDark;return r?(0,t.jsx)("img",{src:r,alt:n.name,style:{display:"block",height:22,width:"auto",maxWidth:140,objectFit:"contain"}}):(0,t.jsx)(b,{})}function v({activeTab:e,onTabChange:n,onSearchOpen:r,onAssistantOpen:a,theme:s,onToggleTheme:o}){return(0,t.jsxs)("div",{style:{position:"sticky",top:0,zIndex:50,background:"color-mix(in srgb, var(--bg-surface) 80%, transparent)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:"1px solid var(--border)"},children:[(0,t.jsxs)("div",{style:{height:52,display:"flex",alignItems:"center",padding:"0 20px",gap:16},children:[(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",flexShrink:0,color:"var(--fg-primary)"},children:(0,t.jsx)(f,{children:(0,t.jsx)(x,{theme:s})})}),(0,t.jsxs)("div",{style:{flex:1,display:"flex",justifyContent:"center",alignItems:"center",gap:8},children:[(0,t.jsxs)("button",{onClick:r,style:{flex:1,maxWidth:420,height:32,background:"var(--bg-subtle)",border:"1px solid var(--border)",borderRadius:8,display:"flex",alignItems:"center",gap:8,padding:"0 10px",cursor:"pointer",color:"var(--fg-tertiary)",fontFamily:"inherit",fontSize:13,transition:"background 120ms, border-color 120ms, color 120ms"},onMouseEnter:e=>{e.currentTarget.style.background="var(--bg-hover)",e.currentTarget.style.borderColor="var(--border-strong)",e.currentTarget.style.color="var(--fg-secondary)"},onMouseLeave:e=>{e.currentTarget.style.background="var(--bg-subtle)",e.currentTarget.style.borderColor="var(--border)",e.currentTarget.style.color="var(--fg-tertiary)"},"data-demo":"search-trigger",children:[(0,t.jsx)(i.Icon,{name:"search",size:13}),(0,t.jsx)("span",{style:{flex:1,textAlign:"left"},children:"Search"}),(0,t.jsx)("kbd",{style:{fontSize:10,fontFamily:"var(--font-mono)",fontWeight:500,padding:"2px 5px",borderRadius:4,background:"var(--bg-surface)",border:"1px solid var(--border)",color:"var(--fg-tertiary)"},children:"⌘K"})]}),(0,t.jsxs)("button",{onClick:a,"data-demo":"assistant-open",style:{display:"inline-flex",alignItems:"center",gap:6,height:32,padding:"0 12px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:8,fontSize:13,fontWeight:500,color:"var(--fg-secondary)",fontFamily:"inherit",cursor:"pointer",flexShrink:0,transition:"background 120ms, border-color 120ms"},onMouseEnter:e=>{e.currentTarget.style.background="var(--accent-bg)",e.currentTarget.style.borderColor="var(--accent-border)"},onMouseLeave:e=>{e.currentTarget.style.background="var(--bg-surface)",e.currentTarget.style.borderColor="var(--border)"},children:[(0,t.jsx)("span",{children:"Ask AI"}),(0,t.jsx)("span",{style:{color:"var(--brand-fg)",display:"inline-flex"},children:(0,t.jsx)(i.Icon,{name:"sparkles",size:14})})]})]}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,flexShrink:0},children:[(0,t.jsx)("a",{href:"https://dashboard.buildwithfern.com/sign-up?redirect_on_login=%2Fget-started&utm_source=fern-website&utm_content=homepage-animation",style:{display:"inline-flex",alignItems:"center",height:32,padding:"0 12px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:8,fontSize:13,fontWeight:500,color:"var(--fg-secondary)",fontFamily:"inherit",cursor:"pointer",textDecoration:"none",transition:"background 120ms, border-color 120ms, color 120ms"},onMouseEnter:e=>{e.currentTarget.style.background="var(--bg-hover)",e.currentTarget.style.borderColor="var(--border-strong)",e.currentTarget.style.color="var(--fg-primary)"},onMouseLeave:e=>{e.currentTarget.style.background="var(--bg-surface)",e.currentTarget.style.borderColor="var(--border)",e.currentTarget.style.color="var(--fg-secondary)"},children:"Get started"}),(0,t.jsx)("button",{onClick:o,"aria-label":`Switch to ${"dark"===s?"light":"dark"} mode`,title:`Switch to ${"dark"===s?"light":"dark"} mode`,style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,background:"transparent",border:"1px solid var(--border)",borderRadius:8,color:"var(--fg-secondary)",cursor:"pointer",fontFamily:"inherit",transition:"background 120ms, border-color 120ms, color 120ms",flexShrink:0},onMouseEnter:e=>{e.currentTarget.style.background="var(--bg-hover)",e.currentTarget.style.borderColor="var(--border-strong)",e.currentTarget.style.color="var(--fg-primary)"},onMouseLeave:e=>{e.currentTarget.style.background="transparent",e.currentTarget.style.borderColor="var(--border)",e.currentTarget.style.color="var(--fg-secondary)"},children:(0,t.jsx)(i.Icon,{name:"dark"===s?"sun":"moon",size:14})})]})]}),(0,t.jsx)("div",{style:{height:38,display:"flex",alignItems:"stretch",padding:"0 8px"},children:[{id:"home",label:"Home",icon:"home"},{id:"docs",label:"Docs",icon:"book"},{id:"api",label:"API Reference",icon:"code"},{id:"sdks",label:"SDKs",icon:"package"},{id:"changelog",label:"Changelog",icon:"clock"}].map(r=>{let a=e===r.id;return(0,t.jsxs)("button",{onClick:()=>n(r.id),"data-demo":`tab-${r.id}`,style:{position:"relative",padding:"0 12px",display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:a?600:500,color:a?"var(--fg-primary)":"var(--fg-tertiary)",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",transition:"color 120ms"},onMouseEnter:e=>{a||(e.currentTarget.style.color="var(--fg-primary)");let t=e.currentTarget.querySelector("[data-tab-hover]");t&&(t.style.opacity="1")},onMouseLeave:e=>{a||(e.currentTarget.style.color="var(--fg-tertiary)");let t=e.currentTarget.querySelector("[data-tab-hover]");t&&(t.style.opacity="0")},children:[(0,t.jsx)(i.Icon,{name:r.icon,size:13}),r.label,!a&&(0,t.jsx)("div",{"data-tab-hover":!0,style:{position:"absolute",bottom:-1,left:12,right:12,height:2,background:"var(--border-strong)",borderRadius:"2px 2px 0 0",opacity:0,transition:"opacity 120ms",pointerEvents:"none"}}),a&&(0,t.jsx)("div",{style:{position:"absolute",bottom:-1,left:12,right:12,height:2,background:"var(--brand-gradient)",borderRadius:"2px 2px 0 0"}})]},r.id)})})]})}let w=[{items:[{id:"rest",label:"REST",type:"group",children:[{id:"create-agent",label:"Create Agent",method:"POST"},{id:"list-agents",label:"List Agents",method:"GET"},{id:"delete-agent",label:"Delete Agent",method:"DEL"}]},{id:"grpc",label:"gRPC",type:"group",children:[{id:"grpc-create-agent",label:"CreateAgent",method:"RPC"},{id:"grpc-stream-conversation",label:"StreamConversation",method:"RPC"},{id:"grpc-list-agents",label:"ListAgents",method:"RPC"}]},{id:"websockets",label:"WebSockets",type:"group",children:[{id:"ws-conversation",label:"Live Conversation",method:"WS"},{id:"ws-agent-events",label:"Agent Events",method:"WS"}]},{id:"sse",label:"Server-Sent Events",type:"group",children:[{id:"sse-stream-run",label:"Stream Run",method:"SSE"},{id:"sse-stream-tokens",label:"Stream Tokens",method:"SSE"}]},{id:"asyncapi",label:"AsyncAPI",type:"group",children:[{id:"async-agent-created",label:"agent.created",method:"PUB"},{id:"async-run-completed",label:"run.completed",method:"SUB"},{id:"async-tool-invoked",label:"tool.invoked",method:"SUB"}]},{id:"graphql",label:"GraphQL",type:"group",children:[{id:"gql-get-agent",label:"agent",method:"QRY"},{id:"gql-list-agents",label:"agents",method:"QRY"},{id:"gql-create-agent",label:"createAgent",method:"MUT"},{id:"gql-agent-events",label:"agentEvents",method:"SUB"}]}]}],j=[{title:"Get started",items:[{id:"doc-quickstart",label:"Quickstart",type:"page"},{id:"doc-first-agent",label:"Build your first agent",type:"page"},{id:"doc-concepts",label:"Core concepts",type:"page"}]},{title:"Agents",items:[{id:"doc-agent-design",label:"Designing prompts",type:"page"},{id:"doc-agent-tools",label:"Tools & function calling",type:"page"},{id:"doc-agent-memory",label:"Memory & context",type:"page"},{id:"doc-agent-handoff",label:"Multi-agent handoff",type:"page"},{id:"doc-agent-evals",label:"Evals & regression tests",type:"page"}]},{title:"Voice",items:[{id:"doc-voice-models",label:"Choosing a voice",type:"page"},{id:"doc-voice-interruption",label:"Interruption handling",type:"page"},{id:"doc-voice-streaming",label:"Streaming audio",type:"page"},{id:"doc-voice-telephony",label:"Telephony (SIP / Twilio)",type:"page"},{id:"doc-voice-latency",label:"Tuning for latency",type:"page"}]},{title:"Knowledge base",items:[{id:"doc-kb-ingest",label:"Ingesting documents",type:"page"},{id:"doc-kb-chunking",label:"Chunking strategies",type:"page"},{id:"doc-kb-retrieval",label:"Retrieval tuning",type:"page"},{id:"doc-kb-sources",label:"Connected sources",type:"page"}]},{title:"Deploy",items:[{id:"doc-deploy-widget",label:"Web widget",type:"page"},{id:"doc-deploy-mobile",label:"Mobile embed",type:"page"},{id:"doc-deploy-server",label:"Self-hosted runtime",type:"page"},{id:"doc-deploy-edge",label:"Edge workers",type:"page"},{id:"doc-deploy-regions",label:"Regions & residency",type:"page"}]},{title:"Operate",items:[{id:"doc-ops-auth",label:"Auth & API keys",type:"page"},{id:"doc-ops-webhooks",label:"Webhooks",type:"page"},{id:"doc-ops-observability",label:"Traces & logs",type:"page"},{id:"doc-ops-billing",label:"Usage & billing",type:"page"},{id:"doc-ops-security",label:"Security & compliance",type:"page"}]},{title:"Resources",items:[{id:"doc-res-cookbook",label:"Cookbook",type:"page"},{id:"doc-res-faq",label:"FAQ",type:"page"},{id:"doc-res-support",label:"Support",type:"page"}]}],k=[{title:"SDKs",items:[{id:"sdks-overview",label:"Overview",type:"page"},{id:"sdks-quickstart",label:"Quickstart",type:"page"},{id:"sdks-features",label:"Features",type:"page"}]},{title:"Languages",items:[{id:"sdks-typescript",label:"TypeScript",type:"page"},{id:"sdks-python",label:"Python",type:"page"},{id:"sdks-go",label:"Go",type:"page"},{id:"sdks-java",label:"Java",type:"page"},{id:"sdks-csharp",label:"C#",type:"page"},{id:"sdks-ruby",label:"Ruby",type:"page"},{id:"sdks-php",label:"PHP",type:"page"},{id:"sdks-swift",label:"Swift",type:"page"},{id:"sdks-rust",label:"Rust",type:"page"}]},{title:"Reference",items:[{id:"sdks-changelog",label:"Changelog",type:"page"},{id:"sdks-migration",label:"Migrations",type:"page"}]}],S=[{name:"TypeScript",logo:"typescript",package:"your-company-typescript-sdk",version:"2.4.1",date:"Apr 18, 2026",color:"#3178C6",letter:"TS"},{name:"Python",logo:"python",package:"your-company-python-sdk",version:"3.1.0",date:"Apr 21, 2026",color:"#3776AB",letter:"Py"},{name:"Go",logo:"go",package:"your-company-go-sdk",version:"1.9.2",date:"Apr 09, 2026",color:"#00ADD8",letter:"Go"},{name:"Java",logo:"java",package:"your-company-java-sdk",version:"1.12.0",date:"Mar 31, 2026",color:"#ED8B00",letter:"J"},{name:"C#",logo:"csharp",package:"your-company-csharp-sdk",version:"1.5.3",date:"Apr 14, 2026",color:"#512BD4",letter:"C#"},{name:"Ruby",logo:"ruby",package:"your-company-ruby-sdk",version:"1.2.0",date:"Apr 02, 2026",color:"#CC342D",letter:"Rb"},{name:"PHP",logo:"php",package:"your-company-php-sdk",version:"1.1.4",date:"Mar 26, 2026",color:"#777BB4",letter:"PHP"},{name:"Swift",logo:"swift",package:"your-company-swift-sdk",version:"0.8.0-beta",date:"Apr 16, 2026",color:"#F05138",letter:"S"},{name:"Rust",logo:"rust",package:"your-company-rust-sdk",version:"0.6.2-beta",date:"Apr 11, 2026",color:"#CE422B",letter:"Rs"}],C={"create-agent":{id:"create-agent",method:"POST",path:"/v1/voice-agents",breadcrumb:["API Reference","REST"],title:"Create Agent",description:"Creates a new voice agent from the provided config. Returns the created agent with its assigned ID and initial state, ready to handle live conversations.",request:{description:"This endpoint expects an object.",fields:[{name:"voice_config",type:"object",required:!0,description:"Voice configuration — voice ID, model, language, and prosody settings."},{name:"conversation_config",type:"object",required:!1,description:"Turn-taking, interruption handling, and silence thresholds."},{name:"telephony",type:"object",required:!1,description:"SIP / Twilio settings for inbound and outbound phone calls."},{name:"name",type:"string",required:!1,description:"A name to make the voice agent easier to find."},{name:"tags",type:"list of strings or null",required:!1,description:"Tags to help classify and filter the voice agent."}]},response:{description:"Voice agent successfully created",status:200,statusLabel:"Successful",fields:[{name:"agent_id",type:"string",description:"Unique identifier assigned to the newly created voice agent."}],body:`{
  "agent_id": "J3Pbu5gP6NNKBscdCdwB"
}`},samples:{typescript:`import { CompanyClient } from "@your-company/voice-agents-ts";

async function main() {
    const client = new CompanyClient();
    await client.voiceAgents.create({
        voiceConfig: { voiceId: "alloy", language: "en" },
    });
}
main();`,python:`from your_company import CompanyClient

client = CompanyClient()

client.voice_agents.create(
    voice_config={"voice_id": "alloy", "language": "en"},
)`,curl:`curl -X POST https://api.company.com/v1/voice-agents \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "voice_config": { "voice_id": "alloy", "language": "en" }
  }'`,go:`package main

import (
    "context"
    co "github.com/your-company/voice-agents-go"
)

func main() {
    client := co.NewClient()
    client.VoiceAgents.Create(
        context.Background(),
        &co.CreateVoiceAgentRequest{
            VoiceConfig: &co.VoiceConfig{VoiceID: "alloy", Language: "en"},
        },
    )
}`,java:`import com.company.CompanyClient;
import com.company.voiceagents.CreateVoiceAgentRequest;
import com.company.voiceagents.VoiceConfig;

public class Main {
    public static void main(String[] args) {
        CompanyClient client = new CompanyClient();
        client.voiceAgents().create(
            CreateVoiceAgentRequest.builder()
                .voiceConfig(VoiceConfig.builder().voiceId("alloy").language("en").build())
                .build()
        );
    }
}`,csharp:`using Company;

var client = new CompanyClient();
await client.VoiceAgents.CreateAsync(new CreateVoiceAgentRequest
{
    VoiceConfig = new VoiceConfig { VoiceId = "alloy", Language = "en" },
});`,php:`<?php

use Company\\Client;

$client = new Client();
$client->voiceAgents->create([
    'voice_config' => ['voice_id' => 'alloy', 'language' => 'en'],
]);`,ruby:`require "company"

client = Company::Client.new
client.voice_agents.create(
  voice_config: { voice_id: "alloy", language: "en" }
)`,swift:`import Company

let client = CompanyClient()
try await client.voiceAgents.create(
    CreateVoiceAgentRequest(voiceConfig: VoiceConfig(voiceId: "alloy", language: "en"))
)`,rust:`use company::{Client, CreateVoiceAgentRequest, VoiceConfig};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    client.voice_agents().create(
        CreateVoiceAgentRequest {
            voice_config: VoiceConfig { voice_id: "alloy".into(), language: "en".into() },
            ..Default::default()
        }
    ).await?;
    Ok(())
}`}},"get-agent":{id:"get-agent",method:"GET",path:"/v1/agents/{agent_id}",breadcrumb:["API Reference","REST"],title:"Get Agent",description:"Retrieves the configuration and metadata for an existing agent by ID.",request:{description:"This endpoint expects a path parameter.",fields:[{name:"agent_id",type:"string",required:!0,description:"The unique identifier of the agent to retrieve."}]},response:{description:"Agent retrieved successfully",status:200,statusLabel:"Successful",fields:[{name:"agent_id",type:"string",description:"The agent identifier."},{name:"name",type:"string",description:"The display name of the agent."},{name:"conversation_config",type:"object",description:"Full conversation configuration."}],body:`{
  "agent_id": "J3Pbu5gP6NNKBscdCdwB",
  "name": "Support Bot",
  "conversation_config": { ... }
}`},samples:{typescript:`import { YourCompanyClient } from "@yourcompany/yourcompany-js";

const client = new YourCompanyClient();
const agent = await client.conversationalAi.agents.get(
    "J3Pbu5gP6NNKBscdCdwB"
);`,python:`from yourcompany import YourCompanyClient

client = YourCompanyClient()
agent = client.conversational_ai.agents.get(
    "J3Pbu5gP6NNKBscdCdwB"
)`,curl:`curl https://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB \\
  -H "Authorization: Bearer $API_KEY"`,go:`agent, _ := client.ConversationalAI.Agents.Get(
    context.Background(),
    "J3Pbu5gP6NNKBscdCdwB",
)`,java:`Agent agent = client.conversationalAi().agents().get(
    "J3Pbu5gP6NNKBscdCdwB"
);`,csharp:`var agent = await client.ConversationalAi.Agents.GetAsync(
    "J3Pbu5gP6NNKBscdCdwB"
);`,php:`<?php

$agent = $client->conversationalAi->agents->get(
    'J3Pbu5gP6NNKBscdCdwB'
);`,ruby:`agent = client.conversational_ai.agents.get(
  "J3Pbu5gP6NNKBscdCdwB"
)`,swift:`let agent = try await client.conversationalAi.agents.get(
    id: "J3Pbu5gP6NNKBscdCdwB"
)`,rust:`let agent = client.conversational_ai().agents().get(
    "J3Pbu5gP6NNKBscdCdwB"
).await?;`}},"list-agents":{id:"list-agents",method:"GET",path:"/v1/voice-agents",breadcrumb:["API Reference","REST"],title:"List Agents",description:"Returns a paginated list of voice agents in your workspace, ordered by creation time.",request:{description:"This endpoint accepts optional query parameters.",fields:[{name:"cursor",type:"string",required:!1,description:"Pagination cursor from a previous response."},{name:"page_size",type:"integer",required:!1,description:"Number of items per page. Default 20, max 100."}]},response:{description:"Voice agents listed successfully",status:200,statusLabel:"Successful",fields:[{name:"voice_agents",type:"list of objects",description:"The list of voice agents on this page."},{name:"next_cursor",type:"string or null",description:"Cursor to fetch the next page."}],body:`{
  "voice_agents": [
    { "agent_id": "J3Pbu5gP6NNKBscdCdwB", "name": "Support Line" },
    { "agent_id": "A7Xc9vN2mQ4kLpRtYeZ", "name": "Sales Outbound" }
  ],
  "next_cursor": null
}`},samples:{typescript:`const { voiceAgents } = await client.voiceAgents.list({
    pageSize: 20,
});`,python:`voice_agents = client.voice_agents.list(
    page_size=20,
)`,curl:`curl https://api.company.com/v1/voice-agents?page_size=20 \\
  -H "Authorization: Bearer $API_KEY"`,go:`resp, _ := client.VoiceAgents.List(
    context.Background(),
    &co.ListVoiceAgentsRequest{PageSize: co.Int(20)},
)`,java:`ListVoiceAgentsResponse resp = client.voiceAgents().list(
    ListVoiceAgentsRequest.builder().pageSize(20).build()
);`,csharp:`var resp = await client.VoiceAgents.ListAsync(
    new ListVoiceAgentsRequest { PageSize = 20 }
);`,php:`<?php

$resp = $client->voiceAgents->list([
    'page_size' => 20,
]);`,ruby:`resp = client.voice_agents.list(
  page_size: 20
)`,swift:`let resp = try await client.voiceAgents.list(
    pageSize: 20
)`,rust:`let resp = client.voice_agents().list(
    ListVoiceAgentsRequest { page_size: Some(20), ..Default::default() }
).await?;`}},"update-agent":{id:"update-agent",method:"PATCH",path:"/v1/agents/{agent_id}",breadcrumb:["API Reference","REST"],title:"Update Agent",description:"Partially updates an existing agent. Only fields supplied in the request body are modified.",request:{description:"This endpoint expects a path parameter and an object.",fields:[{name:"agent_id",type:"string",required:!0,description:"The unique identifier of the agent."},{name:"name",type:"string",required:!1,description:"A new display name for the agent."},{name:"conversation_config",type:"object",required:!1,description:"Replace the conversation configuration."},{name:"tags",type:"list of strings or null",required:!1,description:"Replace the tags list."}]},response:{description:"Agent updated successfully",status:200,statusLabel:"Successful",fields:[{name:"agent_id",type:"string",description:"The agent identifier."},{name:"updated_at",type:"string",description:"ISO-8601 timestamp of the update."}],body:`{
  "agent_id": "J3Pbu5gP6NNKBscdCdwB",
  "updated_at": "2026-10-14T17:42:03Z"
}`},samples:{typescript:`await client.conversationalAi.agents.update(
    "J3Pbu5gP6NNKBscdCdwB",
    { name: "Renamed Bot" }
);`,python:`client.conversational_ai.agents.update(
    "J3Pbu5gP6NNKBscdCdwB",
    name="Renamed Bot",
)`,curl:`curl -X PATCH https://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Renamed Bot" }'`,go:`client.ConversationalAI.Agents.Update(
    context.Background(),
    "J3Pbu5gP6NNKBscdCdwB",
    &yc.UpdateAgentRequest{Name: yc.String("Renamed Bot")},
)`,java:`client.conversationalAi().agents().update(
    "J3Pbu5gP6NNKBscdCdwB",
    UpdateAgentRequest.builder().name("Renamed Bot").build()
);`,csharp:`await client.ConversationalAi.Agents.UpdateAsync(
    "J3Pbu5gP6NNKBscdCdwB",
    new UpdateAgentRequest { Name = "Renamed Bot" }
);`,php:`<?php

$client->conversationalAi->agents->update(
    'J3Pbu5gP6NNKBscdCdwB',
    ['name' => 'Renamed Bot']
);`,ruby:`client.conversational_ai.agents.update(
  "J3Pbu5gP6NNKBscdCdwB",
  name: "Renamed Bot"
)`,swift:`try await client.conversationalAi.agents.update(
    id: "J3Pbu5gP6NNKBscdCdwB",
    request: UpdateAgentRequest(name: "Renamed Bot")
)`,rust:`client.conversational_ai().agents().update(
    "J3Pbu5gP6NNKBscdCdwB",
    UpdateAgentRequest { name: Some("Renamed Bot".into()), ..Default::default() }
).await?;`}},"delete-agent":{id:"delete-agent",method:"DEL",path:"/v1/agents/{agent_id}",breadcrumb:["API Reference","REST"],title:"Delete Agent",description:"Permanently deletes an agent. This action cannot be undone.",request:{description:"This endpoint expects a path parameter.",fields:[{name:"agent_id",type:"string",required:!0,description:"The unique identifier of the agent to delete."}]},response:{description:"Agent deleted successfully",status:200,statusLabel:"Successful",fields:[{name:"deleted",type:"boolean",description:"True when the agent was removed."}],body:`{
  "deleted": true
}`},samples:{typescript:`await client.conversationalAi.agents.delete(
    "J3Pbu5gP6NNKBscdCdwB"
);`,python:`client.conversational_ai.agents.delete(
    "J3Pbu5gP6NNKBscdCdwB"
)`,curl:`curl -X DELETE https://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB \\
  -H "Authorization: Bearer $API_KEY"`,go:`client.ConversationalAI.Agents.Delete(
    context.Background(),
    "J3Pbu5gP6NNKBscdCdwB",
)`,java:`client.conversationalAi().agents().delete(
    "J3Pbu5gP6NNKBscdCdwB"
);`,csharp:`await client.ConversationalAi.Agents.DeleteAsync(
    "J3Pbu5gP6NNKBscdCdwB"
);`,php:`<?php

$client->conversationalAi->agents->delete(
    'J3Pbu5gP6NNKBscdCdwB'
);`,ruby:`client.conversational_ai.agents.delete(
  "J3Pbu5gP6NNKBscdCdwB"
)`,swift:`try await client.conversationalAi.agents.delete(
    id: "J3Pbu5gP6NNKBscdCdwB"
)`,rust:`client.conversational_ai().agents().delete(
    "J3Pbu5gP6NNKBscdCdwB"
).await?;`}},"duplicate-agent":{id:"duplicate-agent",method:"POST",path:"/v1/agents/{agent_id}/duplicate",breadcrumb:["API Reference","REST"],title:"Duplicate Agent",description:"Creates a copy of an existing agent with a new ID. The copy retains all configuration but starts with a fresh history.",request:{description:"This endpoint expects a path parameter.",fields:[{name:"agent_id",type:"string",required:!0,description:"The agent to duplicate."},{name:"name",type:"string",required:!1,description:'Optional name for the duplicate. Defaults to "{original} (copy)".'}]},response:{description:"Agent duplicated successfully",status:200,statusLabel:"Successful",fields:[{name:"agent_id",type:"string",description:"ID of the newly created duplicate."}],body:`{
  "agent_id": "K9Qrv7jH2LMBscdCdwB"
}`},samples:{typescript:`const { agentId } = await client.conversationalAi.agents.duplicate(
    "J3Pbu5gP6NNKBscdCdwB"
);`,python:`result = client.conversational_ai.agents.duplicate(
    "J3Pbu5gP6NNKBscdCdwB"
)`,curl:`curl -X POST https://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/duplicate \\
  -H "Authorization: Bearer $API_KEY"`,go:`resp, _ := client.ConversationalAI.Agents.Duplicate(
    context.Background(),
    "J3Pbu5gP6NNKBscdCdwB",
)`,java:`DuplicateAgentResponse resp = client.conversationalAi().agents().duplicate(
    "J3Pbu5gP6NNKBscdCdwB"
);`,csharp:`var resp = await client.ConversationalAi.Agents.DuplicateAsync(
    "J3Pbu5gP6NNKBscdCdwB"
);`,php:`<?php

$resp = $client->conversationalAi->agents->duplicate(
    'J3Pbu5gP6NNKBscdCdwB'
);`,ruby:`resp = client.conversational_ai.agents.duplicate(
  "J3Pbu5gP6NNKBscdCdwB"
)`,swift:`let resp = try await client.conversationalAi.agents.duplicate(
    id: "J3Pbu5gP6NNKBscdCdwB"
)`,rust:`let resp = client.conversational_ai().agents().duplicate(
    "J3Pbu5gP6NNKBscdCdwB"
).await?;`}},"grpc-create-agent":{id:"grpc-create-agent",method:"RPC",path:"/agents.AgentService/CreateAgent",breadcrumb:["API Reference","gRPC"],title:"CreateAgent",description:"Unary RPC on the `agents.AgentService` service. Send a `CreateAgentRequest` message; the server returns the created `Agent` in a single response. Errors surface as gRPC status codes (e.g. `INVALID_ARGUMENT` 3, `RESOURCE_EXHAUSTED` 8).",request:{description:"Unary request. Send a single `CreateAgentRequest` message.",fields:[{name:"voice_config",type:"VoiceConfig",required:!0,description:"Voice ID, model, language, and prosody settings."},{name:"conversation_config",type:"ConversationConfig",required:!1,description:"Turn-taking, interruption handling, and silence thresholds."},{name:"name",type:"string",required:!1,description:"Optional display name for the agent."},{name:"tags",type:"repeated string",required:!1,description:"Tags to help classify and filter the agent."}]},response:{description:"Returns the created `Agent` message. Call terminates with status `OK` (0).",status:0,statusLabel:"OK",fields:[{name:"agent_id",type:"string",description:"ID assigned to the new agent."},{name:"name",type:"string",description:"Display name."},{name:"state",type:"AgentState",description:"Initial state — typically `READY`."}],body:`// Agent
{
  "agent_id": "J3Pbu5gP6NNKBscdCdwB",
  "name": "Support Bot",
  "state": "READY"
}`},samples:{typescript:`import { AgentServiceClient, CreateAgentRequest } from "@yourcompany/yourcompany-grpc";

const client = new AgentServiceClient();
const agent = await client.createAgent(
    CreateAgentRequest.create({
        voiceConfig: { voiceId: "alloy", language: "en" },
    })
);`,python:`from yourcompany.grpc import AgentServiceStub, CreateAgentRequest, VoiceConfig
import grpc

channel = grpc.secure_channel("api.yourcompany.com:443", grpc.ssl_channel_credentials())
stub = AgentServiceStub(channel)
agent = stub.CreateAgent(CreateAgentRequest(
    voice_config=VoiceConfig(voice_id="alloy", language="en"),
))`,curl:`grpcurl -d '{"voice_config":{"voice_id":"alloy","language":"en"}}' \\
  -H "authorization: Bearer $API_KEY" \\
  api.yourcompany.com:443 agents.AgentService/CreateAgent`,go:`import pb "github.com/yourcompany/yourcompany-grpc/agents"

agent, err := client.CreateAgent(ctx, &pb.CreateAgentRequest{
    VoiceConfig: &pb.VoiceConfig{VoiceId: "alloy", Language: "en"},
})`,java:`AgentServiceGrpc.AgentServiceBlockingStub stub = AgentServiceGrpc.newBlockingStub(channel);
Agent agent = stub.createAgent(
    CreateAgentRequest.newBuilder()
        .setVoiceConfig(VoiceConfig.newBuilder().setVoiceId("alloy").setLanguage("en"))
        .build()
);`,csharp:`var client = new AgentService.AgentServiceClient(channel);
var agent = await client.CreateAgentAsync(new CreateAgentRequest
{
    VoiceConfig = new VoiceConfig { VoiceId = "alloy", Language = "en" },
});`,php:`<?php

$client = new AgentServiceClient('api.yourcompany.com:443', [
    'credentials' => Grpc\\ChannelCredentials::createSsl(),
]);
$req = new CreateAgentRequest();
$req->setVoiceConfig((new VoiceConfig())->setVoiceId('alloy')->setLanguage('en'));
[$agent] = $client->CreateAgent($req)->wait();`,ruby:`stub = Agents::AgentService::Stub.new('api.yourcompany.com:443', creds)
agent = stub.create_agent(CreateAgentRequest.new(
  voice_config: VoiceConfig.new(voice_id: 'alloy', language: 'en')
))`,swift:`let client = AgentServiceAsyncClient(channel: channel)
let agent = try await client.createAgent(.with {
    $0.voiceConfig = .with { vc in
        vc.voiceID = "alloy"
        vc.language = "en"
    }
})`,rust:`use yourcompany_grpc::agents::{agent_service_client::AgentServiceClient, CreateAgentRequest, VoiceConfig};

let mut client = AgentServiceClient::connect("https://api.yourcompany.com").await?;
let agent = client.create_agent(CreateAgentRequest {
    voice_config: Some(VoiceConfig { voice_id: "alloy".into(), language: "en".into() }),
    ..Default::default()
}).await?;`}},"grpc-stream-conversation":{id:"grpc-stream-conversation",method:"RPC",path:"/agents.AgentService/StreamConversation",breadcrumb:["API Reference","gRPC"],title:"StreamConversation",description:"Bidirectional streaming RPC. Send a stream of `TurnRequest` messages — user text, audio chunks, or interrupts — and receive a stream of `TurnResponse` messages with partial replies, tool calls, and turn boundaries.",request:{description:"Client stream of `TurnRequest` messages. The first message must include `agent_id`; subsequent messages carry conversational input.",fields:[{name:"agent_id",type:"string",required:!0,description:"Required on the first message; ignored thereafter."},{name:"user_text",type:"string (oneof)",required:!1,description:"User turn as text."},{name:"audio_chunk",type:"bytes (oneof)",required:!1,description:"PCM audio frame at 16kHz mono."},{name:"interrupt",type:"bool",required:!1,description:"Cancels the in-flight agent turn."}]},response:{description:"Server stream of `TurnResponse` messages — each is one of `message_delta`, `audio_chunk`, `tool_call`, or `turn_end`. Stream closes with status `OK` (0) or a streaming error code.",status:0,statusLabel:"OK (stream)",fields:[{name:"message_delta",type:"string (oneof)",description:"Partial reply text streamed token-by-token."},{name:"audio_chunk",type:"bytes (oneof)",description:"Streamed TTS audio frame."},{name:"tool_call",type:"ToolCall (oneof)",description:"Tool invocation requested by the agent."},{name:"turn_end",type:"TurnEnd (oneof)",description:"Marks the end of an agent turn."}],body:`// TurnResponse stream
{ "message_delta": "Hello" }
{ "message_delta": ", how can I help?" }
{ "turn_end": { "reason": "complete" } }`},samples:{typescript:`import { AgentServiceClient } from "@yourcompany/yourcompany-grpc";

const client = new AgentServiceClient();
const stream = client.streamConversation();
stream.write({ agentId: "J3Pbu5gP6NNKBscdCdwB", userText: "Hello" });
for await (const msg of stream.responses) {
    if (msg.messageDelta) process.stdout.write(msg.messageDelta);
}`,python:`from yourcompany.grpc import AgentServiceStub, TurnRequest
import grpc, asyncio

async def main():
    async with grpc.aio.secure_channel("api.yourcompany.com:443", grpc.ssl_channel_credentials()) as ch:
        stub = AgentServiceStub(ch)
        async def turns():
            yield TurnRequest(agent_id="J3Pbu5gP6NNKBscdCdwB", user_text="Hello")
        async for msg in stub.StreamConversation(turns()):
            if msg.HasField("message_delta"):
                print(msg.message_delta, end="")

asyncio.run(main())`,curl:`grpcurl -d '{"agent_id":"J3Pbu5gP6NNKBscdCdwB","user_text":"Hello"}' \\
  -H "authorization: Bearer $API_KEY" \\
  api.yourcompany.com:443 agents.AgentService/StreamConversation`,go:`import pb "github.com/yourcompany/yourcompany-grpc/agents"

stream, _ := client.StreamConversation(ctx)
_ = stream.Send(&pb.TurnRequest{AgentId: "J3Pbu5gP6NNKBscdCdwB", UserText: "Hello"})
for {
    msg, err := stream.Recv()
    if err != nil { break }
    fmt.Print(msg.GetMessageDelta())
}`,java:`AgentServiceGrpc.AgentServiceStub stub = AgentServiceGrpc.newStub(channel);
StreamObserver<TurnRequest> requests = stub.streamConversation(new StreamObserver<TurnResponse>() {
    public void onNext(TurnResponse msg) { System.out.print(msg.getMessageDelta()); }
    public void onError(Throwable t) {}
    public void onCompleted() {}
});
requests.onNext(TurnRequest.newBuilder()
    .setAgentId("J3Pbu5gP6NNKBscdCdwB")
    .setUserText("Hello")
    .build());`,csharp:`var client = new AgentService.AgentServiceClient(channel);
using var call = client.StreamConversation();
await call.RequestStream.WriteAsync(new TurnRequest
{
    AgentId = "J3Pbu5gP6NNKBscdCdwB",
    UserText = "Hello",
});
await foreach (var msg in call.ResponseStream.ReadAllAsync())
{
    Console.Write(msg.MessageDelta);
}`,php:`<?php

$call = $client->StreamConversation();
$call->write((new TurnRequest())->setAgentId('J3Pbu5gP6NNKBscdCdwB')->setUserText('Hello'));
foreach ($call->responses() as $msg) {
    echo $msg->getMessageDelta();
}`,ruby:`stub = Agents::AgentService::Stub.new('api.yourcompany.com:443', creds)
requests = Enumerator.new do |y|
  y << TurnRequest.new(agent_id: 'J3Pbu5gP6NNKBscdCdwB', user_text: 'Hello')
end
stub.stream_conversation(requests).each do |msg|
  print msg.message_delta
end`,swift:`let client = AgentServiceAsyncClient(channel: channel)
let call = client.makeStreamConversationCall()
try await call.requestStream.send(.with {
    $0.agentID = "J3Pbu5gP6NNKBscdCdwB"
    $0.userText = "Hello"
})
for try await msg in call.responseStream {
    print(msg.messageDelta, terminator: "")
}`,rust:`use yourcompany_grpc::agents::{agent_service_client::AgentServiceClient, TurnRequest};
use tokio_stream::StreamExt;

let mut client = AgentServiceClient::connect("https://api.yourcompany.com").await?;
let outbound = async_stream::stream! {
    yield TurnRequest {
        agent_id: "J3Pbu5gP6NNKBscdCdwB".into(),
        user_text: Some("Hello".into()),
        ..Default::default()
    };
};
let mut stream = client.stream_conversation(outbound).await?.into_inner();
while let Some(msg) = stream.next().await {
    print!("{}", msg?.message_delta.unwrap_or_default());
}`}},"grpc-list-agents":{id:"grpc-list-agents",method:"RPC",path:"/agents.AgentService/ListAgents",breadcrumb:["API Reference","gRPC"],title:"ListAgents",description:"Server-streaming RPC. Send a single `ListAgentsRequest`; the server replies with a stream of `Agent` messages ordered by creation time, terminated by status `OK`.",request:{description:"Unary `ListAgentsRequest`. Response is a stream of `Agent` messages.",fields:[{name:"page_size",type:"int32",required:!1,description:"Max agents per server-side batch. Default 20."},{name:"cursor",type:"string",required:!1,description:"Resume token from a previous stream."}]},response:{description:"Server stream of `Agent` messages. The stream ends with gRPC status `OK` (0).",status:0,statusLabel:"OK (stream)",fields:[{name:"agent_id",type:"string",description:"Unique identifier."},{name:"name",type:"string",description:"Display name."},{name:"created_at",type:"google.protobuf.Timestamp",description:"Creation time."}],body:`// Agent stream
{ "agent_id": "J3Pbu5gP6NNKBscdCdwB", "name": "Support Line" }
{ "agent_id": "A7Xc9vN2mQ4kLpRtYeZ", "name": "Sales Outbound" }`},samples:{typescript:`import { AgentServiceClient } from "@yourcompany/yourcompany-grpc";

const client = new AgentServiceClient();
for await (const agent of client.listAgents({ pageSize: 20 })) {
    console.log(agent.agentId, agent.name);
}`,python:`from yourcompany.grpc import AgentServiceStub, ListAgentsRequest
import grpc

channel = grpc.secure_channel("api.yourcompany.com:443", grpc.ssl_channel_credentials())
stub = AgentServiceStub(channel)
for agent in stub.ListAgents(ListAgentsRequest(page_size=20)):
    print(agent.agent_id, agent.name)`,curl:`grpcurl -d '{"page_size":20}' \\
  -H "authorization: Bearer $API_KEY" \\
  api.yourcompany.com:443 agents.AgentService/ListAgents`,go:`import pb "github.com/yourcompany/yourcompany-grpc/agents"

stream, _ := client.ListAgents(ctx, &pb.ListAgentsRequest{PageSize: 20})
for {
    agent, err := stream.Recv()
    if err != nil { break }
    fmt.Println(agent.AgentId, agent.Name)
}`,java:`AgentServiceGrpc.AgentServiceBlockingStub stub = AgentServiceGrpc.newBlockingStub(channel);
stub.listAgents(ListAgentsRequest.newBuilder().setPageSize(20).build())
    .forEachRemaining(agent -> System.out.println(agent.getAgentId()));`,csharp:`var client = new AgentService.AgentServiceClient(channel);
using var call = client.ListAgents(new ListAgentsRequest { PageSize = 20 });
await foreach (var agent in call.ResponseStream.ReadAllAsync())
{
    Console.WriteLine($"{agent.AgentId} {agent.Name}");
}`,php:`<?php

$call = $client->ListAgents((new ListAgentsRequest())->setPageSize(20));
foreach ($call->responses() as $agent) {
    echo $agent->getAgentId(), "\\n";
}`,ruby:`stub = Agents::AgentService::Stub.new('api.yourcompany.com:443', creds)
stub.list_agents(ListAgentsRequest.new(page_size: 20)).each do |agent|
  puts "#{agent.agent_id} #{agent.name}"
end`,swift:`let client = AgentServiceAsyncClient(channel: channel)
for try await agent in client.listAgents(.with { $0.pageSize = 20 }) {
    print(agent.agentID, agent.name)
}`,rust:`use yourcompany_grpc::agents::{agent_service_client::AgentServiceClient, ListAgentsRequest};
use tokio_stream::StreamExt;

let mut client = AgentServiceClient::connect("https://api.yourcompany.com").await?;
let mut stream = client.list_agents(ListAgentsRequest { page_size: 20, ..Default::default() }).await?.into_inner();
while let Some(agent) = stream.next().await {
    let a = agent?;
    println!("{} {}", a.agent_id, a.name);
}`}},"ws-conversation":{id:"ws-conversation",method:"WS",path:"wss://api.yourcompany.com/v1/agents/{agent_id}/conversation",breadcrumb:["API Reference","WebSockets"],title:"Live Conversation",description:"Full-duplex WebSocket for live, low-latency conversation. After the HTTP upgrade, exchange JSON frames carrying user input and streamed agent replies. The server pings every 30s; respond with a pong or the socket closes.",request:{description:"Client frames sent over the open socket. Authenticate via the `Authorization` header on the upgrade request.",fields:[{name:"type",type:"string",required:!0,description:'Frame type — one of "user_message", "audio_chunk", "interrupt", or "control".'},{name:"text",type:"string",required:!1,description:'User turn text. Present when type is "user_message".'},{name:"audio",type:"base64 string",required:!1,description:'PCM frame at 16kHz mono. Present when type is "audio_chunk".'}]},response:{description:"Server frames pushed to the client until the socket closes. Close codes: 1000 (normal), 4001 (auth failed), 4008 (idle), 4029 (rate-limited).",status:101,statusLabel:"Switching Protocols",fields:[{name:"type",type:"string",description:'"agent_message", "audio_chunk", "turn_end", or "error".'},{name:"delta",type:"string",description:"Partial reply text streamed token-by-token."},{name:"audio",type:"base64 string",description:"Streamed TTS audio frame."}],body:`{ "type": "agent_message", "delta": "Hello, how can " }
{ "type": "agent_message", "delta": "I help you today?" }
{ "type": "turn_end", "reason": "complete" }`},samples:{typescript:`const socket = new WebSocket(
    "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation",
    ["Bearer", apiKey],
);
socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "user_message", text: "Hello" }));
});
socket.addEventListener("message", (e) => {
    const frame = JSON.parse(e.data);
    if (frame.type === "agent_message") process.stdout.write(frame.delta);
});`,python:`import websockets, json, asyncio

async def main():
    url = "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation"
    async with websockets.connect(url, extra_headers={"Authorization": f"Bearer {api_key}"}) as ws:
        await ws.send(json.dumps({"type": "user_message", "text": "Hello"}))
        async for raw in ws:
            frame = json.loads(raw)
            if frame["type"] == "agent_message":
                print(frame["delta"], end="")

asyncio.run(main())`,curl:`wscat -c "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation" \\
  -H "Authorization: Bearer $API_KEY" \\
  -x '{"type":"user_message","text":"Hello"}'`,go:`import "github.com/coder/websocket"

c, _, _ := websocket.Dial(ctx, "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation", &websocket.DialOptions{
    HTTPHeader: http.Header{"Authorization": {"Bearer " + apiKey}},
})
defer c.CloseNow()
c.Write(ctx, websocket.MessageText, []byte(\`{"type":"user_message","text":"Hello"}\`))`,java:`WebSocket ws = HttpClient.newHttpClient()
    .newWebSocketBuilder()
    .header("Authorization", "Bearer " + apiKey)
    .buildAsync(URI.create("wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation"), listener)
    .join();
ws.sendText("{\\"type\\":\\"user_message\\",\\"text\\":\\"Hello\\"}", true);`,csharp:`using var ws = new ClientWebSocket();
ws.Options.SetRequestHeader("Authorization", $"Bearer {apiKey}");
await ws.ConnectAsync(new Uri("wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation"), CancellationToken.None);
var frame = Encoding.UTF8.GetBytes("{\\"type\\":\\"user_message\\",\\"text\\":\\"Hello\\"}");
await ws.SendAsync(frame, WebSocketMessageType.Text, true, CancellationToken.None);`,php:`<?php

$conn = new WebSocket\\Client(
    'wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation',
    ['headers' => ['Authorization' => "Bearer $apiKey"]],
);
$conn->send(json_encode(['type' => 'user_message', 'text' => 'Hello']));
while ($msg = $conn->receive()) { echo $msg; }`,ruby:`require "faye/websocket"

ws = Faye::WebSocket::Client.new(
  "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation",
  nil,
  headers: { "Authorization" => "Bearer #{api_key}" }
)
ws.on(:open)    { ws.send({ type: "user_message", text: "Hello" }.to_json) }
ws.on(:message) { |e| puts e.data }`,swift:`let task = URLSession.shared.webSocketTask(
    with: URL(string: "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation")!
)
task.resume()
try await task.send(.string(#"{"type":"user_message","text":"Hello"}"#))`,rust:`use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::SinkExt;

let (mut ws, _) = connect_async("wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/conversation").await?;
ws.send(Message::Text(r#"{"type":"user_message","text":"Hello"}"#.into())).await?;`}},"ws-agent-events":{id:"ws-agent-events",method:"WS",path:"wss://api.yourcompany.com/v1/agents/{agent_id}/events",breadcrumb:["API Reference","WebSockets"],title:"Agent Events",description:"Read-only WebSocket that pushes lifecycle events for an agent — run starts, completions, tool invocations, and errors. After the upgrade, no client frames are required; optionally send a single `subscribe` frame to filter the stream.",request:{description:"No client payload required after connect. Optionally send one `subscribe` frame to narrow the event set.",fields:[{name:"type",type:'string ("subscribe")',required:!1,description:"Filter frame sent once after connect."},{name:"events",type:"list of strings",required:!1,description:'Restrict the stream — e.g. ["run.completed", "run.failed"].'}]},response:{description:"Server-pushed lifecycle events. The stream stays open until the agent is deleted or the client disconnects.",status:101,statusLabel:"Switching Protocols",fields:[{name:"event",type:"string",description:'"run.started", "run.completed", "run.failed", or "tool.invoked".'},{name:"run_id",type:"string",description:"Run the event relates to, when applicable."},{name:"occurred_at",type:"string",description:"ISO-8601 timestamp."},{name:"data",type:"object",description:"Event-specific payload."}],body:`{ "event": "run.started", "run_id": "run_8f2K9", "occurred_at": "2026-10-14T17:42:03Z" }
{ "event": "tool.invoked", "run_id": "run_8f2K9", "data": { "tool": "search" } }
{ "event": "run.completed", "run_id": "run_8f2K9", "data": { "duration_ms": 1840 } }`},samples:{typescript:`const socket = new WebSocket(
    "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events",
    ["Bearer", apiKey],
);
socket.addEventListener("message", (e) => {
    const event = JSON.parse(e.data);
    console.log(event.event, event.run_id);
});`,python:`import websockets, json, asyncio

async def main():
    url = "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events"
    async with websockets.connect(url, extra_headers={"Authorization": f"Bearer {api_key}"}) as ws:
        async for raw in ws:
            event = json.loads(raw)
            print(event["event"], event.get("run_id"))

asyncio.run(main())`,curl:`wscat -c "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events" \\
  -H "Authorization: Bearer $API_KEY"`,go:`import "github.com/coder/websocket"

c, _, _ := websocket.Dial(ctx, "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events", &websocket.DialOptions{
    HTTPHeader: http.Header{"Authorization": {"Bearer " + apiKey}},
})
defer c.CloseNow()
for {
    _, data, err := c.Read(ctx)
    if err != nil { break }
    fmt.Println(string(data))
}`,java:`WebSocket ws = HttpClient.newHttpClient()
    .newWebSocketBuilder()
    .header("Authorization", "Bearer " + apiKey)
    .buildAsync(URI.create("wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events"), listener)
    .join();`,csharp:`using var ws = new ClientWebSocket();
ws.Options.SetRequestHeader("Authorization", $"Bearer {apiKey}");
await ws.ConnectAsync(new Uri("wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events"), CancellationToken.None);
var buf = new byte[4096];
while (ws.State == WebSocketState.Open)
{
    var r = await ws.ReceiveAsync(buf, CancellationToken.None);
    Console.WriteLine(Encoding.UTF8.GetString(buf, 0, r.Count));
}`,php:`<?php

$conn = new WebSocket\\Client(
    'wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events',
    ['headers' => ['Authorization' => "Bearer $apiKey"]],
);
while ($msg = $conn->receive()) { echo $msg, "\\n"; }`,ruby:`require "faye/websocket"

ws = Faye::WebSocket::Client.new(
  "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events",
  nil,
  headers: { "Authorization" => "Bearer #{api_key}" }
)
ws.on(:message) { |e| puts e.data }`,swift:`let task = URLSession.shared.webSocketTask(
    with: URL(string: "wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events")!
)
task.resume()
while case .string(let frame) = try await task.receive() {
    print(frame)
}`,rust:`use tokio_tungstenite::connect_async;
use futures_util::StreamExt;

let (mut ws, _) = connect_async("wss://api.yourcompany.com/v1/agents/J3Pbu5gP6NNKBscdCdwB/events").await?;
while let Some(Ok(msg)) = ws.next().await {
    println!("{}", msg);
}`}},"sse-stream-run":{id:"sse-stream-run",method:"SSE",path:"/v1/runs/{run_id}/stream",breadcrumb:["API Reference","Server-Sent Events"],title:"Stream Run",description:"Streams a run's lifecycle as Server-Sent Events — message deltas, tool calls, tool results, and a final `done` event. Supports resume via `Last-Event-ID` after a disconnect.",request:{description:"GET request that upgrades to `text/event-stream`. Pass `Last-Event-ID` to resume from the last received event id.",fields:[{name:"run_id",type:"string",required:!0,description:"Identifier of the run to stream."},{name:"Last-Event-ID",type:"string (header)",required:!1,description:"Resume after this event id. Server replays missed events."}]},response:{description:"Stream of named events terminated by a single `done` event. Each event has an `id`, an `event` name, and a JSON `data` payload.",status:200,statusLabel:"OK (text/event-stream)",fields:[{name:"event",type:"string",description:'"message.delta", "tool.call", "tool.result", "done", or "error".'},{name:"id",type:"string",description:"Monotonic event id, usable with `Last-Event-ID` on reconnect."},{name:"data",type:"object",description:"JSON payload for the event."}],body:`event: message.delta
id: 1
data: {"delta":"Hello"}

event: tool.call
id: 2
data: {"name":"search","args":{"q":"weather"}}

event: tool.result
id: 3
data: {"result":"sunny, 72\\u00b0F"}

event: done
id: 4
data: {"ok":true}`},samples:{typescript:`const stream = await client.runs.stream("run_8f2K9");
for await (const event of stream) {
    if (event.event === "message.delta") process.stdout.write(event.data.delta);
    if (event.event === "tool.call") console.log("tool:", event.data.name);
}`,python:`with client.runs.stream("run_8f2K9") as stream:
    for event in stream:
        if event.event == "message.delta":
            print(event.data["delta"], end="")
        elif event.event == "tool.call":
            print("tool:", event.data["name"])`,curl:`curl -N https://api.yourcompany.com/v1/runs/run_8f2K9/stream \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Accept: text/event-stream" \\
  -H "Last-Event-ID: 0"`,go:`stream, _ := client.Runs.Stream(ctx, "run_8f2K9")
for event := range stream.Events() {
    switch event.Type {
    case "message.delta":
        fmt.Print(event.Data.Delta)
    case "tool.call":
        fmt.Println("tool:", event.Data.Name)
    }
}`,java:`try (var stream = client.runs().stream("run_8f2K9")) {
    stream.forEach(event -> {
        if ("message.delta".equals(event.event())) {
            System.out.print(event.data().get("delta"));
        }
    });
}`,csharp:`await foreach (var evt in client.Runs.StreamAsync("run_8f2K9"))
{
    if (evt.Event == "message.delta")
    {
        Console.Write(evt.Data.GetProperty("delta").GetString());
    }
}`,php:`<?php

$stream = $client->runs->stream('run_8f2K9');
foreach ($stream as $event) {
    if ($event->event === 'message.delta') {
        echo $event->data['delta'];
    }
}`,ruby:`client.runs.stream("run_8f2K9") do |event|
  print event.data["delta"] if event.event == "message.delta"
end`,swift:`for try await event in client.runs.stream(id: "run_8f2K9") {
    if event.event == "message.delta" {
        print(event.data.delta, terminator: "")
    }
}`,rust:`use futures_util::StreamExt;

let mut stream = client.runs().stream("run_8f2K9").await?;
while let Some(event) = stream.next().await {
    let event = event?;
    if event.event == "message.delta" {
        print!("{}", event.data["delta"].as_str().unwrap_or(""));
    }
}`}},"sse-stream-tokens":{id:"sse-stream-tokens",method:"SSE",path:"/v1/runs/{run_id}/tokens",breadcrumb:["API Reference","Server-Sent Events"],title:"Stream Tokens",description:"Token-by-token output for a run, delivered as Server-Sent Events. Lower-latency than `Stream Run` — emits one event per token with no tool or lifecycle events.",request:{description:"GET request that upgrades to `text/event-stream`. Resume with `Last-Event-ID` is not supported — tokens cannot be replayed.",fields:[{name:"run_id",type:"string",required:!0,description:"Identifier of the run to stream."}]},response:{description:"Stream of `token` events terminated by a single `done` event.",status:200,statusLabel:"OK (text/event-stream)",fields:[{name:"event",type:"string",description:'"token" or "done".'},{name:"id",type:"string",description:"Monotonic token index."},{name:"data",type:"object",description:'`{ "text": string }` for `token` events; `{ "ok": boolean }` for `done`.'}],body:`event: token
id: 1
data: {"text":"Hel"}

event: token
id: 2
data: {"text":"lo"}

event: token
id: 3
data: {"text":", world"}

event: done
id: 4
data: {"ok":true}`},samples:{typescript:`const stream = await client.runs.streamTokens("run_8f2K9");
for await (const event of stream) {
    if (event.event === "token") process.stdout.write(event.data.text);
}`,python:`with client.runs.stream_tokens("run_8f2K9") as stream:
    for event in stream:
        if event.event == "token":
            print(event.data["text"], end="", flush=True)`,curl:`curl -N https://api.yourcompany.com/v1/runs/run_8f2K9/tokens \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Accept: text/event-stream"`,go:`stream, _ := client.Runs.StreamTokens(ctx, "run_8f2K9")
for event := range stream.Events() {
    if event.Type == "token" {
        fmt.Print(event.Data.Text)
    }
}`,java:`try (var stream = client.runs().streamTokens("run_8f2K9")) {
    stream.forEach(event -> {
        if ("token".equals(event.event())) {
            System.out.print(event.data().get("text"));
        }
    });
}`,csharp:`await foreach (var evt in client.Runs.StreamTokensAsync("run_8f2K9"))
{
    if (evt.Event == "token")
    {
        Console.Write(evt.Data.GetProperty("text").GetString());
    }
}`,php:`<?php

foreach ($client->runs->streamTokens('run_8f2K9') as $event) {
    if ($event->event === 'token') {
        echo $event->data['text'];
    }
}`,ruby:`client.runs.stream_tokens("run_8f2K9") do |event|
  print event.data["text"] if event.event == "token"
end`,swift:`for try await event in client.runs.streamTokens(id: "run_8f2K9") {
    if event.event == "token" {
        print(event.data.text, terminator: "")
    }
}`,rust:`use futures_util::StreamExt;

let mut stream = client.runs().stream_tokens("run_8f2K9").await?;
while let Some(event) = stream.next().await {
    let event = event?;
    if event.event == "token" {
        print!("{}", event.data["text"].as_str().unwrap_or(""));
    }
}`}},"async-agent-created":{id:"async-agent-created",method:"PUB",path:"agents.agent.created",breadcrumb:["API Reference","AsyncAPI"],title:"agent.created",description:"Published by the platform every time a new agent is created. Default broker binding is NATS (subject `agents.agent.created`); the same message also publishes to the Kafka topic `agents.events` with header `event-type=agent.created`.",request:{description:"Channel `agents.agent.created` — operation `publish`. The platform produces this message; clients consume it via their configured broker binding.",fields:[{name:"event_id",type:"string (header)",required:!1,description:"Unique id assigned by the broker. Useful for de-duplication on consumer side."},{name:"content-type",type:"string (header)",required:!1,description:'"application/json"'},{name:"trace_id",type:"string (header)",required:!1,description:"Distributed trace correlation id."}]},response:{description:"JSON message payload delivered on the channel.",status:0,statusLabel:"Delivered",fields:[{name:"agent_id",type:"string",description:"ID of the newly created agent."},{name:"name",type:"string",description:"Display name at creation time."},{name:"config",type:"object",description:"Snapshot of the initial config."},{name:"created_at",type:"string",description:"ISO-8601 timestamp."}],body:`{
  "agent_id": "J3Pbu5gP6NNKBscdCdwB",
  "name": "Support Bot",
  "config": { "voice_id": "alloy", "language": "en" },
  "created_at": "2026-10-14T17:42:03Z"
}`},samples:{typescript:`// NATS binding
import { connect, StringCodec } from "nats";

const nc = await connect({ servers: "nats.yourcompany.com", token: apiKey });
const sc = StringCodec();
const sub = nc.subscribe("agents.agent.created");
for await (const m of sub) {
    console.log(JSON.parse(sc.decode(m.data)));
}`,python:`# NATS binding
import asyncio, json, nats

async def main():
    nc = await nats.connect("nats://nats.yourcompany.com:4222", token=api_key)
    sub = await nc.subscribe("agents.agent.created")
    async for msg in sub.messages:
        print(json.loads(msg.data))

asyncio.run(main())`,curl:`# NATS binding (nats CLI)
nats sub "agents.agent.created" --server nats.yourcompany.com

# Kafka binding
kcat -b kafka.yourcompany.com:9092 -t agents.events -C \\
  -X "auto.offset.reset=latest"`,go:`// NATS binding
import "github.com/nats-io/nats.go"

nc, _ := nats.Connect("nats.yourcompany.com", nats.Token(apiKey))
nc.Subscribe("agents.agent.created", func(m *nats.Msg) {
    fmt.Println(string(m.Data))
})`,java:`// Kafka binding
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(List.of("agents.events"));
for (var record : consumer.poll(Duration.ofSeconds(1))) {
    var hdr = record.headers().lastHeader("event-type");
    if (hdr != null && "agent.created".equals(new String(hdr.value()))) {
        System.out.println(record.value());
    }
}`,csharp:`// NATS binding
var opts = ConnectionFactory.GetDefaultOptions();
opts.Url = "nats.yourcompany.com";
opts.Token = apiKey;
using var nc = new ConnectionFactory().CreateConnection(opts);
nc.SubscribeAsync("agents.agent.created", (_, e) => {
    Console.WriteLine(Encoding.UTF8.GetString(e.Message.Data));
});`,php:`<?php

// NATS binding
$client = new Basis\\Nats\\Client(['host' => 'nats.yourcompany.com']);
$client->subscribe('agents.agent.created', function ($msg) {
    var_dump(json_decode($msg, true));
});`,ruby:`# NATS binding
require "nats/client"

NATS.start(servers: ["nats://nats.yourcompany.com:4222"], token: api_key) do |nc|
  nc.subscribe("agents.agent.created") { |msg| puts msg }
end`,swift:`// NATS binding (swift-nats)
let client = NatsClientOptions().url("nats://nats.yourcompany.com:4222").token(apiKey).build()
try await client.connect()
let sub = try await client.subscribe(subject: "agents.agent.created")
for await msg in sub {
    print(String(data: msg.payload, encoding: .utf8) ?? "")
}`,rust:`// NATS binding
use async_nats;
use futures::StreamExt;

let client = async_nats::ConnectOptions::new().token(api_key.into())
    .connect("nats.yourcompany.com").await?;
let mut sub = client.subscribe("agents.agent.created").await?;
while let Some(msg) = sub.next().await {
    println!("{}", std::str::from_utf8(&msg.payload)?);
}`}},"async-run-completed":{id:"async-run-completed",method:"SUB",path:"runs.run.completed",breadcrumb:["API Reference","AsyncAPI"],title:"run.completed",description:"Emitted every time a run finishes — success or failure — with timing metadata. Subscribers consume from NATS subject `runs.run.completed` or Kafka topic `runs.events` (filtered by header `event-type=run.completed`).",request:{description:"Channel `runs.run.completed` — operation `subscribe`. No client payload; connect to your configured broker binding and consume.",fields:[{name:"event_id",type:"string (header)",required:!1,description:"Unique broker-assigned message id."},{name:"content-type",type:"string (header)",required:!1,description:'"application/json"'},{name:"trace_id",type:"string (header)",required:!1,description:"Distributed trace correlation id, matches the originating run."}]},response:{description:"JSON message payload delivered when a run completes.",status:0,statusLabel:"Delivered",fields:[{name:"run_id",type:"string",description:"ID of the run."},{name:"agent_id",type:"string",description:"ID of the agent that produced the run."},{name:"status",type:"string",description:'"succeeded", "failed", or "cancelled".'},{name:"duration_ms",type:"integer",description:"Wall-clock duration of the run."},{name:"completed_at",type:"string",description:"ISO-8601 timestamp."}],body:`{
  "run_id": "run_8f2K9",
  "agent_id": "J3Pbu5gP6NNKBscdCdwB",
  "status": "succeeded",
  "duration_ms": 1840,
  "completed_at": "2026-10-14T17:42:03Z"
}`},samples:{typescript:`// NATS binding
import { connect, StringCodec } from "nats";

const nc = await connect({ servers: "nats.yourcompany.com", token: apiKey });
const sc = StringCodec();
const sub = nc.subscribe("runs.run.completed");
for await (const m of sub) {
    const evt = JSON.parse(sc.decode(m.data));
    console.log(evt.run_id, evt.status, evt.duration_ms);
}`,python:`# NATS binding
import asyncio, json, nats

async def main():
    nc = await nats.connect("nats://nats.yourcompany.com:4222", token=api_key)
    sub = await nc.subscribe("runs.run.completed")
    async for msg in sub.messages:
        evt = json.loads(msg.data)
        print(evt["run_id"], evt["status"], evt["duration_ms"])

asyncio.run(main())`,curl:`# NATS binding
nats sub "runs.run.completed" --server nats.yourcompany.com

# Kafka binding (filter by header in your consumer)
kcat -b kafka.yourcompany.com:9092 -t runs.events -C`,go:`// NATS binding
import "github.com/nats-io/nats.go"

nc, _ := nats.Connect("nats.yourcompany.com", nats.Token(apiKey))
nc.Subscribe("runs.run.completed", func(m *nats.Msg) {
    fmt.Println(string(m.Data))
})`,java:`// Kafka binding
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(List.of("runs.events"));
while (true) {
    for (var rec : consumer.poll(Duration.ofSeconds(1))) {
        var hdr = rec.headers().lastHeader("event-type");
        if (hdr != null && "run.completed".equals(new String(hdr.value()))) {
            System.out.println(rec.value());
        }
    }
}`,csharp:`// NATS binding
using var nc = new ConnectionFactory().CreateConnection(opts);
nc.SubscribeAsync("runs.run.completed", (_, e) => {
    var evt = JsonSerializer.Deserialize<RunCompleted>(e.Message.Data);
    Console.WriteLine($"{evt.RunId} {evt.Status}");
});`,php:`<?php

$client = new Basis\\Nats\\Client(['host' => 'nats.yourcompany.com']);
$client->subscribe('runs.run.completed', function ($msg) {
    $evt = json_decode($msg, true);
    echo "{$evt['run_id']} {$evt['status']}\\n";
});`,ruby:`# NATS binding
require "nats/client"

NATS.start(servers: ["nats://nats.yourcompany.com:4222"], token: api_key) do |nc|
  nc.subscribe("runs.run.completed") do |msg|
    evt = JSON.parse(msg)
    puts "#{evt['run_id']} #{evt['status']}"
  end
end`,swift:`// NATS binding
let client = NatsClientOptions().url("nats://nats.yourcompany.com:4222").token(apiKey).build()
try await client.connect()
let sub = try await client.subscribe(subject: "runs.run.completed")
for await msg in sub {
    print(String(data: msg.payload, encoding: .utf8) ?? "")
}`,rust:`// NATS binding
use async_nats;
use futures::StreamExt;

let client = async_nats::ConnectOptions::new().token(api_key.into())
    .connect("nats.yourcompany.com").await?;
let mut sub = client.subscribe("runs.run.completed").await?;
while let Some(msg) = sub.next().await {
    println!("{}", std::str::from_utf8(&msg.payload)?);
}`}},"async-tool-invoked":{id:"async-tool-invoked",method:"SUB",path:"tools.tool.invoked",breadcrumb:["API Reference","AsyncAPI"],title:"tool.invoked",description:"Emitted when an agent invokes a registered tool. Subscribers receive the tool name, arguments, and parent run id over NATS subject `tools.tool.invoked` or Kafka topic `tools.events`.",request:{description:"Channel `tools.tool.invoked` — operation `subscribe`. No client payload; connect to your configured broker binding and consume.",fields:[{name:"event_id",type:"string (header)",required:!1,description:"Unique broker-assigned message id."},{name:"content-type",type:"string (header)",required:!1,description:'"application/json"'},{name:"trace_id",type:"string (header)",required:!1,description:"Distributed trace correlation id."}]},response:{description:"JSON message payload delivered each time a tool is invoked.",status:0,statusLabel:"Delivered",fields:[{name:"run_id",type:"string",description:"Parent run that invoked the tool."},{name:"agent_id",type:"string",description:"Agent that produced the run."},{name:"tool",type:"string",description:"Registered tool name."},{name:"arguments",type:"object",description:"Arguments passed to the tool."},{name:"invoked_at",type:"string",description:"ISO-8601 timestamp."}],body:`{
  "run_id": "run_8f2K9",
  "agent_id": "J3Pbu5gP6NNKBscdCdwB",
  "tool": "search",
  "arguments": { "q": "today's weather in Brooklyn" },
  "invoked_at": "2026-10-14T17:42:02Z"
}`},samples:{typescript:`// NATS binding
import { connect, StringCodec } from "nats";

const nc = await connect({ servers: "nats.yourcompany.com", token: apiKey });
const sc = StringCodec();
for await (const m of nc.subscribe("tools.tool.invoked")) {
    const evt = JSON.parse(sc.decode(m.data));
    console.log(evt.tool, evt.arguments);
}`,python:`# NATS binding
import asyncio, json, nats

async def main():
    nc = await nats.connect("nats://nats.yourcompany.com:4222", token=api_key)
    sub = await nc.subscribe("tools.tool.invoked")
    async for msg in sub.messages:
        evt = json.loads(msg.data)
        print(evt["tool"], evt["arguments"])

asyncio.run(main())`,curl:`# NATS binding
nats sub "tools.tool.invoked" --server nats.yourcompany.com`,go:`// NATS binding
nc, _ := nats.Connect("nats.yourcompany.com", nats.Token(apiKey))
nc.Subscribe("tools.tool.invoked", func(m *nats.Msg) {
    fmt.Println(string(m.Data))
})`,java:`// Kafka binding (header-filtered)
consumer.subscribe(List.of("tools.events"));
for (var rec : consumer.poll(Duration.ofSeconds(1))) {
    System.out.println(rec.value());
}`,csharp:`// NATS binding
nc.SubscribeAsync("tools.tool.invoked", (_, e) => {
    Console.WriteLine(Encoding.UTF8.GetString(e.Message.Data));
});`,php:`<?php

$client = new Basis\\Nats\\Client(['host' => 'nats.yourcompany.com']);
$client->subscribe('tools.tool.invoked', function ($msg) {
    var_dump(json_decode($msg, true));
});`,ruby:`# NATS binding
NATS.start(servers: ["nats://nats.yourcompany.com:4222"], token: api_key) do |nc|
  nc.subscribe("tools.tool.invoked") { |msg| puts msg }
end`,swift:`// NATS binding
let sub = try await client.subscribe(subject: "tools.tool.invoked")
for await msg in sub {
    print(String(data: msg.payload, encoding: .utf8) ?? "")
}`,rust:`// NATS binding
let mut sub = client.subscribe("tools.tool.invoked").await?;
while let Some(msg) = sub.next().await {
    println!("{}", std::str::from_utf8(&msg.payload)?);
}`}},"gql-get-agent":{id:"gql-get-agent",method:"QRY",path:"/graphql",breadcrumb:["API Reference","GraphQL"],title:"agent",description:"Returns the configuration and metadata for a single agent. Schema: `agent(id: ID!): Agent`.",request:{description:"Arguments for the `agent` query. POST a GraphQL document to `/graphql` with the variables payload.",fields:[{name:"id",type:"ID!",required:!0,description:"Unique identifier of the agent to fetch."}]},response:{description:"Returns the requested `Agent` selection under `data.agent`, or `null` if no agent exists for the given id.",status:200,statusLabel:"Successful",fields:[{name:"data.agent.id",type:"ID",description:"Unique identifier."},{name:"data.agent.name",type:"String",description:"Display name."},{name:"data.agent.conversationConfig",type:"ConversationConfig",description:"Full conversation configuration."},{name:"errors",type:"[GraphQLError!]",description:"GraphQL errors, if any."}],body:`{
  "data": {
    "agent": {
      "id": "J3Pbu5gP6NNKBscdCdwB",
      "name": "Support Bot",
      "conversationConfig": { "turnTimeoutMs": 800 }
    }
  }
}`},samples:{typescript:`const document = \`
  query GetAgent($id: ID!) {
    agent(id: $id) {
      id
      name
      conversationConfig { turnTimeoutMs }
    }
  }
\`;
const res = await client.graphql.request({
    query: document,
    variables: { id: "J3Pbu5gP6NNKBscdCdwB" },
});`,python:`document = """
query GetAgent($id: ID!) {
  agent(id: $id) {
    id
    name
    conversationConfig { turnTimeoutMs }
  }
}
"""
res = client.graphql.execute(
    document,
    variables={"id": "J3Pbu5gP6NNKBscdCdwB"},
)`,curl:`curl -X POST https://api.yourcompany.com/graphql \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query GetAgent($id: ID!) { agent(id: $id) { id name conversationConfig { turnTimeoutMs } } }",
    "variables": { "id": "J3Pbu5gP6NNKBscdCdwB" }
  }'`,go:`res, _ := client.GraphQL.Execute(ctx, &yc.GraphQLRequest{
    Query: \`query GetAgent($id: ID!) {
        agent(id: $id) { id name conversationConfig { turnTimeoutMs } }
    }\`,
    Variables: map[string]any{"id": "J3Pbu5gP6NNKBscdCdwB"},
})`,java:`GraphQLResponse res = client.graphQL().execute(
    "query GetAgent($id: ID!) { agent(id: $id) { id name conversationConfig { turnTimeoutMs } } }",
    Map.of("id", "J3Pbu5gP6NNKBscdCdwB")
);`,csharp:`var res = await client.GraphQL.ExecuteAsync(
    @"query GetAgent($id: ID!) {
        agent(id: $id) { id name conversationConfig { turnTimeoutMs } }
    }",
    new { id = "J3Pbu5gP6NNKBscdCdwB" }
);`,php:`<?php

$res = $client->graphql->execute(
    'query GetAgent($id: ID!) { agent(id: $id) { id name conversationConfig { turnTimeoutMs } } }',
    ['id' => 'J3Pbu5gP6NNKBscdCdwB']
);`,ruby:`res = client.graphql.execute(
  %q{query GetAgent($id: ID!) { agent(id: $id) { id name conversationConfig { turnTimeoutMs } } }},
  variables: { id: "J3Pbu5gP6NNKBscdCdwB" }
)`,swift:`let res = try await client.graphQL.execute(
    document: """
    query GetAgent($id: ID!) {
      agent(id: $id) { id name conversationConfig { turnTimeoutMs } }
    }
    """,
    variables: ["id": "J3Pbu5gP6NNKBscdCdwB"]
)`,rust:`let res = client.graphql().execute(
    r#"query GetAgent($id: ID!) {
        agent(id: $id) { id name conversationConfig { turnTimeoutMs } }
    }"#,
    serde_json::json!({ "id": "J3Pbu5gP6NNKBscdCdwB" })
).await?;`}},"gql-list-agents":{id:"gql-list-agents",method:"QRY",path:"/graphql",breadcrumb:["API Reference","GraphQL"],title:"agents",description:"Returns a paginated list of agents in your workspace, ordered by creation time. Schema: `agents(pageSize: Int = 20, cursor: String): AgentConnection`.",request:{description:"Arguments for the `agents` query. Returns a relay-style `AgentConnection`.",fields:[{name:"pageSize",type:"Int",required:!1,description:"Max edges per page. Default 20, max 100."},{name:"cursor",type:"String",required:!1,description:"Pagination cursor from a previous response."}]},response:{description:"Returns an `AgentConnection` with edges and pageInfo under `data.agents`.",status:200,statusLabel:"Successful",fields:[{name:"data.agents.edges",type:"[AgentEdge!]",description:"Edges for this page."},{name:"data.agents.edges.node",type:"Agent",description:"The agent node."},{name:"data.agents.pageInfo.endCursor",type:"String",description:"Cursor for the next page."},{name:"data.agents.pageInfo.hasNextPage",type:"Boolean",description:"Whether more pages exist."},{name:"errors",type:"[GraphQLError!]",description:"GraphQL errors, if any."}],body:`{
  "data": {
    "agents": {
      "edges": [
        { "node": { "id": "J3Pbu5gP6NNKBscdCdwB", "name": "Support Line" } },
        { "node": { "id": "A7Xc9vN2mQ4kLpRtYeZ", "name": "Sales Outbound" } }
      ],
      "pageInfo": { "endCursor": null, "hasNextPage": false }
    }
  }
}`},samples:{typescript:`const document = \`
  query ListAgents($pageSize: Int = 20) {
    agents(pageSize: $pageSize) {
      edges { node { id name } }
      pageInfo { endCursor hasNextPage }
    }
  }
\`;
const res = await client.graphql.request({
    query: document,
    variables: { pageSize: 20 },
});`,python:`document = """
query ListAgents($pageSize: Int = 20) {
  agents(pageSize: $pageSize) {
    edges { node { id name } }
    pageInfo { endCursor hasNextPage }
  }
}
"""
res = client.graphql.execute(document, variables={"pageSize": 20})`,curl:`curl -X POST https://api.yourcompany.com/graphql \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "query ListAgents($pageSize: Int = 20) { agents(pageSize: $pageSize) { edges { node { id name } } pageInfo { endCursor hasNextPage } } }",
    "variables": { "pageSize": 20 }
  }'`,go:`res, _ := client.GraphQL.Execute(ctx, &yc.GraphQLRequest{
    Query: \`query ListAgents($pageSize: Int = 20) {
        agents(pageSize: $pageSize) {
            edges { node { id name } }
            pageInfo { endCursor hasNextPage }
        }
    }\`,
    Variables: map[string]any{"pageSize": 20},
})`,java:`GraphQLResponse res = client.graphQL().execute(
    "query ListAgents($pageSize: Int = 20) { agents(pageSize: $pageSize) { edges { node { id name } } pageInfo { endCursor hasNextPage } } }",
    Map.of("pageSize", 20)
);`,csharp:`var res = await client.GraphQL.ExecuteAsync(
    @"query ListAgents($pageSize: Int = 20) {
        agents(pageSize: $pageSize) {
            edges { node { id name } }
            pageInfo { endCursor hasNextPage }
        }
    }",
    new { pageSize = 20 }
);`,php:`<?php

$res = $client->graphql->execute(
    'query ListAgents($pageSize: Int = 20) { agents(pageSize: $pageSize) { edges { node { id name } } pageInfo { endCursor hasNextPage } } }',
    ['pageSize' => 20]
);`,ruby:`res = client.graphql.execute(
  %q{query ListAgents($pageSize: Int = 20) { agents(pageSize: $pageSize) { edges { node { id name } } pageInfo { endCursor hasNextPage } } }},
  variables: { pageSize: 20 }
)`,swift:`let res = try await client.graphQL.execute(
    document: """
    query ListAgents($pageSize: Int = 20) {
      agents(pageSize: $pageSize) {
        edges { node { id name } }
        pageInfo { endCursor hasNextPage }
      }
    }
    """,
    variables: ["pageSize": 20]
)`,rust:`let res = client.graphql().execute(
    r#"query ListAgents($pageSize: Int = 20) {
        agents(pageSize: $pageSize) {
            edges { node { id name } }
            pageInfo { endCursor hasNextPage }
        }
    }"#,
    serde_json::json!({ "pageSize": 20 })
).await?;`}},"gql-create-agent":{id:"gql-create-agent",method:"MUT",path:"/graphql",breadcrumb:["API Reference","GraphQL"],title:"createAgent",description:"Creates a new agent and returns it. Schema: `createAgent(input: CreateAgentInput!): Agent`.",request:{description:"Arguments for the `createAgent` mutation. `input` is a `CreateAgentInput!` value.",fields:[{name:"input.voiceConfig",type:"VoiceConfigInput!",required:!0,description:"Voice ID, model, language, and prosody."},{name:"input.conversationConfig",type:"ConversationConfigInput",required:!1,description:"Turn-taking and interruption settings."},{name:"input.name",type:"String",required:!1,description:"Display name for the agent."}]},response:{description:"Returns the created `Agent` under `data.createAgent`.",status:200,statusLabel:"Successful",fields:[{name:"data.createAgent.id",type:"ID",description:"Assigned identifier."},{name:"data.createAgent.name",type:"String",description:"Display name."},{name:"data.createAgent.state",type:"AgentState",description:"Initial state."},{name:"errors",type:"[GraphQLError!]",description:"GraphQL errors, if any."}],body:`{
  "data": {
    "createAgent": {
      "id": "J3Pbu5gP6NNKBscdCdwB",
      "name": "Support Bot",
      "state": "READY"
    }
  }
}`},samples:{typescript:`const document = \`
  mutation CreateAgent($input: CreateAgentInput!) {
    createAgent(input: $input) {
      id
      name
      state
    }
  }
\`;
const res = await client.graphql.request({
    query: document,
    variables: { input: { voiceConfig: { voiceId: "alloy", language: "en" }, name: "Support Bot" } },
});`,python:`document = """
mutation CreateAgent($input: CreateAgentInput!) {
  createAgent(input: $input) { id name state }
}
"""
res = client.graphql.execute(
    document,
    variables={"input": {"voiceConfig": {"voiceId": "alloy", "language": "en"}, "name": "Support Bot"}},
)`,curl:`curl -X POST https://api.yourcompany.com/graphql \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "mutation CreateAgent($input: CreateAgentInput!) { createAgent(input: $input) { id name state } }",
    "variables": { "input": { "voiceConfig": { "voiceId": "alloy", "language": "en" }, "name": "Support Bot" } }
  }'`,go:`res, _ := client.GraphQL.Execute(ctx, &yc.GraphQLRequest{
    Query: \`mutation CreateAgent($input: CreateAgentInput!) {
        createAgent(input: $input) { id name state }
    }\`,
    Variables: map[string]any{"input": map[string]any{
        "voiceConfig": map[string]any{"voiceId": "alloy", "language": "en"},
        "name":        "Support Bot",
    }},
})`,java:`GraphQLResponse res = client.graphQL().execute(
    "mutation CreateAgent($input: CreateAgentInput!) { createAgent(input: $input) { id name state } }",
    Map.of("input", Map.of(
        "voiceConfig", Map.of("voiceId", "alloy", "language", "en"),
        "name", "Support Bot"
    ))
);`,csharp:`var res = await client.GraphQL.ExecuteAsync(
    @"mutation CreateAgent($input: CreateAgentInput!) {
        createAgent(input: $input) { id name state }
    }",
    new { input = new { voiceConfig = new { voiceId = "alloy", language = "en" }, name = "Support Bot" } }
);`,php:`<?php

$res = $client->graphql->execute(
    'mutation CreateAgent($input: CreateAgentInput!) { createAgent(input: $input) { id name state } }',
    ['input' => [
        'voiceConfig' => ['voiceId' => 'alloy', 'language' => 'en'],
        'name'        => 'Support Bot',
    ]]
);`,ruby:`res = client.graphql.execute(
  %q{mutation CreateAgent($input: CreateAgentInput!) { createAgent(input: $input) { id name state } }},
  variables: { input: { voiceConfig: { voiceId: "alloy", language: "en" }, name: "Support Bot" } }
)`,swift:`let res = try await client.graphQL.execute(
    document: """
    mutation CreateAgent($input: CreateAgentInput!) {
      createAgent(input: $input) { id name state }
    }
    """,
    variables: ["input": ["voiceConfig": ["voiceId": "alloy", "language": "en"], "name": "Support Bot"]]
)`,rust:`let res = client.graphql().execute(
    r#"mutation CreateAgent($input: CreateAgentInput!) {
        createAgent(input: $input) { id name state }
    }"#,
    serde_json::json!({ "input": { "voiceConfig": { "voiceId": "alloy", "language": "en" }, "name": "Support Bot" } })
).await?;`}},"gql-agent-events":{id:"gql-agent-events",method:"SUB",path:"wss://api.yourcompany.com/graphql",breadcrumb:["API Reference","GraphQL"],title:"agentEvents",description:"Streams lifecycle events for an agent over WebSocket using the `graphql-transport-ws` subscription protocol. Schema: `agentEvents(agentId: ID!): AgentEvent`.",request:{description:"Open a WebSocket to `/graphql` with subprotocol `graphql-transport-ws`. Send a `connection_init` frame, then a `subscribe` frame with the document below.",fields:[{name:"agentId",type:"ID!",required:!0,description:"Agent to subscribe to."}]},response:{description:"Each event is delivered as a `next` frame with the payload under `data.agentEvents`. The subscription ends with a `complete` frame.",status:101,statusLabel:"Switching Protocols",fields:[{name:"data.agentEvents.eventType",type:"AgentEventType",description:'"RUN_STARTED", "RUN_COMPLETED", "RUN_FAILED", or "TOOL_INVOKED".'},{name:"data.agentEvents.runId",type:"ID",description:"Run the event relates to, when applicable."},{name:"data.agentEvents.occurredAt",type:"DateTime",description:"ISO-8601 timestamp."}],body:`{ "type": "next", "id": "1", "payload": { "data": { "agentEvents": { "eventType": "RUN_STARTED", "runId": "run_8f2K9", "occurredAt": "2026-10-14T17:42:03Z" } } } }
{ "type": "next", "id": "1", "payload": { "data": { "agentEvents": { "eventType": "RUN_COMPLETED", "runId": "run_8f2K9", "occurredAt": "2026-10-14T17:42:05Z" } } } }`},samples:{typescript:`import { createClient } from "graphql-ws";

const client = createClient({
    url: "wss://api.yourcompany.com/graphql",
    connectionParams: { authToken: apiKey },
});
client.subscribe(
    { query: \`subscription($id: ID!) { agentEvents(agentId: $id) { eventType runId occurredAt } }\`,
      variables: { id: "J3Pbu5gP6NNKBscdCdwB" } },
    { next: (msg) => console.log(msg.data.agentEvents), error: console.error, complete: () => {} },
);`,python:`# gql with WebsocketsTransport
from gql import Client, gql
from gql.transport.websockets import WebsocketsTransport

transport = WebsocketsTransport(
    url="wss://api.yourcompany.com/graphql",
    init_payload={"authToken": api_key},
)
async with Client(transport=transport) as session:
    async for event in session.subscribe(gql("""
        subscription($id: ID!) {
          agentEvents(agentId: $id) { eventType runId occurredAt }
        }
    """), variable_values={"id": "J3Pbu5gP6NNKBscdCdwB"}):
        print(event["agentEvents"])`,curl:`# graphql-transport-ws over wscat
wscat -c "wss://api.yourcompany.com/graphql" -s graphql-transport-ws \\
  -x '{"type":"connection_init","payload":{"authToken":"'$API_KEY'"}}' \\
  -x '{"type":"subscribe","id":"1","payload":{"query":"subscription($id: ID!) { agentEvents(agentId: $id) { eventType runId occurredAt } }","variables":{"id":"J3Pbu5gP6NNKBscdCdwB"}}}'`,go:`// github.com/hasura/go-graphql-client
client := graphql.NewSubscriptionClient("wss://api.yourcompany.com/graphql").
    WithConnectionParams(map[string]any{"authToken": apiKey})
client.Subscribe(&struct {
    AgentEvents struct {
        EventType string
        RunID     string
        OccurredAt string
    } \`graphql:"agentEvents(agentId: $id)"\`
}{}, map[string]any{"id": graphql.ID("J3Pbu5gP6NNKBscdCdwB")}, func(data []byte, err error) error {
    fmt.Println(string(data))
    return nil
})`,java:`// graphql-java + ReactiveStreams over graphql-transport-ws
client.subscribe(
    "subscription($id: ID!) { agentEvents(agentId: $id) { eventType runId occurredAt } }",
    Map.of("id", "J3Pbu5gP6NNKBscdCdwB"),
    payload -> System.out.println(payload.get("data"))
);`,csharp:`// GraphQL.Client.Http + GraphQL.Client.WebSocket
var req = new GraphQLRequest
{
    Query = "subscription($id: ID!) { agentEvents(agentId: $id) { eventType runId occurredAt } }",
    Variables = new { id = "J3Pbu5gP6NNKBscdCdwB" },
};
await foreach (var msg in client.CreateSubscriptionStream<AgentEventsPayload>(req))
{
    Console.WriteLine(msg.Data);
}`,php:`<?php

// graphql-php client with graphql-transport-ws bridge
$client->subscribe(
    'subscription($id: ID!) { agentEvents(agentId: $id) { eventType runId occurredAt } }',
    ['id' => 'J3Pbu5gP6NNKBscdCdwB'],
    function ($payload) { var_dump($payload['data']); }
);`,ruby:`# graphql-client with graphql-transport-ws
client.subscribe(
  %q{subscription($id: ID!) { agentEvents(agentId: $id) { eventType runId occurredAt } }},
  variables: { id: "J3Pbu5gP6NNKBscdCdwB" }
) { |payload| puts payload["data"] }`,swift:`// ApolloWebSocket
let sub = SubscriptionRequest(
    document: """
    subscription($id: ID!) {
      agentEvents(agentId: $id) { eventType runId occurredAt }
    }
    """,
    variables: ["id": "J3Pbu5gP6NNKBscdCdwB"]
)
for try await msg in client.subscribe(sub) {
    print(msg.data?.agentEvents as Any)
}`,rust:`// graphql-ws-client
use graphql_ws_client::Client;

let mut sub = client.subscribe(
    r#"subscription($id: ID!) {
        agentEvents(agentId: $id) { eventType runId occurredAt }
    }"#,
    serde_json::json!({ "id": "J3Pbu5gP6NNKBscdCdwB" }),
).await?;
while let Some(msg) = sub.next().await {
    println!("{:?}", msg?);
}`}}},A=[{id:"typescript",label:"TypeScript"},{id:"python",label:"Python"},{id:"go",label:"Go"},{id:"java",label:"Java"},{id:"csharp",label:"C#"},{id:"php",label:"PHP"},{id:"ruby",label:"Ruby"},{id:"swift",label:"Swift"},{id:"rust",label:"Rust"},{id:"curl",label:"cURL"}],T=[{date:"Oct 14, 2026",version:"v4.12.0",tag:"Feature",title:"Workflow versioning",body:"Agents can now be versioned. Roll back to any previous config with a single API call, or pin a conversation to a specific version."},{date:"Oct 2, 2026",version:"v4.11.2",tag:"Fix",title:"Streaming latency on long transcripts",body:"Resolved an issue where responses larger than 32KB experienced a 200–400ms tail latency when streamed over WebSocket."},{date:"Sep 23, 2026",version:"v4.11.0",tag:"Feature",title:"New Python SDK (3.12 support)",body:"Typed clients, async/await throughout, and first-class support for the newest Python runtimes. See the migration guide."},{date:"Sep 9, 2026",version:"v4.10.4",tag:"Fix",title:"Rate-limit headers now always present",body:"X-RateLimit-Remaining and X-RateLimit-Reset are returned on every response, including 2xx and idempotent retries."}];function I({method:e,size:n="sm"}){let r={GET:{c:"var(--method-get)",bg:"var(--method-get-bg)"},POST:{c:"var(--method-post)",bg:"var(--method-post-bg)"},PATCH:{c:"var(--method-patch)",bg:"var(--method-patch-bg)"},DEL:{c:"var(--method-del)",bg:"var(--method-del-bg)"},DELETE:{c:"var(--method-del)",bg:"var(--method-del-bg)"}}[e]||{c:"var(--fg-tertiary)",bg:"var(--bg-hover)"},i="lg"===n;return(0,t.jsx)("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",height:i?22:18,width:i?48:40,padding:0,boxSizing:"border-box",flexShrink:0,borderRadius:5,fontFamily:"var(--font-mono)",fontSize:i?11:9.5,fontWeight:700,letterSpacing:"0.03em",color:r.c,background:r.bg},children:e})}function _({label:e,method:n,active:r,onClick:i,indent:a=0,demoId:s}){return(0,t.jsxs)("button",{onClick:i,"data-demo":s,style:{width:"100%",display:"flex",alignItems:"center",gap:8,padding:`6px 8px 6px ${8+a}px`,marginLeft:0,borderRadius:6,background:r?"var(--accent-subtle)":"transparent",color:r?"var(--fg-primary)":"var(--fg-secondary)",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:r?600:500,textAlign:"left",transition:"background 80ms"},onMouseEnter:e=>{r||(e.currentTarget.style.background="var(--bg-hover)")},onMouseLeave:e=>{r||(e.currentTarget.style.background="transparent")},children:[n&&(0,t.jsx)(I,{method:n}),(0,t.jsx)("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:e})]})}function L({item:e,activeId:n,onSelect:r,expanded:a,onToggle:s}){let o=!!e.children&&e.children.length>0;return(0,t.jsxs)("div",{children:[(0,t.jsxs)("button",{onClick:()=>o&&s(e.id),style:{width:"100%",display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderRadius:6,background:"transparent",color:"var(--fg-secondary)",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:500,textAlign:"left"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:[(0,t.jsx)("span",{style:{flex:1},children:e.label}),o?(0,t.jsx)(i.Icon,{name:"chevronRight",size:12,style:{transition:"transform 120ms",transform:a?"rotate(90deg)":"none",color:"var(--fg-quaternary)",flexShrink:0}}):(0,t.jsx)(i.Icon,{name:"chevronRight",size:12,style:{color:"var(--fg-quaternary)",opacity:.55,flexShrink:0}})]}),a&&o&&(0,t.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:1,paddingLeft:8,paddingTop:2,paddingBottom:4},children:e.children.map(e=>(0,t.jsx)(_,{label:e.label,method:e.method,active:n===e.id,onClick:()=>r(e.id),demoId:`sidebar-${e.id}`},e.id))})]})}function R({activeId:e,onSelect:r,sections:i=w,defaultExpanded:a={rest:!0}}){let[s,o]=n.useState(a),l=e=>o(t=>({...t,[e]:!t[e]}));return n.useEffect(()=>{if(e){for(let t of i)for(let n of t.items)if("group"===n.type&&n.children?.some(t=>t.id===e))return void o(e=>e[n.id]?e:{...e,[n.id]:!0})}},[e,i]),(0,t.jsx)("aside",{style:{width:260,flexShrink:0,borderRight:"1px solid var(--border)",background:"var(--bg-sidebar)",overflowY:"auto",padding:"20px 12px"},children:i.map((n,i)=>(0,t.jsxs)("div",{style:{marginBottom:24},children:[n.title&&(0,t.jsx)("div",{style:{padding:"0 8px 8px",fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"var(--fg-tertiary)"},children:n.title}),(0,t.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:1},children:n.items.map(n=>"group"===n.type?(0,t.jsx)(L,{item:n,activeId:e,onSelect:r,expanded:!!s[n.id],onToggle:l},n.id):(0,t.jsx)(_,{label:n.label,method:n.method,active:e===n.id,onClick:()=>r(n.id),demoId:`sidebar-${n.id}`},n.id))})]},i))})}var P=e.i(174080);e.i(110287);var E=e.i(371221),z=e.i(204728);let B=`${E.fhaInter.variable} ${z.fhaJetBrainsMono.variable}`;function N({trigger:e,items:i,value:a,onSelect:s,align:o="left",minWidth:l=160,maxHeight:d=240,offset:c=4,renderItem:p,itemDemoId:u}){let[g,m]=n.useState(!1),[h,y]=n.useState(null),f=n.useRef(null),b=n.useRef(null),{resolvedTheme:x}=(0,r.useTheme)(),v=n.useCallback(()=>{let e=f.current;if(!e)return;let t=e.getBoundingClientRect();y({top:t.bottom+c,left:"left"===o?t.left:null,right:"right"===o?window.innerWidth-t.right:null})},[o,c]);n.useLayoutEffect(()=>{if(!g)return void y(null);v();let e=()=>v();return window.addEventListener("scroll",e,!0),window.addEventListener("resize",e),()=>{window.removeEventListener("scroll",e,!0),window.removeEventListener("resize",e)}},[g,v]),n.useEffect(()=>{if(!g)return;let e=e=>{let t=e.target,n=f.current&&f.current.contains(t),r=b.current&&b.current.contains(t);n||r||m(!1)},t=e=>{"Escape"===e.key&&m(!1)};return document.addEventListener("mousedown",e),document.addEventListener("keydown",t),()=>{document.removeEventListener("mousedown",e),document.removeEventListener("keydown",t)}},[g]);let w=()=>m(!1),j=g&&h&&"u">typeof document?P.default.createPortal((0,t.jsx)("div",{className:`fha-tokens ${B}`,"data-theme":"dark"===x?"dark":"light",ref:b,role:"menu",style:{position:"fixed",top:h.top,left:null!=h.left?h.left:"auto",right:null!=h.right?h.right:"auto",minWidth:l,maxHeight:d,overflowY:"auto",overscrollBehavior:"contain",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:8,boxShadow:"var(--shadow-lg)",padding:4,zIndex:1e3,display:"flex",flexDirection:"column",gap:1},children:i.map(e=>{let r=null!=a&&e.id===a;return p?(0,t.jsx)(n.Fragment,{children:p(e,{selected:r,close:w,select:()=>{s?.(e),w()}})},e.id):(0,t.jsx)(q,{item:e,selected:r,demoId:u?.(e),onSelect:()=>{s?.(e),w()}},e.id)})}),document.body):null;return(0,t.jsxs)("span",{ref:f,style:{position:"relative",display:"inline-flex"},children:[e({open:g,toggle:()=>m(e=>!e),close:w,triggerProps:{"aria-haspopup":"menu","aria-expanded":g}}),j]})}function q({item:e,selected:n,demoId:r,onSelect:a}){return(0,t.jsxs)("button",{role:"menuitem",onClick:a,"data-demo":r,style:{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 8px",fontSize:12.5,fontWeight:500,color:"var(--fg-primary)",background:n?"var(--bg-hover)":"transparent",border:"none",borderRadius:5,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 80ms"},onMouseEnter:e=>{n||(e.currentTarget.style.background="var(--bg-hover)")},onMouseLeave:e=>{n||(e.currentTarget.style.background="transparent")},children:[e.leading,(0,t.jsx)("span",{style:{flex:1},children:e.label}),e.trailing,n&&!e.trailing&&(0,t.jsx)(i.Icon,{name:"check",size:12})]})}function D({field:e,isLast:n}){return(0,t.jsxs)("div",{style:{padding:"14px 0",borderBottom:n?"none":"1px solid var(--border)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:6},children:[(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:700,color:"var(--fg-primary)"},children:e.name}),(0,t.jsx)("span",{style:{fontSize:12,color:"var(--fg-tertiary)"},children:e.type}),void 0!==e.required&&(0,t.jsx)("span",{style:{fontSize:12,color:e.required?"var(--method-del)":"var(--fg-tertiary)"},children:e.required?"Required":"Optional"})]}),e.description&&(0,t.jsx)("div",{style:{fontSize:13,color:"var(--fg-secondary)",lineHeight:1.55},children:e.description})]})}function K({icon:e,iconColor:n,endIcon:r,label:a,demoId:s,onClick:o,active:l,ariaHasPopup:d}){return(0,t.jsxs)("button",{onClick:o,"data-demo":s,"aria-haspopup":d,"aria-expanded":d?!!l:void 0,style:{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 10px",height:28,fontSize:12,fontWeight:500,color:"var(--fg-secondary)",background:l?"var(--bg-hover)":"transparent",border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit"},onMouseEnter:e=>{l||(e.currentTarget.style.background="var(--bg-hover)")},onMouseLeave:e=>{l||(e.currentTarget.style.background="transparent")},children:[e&&(0,t.jsx)("span",{style:{display:"inline-flex",color:n||"inherit"},children:(0,t.jsx)(i.Icon,{name:e,size:13})}),a,r&&(0,t.jsx)(i.Icon,{name:r,size:12,style:{opacity:.7,marginLeft:2}})]})}function $({brand:e,size:n=14}){let r={display:"inline-flex",alignItems:"center",justifyContent:"center",width:n+2,height:n+2,flexShrink:0};return"claude"===e?(0,t.jsx)("span",{style:r,children:(0,t.jsx)("svg",{width:n,height:n,viewBox:"0 0 32 32",fill:"none","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M6.28208 21.2313L12.5804 17.7089L12.6857 17.4019L12.5804 17.2323H12.2723L11.2186 17.1676L7.61955 17.0707L4.49878 16.9414L1.47528 16.7799L0.71332 16.6183L0 15.6811L0.0729532 15.2126L0.71332 14.7844L1.62929 14.8652L3.65577 15.0025L6.69548 15.2126L8.90029 15.3418L12.167 15.6811H12.6857L12.7587 15.4711L12.5804 15.3418L12.4426 15.2126L9.29748 13.0878L5.893 10.8419L4.1097 9.54925L3.14509 8.89486L2.65874 8.28086L2.44798 6.93977L3.32342 5.97838L4.49878 6.05917L4.7987 6.13996L5.99027 7.05287L8.53552 9.01604L11.8589 11.4559L12.3453 11.8598L12.5398 11.7225L12.5642 11.6255L12.3453 11.262L10.5377 8.00618L8.60848 4.69384L7.74925 3.32042L7.52228 2.49638C7.44122 2.15706 7.38448 1.8743 7.38448 1.52691L8.38151 0.177736L8.93271 0L10.2621 0.177736L10.8214 0.662469L11.6482 2.54485L12.9857 5.5098L15.0608 9.54117L15.6687 10.7368L15.993 11.8437L16.1145 12.183H16.3253V11.9891L16.4955 9.71891L16.8117 6.93169L17.1197 3.34466L17.2251 2.3348L17.7276 1.12297L18.7247 0.468576L19.5028 0.840205L20.1432 1.75312L20.054 2.34288L19.673 4.80694L18.9273 8.66865L18.4409 11.2539H18.7247L19.0489 10.9307L20.362 9.19378L22.5669 6.44695L23.5396 5.3563L24.6744 4.15255L25.4039 3.57895H26.7819L27.7952 5.08162L27.3412 6.63277L25.9227 8.42628L24.7473 9.94511L23.0613 12.2072L22.0075 14.0169L22.1048 14.1623L22.3561 14.1381L26.1659 13.3302L28.2248 12.9585L30.6809 12.5384L31.7914 13.0555L31.913 13.5806L31.4752 14.6551L28.8489 15.3014L25.7687 15.9154L21.1807 16.998L21.124 17.0384L21.1888 17.1192L23.2559 17.3131L24.1394 17.3615H26.3037L30.3323 17.6605L31.3861 18.3552L32.0183 19.2035L31.913 19.8498L30.2918 20.6739L28.1032 20.1568L22.9965 18.945L21.2456 18.5087H21.0024V18.6542L22.4615 20.076L25.1364 22.4836L28.4842 25.5858L28.6544 26.3533L28.2248 26.9593L27.7708 26.8946L24.8284 24.6891L23.6936 23.6954L21.124 21.5383H20.9538V21.7645L21.5455 22.629L24.6744 27.3147L24.8365 28.7528L24.6095 29.2213L23.799 29.5041L22.9073 29.3425L21.0754 26.7815L19.1867 23.8974L17.6628 21.3121L17.4763 21.4171L16.5766 31.0714L16.1551 31.5642L15.1824 31.9359L14.3718 31.3219L13.9422 30.3282L14.3718 28.365L14.8906 25.804L15.3121 23.7681L15.693 21.2394L15.92 20.3992L15.9038 20.3426L15.7174 20.3669L13.8044 22.9844L10.8943 26.9027L8.59226 29.3587L8.04106 29.5768L7.08456 29.084L7.17373 28.2034L7.70872 27.4198L10.8943 23.3803L12.8154 20.8759L14.0556 19.4297L14.0475 19.2197H13.9746L5.51202 24.6972L4.00432 24.8911L3.35585 24.2851L3.43691 23.2914L3.74493 22.9683L6.29019 21.2232L6.28208 21.2313Z",fill:"#D97757"})})}):"chatgpt"===e?(0,t.jsx)("span",{style:r,children:(0,t.jsx)("svg",{width:n,height:n,viewBox:"0 0 33 33",fill:"currentColor","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M12.5607 11.8142V8.73078C12.5607 8.47109 12.6582 8.27628 12.8853 8.1466L19.0847 4.57637C19.9285 4.08954 20.9347 3.86246 21.9732 3.86246C25.8679 3.86246 28.3348 6.88099 28.3348 10.0941C28.3348 10.3212 28.3348 10.5809 28.3023 10.8406L21.8758 7.07553C21.4864 6.84845 21.0967 6.84845 20.7073 7.07553L12.5607 11.8142ZM27.0364 23.8232V16.4554C27.0364 16.0009 26.8415 15.6764 26.4521 15.4492L18.3055 10.7106L20.967 9.185C21.1941 9.05533 21.3889 9.05533 21.6161 9.185L27.8154 12.7552C29.6007 13.794 30.8014 16.0009 30.8014 18.1429C30.8014 20.6096 29.341 22.8816 27.0364 23.823V23.8232ZM10.6458 17.3319L7.98433 15.7741C7.75725 15.6444 7.65977 15.4496 7.65977 15.1899V8.04947C7.65977 4.57671 10.3212 1.94753 13.924 1.94753C15.2873 1.94753 16.5529 2.40203 17.6242 3.21341L11.2303 6.91359C10.8409 7.14067 10.6461 7.46523 10.6461 7.9198V17.3322L10.6458 17.3319ZM16.3745 20.6424L12.5607 18.5004V13.9566L16.3745 11.8145L20.1879 13.9566V18.5004L16.3745 20.6424ZM18.8249 30.5094C17.4616 30.5094 16.1961 30.0549 15.1247 29.2436L21.5186 25.5434C21.908 25.3163 22.1029 24.9917 22.1029 24.5372V15.1247L24.7969 16.6826C25.024 16.8122 25.1215 17.0071 25.1215 17.2668V24.4072C25.1215 27.88 22.4274 30.5091 18.8249 30.5091V30.5094ZM11.1326 23.2716L4.93319 19.7014C3.14794 18.6626 1.94719 16.4558 1.94719 14.3137C1.94719 11.8145 3.44022 9.57504 5.74451 8.63371V16.0338C5.74451 16.4883 5.93939 16.8128 6.32875 17.04L14.4431 21.746L11.7816 23.2716C11.5546 23.4013 11.3597 23.4013 11.1326 23.2716ZM10.7758 28.5945C7.10814 28.5945 4.41416 25.8356 4.41416 22.4277C4.41416 22.168 4.4467 21.9083 4.47896 21.6486L10.8729 25.3488C11.2623 25.576 11.652 25.576 12.0413 25.3488L20.1879 20.6428V23.7262C20.1879 23.9859 20.0905 24.1807 19.8634 24.3103L13.664 27.8806C12.8201 28.3674 11.8139 28.5945 10.7754 28.5945H10.7758ZM18.8249 32.4567C22.7522 32.4567 26.0302 29.6655 26.777 25.9653C30.4121 25.024 32.749 21.616 32.749 18.1433C32.749 15.8712 31.7754 13.6643 30.0227 12.0739C30.1849 11.3922 30.2823 10.7106 30.2823 10.0293C30.2823 5.38803 26.5173 1.91493 22.168 1.91493C21.2919 1.91493 20.448 2.0446 19.604 2.33689C18.1433 0.908726 16.1309 0 13.924 0C9.99673 0 6.71878 2.79112 5.97199 6.49129C2.33689 7.43263 0 10.8406 0 14.3133C0 16.5854 0.973596 18.7923 2.72631 20.3827C2.56404 21.0644 2.46663 21.746 2.46663 22.4274C2.46663 27.0687 6.23168 30.5417 10.5809 30.5417C11.4571 30.5417 12.301 30.412 13.1449 30.1197C14.6054 31.5479 16.6177 32.4567 18.8249 32.4567Z"})})}):"cursor"===e?(0,t.jsx)("span",{style:r,children:(0,t.jsx)("svg",{width:n,height:n,viewBox:"0 0 28 33",fill:"currentColor","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M27.9025 7.6823L14.9092 0.180708C14.492 -0.060236 13.9772 -0.060236 13.56 0.180708L0.567286 7.6823C0.216545 7.88481 0 8.25935 0 8.66499V23.792C0 24.1976 0.216545 24.5722 0.567286 24.7747L13.5606 32.2763C13.9778 32.5172 14.4926 32.5172 14.9099 32.2763L27.9031 24.7747C28.2539 24.5722 28.4704 24.1976 28.4704 23.792V8.66499C28.4704 8.25935 28.2539 7.88481 27.9031 7.6823H27.9025ZM27.0864 9.27131L14.5433 30.9965C14.4585 31.1429 14.2346 31.0831 14.2346 30.9136V16.6881C14.2346 16.4039 14.0827 16.141 13.8363 15.9982L1.51703 8.8858C1.37064 8.80101 1.43041 8.57715 1.59999 8.57715H26.6862C27.0425 8.57715 27.2651 8.96327 27.087 9.27192H27.0864V9.27131Z"})})}):null}function M(){let e=[{id:"chatgpt",label:"Open in ChatGPT",leading:(0,t.jsx)($,{brand:"chatgpt",size:13})},{id:"cursor",label:"Open in Cursor",leading:(0,t.jsx)($,{brand:"cursor",size:13})},{id:"copy",label:"Copy as prompt",leading:(0,t.jsx)(i.Icon,{name:"copy",size:13,style:{color:"var(--fg-tertiary)"}})}],n={display:"inline-flex",alignItems:"center",gap:6,height:28,fontSize:12,fontWeight:500,color:"var(--fg-secondary)",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit"};return(0,t.jsxs)("span",{style:{display:"inline-flex",alignItems:"stretch",borderRadius:6},children:[(0,t.jsxs)("button",{"data-demo":"open-in-claude",onClick:()=>window.__widgetsDemo?.spawnTerminal?.("Terminal",{showBanner:!0}),style:{...n,padding:"0 8px 0 10px",borderRadius:"6px 0 0 6px"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:[(0,t.jsx)($,{brand:"claude",size:13}),(0,t.jsx)("span",{style:{marginLeft:2},children:"Open in Claude"})]}),(0,t.jsx)(N,{align:"left",minWidth:196,offset:4,items:e,onSelect:()=>{},trigger:({open:e,toggle:r})=>(0,t.jsx)("button",{onClick:r,"aria-haspopup":"menu","aria-expanded":!!e,"aria-label":"Open in another AI",style:{...n,padding:"0 8px",borderRadius:"0 6px 6px 0",background:e?"var(--bg-hover)":"transparent"},onMouseEnter:t=>{e||(t.currentTarget.style.background="var(--bg-hover)")},onMouseLeave:t=>{e||(t.currentTarget.style.background="transparent")},children:(0,t.jsx)(i.Icon,{name:"chevronDown",size:12,style:{opacity:.7}})})})]})}function W({endpoint:e,onAssistantOpen:r,onMdViewOpen:a,inlineCodePanel:s}){return e?(0,t.jsxs)("div",{style:{padding:"32px 0 64px"},children:[(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--brand-fg)",marginBottom:14},children:e.breadcrumb.map((e,r)=>(0,t.jsxs)(n.Fragment,{children:[r>0&&(0,t.jsx)(i.Icon,{name:"chevronRight",size:11}),(0,t.jsx)("span",{children:e})]},r))}),(0,t.jsx)("h1",{style:{margin:0,fontSize:32,fontWeight:700,letterSpacing:"-0.02em",color:"var(--fg-primary)"},children:e.title}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:2,marginTop:14,marginLeft:-10,flexWrap:"wrap"},children:[(0,t.jsx)(K,{icon:"sparkles",label:"Ask a question",onClick:()=>r?.(e.path)}),(0,t.jsx)("span",{style:{color:"var(--border-strong)"},children:"|"}),(0,t.jsx)(K,{icon:"markdown",label:"View as MD",demoId:"view-as-md",onClick:()=>a?.()}),(0,t.jsx)("span",{style:{color:"var(--border-strong)"},children:"|"}),(0,t.jsx)(M,{})]}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"},children:[(0,t.jsx)(I,{method:e.method,size:"lg"}),(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--fg-secondary)"},children:e.path})]}),(0,t.jsx)("p",{style:{marginTop:24,marginBottom:0,fontSize:15,lineHeight:1.6,color:"var(--fg-secondary)"},children:e.description}),s&&(0,t.jsx)("div",{className:"fha-inline-codepanel",style:{marginTop:28},children:s}),(0,t.jsxs)("section",{style:{marginTop:40},children:[(0,t.jsx)("h2",{style:{margin:0,fontSize:18,fontWeight:700,letterSpacing:"-0.01em"},children:"Request"}),e.request.description&&(0,t.jsx)("p",{style:{fontSize:13,color:"var(--fg-secondary)",marginTop:6},children:e.request.description}),(0,t.jsx)("div",{style:{marginTop:10,borderTop:"1px solid var(--border)"},children:e.request.fields.map((n,r)=>(0,t.jsx)(D,{field:n,isLast:r===e.request.fields.length-1},n.name))})]}),(0,t.jsxs)("section",{style:{marginTop:40},children:[(0,t.jsx)("h2",{style:{margin:0,fontSize:18,fontWeight:700,letterSpacing:"-0.01em"},children:"Response"}),e.response.description&&(0,t.jsx)("p",{style:{fontSize:13,color:"var(--fg-secondary)",marginTop:6},children:e.response.description}),(0,t.jsx)("div",{style:{marginTop:10,borderTop:"1px solid var(--border)"},children:e.response.fields.map((n,r)=>(0,t.jsx)(D,{field:n,isLast:r===e.response.fields.length-1},n.name))})]})]}):null}let O={ts:new Set(["import","from","export","default","as","async","await","function","const","let","var","new","return","if","else","for","while","do","switch","case","break","continue","try","catch","finally","throw","class","extends","implements","interface","type","enum","public","private","protected","static","readonly","typeof","instanceof","in","of","void","null","undefined","this","super","true","false"]),js:new Set(["import","from","export","default","as","async","await","function","const","let","var","new","return","if","else","for","while","do","switch","case","break","continue","try","catch","finally","throw","class","extends","typeof","instanceof","in","of","void","null","undefined","this","super","true","false"]),py:new Set(["import","from","as","def","class","async","await","return","if","elif","else","for","while","try","except","finally","raise","with","yield","lambda","pass","break","continue","in","not","is","and","or","True","False","None","self","global","nonlocal"]),go:new Set(["package","import","func","return","if","else","for","range","switch","case","default","break","continue","go","defer","select","chan","map","struct","interface","type","const","var","nil","true","false","new","make"]),sh:new Set(["if","then","else","elif","fi","for","while","do","done","case","esac","in","return","function","local","export","echo","cd","cat","curl","source","exit"]),java:new Set(["import","package","public","private","protected","static","final","abstract","class","interface","extends","implements","new","return","if","else","for","while","do","switch","case","break","continue","try","catch","finally","throw","throws","void","null","true","false","this","super","var","int","long","double","boolean","String"]),cs:new Set(["using","namespace","public","private","protected","internal","static","readonly","class","struct","interface","record","new","return","if","else","for","foreach","while","do","switch","case","break","continue","try","catch","finally","throw","void","null","true","false","this","base","var","string","int","long","double","bool","async","await","in","out","get","set"]),php:new Set(["use","namespace","class","function","public","private","protected","static","new","return","if","else","elseif","for","foreach","while","do","switch","case","break","continue","try","catch","finally","throw","null","true","false","echo","require","include","extends","implements","as"]),rb:new Set(["require","module","class","def","end","do","return","if","elsif","else","unless","for","while","until","break","next","begin","rescue","ensure","raise","yield","true","false","nil","self","attr_accessor","attr_reader","attr_writer","then","in"]),swift:new Set(["import","let","var","func","class","struct","enum","protocol","extension","public","private","internal","fileprivate","open","static","final","return","if","else","guard","for","in","while","repeat","switch","case","break","continue","try","catch","throw","throws","nil","true","false","self","super","async","await"]),rs:new Set(["fn","let","mut","const","static","pub","mod","use","crate","struct","enum","trait","impl","for","in","where","as","match","if","else","while","loop","return","break","continue","ref","self","Self","true","false","async","await","move","dyn","unsafe","extern","type"])},H={ts:new Set(["console","Promise","Array","Object","String","Number","Boolean","Math","JSON","Date","Error","Map","Set"]),js:new Set(["console","Promise","Array","Object","String","Number","Boolean","Math","JSON","Date","Error","Map","Set"]),py:new Set(["print","len","range","list","dict","set","tuple","str","int","float","bool","None","True","False"]),go:new Set(["fmt","context","string","int","int64","float64","bool","byte","rune","error"]),sh:new Set([]),java:new Set(["System","String","Integer","Long","Double","Boolean","List","Map","ArrayList","HashMap","Object"]),cs:new Set(["Console","String","Task","List","Dictionary","Object","DateTime"]),php:new Set(["echo","print","array","isset","empty","count","strlen"]),rb:new Set(["puts","print","p","require","raise","Array","Hash","String","Integer"]),swift:new Set(["print","String","Int","Double","Bool","Array","Dictionary","Optional"]),rs:new Set(["println","print","String","Vec","Option","Result","Box"])};function F(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function G({code:e,lang:n}){let r=e.split("\n");return(0,t.jsx)("div",{className:"shblock",style:{fontFamily:"var(--font-mono)",fontSize:12,lineHeight:1.65,padding:"12px 0",background:"var(--bg-surface)"},children:(0,t.jsx)("table",{style:{borderCollapse:"collapse",minWidth:"100%"},children:(0,t.jsx)("tbody",{children:r.map((e,r)=>(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{style:{padding:"0 14px 0 14px",color:"var(--fg-quaternary)",userSelect:"none",textAlign:"right",verticalAlign:"top",width:1,whiteSpace:"nowrap"},children:r+1}),(0,t.jsx)("td",{style:{padding:"0 14px 0 0",whiteSpace:"pre",color:"var(--fg-primary)"},dangerouslySetInnerHTML:{__html:function e(t,n){let r,i="typescript"===(r=(n||"").toLowerCase())||"ts"===r?"ts":"javascript"===r||"js"===r?"js":"python"===r||"py"===r?"py":"go"===r||"golang"===r?"go":"curl"===r||"bash"===r||"sh"===r||"shell"===r?"sh":"java"===r?"java":"csharp"===r||"cs"===r||"c#"===r?"cs":"php"===r?"php":"ruby"===r||"rb"===r?"rb":"swift"===r?"swift":"rust"===r||"rs"===r?"rs":"ts",a=O[i]||new Set,s=H[i]||new Set,o=[],l=(e,t)=>{if(t){if(!e)return void o.push(F(t));o.push('<span class="'+e+'">'+F(t)+"</span>")}},d=e=>/[A-Za-z_$]/.test(e),c=e=>/[A-Za-z0-9_$]/.test(e),p=e=>/[0-9]/.test(e),u=0,g=t.length;for(;u<g;){let r=t[u],m=t.slice(u,u+2),h=t.slice(u,u+3);if("//"===m){let e=t.indexOf("\n",u),n=-1===e?g:e;l("shc",t.slice(u,n)),u=n;continue}if("/*"===m){let e=t.indexOf("*/",u+2),n=-1===e?g:e+2;l("shc",t.slice(u,n)),u=n;continue}if("#"===r&&("py"===i||"sh"===i)){let e=t.indexOf("\n",u),n=-1===e?g:e;l("shc",t.slice(u,n)),u=n;continue}if("py"===i&&('"""'===h||"'''"===h)){let e=u+3;for(;e<g&&t.slice(e,e+3)!==h;)e++;let n=Math.min(g,e+3);l("shs",t.slice(u,n)),u=n;continue}if(("ts"===i||"js"===i)&&"`"===r){let r=u+1,i="`",a=(e,t)=>{t&&l(e,t)};for(;r<g;){let s=t[r];if("\\"===s&&r+1<g){i+=t.slice(r,r+2),r+=2;continue}if("${"===t.slice(r,r+2)){a("shs",i),i="",l("shp","${");let s=1,d=r+=2;for(;r<g&&s>0;)"{"===t[r]?s++:"}"===t[r]&&s--,s>0&&r++;let c=t.slice(d,r);o.push(e(c,n)),"}"===t[r]&&(l("shp","}"),r++);continue}if("`"===s){i+=s,r++,a("shs",i),i="";break}i+=s,r++}i&&a("shs",i),u=r;continue}if('"'===r||"'"===r){let e=u+1;for(;e<g;){if("\\"===t[e]&&e+1<g){e+=2;continue}if(t[e]===r){e++;break}if("\n"===t[e])break;e++}l("shs",t.slice(u,e)),u=e;continue}if(p(r)||"."===r&&p(t[u+1]||"")){let e=u;if("0"===r&&("x"===t[u+1]||"X"===t[u+1]))for(e+=2;e<g&&/[0-9a-fA-F_]/.test(t[e]);)e++;else{for(;e<g&&/[0-9_]/.test(t[e]);)e++;if("."===t[e]&&p(t[e+1]||""))for(e++;e<g&&/[0-9_]/.test(t[e]);)e++;if("e"===t[e]||"E"===t[e])for(("+"===t[++e]||"-"===t[e])&&e++;e<g&&/[0-9_]/.test(t[e]);)e++}l("shn",t.slice(u,e)),u=e;continue}if(d(r)){let e=u+1;for(;e<g&&c(t[e]);)e++;let n=t.slice(u,e),r=u-1;for(;r>=0&&" "===t[r];)r--;let i=r>=0?t[r]:"",o=e;for(;o<g&&" "===t[o];)o++;let d=o<g?t[o]:"";"."===i?"("===d?l("shfn",n):l("shprop",n):a.has(n)?l("shkw",n):s.has(n)?l("shb",n):"("===d?l("shfn",n):/^[A-Z]/.test(n)?l("shtype",n):l("",n),u=e;continue}if(-1!=="(){}[],:;".indexOf(r)){l("shp",r),u++;continue}if(-1!=="+-*/%=<>!&|?^~".indexOf(r)){l("shop",r),u++;continue}l("",r),u++}return o.join("")}(e||" ",n)}})]},r))})})})}let V={typescript:"/languages/typescript.svg",python:"/languages/python.svg",go:"/languages/go.svg",java:"/languages/java.svg",csharp:"/languages/net.svg",ruby:"/languages/ruby.svg",php:"/languages/php.svg",swift:"/languages/swift.svg",rust:"/languages/rust.svg"};function Y({id:e,size:n=14}){let r=e?V[e]:void 0;return r?(0,t.jsx)("img",{src:r,alt:"",width:n,height:n,"aria-hidden":"true",className:"rust"===e?"dark:invert":void 0,style:{width:n,height:n,display:"block",objectFit:"contain"}}):"curl"===e?(0,t.jsxs)("svg",{width:n,height:n,viewBox:"0 0 24 24","aria-hidden":"true",children:[(0,t.jsx)("rect",{width:"24",height:"24",rx:"3",fill:"#073551"}),(0,t.jsx)("path",{d:"M6 9l3 3-3 3M12 15h6",stroke:"#ffffff",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})]}):null}function J({value:e,onChange:n}){let r=A.find(t=>t.id===e),a=A.map(e=>({id:e.id,label:e.label,leading:(0,t.jsx)(Y,{id:e.id,size:14})}));return(0,t.jsx)(N,{align:"right",minWidth:160,maxHeight:240,offset:4,value:e,onSelect:e=>n(e.id),items:a,itemDemoId:e=>`lang-${e.id}`,trigger:({toggle:e,triggerProps:n})=>(0,t.jsxs)("button",{...n,onClick:e,"data-demo":"lang-selector",style:{display:"flex",alignItems:"center",gap:6,padding:"5px 8px 5px 8px",height:28,fontSize:12,fontWeight:500,color:"var(--fg-primary)",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",fontFamily:"inherit"},children:[(0,t.jsx)(Y,{id:r?.id,size:14}),(0,t.jsx)("span",{children:r?.label}),(0,t.jsx)(i.Icon,{name:"chevronDown",size:12})]})})}function U({endpoint:e,lang:r,onLangChange:a,onTryIt:s,onAssistantOpen:o,inline:l=!1}){let[d,c]=n.useState(!1);return(0,t.jsxs)("div",{style:l?{display:"flex",flexDirection:"column",gap:14,width:"100%"}:{display:"flex",flexDirection:"column",gap:14,width:420,flexShrink:0,padding:"32px 0 64px",position:"sticky",top:0,alignSelf:"flex-start"},children:[(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:10,background:"var(--bg-surface)",overflow:"hidden",boxShadow:"var(--shadow-sm)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderBottom:"1px solid var(--border)",background:"var(--bg-muted)"},children:[(0,t.jsx)(I,{method:e.method}),(0,t.jsx)("code",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-secondary)"},children:e.path}),(0,t.jsx)(J,{value:r,onChange:a}),(0,t.jsx)("button",{onClick:()=>o(e.path),"data-demo":"codepanel-ask-ai",title:"Ask AI about this endpoint",style:{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",borderRadius:6,cursor:"pointer",color:"var(--brand-fg)"},onMouseEnter:e=>e.currentTarget.style.background="var(--accent-bg)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:(0,t.jsx)(i.Icon,{name:"sparkles",size:13})}),(0,t.jsx)("button",{onClick:()=>{navigator.clipboard?.writeText(e.samples[r]),c(!0),setTimeout(()=>c(!1),1600)},"aria-label":d?"Copied":"Copy code",title:d?"Copied":"Copy code",style:{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",borderRadius:6,cursor:"pointer",color:"var(--fg-tertiary)"},children:(0,t.jsx)(i.Icon,{name:d?"check":"copy",size:13})})]}),(0,t.jsx)(G,{code:e.samples[r],lang:r}),(0,t.jsx)("div",{style:{display:"flex",justifyContent:"flex-end",padding:10,borderTop:"1px solid var(--border)",background:"var(--bg-muted)"},children:(0,t.jsxs)("button",{onClick:s,"data-demo":"tryit-open",style:{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",height:30,fontSize:12,fontWeight:600,color:"var(--accent-fg)",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit"},className:"fha-brand-btn",children:[(0,t.jsx)(i.Icon,{name:"play",size:11}),"Try it"]})})]}),(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:10,background:"var(--bg-surface)",overflow:"hidden",boxShadow:"var(--shadow-sm)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderBottom:"1px solid var(--border)",background:"var(--bg-muted)"},children:[(0,t.jsx)("span",{style:{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",height:20,borderRadius:5,fontFamily:"var(--font-mono)",fontSize:11,fontWeight:700,color:"var(--status-200)",background:"var(--status-200-bg)"},children:e.response.status}),(0,t.jsx)("span",{style:{fontSize:12,fontWeight:500,color:"var(--status-200)"},children:e.response.statusLabel}),(0,t.jsx)("div",{style:{flex:1}}),(0,t.jsx)(i.Icon,{name:"chevronDown",size:12,style:{color:"var(--fg-tertiary)"}})]}),(0,t.jsx)(G,{code:e.response.body,lang:"json"})]})]})}function Q({endpoint:e,lang:r,open:a,onClose:s}){let o,l,[d,c]=n.useState(!1),[p,u]=n.useState(null),[g,m]=n.useState(r||"curl"),[h,y]=n.useState(""),[f,b]=n.useState(!0),[x,v]=n.useState("idle");n.useEffect(()=>{a||(u(null),c(!1))},[a,e?.id]),n.useEffect(()=>{r&&m({typescript:"javascript",javascript:"javascript",python:"python",curl:"curl"}[r]||"curl")},[r]),n.useEffect(()=>{if(!a){window.__tryitDemo=null;return}return window.__tryitDemo={typeApiKey:(e,t)=>{b(!0),y("");let n=0,r=()=>{n++,y(e.slice(0,n)),n<e.length?setTimeout(r,36):t&&setTimeout(t,200)};setTimeout(r,200)},clearApiKey:()=>y("")},()=>{window.__tryitDemo=null}},[a]);let w=()=>{c(!0),u(null),setTimeout(()=>{c(!1),u({status:e.response.status,statusLabel:e.response.statusLabel,body:e.response.body,ms:147+Math.floor(80*Math.random())})},800)};if(!a||!e)return null;let j=`var(--method-${e.method.toLowerCase()})`,k=`var(--method-${e.method.toLowerCase()}-bg)`,S=`https://docs.example.com${e.path}`,C=`curl ${S} \\
  -H "${"GET"!==e.method?"Content-Type: application/json":"Accept: application/json"}" \\
  -H "Authorization: Bearer ${h||"FERN_API_KEY"}"`,A=`const res = await fetch("${S}", {
  method: "${e.method}",
  headers: {
    "Authorization": \`Bearer \${process.env.FERN_API_KEY}\`,
    "Content-Type": "application/json",
  },
});
const data = await res.json();`,T=`import requests

res = requests.${e.method.toLowerCase()}(
    "${S}",
    headers={"Authorization": f"Bearer {FERN_API_KEY}"},
)
print(res.json())`;return(0,t.jsxs)("div",{style:{position:"absolute",inset:0,zIndex:90,display:"flex",flexDirection:"column",justifyContent:"flex-end",pointerEvents:"none"},children:[(0,t.jsx)("style",{children:`
        @keyframes tryitScrimIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tryitSlideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes tryitSpin { to { transform: rotate(360deg) } }
      `}),(0,t.jsx)("div",{onClick:s,style:{position:"absolute",inset:0,background:"color-mix(in srgb, var(--bg-page) 35%, transparent)",backdropFilter:"blur(1px)",animation:"tryitScrimIn 160ms ease-out",pointerEvents:"auto"}}),(0,t.jsxs)("div",{style:{position:"relative",height:"78%",minHeight:360,background:"var(--bg-surface)",borderTop:"1px solid var(--border)",boxShadow:"0 -12px 32px -12px rgba(0,0,0,0.18)",display:"flex",flexDirection:"column",animation:"tryitSlideUp 260ms cubic-bezier(0.32, 0.72, 0, 1)",pointerEvents:"auto"},children:[(0,t.jsx)("div",{style:{height:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,t.jsx)("div",{style:{width:34,height:3,borderRadius:2,background:"var(--border-strong)"}})}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"8px 16px 12px",borderBottom:"1px solid var(--border)",flexShrink:0},children:[(0,t.jsxs)("div",{style:{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:10,height:36,background:"var(--bg-subtle)",border:"1px solid var(--border)",borderRadius:8,padding:"0 12px"},children:[(0,t.jsx)("span",{style:{fontFamily:"var(--font-mono)",fontSize:11,fontWeight:700,letterSpacing:"0.04em",color:j,background:k,padding:"2px 7px",borderRadius:4},children:e.method}),(0,t.jsx)("span",{style:{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-secondary)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:S})]}),(0,t.jsx)("button",{onClick:w,disabled:d,"data-demo":"tryit-run",style:{height:36,padding:"0 16px",display:"inline-flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,color:"#ffffff",background:"var(--brand-fg)",border:"none",borderRadius:8,cursor:d?"wait":"pointer",fontFamily:"inherit",opacity:d?.7:1,whiteSpace:"nowrap"},children:d?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{style:{width:10,height:10,borderRadius:"50%",border:"2px solid #fff",borderTopColor:"transparent",animation:"tryitSpin 600ms linear infinite"}}),"Running…"]}):(0,t.jsxs)(t.Fragment,{children:["Send request",(0,t.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M22 2L11 13"}),(0,t.jsx)("path",{d:"M22 2L15 22 11 13 2 9 22 2z"})]})]})}),(0,t.jsx)("button",{onClick:s,style:{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",borderRadius:6,cursor:"pointer",color:"var(--fg-tertiary)",flexShrink:0},"aria-label":"Close",children:(0,t.jsx)(i.Icon,{name:"x",size:16})})]}),(0,t.jsxs)("div",{style:{flex:1,minHeight:0,display:"grid",gridTemplateColumns:"1.05fr 1fr",gap:16,padding:16,overflow:"hidden"},children:[(0,t.jsxs)("div",{style:{overflowY:"auto",paddingRight:4},children:[(l=(o=h.trim().length>0)?"var(--brand-fg)":"var(--method-del)",(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:`color-mix(in srgb, ${l} 8%, var(--bg-surface))`,border:`1px solid color-mix(in srgb, ${l} 25%, transparent)`,borderRadius:8,marginBottom:f?10:16,transition:"background 200ms ease, border-color 200ms ease"},children:[(0,t.jsx)("span",{style:{color:l,display:"flex",transition:"color 200ms ease"},children:(0,t.jsx)(i.Icon,{name:o?"check":"lock",size:13})}),(0,t.jsx)("span",{style:{flex:1,fontSize:13,color:"var(--fg-primary)",fontWeight:500},children:o?"Credentials set (FERN_API_KEY)":"Enter your credentials (FERN_API_KEY)"}),(0,t.jsx)("button",{onClick:()=>b(e=>!e),style:{background:"transparent",border:"none",fontSize:12,fontWeight:600,color:l,cursor:"pointer",fontFamily:"inherit",padding:"2px 6px",borderRadius:4,transition:"color 200ms ease"},children:"Edit"})]})),f&&(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:8,padding:14,marginBottom:18,background:"var(--bg-surface)"},children:[(0,t.jsx)("div",{style:{fontSize:11,fontWeight:600,letterSpacing:"0.02em",color:"var(--fg-secondary)",marginBottom:8,fontFamily:"var(--font-mono)"},children:"FERN_API_KEY"}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,height:34,border:"1px solid var(--border)",borderRadius:6,padding:"0 10px",background:"var(--bg-subtle)"},children:[(0,t.jsx)(i.Icon,{name:"lock",size:12,style:{color:"var(--fg-quaternary)"}}),(0,t.jsx)("input",{type:"password",value:h,onChange:e=>y(e.target.value),placeholder:"","data-demo":"tryit-apikey",style:{flex:1,border:"none",outline:"none",background:"transparent",color:"var(--fg-primary)",fontFamily:"var(--font-mono)",fontSize:13}})]}),(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14},children:[(0,t.jsx)("button",{onClick:()=>b(!1),style:{height:28,padding:"0 12px",fontSize:12,fontWeight:500,color:"var(--fg-secondary)",background:"transparent",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",fontFamily:"inherit"},children:"Close"}),(0,t.jsx)("button",{onClick:()=>{y(""),"authed"===x&&v("idle")},style:{height:28,padding:"0 12px",fontSize:12,fontWeight:500,color:"var(--fg-secondary)",background:"transparent",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",fontFamily:"inherit"},children:"Reset"}),(0,t.jsxs)("button",{onClick:"authed"===x?()=>{v("idle"),y("")}:()=>{"idle"===x&&(v("loading"),setTimeout(()=>{v("authed"),y("sk_live_demo_7a3f1c9b2e4d5a8f")},1100))},disabled:"loading"===x,"data-demo":"tryit-login",style:{height:28,padding:"authed"===x?"0 8px 0 4px":"0 14px",fontSize:12,fontWeight:600,color:"authed"===x?"var(--fg-primary)":"var(--accent-fg)",background:"authed"===x?"var(--bg-surface)":"var(--accent)",border:"authed"===x?"1px solid var(--border)":"1px solid var(--accent)",borderRadius:6,cursor:"loading"===x?"default":"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:6,minWidth:72,justifyContent:"center",transition:"padding 160ms ease, background 160ms ease, color 160ms ease, border-color 160ms ease"},title:"authed"===x?"Signed in as jordan@acme.dev — click to sign out":"Sign in with Fern",children:["idle"===x&&(0,t.jsx)(t.Fragment,{children:"Log in"}),"loading"===x&&(0,t.jsx)("span",{"aria-label":"Signing in",style:{display:"inline-block",width:12,height:12,border:"1.6px solid rgba(255,255,255,0.35)",borderTopColor:"var(--accent-fg)",borderRadius:"50%",animation:"fha-spin 600ms linear infinite"}}),"authed"===x&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{style:{width:20,height:20,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, #8b5cf6) 100%)",color:"var(--accent-fg)",fontSize:10,fontWeight:700,letterSpacing:"0.02em",flexShrink:0},children:"JE"}),(0,t.jsx)("span",{style:{fontSize:12,fontWeight:500,color:"var(--fg-primary)",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:"Jordan Ellis"})]})]})]})]}),(0,t.jsx)(Z,{children:"Headers"}),(0,t.jsx)(X,{label:"2 optional properties",hint:"ROLES, x-fern-host"}),"GET"!==e.method&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(Z,{style:{marginTop:20},children:"Body"}),(0,t.jsx)(X,{label:"Request body",hint:"JSON object"})]}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12,marginTop:22},children:[(0,t.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:6,height:28,padding:"0 10px",border:"1px solid var(--border)",borderRadius:6,fontSize:12,color:"var(--fg-secondary)",background:"var(--bg-surface)",cursor:"pointer"},children:["Example 1",(0,t.jsx)(i.Icon,{name:"chevronDown",size:11,style:{color:"var(--fg-tertiary)"}})]}),(0,t.jsx)("button",{style:{background:"transparent",border:"none",fontSize:12,color:"var(--fg-tertiary)",cursor:"pointer",fontFamily:"inherit"},children:"Clear form"})]})]}),(0,t.jsxs)("div",{style:{display:"grid",gridTemplateRows:"1fr 1fr",gap:12,minHeight:0},children:[(0,t.jsx)(ee,{label:"Request",tabs:["cURL","JavaScript","Python"],activeTab:{curl:"cURL",javascript:"JavaScript",python:"Python"}[g],onTabChange:e=>m({cURL:"curl",JavaScript:"javascript",Python:"python"}[e]),children:(0,t.jsxs)("pre",{style:{margin:0,padding:"12px 14px",fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-secondary)",lineHeight:1.6,whiteSpace:"pre",overflow:"auto",height:"100%"},children:[(0,t.jsx)("span",{style:{color:"var(--fg-quaternary)",userSelect:"none"},children:"$ "}),function(e){let n=[],r=0,i=0,a=(e,r)=>n.push((0,t.jsx)("span",{className:e,children:r},i++));for(;r<e.length;){let t=e[r];if('"'===t){let t=r+1;for(;t<e.length&&'"'!==e[t];)"\\"===e[t]&&t++,t++;a("shs",e.slice(r,t+1)),r=t+1}else if("-"===t&&(" "===e[r-1]||"\n"===e[r-1]||0===r)){let t=r;for(;t<e.length&&/[-A-Za-z]/.test(e[t]);)t++;a("shop",e.slice(r,t)),r=t}else if("$"===t)a("shc","$"),r++;else if(/[a-zA-Z]/.test(t)){let t=r;for(;t<e.length&&/[A-Za-z0-9_]/.test(e[t]);)t++;let i=e.slice(r,t);"curl"===i||"const"===i||"await"===i||"import"===i||"print"===i?a("shkw",i):n.push(i),r=t}else n.push(t),r++}return(0,t.jsx)("span",{className:"shblock",style:{display:"inline"},children:n})}("curl"===g?C:"javascript"===g?A:T)]})}),(0,t.jsxs)(ee,{label:"Response",children:[!p&&!d&&(0,t.jsx)("div",{style:{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,t.jsx)("button",{onClick:w,style:{height:36,padding:"0 18px",display:"inline-flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,color:"#ffffff",background:"var(--brand-fg)",border:"none",borderRadius:999,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 6px -1px color-mix(in srgb, var(--brand-fg) 35%, transparent)"},children:"Send request"})}),d&&(0,t.jsxs)("div",{style:{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,color:"var(--fg-tertiary)",fontSize:12},children:[(0,t.jsx)("div",{style:{width:12,height:12,borderRadius:"50%",border:"2px solid var(--fg-tertiary)",borderTopColor:"transparent",animation:"tryitSpin 600ms linear infinite"}}),"Sending request…"]}),p&&(0,t.jsxs)("div",{style:{padding:"12px 14px",height:"100%",overflow:"auto"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:8},children:[(0,t.jsx)("span",{style:{display:"inline-flex",alignItems:"center",padding:"2px 8px",height:20,borderRadius:5,fontFamily:"var(--font-mono)",fontSize:11,fontWeight:700,color:"var(--status-200)",background:"var(--status-200-bg)"},children:p.status}),(0,t.jsx)("span",{style:{fontSize:12,fontWeight:500,color:"var(--status-200)"},children:p.statusLabel}),(0,t.jsxs)("span",{style:{fontSize:11,color:"var(--fg-tertiary)",marginLeft:"auto"},children:[p.ms," ms"]})]}),(0,t.jsx)("pre",{style:{margin:0,fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-primary)",lineHeight:1.6,whiteSpace:"pre"},children:p.body})]})]})]})]})]})]})}function Z({children:e,style:n}){return(0,t.jsx)("div",{style:{fontSize:13,fontWeight:600,color:"var(--fg-primary)",marginBottom:10,...n},children:e})}function X({label:e,hint:n}){return(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",border:"1px solid var(--border)",borderRadius:8,background:"var(--bg-surface)",cursor:"pointer"},children:[(0,t.jsx)("span",{style:{fontSize:13,color:"var(--fg-primary)",fontWeight:500},children:e}),(0,t.jsx)("span",{style:{fontSize:11,color:"var(--fg-tertiary)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.04em"},children:n}),(0,t.jsx)("span",{style:{marginLeft:"auto",color:"var(--fg-quaternary)",display:"flex"},children:(0,t.jsx)(i.Icon,{name:"chevronDown",size:12})})]})}function ee({label:e,tabs:n,activeTab:r,onTabChange:i,children:a}){return(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:8,background:"var(--bg-surface)",display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",borderBottom:"1px solid var(--border)",flexShrink:0,background:"var(--bg-muted)"},children:[(0,t.jsx)("span",{style:{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--fg-tertiary)"},children:e}),n&&(0,t.jsx)("div",{style:{display:"flex",gap:2,marginLeft:"auto"},children:n.map(e=>(0,t.jsx)("button",{onClick:()=>i&&i(e),style:{padding:"3px 8px",fontSize:11,fontWeight:500,border:"none",borderRadius:4,cursor:"pointer",fontFamily:"inherit",background:e===r?"var(--accent-bg)":"transparent",color:e===r?"var(--brand-fg)":"var(--fg-tertiary)"},children:e},e))})]}),(0,t.jsx)("div",{style:{flex:1,minHeight:0,position:"relative"},children:a})]})}let et=[{title:"Create a run with streaming",crumbs:["API Reference","Runs","POST /v1/runs"],kind:"Endpoint"},{title:"Giving agents tools",crumbs:["Guides","Tool use","Overview"],kind:"Guide"},{title:"Semantic memory with pgvector",crumbs:["Guides","Memory","pgvector backend"],kind:"Guide"},{title:"List messages in a thread",crumbs:["API Reference","Threads","GET /v1/threads/{id}/messages"],kind:"Endpoint"},{title:"Evaluating agent trajectories",crumbs:["Guides","Evals","Trajectory scoring"],kind:"Guide"},{title:"Handling tool-call errors",crumbs:["Guides","Tool use","Error handling"],kind:"Guide"}],en=[{group:"Endpoints",items:[{title:"Create Agent",crumbs:["API Reference","REST","/v1/agents"],id:"create-agent",method:"POST"},{title:"Get Agent",crumbs:["API Reference","REST","/v1/agents/{agent_id}"],id:"get-agent",method:"GET"},{title:"List Agents",crumbs:["API Reference","REST","/v1/agents"],id:"list-agents",method:"GET"},{title:"Update Agent",crumbs:["API Reference","REST","/v1/agents/{agent_id}"],id:"update-agent",method:"PATCH"},{title:"Delete Agent",crumbs:["API Reference","REST","/v1/agents/{agent_id}"],id:"delete-agent",method:"DEL"},{title:"Create Run",crumbs:["API Reference","Runs","/v1/runs"],method:"POST"},{title:"Stream Run Events",crumbs:["API Reference","Runs","/v1/runs/{run_id}/events"],method:"GET"},{title:"Cancel Run",crumbs:["API Reference","Runs","/v1/runs/{run_id}/cancel"],method:"POST"},{title:"Submit Tool Outputs",crumbs:["API Reference","Runs","/v1/runs/{run_id}/tool_outputs"],method:"POST"},{title:"Create Message",crumbs:["API Reference","Threads","/v1/threads/{thread_id}/messages"],method:"POST"},{title:"List Messages",crumbs:["API Reference","Threads","/v1/threads/{thread_id}/messages"],method:"GET"},{title:"Upsert Memory",crumbs:["API Reference","Memory","/v1/agents/{agent_id}/memory"],method:"PUT"},{title:"Search Memory",crumbs:["API Reference","Memory","/v1/agents/{agent_id}/memory/search"],method:"POST"},{title:"Upload Knowledge File",crumbs:["API Reference","Knowledge","/v1/knowledge/files"],method:"POST"},{title:"Query Knowledge Base",crumbs:["API Reference","Knowledge","/v1/knowledge/query"],method:"POST"},{title:"Register Tool",crumbs:["API Reference","Tools","/v1/tools"],method:"POST"},{title:"Invoke Tool (dry run)",crumbs:["API Reference","Tools","/v1/tools/{tool_id}/invoke"],method:"POST"},{title:"Create Evaluation",crumbs:["API Reference","Evals","/v1/evals"],method:"POST"},{title:"Get Eval Results",crumbs:["API Reference","Evals","/v1/evals/{eval_id}/results"],method:"GET"},{title:"Create Webhook",crumbs:["API Reference","Webhooks","/v1/webhooks"],method:"POST"}]},{group:"Guides",items:[{title:"Build your first agent in 5 minutes",crumbs:["Guides","Quickstart"],kind:"Guide"},{title:"Planning loops & ReAct patterns",crumbs:["Guides","Agent design","Planning"],kind:"Guide"},{title:"Giving agents tools",crumbs:["Guides","Tool use","Overview"],kind:"Guide"},{title:"Parallel tool calls",crumbs:["Guides","Tool use","Advanced"],kind:"Guide"},{title:"Retrieval-augmented generation",crumbs:["Guides","Knowledge","RAG pipelines"],kind:"Guide"},{title:"Chunking strategies for long docs",crumbs:["Guides","Knowledge","Chunking"],kind:"Guide"},{title:"Long-term vs working memory",crumbs:["Guides","Memory","Concepts"],kind:"Guide"},{title:"Streaming responses over SSE",crumbs:["Guides","Runs","Streaming"],kind:"Guide"},{title:"Multi-agent orchestration",crumbs:["Guides","Advanced","Swarms"],kind:"Guide"},{title:"Guardrails & output validation",crumbs:["Guides","Safety","Guardrails"],kind:"Guide"},{title:"Prompt injection defenses",crumbs:["Guides","Safety","Attacks"],kind:"Guide"},{title:"Evaluating agent trajectories",crumbs:["Guides","Evals","Trajectory scoring"],kind:"Guide"},{title:"Cost & token accounting",crumbs:["Guides","Observability","Usage"],kind:"Guide"},{title:"Tracing with OpenTelemetry",crumbs:["Guides","Observability","Tracing"],kind:"Guide"},{title:"Webhook signature verification",crumbs:["Guides","Webhooks","Security"],kind:"Guide"},{title:"Rate limits & backoff",crumbs:["Guides","Platform","Rate limits"],kind:"Guide"}]},{group:"SDKs",items:[{title:"Python SDK — Runs",crumbs:["SDKs","Python","Runs reference"],kind:"SDK"},{title:"TypeScript SDK — Agents",crumbs:["SDKs","TypeScript","Agents reference"],kind:"SDK"},{title:"Go SDK — Streaming",crumbs:["SDKs","Go","Stream helpers"],kind:"SDK"}]}];function er({label:e}){return(0,t.jsxs)("button",{style:{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 10px 5px 12px",height:28,borderRadius:999,border:"1px solid var(--border)",background:"var(--bg-surface)",fontSize:12,fontWeight:500,color:"var(--fg-secondary)",cursor:"pointer",fontFamily:"inherit",transition:"background 120ms, border-color 120ms"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-subtle)",onMouseLeave:e=>e.currentTarget.style.background="var(--bg-surface)",children:[(0,t.jsx)("span",{children:e}),(0,t.jsx)(i.Icon,{name:"chevronDown",size:11,style:{color:"var(--fg-tertiary)"}})]})}function ei({parts:e}){return(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",flexWrap:"wrap",gap:0,fontSize:11,color:"var(--fg-tertiary)",lineHeight:1.4},children:e.map((r,i)=>(0,t.jsxs)(n.Fragment,{children:[(0,t.jsx)("span",{style:{color:0===i?"var(--brand-fg)":"var(--fg-tertiary)",fontWeight:0===i?600:400},children:r}),i<e.length-1&&(0,t.jsx)("span",{style:{margin:"0 7px",color:"var(--fg-quaternary)",fontSize:10},children:"›"})]},i))})}function ea({icon:e,title:r,crumbs:i,kindLabel:a,onClick:s,demoId:o}){let[l,d]=n.useState(!1);return(0,t.jsxs)("button",{onClick:s,"data-demo":o,onMouseEnter:()=>d(!0),onMouseLeave:()=>d(!1),style:{width:"100%",display:"grid",gridTemplateColumns:"28px 1fr auto",alignItems:"center",gap:10,padding:"10px 14px",background:l?"var(--bg-hover)":"transparent",border:"none",borderRadius:8,cursor:"pointer",fontFamily:"inherit",textAlign:"left"},children:[(0,t.jsx)("div",{style:{width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--fg-tertiary)"},children:e}),(0,t.jsxs)("div",{style:{minWidth:0},children:[(0,t.jsx)("div",{style:{fontSize:14,fontWeight:500,color:"var(--fg-primary)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:r}),(0,t.jsx)(ei,{parts:i})]}),(0,t.jsx)("div",{style:{fontSize:12,color:"var(--fg-tertiary)",fontWeight:400},children:a})]})}function es({open:e,onClose:r,onSelect:a,onAskAI:s}){let[o,l]=n.useState(""),d=n.useRef(null),c=n.useRef(o);if(c.current=o,n.useEffect(()=>{e?setTimeout(()=>d.current?.focus(),50):l("")},[e]),n.useEffect(()=>{if(!e){window.__searchDemo=null;return}return window.__searchDemo={type:(e,t)=>{let n=0,r=()=>{n++,l(e.slice(0,n)),n<e.length?setTimeout(r,32):t&&setTimeout(t,150)};r()},askAI:()=>{let e=c.current.trim()||null;r?.(),s?.(e)}},()=>{window.__searchDemo=null}},[e,s,r]),!e)return null;let p=o.trim().toLowerCase(),u=p?en.map(e=>({...e,items:e.items.filter(e=>(e.title+" "+e.crumbs.join(" ")).toLowerCase().includes(p))})).filter(e=>e.items.length>0):null,g=(0,t.jsx)(i.Icon,{name:"history",size:16}),m=(0,t.jsx)(i.Icon,{name:"zap",size:15}),h=(0,t.jsx)(i.Icon,{name:"book",size:15});return(0,t.jsxs)("div",{style:{position:"absolute",inset:0,zIndex:100,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:64},children:[(0,t.jsx)("div",{onClick:r,style:{position:"absolute",inset:0,background:"var(--scrim)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",animation:"fha-scrimIn 160ms ease-out"}}),(0,t.jsxs)("div",{style:{position:"relative",width:560,maxHeight:"calc(100% - 96px)",background:"var(--search-bg)",border:"1px solid var(--border)",borderRadius:14,boxShadow:"0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04) inset",display:"flex",flexDirection:"column",overflow:"hidden",backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)",animation:"fha-modalIn 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"8px 10px 8px 8px"},children:[(0,t.jsx)("button",{onClick:r,style:{width:30,height:30,borderRadius:8,border:"1px solid var(--border)",background:"var(--bg-surface)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--fg-secondary)"},children:(0,t.jsx)(i.Icon,{name:"arrowLeft",size:14})}),(0,t.jsx)("input",{ref:d,value:o,onChange:e=>l(e.target.value),placeholder:"Search","data-demo":"search-input",style:{flex:1,background:"transparent",border:"none",outline:"none",fontSize:18,fontWeight:400,padding:"0 4px",color:"var(--fg-primary)",fontFamily:"inherit",height:30}}),(0,t.jsx)("kbd",{style:{fontSize:11,fontFamily:"inherit",fontWeight:500,padding:"4px 10px",borderRadius:8,background:"var(--bg-surface)",border:"1px solid var(--border)",color:"var(--fg-tertiary)",letterSpacing:"0.02em"},children:"Esc"})]}),(0,t.jsxs)("div",{style:{display:"flex",gap:8,padding:"4px 14px 12px",borderBottom:"1px solid var(--border)"},children:[(0,t.jsx)(er,{label:"Product"}),(0,t.jsx)(er,{label:"Content type"}),(0,t.jsx)(er,{label:"HTTP method"})]}),(0,t.jsx)("div",{style:{padding:"10px 10px 8px"},children:(0,t.jsxs)("button",{"data-demo":"search-ask-ai",onClick:()=>{let e=o.trim()||null;r?.(),s?.(e)},style:{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:"1px solid var(--accent-border)",background:"var(--accent-bg)",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 120ms"},onMouseEnter:e=>e.currentTarget.style.background="var(--accent-bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="var(--accent-bg)",children:[(0,t.jsx)("div",{style:{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--brand-fg)"},children:(0,t.jsx)(i.Icon,{name:"sparkles",size:18})}),(0,t.jsx)("div",{style:{flex:1,minWidth:0},children:(0,t.jsx)("div",{style:{fontSize:14,fontWeight:500,color:"var(--brand-fg)"},children:p?`Ask AI: "${o}"`:"Ask AI"})}),(0,t.jsx)(i.Icon,{name:"arrowRight",size:14,style:{color:"var(--brand-fg)",opacity:.6}})]})}),(0,t.jsx)("div",{style:{overflowY:"auto",padding:"0 6px 10px",flex:1},children:u?0===u.length?(0,t.jsxs)("div",{style:{padding:"40px 20px",textAlign:"center",color:"var(--fg-tertiary)",fontSize:13},children:['No results for "',o,'". Try Ask AI above.']}):u.map((e,n)=>(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{style:{padding:"12px 14px 4px",fontSize:11,fontWeight:600,color:"var(--fg-tertiary)",letterSpacing:"0.02em"},children:e.group}),e.items.map((n,i)=>(0,t.jsx)(ea,{icon:"Endpoints"===e.group?m:h,title:n.title,crumbs:n.crumbs,kindLabel:"Endpoints"===e.group?n.method:n.kind,demoId:`search-result-${n.id||i}`,onClick:()=>{n.id&&a(n.id),r()}},i))]},n)):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{style:{padding:"12px 14px 4px",fontSize:11,fontWeight:600,color:"var(--fg-tertiary)",letterSpacing:"0.02em"},children:"Recent"}),et.map((e,n)=>(0,t.jsx)(ea,{icon:g,title:e.title,crumbs:e.crumbs,kindLabel:e.kind,demoId:`search-recent-${n}`,onClick:r},n))]})})]})]})}let eo=["How do I stream a run?","What's the difference between memory and knowledge?","Show me a Python example that creates an agent with tools","How do I verify webhook signatures?"],el=[{title:"Create Agent",crumbs:["API Reference","Agents"],endpointId:"create-agent"},{title:"Streaming responses over SSE",crumbs:["Guides","Runs","Streaming"],endpointId:"get-agent"},{title:"Giving agents tools",crumbs:["Guides","Tool use"],endpointId:"list-agents"}];function ed({text:e}){let n=[],r=e.split("\n"),i=0;for(;i<r.length;)if(r[i].startsWith("```")){let e=r[i].slice(3);i++;let t=[];for(;i<r.length&&!r[i].startsWith("```");)t.push(r[i]),i++;i++,n.push({type:"code",lang:e,body:t.join("\n")})}else if(""===r[i])i++;else{let e=[];for(;i<r.length&&""!==r[i]&&!r[i].startsWith("```");)e.push(r[i]),i++;n.push({type:"p",body:e.join("\n")})}return(0,t.jsx)("div",{style:{fontSize:13.5,lineHeight:1.6,color:"var(--fg-secondary)"},children:n.map((e,n)=>{if("p"===e.type)return(0,t.jsx)("p",{style:{margin:"0 0 10px"},dangerouslySetInnerHTML:{__html:e.body.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/`([^`]+)`/g,'<code style="font-family:var(--font-mono);font-size:0.88em;padding:1px 5px;border-radius:4px;background:var(--bg-hover);color:var(--fg-primary);">$1</code>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" style="color:var(--brand-fg);text-decoration:none;border-bottom:1px solid color-mix(in srgb,var(--brand-fg) 30%,transparent);">$1</a>')}},n);return(0,t.jsx)("pre",{style:{margin:"0 0 10px",background:"var(--bg-subtle)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",overflow:"auto",fontFamily:"var(--font-mono)",fontSize:12,lineHeight:1.55,color:"var(--fg-primary)",whiteSpace:"pre"},children:e.body},n)})})}function ec({onPick:e}){return(0,t.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:8,padding:6},children:eo.map((n,r)=>(0,t.jsx)("button",{onClick:()=>e(n),style:{textAlign:"left",padding:"10px 12px",fontSize:13,color:"var(--fg-secondary)",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,cursor:"pointer",fontFamily:"inherit",lineHeight:1.4,transition:"background 120ms, border-color 120ms"},onMouseEnter:e=>{e.currentTarget.style.background="var(--bg-subtle)",e.currentTarget.style.borderColor="var(--border-strong)"},onMouseLeave:e=>{e.currentTarget.style.background="var(--bg-surface)",e.currentTarget.style.borderColor="var(--border)"},children:(0,t.jsxs)("div",{style:{display:"flex",alignItems:"flex-start",gap:8},children:[(0,t.jsx)("span",{style:{color:"var(--fg-tertiary)",flexShrink:0,marginTop:1},children:(0,t.jsx)(i.Icon,{name:"lightbulb",size:13})}),(0,t.jsx)("span",{children:n})]})},r))})}function ep({message:e,onSelectSource:n}){return"user"===e.role?(0,t.jsx)("div",{style:{display:"flex",justifyContent:"flex-end",margin:"0 0 14px"},children:(0,t.jsx)("div",{style:{maxWidth:"85%",padding:"9px 13px",fontSize:13.5,lineHeight:1.5,background:"var(--fg-primary)",color:"var(--bg-surface)",borderRadius:"14px 14px 4px 14px"},children:e.content})}):(0,t.jsxs)("div",{style:{display:"flex",gap:10,margin:"0 0 18px",alignItems:"flex-start"},children:[(0,t.jsx)("div",{style:{width:24,height:24,borderRadius:6,background:"var(--accent-bg)",color:"var(--brand-fg)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1},children:(0,t.jsx)(i.Icon,{name:"sparkles",size:13})}),(0,t.jsxs)("div",{style:{flex:1,minWidth:0},children:[e.streaming&&""===e.content?(0,t.jsx)("div",{style:{display:"flex",gap:4,padding:"8px 0"},children:[0,1,2].map(e=>(0,t.jsx)("span",{style:{width:6,height:6,borderRadius:"50%",background:"var(--fg-quaternary)",animation:`bounce 1.2s ${.15*e}s infinite ease-in-out`}},e))}):(0,t.jsx)(ed,{text:e.content}),!e.streaming&&e.sources&&e.sources.length>0&&(0,t.jsxs)("div",{style:{marginTop:12},children:[(0,t.jsx)("div",{style:{fontSize:11,fontWeight:600,color:"var(--fg-tertiary)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:6},children:"Sources"}),(0,t.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:4},children:e.sources.map((e,r)=>(0,t.jsxs)("a",{href:"#","data-demo":0===r?"assistant-source-0":void 0,onClick:t=>{t.preventDefault(),n?.(e)},style:{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",fontSize:12,color:"var(--fg-secondary)",background:"transparent",borderRadius:6,textDecoration:"none",cursor:"pointer"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:[(0,t.jsx)(i.Icon,{name:"book",size:12,style:{color:"var(--fg-tertiary)",flexShrink:0}}),(0,t.jsx)("span",{style:{fontWeight:500,color:"var(--fg-primary)"},children:e.title}),(0,t.jsx)("span",{style:{color:"var(--fg-quaternary)"},children:"·"}),(0,t.jsx)("span",{style:{color:"var(--fg-tertiary)",fontSize:11},children:e.crumbs.join(" › ")})]},r))})]})]})]})}function eu({open:e,onClose:r,external:a,onSelectSource:s}){let[o,l]=n.useState([]),[d,c]=n.useState(""),[p,u]=n.useState(!1),g=n.useRef(null),m=n.useRef(null),h=n.useRef(null);n.useEffect(()=>{g.current&&(g.current.scrollTop=g.current.scrollHeight)},[o]),n.useEffect(()=>{e&&setTimeout(()=>m.current?.focus(),300)},[e]);let y=e=>{let t=(e??d).trim();if(t&&!p){let e,n,r;l(e=>[...e,{role:"user",content:t}]),c(""),u(!0),l(e=>[...e,{role:"assistant",content:"",streaming:!0}]),e='Great question! You can register an agent with tools and stream its run in three steps:\n\n**1. Register each tool** with `POST /v1/tools` — pass a name, description, and a JSON-Schema `parameters` object. Fern uses these schemas to prompt the model for well-formed calls.\n\n**2. Create the agent** with `POST /v1/agents`, setting `tools: [tool_id, …]`. You can also attach a knowledge base and a system prompt here.\n\n**3. Create a streaming run** with `POST /v1/runs` and `stream: true`. The response is an SSE stream of `message.delta`, `tool.call`, and `run.completed` events.\n\nHere\'s a minimal TypeScript example:\n```ts\nconst run = await fern.runs.createStream({\n  agent_id: agent.id,\n  input: "Summarize the latest PR and draft a release note.",\n});\nfor await (const event of run) {\n  if (event.type === "message.delta") process.stdout.write(event.delta);\n  if (event.type === "tool.call")     console.log("→", event.name, event.args);\n}\n```\n\nSee [Streaming responses over SSE](#) and [Giving agents tools](#) for more.'.match(/.{1,14}/gs)||['Great question! You can register an agent with tools and stream its run in three steps:\n\n**1. Register each tool** with `POST /v1/tools` — pass a name, description, and a JSON-Schema `parameters` object. Fern uses these schemas to prompt the model for well-formed calls.\n\n**2. Create the agent** with `POST /v1/agents`, setting `tools: [tool_id, …]`. You can also attach a knowledge base and a system prompt here.\n\n**3. Create a streaming run** with `POST /v1/runs` and `stream: true`. The response is an SSE stream of `message.delta`, `tool.call`, and `run.completed` events.\n\nHere\'s a minimal TypeScript example:\n```ts\nconst run = await fern.runs.createStream({\n  agent_id: agent.id,\n  input: "Summarize the latest PR and draft a release note.",\n});\nfor await (const event of run) {\n  if (event.type === "message.delta") process.stdout.write(event.delta);\n  if (event.type === "tool.call")     console.log("→", event.name, event.args);\n}\n```\n\nSee [Streaming responses over SSE](#) and [Giving agents tools](#) for more.'],n=0,setTimeout(r=()=>{if(++n>e.length){l(e=>{let t=[...e],n=t[t.length-1];return t[t.length-1]={...n,streaming:!1,sources:el},t}),u(!1);return}l(t=>{let r=[...t],i=r[r.length-1];return r[r.length-1]={...i,content:e.slice(0,n).join("")},r}),setTimeout(r,24)},450)}};if(n.useEffect(()=>{if(!e){h.current=null;return}a&&a!==h.current&&(h.current=a,0!==o.length||p||setTimeout(()=>y(a),250))},[e,a]),n.useEffect(()=>{window.__assistantDemo={typeAndSend:e=>{let t=0,n=()=>{t++,c(e.slice(0,t)),t<e.length?setTimeout(n,28):setTimeout(()=>y(e),320)};n()},reset:()=>{l([]),c(""),h.current=null}}},[p,d]),!e)return null;let f=o.length>0;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{onClick:r,style:{position:"absolute",inset:0,zIndex:95,background:"rgba(0,0,0,0.12)",animation:"fha-fadeIn 160ms ease-out"}}),(0,t.jsxs)("div",{style:{position:"absolute",top:0,right:0,bottom:0,width:440,maxWidth:"90%",zIndex:96,background:"var(--bg-surface)",borderLeft:"1px solid var(--border)",boxShadow:"-20px 0 50px -12px rgba(0,0,0,0.18)",display:"flex",flexDirection:"column",animation:"slideInRight 220ms cubic-bezier(0.2, 0.9, 0.3, 1.1)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",padding:"16px",gap:8},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0},children:[(0,t.jsx)("span",{style:{color:"var(--brand-fg)",display:"inline-flex"},children:(0,t.jsx)(i.Icon,{name:"sparkles",size:17})}),(0,t.jsx)("span",{style:{fontSize:16,fontWeight:700,color:"var(--fg-primary)",letterSpacing:"-0.005em"},children:"Assistant"})]}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:4},children:[(0,t.jsx)("button",{title:"Recent chats",style:{width:24,height:24,borderRadius:8,border:"none",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--fg-tertiary)"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:(0,t.jsx)(i.Icon,{name:"sparkles",size:14})}),(0,t.jsx)("button",{title:"New chat",onClick:()=>{l([]),c("")},style:{width:24,height:24,borderRadius:8,border:"none",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--fg-tertiary)"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:(0,t.jsx)(i.Icon,{name:"pencil",size:13})}),(0,t.jsx)("button",{onClick:r,"data-demo":"assistant-close",title:"Close",style:{width:24,height:24,borderRadius:8,border:"none",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--fg-tertiary)"},onMouseEnter:e=>e.currentTarget.style.background="var(--bg-hover)",onMouseLeave:e=>e.currentTarget.style.background="transparent",children:(0,t.jsx)(i.Icon,{name:"x",size:14})})]})]}),(0,t.jsx)("div",{ref:g,style:{flex:1,overflowY:"auto",padding:"18px 16px 16px"},children:f?o.map((e,n)=>(0,t.jsx)(ep,{message:e,onSelectSource:s},n)):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{style:{padding:"8px 6px 16px",fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:"Hi! Ask me anything about the your-co Agents API. I'll search the docs and answer with citations."}),a&&(0,t.jsxs)("div",{style:{margin:"0 6px 12px",padding:"10px 12px",fontSize:12,lineHeight:1.5,background:"var(--accent-bg)",border:"1px solid var(--accent-border)",borderRadius:8,color:"var(--brand-fg)"},children:[(0,t.jsx)("strong",{children:"Context attached:"})," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)"},children:a})]}),(0,t.jsx)(ec,{onPick:e=>y(e)})]})}),(0,t.jsx)("div",{style:{padding:16,background:"var(--bg-surface)"},children:(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:16,background:"var(--bg-surface)",overflow:"hidden"},children:[(0,t.jsx)("div",{style:{padding:"12px 12px 4px"},children:(0,t.jsx)("textarea",{ref:m,rows:1,value:d,onChange:e=>c(e.target.value),onKeyDown:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),y())},placeholder:"Ask AI a question...","data-demo":"assistant-input",style:{width:"100%",background:"transparent",border:"none",outline:"none",resize:"none",fontFamily:"inherit",fontSize:15,lineHeight:"18px",color:"var(--fg-primary)",maxHeight:120,minHeight:18,padding:0,display:"block"}})}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 12px 12px",gap:8},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:4},children:[(0,t.jsxs)("button",{style:{display:"inline-flex",alignItems:"center",gap:4,height:20,padding:"0 6px",fontSize:12,fontWeight:700,fontFamily:"inherit",color:"var(--fg-tertiary)",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:4,cursor:"pointer"},children:["Guides",(0,t.jsx)(i.Icon,{name:"chevronDown",size:10})]}),(0,t.jsx)("button",{title:"Add filter",style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:20,color:"var(--fg-tertiary)",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:4,cursor:"pointer",padding:0},children:(0,t.jsx)(i.Icon,{name:"plus",size:11})})]}),(0,t.jsx)("button",{onClick:()=>y(),disabled:!d.trim()||p,"data-demo":"assistant-send",title:"Send",style:{width:32,height:32,borderRadius:8,background:"var(--brand-fg)",color:"#fff",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:d.trim()&&!p?"pointer":"not-allowed",flexShrink:0,opacity:d.trim()&&!p?1:.5,transition:"opacity 120ms",padding:0},children:(0,t.jsx)(i.Icon,{name:"arrowUp",size:14,stroke:2.2})})]})]})})]}),(0,t.jsx)("style",{children:`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `})]})}function eg({light:e,dark:r,glyph:i}){let a=function(){let[e,t]=n.useState("light");return n.useEffect(()=>{let e=document.documentElement,n=()=>e.classList.contains("dark")?"dark":"light";t(n());let r=new MutationObserver(()=>t(n()));return r.observe(e,{attributes:!0,attributeFilter:["class"]}),()=>r.disconnect()},[]),e}(),s="dark"===a?r:e,o=n.useId().replace(/:/g,""),l=`mesh-blur-${o}`,d=`mesh-grain-${o}`;return(0,t.jsxs)("svg",{viewBox:"0 0 320 180",width:"100%",height:"100%",preserveAspectRatio:"xMidYMid slice",style:{display:"block"},xmlns:"http://www.w3.org/2000/svg",children:[(0,t.jsxs)("defs",{children:[(0,t.jsx)("filter",{id:l,x:"-50%",y:"-50%",width:"200%",height:"200%",children:(0,t.jsx)("feGaussianBlur",{stdDeviation:"36"})}),(0,t.jsxs)("filter",{id:d,x:"0",y:"0",width:"100%",height:"100%",children:[(0,t.jsx)("feTurbulence",{type:"fractalNoise",baseFrequency:"0.9",numOctaves:"2",stitchTiles:"stitch"}),(0,t.jsx)("feColorMatrix",{type:"matrix",values:"0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.5 0.5 0.5 0 0"})]})]}),(0,t.jsx)("rect",{width:"320",height:"180",fill:s.baseColor}),(0,t.jsx)("g",{filter:`url(#${l})`,opacity:"dark"===a?.55:.5,children:s.blobs.map((e,n)=>(0,t.jsx)("circle",{cx:e.x,cy:e.y,r:e.r,fill:e.color,opacity:e.opacity??.9},n))}),(0,t.jsx)("rect",{width:"320",height:"180",filter:`url(#${d})`,style:{mixBlendMode:"overlay",opacity:"dark"===a?.35:.55}}),i&&(0,t.jsx)("g",{opacity:"dark"===a?.5:.55,children:i})]})}let em="var(--brand-fg)";function eh(){let e=`dots-${n.useId().replace(/:/g,"")}`;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("defs",{children:(0,t.jsx)("pattern",{id:e,x:"0",y:"0",width:10,height:10,patternUnits:"userSpaceOnUse",children:(0,t.jsx)("circle",{cx:5,cy:5,r:.9,fill:"#ffffff",fillOpacity:.65})})}),(0,t.jsx)("rect",{x:"0",y:"0",width:"320",height:"180",fill:`url(#${e})`})]})}function ey({href:e,opacity:n}){return(0,t.jsx)("foreignObject",{x:"0",y:"0",width:"320",height:"180",children:(0,t.jsx)("img",{xmlns:"http://www.w3.org/1999/xhtml",src:e,alt:"",style:{width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:n}})})}function ef(){return(0,t.jsx)(ey,{href:"/api-reference-arrows.svg",opacity:.55})}function eb(){return(0,t.jsx)(ey,{href:"/sdks-pattern.svg"})}function ex(){return(0,t.jsx)(eg,{glyph:(0,t.jsx)(eh,{}),light:{baseColor:"#eef3ea",blobs:[{x:50,y:40,r:90,color:em,opacity:.75},{x:260,y:30,r:80,color:"#d4b890",opacity:.7},{x:280,y:150,r:110,color:em,opacity:.55},{x:130,y:160,r:90,color:em,opacity:.4}]},dark:{baseColor:"#131e15",blobs:[{x:50,y:40,r:90,color:em,opacity:.7},{x:260,y:30,r:80,color:"#7a6238",opacity:.65},{x:280,y:150,r:110,color:em,opacity:.55},{x:130,y:160,r:90,color:em,opacity:.35}]}})}function ev(){return(0,t.jsx)(eg,{glyph:(0,t.jsx)(ef,{}),light:{baseColor:"#e9f1ec",blobs:[{x:60,y:140,r:100,color:em,opacity:.75},{x:270,y:50,r:90,color:"#87bab2",opacity:.7},{x:180,y:90,r:80,color:em,opacity:.55},{x:90,y:30,r:70,color:em,opacity:.35}]},dark:{baseColor:"#0c1e1c",blobs:[{x:60,y:140,r:100,color:em,opacity:.7},{x:270,y:50,r:90,color:"#2e7068",opacity:.7},{x:180,y:90,r:80,color:em,opacity:.55},{x:90,y:30,r:70,color:em,opacity:.35}]}})}function ew(){return(0,t.jsx)(eg,{glyph:(0,t.jsx)(eb,{}),light:{baseColor:"#e6f1e9",blobs:[{x:50,y:150,r:100,color:em,opacity:.85},{x:270,y:40,r:90,color:"#6fa389",opacity:.75},{x:170,y:100,r:80,color:em,opacity:.65},{x:290,y:150,r:70,color:em,opacity:.5}]},dark:{baseColor:"#0a1c12",blobs:[{x:50,y:150,r:100,color:em,opacity:.8},{x:270,y:40,r:90,color:"#4d8a72",opacity:.75},{x:170,y:100,r:80,color:em,opacity:.6},{x:290,y:150,r:70,color:em,opacity:.45}]}})}function ej(){let e=new Map([[21,1,"0s"],[24,4,"1.4s"],[18,0,"2.6s"],[22,7,"0.7s"],[19,5,"3.2s"],[25,2,"2.0s"],[14,3,"1.0s"],[11,6,"2.2s"],[16,8,"3.6s"]].map(([e,t,n])=>[`${e},${t}`,n]));return(0,t.jsx)("svg",{width:768,height:352,viewBox:"0 0 768 352","aria-hidden":"true",style:{position:"absolute",top:0,right:0,zIndex:0,pointerEvents:"none",WebkitMaskImage:"radial-gradient(ellipse 100% 95% at 100% 0%, black 11%, transparent 74%)",maskImage:"radial-gradient(ellipse 100% 95% at 100% 0%, black 11%, transparent 74%)"},children:Array.from({length:11}).flatMap((n,r)=>Array.from({length:24}).map((n,i)=>{let a=`${i},${r}`,s=e.get(a);return(0,t.jsx)("rect",{x:32*i,y:32*r,width:32,height:32,fill:s?"var(--brand-fg)":"transparent",stroke:"var(--border)",strokeWidth:"1",style:s?{opacity:0,animation:"fha-grid-pulse 5s ease-in-out infinite",animationDelay:s}:void 0},a)}))})}let ek=[{id:"quickstart",eyebrow:"Get started",title:"Get started",body:"Make your first request in under a minute.",meta:"2 min read",art:()=>(0,t.jsx)(ex,{}),targetTab:"docs"},{id:"api-reference",eyebrow:"Reference",title:"API Reference",body:"Every endpoint, schema, and example.",meta:"Browse",art:()=>(0,t.jsx)(ev,{}),targetTab:"api"},{id:"sdks",eyebrow:"Build",title:"SDKs",body:"Type-safe clients in every major language.",meta:"6 langs",art:()=>(0,t.jsx)(ew,{}),targetTab:"sdks"}];function eS({tile:e,onSelect:r}){let[i,a]=n.useState(!1);return(0,t.jsxs)("a",{href:"#","data-demo":`welcome-tile-${e.id}`,onClick:t=>{t.preventDefault(),r?.(e)},onMouseEnter:()=>a(!0),onMouseLeave:()=>a(!1),style:{display:"flex",flexDirection:"column",textDecoration:"none",color:"inherit",borderRadius:14,border:"1px solid var(--border)",background:"var(--bg-surface)",overflow:"hidden",transition:"border-color 140ms, transform 140ms, box-shadow 140ms",borderColor:i?"var(--border-strong)":"var(--border)",transform:i?"translateY(-1px)":"translateY(0)",boxShadow:i?"var(--shadow-md)":"var(--shadow-sm)"},children:[(0,t.jsx)("div",{style:{position:"relative",background:"var(--bg-subtle)",borderBottom:"1px solid var(--border)",height:140,flexShrink:0,color:"var(--fg-secondary)",overflow:"hidden"},children:e.art()}),(0,t.jsxs)("div",{style:{padding:"16px 18px 18px",flex:1,display:"flex",flexDirection:"column",gap:6},children:[(0,t.jsx)("div",{style:{fontSize:15,fontWeight:600,letterSpacing:"-0.01em",color:"var(--fg-primary)"},children:e.title}),(0,t.jsx)("div",{style:{fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:e.body})]})]})}function eC({onQuickstart:e,onApiReference:n}){return(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:10,padding:"8px 0 24px",marginBottom:24},children:[(0,t.jsx)("div",{style:{fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--brand-fg)"},children:"Overview"}),(0,t.jsx)("h1",{style:{margin:0,fontSize:38,fontWeight:700,letterSpacing:"-0.025em",color:"var(--fg-primary)"},children:"Your Company's documentation"}),(0,t.jsx)("p",{style:{margin:0,maxWidth:640,fontSize:15,lineHeight:1.6,color:"var(--fg-secondary)"},children:"Everything developers need to build with Your Company's API — guides, a full reference, SDKs in every major language, and a sandbox you can hit from this page."})]})}function eA({onTileSelect:e,onApiReference:n}){return(0,t.jsxs)("div",{style:{position:"relative",overflow:"hidden"},children:[(0,t.jsx)(ej,{}),(0,t.jsxs)("div",{style:{position:"relative",zIndex:1,padding:"32px 32px 64px",maxWidth:1100,margin:"0 auto"},children:[(0,t.jsx)(eC,{onQuickstart:()=>e?.({id:"quickstart",targetTab:"docs"}),onApiReference:n}),(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:16},children:ek.map(n=>(0,t.jsx)(eS,{tile:n,onSelect:e},n.id))})]})]})}function eT({entries:e,title:r="On this page"}){let[i,a]=n.useState(e[0]?.id),s=n.useRef(null),o=n.useRef(0),l=n.useCallback(e=>{let t=e?.parentElement;for(;t;){let{overflowY:e}=getComputedStyle(t);if(("auto"===e||"scroll"===e)&&t.scrollHeight>t.clientHeight)return t;t=t.parentElement}return null},[]);return n.useEffect(()=>{let t=l(s.current);if(!t)return;let n=()=>{if(performance.now()<o.current)return;let n=t.getBoundingClientRect().top+.25*t.clientHeight,r=e[0]?.id;for(let i of e){let e=t.querySelector(`#${CSS.escape(i.id)}`);if(e)if(e.getBoundingClientRect().top-n<=0)r=i.id;else break}t.scrollTop+t.clientHeight>=t.scrollHeight-4&&(r=e[e.length-1].id),a(e=>e===r?e:r)};n();let r=0,i=()=>{r||(r=requestAnimationFrame(()=>{r=0,n()}))};return t.addEventListener("scroll",i,{passive:!0}),window.addEventListener("resize",i),()=>{t.removeEventListener("scroll",i),window.removeEventListener("resize",i),r&&cancelAnimationFrame(r)}},[l,e]),(0,t.jsxs)("aside",{ref:s,className:"fha-toc",style:{width:220,flexShrink:0,padding:"32px 24px 32px 0",position:"sticky",top:0,alignSelf:"flex-start",maxHeight:"100%",overflowY:"auto"},children:[(0,t.jsx)("div",{style:{fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"var(--fg-tertiary)",marginBottom:12},children:r}),(0,t.jsx)("nav",{style:{display:"flex",flexDirection:"column",borderLeft:"2px solid var(--border)"},children:e.map(e=>{let n=i===e.id;return(0,t.jsx)("a",{href:`#${e.id}`,onClick:t=>((e,t)=>{e.preventDefault();let n=l(s.current),r=n?.querySelector(`#${CSS.escape(t)}`);if(!n||!r)return;let i=n.getBoundingClientRect(),d=r.getBoundingClientRect(),c=n.scrollTop+(d.top-i.top)-24;a(t),o.current=performance.now()+600,n.scrollTo({top:c,behavior:"smooth"})})(t,e.id),style:{padding:"6px 0 6px 14px",marginLeft:-2,borderLeft:`2px solid ${n?"var(--fg-primary)":"transparent"}`,fontSize:12.5,color:n?"var(--fg-primary)":"var(--fg-tertiary)",textDecoration:"none",transition:"color 120ms, border-color 120ms",fontWeight:n?500:400},children:e.label},e.id)})})]})}let eI={typescript:`npm install @your-co/agents
# or: pnpm add @your-co/agents / yarn add @your-co/agents`,python:`pip install your-co-agents
# requires Python 3.9+`,curl:`# cURL is built into macOS and most Linux distros.
# Verify: curl --version`},e_={typescript:`import { Agents } from "@your-co/agents";

const client = new Agents({
  apiKey: process.env.YOUR_CO_API_KEY,
});

const run = await client.agents.run({
  agent: "support-triage",
  input: "My order #A-1042 hasn't shipped yet.",
});

console.log(run.output);`,python:`from your_co import Agents

client = Agents(api_key=os.environ["YOUR_CO_API_KEY"])

run = client.agents.run(
    agent="support-triage",
    input="My order #A-1042 hasn't shipped yet.",
)

print(run.output)`,curl:`curl https://api.your-co.com/v1/agents/run \\
  -H "Authorization: Bearer $YOUR_CO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent": "support-triage",
    "input": "My order #A-1042 hasn'\\''t shipped yet."
  }'`},eL={typescript:`const stream = await client.agents.run({
  agent: "support-triage",
  input: "Where is order #A-1042?",
  stream: true,
});

for await (const event of stream) {
  if (event.type === "token") process.stdout.write(event.delta);
  if (event.type === "tool_call") console.log("↳", event.name, event.args);
  if (event.type === "done") console.log("\\n✓ run", event.runId);
}`,python:`stream = client.agents.run(
    agent="support-triage",
    input="Where is order #A-1042?",
    stream=True,
)

for event in stream:
    if event.type == "token":
        print(event.delta, end="", flush=True)
    elif event.type == "tool_call":
        print("↳", event.name, event.args)
    elif event.type == "done":
        print("\\n✓ run", event.run_id)`,curl:`curl https://api.your-co.com/v1/agents/run \\
  -H "Authorization: Bearer $YOUR_CO_API_KEY" \\
  -H "Accept: text/event-stream" \\
  -d '{ "agent": "support-triage", "input": "Where is order #A-1042?", "stream": true }'`},eR=[{id:"typescript",label:"TypeScript"},{id:"python",label:"Python"},{id:"curl",label:"cURL"}];function eP({samples:e,lang:r,onLangChange:a,filenameFor:s,supportedLangs:o=eR}){let[l,d]=n.useState(!1),c=o.map(e=>e.id),p=c.includes(r)?r:c[0],u=e[p],g=o.map(e=>({id:e.id,label:e.label,leading:(0,t.jsx)(Y,{id:e.id,size:14})})),m=o.find(e=>e.id===p),h="curl"===p?"bash":p,y=s?s(p):"";return(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",background:"var(--bg-surface)"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderBottom:"1px solid var(--border)",background:"var(--bg-muted)"},children:[(0,t.jsx)("code",{style:{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-secondary)"},children:y}),o.length>1&&(0,t.jsx)(N,{align:"right",minWidth:160,maxHeight:240,offset:4,value:p,onSelect:e=>a(e.id),items:g,trigger:({toggle:e,triggerProps:n})=>(0,t.jsxs)("button",{...n,onClick:e,style:{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",height:28,fontSize:12,fontWeight:500,color:"var(--fg-primary)",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",fontFamily:"inherit"},children:[(0,t.jsx)(Y,{id:m?.id,size:14}),(0,t.jsx)("span",{children:m?.label}),(0,t.jsx)(i.Icon,{name:"chevronDown",size:12})]})}),(0,t.jsx)("button",{onClick:()=>{try{navigator.clipboard?.writeText(u),d(!0),setTimeout(()=>d(!1),1400)}catch{}},title:l?"Copied":"Copy",style:{width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",borderRadius:6,cursor:"pointer",color:l?"var(--brand-fg)":"var(--fg-tertiary)",fontFamily:"inherit"},onMouseEnter:e=>{l||(e.currentTarget.style.background="var(--bg-hover)")},onMouseLeave:e=>{e.currentTarget.style.background="transparent"},children:(0,t.jsx)(i.Icon,{name:l?"check":"copy",size:13})})]}),(0,t.jsx)(G,{code:u,lang:h})]})}function eE({n:e,id:n,title:r,children:i,isLast:a}){return(0,t.jsxs)("section",{style:{display:"flex",gap:16,marginTop:40},children:[(0,t.jsxs)("div",{style:{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,t.jsx)("div",{style:{width:28,height:28,borderRadius:7,border:"1px solid var(--accent-border)",background:"var(--bg-surface)",color:"var(--brand-fg)",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)"},children:e}),!a&&(0,t.jsx)("div",{style:{width:1,flex:1,background:"var(--border-strong)",marginTop:8,marginBottom:-32}})]}),(0,t.jsxs)("div",{style:{flex:1,minWidth:0,paddingTop:3},children:[(0,t.jsx)("h2",{id:n,style:{margin:0,fontSize:20,fontWeight:700,letterSpacing:"-0.015em",color:"var(--fg-primary)",scrollMarginTop:80},children:r}),(0,t.jsx)("div",{style:{marginTop:10},children:i})]})]})}function ez({children:e}){return(0,t.jsxs)("div",{style:{display:"flex",gap:10,padding:"12px 14px",marginTop:14,border:"1px solid var(--accent-border)",background:"var(--accent-bg)",borderRadius:8,fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:[(0,t.jsx)("span",{style:{color:"var(--brand-fg)",display:"inline-flex",flexShrink:0,paddingTop:2},children:(0,t.jsx)(i.Icon,{name:"flag",size:14})}),(0,t.jsx)("div",{children:e})]})}function eB({eyebrow:e,title:r,body:a,endIcon:s="arrowRight"}){let[o,l]=n.useState(!1);return(0,t.jsxs)("a",{href:"#",onClick:e=>e.preventDefault(),onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),style:{display:"flex",flexDirection:"column",gap:6,padding:"14px 16px",border:"1px solid",borderColor:o?"var(--border-strong)":"var(--border)",borderRadius:10,background:"var(--bg-surface)",textDecoration:"none",color:"inherit",transition:"border-color 140ms, transform 140ms",transform:o?"translateY(-1px)":"translateY(0)"},children:[(0,t.jsx)("div",{style:{fontSize:10,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--fg-tertiary)",fontWeight:600},children:e}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8},children:[(0,t.jsx)("div",{style:{fontSize:14,fontWeight:600,letterSpacing:"-0.005em",color:"var(--fg-primary)"},children:r}),(0,t.jsx)("span",{style:{color:"var(--fg-tertiary)",transform:o?"translateX(2px)":"translateX(0)",transition:"transform 140ms",display:"inline-flex"},children:(0,t.jsx)(i.Icon,{name:s,size:13})})]}),(0,t.jsx)("div",{style:{fontSize:12.5,lineHeight:1.5,color:"var(--fg-secondary)"},children:a})]})}let eN=[{id:"install",label:"Install the SDK"},{id:"auth",label:"Grab an API key"},{id:"first-run",label:"Run your first agent"},{id:"stream",label:"Stream tokens"},{id:"recap",label:"What just happened"},{id:"next-steps",label:"Next steps"}],eq={height:26,padding:"0 10px",fontSize:12,fontWeight:500,color:"var(--fg-secondary)",background:"transparent",border:"1px solid var(--border)",borderRadius:6,cursor:"pointer",fontFamily:"inherit"};function eD({onEditClick:e}={}){let[r,a]=n.useState("typescript"),s=eR.find(e=>e.id===r).label;return(0,t.jsxs)("div",{style:{display:"flex",maxWidth:1100,margin:"0 auto",padding:"0 32px",gap:32},children:[(0,t.jsxs)("article",{style:{flex:1,minWidth:0,padding:"32px 0 64px"},children:[(0,t.jsxs)("div",{style:{fontSize:12,color:"var(--brand-fg)",display:"flex",alignItems:"center",gap:6,marginBottom:14},children:[(0,t.jsx)("span",{children:"Docs"}),(0,t.jsx)(i.Icon,{name:"chevronRight",size:11}),(0,t.jsx)("span",{children:"Get started"}),(0,t.jsx)(i.Icon,{name:"chevronRight",size:11}),(0,t.jsx)("span",{children:"Quickstart"})]}),(0,t.jsx)("h1",{style:{margin:0,fontSize:32,fontWeight:700,letterSpacing:"-0.02em",color:"var(--fg-primary)"},children:"Quickstart"}),(0,t.jsx)("p",{style:{marginTop:10,marginBottom:0,fontSize:15,lineHeight:1.6,color:"var(--fg-secondary)",maxWidth:640},children:"Install the SDK, authenticate, and run your first agent in about a minute. By the end of this page you'll have made a real request and streamed a response back into your terminal."}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:14,marginTop:16,fontSize:12,color:"var(--fg-tertiary)"},children:[(0,t.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:5},children:[(0,t.jsx)(i.Icon,{name:"zap",size:12}),"2 min read"]}),(0,t.jsx)("span",{style:{color:"var(--border-strong)"},children:"·"}),(0,t.jsx)("span",{children:"Updated April 18, 2026"})]}),(0,t.jsxs)(eE,{n:"1",id:"install",title:"Install the SDK",children:[(0,t.jsxs)("p",{style:{margin:0,fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)"},children:["Add the ",s," client to your project. Node 18+ and Python 3.9+ are supported; everything else is zero-config."]}),(0,t.jsx)("div",{style:{marginTop:14},children:(0,t.jsx)(eP,{samples:eI,lang:r,onLangChange:a,filenameFor:e=>`Terminal \xb7 ${eR.find(t=>t.id===e)?.label}`})})]}),(0,t.jsxs)(eE,{n:"2",id:"auth",title:"Grab an API key",children:[(0,t.jsxs)("p",{style:{margin:0,fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)"},children:["Head to the"," ",(0,t.jsx)("a",{href:"#",onClick:e=>e.preventDefault(),style:{color:"var(--fg-primary)",textDecoration:"underline",textDecorationThickness:1,textUnderlineOffset:3},children:"dashboard"}),", create a key, and export it in your shell. Keys are scoped per project and can be rotated at any time."]}),(0,t.jsx)("div",{style:{marginTop:14},children:(0,t.jsx)(eP,{samples:{bash:'export YOUR_CO_API_KEY="sk_live_••••••••••••••••••••••••"'},lang:"bash",onLangChange:()=>{},filenameFor:()=>"Terminal",supportedLangs:[{id:"bash",label:"bash"}]})}),(0,t.jsxs)(ez,{children:["Never ship a key to the browser. Use a server proxy or our short-lived"," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:12,padding:"1px 5px",borderRadius:4,background:"var(--bg-hover)"},children:"/session-tokens"})," ","endpoint for client-side apps."]})]}),(0,t.jsxs)(eE,{n:"3",id:"first-run",title:"Run your first agent",children:[(0,t.jsxs)("p",{style:{margin:0,fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)"},children:["The snippet below runs the shared"," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:13,padding:"1px 5px",borderRadius:4,background:"var(--bg-hover)"},children:"support-triage"})," ","agent against a sample user message. Swap the agent ID for your own once you've created one."]}),(0,t.jsx)("div",{style:{marginTop:14},children:(0,t.jsx)(eP,{samples:e_,lang:r,onLangChange:a,filenameFor:e=>`first-run.${"typescript"===e?"ts":"python"===e?"py":"sh"}`})})]}),(0,t.jsxs)(eE,{n:"4",id:"stream",title:"Stream tokens instead of waiting",isLast:!0,children:[(0,t.jsxs)("p",{style:{margin:0,fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)"},children:["Most production apps stream responses token-by-token. Pass"," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:13,padding:"1px 5px",borderRadius:4,background:"var(--bg-hover)"},children:"stream: true"})," ","and iterate over the run's Server-Sent Events."]}),(0,t.jsx)("div",{style:{marginTop:14},children:(0,t.jsx)(eP,{samples:eL,lang:r,onLangChange:a,filenameFor:e=>`stream.${"typescript"===e?"ts":"python"===e?"py":"sh"}`})})]}),(0,t.jsxs)("section",{id:"recap",style:{marginTop:56,padding:"20px 22px",borderRadius:12,background:"var(--bg-subtle)",scrollMarginTop:80,border:"1px solid var(--border)"},children:[(0,t.jsx)("div",{style:{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--fg-tertiary)",marginBottom:8},children:"What just happened"}),(0,t.jsxs)("p",{style:{margin:0,fontSize:14,lineHeight:1.65,color:"var(--fg-secondary)"},children:["Your request hit the nearest regional edge, was routed to the"," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:13,padding:"1px 5px",borderRadius:4,background:"var(--bg-surface)",border:"1px solid var(--border)"},children:"support-triage"})," ","agent, and the agent decided — on its own — which tools to call before returning a final answer. Every run is traced; you can replay this one in the dashboard under"," ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)",fontWeight:600},children:"Runs → Latest"}),"."]})]}),(0,t.jsxs)("section",{id:"next-steps",style:{marginTop:48,scrollMarginTop:80},children:[(0,t.jsx)("h2",{style:{margin:0,fontSize:18,fontWeight:700,letterSpacing:"-0.01em",color:"var(--fg-primary)"},children:"Next steps"}),(0,t.jsxs)("div",{style:{marginTop:14,display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:12},children:[(0,t.jsx)(eB,{eyebrow:"Tutorial",title:"Build your first agent",body:"Compose a prompt, attach tools, and wire up memory end-to-end."}),(0,t.jsx)(eB,{eyebrow:"Guide",title:"Tools & function calling",body:"Register functions the model can call, with JSON Schema."}),(0,t.jsx)(eB,{eyebrow:"Reference",title:"API reference",body:"Every endpoint, every schema, every language sample."}),(0,t.jsx)(eB,{eyebrow:"Concepts",title:"Runs, traces, and evals",body:"How a single request fans out into a traceable, testable run."})]})]}),(0,t.jsxs)("div",{style:{marginTop:48,paddingTop:20,borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,color:"var(--fg-tertiary)"},children:[(0,t.jsx)("span",{children:"Was this page helpful?"}),(0,t.jsxs)("div",{style:{display:"flex",gap:6},children:[(0,t.jsx)("button",{style:eq,children:"Yes"}),(0,t.jsx)("button",{style:eq,children:"No"}),(0,t.jsx)("button",{style:eq,onClick:e,children:"Edit this page"})]})]})]}),(0,t.jsx)(eT,{entries:eN})]})}function eK(){return(0,t.jsxs)("div",{style:{padding:"32px 32px 64px",maxWidth:1100,margin:"0 auto"},children:[(0,t.jsx)("div",{style:{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--brand-fg)",marginBottom:10},children:"Changelog"}),(0,t.jsx)("h1",{style:{margin:"0 0 10px",fontSize:32,fontWeight:700,letterSpacing:"-0.02em"},children:"What's new"}),(0,t.jsx)("p",{style:{margin:"0 0 32px",fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)"},children:"New features, fixes, and SDK updates — shipped continuously."}),(0,t.jsx)("div",{style:{borderLeft:"1px solid var(--border)",paddingLeft:20},children:T.map((e,n)=>(0,t.jsxs)("div",{style:{position:"relative",paddingBottom:32},children:[(0,t.jsx)("div",{style:{position:"absolute",left:-25,top:6,width:9,height:9,borderRadius:"50%",background:"var(--bg-surface)",border:"2px solid var(--fg-quaternary)"}}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:4},children:[(0,t.jsx)("span",{style:{fontSize:11,fontWeight:500,color:"var(--fg-tertiary)"},children:e.date}),(0,t.jsx)("span",{style:{fontSize:10,color:"var(--fg-quaternary)"},children:"•"}),(0,t.jsx)("code",{style:{fontSize:11,fontFamily:"var(--font-mono)",color:"var(--fg-tertiary)"},children:e.version}),(0,t.jsx)("span",{style:{fontSize:10,fontWeight:600,letterSpacing:"0.04em",padding:"2px 6px",borderRadius:4,background:"Feature"===e.tag?"var(--status-200-bg)":"var(--bg-hover)",color:"Feature"===e.tag?"var(--status-200)":"var(--fg-tertiary)"},children:e.tag})]}),(0,t.jsx)("div",{style:{fontSize:15,fontWeight:600,marginBottom:4},children:e.title}),(0,t.jsx)("div",{style:{fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:e.body})]},n))})]})}var e$=e.i(632781);let eM=new Set(["typescript","python","go","java","csharp","ruby","php","swift","rust","curl"]);function eW({sdk:e,size:n=36}){return e.logo&&eM.has(e.logo)?(0,t.jsx)("div",{style:{width:n,height:n,borderRadius:8,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.06)"},children:(0,t.jsx)(Y,{id:e.logo,size:n})}):(0,t.jsx)("div",{style:{width:n,height:n,borderRadius:8,background:e.color,color:e.fg||"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)",fontWeight:700,fontSize:e.letter.length>2?11:2===e.letter.length?14:17,letterSpacing:e.letter.length>1?"-0.02em":0,flexShrink:0,boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.08)"},children:e.letter})}function eO({value:e,kickFrom:r}){let i=n.useRef(e),[a,s]=n.useState(null);if(n.useEffect(()=>{if(r&&r!==e){s({prev:r,next:e});let t=setTimeout(()=>s(null),800);return()=>clearTimeout(t)}},[]),n.useEffect(()=>{if(i.current===e)return;let t=i.current;i.current=e,s({prev:t,next:e});let n=setTimeout(()=>s(null),800);return()=>clearTimeout(n)},[e]),!a)return(0,t.jsx)(t.Fragment,{children:e});let o=Math.max(a.prev.length,a.next.length);return(0,t.jsx)("span",{style:{display:"inline-block",lineHeight:1.5,verticalAlign:"bottom"},children:Array.from({length:o}).map((e,n)=>{let r=a.prev[n]??" ",i=a.next[n]??" ",s=r!==i;return(0,t.jsx)("span",{style:{display:"inline-block",overflow:"hidden",height:"1.5em",verticalAlign:"top"},children:s?(0,t.jsxs)("span",{style:{display:"block",animation:"fha-ticker-roll 800ms cubic-bezier(0.5, 0, 0.2, 1) both"},children:[(0,t.jsx)("span",{style:{display:"block"},children:r}),(0,t.jsx)("span",{style:{display:"block"},children:i})]}):(0,t.jsx)("span",{style:{display:"block"},children:i})},n)})})}function eH({version:e,previousVersion:n,date:r,highlight:i}){return e?(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0},children:[(0,t.jsxs)("span",{style:{display:"inline-block",padding:"2px 8px",fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600,letterSpacing:"0.01em",borderRadius:999,lineHeight:1.5,color:i?"var(--gh-success)":"var(--fg-secondary)",background:"transparent",border:`1px solid ${i?"rgba(var(--gh-success-rgb), 0.45)":"var(--border)"}`,whiteSpace:"nowrap",transition:"color 600ms ease, border-color 600ms ease"},children:["v",(0,t.jsx)(eO,{value:e,kickFrom:n})]}),r&&(0,t.jsx)("span",{style:{fontSize:10.5,color:i?"var(--gh-success)":"var(--fg-tertiary)",letterSpacing:"0.01em",whiteSpace:"nowrap",animation:"fha-chip-flip-in 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both",transition:"color 600ms ease"},children:r},r)]}):null}function eF(){return(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0,animation:"fha-chip-flip-in 280ms cubic-bezier(0.2, 0.8, 0.2, 1) both"},children:[(0,t.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:6,padding:"2px 8px 2px 7px",borderRadius:999,border:"1px solid var(--border)",fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600,letterSpacing:"0.01em",lineHeight:1.5,color:"var(--fg-tertiary)",background:"transparent",whiteSpace:"nowrap"},children:[(0,t.jsx)(e$.Loader2,{size:11,strokeWidth:2.4,style:{animation:"fha-spin 900ms linear infinite",flexShrink:0}}),"Generating"]}),(0,t.jsx)("span",{style:{fontSize:10.5,color:"var(--fg-tertiary)",letterSpacing:"0.01em",whiteSpace:"nowrap"},children:"in progress…"})]})}function eG({sdk:e,override:r,glowKey:i,generating:a,onSelect:s}){let[o,l]=n.useState(!1),[d,c]=n.useState(0),[p,u]=n.useState(!1);n.useEffect(()=>{if(!a){if(c(0),p){let e=setTimeout(()=>u(!1),900);return()=>clearTimeout(e)}return}u(!0),c(-4);let e=!0,t=setInterval(()=>{c((e=!e)?-4:0)},900);return()=>clearInterval(t)},[a]);let g=n.useRef(null);n.useEffect(()=>{if(!i)return;let e=g.current;if(!e)return;e.style.animation="none",e.offsetHeight,e.style.animation="fha-tile-publish-glow 1200ms ease both";let t=setTimeout(()=>{g.current&&(g.current.style.animation="")},1250);return()=>clearTimeout(t)},[i]);let m=r?.version??e.version,h=r?.date??e.date,y=!!r,f=n.useRef(m);n.useEffect(()=>{a||(f.current=m)},[m,a]);let b=a||0!==d?d:o?-1:0;return(0,t.jsxs)("a",{ref:g,href:"#","data-demo":e.logo?`sdk-tile-${e.logo}`:void 0,onClick:t=>{t.preventDefault(),s?.(e.logo)},onMouseEnter:()=>l(!0),onMouseLeave:()=>l(!1),style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"14px 16px",borderRadius:10,border:"1px solid var(--border)",background:"var(--bg-surface)",textDecoration:"none",color:"var(--fg-primary)",transition:p?"border-color 140ms, transform 900ms cubic-bezier(0.4, 0, 0.6, 1), box-shadow 140ms":"border-color 140ms, transform 140ms, box-shadow 140ms",borderColor:o?"var(--border-strong)":"var(--border)",transform:`translateY(${b}px)`,boxShadow:o?"var(--shadow-md)":"var(--shadow-sm)",position:"relative",minHeight:68},"data-glow-key":i||0,children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:14,minWidth:0,flex:1},children:[(0,t.jsx)(eW,{sdk:e,size:36}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:2,minWidth:0},children:[(0,t.jsx)("div",{style:{fontSize:14,fontWeight:600,color:"var(--fg-primary)",lineHeight:1.25,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:e.name}),e.package&&(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:11.5,color:"var(--fg-tertiary)",background:"transparent",padding:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"},children:e.package})]})]}),a?(0,t.jsx)(eF,{}):(0,t.jsx)(eH,{version:m,previousVersion:f.current,date:h,highlight:y}),i?(0,t.jsx)("span",{"aria-hidden":!0,style:{position:"absolute",inset:0,borderRadius:"inherit",overflow:"hidden",pointerEvents:"none"},children:(0,t.jsx)("span",{style:{position:"absolute",top:0,bottom:0,left:0,width:"55%",background:"linear-gradient(115deg, rgba(var(--gh-success-rgb), 0) 0%, rgba(var(--gh-success-rgb), 0.05) 45%, rgba(var(--gh-success-rgb), 0.12) 50%, rgba(var(--gh-success-rgb), 0.05) 55%, rgba(var(--gh-success-rgb), 0) 100%)",animation:"fha-tile-lightsweep 900ms cubic-bezier(0.4, 0, 0.2, 1) 600ms both"}})},i):null]})}let eV=[{id:"features",label:"What you get"},{id:"start",label:"Getting started"}],eY=[{icon:"check",title:"Type-safe clients",body:"Native types, idiomatic naming, and autocomplete in every IDE."},{icon:"history",title:"Automatic retries",body:"Safe retries with exponential backoff and idempotency headers."},{icon:"zap",title:"Streaming & SSE",body:"First-class support for server-sent events and async iteration."},{icon:"package",title:"Pagination helpers",body:"Iterate paginated results without writing cursor logic by hand."},{icon:"lock",title:"Auth built in",body:"API keys, OAuth tokens, and bearer auth wired up from your spec."},{icon:"book",title:"Generated from OpenAPI",body:"One spec in, nine SDKs out — always in sync with your API."}];function eJ({feature:e}){return(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:6,padding:"16px 18px",border:"1px solid var(--border)",borderRadius:10,background:"var(--bg-surface)"},children:[(0,t.jsx)("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:7,background:"var(--bg-muted)",color:"var(--fg-secondary)",marginBottom:4},children:(0,t.jsx)(i.Icon,{name:e.icon,size:14})}),(0,t.jsx)("div",{style:{fontSize:13.5,fontWeight:600,color:"var(--fg-primary)",letterSpacing:"-0.005em"},children:e.title}),(0,t.jsx)("div",{style:{fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:e.body})]})}function eU({onSelectSdk:e}={}){let[r,a]=n.useState({}),[s,o]=n.useState({}),[l,d]=n.useState({});return n.useEffect(()=>(window.__sdkCatalogDemo={markGenerating:e=>{d(t=>({...t,[e]:!0}))},markGenerationDone:e=>{d(t=>{if(!t[e])return t;let n={...t};return delete n[e],n})},markCelebrate:e=>{o(t=>({...t,[e]:(t[e]||0)+1}))},markPublished:(e,t)=>{d(t=>{if(!t[e])return t;let n={...t};return delete n[e],n}),a(n=>({...n,[e]:t}))},reset:()=>{a({}),o({}),d({})}},()=>{window.__sdkCatalogDemo=null}),[]),(0,t.jsxs)("div",{style:{display:"flex",maxWidth:1100,margin:"0 auto",padding:"0 32px",gap:32},children:[(0,t.jsxs)("article",{style:{flex:1,minWidth:0,padding:"32px 0 64px"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--brand-fg)",marginBottom:14},children:[(0,t.jsx)("span",{children:"SDKs"}),(0,t.jsx)(i.Icon,{name:"chevronRight",size:11}),(0,t.jsx)("span",{children:"Overview"})]}),(0,t.jsx)("h1",{style:{margin:"0 0 10px",fontSize:32,fontWeight:700,letterSpacing:"-0.02em",color:"var(--fg-primary)",lineHeight:1.1},children:"Backend SDKs"}),(0,t.jsx)("p",{style:{margin:"0 0 32px",fontSize:15,lineHeight:1.65,color:"var(--fg-secondary)",maxWidth:680},children:"Official open-source client libraries for your favorite platforms."}),(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:10,marginBottom:48},children:S.map(n=>{let i=n.logo?s[n.logo]:void 0,a=!!n.logo&&!!l[n.logo];return(0,t.jsx)(eG,{sdk:n,override:n.logo?r[n.logo]:void 0,glowKey:i,generating:a,onSelect:e},n.name)})}),(0,t.jsx)("h2",{id:"features",style:{margin:"0 0 6px",fontSize:22,fontWeight:700,letterSpacing:"-0.01em",color:"var(--fg-primary)",scrollMarginTop:80},children:"What you get"}),(0,t.jsx)("p",{style:{margin:"0 0 20px",fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)",maxWidth:680},children:"Every SDK ships with the same batteries — no per-language feature matrix to memorize."}),(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))",gap:10,marginBottom:48},children:eY.map(e=>(0,t.jsx)(eJ,{feature:e},e.title))}),(0,t.jsx)("h2",{id:"start",style:{margin:"0 0 6px",fontSize:22,fontWeight:700,letterSpacing:"-0.01em",color:"var(--fg-primary)",scrollMarginTop:80},children:"Getting started"}),(0,t.jsxs)("p",{style:{margin:"0 0 16px",fontSize:14,lineHeight:1.6,color:"var(--fg-secondary)",maxWidth:680},children:["Add a generator to your"," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:12.5,padding:"1px 6px",borderRadius:4,background:"var(--bg-muted)",color:"var(--fg-primary)"},children:"generators.yml"}),", then run"," ",(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:12.5,padding:"1px 6px",borderRadius:4,background:"var(--bg-muted)",color:"var(--fg-primary)"},children:"fern generate"}),"."]}),(0,t.jsx)("pre",{style:{margin:0,padding:"14px 16px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,fontFamily:"var(--font-mono)",fontSize:12.5,lineHeight:1.65,color:"var(--fg-primary)",overflowX:"auto"},children:`$ npm install -g fern-api
$ fern add fern-python-sdk
$ fern generate`})]}),(0,t.jsx)(eT,{entries:eV})]})}let eQ=n.createContext(null);function eZ({entry:e,surface:r,onDismiss:i,zIndex:a,stackDx:s,stackDy:o,onMeasure:l}){let d=n.useRef(null),[c,p]=n.useState("enter"),[u,g]=n.useState(null);n.useLayoutEffect(()=>{if(!d.current||!r)return;let t=()=>{let t=function(e,t,n){let r=t.clientWidth,i=t.clientHeight,a=n?n.offsetWidth:0,s=n?n.offsetHeight:0;if(!e||"anchor"===e.kind){let t=e?.anchor||"center",[n=0,o=0]=e?.offset||[0,0];switch(t){case"top-left":return{left:n,top:o,origin:"top left"};case"top":return{left:(r-a)/2,top:o,origin:"top center"};case"top-right":return{right:n,top:o,origin:"top right"};case"left":return{left:n,top:(i-s)/2,origin:"center left"};case"center":default:return{left:(r-a)/2,top:(i-s)/2,origin:"center"};case"right":return{right:n,top:(i-s)/2,origin:"center right"};case"bottom-left":return{left:n,bottom:o,origin:"bottom left"};case"bottom":return{left:(r-a)/2,bottom:o,origin:"bottom center"};case"bottom-right":return{right:n,bottom:o,origin:"bottom right"}}}if("absolute"===e.kind)return{left:e.x??0,top:e.y??0,origin:"top left"};if("selector"===e.kind){let n=t.querySelector(e.selector);if(!n)return{left:(r-a)/2,top:(i-s)/2,origin:"center"};let o=t.getBoundingClientRect(),l=n.getBoundingClientRect(),d=l.left-o.left,c=l.top-o.top,[p=0,u=0]=e.offset||[0,0];switch(e.placement||"below"){case"below":return{left:d+p,top:c+l.height+u,origin:"top left"};case"above":return{left:d+p,top:c-s-u,origin:"bottom left"};case"right":return{left:d+l.width+p,top:c+u,origin:"center left"};case"left":return{left:d-a-p,top:c+u,origin:"center right"};default:return{left:d+p,top:c+u,origin:"top left"}}}return{left:0,top:0,origin:"center"}}(e.position,r,d.current),n={origin:t.origin};if(void 0!==t.top&&(n.top=t.top+(o||0)),void 0!==t.bottom&&(n.bottom=t.bottom+(o||0)),void 0!==t.left&&(n.left=t.left+(s||0)),void 0!==t.right&&(n.right=t.right+(s||0)),g(n),l&&d.current){let t=d.current.getBoundingClientRect();l(e.id,t.width,t.height)}};t();let n=new ResizeObserver(t);return n.observe(r),d.current&&n.observe(d.current),()=>n.disconnect()},[e.position,r,s,o,l,e.id]),n.useEffect(()=>{let e=!1,t=()=>{e||p(e=>"enter"===e?"active":e)},n=requestAnimationFrame(()=>setTimeout(t,0)),r=setTimeout(t,80);return()=>{e=!0,cancelAnimationFrame(n),clearTimeout(r)}},[]),n.useEffect(()=>{e.__dismissing&&"exit"!==c?p("exit"):e.__dismissing||"exit"!==c||p("active")},[e.__dismissing,c]),n.useEffect(()=>{if("exit"!==c)return;let e=setTimeout(()=>i(),240);return()=>clearTimeout(e)},[c,i]);let m=e.transition||"pop",h={pop:{enter:"scale(0.92) translateY(6px)",active:"scale(1) translateY(0)",exit:"scale(0.94) translateY(4px)"},fade:{enter:"none",active:"none",exit:"none"},"slide-up":{enter:"translateY(16px)",active:"translateY(0)",exit:"translateY(10px)"},drop:{enter:"translateY(-20px)",active:"translateY(0)",exit:"translateY(-12px)"}},y=+("active"===c),f=(h[m]||h.pop)[c],b=null!=u,x=b?void 0!==u.right?"right":"left":void 0;return(0,t.jsx)("div",{ref:d,className:"fha-widget-slot","data-anchor-x":x,style:{position:"absolute",left:b?u.left:0,top:b?u.top:0,right:b?u.right:void 0,bottom:b?u.bottom:void 0,zIndex:a,transformOrigin:b?u.origin:"center",transform:f,opacity:b?y:0,transition:"transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease",pointerEvents:"exit"===c?"none":"auto"},children:e.render({id:e.id,dismiss:()=>e.__requestDismiss()})})}function eX({children:e,className:r,style:i}){let a=n.useRef(null),[s,o]=n.useState(null),[l,d]=n.useState([]),c=n.useRef(1),[p,u]=n.useState({}),g=n.useCallback(e=>{a.current=e,o(e)},[]),m=n.useMemo(()=>{let e=e=>{d(t=>t.map(t=>t.id===e?{...t,__dismissing:!0}:t))},t=t=>{let n=t.id??`w_${c.current++}`;return d(r=>[...r.filter(e=>e.id!==n),{id:n,render:t.render,position:t.position||{kind:"anchor",anchor:"center"},transition:t.transition||"pop",dismissOnEsc:!1!==t.dismissOnEsc,dismissOnBackdrop:!!t.dismissOnBackdrop,backdrop:!!t.backdrop,stackKey:t.stackKey||null,stackGap:t.stackGap||0,stackAxis:t.stackAxis||"y",__dismissing:!1,__requestDismiss:()=>e(n)}]),n};return{spawn:t,dismiss:e,dismissAll:()=>{d(e=>e.map(e=>({...e,__dismissing:!0})))},dismissStack:e=>{d(t=>t.map(t=>t.stackKey!==e||t.__dismissing?t:{...t,__dismissing:!0}))},toggle:(n,r)=>l.some(e=>e.id===n&&!e.__dismissing)?(e(n),!1):(t({...r,id:n}),!0),has:e=>l.some(t=>t.id===e&&!t.__dismissing),_stackSize:e=>l.filter(t=>t.stackKey===e&&!t.__dismissing).length}},[l]);n.useEffect(()=>{let e=e=>{if("Escape"!==e.key)return;let t=l.filter(e=>!e.__dismissing),n=t[t.length-1];n&&n.dismissOnEsc&&m.dismiss(n.id)};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[l,m]);let h=n.useCallback(e=>{d(t=>t.filter(t=>t.id!==e)),u(t=>{if(!(e in t))return t;let n={...t};return delete n[e],n})},[]),y=n.useCallback((e,t,n)=>{u(r=>{let i=r[e];return i&&.5>Math.abs(i.h-n)&&.5>Math.abs(i.w-t)?r:{...r,[e]:{w:t,h:n}}})},[]),f=n.useMemo(()=>{let e={},t={};return l.forEach(n=>{if(!n.stackKey||n.__dismissing){t[n.id]={dx:0,dy:0};return}let r=String(n.position?.anchor||""),i=n.stackAxis||"y",a="y"===i?r.startsWith("bottom")?-1:1:r.endsWith("right")?-1:1,s=e[n.stackKey]||0;t[n.id]="y"===i?{dx:0,dy:s*a}:{dx:s*a,dy:0};let o=p[n.id],l=n.stackGap||0,d=o?("y"===i?o.h:o.w)+l:l;e[n.stackKey]=s+d}),t},[l,p]);return(0,t.jsx)(eQ.Provider,{value:m,children:(0,t.jsxs)("div",{ref:g,className:r,style:{position:"relative",...i||{}},children:[e,s&&l.map((e,r)=>(0,t.jsxs)(n.Fragment,{children:[e.backdrop&&!e.__dismissing&&(0,t.jsx)("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,0.25)",zIndex:1300+2*r,animation:"fha-fadeIn 180ms ease"},onClick:()=>e.dismissOnBackdrop&&m.dismiss(e.id)}),(0,t.jsx)(eZ,{entry:e,surface:s,zIndex:1301+2*r,stackDx:f[e.id]?.dx||0,stackDy:f[e.id]?.dy||0,onMeasure:y,onDismiss:()=>h(e.id)})]},e.id))]})})}let e0={steps:[{kind:"type",text:"I want to integrate with your-company's Voice Agent API",pauseAfter:200},{kind:"line",delay:500,line:{kind:"task",title:"Searching docs:",trail:[{kind:"link",text:"docs.company.com/llms.txt"}],meta:"found 4 relevant pages"}},{kind:"line",delay:1e3,line:{kind:"task",title:"Reading:",trail:[{kind:"link",text:"docs.company.com/voice-agents/create-agent.md",demo:"terminal-md-link"}],meta:"last updated 2d ago"}},{kind:"line",delay:1100,line:{kind:"task",title:"Found SDK:",trail:[{kind:"value",text:"@your-company/voice-agents-ts"},{kind:"dim",text:"v3.2.0"}]}},{kind:"line",delay:1500,line:{kind:"task",title:"All set 🎉. Integrated with your-company's Voice Agent API.",extraTrail:[{kind:"link",text:"github.com/your-co/app/pull/142"}]}}]},e1={home:{onEnter:()=>{window.__appDemo?.reset?.(),window.__appDemo?.setActiveTab?.("home"),window.__widgetsDemo?.dismissAll?.()},steps:[]},"agent-native":{onEnter:e=>{window.__appDemo?.reset?.(),window.__appDemo?.setActiveEndpoint?.("create-agent"),window.__appDemo?.setActiveTab?.("home"),window.__widgetsDemo?.dismissAll?.(),e.schedule(()=>window.__widgetsDemo?.spawnTerminal?.("Terminal",{showBanner:!0}),2700)},steps:[{target:'[data-demo="welcome-tile-api-reference"]',delay:1800,hold:900,action:"click"},{target:'[data-demo="terminal-prompt"]',delay:300,hold:2e3,action:"custom",offset:[60,5],run:()=>window.__terminalDemo?.play?.(e0)},{target:'[data-demo="terminal-md-link"]',delay:400,hold:2400,action:"custom",run:()=>window.__appDemo?.setMdViewOpen?.(!0)},{target:'[data-demo="md-close"]',delay:600,hold:600,action:"click"}]},reference:{onEnter:()=>{window.__appDemo?.reset?.(),window.__appDemo?.setActiveTab?.("sdks"),window.__appDemo?.setSplitOpen?.(!0),window.__widgetsDemo?.dismissAll?.(),window.__sdkCatalogDemo?.reset?.()},steps:[],completeAfter:7800,interruptible:!1}};function e2({cursorRef:e,visible:r}){let[i,a]=n.useState(()=>document.documentElement.classList.contains("dark")?"dark":"light");return n.useEffect(()=>{let e=document.documentElement,t=new MutationObserver(()=>a(e.classList.contains("dark")?"dark":"light"));return t.observe(e,{attributes:!0,attributeFilter:["class"]}),()=>t.disconnect()},[]),n.useLayoutEffect(()=>{let t=e.current;if(!t)return;let n=!1,r=()=>{let e,i,a,s;if(n)return;let o=document.querySelector(".fha-app-layer .browser-body");o?(i=(e=o.getBoundingClientRect()).left+window.scrollX+e.width/2,a=e.top+window.scrollY+e.height/2,s=t.style.transition,t.style.transition="none",t.style.transform=`translate(${i}px, ${a}px)`,t.offsetHeight,t.style.transition=s):requestAnimationFrame(r)};return r(),()=>{n=!0}},[e]),P.default.createPortal((0,t.jsx)("div",{"data-theme":i,children:(0,t.jsx)("div",{ref:e,className:`demo-cursor ${r?"visible":""}`,children:(0,t.jsx)("svg",{viewBox:"0 0 26.62 32",width:"26.62",height:"32",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,t.jsx)("path",{d:"M 21.319 19.252 L 12.219 20.64 C 11.668 20.724 11.171 21.021 10.836 21.466 L 6.24 27.576 C 5.067 29.136 2.588 28.431 2.411 26.487 L 0.414 4.547 C 0.25 2.744 2.265 1.569 3.753 2.601 L 22.212 15.39 C 23.798 16.489 23.227 18.961 21.319 19.252 Z",fill:"rgb(0,0,0)",stroke:"#ffffff",strokeWidth:"2.226",strokeLinejoin:"round"})})})}),document.body)}function e6({label:e="Click to interact",enabled:r=!0,idle:i=!0,onInteract:a}){let s=n.useRef(null),o=n.useRef(a);return n.useLayoutEffect(()=>{o.current=a}),n.useEffect(()=>{let e,t;if(!r)return;let n=document.querySelector(".fha-app-layer .browser-body"),a=s.current;if(!n||!a)return;let l=n.closest(".fha-root");l?.classList.add("inviting");let d=!1;try{d=n.matches(":hover")}catch{}i&&!d&&a.classList.add("centered");let c=0,p=0,u=0,g=0,m=0,h=!1,y=!1,f=()=>{!a.classList.contains("centered")||a.classList.contains("fading-out")||(a.classList.add("fading-out"),t&&clearTimeout(t),t=setTimeout(()=>{t=void 0,y||(a.classList.remove("centered"),a.classList.remove("fading-out"))},200))},b=()=>{y||(e&&(clearTimeout(e),e=void 0),f())},x=e=>{if(y)return;let t=n.getBoundingClientRect(),r=e.clientX-t.left,i=e.clientY-t.top;r<0||i<0||r>t.width||i>t.height||(g=r,m=i,h||(h=!0,c=requestAnimationFrame(()=>{h=!1,y||(f(),p=g,u=m,a.style.setProperty("--hx",p+"px"),a.style.setProperty("--hy",u+"px"),a.classList.add("visible"))})))},v=()=>{a.classList.remove("visible"),y||(t&&(clearTimeout(t),t=void 0,a.classList.remove("fading-out")),i&&(e&&clearTimeout(e),e=setTimeout(()=>{y||a.classList.add("centered")},220)))},w=()=>{y=!0,a.classList.remove("visible"),a.classList.remove("centered"),a.classList.remove("fading-out"),e&&clearTimeout(e),t&&clearTimeout(t),l?.classList.remove("inviting"),o.current?.()};return n.addEventListener("pointerenter",b),n.addEventListener("pointermove",x),n.addEventListener("pointerleave",v),n.addEventListener("pointerdown",w),()=>{cancelAnimationFrame(c),e&&clearTimeout(e),t&&clearTimeout(t),n.removeEventListener("pointerenter",b),n.removeEventListener("pointermove",x),n.removeEventListener("pointerleave",v),n.removeEventListener("pointerdown",w),l?.classList.remove("inviting"),a.classList.remove("visible"),a.classList.remove("centered"),a.classList.remove("fading-out")}},[r,i]),(0,t.jsxs)("div",{ref:s,className:"hint-tooltip","aria-hidden":"true",children:[(0,t.jsx)("span",{className:"hint-dot"}),(0,t.jsx)("span",{children:e})]})}var e5=e.i(188865);function e3({onExit:e,theme:n,animated:r}){let i="dark"===n,a=i?"#0f0f0f":"#ffffff",s=i?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",o=i?"#e5e5e5":"#1f1f1f",l=i?"#8a8a8a":"#6b6b6b",d=i?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",c=i?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)",p=i?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)";return(0,t.jsxs)("div",{"data-editor-topbar":!0,style:{height:52,flexShrink:0,background:a,borderBottom:`1px solid ${s}`,display:"flex",alignItems:"center",padding:"0 12px",gap:10,fontFamily:"var(--font-sans)",color:o,fontSize:13,animation:r?"fha-editorTopBarIn 420ms cubic-bezier(0.34, 1.35, 0.64, 1)":"none"},children:[(0,t.jsx)("button",{type:"button",onClick:e,title:"Back to dashboard",style:{appearance:"none",background:d,border:`1px solid ${p}`,borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",color:l,cursor:"pointer",flexShrink:0},children:(0,t.jsx)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M15 18l-6-6 6-6"})})}),(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",gap:8,paddingLeft:2,paddingRight:4}}),(0,t.jsxs)("button",{type:"button",style:{appearance:"none",background:"transparent",border:"none",display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,color:o,cursor:"text",minWidth:0,maxWidth:260},onMouseEnter:e=>e.currentTarget.style.background=c,onMouseLeave:e=>e.currentTarget.style.background="transparent",children:[(0,t.jsxs)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:l,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",style:{flexShrink:0},children:[(0,t.jsx)("circle",{cx:"18",cy:"18",r:"3"}),(0,t.jsx)("circle",{cx:"6",cy:"6",r:"3"}),(0,t.jsx)("path",{d:"M13 6h3a2 2 0 0 1 2 2v7"}),(0,t.jsx)("line",{x1:"6",x2:"6",y1:"9",y2:"21"})]}),(0,t.jsx)("span",{style:{color:l,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},children:"Click to edit PR title"})]}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,padding:"4px 10px 5px",borderRadius:999,background:"#FDE68A",border:"1px solid #92400E",flexShrink:0},children:[(0,t.jsx)("div",{style:{width:7,height:7,borderRadius:"50%",background:"#92400E"}}),(0,t.jsx)("div",{style:{fontSize:12,lineHeight:1,color:"#713F12",fontWeight:500},children:"Draft"})]}),(0,t.jsx)("div",{style:{flex:1}}),(0,t.jsxs)("button",{type:"button",style:{appearance:"none",background:a,border:`1px solid ${p}`,borderRadius:8,height:30,padding:"0 10px",display:"flex",alignItems:"center",gap:6,color:o,fontSize:12,cursor:"pointer",fontFamily:"inherit"},onMouseEnter:e=>e.currentTarget.style.background=c,onMouseLeave:e=>e.currentTarget.style.background=a,children:[(0,t.jsx)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})}),(0,t.jsx)("span",{children:"Feedback"})]}),(0,t.jsx)("div",{role:"switch","aria-checked":"false",style:{width:44,height:26,borderRadius:6,background:d,border:`1px solid ${p}`,position:"relative",cursor:"pointer",flexShrink:0},title:"Toggle code view",children:(0,t.jsx)("div",{style:{position:"absolute",top:2,left:2,width:20,height:20,borderRadius:4,background:a,border:`1px solid ${p}`,display:"flex",alignItems:"center",justifyContent:"center",color:l},children:(0,t.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"m18 16 4-4-4-4"}),(0,t.jsx)("path",{d:"m6 8-4 4 4 4"}),(0,t.jsx)("path",{d:"m14.5 4-5 16"})]})})}),(0,t.jsxs)("button",{type:"button",style:{appearance:"none",background:"transparent",border:"none",height:30,padding:"0 8px",display:"flex",alignItems:"center",gap:8,color:l,fontSize:12,cursor:"pointer",fontFamily:"inherit",borderRadius:8},onMouseEnter:e=>e.currentTarget.style.background=c,onMouseLeave:e=>e.currentTarget.style.background="transparent",children:[(0,t.jsx)("span",{style:{minWidth:18,height:18,padding:"0 5px",borderRadius:999,background:"#BBF7D0",color:"#14532D",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1},children:"0"}),(0,t.jsx)("span",{style:{color:o},children:"Files"}),(0,t.jsx)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"m6 9 6 6 6-6"})})]}),(0,t.jsxs)("button",{type:"button",style:{appearance:"none",background:i?"#fafafa":"#0a0a0a",color:i?"#0a0a0a":"#fafafa",border:"none",height:30,padding:"0 14px",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",borderRadius:8,flexShrink:0},children:[(0,t.jsxs)("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("line",{x1:"6",y1:"3",x2:"6",y2:"15"}),(0,t.jsx)("circle",{cx:"18",cy:"6",r:"3"}),(0,t.jsx)("circle",{cx:"6",cy:"18",r:"3"}),(0,t.jsx)("path",{d:"M18 9a9 9 0 0 1-9 9"})]}),"Commit"]}),(0,t.jsx)("div",{style:{width:1,height:20,background:s,margin:"0 4px"}}),(0,t.jsx)("div",{style:{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg, #7dd3fc, #818cf8)",border:`2px solid ${a}`,boxShadow:`0 0 0 1.5px ${i?"#fafafa":"#0a0a0a"}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:600},children:"ML"}),(0,t.jsx)("button",{type:"button",style:{appearance:"none",background:"transparent",border:"none",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",color:l,cursor:"pointer",borderRadius:8,flexShrink:0},onMouseEnter:e=>e.currentTarget.style.background=c,onMouseLeave:e=>e.currentTarget.style.background="transparent",children:(0,t.jsxs)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,t.jsx)("path",{d:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"}),(0,t.jsx)("path",{d:"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"})]})})]})}function e4({onExit:e,theme:n,animated:r}){let i="dark"===n;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{style:{position:"absolute",top:0,left:0,right:0,height:52,zIndex:20,overflow:"hidden"},children:(0,t.jsx)(e3,{onExit:e,theme:n,animated:r})}),(0,t.jsx)("div",{"aria-hidden":!0,style:{position:"absolute",top:62,left:10,right:10,bottom:10,borderRadius:10,border:`1px solid ${i?"rgba(96,165,250,0.35)":"rgba(37,99,235,0.35)"}`,boxShadow:i?"0 0 0 1px rgba(96,165,250,0.2), 0 10px 30px -10px rgba(0,0,0,0.6)":"0 0 0 1px rgba(37,99,235,0.15), 0 8px 24px -10px rgba(0,0,0,0.18)",pointerEvents:"none",zIndex:15,transformOrigin:"center top",animation:r?"fha-editorFrameIn 420ms cubic-bezier(0.34, 1.35, 0.64, 1)":"none"},children:["tl","tr","bl","br"].map(e=>(0,t.jsx)("div",{style:{position:"absolute",width:9,height:9,background:i?"#60a5fa":"#2563eb",borderRadius:2,boxShadow:"0 0 0 2px var(--bg-surface)",top:"t"===e[0]?-5:"auto",bottom:"b"===e[0]?-5:"auto",left:"l"===e[1]?-5:"auto",right:"r"===e[1]?-5:"auto"}},e))})]})}var e8=e.i(689664),e9=e.i(716327);function e7({size:e=18}){return(0,t.jsx)("svg",{width:e,height:Math.round(105/107*e),viewBox:"0 0 107 105",fill:"none",xmlns:"http://www.w3.org/2000/svg","aria-label":"GitHub",children:(0,t.jsx)("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M53.385 0C23.8645 0 0 24.0404 0 53.7817C0 77.5554 15.2908 97.6794 36.5032 104.802C39.1553 105.337 40.1267 103.645 40.1267 102.221C40.1267 100.974 40.0393 96.7004 40.0393 92.2474C25.1889 95.4535 22.0964 85.8363 22.0964 85.8363C19.7099 79.6033 16.1737 78.0013 16.1737 78.0013C11.3132 74.7067 16.5278 74.7067 16.5278 74.7067C21.9194 75.0629 24.7485 80.2272 24.7485 80.2272C29.5205 88.4184 37.2102 86.104 40.3037 84.6791C40.7452 81.2063 42.1603 78.8023 43.6628 77.4669C31.8186 76.2201 19.3569 71.5901 19.3569 50.9318C19.3569 45.055 21.4768 40.2469 24.8359 36.5075C24.3059 35.1722 22.4494 29.6506 25.367 22.2603C25.367 22.2603 29.8746 20.8354 40.0382 27.7809C44.3896 26.6036 48.8772 26.0047 53.385 25.9997C57.8926 25.9997 62.4876 26.6237 66.7307 27.7809C76.8954 20.8354 81.403 22.2603 81.403 22.2603C84.3206 29.6506 82.463 35.1722 81.933 36.5075C85.3806 40.2469 87.4131 45.055 87.4131 50.9318C87.4131 71.5901 74.9514 76.1305 63.0186 77.4669C64.9637 79.1585 66.6422 82.3635 66.6422 87.4393C66.6422 94.6515 66.5548 100.44 66.5548 102.22C66.5548 103.645 67.5273 105.337 70.1783 104.803C91.3907 97.6784 106.681 77.5554 106.681 53.7817C106.769 24.0404 82.817 0 53.385 0Z",fill:"currentColor"})})}let te="var(--gh-success)",tt="var(--gh-link)",tn=[{id:"validate",title:"Validate",lines:[{kind:"file",verb:"Validated",path:"openapi.yml",meta:"(4/4 endpoints)"}]},{id:"generate",title:"Generate",lines:[{kind:"file",verb:"Generated",path:"src/Client.ts"},{kind:"file",verb:"Generated",path:"src/types/User.ts"},{kind:"file",verb:"Generated",path:"src/types/CreateUserRequest.ts"},{kind:"file",verb:"Generated",path:"src/types/UpdateUserRequest.ts"},{kind:"file",verb:"Generated",path:"tests/Client.test.ts"},{kind:"file",verb:"Generated",path:"package.json"},{kind:"file",verb:"Generated",path:"README.md"},{kind:"file",verb:"Generated",path:"Reference.md"}]},{id:"test",title:"Test",lines:[{kind:"command",tool:"yarn",arg:"test",meta:"(87/87 passed)"}]},{id:"publish",title:"Publish",lines:[{kind:"command",tool:"npm",arg:"publish"}]}],tr={yarn:tt,npm:tt,fern:tt};function ti({state:e}){return"done"===e?(0,t.jsx)("span",{style:{width:14,height:14,borderRadius:"50%",background:te,display:"inline-flex",alignItems:"center",justifyContent:"center",color:"white",flexShrink:0},children:(0,t.jsx)(e8.Check,{size:9,strokeWidth:3.5})}):"running"===e?(0,t.jsx)(e$.Loader2,{size:14,strokeWidth:2.4,color:"var(--fg-tertiary)",style:{animation:"fha-spin 900ms linear infinite",flexShrink:0}}):(0,t.jsx)("span",{style:{width:14,height:14,borderRadius:"50%",border:"1.5px solid var(--border-strong)",background:"var(--bg-surface)",flexShrink:0}})}function ta({line:e}){return"file"===e.kind?(0,t.jsxs)("div",{style:{display:"flex",gap:6,lineHeight:1.4},children:[(0,t.jsx)("span",{style:{color:tt,fontWeight:600},children:e.verb}),(0,t.jsx)("span",{style:{color:"var(--fg-primary)"},children:e.path}),e.meta&&(0,t.jsx)("span",{style:{color:te,fontWeight:600},children:e.meta})]}):(0,t.jsxs)("div",{style:{display:"flex",gap:6,lineHeight:1.4},children:[(0,t.jsx)("span",{style:{color:tr[e.tool],fontWeight:600},children:e.tool}),(0,t.jsx)("span",{style:{color:"var(--fg-primary)"},children:e.arg}),e.meta&&(0,t.jsx)("span",{style:{color:te,fontWeight:600},children:e.meta})]})}function ts({step:e,state:n,visibleLines:r}){return(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column"},children:[(0,t.jsxs)("div",{className:"fha-gh-step-chip",style:{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"var(--bg-subtle)",border:"1px solid var(--border)",borderRadius:6},children:[(0,t.jsx)(e9.ChevronDown,{size:12,color:"var(--fg-tertiary)",strokeWidth:2.2}),(0,t.jsx)(ti,{state:n}),(0,t.jsx)("span",{style:{fontSize:12.5,fontWeight:600,color:"pending"===n?"var(--fg-tertiary)":"var(--fg-primary)"},children:e.title})]}),r>0&&(0,t.jsx)("div",{className:"fha-gh-lines",style:{padding:"5px 10px 2px 26px",display:"flex",flexDirection:"column",gap:0,fontFamily:"var(--font-mono)",fontSize:11.5},children:e.lines.slice(0,r).map((e,n)=>(0,t.jsx)("div",{className:"fha-gh-line",style:{animation:"fha-fadeIn 220ms ease both"},children:(0,t.jsx)(ta,{line:e})},n))})]})}function to({onClose:e}){let[r,i]=n.useState(!1),a="var(--border-strong)",s={width:12,height:12,borderRadius:"50%",flexShrink:0,transition:"background 120ms ease",border:"none",padding:0,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(0,0,0,0.55)"};return(0,t.jsxs)("div",{style:{display:"flex",gap:6,alignItems:"center"},onMouseEnter:()=>i(!0),onMouseLeave:()=>i(!1),children:[(0,t.jsx)("button",{type:"button",onClick:e,"aria-label":"Close",style:{...s,background:r?"#FF5F57":a,cursor:e?"pointer":"default"},children:r&&(0,t.jsx)("svg",{width:8,height:8,viewBox:"0 0 8 8",fill:"none","aria-hidden":"true",children:(0,t.jsx)("path",{d:"M1.75 1.75 L6.25 6.25 M6.25 1.75 L1.75 6.25",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})})}),(0,t.jsx)("div",{style:{...s,background:r?"#FEBC2E":a}}),(0,t.jsx)("div",{style:{...s,background:r?"#28C840":a}})]})}function tl({width:e=380,height:r,onClose:i,autoPlay:a=!1,chromeless:s=!1,compact:o=!1}){let[l,d]=n.useState(()=>tn.map(()=>"pending")),[c,p]=n.useState(()=>tn.map(()=>0)),[u,g]=n.useState(!1),[m,h]=n.useState(!1),y=n.useRef([]),f=n.useCallback(()=>{y.current.forEach(clearTimeout),y.current=[]},[]),b=n.useCallback(()=>{f(),d(tn.map(()=>"pending")),p(tn.map(()=>0)),g(!1),h(!1)},[f]),x=n.useCallback(e=>{let t=e?.steps||tn;b(),h(!0),window.__sdkCatalogDemo?.markGenerating?.("typescript");let n=250;t.forEach((e,t)=>{y.current.push(setTimeout(()=>{d(e=>{let n=[...e];return n[t]="running",n})},n)),e.lines.forEach((e,r)=>{n+=220,y.current.push(setTimeout(()=>{p(e=>{let n=[...e];return n[t]=r+1,n})},n))}),n+=320,y.current.push(setTimeout(()=>{d(e=>{let n=[...e];return n[t]="done",n})},n))}),n+=700,y.current.push(setTimeout(()=>{g(!0),window.__sdkCatalogDemo?.markGenerationDone?.("typescript")},n)),n+=1100,y.current.push(setTimeout(()=>{window.__sdkCatalogDemo?.markCelebrate?.("typescript")},n)),n+=1500,y.current.push(setTimeout(()=>{window.__sdkCatalogDemo?.markPublished?.("typescript",{version:"2.5.0",date:"just now"})},n))},[b]);n.useEffect(()=>(window.__githubActionsDemo={play:x,reset:b},()=>{f(),window.__githubActionsDemo=null}),[x,b,f]);let v=n.useRef(null),w=n.useRef(null),j=n.useRef(0);n.useLayoutEffect(()=>{if(!o)return;let e=v.current,t=w.current;if(!e||!t)return;let n=t.querySelectorAll(".fha-gh-line, .fha-gh-step-chip"),r=n[n.length-1];if(!r){j.current=0,t.style.transform="translateY(0px)";return}let i=e.getBoundingClientRect(),a=r.getBoundingClientRect(),s=a.top+a.height/2-i.top,l=e.clientHeight/2;j.current+=l-s,t.style.transform=`translateY(${j.current}px)`},[o,l,c]),n.useEffect(()=>{a&&x()},[]);let k=(0,t.jsx)("div",{className:"fha-gh-steps",style:{display:"flex",flexDirection:"column",gap:6},children:tn.map((e,n)=>"pending"===l[n]?null:(0,t.jsx)("div",{className:"fha-gh-step",style:{animation:"fha-fadeIn 220ms ease both"},children:(0,t.jsx)(ts,{step:e,state:l[n],visibleLines:c[n]})},e.id))});return(0,t.jsxs)("div",{"data-demo":"github-actions",style:{width:o?280:e,height:o?"auto":r,background:s?"transparent":"var(--bg-surface)",borderRadius:12*!s,overflow:s?"visible":"hidden",boxShadow:s?"none":"0 2px 125px 0 rgba(255, 245, 207, 0.3), 0 20px 48px -12px rgba(0,0,0,0.5)",border:s?"none":"1px solid var(--border-strong)",fontFamily:"var(--font-sans)",color:"var(--fg-primary)",position:s?"relative":void 0},children:[s&&(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"8px 0 10px",borderBottom:"1px solid var(--border)",marginBottom:14,fontSize:12.5,fontFamily:'"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'},children:[(0,t.jsx)("span",{style:{display:"inline-flex",color:"var(--fg-primary)"},children:(0,t.jsx)(e7,{size:16})}),(0,t.jsxs)("span",{style:{display:"inline-flex",alignItems:"baseline",gap:3},children:[(0,t.jsx)("span",{style:{color:"var(--fg-secondary)",fontWeight:400},children:"your-co"}),(0,t.jsx)("span",{style:{color:"var(--fg-tertiary)"},children:"/"}),(0,t.jsx)("span",{style:{fontWeight:700,color:"var(--fg-primary)"},children:"sdk"})]}),(0,t.jsx)("span",{style:{marginLeft:6,padding:"2px 8px",borderRadius:999,background:"var(--bg-active)",fontSize:11,fontWeight:600,color:"var(--fg-secondary)"},children:"Actions"}),(0,t.jsx)("span",{style:{flex:1}}),(0,t.jsxs)("span",{style:{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--fg-tertiary)",display:"inline-flex",alignItems:"center",gap:5},children:[(0,t.jsxs)("svg",{width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,t.jsx)("line",{x1:"6",y1:"3",x2:"6",y2:"15"}),(0,t.jsx)("circle",{cx:"18",cy:"6",r:"3"}),(0,t.jsx)("circle",{cx:"6",cy:"18",r:"3"}),(0,t.jsx)("path",{d:"M18 9a9 9 0 0 1-9 9"})]}),"main"]}),i&&(0,t.jsx)("button",{type:"button",onClick:i,"aria-label":"Close",style:{marginLeft:4,width:22,height:22,borderRadius:5,border:"none",background:"transparent",color:"var(--fg-tertiary)",cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",padding:0,transition:"color 140ms, background 140ms"},onMouseEnter:e=>{e.currentTarget.style.color="var(--fg-primary)",e.currentTarget.style.background="var(--bg-active)"},onMouseLeave:e=>{e.currentTarget.style.color="var(--fg-tertiary)",e.currentTarget.style.background="transparent"},children:(0,t.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,t.jsx)("path",{d:"M18 6L6 18"}),(0,t.jsx)("path",{d:"M6 6l12 12"})]})})]}),!s&&(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",borderBottom:"1px solid var(--border-strong)",background:"var(--bg-subtle)"},children:[(0,t.jsx)(to,{onClose:i}),(0,t.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:5,marginLeft:4,fontSize:11.5,color:"var(--fg-secondary)"},children:[(0,t.jsx)("span",{style:{color:"var(--fg-primary)",display:"inline-flex"},children:(0,t.jsx)(e7,{size:12})}),(0,t.jsx)("span",{style:{fontWeight:600},children:"your-co"}),(0,t.jsx)("span",{style:{color:"var(--fg-tertiary)"},children:"/"}),(0,t.jsx)("span",{style:{fontWeight:700,color:"var(--fg-primary)"},children:"sdk"}),(0,t.jsx)("span",{style:{color:"var(--fg-tertiary)"},children:"·"}),(0,t.jsx)("span",{children:"Actions"})]}),(0,t.jsx)("div",{style:{flex:1}})]}),(0,t.jsxs)("div",{style:{padding:s?0:"12px 12px 14px"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:9,marginBottom:10},children:[(0,t.jsx)("div",{style:{width:24,height:24,borderRadius:6,overflow:"hidden",flexShrink:0,boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.06)"},children:(0,t.jsx)(Y,{id:"typescript",size:24})}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column"},children:[(0,t.jsx)("span",{style:{fontSize:13,fontWeight:600,lineHeight:1.2,color:"var(--fg-primary)"},children:"TypeScript SDK"}),(0,t.jsx)("span",{style:{fontSize:11,lineHeight:1.3,color:"var(--fg-tertiary)"},children:m?u?"Finished in 5s":"In progress…":"Ready to run"})]}),(0,t.jsx)("div",{style:{flex:1}})]}),o?(0,t.jsx)("div",{ref:v,className:"fha-gh-compact-window",children:(0,t.jsx)("div",{ref:w,className:"fha-gh-compact-list",children:k})}):k]})]})}function td(){let{sweepActive:e,sweepColor:r}=(0,a.useBrand)(),i=n.useMemo(()=>{let e=[];for(let t=0;t<a.SWEEP_ROWS;t++)for(let n=0;n<a.SWEEP_COLS;n++){let r=(4*Math.random()-2)*a.SWEEP_STEP_MS;e.push({row:t,col:n,jitter:r})}return e},[]);return e&&r?(0,t.jsx)("div",{"aria-hidden":!0,style:{position:"absolute",inset:0,zIndex:100,pointerEvents:"none",display:"grid",gridTemplateColumns:`repeat(${a.SWEEP_COLS}, 1fr)`,gridTemplateRows:`repeat(${a.SWEEP_ROWS}, 1fr)`,filter:"saturate(0.55) brightness(0.92)"},children:i.map(({row:e,col:n,jitter:i})=>{let s=Math.max(0,(n+e)*a.SWEEP_STEP_MS+i);return(0,t.jsx)("div",{style:{background:r,opacity:0,animation:`fha-pixel-burst ${a.SWEEP_CELL_MS}ms cubic-bezier(0.4, 0, 0.6, 1) ${s}ms forwards`}},`${e}-${n}`)})}):null}function tc({text:e,stepMs:r=40,scrambleMs:i=40,delayMs:a=0,pool:s="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=<>?/"}){let o=n.useRef(null);return n.useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){o.current&&(o.current.textContent=e);return}let t=e.split(""),n=t.length*r+i,l=0,d=0,c=0,p=()=>{let a=performance.now()-c,d=[];for(let e=0;e<t.length;e++){let n=e*r,o=n+i;if(a<n)break;let l=t[e];" "===l?d.push(" "):a<o?d.push(s[Math.floor(Math.random()*s.length)]):d.push(l)}o.current&&(o.current.textContent=d.join("")),a<n?l=requestAnimationFrame(p):o.current&&(o.current.textContent=e)};return d=window.setTimeout(()=>{c=performance.now(),l=requestAnimationFrame(p)},a),()=>{window.clearTimeout(d),cancelAnimationFrame(l)}},[e,r,i,a,s]),(0,t.jsx)("span",{ref:o})}var tp=e.i(768877);function tu({breadcrumbs:e,title:r,subtitle:a,readTime:s,updated:o,toc:l,children:d}){return(0,t.jsxs)("div",{style:{display:"flex",maxWidth:1100,margin:"0 auto",padding:"0 32px",gap:32},children:[(0,t.jsxs)("article",{style:{flex:1,minWidth:0,padding:"32px 0 64px"},children:[(0,t.jsx)("div",{style:{fontSize:12,color:"var(--brand-fg)",display:"flex",alignItems:"center",gap:6,marginBottom:14},children:e.map((e,r)=>(0,t.jsxs)(n.Fragment,{children:[r>0&&(0,t.jsx)(i.Icon,{name:"chevronRight",size:11}),(0,t.jsx)("span",{children:e})]},r))}),(0,t.jsx)("h1",{style:{margin:0,fontSize:32,fontWeight:700,letterSpacing:"-0.02em",color:"var(--fg-primary)"},children:r}),(0,t.jsx)("p",{style:{marginTop:10,marginBottom:0,fontSize:15,lineHeight:1.6,color:"var(--fg-secondary)",maxWidth:640},children:a}),(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:14,marginTop:16,fontSize:12,color:"var(--fg-tertiary)"},children:[(0,t.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:5},children:[(0,t.jsx)(i.Icon,{name:"zap",size:12}),s]}),(0,t.jsx)("span",{style:{color:"var(--border-strong)"},children:"·"}),(0,t.jsx)("span",{children:o})]}),(0,t.jsx)("div",{style:{marginTop:32},children:d})]}),(0,t.jsx)(eT,{entries:l})]})}function tg({children:e}){return(0,t.jsx)("div",{style:{fontSize:14,lineHeight:1.7,color:"var(--fg-secondary)",display:"flex",flexDirection:"column",gap:14},children:e})}function tm({id:e,children:n}){return(0,t.jsx)("h2",{id:e,style:{margin:"40px 0 10px",fontSize:22,fontWeight:700,letterSpacing:"-0.01em",color:"var(--fg-primary)",scrollMarginTop:80},children:n})}function th({children:e}){return(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:13,padding:"1px 5px",borderRadius:4,background:"var(--bg-hover)"},children:e})}function ty({code:e}){return(0,t.jsx)("pre",{style:{margin:"14px 0",padding:"14px 16px",background:"var(--bg-surface)",border:"1px solid var(--border)",borderRadius:10,fontFamily:"var(--font-mono)",fontSize:12.5,lineHeight:1.65,color:"var(--fg-primary)",overflowX:"auto"},children:e})}function tf({children:e}){return(0,t.jsxs)("div",{style:{display:"flex",gap:10,padding:"12px 14px",margin:"14px 0",border:"1px solid var(--accent-border)",background:"var(--accent-bg)",borderRadius:8,fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:[(0,t.jsx)("span",{style:{color:"var(--brand-fg)",display:"inline-flex",flexShrink:0,paddingTop:2},children:(0,t.jsx)(i.Icon,{name:"flag",size:14})}),(0,t.jsx)("div",{children:e})]})}function tb({features:e}){return(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:10,margin:"16px 0"},children:e.map(e=>(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:6,padding:"16px 18px",border:"1px solid var(--border)",borderRadius:10,background:"var(--bg-surface)"},children:[(0,t.jsx)("span",{style:{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:7,background:"var(--bg-muted)",color:"var(--fg-secondary)",marginBottom:4},children:(0,t.jsx)(i.Icon,{name:e.icon,size:14})}),(0,t.jsx)("div",{style:{fontSize:13.5,fontWeight:600,color:"var(--fg-primary)"},children:e.title}),(0,t.jsx)("div",{style:{fontSize:13,lineHeight:1.55,color:"var(--fg-secondary)"},children:e.body})]},e.title))})}function tx(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Get started","Build your first agent"],title:"Build your first agent",subtitle:"Create a custom agent, configure its tools, and deploy it to handle live conversations — all in about ten minutes.",readTime:"10 min read",updated:"Updated April 22, 2026",toc:[{id:"prerequisites",label:"Prerequisites"},{id:"create-agent",label:"Create the agent"},{id:"add-tools",label:"Add tools"},{id:"test-locally",label:"Test locally"},{id:"deploy",label:"Deploy"},{id:"next-steps",label:"Next steps"}],children:[(0,t.jsx)(tm,{id:"prerequisites",children:"Prerequisites"}),(0,t.jsxs)(tg,{children:[(0,t.jsx)("p",{style:{margin:0},children:"Before you begin, make sure you have:"}),(0,t.jsxs)("ul",{style:{margin:0,paddingLeft:20},children:[(0,t.jsxs)("li",{children:["An API key (see the ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Quickstart"})," ","guide)"]}),(0,t.jsx)("li",{children:"Node.js 18+ or Python 3.9+"}),(0,t.jsx)("li",{children:"The SDK installed in your project"})]})]}),(0,t.jsx)(tm,{id:"create-agent",children:"Create the agent"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Agents are the core abstraction in the platform. Each agent has a system prompt, an optional set of tools, and a conversation configuration that controls turn-taking behavior."})}),(0,t.jsx)(ty,{code:`const agent = await client.agents.create({
  name: "order-support",
  systemPrompt: \`You are a helpful support agent.
    Help customers with order status, returns,
    and general product questions.\`,
  model: "gpt-4o",
  temperature: 0.3,
});

console.log("Agent created:", agent.id);`}),(0,t.jsx)(tm,{id:"add-tools",children:"Add tools"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Tools let your agent take actions — look up order status, query a database, or call an external API. Define each tool with a name, description, and JSON schema for its parameters."})}),(0,t.jsx)(ty,{code:`await client.agents.tools.create(agent.id, {
  name: "lookup_order",
  description: "Look up an order by ID",
  parameters: {
    type: "object",
    properties: {
      order_id: {
        type: "string",
        description: "The order ID (e.g. A-1042)"
      }
    },
    required: ["order_id"]
  },
  handler: "https://api.your-co.com/orders/{order_id}"
});`}),(0,t.jsxs)(tf,{children:["Each tool call is traced and visible in the dashboard under"," ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Runs → Tool calls"}),". Use this to debug unexpected behavior."]}),(0,t.jsx)(tm,{id:"test-locally",children:"Test locally"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Run the agent against a sample input to verify it behaves correctly before deploying to production."})}),(0,t.jsx)(ty,{code:`const run = await client.agents.run({
  agent: agent.id,
  input: "Where is my order #A-1042?",
});

console.log(run.output);
// → "Your order #A-1042 shipped on April 20 and
//    is expected to arrive by April 24."`}),(0,t.jsx)(tm,{id:"deploy",children:"Deploy"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"When you're happy with the agent's behavior, publish it to make it available via the API. Published agents are versioned — you can roll back at any time."})}),(0,t.jsx)(ty,{code:`await client.agents.publish(agent.id, {
  version: "1.0.0",
  description: "Initial release",
});`}),(0,t.jsx)(tm,{id:"next-steps",children:"Next steps"}),(0,t.jsxs)(tg,{children:[(0,t.jsx)("p",{style:{margin:0},children:"Now that you have a working agent, explore these guides to add more capabilities:"}),(0,t.jsxs)("ul",{style:{margin:0,paddingLeft:20},children:[(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Designing prompts"})," — craft system prompts that produce consistent, high-quality responses"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Tools & function calling"})," — connect your agent to databases, APIs, and external services"]}),(0,t.jsxs)("li",{children:[(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Memory & context"})," — give agents long-term memory across conversations"]})]})]})]})}function tv(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Get started","Core concepts"],title:"Core concepts",subtitle:"Understand the building blocks of the platform — agents, runs, tools, and conversations.",readTime:"5 min read",updated:"Updated April 15, 2026",toc:[{id:"agents",label:"Agents"},{id:"runs",label:"Runs"},{id:"tools",label:"Tools"},{id:"conversations",label:"Conversations"},{id:"models",label:"Models"}],children:[(0,t.jsx)(tm,{id:"agents",children:"Agents"}),(0,t.jsxs)(tg,{children:[(0,t.jsxs)("p",{style:{margin:0},children:["An ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"agent"})," is the top-level resource. It encapsulates a system prompt, a model configuration, a set of tools, and conversation settings. Think of it as a deployed unit of AI behavior."]}),(0,t.jsx)("p",{style:{margin:0},children:"Agents are versioned and can be published to production. Each version is immutable — when you update an agent, a new version is created automatically."})]}),(0,t.jsx)(tm,{id:"runs",children:"Runs"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["A ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"run"})," is a single invocation of an agent. You send an input, the agent processes it (potentially calling tools along the way), and returns an output. Every run is traced, timed, and stored for replay."]})}),(0,t.jsx)(ty,{code:`// A run captures the full execution trace
{
  "run_id": "run_abc123",
  "agent_id": "agent_xyz",
  "input": "Where is my order?",
  "output": "Your order #A-1042 shipped...",
  "tool_calls": [...],
  "latency_ms": 1240,
  "tokens": { "prompt": 312, "completion": 87 }
}`}),(0,t.jsx)(tm,{id:"tools",children:"Tools"}),(0,t.jsxs)(tg,{children:[(0,t.jsxs)("p",{style:{margin:0},children:[(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Tools"}),"extend an agent's capabilities. When the model decides it needs external data or wants to take an action, it emits a tool call. The platform executes the tool and feeds the result back into the model."]}),(0,t.jsx)("p",{style:{margin:0},children:"Tools can be HTTP endpoints, database queries, or custom functions. The schema is defined using JSON Schema so the model knows what arguments to pass."})]}),(0,t.jsx)(tm,{id:"conversations",children:"Conversations"}),(0,t.jsxs)(tg,{children:[(0,t.jsxs)("p",{style:{margin:0},children:["A ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"conversation"})," is a sequence of runs that share context. The platform automatically manages the conversation history and passes it to each subsequent run so the agent maintains continuity."]}),(0,t.jsx)("p",{style:{margin:0},children:"You can configure how much history is included, whether to summarize older messages, and when to start a new conversation thread."})]}),(0,t.jsx)(tm,{id:"models",children:"Models"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"The platform supports multiple model providers including OpenAI, Anthropic, Google, and open-source models via custom endpoints. Each agent can be configured with its own model, temperature, and token limits."})}),(0,t.jsx)(tb,{features:[{icon:"zap",title:"GPT-4o",body:"Best balance of speed and quality for most use cases."},{icon:"zap",title:"Claude 3.5 Sonnet",body:"Excellent for long-context reasoning and code generation."},{icon:"zap",title:"Gemini 2.0",body:"Multimodal support with large context windows."},{icon:"zap",title:"Custom endpoints",body:"Bring your own model via any OpenAI-compatible API."}]})]})}function tw(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Agents","Designing prompts"],title:"Designing prompts",subtitle:"Craft system prompts that produce consistent, high-quality responses. Learn patterns for role definition, guardrails, and output formatting.",readTime:"8 min read",updated:"Updated April 20, 2026",toc:[{id:"system-prompt",label:"System prompt basics"},{id:"role-definition",label:"Role definition"},{id:"output-format",label:"Output formatting"},{id:"guardrails",label:"Guardrails"},{id:"testing",label:"Testing prompts"}],children:[(0,t.jsx)(tm,{id:"system-prompt",children:"System prompt basics"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"The system prompt is the single most important configuration for your agent. It defines the agent's personality, capabilities, and constraints. A well-written system prompt reduces hallucinations and keeps responses on-topic."})}),(0,t.jsx)(ty,{code:`{
  "systemPrompt": "You are a customer support agent for Acme Corp. You help customers with order status, returns, and product questions. Always be polite, concise, and helpful. If you don't know the answer, say so honestly rather than guessing."
}`}),(0,t.jsx)(tm,{id:"role-definition",children:"Role definition"}),(0,t.jsxs)(tg,{children:[(0,t.jsx)("p",{style:{margin:0},children:'Start with a clear role statement. Tell the agent who it is, who it serves, and what its primary objectives are. Be specific about the domain — "customer support for an e-commerce platform" is better than "helpful assistant."'}),(0,t.jsx)("p",{style:{margin:0},children:"Include examples of ideal responses for common scenarios. Few-shot examples in the system prompt dramatically improve consistency."})]}),(0,t.jsx)(tm,{id:"output-format",children:"Output formatting"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"When you need structured output, describe the format explicitly in the system prompt. Use JSON mode or instruct the model to respond in a specific format."})}),(0,t.jsx)(ty,{code:`{
  "systemPrompt": "Always respond with JSON: { \\"status\\": \\"resolved\\" | \\"escalated\\", \\"summary\\": string, \\"next_action\\": string }"
}`}),(0,t.jsx)(tm,{id:"guardrails",children:"Guardrails"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["Define what the agent should ",(0,t.jsx)("em",{children:"not"}),"do. Explicit constraints prevent the agent from going off-topic, making promises it can't keep, or sharing sensitive information."]})}),(0,t.jsx)(tf,{children:"Always test your guardrails with adversarial inputs. Try to make the agent break its own rules — if you can, your users will too."}),(0,t.jsx)(tm,{id:"testing",children:"Testing prompts"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["Use the ",(0,t.jsx)(th,{children:"evals"})," framework to test prompts against a suite of expected inputs and outputs. Track prompt quality over time and catch regressions before they reach production."]})})]})}function tj(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Agents","Tools & function calling"],title:"Tools & function calling",subtitle:"Connect your agents to external systems. Define tool schemas, handle responses, and compose multi-step workflows.",readTime:"7 min read",updated:"Updated April 18, 2026",toc:[{id:"overview",label:"Overview"},{id:"defining-tools",label:"Defining tools"},{id:"http-tools",label:"HTTP tools"},{id:"custom-handlers",label:"Custom handlers"},{id:"chaining",label:"Chaining tools"}],children:[(0,t.jsx)(tm,{id:"overview",children:"Overview"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Tools let your agents interact with the outside world. When the model determines it needs information or wants to take an action, it emits a structured tool call. The platform executes the tool and feeds the result back into the conversation."})}),(0,t.jsx)(tm,{id:"defining-tools",children:"Defining tools"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Each tool needs a name, description, and a JSON Schema for its parameters. The description is what the model reads to decide when to use the tool — make it specific and action-oriented."})}),(0,t.jsx)(ty,{code:`await client.agents.tools.create(agentId, {
  name: "get_weather",
  description: "Get the current weather for a city",
  parameters: {
    type: "object",
    properties: {
      city: { type: "string" },
      units: { type: "string", enum: ["celsius", "fahrenheit"] }
    },
    required: ["city"]
  }
});`}),(0,t.jsx)(tm,{id:"http-tools",children:"HTTP tools"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"The simplest tool type is an HTTP endpoint. Provide a URL template and the platform will make the request with the model's arguments interpolated."})}),(0,t.jsx)(ty,{code:`{
  "handler": "https://api.weather.com/v1/current?city={city}&units={units}",
  "method": "GET",
  "headers": { "Authorization": "Bearer {{WEATHER_API_KEY}}" }
}`}),(0,t.jsx)(tm,{id:"custom-handlers",children:"Custom handlers"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"For complex logic, use a webhook handler. The platform sends the tool arguments to your endpoint, and your code returns the result. This is ideal for database lookups, multi-step computations, or anything that requires business logic."})}),(0,t.jsx)(tm,{id:"chaining",children:"Chaining tools"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Agents can call multiple tools in sequence within a single run. The model decides the order based on the conversation context. You can also configure tool dependencies to enforce a specific execution order."})})]})}function tk(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Agents","Memory & context"],title:"Memory & context",subtitle:"Give your agents long-term memory and manage conversation context windows effectively.",readTime:"6 min read",updated:"Updated April 16, 2026",toc:[{id:"context-window",label:"Context window"},{id:"conversation-history",label:"Conversation history"},{id:"long-term-memory",label:"Long-term memory"},{id:"rag",label:"RAG integration"}],children:[(0,t.jsx)(tm,{id:"context-window",children:"Context window"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Every model has a finite context window. The platform automatically manages what fits inside it — trimming older messages, summarizing history, and prioritizing recent and relevant content."})}),(0,t.jsx)(ty,{code:`{
  "context": {
    "max_tokens": 128000,
    "strategy": "sliding_window",
    "summarize_after": 20
  }
}`}),(0,t.jsx)(tm,{id:"conversation-history",children:"Conversation history"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"By default, each conversation includes the full message history. For long conversations, enable automatic summarization to condense older turns while preserving key facts."})}),(0,t.jsx)(tm,{id:"long-term-memory",children:"Long-term memory"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Long-term memory persists across conversations. The agent can store and retrieve facts about users, preferences, and past interactions. This is powered by a vector store that's automatically managed."})}),(0,t.jsx)(ty,{code:`await client.memory.store(agentId, {
  key: "user_preference",
  value: "Prefers email over phone",
  user_id: "user_123",
  ttl: "30d"
});`}),(0,t.jsx)(tm,{id:"rag",children:"RAG integration"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Connect your agent to a knowledge base for retrieval-augmented generation. Upload documents, and the platform will chunk, embed, and index them automatically. The agent retrieves relevant passages at query time."})})]})}function tS(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Agents","Multi-agent handoff"],title:"Multi-agent handoff",subtitle:"Route conversations between specialized agents. Build a triage layer that dispatches to domain experts.",readTime:"6 min read",updated:"Updated April 14, 2026",toc:[{id:"why-handoff",label:"Why multi-agent"},{id:"routing",label:"Routing logic"},{id:"triage",label:"Triage agent"},{id:"context-passing",label:"Context passing"}],children:[(0,t.jsx)(tm,{id:"why-handoff",children:"Why multi-agent"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"A single monolithic agent struggles with diverse tasks. Multi-agent architectures let you build specialized agents — one for billing, one for technical support, one for sales — and route conversations to the right expert."})}),(0,t.jsx)(tm,{id:"routing",children:"Routing logic"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Define routing rules that inspect the user's message and conversation history to determine which agent should handle the request. Routes can be keyword-based, classifier-based, or use the triage agent pattern."})}),(0,t.jsx)(ty,{code:`const router = await client.routers.create({
  routes: [
    { match: "billing|invoice|payment", agent: "billing-agent" },
    { match: "bug|error|crash", agent: "technical-support" },
    { fallback: true, agent: "general-support" }
  ]
});`}),(0,t.jsx)(tm,{id:"triage",children:"Triage agent"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"The triage pattern uses a lightweight agent whose sole job is classification. It reads the user message, picks the best specialist, and hands off the conversation with a context summary."})}),(0,t.jsx)(tm,{id:"context-passing",children:"Context passing"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"When a conversation is handed off, the full conversation history and any extracted metadata are passed to the receiving agent. The user experiences a seamless transition."})})]})}function tC(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Agents","Evals & regression tests"],title:"Evals & regression tests",subtitle:"Measure agent quality, catch regressions, and track performance over time with automated evaluations.",readTime:"7 min read",updated:"Updated April 12, 2026",toc:[{id:"overview",label:"Overview"},{id:"eval-types",label:"Eval types"},{id:"creating-evals",label:"Creating evals"},{id:"ci-integration",label:"CI integration"}],children:[(0,t.jsx)(tm,{id:"overview",children:"Overview"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Evals are automated tests for your agents. They run a set of inputs through the agent and check the outputs against expected results. Use them to catch regressions when you update prompts, tools, or model versions."})}),(0,t.jsx)(tm,{id:"eval-types",children:"Eval types"}),(0,t.jsx)(tb,{features:[{icon:"check",title:"Exact match",body:"Output must match the expected string exactly."},{icon:"check",title:"Semantic similarity",body:"Output must be semantically similar to the expected answer above a threshold."},{icon:"check",title:"Contains",body:"Output must contain specific keywords or phrases."},{icon:"check",title:"Custom function",body:"Write your own scoring function for complex assertions."}]}),(0,t.jsx)(tm,{id:"creating-evals",children:"Creating evals"}),(0,t.jsx)(ty,{code:`await client.evals.create(agentId, {
  name: "order-status-accuracy",
  cases: [
    {
      input: "Where is order #A-1042?",
      expected: { contains: ["shipped", "April 24"] }
    },
    {
      input: "I want to return my order",
      expected: { contains: ["return", "refund"] }
    }
  ]
});`}),(0,t.jsx)(tm,{id:"ci-integration",children:"CI integration"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Run evals as part of your CI pipeline. The CLI outputs results in JUnit XML format so they plug into any test reporting tool."})}),(0,t.jsx)(ty,{code:"$ your-co evals run --agent order-support --format junit"})]})}function tA(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Voice","Choosing a voice"],title:"Choosing a voice",subtitle:"Select from pre-built voices or clone a custom voice for your brand. Configure prosody, speed, and emotion.",readTime:"4 min read",updated:"Updated April 10, 2026",toc:[{id:"pre-built",label:"Pre-built voices"},{id:"voice-cloning",label:"Voice cloning"},{id:"prosody",label:"Prosody settings"}],children:[(0,t.jsx)(tm,{id:"pre-built",children:"Pre-built voices"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["The platform ships with 30+ pre-built voices across multiple languages and accents. Each voice is optimized for low latency and natural prosody. Preview them in the dashboard under ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Voice → Library"}),"."]})}),(0,t.jsx)(ty,{code:`{
  "voice_config": {
    "voice_id": "alloy",
    "model": "tts-1-hd",
    "language": "en-US",
    "speed": 1.0
  }
}`}),(0,t.jsx)(tm,{id:"voice-cloning",children:"Voice cloning"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Upload a 30-second sample of any voice and the platform will create a custom voice clone. Cloned voices support the same prosody controls as pre-built ones."})}),(0,t.jsxs)(tf,{children:["Voice cloning requires explicit consent from the voice owner. See our"," ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Terms of Service"})," for usage guidelines."]}),(0,t.jsx)(tm,{id:"prosody",children:"Prosody settings"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Fine-tune how the voice sounds with speed, pitch, and emphasis controls. These can be adjusted globally or per-utterance for dynamic conversations."})})]})}function tT(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Voice","Interruption handling"],title:"Interruption handling",subtitle:"Configure how your voice agent handles user interruptions during speech. Balance responsiveness with conversation flow.",readTime:"5 min read",updated:"Updated April 8, 2026",toc:[{id:"how-it-works",label:"How it works"},{id:"modes",label:"Interruption modes"},{id:"sensitivity",label:"Sensitivity tuning"},{id:"best-practices",label:"Best practices"}],children:[(0,t.jsx)(tm,{id:"how-it-works",children:"How it works"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"When the agent is speaking and detects user speech, it must decide whether to stop and listen, ignore the interruption, or finish its current sentence. This is controlled by the interruption handling configuration."})}),(0,t.jsx)(tm,{id:"modes",children:"Interruption modes"}),(0,t.jsx)(tb,{features:[{icon:"zap",title:"Immediate",body:"Stop speaking immediately when the user starts talking. Best for quick Q&A."},{icon:"zap",title:"Sentence boundary",body:"Finish the current sentence before yielding. Feels more natural for longer responses."},{icon:"zap",title:"Manual",body:"Never auto-interrupt. The client controls when to pause via the API."}]}),(0,t.jsx)(tm,{id:"sensitivity",children:"Sensitivity tuning"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Adjust the VAD (voice activity detection) threshold to control how sensitive the agent is to background noise. Higher thresholds require louder speech to trigger an interruption, reducing false positives in noisy environments."})}),(0,t.jsx)(ty,{code:`{
  "conversation_config": {
    "interruption": "sentence_boundary",
    "vad_threshold": 0.6,
    "silence_timeout_ms": 800
  }
}`}),(0,t.jsx)(tm,{id:"best-practices",children:"Best practices"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["Use ",(0,t.jsx)(th,{children:"sentence_boundary"})," mode for most voice agents. It feels natural to users while keeping the agent responsive. Reserve"," ",(0,t.jsx)(th,{children:"immediate"})," mode for fast-paced interactions like phone trees."]})})]})}function tI(){return(0,t.jsxs)(tu,{breadcrumbs:["Docs","Voice","Streaming audio"],title:"Streaming audio",subtitle:"Stream audio in real time over WebSockets. Handle bi-directional audio for voice conversations with minimal latency.",readTime:"6 min read",updated:"Updated April 6, 2026",toc:[{id:"websocket-protocol",label:"WebSocket protocol"},{id:"audio-formats",label:"Audio formats"},{id:"client-integration",label:"Client integration"},{id:"error-handling",label:"Error handling"}],children:[(0,t.jsx)(tm,{id:"websocket-protocol",children:"WebSocket protocol"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Voice conversations use a persistent WebSocket connection for bi-directional audio streaming. The client sends raw audio frames and receives synthesized speech in real time."})}),(0,t.jsx)(ty,{code:`const ws = new WebSocket(
  "wss://api.your-co.com/v1/voice/stream"
);

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "session.start",
    agent_id: "order-support",
    audio_format: "pcm_16000"
  }));
};`}),(0,t.jsx)(tm,{id:"audio-formats",children:"Audio formats"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"The platform supports PCM (16-bit, 16kHz), Opus, and MP3 for input. Output audio can be configured as PCM, Opus, or AAC. PCM is recommended for lowest latency; Opus for bandwidth-constrained environments."})}),(0,t.jsx)(tm,{id:"client-integration",children:"Client integration"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Use the Web Audio API in browsers, or native audio APIs on mobile. The SDK provides helper classes that handle microphone capture, playback, and echo cancellation."})}),(0,t.jsx)(ty,{code:`import { VoiceSession } from "@your-co/agents/voice";

const session = new VoiceSession({
  agentId: "order-support",
  onAudio: (chunk) => audioPlayer.enqueue(chunk),
  onTranscript: (text) => console.log("Agent:", text),
});

await session.start();`}),(0,t.jsx)(tm,{id:"error-handling",children:"Error handling"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["The WebSocket connection will automatically reconnect on transient failures. For permanent errors (auth failures, agent not found), the server sends a close frame with a descriptive reason. Handle these in your ",(0,t.jsx)(th,{children:"onclose"})," callback."]})})]})}function t_({breadcrumbs:e,title:n,subtitle:r}){return(0,t.jsxs)(tu,{breadcrumbs:e,title:n,subtitle:r,readTime:"5 min read",updated:"Updated April 2026",toc:[{id:"overview",label:"Overview"},{id:"getting-started",label:"Getting started"},{id:"configuration",label:"Configuration"},{id:"next-steps",label:"Next steps"}],children:[(0,t.jsx)(tm,{id:"overview",children:"Overview"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["This guide covers how to configure and use ",n.toLowerCase()," in your application. Follow the steps below to get started."]})}),(0,t.jsx)(tm,{id:"getting-started",children:"Getting started"}),(0,t.jsx)(tg,{children:(0,t.jsxs)("p",{style:{margin:0},children:["Before you begin, make sure you have completed the"," ",(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Quickstart"})," guide and have a working agent deployed. This guide builds on those foundations."]})}),(0,t.jsx)(tm,{id:"configuration",children:"Configuration"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"All settings for this feature are configured via the agent's configuration object or the dashboard. See the API reference for the complete list of options."})}),(0,t.jsx)(ty,{code:`// Example configuration
await client.agents.update(agentId, {
  config: {
    // Feature-specific settings go here
  }
});`}),(0,t.jsx)(tm,{id:"next-steps",children:"Next steps"}),(0,t.jsx)(tg,{children:(0,t.jsx)("p",{style:{margin:0},children:"Explore the API Reference for detailed endpoint documentation, or head to the cookbook for real-world examples and patterns."})})]})}function tL({breadcrumbs:e,title:r,subtitle:a,toc:s,children:o}){return(0,t.jsxs)("div",{style:{display:"flex",maxWidth:1100,margin:"0 auto",padding:"0 32px",gap:32},children:[(0,t.jsxs)("article",{style:{flex:1,minWidth:0,padding:"32px 0 64px"},children:[(0,t.jsx)("div",{style:{fontSize:12,color:"var(--brand-fg)",display:"flex",alignItems:"center",gap:6,marginBottom:14},children:e.map((e,r)=>(0,t.jsxs)(n.Fragment,{children:[r>0&&(0,t.jsx)(i.Icon,{name:"chevronRight",size:11}),(0,t.jsx)("span",{children:e})]},r))}),(0,t.jsx)("h1",{style:{margin:"0 0 10px",fontSize:32,fontWeight:700,letterSpacing:"-0.02em",color:"var(--fg-primary)",lineHeight:1.1},children:r}),(0,t.jsx)("p",{style:{margin:"0 0 32px",fontSize:15,lineHeight:1.65,color:"var(--fg-secondary)",maxWidth:680},children:a}),o]}),(0,t.jsx)(eT,{entries:s})]})}function tR({id:e,children:n}){return(0,t.jsx)("h2",{id:e,style:{margin:"40px 0 6px",fontSize:22,fontWeight:700,letterSpacing:"-0.01em",color:"var(--fg-primary)",scrollMarginTop:80},children:n})}function tP({children:e}){return(0,t.jsx)("div",{style:{fontSize:14,lineHeight:1.7,color:"var(--fg-secondary)",display:"flex",flexDirection:"column",gap:14,marginBottom:16},children:e})}function tE({code:e,label:n}){return(0,t.jsxs)("div",{style:{border:"1px solid var(--border)",borderRadius:10,overflow:"hidden",margin:"14px 0"},children:[n&&(0,t.jsx)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderBottom:"1px solid var(--border)",background:"var(--bg-muted)",fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-secondary)"},children:n}),(0,t.jsx)("pre",{style:{margin:0,padding:"14px 16px",background:"var(--bg-surface)",fontFamily:"var(--font-mono)",fontSize:12.5,lineHeight:1.65,color:"var(--fg-primary)",overflowX:"auto"},children:e})]})}function tz({children:e}){return(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:12.5,padding:"1px 6px",borderRadius:4,background:"var(--bg-muted)",color:"var(--fg-primary)"},children:e})}let tB={typescript:{id:"typescript",name:"TypeScript",install:`npm install your-company-typescript-sdk
# or: pnpm add your-company-typescript-sdk
# or: yarn add your-company-typescript-sdk`,installLabel:"Terminal",usage:`import { YourCompanyClient } from "your-company-typescript-sdk";

const client = new YourCompanyClient({
  apiKey: process.env.YOUR_COMPANY_API_KEY,
});

const agent = await client.agents.create({
  name: "support-triage",
  model: "gpt-4o",
});

const run = await client.agents.run({
  agent: agent.id,
  input: "Hello, I need help with my order.",
});

console.log(run.output);`,usageFile:"index.ts",minVersion:"Node.js 18+",packageManager:"npm / pnpm / yarn",packageUrl:"https://www.npmjs.com/package/your-company-typescript-sdk",features:["Full type safety with generics","ESM and CommonJS support","Tree-shakeable exports","Async iterators for streaming"]},python:{id:"python",name:"Python",install:`pip install your-company-python-sdk
# or: poetry add your-company-python-sdk`,installLabel:"Terminal",usage:`from your_company import YourCompanyClient

client = YourCompanyClient(
    api_key=os.environ["YOUR_COMPANY_API_KEY"]
)

agent = client.agents.create(
    name="support-triage",
    model="gpt-4o",
)

run = client.agents.run(
    agent=agent.id,
    input="Hello, I need help with my order.",
)

print(run.output)`,usageFile:"main.py",minVersion:"Python 3.9+",packageManager:"pip / poetry",packageUrl:"https://pypi.org/project/your-company-python-sdk",features:["Pydantic v2 models","Async client included","Type stubs for IDE support","Streaming via generators"]},go:{id:"go",name:"Go",install:"go get github.com/your-company/go-sdk",installLabel:"Terminal",usage:`package main

import (
    "context"
    "fmt"
    yourco "github.com/your-company/go-sdk"
)

func main() {
    client := yourco.NewClient(
        yourco.WithAPIKey(os.Getenv("YOUR_COMPANY_API_KEY")),
    )

    agent, _ := client.Agents.Create(context.TODO(), &yourco.CreateAgentRequest{
        Name:  "support-triage",
        Model: "gpt-4o",
    })

    run, _ := client.Agents.Run(context.TODO(), &yourco.RunRequest{
        Agent: agent.ID,
        Input: "Hello, I need help with my order.",
    })

    fmt.Println(run.Output)
}`,usageFile:"main.go",minVersion:"Go 1.21+",packageManager:"go modules",packageUrl:"https://pkg.go.dev/github.com/your-company/go-sdk",features:["Idiomatic Go interfaces","Context-aware methods","Functional options pattern","Zero dependencies"]},java:{id:"java",name:"Java",install:`// Gradle
implementation("com.your-company:java-sdk:1.12.0")

// Maven
<dependency>
  <groupId>com.your-company</groupId>
  <artifactId>java-sdk</artifactId>
  <version>1.12.0</version>
</dependency>`,installLabel:"build.gradle / pom.xml",usage:`import com.yourcompany.sdk.YourCompanyClient;
import com.yourcompany.sdk.models.*;

public class Main {
    public static void main(String[] args) {
        var client = YourCompanyClient.builder()
            .apiKey(System.getenv("YOUR_COMPANY_API_KEY"))
            .build();

        var agent = client.agents().create(CreateAgentRequest.builder()
            .name("support-triage")
            .model("gpt-4o")
            .build());

        var run = client.agents().run(RunRequest.builder()
            .agent(agent.getId())
            .input("Hello, I need help with my order.")
            .build());

        System.out.println(run.getOutput());
    }
}`,usageFile:"Main.java",minVersion:"Java 11+",packageManager:"Gradle / Maven",packageUrl:"https://central.sonatype.com/artifact/com.your-company/java-sdk",features:["Builder pattern for all models","Jackson serialization","OkHttp transport","Immutable value objects"]},csharp:{id:"csharp",name:"C#",install:"dotnet add package YourCompany.Sdk",installLabel:"Terminal",usage:`using YourCompany.Sdk;

var client = new YourCompanyClient("YOUR_COMPANY_API_KEY");

var agent = await client.Agents.CreateAsync(
    new CreateAgentRequest
    {
        Name = "support-triage",
        Model = "gpt-4o"
    });

var run = await client.Agents.RunAsync(
    new RunRequest
    {
        AgentId = agent.Id,
        Input = "Hello, I need help with my order."
    });

Console.WriteLine(run.Output);`,usageFile:"Program.cs",minVersion:".NET 6+",packageManager:"NuGet",packageUrl:"https://www.nuget.org/packages/YourCompany.Sdk",features:["Async/await throughout","System.Text.Json serialization","Nullable reference types","IAsyncEnumerable streaming"]},ruby:{id:"ruby",name:"Ruby",install:`gem install your_company_sdk
# or add to Gemfile: gem "your_company_sdk"`,installLabel:"Terminal",usage:`require "your_company_sdk"

client = YourCompany::Client.new(
  api_key: ENV["YOUR_COMPANY_API_KEY"]
)

agent = client.agents.create(
  name: "support-triage",
  model: "gpt-4o"
)

run = client.agents.run(
  agent: agent.id,
  input: "Hello, I need help with my order."
)

puts run.output`,usageFile:"main.rb",minVersion:"Ruby 3.0+",packageManager:"RubyGems / Bundler",packageUrl:"https://rubygems.org/gems/your_company_sdk",features:["Idiomatic Ruby API","Sorbet type signatures","Faraday HTTP client","Enumerable pagination"]},php:{id:"php",name:"PHP",install:"composer require your-company/php-sdk",installLabel:"Terminal",usage:`<?php
require_once 'vendor/autoload.php';

use YourCompany\\Sdk\\YourCompanyClient;

$client = new YourCompanyClient(
    apiKey: getenv('YOUR_COMPANY_API_KEY')
);

$agent = $client->agents->create([
    'name' => 'support-triage',
    'model' => 'gpt-4o',
]);

$run = $client->agents->run([
    'agent' => $agent->id,
    'input' => 'Hello, I need help with my order.',
]);

echo $run->output;`,usageFile:"index.php",minVersion:"PHP 8.1+",packageManager:"Composer",packageUrl:"https://packagist.org/packages/your-company/php-sdk",features:["PHP 8.1 enums and named args","PSR-18 HTTP client","Typed DTOs","Laravel integration"]},swift:{id:"swift",name:"Swift",install:`// Package.swift
dependencies: [
    .package(url: "https://github.com/your-company/swift-sdk", from: "0.8.0")
]`,installLabel:"Package.swift",usage:`import YourCompanySDK

let client = YourCompanyClient(
    apiKey: ProcessInfo.processInfo.environment["YOUR_COMPANY_API_KEY"]!
)

let agent = try await client.agents.create(
    name: "support-triage",
    model: "gpt-4o"
)

let run = try await client.agents.run(
    agent: agent.id,
    input: "Hello, I need help with my order."
)

print(run.output)`,usageFile:"main.swift",minVersion:"Swift 5.9+ / iOS 16+",packageManager:"Swift Package Manager",packageUrl:"https://github.com/your-company/swift-sdk",features:["Swift concurrency (async/await)","Codable models","Result type error handling","iOS, macOS, Linux support"]},rust:{id:"rust",name:"Rust",install:"cargo add your-company-sdk",installLabel:"Terminal",usage:`use your_company_sdk::YourCompanyClient;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = YourCompanyClient::builder()
        .api_key(std::env::var("YOUR_COMPANY_API_KEY")?)
        .build();

    let agent = client.agents().create()
        .name("support-triage")
        .model("gpt-4o")
        .send()
        .await?;

    let run = client.agents().run()
        .agent(&agent.id)
        .input("Hello, I need help with my order.")
        .send()
        .await?;

    println!("{}", run.output);
    Ok(())
}`,usageFile:"main.rs",minVersion:"Rust 1.70+",packageManager:"Cargo",packageUrl:"https://crates.io/crates/your-company-sdk",features:["Tokio async runtime","Serde serialization","Builder pattern","Type-safe request/response"]}},tN=new Set(["typescript","python","go","java","csharp","ruby","php","swift","rust"]);function tq({logo:e,color:n,letter:r,size:i=36}){return tN.has(e)?(0,t.jsx)("div",{style:{width:i,height:i,borderRadius:8,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,t.jsx)(Y,{id:e,size:i})}):(0,t.jsx)("div",{style:{width:i,height:i,borderRadius:8,background:n,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-mono)",fontWeight:700,fontSize:14,flexShrink:0},children:r})}function tD(){return(0,t.jsxs)(tL,{breadcrumbs:["SDKs","Quickstart"],title:"SDK Quickstart",subtitle:"Install an SDK, authenticate, and make your first API call in under a minute.",toc:[{id:"pick-language",label:"Pick your language"},{id:"install",label:"Install"},{id:"authenticate",label:"Authenticate"},{id:"first-call",label:"First API call"}],children:[(0,t.jsx)(tR,{id:"pick-language",children:"Pick your language"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"We publish official SDKs for nine languages. Pick the one that matches your stack — the API surface is identical across all of them."})}),(0,t.jsx)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:8,margin:"16px 0"},children:S.map(e=>(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",border:"1px solid var(--border)",borderRadius:8,background:"var(--bg-surface)",fontSize:13,fontWeight:500,color:"var(--fg-primary)"},children:[(0,t.jsx)(Y,{id:e.logo,size:20}),e.name]},e.name))}),(0,t.jsx)(tR,{id:"install",children:"Install"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"Each SDK is published to its language's standard package registry. Install with your preferred package manager:"})}),(0,t.jsx)(tE,{label:"npm",code:"npm install your-company-typescript-sdk"}),(0,t.jsx)(tE,{label:"pip",code:"pip install your-company-python-sdk"}),(0,t.jsx)(tE,{label:"go",code:"go get github.com/your-company/go-sdk"}),(0,t.jsx)(tR,{id:"authenticate",children:"Authenticate"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"Export your API key as an environment variable. The SDK picks it up automatically."})}),(0,t.jsx)(tE,{label:"Terminal",code:'export YOUR_COMPANY_API_KEY="sk_live_••••••••••••••••••••••••"'}),(0,t.jsx)(tR,{id:"first-call",children:"First API call"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"Initialize the client and create your first agent. The same pattern works in every language — only the syntax changes."})}),(0,t.jsx)(tE,{label:"index.ts",code:`import { YourCompanyClient } from "your-company-typescript-sdk";

const client = new YourCompanyClient();
const agents = await client.agents.list();
console.log(agents);`})]})}function tK(){return(0,t.jsxs)(tL,{breadcrumbs:["SDKs","Features"],title:"SDK Features",subtitle:"Every SDK ships with the same batteries — type safety, retries, streaming, pagination, and more.",toc:[{id:"type-safety",label:"Type safety"},{id:"retries",label:"Automatic retries"},{id:"streaming",label:"Streaming"},{id:"pagination",label:"Pagination"},{id:"auth",label:"Authentication"},{id:"error-handling",label:"Error handling"}],children:[(0,t.jsx)(tR,{id:"type-safety",children:"Type safety"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"All request and response types are generated from your OpenAPI spec. This means full autocomplete in your IDE, compile-time type checking, and no runtime surprises."})}),(0,t.jsx)(tE,{label:"index.ts",code:`// Every field is typed — no "any" anywhere
const agent: Agent = await client.agents.create({
  name: "support",    // ✓ string
  model: "gpt-4o",    // ✓ string
  temperature: 0.7,   // ✓ number
});`}),(0,t.jsx)(tR,{id:"retries",children:"Automatic retries"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"Transient errors (429, 500, 502, 503, 504) are retried automatically with exponential backoff. Idempotency keys are sent for POST requests so retries are safe."})}),(0,t.jsx)(tE,{label:"Configuration",code:`const client = new YourCompanyClient({
  maxRetries: 3,           // default: 2
  timeout: 30_000,         // default: 60s
  idempotencyKey: "auto",  // default
});`}),(0,t.jsx)(tR,{id:"streaming",children:"Streaming"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"All SDKs support server-sent events (SSE) for streaming responses. Use async iterators (TypeScript, Python, Rust) or callbacks (Java, Go) depending on the language."})}),(0,t.jsx)(tE,{label:"stream.ts",code:`const stream = await client.agents.run({
  agent: "support-triage",
  input: "Where is my order?",
  stream: true,
});

for await (const event of stream) {
  process.stdout.write(event.delta);
}`}),(0,t.jsx)(tR,{id:"pagination",children:"Pagination"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"List endpoints return auto-paginating iterators. No need to manage cursors or page tokens — just iterate and the SDK handles the rest."})}),(0,t.jsx)(tE,{label:"paginate.ts",code:`for await (const agent of client.agents.list()) {
  console.log(agent.name);
  // Automatically fetches next page when needed
}`}),(0,t.jsx)(tR,{id:"auth",children:"Authentication"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"API keys, OAuth tokens, and bearer auth are all supported out of the box. The SDK reads credentials from environment variables by default, or you can pass them explicitly."})}),(0,t.jsx)(tR,{id:"error-handling",children:"Error handling"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"API errors are thrown as typed exceptions with the status code, error message, and request ID. This makes it easy to catch and handle specific error types."})}),(0,t.jsx)(tE,{label:"errors.ts",code:`try {
  await client.agents.get("nonexistent");
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log("Agent not found:", e.message);
    console.log("Request ID:", e.requestId);
  }
}`})]})}function t$({langKey:e}){let n=tB[e],r=S.find(t=>t.logo===e);return n&&r?(0,t.jsxs)(tL,{breadcrumbs:["SDKs","Languages",n.name],title:`${n.name} SDK`,subtitle:`Official ${n.name} client library — ${r.package} v${r.version}.`,toc:[{id:"requirements",label:"Requirements"},{id:"installation",label:"Installation"},{id:"usage",label:"Usage"},{id:"features",label:"Features"}],children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",border:"1px solid var(--border)",borderRadius:10,background:"var(--bg-surface)",marginBottom:24},children:[(0,t.jsx)(tq,{logo:r.logo,color:r.color,letter:r.letter,size:44}),(0,t.jsxs)("div",{style:{flex:1,minWidth:0},children:[(0,t.jsx)("div",{style:{fontSize:16,fontWeight:600,color:"var(--fg-primary)"},children:r.name}),(0,t.jsx)("code",{style:{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-tertiary)"},children:r.package})]}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2},children:[(0,t.jsxs)("span",{style:{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600,color:"var(--fg-secondary)",padding:"2px 8px",border:"1px solid var(--border)",borderRadius:999},children:["v",r.version]}),(0,t.jsx)("span",{style:{fontSize:11,color:"var(--fg-tertiary)"},children:r.date})]})]}),(0,t.jsx)(tR,{id:"requirements",children:"Requirements"}),(0,t.jsxs)(tP,{children:[(0,t.jsxs)("p",{style:{margin:0},children:[(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Runtime:"})," ",n.minVersion]}),(0,t.jsxs)("p",{style:{margin:0},children:[(0,t.jsx)("strong",{style:{color:"var(--fg-primary)"},children:"Package manager:"})," ",n.packageManager]})]}),(0,t.jsx)(tR,{id:"installation",children:"Installation"}),(0,t.jsx)(tE,{label:n.installLabel,code:n.install}),(0,t.jsx)(tR,{id:"usage",children:"Usage"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"Initialize the client with your API key and start making requests. The SDK handles authentication, serialization, and retries automatically."})}),(0,t.jsx)(tE,{label:n.usageFile,code:n.usage}),(0,t.jsx)(tR,{id:"features",children:"Features"}),(0,t.jsx)("ul",{style:{margin:0,padding:"0 0 0 20px",fontSize:14,lineHeight:1.7,color:"var(--fg-secondary)",display:"flex",flexDirection:"column",gap:6},children:n.features.map(e=>(0,t.jsx)("li",{children:e},e))})]}):null}function tM(){return(0,t.jsxs)(tL,{breadcrumbs:["SDKs","Reference","Changelog"],title:"Changelog",subtitle:"Track SDK releases, breaking changes, and new features across all languages.",toc:[{id:"latest",label:"Latest releases"},{id:"policy",label:"Versioning policy"}],children:[(0,t.jsx)(tR,{id:"latest",children:"Latest releases"}),(0,t.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:12,margin:"16px 0"},children:S.slice(0,5).map(e=>(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",border:"1px solid var(--border)",borderRadius:8,background:"var(--bg-surface)"},children:[(0,t.jsx)(Y,{id:e.logo,size:24}),(0,t.jsx)("div",{style:{flex:1},children:(0,t.jsx)("span",{style:{fontSize:13,fontWeight:600,color:"var(--fg-primary)"},children:e.name})}),(0,t.jsxs)("span",{style:{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--fg-secondary)"},children:["v",e.version]}),(0,t.jsx)("span",{style:{fontSize:12,color:"var(--fg-tertiary)"},children:e.date})]},e.name))}),(0,t.jsx)(tR,{id:"policy",children:"Versioning policy"}),(0,t.jsxs)(tP,{children:[(0,t.jsx)("p",{style:{margin:0},children:"All SDKs follow semantic versioning. Breaking changes are only introduced in major versions. Minor versions add new features, and patch versions fix bugs."}),(0,t.jsx)("p",{style:{margin:0},children:"SDK versions are generated from the OpenAPI spec — when your API changes, new SDK versions are published automatically through the CI pipeline."})]})]})}function tW(){return(0,t.jsxs)(tL,{breadcrumbs:["SDKs","Reference","Migrations"],title:"Migration guides",subtitle:"Step-by-step instructions for upgrading between major SDK versions.",toc:[{id:"v2-to-v3",label:"v2 → v3"},{id:"v1-to-v2",label:"v1 → v2"}],children:[(0,t.jsx)(tR,{id:"v2-to-v3",children:"Migrating from v2 to v3"}),(0,t.jsx)(tP,{children:(0,t.jsx)("p",{style:{margin:0},children:"Version 3 introduces a new client initialization pattern and replaces callback-based streaming with async iterators. Most changes are mechanical — a find-and-replace will cover 90% of cases."})}),(0,t.jsx)(tE,{label:"Before (v2)",code:'const client = new Client({ token: "..." });'}),(0,t.jsx)(tE,{label:"After (v3)",code:'const client = new YourCompanyClient({ apiKey: "..." });'}),(0,t.jsx)(tR,{id:"v1-to-v2",children:"Migrating from v1 to v2"}),(0,t.jsx)(tP,{children:(0,t.jsxs)("p",{style:{margin:0},children:["Version 2 moved to a resource-based API structure. Instead of flat method names, endpoints are grouped by resource (e.g., ",(0,t.jsx)(tz,{children:"client.agents.create()"})," instead of"," ",(0,t.jsx)(tz,{children:"client.createAgent()"}),")."]})})]})}function tO(){let e=function(){let e=n.useContext(eQ);if(!e)throw Error("useWidgets() must be used inside <WidgetHost>");return e}(),r=n.useRef(e);return r.current=e,n.useEffect(()=>(window.__widgetsDemo={spawnTerminal:(e,n)=>{r.current.spawn({id:"terminal",render:({dismiss:r})=>(0,t.jsx)(e5.TerminalWidget,{title:e,showBanner:n?.showBanner,onClose:r,onLinkClick:e=>{"terminal-md-link"===e&&window.__appDemo?.setMdViewOpen?.(!0)}}),position:{kind:"anchor",anchor:"bottom-right",offset:[24,24]},transition:"slide-up",dismissOnEsc:!0})},dismissAll:()=>r.current.dismissAll()},()=>{window.__widgetsDemo=null}),[]),null}function tH({domain:e,url:n}){let{brand:r,sweepActive:s}=(0,a.useBrand)(),o=null!==r&&!s;return(0,t.jsxs)("div",{className:"browser-chrome",style:{position:"relative"},children:[(0,t.jsxs)("div",{className:"browser-lights",children:[(0,t.jsx)("div",{className:"browser-light red"}),(0,t.jsx)("div",{className:"browser-light yellow"}),(0,t.jsx)("div",{className:"browser-light green"})]}),(0,t.jsxs)("div",{className:"browser-nav",style:{display:"flex",gap:2},children:[(0,t.jsx)(i.Icon,{name:"chevronLeft",size:14}),(0,t.jsx)(i.Icon,{name:"chevronRight",size:14})]}),(0,t.jsxs)("div",{className:"browser-url",children:[(0,t.jsx)("span",{className:"lock",children:(0,t.jsx)(i.Icon,{name:"lock",size:10})}),(0,t.jsx)("span",{className:"domain",children:e}),(0,t.jsx)("span",{children:"/"}),(0,t.jsx)("span",{className:"path",children:n})]}),(0,t.jsx)("div",{className:"browser-right",children:(0,t.jsx)(i.Icon,{name:"moreHorizontal",size:14})}),r&&o&&(0,t.jsxs)("a",{href:"https://dashboard.buildwithfern.com/sign-up?redirect_on_login=%2Fget-started&utm_source=fern-website&utm_content=homepage-animation-brand-cta",target:"_blank",rel:"noreferrer noopener",className:"fha-brand-btn",style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",display:"inline-flex",alignItems:"center",gap:4,height:24,padding:"0 10px",borderRadius:6,fontSize:12,fontWeight:500,textDecoration:"none",whiteSpace:"nowrap",animation:"fha-fadeIn 220ms ease-out both"},children:[(0,t.jsx)(tc,{text:`Build docs for ${r.name}`},r.domain),(0,t.jsx)(tp.ArrowRight,{size:12})]})]})}let tF={"doc-voice-telephony":{breadcrumbs:["Docs","Voice","Telephony (SIP / Twilio)"],title:"Telephony (SIP / Twilio)",subtitle:"Connect your voice agent to phone networks via SIP trunking or the Twilio integration."},"doc-voice-latency":{breadcrumbs:["Docs","Voice","Tuning for latency"],title:"Tuning for latency",subtitle:"Reduce end-to-end voice latency with regional deployment, model selection, and audio format tuning."},"doc-kb-ingest":{breadcrumbs:["Docs","Knowledge base","Ingesting documents"],title:"Ingesting documents",subtitle:"Upload PDFs, web pages, and structured data to build your agent's knowledge base."},"doc-kb-chunking":{breadcrumbs:["Docs","Knowledge base","Chunking strategies"],title:"Chunking strategies",subtitle:"Configure how documents are split into chunks for embedding and retrieval."},"doc-kb-retrieval":{breadcrumbs:["Docs","Knowledge base","Retrieval tuning"],title:"Retrieval tuning",subtitle:"Tune similarity thresholds, re-ranking, and hybrid search for better retrieval quality."},"doc-kb-sources":{breadcrumbs:["Docs","Knowledge base","Connected sources"],title:"Connected sources",subtitle:"Sync documents from Notion, Confluence, Google Drive, and other platforms automatically."},"doc-deploy-widget":{breadcrumbs:["Docs","Deploy","Web widget"],title:"Web widget",subtitle:"Embed a chat or voice widget on your website with a single script tag."},"doc-deploy-mobile":{breadcrumbs:["Docs","Deploy","Mobile embed"],title:"Mobile embed",subtitle:"Add voice and chat agents to your iOS and Android apps with native SDKs."},"doc-deploy-server":{breadcrumbs:["Docs","Deploy","Self-hosted runtime"],title:"Self-hosted runtime",subtitle:"Run the agent runtime in your own infrastructure for maximum control and data residency."},"doc-deploy-edge":{breadcrumbs:["Docs","Deploy","Edge workers"],title:"Edge workers",subtitle:"Deploy lightweight agents to edge locations for sub-50ms response times."},"doc-deploy-regions":{breadcrumbs:["Docs","Deploy","Regions & residency"],title:"Regions & residency",subtitle:"Choose where your data is processed and stored to meet compliance requirements."},"doc-ops-auth":{breadcrumbs:["Docs","Operate","Auth & API keys"],title:"Auth & API keys",subtitle:"Manage API keys, scopes, and rotation policies for your agents."},"doc-ops-webhooks":{breadcrumbs:["Docs","Operate","Webhooks"],title:"Webhooks",subtitle:"Receive real-time notifications when runs complete, errors occur, or agents are updated."},"doc-ops-observability":{breadcrumbs:["Docs","Operate","Traces & logs"],title:"Traces & logs",subtitle:"Monitor agent performance with distributed traces, structured logs, and alerting."},"doc-ops-billing":{breadcrumbs:["Docs","Operate","Usage & billing"],title:"Usage & billing",subtitle:"Track token usage, set spend limits, and manage your subscription."},"doc-ops-security":{breadcrumbs:["Docs","Operate","Security & compliance"],title:"Security & compliance",subtitle:"SOC 2, HIPAA, GDPR, and enterprise security features."},"doc-res-cookbook":{breadcrumbs:["Docs","Resources","Cookbook"],title:"Cookbook",subtitle:"Ready-to-use recipes for common agent patterns — RAG, multi-step workflows, and more."},"doc-res-faq":{breadcrumbs:["Docs","Resources","FAQ"],title:"FAQ",subtitle:"Answers to frequently asked questions about the platform, pricing, and capabilities."},"doc-res-support":{breadcrumbs:["Docs","Resources","Support"],title:"Support",subtitle:"Get help from the team — community forums, Slack, and enterprise support channels."}};function tG({activeId:e,onEditClick:n}){switch(e){case"doc-quickstart":return(0,t.jsx)(eD,{onEditClick:n});case"doc-first-agent":return(0,t.jsx)(tx,{});case"doc-concepts":return(0,t.jsx)(tv,{});case"doc-agent-design":return(0,t.jsx)(tw,{});case"doc-agent-tools":return(0,t.jsx)(tj,{});case"doc-agent-memory":return(0,t.jsx)(tk,{});case"doc-agent-handoff":return(0,t.jsx)(tS,{});case"doc-agent-evals":return(0,t.jsx)(tC,{});case"doc-voice-models":return(0,t.jsx)(tA,{});case"doc-voice-interruption":return(0,t.jsx)(tT,{});case"doc-voice-streaming":return(0,t.jsx)(tI,{});default:{let n=tF[e];if(n)return(0,t.jsx)(t_,{breadcrumbs:n.breadcrumbs,title:n.title,subtitle:n.subtitle});return(0,t.jsx)(t_,{breadcrumbs:["Docs"],title:"Page",subtitle:"This page is under construction."})}}}function tV({activeId:e,onSelectSdk:n}){switch(e){case"sdks-overview":return(0,t.jsx)(eU,{onSelectSdk:n});case"sdks-quickstart":return(0,t.jsx)(tD,{});case"sdks-features":return(0,t.jsx)(tK,{});case"sdks-typescript":return(0,t.jsx)(t$,{langKey:"typescript"});case"sdks-python":return(0,t.jsx)(t$,{langKey:"python"});case"sdks-go":return(0,t.jsx)(t$,{langKey:"go"});case"sdks-java":return(0,t.jsx)(t$,{langKey:"java"});case"sdks-csharp":return(0,t.jsx)(t$,{langKey:"csharp"});case"sdks-ruby":return(0,t.jsx)(t$,{langKey:"ruby"});case"sdks-php":return(0,t.jsx)(t$,{langKey:"php"});case"sdks-swift":return(0,t.jsx)(t$,{langKey:"swift"});case"sdks-rust":return(0,t.jsx)(t$,{langKey:"rust"});case"sdks-changelog":return(0,t.jsx)(tM,{});case"sdks-migration":return(0,t.jsx)(tW,{});default:return(0,t.jsx)(eU,{})}}e.s(["default",0,function({chapter:e="docs",onComplete:s}){let o,l,d,c,p,u,{resolvedTheme:g,setTheme:m}=(0,r.useTheme)(),h="dark"===g?"dark":"light",[y,f]=n.useState(()=>window.matchMedia("(max-width: 767.98px)").matches);n.useEffect(()=>{let e=window.matchMedia("(max-width: 767.98px)"),t=e=>f(e.matches);return e.addEventListener("change",t),()=>e.removeEventListener("change",t)},[]);let[b,x]=n.useState(!1);n.useEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return void x(!0);let e=setTimeout(()=>x(!0),2950);return()=>clearTimeout(e)},[]);let[w,S]=n.useState("home"),[A,T]=n.useState("create-agent"),[I,_]=n.useState("doc-quickstart"),[L,P]=n.useState("sdks-overview"),[E,z]=n.useState("typescript"),[B,N]=n.useState(!1),[q,D]=n.useState(!1),[K,$]=n.useState(!1),[M,O]=n.useState(null),[H,F]=n.useState(!1),[G,V]=n.useState(!1),[Y,J]=n.useState(!1),[Z,X]=n.useState(0),[ee,et]=n.useState(!1),[en,er]=n.useState(!1);n.useEffect(()=>{D(!1),N(!1),$(!1),O(null),F(!1),V(!1),J(!1),z("typescript"),X(e=>e+1),et(!1),er(!1)},[e]);let ei=n.useCallback(e=>{O(e||null),$(!0)},[]);n.useEffect(()=>(window.__appDemo={setActiveTab:e=>S(e),setActiveEndpoint:e=>{C[e]&&T(e)},setEditorOpen:e=>F(e),setMdViewOpen:e=>V(e),setSplitOpen:e=>J(e),reset:()=>{D(!1),N(!1),$(!1),O(null),F(!1),V(!1),J(!1)}},()=>{window.__appDemo=null}),[]),n.useEffect(()=>{let e=e=>{"Escape"===e.key&&(D(!1),N(!1),$(!1),V(!1))};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[]);let{cursorRef:ea,visible:eo}=function(e,t,r,i){let a=n.useRef(i);a.current=i;let s=n.useRef(null),o=n.useRef(!1),l=n.useRef(null),[d,c]=n.useState(!1);return n.useEffect(()=>{if(!e)return;let n=e1[t];if(!n)return;o.current=!1,window.__widgetsDemo?.dismissAll?.();let r=[],i=()=>{let e=l.current;if(e){try{e.dispatchEvent(new MouseEvent("mouseleave",{bubbles:!1})),e.dispatchEvent(new MouseEvent("mouseout",{bubbles:!0}))}catch{}l.current=null}},d=document.querySelector(".fha-app-layer .browser-body"),p={active:!1},u=()=>{p.active||(o.current=!0,i(),c(!1),r.forEach(clearTimeout),d?.removeEventListener("pointerdown",u))};!1!==n.interruptible&&d?.addEventListener("pointerdown",u);let g=e=>{let t=e.style.transform.match(/translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/);return t?[parseFloat(t[1]),parseFloat(t[2])]:[0,0]},m=e=>{let t=n.steps;if(o.current||e>=t.length){if(!o.current&&n.loop&&t.length>0)r.push(setTimeout(()=>m(0),1500));else if(!o.current){i(),c(!1);let e=()=>{o.current||a.current?.()},t=n.completeAfter??0;t>0?r.push(setTimeout(e,t)):e()}return}let d=t[e],u=s.current;if(!u)return void r.push(setTimeout(()=>m(e+1),300));let h=Math.max(d.delay||800,1e4),y=Date.now(),f=t=>{if(o.current)return;let n=(e=>{for(let t of document.querySelectorAll(e)){let e=t.getBoundingClientRect();if(e.width>0&&e.height>0)return t}return null})(d.target);return n?t(n):Date.now()-y>h?void r.push(setTimeout(()=>m(e+1),100)):void r.push(setTimeout(()=>f(t),120))};f(t=>{c(!0);let[n,i]=g(u);((e,t,n)=>{if(!e||!t)return;let r=e.getBoundingClientRect(),[i=0,a=0]=n||[0,0],s=r.left+window.scrollX+r.width/2+i,o=r.top+window.scrollY+r.height/2+a;t.style.transform=`translate(${s}px, ${o}px)`})(t,u,d.offset);let[a,s]=g(u),h=Math.hypot(a-n,s-i)>4,y=700*!!h,f=Math.max(d.delay||800,y),b=h?y:Math.min(d.delay||800,600),x=l.current;if(x&&x!==t)try{x.dispatchEvent(new MouseEvent("mouseleave",{bubbles:!1})),x.dispatchEvent(new MouseEvent("mouseout",{bubbles:!0}))}catch{}l.current=t,r.push(setTimeout(()=>{if(!o.current)try{t.dispatchEvent(new MouseEvent("mouseenter",{bubbles:!1})),t.dispatchEvent(new MouseEvent("mouseover",{bubbles:!0}))}catch{}},b)),r.push(setTimeout(()=>{if(!o.current){if("hover"===d.action){r.push(setTimeout(()=>{l.current===t&&(t.dispatchEvent(new MouseEvent("mouseleave",{bubbles:!1})),t.dispatchEvent(new MouseEvent("mouseout",{bubbles:!0})),l.current=null)},Math.max(200,(d.hold||700)-100))),r.push(setTimeout(()=>m(e+1),d.hold||700));return}if(u.classList.add("clicking"),"escape"===d.action)p.active=!0,window.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:!0})),r.push(setTimeout(()=>{p.active=!1},50));else if("custom"===d.action&&"function"==typeof d.run){p.active=!0;try{d.run()}catch{}r.push(setTimeout(()=>{p.active=!1},200))}else{p.active=!0;let e=new MouseEvent("click",{bubbles:!0,cancelable:!0});t.dispatchEvent(e),r.push(setTimeout(()=>{p.active=!1},50))}r.push(setTimeout(()=>u.classList.remove("clicking"),400)),r.push(setTimeout(()=>m(e+1),d.hold||700))}},f))})},h={schedule:(e,t)=>{r.push(setTimeout(()=>{if(!o.current)try{e()}catch{}},t))}};return r.push(setTimeout(()=>{if(!o.current)try{n.onEnter?.(h)}catch{}},50)),r.push(setTimeout(()=>m(0),200)),()=>{i(),c(!1),r.forEach(clearTimeout),d?.removeEventListener("pointerdown",u)}},[e,t,...r]),{cursorRef:s,visible:d}}(b&&!en,e,[b],n.useCallback(()=>{et(!0),s?.()},[s])),el=C[A],ed=I.replace(/^doc-/,"").replace(/-/g,"-"),ec=L.replace(/^sdks-/,"").replace(/-/g,"-"),ep="api"===w?`api-reference/rest/${A}`:"home"===w?"":"docs"===w?`docs/${ed}`:"sdks"===w?`sdks/${ec}`:"changelog",eg=G&&"api"===w?`${ep}.md`:ep,{brand:em}=(0,a.useBrand)(),eh=em?.domain?`docs.${em.domain}`:"docs.company.com",ey=n.useCallback(e=>{C[e]&&(T(e),S("api"))},[]),ef=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("div",{style:{position:"absolute",inset:0,display:"flex"},children:[(0,t.jsxs)("div",{className:"fha-docs-pane",style:{flex:1,minWidth:0,display:"flex",flexDirection:"column"},children:[(0,t.jsx)(v,{activeTab:w,onTabChange:S,onSearchOpen:()=>D(!0),onAssistantOpen:()=>ei(null),theme:h,onToggleTheme:()=>m("dark"===h?"light":"dark")}),(0,t.jsx)("div",{style:{flex:1,display:"flex",overflow:"hidden"},children:"api"===w?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(R,{activeId:A,onSelect:ey}),(0,t.jsxs)("div",{className:"fha-inner-scroll",style:{flex:1,display:"flex",gap:32,padding:"0 32px"},children:[(0,t.jsx)("div",{style:{flex:1,minWidth:0},children:(0,t.jsx)(W,{endpoint:el,onAssistantOpen:ei,onMdViewOpen:()=>V(!0),inlineCodePanel:(0,t.jsx)(U,{endpoint:el,lang:E,onLangChange:z,onTryIt:()=>N(!0),onAssistantOpen:ei,inline:!0})})}),(0,t.jsx)("div",{className:"fha-rail-codepanel",children:(0,t.jsx)(U,{endpoint:el,lang:E,onLangChange:z,onTryIt:()=>N(!0),onAssistantOpen:ei})})]})]}):"home"===w?(0,t.jsx)("div",{className:"fha-inner-scroll",style:{flex:1},children:(0,t.jsx)(eA,{onTileSelect:e=>S(e.targetTab),onApiReference:()=>S("api")})}):"docs"===w?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(R,{activeId:I,onSelect:e=>_(e),sections:j,defaultExpanded:{}}),(0,t.jsx)("div",{className:"fha-inner-scroll",style:{flex:1},children:(0,t.jsx)(tG,{activeId:I,onEditClick:()=>F(!0)})})]}):"sdks"===w?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(R,{activeId:L,onSelect:e=>P(e),sections:k,defaultExpanded:{}}),(0,t.jsx)("div",{className:"fha-inner-scroll",style:{flex:1},children:(0,t.jsx)(tV,{activeId:L,onSelectSdk:e=>P(`sdks-${e}`)})})]}):(0,t.jsx)("div",{className:"fha-inner-scroll",style:{flex:1},children:(0,t.jsx)(eK,{})})})]}),Y&&(0,t.jsx)("div",{className:"fha-split-panel",style:{position:"absolute",right:24,bottom:24,zIndex:15,isolation:"isolate",transform:"translateZ(0)",animation:"fha-fadeIn 260ms ease-out both"},children:(0,t.jsx)(tl,{width:380,height:460,autoPlay:!0,compact:y,onClose:()=>J(!1)},`gh-${Z}-${y?"c":"f"}`)})]}),(0,t.jsx)(Q,{endpoint:el,lang:E,open:B,onClose:()=>N(!1)},`tryit-${Z}`),(0,t.jsx)(es,{open:q,onClose:()=>D(!1),onSelect:ey,onAskAI:e=>ei(e)},`search-${Z}`),(0,t.jsx)(eu,{open:K,onClose:()=>$(!1),external:M,onSelectSource:e=>{e.endpointId&&($(!1),ey(e.endpointId))}},`assistant-${Z}`)]});return(0,t.jsx)("div",{className:"homepage-frame",children:(0,t.jsxs)("div",{className:"browser",children:[(0,t.jsx)(tH,{domain:eh,url:eg}),(0,t.jsxs)(eX,{className:"browser-body",children:[(0,t.jsx)("div",{className:`demo-slot animated${H?"editor-on":""}`,style:{position:"absolute",inset:0,overflow:"hidden",zIndex:5,filter:G?"blur(14px)":"none",pointerEvents:G?"none":"auto",transition:"filter 0.25s ease"},"aria-hidden":G,children:(0,t.jsx)("div",{className:"demo-slot-inner",children:ef})}),G&&(l=(o="dark"===h)?"rgba(255,255,255,0.95)":"rgba(0,0,0,0.9)",d=o?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.6)",c=o?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.85)",(0,t.jsxs)("div",{style:{position:"absolute",inset:0,zIndex:20,background:o?"rgba(0, 0, 0, 0.55)":"rgba(255, 255, 255, 0.55)",display:"flex",justifyContent:"center",overflow:"auto"},onClick:e=>{e.target===e.currentTarget&&V(!1)},children:[(0,t.jsx)("button",{onClick:()=>V(!1),"data-demo":"md-close","aria-label":"Close markdown view",style:{position:"absolute",top:16,left:16,display:"inline-flex",alignItems:"center",justifyContent:"center",width:32,height:32,padding:0,border:`1px solid ${o?"rgba(255,255,255,0.18)":"rgba(0,0,0,0.15)"}`,borderRadius:8,background:d,color:l,cursor:"pointer",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"},onMouseEnter:e=>e.currentTarget.style.background=c,onMouseLeave:e=>e.currentTarget.style.background=d,children:(0,t.jsx)(i.Icon,{name:"x",size:16})}),(0,t.jsx)("pre",{style:{margin:0,padding:"56px 48px 64px",width:"100%",maxWidth:760,fontFamily:"var(--font-mono)",fontSize:13,lineHeight:1.7,color:l,whiteSpace:"pre-wrap",wordBreak:"break-word"},children:(p=e=>{let t=[e.type,!0===e.required?"Required":!1===e.required?"Optional":null].filter(Boolean).join(", "),n=e.description?` — ${e.description}`:"";return`- \`${e.name}\` (${t})${n}`},(u=[]).push(`# ${el.title}`),u.push(""),u.push(`\`${el.method} ${el.path}\``),u.push(""),u.push(el.description),u.push(""),u.push("## Request"),el.request.description&&(u.push(""),u.push(el.request.description)),u.push(""),el.request.fields.forEach(e=>u.push(p(e))),u.push(""),u.push(`## Response (${el.response.status} ${el.response.statusLabel})`),el.response.description&&(u.push(""),u.push(el.response.description)),u.push(""),el.response.fields.forEach(e=>u.push(p(e))),u.push(""),u.push("```json"),u.push(el.response.body),u.push("```"),u.join("\n"))})]})),H&&(0,t.jsx)(e4,{onExit:()=>F(!1),theme:h,animated:!0}),(0,t.jsx)(tO,{}),(0,t.jsx)(e2,{cursorRef:ea,visible:eo}),(0,t.jsx)(e6,{idle:ee,enabled:!en&&e1[e]?.hint!==!1,onInteract:()=>{er(!0),window.__widgetsDemo?.dismissAll?.()}})]}),(0,t.jsx)(td,{})]})})}],201849)},242614,e=>{e.n(e.i(201849))}]);