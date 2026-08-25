(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,319445,e=>{"use strict";e.s(["ARROW_POSITION",0,{left:"left",right:"right"},"ARROW_ROTATION",0,{left:"-rotate-180",right:"rotate-0",up:"-rotate-90",down:"rotate-90"},"INITIAL_ACTIVE_CATEGORY",0,"All","RELOAD_ICON_POSITION",0,{left:"left",right:"right"}])},340969,e=>{"use strict";var t=e.i(171608),r=e.i(479656),i=e.i(57519),a=e.i(246182),s=e.i(319445),o=e.i(857649),n=e.i(403896);let l=`
    bg-neutral-900 text-white font-semibold
    shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset]
    ring-[0.0625rem] ring-white/20 ring-inset ring-offset-2 ring-offset-neutral-900
    transition-all duration-200
    hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-[0.0625rem] hover:ring-white/40
    active:scale-[0.98]
    dark:bg-white dark:text-black
    dark:shadow-[0px_0px_10px_0px_rgba(0,0,0,0.2)_inset]
    dark:ring-black/20 dark:ring-offset-white
    dark:hover:shadow-[0px_0px_20px_0px_rgba(199,45,7,0.3)_inset] dark:hover:ring-black/50
    outline-hidden focus-visible:ring-2 focus-visible:ring-cui-focus focus-visible:ring-offset-2
  `,g=o.PRIMARY_BUTTON_CLASS,c=`
    text-gray-900 dark:text-orange-500
    group-hover:text-white dark:group-hover:text-orange-500
    group-focus:text-white dark:group-focus:text-orange-500
    group-active:text-white dark:group-active:text-orange-500
    group-disabled:text-gray-400
  `,d=`
    text-cui-primary group-disabled:text-cui-tertiary
  `,x=`
    h-auto
    p-0
    text-gray-900 dark:text-white hover:text-purple-600
    outline-hidden focus-visible:ring-2 focus-visible:ring-cui-focus focus-visible:ring-offset-2
    active:bg-transparent active:text-green-500
    disabled:text-gray-400 dark:disabled:text-gray-200
  `,u=`
    text-orange-500 group-hover:text-purple-600
    group-focus:text-gray-900 dark:group-focus:text-white
    group-active:text-green-500
    group-disabled:text-gray-200 dark:group-disabled:text-gray-400
  `,p=`
    bg-orange-650 text-white border border-solid border-orange-500
    hover:bg-orange-600 active:bg-orange-700
    outline-hidden focus-visible:ring-2 focus-visible:ring-cui-focus focus-visible:ring-offset-2
    disabled:bg-neutral-100 disabled:text-gray-400 disabled:pointer-events-none
  `,h=`
    text-gray-900 group-hover:text-white group-focus:text-white group-active:text-white group-disabled:text-gray-400
  `,f={primary:g,special:g,secondary:n.secondaryButtonClass,buttonLink:x,tertiary:p,glowRing:l},m={primary:c,special:c,secondary:d,buttonLink:u,tertiary:h,glowRing:c},b={primary:"text-neutral-950",special:"text-neutral-950",secondary:"text-cui-primary transition-colors duration-200 group-disabled:text-cui-tertiary",buttonLink:"text-gray-900 dark:text-white",tertiary:"text-white",glowRing:"text-white dark:text-black"},w={default:o.STANDARD_COMPACT_BUTTON_CLASS,compact:o.STANDARD_COMPACT_BUTTON_CLASS},y=({className:e})=>(0,t.jsxs)("svg",{className:e,fill:"none",viewBox:"0 0 24 24","aria-hidden":"true",children:[(0,t.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,t.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]});e.s(["default",0,({text:e,href:n,download:l,rel:g,isExternal:c,variant:d="primary",size:x="default",arrowPosition:u,arrowRotation:p="right",noScroll:h=!1,className:_="",showLoader:A=!1,orangeArrow:R=!1,orangeArrowPosition:O,blackArrow:k=!1,blackArrowPosition:N,textColor:T,"data-cta-name":v})=>{let I="";I="glowRing"===d?"h-14 w-full sm:w-52 px-4 py-2 rounded-[0.25rem] text-xl text-center gap-2":"tertiary"===d?"h-auto px-3 py-2 rounded-[0.25rem] text-sm font-medium leading-5 gap-2":w[x];let j="primary"===d||"special"===d||"glowRing"===d,S=`${o.GLOBAL_BUTTON_BASE_CLASS} ${I}`,C=(0,r.twMerge)(S,f[d],_,("primary"===d||"special"===d||"secondary"===d)&&o.STANDARD_COMPACT_BUTTON_CLASS),B=n?.startsWith("www.")?`https://${n}`:n??"#",L=/^https?:\/\//.test(B),P=c?"_blank":L?"_parent":"_self",W="_blank"===P?Array.from(new Set([...g?.split(/\s+/u).filter(Boolean)??[],"noopener","noreferrer"])).join(" "):g;return(0,t.jsxs)(a.Link,{href:B,download:l,target:P,rel:W,className:C,scroll:!h,prefetch:!1,"data-cta-name":v,children:[R&&!j&&"left"===O&&(0,t.jsx)(i.ArrowRightIcon,{className:"size-5 rotate-180 text-orange-500","aria-hidden":"true"}),k&&!j&&"left"===N&&(0,t.jsx)(i.ArrowRightIcon,{className:"size-5 rotate-180 text-black","aria-hidden":"true"}),!R&&A&&!j&&u===s.ARROW_POSITION.left&&(0,t.jsx)(y,{className:`animate-spin w-6 h-6 ${m[d]}`}),!R&&!A&&!j&&u===s.ARROW_POSITION.left&&(0,t.jsx)(i.ArrowRightIcon,{className:`size-6 ${m[d]} ${s.ARROW_ROTATION[p]}`,"aria-hidden":"true"}),(0,t.jsx)("span",{className:(0,r.twMerge)(b[d],T),children:e}),("primary"===d||"special"===d||"glowRing"===d)&&(0,t.jsx)(i.ArrowRightIcon,{className:`cr-default-primary-button-icon size-4 shrink-0 ${"glowRing"===d?"text-cui-accent":"text-neutral-950"}`,"aria-hidden":"true"}),R&&!j&&"right"===O&&(0,t.jsx)(i.ArrowRightIcon,{className:"size-5 text-orange-500","aria-hidden":"true"}),k&&!j&&"right"===N&&(0,t.jsx)(i.ArrowRightIcon,{className:"size-5 text-black","aria-hidden":"true"}),!R&&A&&!j&&u===s.ARROW_POSITION.right&&(0,t.jsx)(y,{className:`animate-spin w-6 h-6 ${m[d]}`}),!R&&!A&&!j&&u===s.ARROW_POSITION.right&&(0,t.jsx)(i.ArrowRightIcon,{className:`size-6 ${m[d]} ${s.ARROW_ROTATION[p]}`,"aria-hidden":"true"})]})}])},49887,e=>{"use strict";var t=e.i(171608),r=e.i(479656),i=e.i(246182),a=e.i(340969);e.s(["default",0,({data:e,className:s=""})=>(0,t.jsxs)("div",{className:(0,r.twMerge)("flex flex-col mb-12 lg:mt-0",s),children:[(0,t.jsx)(a.default,{text:e?.Button?.Text,variant:"primary",href:e?.Button?.Url||"",isExternal:e?.Button?.isExternal,arrowPosition:"right",className:"mt-4 [&>span]:flex [&>span]:items-center [&>span]:leading-none text-body-lg! md:text-label-lg!"}),e?.Button?.Hyperlink&&(0,t.jsx)(i.Link,{href:e?.Button?.Hyperlink?.HyperlinkUrl,className:"flex gap-2 mt-4 font-semibold font-sans text-body-md",children:(0,t.jsxs)("p",{className:"flex justify-center items-center",children:[e?.Button?.Hyperlink?.Text,(0,t.jsx)("span",{className:"hover:text-orange-500 pl-1",children:e?.Button?.Hyperlink?.HyperlinkText})]})})]})])}]);