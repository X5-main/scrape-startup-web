(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`99457c4f-5197-4c0a-8ba1-098409b752f7`,e._sentryDebugIdIdentifier=`sentry-dbid-99457c4f-5197-4c0a-8ba1-098409b752f7`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Introducing: Region selection`,description:`You can now specify which cloud region you would like to run your Functions in.`,date:`2024-05-13T00:00:00.000Z`,length:`4 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`How to specify region(s)`,id:`how-to-specify-regions`},{depth:2,value:`Region options`,id:`region-options`},{depth:2,value:`Use cases`,id:`use-cases`}],rawContent:`Modal now allows you to select which cloud region you’d like your Functions to run in! As a reminder, Modal is a serverless compute platform that makes it easy for developers to run cloud workloads without managing the underlying infrastructure.

![Modal region map](https://modal-cdn.com/tmpngp1l_r9_a05062c3.jpg)

<modal-img-caption>
    You can specify regions from around the world to run your Modal Functions in.
</modal-img-caption>

## How to specify region(s)

Cloud region selection is available on the [Team plan](/pricing) (for limited CPU use cases) and the [Enterprise plan](/pricing). Please email [support@modal.com](mailto:support@modal.com) to get access to the feature. Once you’ve been granted access, specifying the cloud region for a Function requires just a line of code!

\`\`\`python
import os
import modal

app = modal.App("...")

@app.function(region="us-east") # also supports a list of options, for ex. region=["us-central", "us-east"]
def function():
    print(f"running in {os.environ['MODAL_REGION']}") # us-east-1, us-east-2, us-ashburn-1, etc.
\`\`\`

In the example above, \`function\` will run on instances located in \`"us-east"\`.

## Region options

You can specify your desired region using varying levels of granularity. At the most granular level, you can directly specify the actual underlying region, like \`region=["eu-west-1", "eu-paris-1"]\`. We recommend using broader levels when possible, however, as this increases the pool of possible resources your Function can be assigned to and makes for faster cold starts.

Sampling of possible region strings below. Please see our [docs](/docs/guide/region-selection) for the full list.

\`\`\`
  Broad              ->             Specific
 =====================================================
  "us"          "us-east"           "us-east-1"
                "us-central"        "us-east-2"
                "us-west"           "us-central1"
                                    "us-chicago-1"
                                    "us-west-1"
                                    ...
 -----------------------------------------------------
  "eu"          "eu-west"           "eu-central-1"
                "eu-north"          "eu-west-1"
                                    "eu-north-1"
                                    ...
 -----------------------------------------------------
  "ap"          "ap-northeast"      "asia-northeast3"
                "ap-southeast"      "asia-southeast1"
                "ap-melbourne"      "ap-southeast-3"
                                    "ap-melbourne-1"
                                    ...
\`\`\`

Specifying regions also works when specifying the underlying cloud. For example, if you’re interested in running in AWS specifically, \`cloud="aws", region="us-east"\` would automatically filter for just \`"us-east-1"\` or \`"us-east-2"\` .

## Use cases

There are a few reasons why you might want to specify a region for your Modal Functions:

1. **Regulatory requirements**: your company may be subject to local regulation around where user data can be processed. GDPR, for example, places strict guardrails on when user data can leave the EU. Even if you can prove that you and your sub-processors provide an adequate level of data protection, some of your customers may still insist that their data never leaves a certain region. Specifying \`region="eu"\` will ensure that Functions run within EU datacenters.
2. **Reducing egress fees:** if your Function needs to read data from a dependency like S3, you may be charged egress fees by the provider hosting that service if the data has to move across regions. This could add up to $100+/TB depending on which region your dependency is in!
3. **Reducing latency:** if your applications are latency sensitive (e.g. real-time inference), you might want your app’s endpoints to be running near your users and/or near an external DB. In these cases, you can set your Functions to run in a region that is geographically proximate to your users and your existing control plane.

Have questions on region selection? Please reach out in our [community Slack](https://modal.com/slack).
`,meta:{description:`You can now specify which cloud region you would like to run your Functions in.`}},{title:h,description:g,date:_,length:v,category:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>Modal now allows you to select which cloud region you’d like your Functions to run in! As a reminder, Modal is a serverless compute platform that makes it easy for developers to run cloud workloads without managing the underlying infrastructure.</p> <p><!></p> <modal-img-caption>You can specify regions from around the world to run your Modal Functions in.</modal-img-caption> <h2 id="how-to-specify-regions">How to specify region(s)</h2> <p>Cloud region selection is available on the <!> (for limited CPU use cases) and the <!>. Please email <!> to get access to the feature. Once you’ve been granted access, specifying the cloud region for a Function requires just a line of code!</p> <!> <p>In the example above, <code>function</code> will run on instances located in <code>"us-east"</code>.</p> <h2 id="region-options">Region options</h2> <p>You can specify your desired region using varying levels of granularity. At the most granular level, you can directly specify the actual underlying region, like <code>region=["eu-west-1", "eu-paris-1"]</code>. We recommend using broader levels when possible, however, as this increases the pool of possible resources your Function can be assigned to and makes for faster cold starts.</p> <p>Sampling of possible region strings below. Please see our <!> for the full list.</p> <!> <p>Specifying regions also works when specifying the underlying cloud. For example, if you’re interested in running in AWS specifically, <code>cloud="aws", region="us-east"</code> would automatically filter for just <code>"us-east-1"</code> or <code>"us-east-2"</code> .</p> <h2 id="use-cases">Use cases</h2> <p>There are a few reasons why you might want to specify a region for your Modal Functions:</p> <ol><li><strong>Regulatory requirements</strong>: your company may be subject to local regulation around where user data can be processed. GDPR, for example, places strict guardrails on when user data can leave the EU. Even if you can prove that you and your sub-processors provide an adequate level of data protection, some of your customers may still insist that their data never leaves a certain region. Specifying <code>region="eu"</code> will ensure that Functions run within EU datacenters.</li> <li><strong>Reducing egress fees:</strong> if your Function needs to read data from a dependency like S3, you may be charged egress fees by the provider hosting that service if the data has to move across regions. This could add up to $100+/TB depending on which region your dependency is in!</li> <li><strong>Reducing latency:</strong> if your applications are latency sensitive (e.g. real-time inference), you might want your app’s endpoints to be running near your users and/or near an external DB. In these cases, you can set your Functions to run in a region that is geographically proximate to your users and your existing control plane.</li></ol> <p>Have questions on region selection? Please reach out in our <!>.</p>`,3);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),2);u(e(p),{src:`https://modal-cdn.com/tmpngp1l_r9_a05062c3.jpg`,alt:`Modal region map`}),n(p);var m=c(c(p,2),4),h=c(e(m));f(h,{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`Team plan`))},$$slots:{default:!0}});var g=c(h,2);f(g,{href:`/pricing`,children:(e,t)=>{l(),i(e,r(`Enterprise plan`))},$$slots:{default:!0}}),f(c(g,2),{href:`mailto:support@modal.com`,children:(e,t)=>{l(),i(e,r(`support@modal.com`))},$$slots:{default:!0}}),l(),n(m);var _=c(m,2);d(_,{code:`import%20os%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22...%22)%0A%0A%40app.function(region%3D%22us-east%22)%20%23%20also%20supports%20a%20list%20of%20options%2C%20for%20ex.%20region%3D%5B%22us-central%22%2C%20%22us-east%22%5D%0Adef%20function()%3A%0A%20%20%20%20print(f%22running%20in%20%7Bos.environ%5B'MODAL_REGION'%5D%7D%22)%20%23%20us-east-1%2C%20us-east-2%2C%20us-ashburn-1%2C%20etc.`,lang:`python`});var v=c(_,8);f(c(e(v)),{href:`/docs/guide/region-selection`,children:(e,t)=>{l(),i(e,r(`docs`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);d(y,{code:`%20%20Broad%20%20%20%20%20%20%20%20%20%20%20%20%20%20-%3E%20%20%20%20%20%20%20%20%20%20%20%20%20Specific%0A%20%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%3D%0A%20%20%22us%22%20%20%20%20%20%20%20%20%20%20%22us-east%22%20%20%20%20%20%20%20%20%20%20%20%22us-east-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-central%22%20%20%20%20%20%20%20%20%22us-east-2%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-west%22%20%20%20%20%20%20%20%20%20%20%20%22us-central1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-chicago-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22us-west-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...%0A%20-----------------------------------------------------%0A%20%20%22eu%22%20%20%20%20%20%20%20%20%20%20%22eu-west%22%20%20%20%20%20%20%20%20%20%20%20%22eu-central-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22eu-north%22%20%20%20%20%20%20%20%20%20%20%22eu-west-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22eu-north-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...%0A%20-----------------------------------------------------%0A%20%20%22ap%22%20%20%20%20%20%20%20%20%20%20%22ap-northeast%22%20%20%20%20%20%20%22asia-northeast3%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-southeast%22%20%20%20%20%20%20%22asia-southeast1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-melbourne%22%20%20%20%20%20%20%22ap-southeast-3%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ap-melbourne-1%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20...`,lang:`text`});var b=c(y,10);f(c(e(b)),{href:`https://modal.com/slack`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`community Slack`))},$$slots:{default:!0}}),l(),n(b),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=B-toEebs2.js.map
