(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`71132369-2425-4ffc-ae84-f32ecfa7f2d6`,e._sentryDebugIdIdentifier=`sentry-dbid-71132369-2425-4ffc-ae84-f32ecfa7f2d6`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Budgets`,id:`budgets`,children:[{depth:2,value:`When to use each budget`,id:`when-to-use-each-budget`},{depth:2,value:`How limits apply`,id:`how-limits-apply`},{depth:2,value:`Workspace budgets`,id:`workspace-budgets`},{depth:2,value:`Spend limits`,id:`spend-limits`},{depth:2,value:`Environment budgets`,id:`environment-budgets`}]}],rawContent:`# Budgets

Modal budgets let you cap usage at both the Workspace and Environment level:

- **Workspace budget**: a monthly cap for total Workspace usage across the
  Workspace.
- **Environment budget**: a monthly cap for compute usage in a specific
  Environment.

Only Workspace **Owners** and **Managers** can set, edit, or remove budgets. See [Workspace roles](/docs/guide/workspaces#administering-workspace-membership) for role details.

## When to use each budget

- Use a **Workspace budget** when you want one overall monthly cap for the Workspace.
- Add **Environment budgets** when multiple teams or workloads share a Workspace and need independent usage guardrails.
- Keep both enabled when you want per-Environment isolation without losing a Workspace-wide hard cap.

## How limits apply

Workspace and Environment budgets are enforced together:

- The Workspace budget is the hard outer cap for the entire Workspace.
- If an Environment has no explicit budget, it inherits the Workspace effective limit.
- You cannot set an Environment budget to a value that exceeds the Workspace effective cap.
- Environment budgets do not need to sum to the Workspace budget.

Example: if your Workspace budget is \`$50\`, setting Environment budgets of \`$30\` and \`$40\` does not raise the Workspace cap. The Workspace can still hit \`$50\` first, without hitting either Environment budget.

## Workspace budgets

Workspace budgets (also shown as your **usage limit** in the dashboard) cap
total **usage** for the Workspace during the current billing cycle — before
credits are applied.

You can set, edit, or remove a Workspace budget on the [Usage & Billing](/settings/usage) page.

The maximum budget you can set depends on prior successful charges for the Workspace. If incremental usage charges succeed, that maximum can increase.

## Spend limits

Starting **September 1st, 2026**, Modal also supports a Workspace **spend
limit**: a monthly cap on net charges (what you pay out of pocket after
credits are applied). This is separate from your Workspace budget, which caps
usage.

When the spend limit is reached, Modal stops workloads that would incur
additional out-of-pocket charges. Workloads that can still be covered by
remaining applicable credits may continue until the usage limit is reached.

If you do not set a custom spend limit, Modal uses the cycle's usage limit
minus credits. For example, if your usage limit is \`$100\` and you have \`$30\`
in credits, the default spend limit is \`$70\`.

Workspace Owners and Managers can set, edit, or reset the spend limit
on the [Usage & Billing](/settings/usage) page. Use **Reset to default** to
clear a custom value and return to the cycle's usage limit minus credits.

## Environment budgets

<Callout variant="gated-feature">
  Environment budgets are available on the <a href="/pricing"
    >Team and Enterprise plans</a
  >. Visit <a href="/settings/plans">workspace settings</a> to upgrade.
</Callout>

Environment budgets cap **compute usage** for a single Environment within the same billing cycle. Note that this means it does not include all Workspace-level charges (for example, storage and reservations), so Environment budget usage is not a full invoice total by itself.

You can set, edit, or remove Environment budgets on the [Workspace Management → Environments](/settings/workspace-management/environments) page.
`,meta:{title:`Budgets`,description:`Modal budgets let you cap usage at both the Workspace and Environment level:`}},{toc:g,rawContent:_,meta:v}=h,y=t(`Environment budgets are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">workspace settings</a> to upgrade.`,1),b=t(`<!> <p>Modal budgets let you cap usage at both the Workspace and Environment level:</p> <ul><li><strong>Workspace budget</strong>: a monthly cap for total Workspace usage across the
Workspace.</li> <li><strong>Environment budget</strong>: a monthly cap for compute usage in a specific
Environment.</li></ul> <p>Only Workspace <strong>Owners</strong> and <strong>Managers</strong> can set, edit, or remove budgets. See <!> for role details.</p> <!> <ul><li>Use a <strong>Workspace budget</strong> when you want one overall monthly cap for the Workspace.</li> <li>Add <strong>Environment budgets</strong> when multiple teams or workloads share a Workspace and need independent usage guardrails.</li> <li>Keep both enabled when you want per-Environment isolation without losing a Workspace-wide hard cap.</li></ul> <!> <p>Workspace and Environment budgets are enforced together:</p> <ul><li>The Workspace budget is the hard outer cap for the entire Workspace.</li> <li>If an Environment has no explicit budget, it inherits the Workspace effective limit.</li> <li>You cannot set an Environment budget to a value that exceeds the Workspace effective cap.</li> <li>Environment budgets do not need to sum to the Workspace budget.</li></ul> <p>Example: if your Workspace budget is <code>$50</code>, setting Environment budgets of <code>$30</code> and <code>$40</code> does not raise the Workspace cap. The Workspace can still hit <code>$50</code> first, without hitting either Environment budget.</p> <!> <p>Workspace budgets (also shown as your <strong>usage limit</strong> in the dashboard) cap
total <strong>usage</strong> for the Workspace during the current billing cycle — before
credits are applied.</p> <p>You can set, edit, or remove a Workspace budget on the <!> page.</p> <p>The maximum budget you can set depends on prior successful charges for the Workspace. If incremental usage charges succeed, that maximum can increase.</p> <!> <p>Starting <strong>September 1st, 2026</strong>, Modal also supports a Workspace <strong>spend
limit</strong>: a monthly cap on net charges (what you pay out of pocket after
credits are applied). This is separate from your Workspace budget, which caps
usage.</p> <p>When the spend limit is reached, Modal stops workloads that would incur
additional out-of-pocket charges. Workloads that can still be covered by
remaining applicable credits may continue until the usage limit is reached.</p> <p>If you do not set a custom spend limit, Modal uses the cycle’s usage limit
minus credits. For example, if your usage limit is <code>$100</code> and you have <code>$30</code> in credits, the default spend limit is <code>$70</code>.</p> <p>Workspace Owners and Managers can set, edit, or reset the spend limit
on the <!> page. Use <strong>Reset to default</strong> to
clear a custom value and return to the cycle’s usage limit minus credits.</p> <!> <!> <p>Environment budgets cap <strong>compute usage</strong> for a single Environment within the same billing cycle. Note that this means it does not include all Workspace-level charges (for example, storage and reservations), so Environment budget usage is not a full invoice total by itself.</p> <p>You can set, edit, or remove Environment budgets on the <!> page.</p>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);f(p,{id:`budgets`,children:(e,t)=>{l(),i(e,r(`Budgets`))},$$slots:{default:!0}});var h=c(p,6);m(c(e(h),5),{href:`/docs/guide/workspaces#administering-workspace-membership`,children:(e,t)=>{l(),i(e,r(`Workspace roles`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);d(g,{id:`when-to-use-each-budget`,children:(e,t)=>{l(),i(e,r(`When to use each budget`))},$$slots:{default:!0}});var _=c(g,4);d(_,{id:`how-limits-apply`,children:(e,t)=>{l(),i(e,r(`How limits apply`))},$$slots:{default:!0}});var v=c(_,8);d(v,{id:`workspace-budgets`,children:(e,t)=>{l(),i(e,r(`Workspace budgets`))},$$slots:{default:!0}});var x=c(v,4);m(c(e(x)),{href:`/settings/usage`,children:(e,t)=>{l(),i(e,r(`Usage & Billing`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,4);d(S,{id:`spend-limits`,children:(e,t)=>{l(),i(e,r(`Spend limits`))},$$slots:{default:!0}});var C=c(S,8);m(c(e(C)),{href:`/settings/usage`,children:(e,t)=>{l(),i(e,r(`Usage & Billing`))},$$slots:{default:!0}}),l(3),n(C);var w=c(C,2);d(w,{id:`environment-budgets`,children:(e,t)=>{l(),i(e,r(`Environment budgets`))},$$slots:{default:!0}});var T=c(w,2);u(T,{variant:`gated-feature`,children:(e,t)=>{l();var n=y();l(4),i(e,n)},$$slots:{default:!0}});var E=c(T,4);m(c(e(E)),{href:`/settings/workspace-management/environments`,children:(e,t)=>{l(),i(e,r(`Workspace Management → Environments`))},$$slots:{default:!0}}),l(),n(E),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=V0LD5z6a2.js.map
