(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,493846,t=>{"use strict";var e=t.i(746882),a=t.i(254249),r=t.i(993349);t.s(["default",0,function({href:t,location:n,tier:o,className:s,children:l,onClick:c,target:i,rel:u,ariaLabel:f}){let d=(0,r.withCtaAttribution)(t,n),p=(0,r.detectCtaType)(d),h=()=>{p&&(0,r.trackCta)({cta_type:p,location:n,href:d,tier:o}),c?.()};return d.startsWith("http://")||d.startsWith("https://")?(0,e.jsx)("a",{href:d,className:s,onClick:h,target:i??"_blank",rel:u??"noopener noreferrer","aria-label":f,children:l}):(0,e.jsx)(a.default,{href:d,className:s,onClick:h,"aria-label":f,children:l})}])},794972,t=>{"use strict";var e=t.i(855118);Date.UTC(2026,5,16,0,0,0);function a(t){let e=Date.parse(t.asOf),a=(e-Date.parse(t.previous.asOf))/1e3,r=a>0?(t.count-t.previous.count)/a:0;return{count:t.count,asOfMs:e,rate:r}}t.s(["placeholderStats",0,function(){let t=Date.now();return{count:0,asOf:new Date(t).toISOString(),previous:{count:0,asOf:new Date(t-3e5).toISOString()}}},"useCallCounter",0,function(t){let[r,n]=(0,e.useState)(t.count),o=(0,e.useRef)(a(t));return(0,e.useEffect)(()=>{let t=!1,e=async()=>{try{let e=await fetch("/api/stats/calls",{cache:"no-store"});if(!e.ok)return;let r=await e.json();t||(o.current=a(r))}catch{}};e();let r=window.setInterval(e,6e4),s=window.setInterval(()=>{if(document.hidden)return;let t=o.current,e=(Date.now()-t.asOfMs)/1e3,a=Math.floor(t.count+t.rate*Math.max(0,e));n(t=>t===a?t:a)},1e3);return()=>{t=!0,window.clearInterval(r),window.clearInterval(s)}},[]),{count:r}}],794972)},60984,t=>{"use strict";var e=t.i(746882),a=t.i(794972);t.s(["default",0,function({initialStats:t,label:r="Calls resolved to date"}){let{count:n}=(0,a.useCallCounter)(t);return(0,e.jsxs)("div",{className:"about-counter",children:[(0,e.jsx)("span",{className:"about-counter-num",children:n.toLocaleString("en-US")}),(0,e.jsx)("span",{className:"about-counter-label",children:r}),(0,e.jsx)("style",{children:`
        .about-counter {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-display);
          font-size: 12px;
          letter-spacing: -0.005em;
          color: var(--color-dark);
          font-variant-numeric: tabular-nums;
        }
        .about-counter-num { font-weight: 500; }
        .about-counter-label {
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
          font-weight: 500;
        }
      `})]})}])}]);