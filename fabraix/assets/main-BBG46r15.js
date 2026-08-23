import"./js-yaml-DSK4ua50.js";import{i as M,l as L,r as S,a as C}from"./siteLayout-DP_gnFnc.js";import{i as H}from"./flowGradient-DDTEKXEO.js";function k(e){return e.map(t=>`
    <div class="built-by-item" title="${t.name}">
      <img class="built-by-logo" src="${t.logo}" alt="${t.name}" />
      <span class="built-by-name">${t.name}</span>
    </div>
  `).join("")}function T(e){return e.map(t=>{const n=t.featured?"pricing-card featured":"pricing-card",s=t.cta?`<a href="${t.cta.url}" class="pricing-card-cta">${t.cta.text} →</a>`:"";return`
      <div class="${n}">
        <div class="pricing-badge">${t.badge}</div>
        <p class="pricing-name">${t.name}</p>
        <p class="pricing-audience">${t.audience}</p>
        <p class="pricing-desc">${t.description}</p>
        <p class="pricing-price">${t.price}</p>
        <p class="pricing-note">${t.note}${t.note2?` • ${t.note2}`:""}</p>
        <ul class="pricing-features">
          ${t.features.map(i=>`<li>${i}</li>`).join("")}
        </ul>
        ${s}
      </div>
    `}).join("")}function j(e){const t=document.getElementById("hero-caps");!t||!Array.isArray(e)||(t.innerHTML=e.map((n,s)=>`
    <div class="hero-cap">
      <span class="hero-cap-num">${String(s+1).padStart(2,"0")}</span>
      <span class="hero-cap-name">${n.name}</span>
      <p class="hero-cap-detail">${n.detail}</p>
    </div>
  `).join(""))}function _(e){const t=document.getElementById("hero-yc-badge");if(!t||!e)return;e.url&&(t.href=e.url),t.setAttribute("aria-label",e.text);const n='<span class="hero-yc-badge-mark" aria-hidden="true"><img src="/logos/ycombinator.svg" alt="" /></span>',s=e.text.split(/\s+Y\s+/);t.innerHTML=s.length===2?`<span class="hero-yc-badge-text">${s[0]}</span>${n}<span class="hero-yc-badge-text">${s[1]}</span>`:`${n}<span class="hero-yc-badge-text">${e.text}</span>`}function q(e){const t=document.getElementById("hero-ctas");!t||!Array.isArray(e)||(t.innerHTML=e.map(n=>{const s=n.primary?"hero-cta primary":"hero-cta";return`<a href="${n.url}" class="${s}">${n.text}<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6h8M7 3l3 3-3 3"/></svg></a>`}).join(""))}function F(e){if(!e)return;const t=document.getElementById("hero-title-line1"),n=document.getElementById("hero-title-line2");t&&e.line1&&(t.textContent=e.line1),n&&e.line2&&(n.textContent=e.line2)}function N(e){if(!e)return;const t=document.getElementById("big-type-left"),n=document.getElementById("big-type-right");t&&Array.isArray(e.left)&&(t.innerHTML=e.left.map(s=>`<span class="big-type-dark">${s}</span>`).join("")),n&&Array.isArray(e.right)&&(n.innerHTML=e.right.map(s=>`<span class="big-type-accent">${s}</span>`).join(""))}function R(e){if(!e)return;const t=document.getElementById("nyx-chip"),n=document.getElementById("nyx-label"),s=document.getElementById("nyx-name");t&&e.chip&&(t.textContent=e.chip),n&&e.label&&(n.textContent=e.label),s&&e.product&&(s.textContent=e.product)}function z(e){if(!e)return;const t=document.getElementById("nyx-product-lede");if(t&&e.lede&&(t.textContent=e.lede),e.chat){const i=document.getElementById("chat-viewport");i&&e.chat.aria_label&&i.setAttribute("aria-label",e.chat.aria_label);const r=document.getElementById("chat-script");r&&Array.isArray(e.chat.messages)&&(r.innerHTML=e.chat.messages.map(o=>`
        <div class="chat-bubble chat-bubble-${o.role}">
          <span class="chat-speaker">${o.speaker}</span>
          <p class="chat-text">${o.text}</p>
        </div>
      `).join(""))}const n=document.getElementById("nyx-product-features");n&&Array.isArray(e.features)&&(n.innerHTML=e.features.map((i,r)=>`
      <div class="nyx-product-feature">
        <span class="nyx-product-feature-num">${String(r+1).padStart(2,"0")}</span>
        <h3 class="nyx-product-feature-title">${i.title}</h3>
        <p class="nyx-product-feature-desc">${i.description}</p>
      </div>
    `).join(""));const s=document.getElementById("nyx-product-cta-row");s&&Array.isArray(e.ctas)&&(s.innerHTML=e.ctas.map(i=>i.primary?`<a href="${i.url}" class="nyx-product-cta-primary">
          <span>${i.text}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>`:`<a href="${i.url}" class="nyx-product-cta-secondary">${i.text}</a>`).join(""))}function x(e,t){if(!t)return;const n=document.getElementById(`${e}-chip`),s=document.getElementById(`${e}-title`),i=document.getElementById(`${e}-lede`);n&&t.chip&&(n.textContent=t.chip),s&&t.title&&(s.innerHTML=t.title),i&&t.lede&&(i.textContent=t.lede)}function O(e){if(!e)return;x("use-cases",e);const t=document.getElementById("use-cases-filter");t&&Array.isArray(e.filters)&&(t.innerHTML=e.filters.map((s,i)=>`
      <button class="use-cases-filter-pill ${i===0?"is-active":""}" data-filter="${s.value}">${s.label}</button>
    `).join(""));const n=document.getElementById("use-cases-grid");n&&Array.isArray(e.cards)&&(n.innerHTML=e.cards.map(s=>`
      <div class="usecase-card" data-categories="${(s.categories||[]).join(",")}">
        <span class="usecase-card-title">${s.title}</span>
        <p class="usecase-card-desc">${s.description}</p>
      </div>
    `).join(""))}function D(e){if(!e)return;x("numbers",e);const t=document.getElementById("numbers-grid");t&&Array.isArray(e.cards)&&(t.innerHTML=e.cards.map(n=>{const s=n.suffix?`<span class="number-card-${n.suffix_class||"suffix"}">${n.suffix}</span>`:"";return`
        <div class="number-card">
          <span class="number-card-label">${n.label}</span>
          <span class="number-card-value">${n.value}${s}</span>
          <p class="number-card-desc">${n.description}</p>
        </div>
      `}).join(""))}function G(e){if(!e)return;x("research",e);const t=document.getElementById("research-grid");!t||!Array.isArray(e.cards)||(t.innerHTML=e.cards.map(n=>{const s=n.icon==="star"?'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',i=n.type==="github"&&n.repo?`<span id="github-star-count" class="github-star-count" data-github-repo="${n.repo}" aria-live="polite"></span>`:"",r=n.type==="github"?' target="_blank" rel="noopener"':"";return`
      <a href="${n.url}"${r} class="research-card">
        <div class="research-card-top">
          <span class="research-card-chip">${n.chip}</span>
          <h3 class="research-card-title">${n.title}</h3>
          <p class="research-card-desc">${n.description}</p>
        </div>
        <span class="research-card-cta">
          ${n.cta}
          ${s}
          ${i}
        </span>
      </a>
    `}).join(""))}function U(e){if(!e)return;const t=document.getElementById("pricing-title"),n=document.getElementById("pricing-subtitle");t&&e.title&&(t.innerHTML=e.title),n&&e.subtitle&&(n.textContent=e.subtitle);const s=document.getElementById("pricing-grid");s&&e.plans&&(s.innerHTML=T(e.plans));const i=document.getElementById("pricing-enterprise");if(i&&e.enterprise){const r=e.enterprise,o=r.cta?`<a href="${r.cta.url}" class="pricing-enterprise-cta">${r.cta.text}
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
         </a>`:"";i.innerHTML=`
      <div class="pricing-enterprise-copy">
        ${r.eyebrow?`<span class="pricing-enterprise-eyebrow">${r.eyebrow}</span>`:""}
        <h3 class="pricing-enterprise-title">${r.title||""}</h3>
        <p class="pricing-enterprise-desc">${r.description||""}</p>
      </div>
      ${o}
    `}}function V(e){if(!e)return;const t=document.getElementById("field-proof-eyebrow"),n=document.getElementById("field-proof-title"),s=document.getElementById("field-proof-lede"),i=document.getElementById("field-proof-cta-link");t&&e.chip&&(t.textContent=e.chip),n&&e.title&&(n.innerHTML=e.title),s&&(s.textContent=e.lede||"");const r=document.getElementById("field-proof-boxes");r&&Array.isArray(e.findings)&&(r.innerHTML=e.findings.map(o=>`
      <div class="proofbar-box">
        <span class="proofbar-box-num">${o.num||""}</span>
        <span class="proofbar-box-main">
          <span class="proofbar-box-title">${o.title}</span>
          ${o.desc?`<span class="proofbar-box-desc">${o.desc}</span>`:""}
        </span>
        <span class="proofbar-box-tag">${o.tag}</span>
      </div>
    `).join("")),i&&e.cta&&(i.href=e.cta.url,i.innerHTML=`${e.cta.text}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`)}const J={soc2:'<img src="/logos/soc2.png" alt="AICPA SOC — SOC 2" width="54" height="54" />',gdpr:'<img src="/logos/gdpr.png" alt="GDPR" width="54" height="54" />'};function X(e){if(!e)return;const t=document.getElementById("security-eyebrow"),n=document.getElementById("security-title"),s=document.getElementById("security-lede"),i=document.getElementById("security-ctas"),r=document.getElementById("security-badge"),o=document.getElementById("security-points");if(t&&e.eyebrow&&(t.textContent=e.eyebrow),n&&e.title&&(n.textContent=e.title),s&&e.lede&&(s.textContent=e.lede),i&&Array.isArray(e.ctas)&&(i.innerHTML=e.ctas.map(a=>{const l=a.primary?"hero-cta primary":"hero-cta",d=/^https?:/.test(a.url)?' target="_blank" rel="noopener"':"";return`<a href="${a.url}"${d} class="${l}">${a.text}</a>`}).join("")),r&&Array.isArray(e.badges)&&(r.innerHTML=e.badges.map(a=>`
      <div class="sec-badge">
        <div class="sec-badge-seal sec-badge-seal--${a.kind}">${J[a.kind]||""}</div>
        <div class="sec-badge-meta">
          <span class="sec-badge-name">${a.name}</span>
          ${a.status?`<span class="soc2-status">${a.status}</span>`:""}
        </div>
      </div>`).join("")),o&&Array.isArray(e.points)){const a='<svg class="security-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';o.innerHTML=e.points.map(l=>`<li>${a}<span>${l}</span></li>`).join("")}}function Y(e){if(!e)return;const t=document.getElementById("final-cta");if(!t)return;t.href=e.url||"#",e.aria_label&&t.setAttribute("aria-label",e.aria_label);const n=Array.isArray(e.rows)?e.rows:[];t.innerHTML=n.map(s=>`<div class="final-cta-row">${(s.segments||[]).map(r=>{if(r.type==="dot")return`<span class="final-cta-dot is-${r.style} size-${r.size}"></span>`;const o=r.arrow?" is-arrow":"",a=r.arrow?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>':"";return`<span class="final-cta-pill is-${r.style}${o}">${r.text}${a}</span>`}).join("")}</div>`).join("")}async function E(){try{M(),H(document.getElementById("hero-flow"));const e=await L();document.title=e.site.title;const t=document.querySelector('meta[name="description"]');if(t&&t.setAttribute("content",e.site.description),S(e.nav),e.hero){_(e.hero.yc_badge),F(e.hero.title);const n=document.getElementById("hero-subtitle");n&&e.hero.subtitle&&(n.textContent=e.hero.subtitle),q(e.hero.ctas),j(e.hero.capabilities)}if(N(e.big_type),e.built_by&&Array.isArray(e.built_by.logos)){const n=document.getElementById("built-by-logos");n&&(n.className="built-by-grid",n.innerHTML=k(e.built_by.logos))}e.approach&&P(e.approach),R(e.nyx),z(e.nyx_product),O(e.use_cases),D(e.numbers),V(e.field_proof),G(e.research),X(e.security_home),U(e.pricing),Y(e.final_cta),C(e.footer),ee(),Z(),W(),Q(),K()}catch(e){console.error("Failed to initialize application:",e)}}function K(){const e=window.location.hash;if(!e||e.length<2)return;const t=decodeURIComponent(e.slice(1)),n=document.getElementById(t);n&&requestAnimationFrame(()=>{n.scrollIntoView({block:"start",behavior:"auto"})})}async function Q(){const e=document.getElementById("github-star-count");if(!e)return;const t=e.dataset.githubRepo;if(!t)return;const n=r=>r>=1e3?`${(r/1e3).toFixed(1)}k`:String(r),s=`gh-stars:${t}`,i=3600*1e3;try{const r=localStorage.getItem(s);if(r){const{count:o,ts:a}=JSON.parse(r);if(Date.now()-a<i&&typeof o=="number"){e.textContent=n(o);return}}}catch{}try{const r=await fetch(`https://api.github.com/repos/${t}`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)return;const a=(await r.json()).stargazers_count;if(typeof a!="number")return;e.textContent=n(a);try{localStorage.setItem(s,JSON.stringify({count:a,ts:Date.now()}))}catch{}}catch{}}function W(){const e=document.getElementById("chat-feed"),t=document.getElementById("chat-script");if(!e||!t)return;const n=window.matchMedia("(prefers-reduced-motion: reduce)").matches,s=Array.from(t.content.querySelectorAll(".chat-bubble"));if(s.length===0)return;if(n){s.forEach(c=>{const p=c.cloneNode(!0);p.classList.add("is-visible"),e.appendChild(p)});return}const i=3,r=1100,o=320;let a=0;const l=[];function d(){const c=getComputedStyle(e);return parseFloat(c.rowGap||c.gap)||0}function h(){const c=s[a%s.length].cloneNode(!0);c.style.visibility="hidden",e.appendChild(c);const p=c.offsetHeight,$=d();for(c.style.visibility="",c.style.marginTop=`-${p+$}px`,c.offsetHeight,requestAnimationFrame(()=>{requestAnimationFrame(()=>{c.style.marginTop="",c.classList.add("is-visible")})}),l.push(c);l.length>i;){const y=l.shift(),b=y.offsetHeight;y.style.marginTop=`-${b+$}px`,y.classList.remove("is-visible"),y.classList.add("is-leaving"),setTimeout(()=>y.remove(),o)}a+=1}let u=null;const m=()=>{u||(h(),u=setInterval(h,r))},g=()=>{u&&(clearInterval(u),u=null)};new IntersectionObserver(c=>{c.forEach(p=>p.isIntersecting?m():g())},{threshold:.15}).observe(e)}function Z(){const e=document.getElementById("use-cases-filter"),t=document.getElementById("use-cases-grid");if(!e||!t)return;const n=e.querySelectorAll(".use-cases-filter-pill"),s=t.querySelectorAll(".usecase-card");n.forEach(i=>{i.addEventListener("click",()=>{n.forEach(o=>o.classList.remove("is-active")),i.classList.add("is-active");const r=i.dataset.filter;s.forEach(o=>{const a=(o.dataset.categories||"").split(","),l=r==="all"||a.includes(r);o.classList.toggle("is-hidden",!l)})})})}function P(e){const t=document.querySelector(".thesis-title");t&&e.title&&(t.textContent=e.title);const n=Array.isArray(e.statements)?e.statements:[];if(n.length===0)return;const s=document.querySelector(".thesis-stage");s&&(s.innerHTML=n.map((r,o)=>{const a=typeof r=="object"&&r&&r.label||"",l=typeof r=="object"&&r?r.body||"":String(r),d=a?`<div class="thesis-slide-label">${a}</div>`:"";return`<div class="thesis-slide" data-slide="${o}">${d}<div class="thesis-slide-body">${l}</div></div>`}).join(""));const i=document.querySelector(".thesis-counter-total");i&&(i.textContent=`/ ${String(n.length).padStart(2,"0")}`)}function ee(){const e=document.getElementById("thesis-scroll");if(!e)return;const t=e.querySelector(".thesis-sticky"),n=e.querySelector(".thesis-counter-current"),s=e.querySelector(".thesis-progress-bar"),i=e.querySelectorAll(".thesis-slide"),r=i.length,o=[];i.forEach(d=>{const h=d.querySelector(".thesis-slide-body")||d,u=h.textContent;let m="";for(let g=0;g<u.length;g++){const f=u[g];f===" "?m+=" ":m+=`<span class="tc">${f}</span>`}h.innerHTML=m,o.push(h.querySelectorAll(".tc"))});let a=-1;function l(){const d=e.getBoundingClientRect(),h=parseFloat(getComputedStyle(t).top)||0,u=e.offsetHeight-t.offsetHeight,m=Math.min(Math.max((h-d.top)/u,0),.9999),g=1/r,f=Math.min(Math.floor(m*r),r-1);f!==a&&(n.textContent=String(f+1).padStart(2,"0"),a=f),s&&(s.style.width=`${m*100}%`),i.forEach((c,p)=>{const $=p*g,y=(m-$)/g,b=o[p],B=b.length;if(p===f){c.style.opacity="1",c.style.pointerEvents="auto";const v=Math.min(Math.max(y,0),1),I=Math.round(v*B);b.forEach((w,A)=>{w.classList.toggle("lit",A<I)})}else c.style.opacity="0",c.style.pointerEvents="none",b.forEach(v=>v.classList.remove("lit"))})}window.addEventListener("scroll",l,{passive:!0}),l()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{E()}):E();{const e=document.createElement("script");e.defer=!0,e.src="https://cloud.umami.is/script.js",e.setAttribute("data-website-id","54293e31-5334-4168-b89d-cae14ca3551e"),document.head.appendChild(e)}
