import{t as e}from"./rolldown-runtime.Dh6celcD.mjs";import{I as t,P as n,V as r,k as i,l as a,s as o,w as s,z as c}from"./react.Bk_G6vHg.mjs";import{X as l,j as u,o as d}from"./framer.Cj-EYKIt.mjs";import{h as f,o as p,p as m,t as h}from"./OIjZRBmWDcIE2B6qgG1j.BoalAtx1.mjs";var g=e((()=>{h()}));function _({type:e,url:t,html:n,zoom:r,radius:i,border:o,style:s={}}){return e===`url`&&t?a(y,{url:t,zoom:r,radius:i,border:o,style:s}):e===`html`&&n?a(x,{html:n,style:s}):a(v,{style:s})}function v({style:e}){return a(`div`,{style:{minHeight:O(e),...f,overflow:`hidden`,...e},children:a(`div`,{style:j,children:`To embed a website or widget, add it to the properties\xA0panel.`})})}function y({url:e,zoom:r,radius:i,border:o,style:s}){let c=!s.height;/[a-z]+:\/\//.test(e)||(e=`https://`+e);let l=p(),[u,d]=t(l?void 0:!1);return n(()=>{if(!l)return;let t=!0;d(void 0);async function n(){let n=await fetch(`https://api.framer.com/functions/check-iframe-url?url=`+encodeURIComponent(e));if(n.status==200){let{isBlocked:e}=await n.json();t&&d(e)}else{let e=await n.text();console.error(e),d(Error(`This site can’t be reached.`))}}return n().catch(e=>{console.error(e),d(e)}),()=>{t=!1}},[e]),l&&c?a(D,{message:`URL embeds do not support auto height.`,style:s}):e.startsWith(`https://`)?u===void 0?a(E,{}):u instanceof Error?a(D,{message:u.message,style:s}):u===!0?a(D,{message:`Can’t embed ${e} due to its content security policy.`,style:s}):a(`iframe`,{src:e,style:{...k,...s,...o,zoom:r,borderRadius:i,transformOrigin:`top center`},loading:`lazy`,fetchPriority:l?`low`:`auto`,referrerPolicy:`no-referrer`,sandbox:b(l)}):a(D,{message:`Unsupported protocol.`,style:s})}function b(e){let t=[`allow-same-origin`,`allow-scripts`];return e||t.push(`allow-downloads`,`allow-forms`,`allow-modals`,`allow-orientation-lock`,`allow-pointer-lock`,`allow-popups`,`allow-popups-to-escape-sandbox`,`allow-presentation`,`allow-storage-access-by-user-activation`,`allow-top-navigation-by-user-activation`),t.join(` `)}function x({html:e,...t}){if(e.includes(`<\/script>`)){let n=e.includes(`</spline-viewer>`),r=e.includes(`<!-- framer-direct-embed -->`);return a(n||r?C:S,{html:e,...t})}return a(w,{html:e,...t})}function S({html:e,style:o}){let s=i(),[c,l]=t(0);n(()=>{let e=s.current?.contentWindow;function t(t){if(t.source!==e)return;let n=t.data;if(typeof n!=`object`||!n)return;let r=n.embedHeight;typeof r==`number`&&l(r)}return r.addEventListener(`message`,t),e?.postMessage(`getEmbedHeight`,`*`),()=>{r.removeEventListener(`message`,t)}},[]);let u=`
<html>
    <head>
        <style>
            html, body {
                margin: 0;
                padding: 0;
            }

            body {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            :root {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            * {
                box-sizing: border-box;
                -webkit-font-smoothing: inherit;
            }

            h1, h2, h3, h4, h5, h6, p, figure {
                margin: 0;
            }

            body, input, textarea, select, button {
                font-size: 12px;
                font-family: sans-serif;
            }
        </style>
    </head>
    <body>
        ${e}
        <script type="module">
            let height = 0

            function sendEmbedHeight() {
                window.parent.postMessage({
                    embedHeight: height
                }, "*")
            }

            const observer = new ResizeObserver((entries) => {
                if (entries.length !== 1) return
                const entry = entries[0]
                if (entry.target !== document.body) return

                height = entry.contentRect.height
                sendEmbedHeight()
            })

            observer.observe(document.body)

            window.addEventListener("message", (event) => {
                if (event.source !== window.parent) return
                if (event.data !== "getEmbedHeight") return
                sendEmbedHeight()
            })
        <\/script>
    <body>
</html>
`,d={...k,...o};return o.height||(d.height=c+`px`),a(`iframe`,{ref:s,style:d,srcDoc:u})}function C({html:e,style:t}){let r=i();return n(()=>{let t=r.current;if(t)return t.innerHTML=e,T(t),()=>{t.innerHTML=``}},[e]),a(`div`,{ref:r,style:{...A,...t}})}function w({html:e,style:t}){return a(`div`,{style:{...A,...t},dangerouslySetInnerHTML:{__html:e}})}function T(e){if(e instanceof Element&&e.tagName===`SCRIPT`){let t=document.createElement(`script`);t.text=e.innerHTML;for(let{name:n,value:r}of e.attributes)t.setAttribute(n,r);e.parentElement.replaceChild(t,e)}else for(let t of e.childNodes)T(t)}function E(){return a(`div`,{className:`framerInternalUI-componentPlaceholder`,style:{...m,overflow:`hidden`},children:a(`div`,{style:j,children:`Loading…`})})}function D({message:e,style:t}){return a(`div`,{className:`framerInternalUI-errorPlaceholder`,style:{minHeight:O(t),...m,overflow:`hidden`,...t},children:a(`div`,{style:j,children:e})})}function O(e){if(!e.height)return 200}var k,A,j,M=e((()=>{c(),o(),s(),l(),g(),u(_,{type:{type:d.Enum,defaultValue:`url`,displaySegmentedControl:!0,options:[`url`,`html`],optionTitles:[`URL`,`HTML`]},url:{title:`URL`,type:d.String,description:`Some websites don’t support embedding.`,hidden(e){return e.type!==`url`}},html:{title:`HTML`,type:d.String,displayTextArea:!0,hidden(e){return e.type!==`html`}},border:{title:`Border`,type:d.Border,optional:!0,hidden(e){return e.type!==`url`}},radius:{type:d.BorderRadius,title:`Radius`,hidden(e){return e.type!==`url`}},zoom:{title:`Zoom`,defaultValue:1,type:d.Number,hidden(e){return e.type!==`url`},min:.1,max:1,step:.1,displayStepper:!0}}),k={width:`100%`,height:`100%`,border:`none`},A={width:`100%`,height:`100%`,display:`flex`,flexDirection:`column`,justifyContent:`center`,alignItems:`center`},j={textAlign:`center`,minWidth:140}}));export{M as n,_ as t};
//# sourceMappingURL=Embed.BXwn0jdv.mjs.map