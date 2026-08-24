(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`86f70ae6-3cdb-4409-87cc-6bbdc7e406e8`,e._sentryDebugIdIdentifier=`sentry-dbid-86f70ae6-3cdb-4409-87cc-6bbdc7e406e8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={description:`Run CI tests on Modal with GPU access. Execute pytest in the cloud as part of your GitHub Actions workflow.`,toc:[{depth:1,value:`Run Continuous Integration (CI) Tests on Modal`,id:`run-continuous-integration-ci-tests-on-modal`,children:[{depth:2,value:`Setup`,id:`setup`},{depth:2,value:`Usage`,id:`usage`,children:[{depth:3,value:`Run tests remotely on Modal`,id:`run-tests-remotely-on-modal`},{depth:3,value:`Run tests on Modal from GitHub Actions`,id:`run-tests-on-modal-from-github-actions`},{depth:3,value:`Debug tests running remotely`,id:`debug-tests-running-remotely`}]}]}],rawContent:`# Run Continuous Integration (CI) Tests on Modal

[This example repo](https://github.com/modal-labs/ci-on-modal) is a
demonstration of one pattern for running tests on Modal: bring your existing
package and test suite (here \`my_pkg\` and \`tests\`) and add a Modal App
(\`my_pkg.ci\`) with a Function (\`pytest\`) that runs \`pytest\`.

That's as straightforward as

\`\`\`python
# my_pkg/ci.py

@app.function(gpu="any")
def pytest():
    import subprocess

    subprocess.run(["pytest", "-vs"], check=True, cwd="/root")
\`\`\`

## Setup

- Create a Python virtual environment
- \`pip install modal\`
- That's it 😎

## Usage

All commands below are run from the root of the repository.

### Run tests remotely on Modal

\`\`\`bash
modal run -m my_pkg.ci
\`\`\`

On the first execution, the [container image](https://modal.com/docs/guide/images)
for your application will be built.

This image will be cached on Modal and only rebuilt if one of its dependencies,
like the \`requirements.txt\` file, changes.

### Run tests on Modal from GitHub Actions

The same command can be executed from inside a CI runner on another platform.
We provide a sample GitHub Actions workflow in \`.github/workflows/ci.yml\`.

To run these tests on GitHub Actions, fork this repo and
[create a new GitHub Actions secret](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
that contains your \`MODAL_TOKEN_ID\` and \`MODAL_TOKEN_SECRET\`.
You can find this info in the \`.modal.toml\` file in your home directory.

Now you can [manually trigger the tests to run on GitHub Actions](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow)
or trigger them by making a change on our fork and pushing to \`main\` or making a pull request.

### Debug tests running remotely

To debug the tests, you can open a shell
in the exact same environment that the tests are run in:

\`\`\`bash
modal shell -m my_pkg.ci
\`\`\`

We used the \`shell\` feature heavily while developing this pattern!

_Note_: On the Modal worker, the \`pytest\` command is run from the home directory, \`/root\`,
which contains the \`tests\` folder, but the \`modal shell\` command will
drop you at the top of the filesystem, \`/\`.
`,meta:{title:`Run Continuous Integration (CI) Tests on Modal`,description:`Run CI tests on Modal with GPU access. Execute pytest in the cloud as part of your GitHub Actions workflow.`}},{description:_,toc:v,rawContent:y,meta:b}=g,x=t(`<!> <p><!> is a
demonstration of one pattern for running tests on Modal: bring your existing
package and test suite (here <code>my_pkg</code> and <code>tests</code>) and add a Modal App
(<code>my_pkg.ci</code>) with a Function (<code>pytest</code>) that runs <code>pytest</code>.</p> <p>That’s as straightforward as</p> <!> <!> <ul><li>Create a Python virtual environment</li> <li><code>pip install modal</code></li> <li>That’s it 😎</li></ul> <!> <p>All commands below are run from the root of the repository.</p> <!> <!> <p>On the first execution, the <!> for your application will be built.</p> <p>This image will be cached on Modal and only rebuilt if one of its dependencies,
like the <code>requirements.txt</code> file, changes.</p> <!> <p>The same command can be executed from inside a CI runner on another platform.
We provide a sample GitHub Actions workflow in <code>.github/workflows/ci.yml</code>.</p> <p>To run these tests on GitHub Actions, fork this repo and <!> that contains your <code>MODAL_TOKEN_ID</code> and <code>MODAL_TOKEN_SECRET</code>.
You can find this info in the <code>.modal.toml</code> file in your home directory.</p> <p>Now you can <!> or trigger them by making a change on our fork and pushing to <code>main</code> or making a pull request.</p> <!> <p>To debug the tests, you can open a shell
in the exact same environment that the tests are run in:</p> <!> <p>We used the <code>shell</code> feature heavily while developing this pattern!</p> <p><em>Note</em>: On the Modal worker, the <code>pytest</code> command is run from the home directory, <code>/root</code>,
which contains the <code>tests</code> folder, but the <code>modal shell</code> command will
drop you at the top of the filesystem, <code>/</code>.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`run-continuous-integration-ci-tests-on-modal`,children:(e,t)=>{l(),i(e,r(`Run Continuous Integration (CI) Tests on Modal`))},$$slots:{default:!0}});var g=c(m,2);h(e(g),{href:`https://github.com/modal-labs/ci-on-modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`This example repo`))},$$slots:{default:!0}}),l(11),n(g);var _=c(g,4);p(_,{code:`%23%20my_pkg%2Fci.py%0A%0A%40app.function(gpu%3D%22any%22)%0Adef%20pytest()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20subprocess.run(%5B%22pytest%22%2C%20%22-vs%22%5D%2C%20check%3DTrue%2C%20cwd%3D%22%2Froot%22)`,lang:`python`});var v=c(_,2);u(v,{id:`setup`,children:(e,t)=>{l(),i(e,r(`Setup`))},$$slots:{default:!0}});var y=c(v,4);u(y,{id:`usage`,children:(e,t)=>{l(),i(e,r(`Usage`))},$$slots:{default:!0}});var b=c(y,4);d(b,{id:`run-tests-remotely-on-modal`,children:(e,t)=>{l(),i(e,r(`Run tests remotely on Modal`))},$$slots:{default:!0}});var S=c(b,2);p(S,{code:`modal%20run%20-m%20my_pkg.ci`,lang:`bash`});var C=c(S,2);h(c(e(C)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`container image`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,4);d(w,{id:`run-tests-on-modal-from-github-actions`,children:(e,t)=>{l(),i(e,r(`Run tests on Modal from GitHub Actions`))},$$slots:{default:!0}});var T=c(w,4);h(c(e(T)),{href:`https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`create a new GitHub Actions secret`))},$$slots:{default:!0}}),l(7),n(T);var E=c(T,2);h(c(e(E)),{href:`https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`manually trigger the tests to run on GitHub Actions`))},$$slots:{default:!0}}),l(3),n(E);var D=c(E,2);d(D,{id:`debug-tests-running-remotely`,children:(e,t)=>{l(),i(e,r(`Debug tests running remotely`))},$$slots:{default:!0}}),p(c(D,4),{code:`modal%20shell%20-m%20my_pkg.ci`,lang:`bash`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=CmsmbZ7n.js.map
