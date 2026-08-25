(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,565993,e=>{"use strict";var t=e.i(746882),r=e.i(855118);let a=["cURL","JavaScript","CLI","MCP"],n=e=>({text:e,type:"string"}),o=e=>({text:e,type:"comment"}),i=e=>({text:e,type:"function"}),l=e=>({text:e,type:"flag"}),s=e=>({text:e}),d={cURL:{raw:`curl -X POST https://api.bland.ai/v1/calls \\
  -H "Authorization: $BLAND_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "+14155552120",
    "task": "Qualify refi lead",
    "voice": "june"
  }'`,lines:[[i("curl"),l(" -X POST"),s(" https://api.bland.ai/v1/calls \\")],[l("  -H"),s(" "),n('"Authorization: $BLAND_API_KEY"'),s(" \\")],[l("  -H"),s(" "),n('"Content-Type: application/json"'),s(" \\")],[l("  -d"),s(" "),n("'{")],[n('    "phone_number": "+14155552120",')],[n('    "task": "Qualify refi lead",')],[n('    "voice": "june"')],[n("  }'")]]},JavaScript:{raw:`// Server-side only. Never put your API key in a browser bundle.
await fetch("https://api.bland.ai/v1/calls", {
  method: "POST",
  headers: {
    "Authorization": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phone_number: "+14155552120",
    task: "Qualify refi lead",
    voice: "june",
  }),
});`,lines:[[o("// Server-side only. Never put your API key in a browser bundle.")],[{text:"await",type:"keyword"},s(" "),i("fetch"),s("("),n('"https://api.bland.ai/v1/calls"'),s(", {")],[s("  method: "),n('"POST"'),s(",")],[s("  headers: {")],[s("    "),n('"Authorization"'),s(": "),n('"YOUR_API_KEY"'),s(",")],[s("    "),n('"Content-Type"'),s(": "),n('"application/json"'),s(",")],[s("  },")],[s("  body: JSON."),i("stringify"),s("({")],[s("    phone_number: "),n('"+14155552120"'),s(",")],[s("    task: "),n('"Qualify refi lead"'),s(",")],[s("    voice: "),n('"june"'),s(",")],[s("  }),")],[s("});")]]},CLI:{raw:`# Install the CLI
npm install -g bland-cli
bland auth login --key $BLAND_API_KEY

# Send a call from your terminal
bland call send +14155552120 \\
  --task "Qualify refi lead" \\
  --voice june`,lines:[[o("# Install the CLI")],[i("npm"),s(" install -g bland-cli")],[i("bland"),s(" auth login "),l("--key"),s(" $BLAND_API_KEY")],[],[o("# Send a call from your terminal")],[i("bland"),s(" call send +14155552120 \\")],[s("  "),l("--task"),s(" "),n('"Qualify refi lead"'),s(" \\")],[s("  "),l("--voice"),s(" june")]]},MCP:{raw:`// Add Bland to Claude Code, Cursor, or any MCP-aware editor
{
  "mcpServers": {
    "bland": {
      "command": "npx",
      "args": ["bland-cli", "mcp"]
    }
  }
}`,lines:[[o("// Add Bland to Claude Code, Cursor, or any MCP-aware editor")],[s("{")],[s("  "),n('"mcpServers"'),s(": {")],[s("    "),n('"bland"'),s(": {")],[s("      "),n('"command"'),s(": "),n('"npx"'),s(",")],[s("      "),n('"args"'),s(": ["),n('"bland-cli"'),s(", "),n('"mcp"'),s("]")],[s("    }")],[s("  }")],[s("}")]]}},c={keyword:"text-[var(--color-sage)]",string:"text-[var(--color-amber)]",comment:"text-secondary italic",function:"text-dark font-medium",number:"text-[var(--color-indigo)]",flag:"text-[var(--color-sage)]"};function p(e,r){return e.type?(0,t.jsx)("span",{className:c[e.type],children:e.text},r):(0,t.jsx)("span",{children:e.text},r)}e.s(["default",0,function(){let[e,n]=(0,r.useState)("cURL"),[o,i]=(0,r.useState)(!1),l=(0,r.useMemo)(()=>d[e],[e]),s=String(l.lines.length).length;async function c(){try{await navigator.clipboard.writeText(l.raw),i(!0),setTimeout(()=>i(!1),1400)}catch{}}return(0,t.jsxs)("div",{className:"relative rounded-card border border-border-soft bg-white overflow-hidden",children:[(0,t.jsxs)("div",{className:"flex items-center justify-between gap-3 px-3 py-2 border-b border-border-soft bg-fog",children:[(0,t.jsx)("div",{className:"flex items-center gap-1 overflow-x-auto",children:a.map(r=>{let a=r===e;return(0,t.jsx)("button",{onClick:()=>n(r),className:["font-body text-[13px] font-medium px-3 py-1.5 rounded-badge transition-colors whitespace-nowrap",a?"bg-white text-dark border border-border-soft":"text-secondary hover:text-dark border border-transparent"].join(" "),"aria-pressed":a,children:r},r)})}),(0,t.jsxs)("button",{onClick:c,className:"inline-flex items-center gap-1.5 font-body text-[12px] font-medium text-secondary hover:text-dark transition-colors px-2.5 py-1.5 rounded-badge","aria-label":"Copy code",children:[(0,t.jsx)("svg",{width:"12",height:"12",viewBox:"0 0 12 12",fill:"none","aria-hidden":!0,children:o?(0,t.jsx)("path",{d:"M2.5 6.2L4.7 8.4L9.5 3.6",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("rect",{x:"3.5",y:"3.5",width:"6",height:"7",rx:"1",stroke:"currentColor",strokeWidth:"1.1"}),(0,t.jsx)("path",{d:"M3.5 2.5 H7.5 a1 1 0 0 1 1 1",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round",fill:"none"})]})}),o?"Copied":"Copy code"]})]}),(0,t.jsxs)("div",{className:"bg-white flex font-mono text-[13px] leading-[1.7] overflow-x-auto",style:{fontFamily:'"Söhne Mono", Menlo, Consolas, monospace'},children:[(0,t.jsx)("div",{"aria-hidden":!0,className:"select-none text-secondary opacity-50 text-right pl-5 pr-4 py-5 border-r border-border-soft bg-fog/40",style:{minWidth:`${s+2}ch`},children:l.lines.map((e,r)=>(0,t.jsx)("div",{children:r+1},r))}),(0,t.jsx)("div",{className:"flex-1 py-5 pl-5 pr-6 min-w-0",children:l.lines.map((e,r)=>(0,t.jsx)("div",{className:"min-h-[1.7em] whitespace-pre",children:0===e.length?" ":e.map(p)},r))})]})]})}])}]);