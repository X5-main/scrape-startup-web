(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`a14dbccc-4566-45a6-8595-1f327fa70d2a`,e._sentryDebugIdIdentifier=`sentry-dbid-a14dbccc-4566-45a6-8595-1f327fa70d2a`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`modal config`,id:`modal-config`,children:[{depth:2,value:`modal config set-environment`,id:`modal-config-set-environment`},{depth:2,value:`modal config show`,id:`modal-config-show`}]}],rawContent:`# \`modal config\`

Manage client configuration for the current profile.

Refer to https://modal.com/docs/sdk/py/latest/config for a full explanation
of what these options mean, and how to set them.

**Usage**:

\`\`\`shell
modal config [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`set-environment\`: Set the default Modal environment for the active profile
* \`show\`: Show current configuration values (debugging command).

## \`modal config set-environment\`

Set the default Modal environment for the active profile

The default environment of a profile is used when no --env flag is passed to \`modal run\`, \`modal deploy\` etc.

If no default environment is set, and there exists multiple environments in a workspace, an error will be raised
when running a command that requires an environment.

**Usage**:

\`\`\`shell
modal config set-environment [OPTIONS] ENVIRONMENT_NAME
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

## \`modal config show\`

Show current configuration values (debugging command).

**Usage**:

\`\`\`shell
modal config show [OPTIONS]
\`\`\`

**Options**:

* \`--redact / --no-redact\`: Redact the \`token_secret\` value.
* \`--help\`: Show this message and exit.
`,meta:{title:`modal config`,description:`Manage client configuration for the current profile.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>modal config</code>`),b=t(`<code>modal config set-environment</code>`),x=t(`<code>modal config show</code>`),S=t(`<!> <p>Manage client configuration for the current profile.</p> <p>Refer to <!> for a full explanation
of what these options mean, and how to set them.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>set-environment</code>: Set the default Modal environment for the active profile</li> <li><code>show</code>: Show current configuration values (debugging command).</li></ul> <!> <p>Set the default Modal environment for the active profile</p> <p>The default environment of a profile is used when no —env flag is passed to <code>modal run</code>, <code>modal deploy</code> etc.</p> <p>If no default environment is set, and there exists multiple environments in a workspace, an error will be raised
when running a command that requires an environment.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Show current configuration values (debugging command).</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--redact / --no-redact</code>: Redact the <code>token_secret</code> value.</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`modal-config`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}});var h=c(p,4);m(c(e(h)),{href:`https://modal.com/docs/sdk/py/latest/config`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://modal.com/docs/sdk/py/latest/config`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);f(g,{code:`modal%20config%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var _=c(g,10);u(_,{id:`modal-config-set-environment`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var v=c(_,10);f(v,{code:`modal%20config%20set-environment%20%5BOPTIONS%5D%20ENVIRONMENT_NAME`,lang:`shell`});var C=c(v,6);u(C,{id:`modal-config-show`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),f(c(C,6),{code:`modal%20config%20show%20%5BOPTIONS%5D`,lang:`shell`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=CC48FcOo2.js.map
