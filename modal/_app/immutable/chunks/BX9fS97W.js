(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ec635930-0e9a-486f-8ee8-10ae9ad861a6`,e._sentryDebugIdIdentifier=`sentry-dbid-ec635930-0e9a-486f-8ee8-10ae9ad861a6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Useful snippets`,id:`useful-snippets`,children:[{depth:2,value:`Github Actions`,id:`github-actions`}]}],rawContent:`# Useful snippets

## Github Actions

It's a common pattern to auto-deploy your Modal as part of your CI/CD pipeline.
To get you started, here's a sample Github Actions workflow that deploys your
app on every push to the \`main\` branch.

This requires you to create a [Modal token](/settings/tokens) and add it as a
[secret for your Github Actions workflow](https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md).
Finally, you can create a new workflow file in your repository at
\`.github/workflows/ci-cd.yml\` with the following contents (be sure to replace
\`my_package.my_file\` with your actual entrypoint).

\`\`\`
name: CI/CD

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    env:
      MODAL_TOKEN_ID: \${{ secrets.MODAL_TOKEN_ID }}
      MODAL_TOKEN_SECRET: \${{ secrets.MODAL_TOKEN_SECRET }}

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v6

      - name: Install Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Install Modal
        run: |
          python -m pip install --upgrade pip
          pip install modal


      - name: Deploy job
        run: |
          modal deploy -m my_package.my_file
\`\`\`
`,meta:{title:`Useful snippets`,description:`It’s a common pattern to auto-deploy your Modal as part of your CI/CD pipeline. To get you started, here’s a sample Github Actions workflow that deploys your app on every push to the main branch.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <!> <p>It’s a common pattern to auto-deploy your Modal as part of your CI/CD pipeline.
To get you started, here’s a sample Github Actions workflow that deploys your
app on every push to the <code>main</code> branch.</p> <p>This requires you to create a <!> and add it as a <!>.
Finally, you can create a new workflow file in your repository at <code>.github/workflows/ci-cd.yml</code> with the following contents (be sure to replace <code>my_package.my_file</code> with your actual entrypoint).</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`useful-snippets`,children:(e,t)=>{l(),i(e,r(`Useful snippets`))},$$slots:{default:!0}});var h=c(p,2);u(h,{id:`github-actions`,children:(e,t)=>{l(),i(e,r(`Github Actions`))},$$slots:{default:!0}});var g=c(h,4),_=c(e(g));m(_,{href:`/settings/tokens`,children:(e,t)=>{l(),i(e,r(`Modal token`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://github.com/Azure/actions-workflow-samples/blob/master/assets/create-secrets-for-GitHub-workflows.md`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`secret for your Github Actions workflow`))},$$slots:{default:!0}}),l(5),n(g),f(c(g,2),{code:`name%3A%20CI%2FCD%0A%0Aon%3A%0A%20%20push%3A%0A%20%20%20%20branches%3A%0A%20%20%20%20%20%20-%20main%0A%0Ajobs%3A%0A%20%20deploy%3A%0A%20%20%20%20name%3A%20Deploy%0A%20%20%20%20runs-on%3A%20ubuntu-latest%0A%20%20%20%20env%3A%0A%20%20%20%20%20%20MODAL_TOKEN_ID%3A%20%24%7B%7B%20secrets.MODAL_TOKEN_ID%20%7D%7D%0A%20%20%20%20%20%20MODAL_TOKEN_SECRET%3A%20%24%7B%7B%20secrets.MODAL_TOKEN_SECRET%20%7D%7D%0A%0A%20%20%20%20steps%3A%0A%20%20%20%20%20%20-%20name%3A%20Checkout%20Repository%0A%20%20%20%20%20%20%20%20uses%3A%20actions%2Fcheckout%40v6%0A%0A%20%20%20%20%20%20-%20name%3A%20Install%20Python%0A%20%20%20%20%20%20%20%20uses%3A%20actions%2Fsetup-python%40v5%0A%20%20%20%20%20%20%20%20with%3A%0A%20%20%20%20%20%20%20%20%20%20python-version%3A%20'3.10'%0A%0A%20%20%20%20%20%20-%20name%3A%20Install%20Modal%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20python%20-m%20pip%20install%20--upgrade%20pip%0A%20%20%20%20%20%20%20%20%20%20pip%20install%20modal%0A%0A%0A%20%20%20%20%20%20-%20name%3A%20Deploy%20job%0A%20%20%20%20%20%20%20%20run%3A%20%7C%0A%20%20%20%20%20%20%20%20%20%20modal%20deploy%20-m%20my_package.my_file`,lang:`text`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BX9fS97W.js.map
