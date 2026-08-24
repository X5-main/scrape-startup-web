(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c230dcb4-81ab-40ba-a132-93a1a93f3938`,e._sentryDebugIdIdentifier=`sentry-dbid-c230dcb4-81ab-40ba-a132-93a1a93f3938`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,o as l}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./B6UiYoTw.js";var p={toc:[{depth:1,value:`FilePatternMatcher`,id:`filepatternmatcher`,children:[{depth:2,value:`can_prune_directories`,id:`can_prune_directories`},{depth:2,value:`from_file`,id:`from_file`}]}],rawContent:`# FilePatternMatcher


\`\`\`python
class FilePatternMatcher(modal.file_pattern_matcher._AbstractPatternMatcher)
\`\`\`

Allows matching file Path objects against a list of patterns.

**Usage**

\`\`\`python
from pathlib import Path
from modal import FilePatternMatcher

matcher = FilePatternMatcher("*.py")

assert matcher(Path("foo.py"))

# You can also negate the matcher.
negated_matcher = ~matcher

assert not negated_matcher(Path("foo.py"))
\`\`\`

\`\`\`python
__init__(self, *pattern)
\`\`\`
Initialize a new FilePatternMatcher instance.

**Parameters**

<Parameter name="*pattern" type="str" description="One or more pattern strings." />

**Raises**

- \`ValueError\`: If an illegal exclusion pattern is provided.

## can_prune_directories

\`\`\`python
can_prune_directories(self)
\`\`\`
Returns True if this pattern matcher allows safe early directory pruning.

Directory pruning is safe when matching directories can be skipped entirely
without missing any files that should be included. This is for example not
safe when we have inverted/negated ignore patterns (e.g. "!**/*.py").

## from_file

\`\`\`python
from_file(cls, file_path)
\`\`\`
Initialize a new FilePatternMatcher instance from a file.

The patterns in the file will be read lazily when the matcher is first used.

**Parameters**

<Parameter name="file_path" type="Path" description="The path to the file containing patterns." />

**Usage**

\`\`\`python
from modal import FilePatternMatcher

matcher = FilePatternMatcher.from_file("/path/to/ignorefile")
\`\`\`
`,meta:{title:`FilePatternMatcher`,description:`Allows matching file Path objects against a list of patterns.`}},{toc:m,rawContent:h,meta:g}=p,_=e(`<!> <!> <p>Allows matching file Path objects against a list of patterns.</p> <p><strong>Usage</strong></p> <!> <!> <p>Initialize a new FilePatternMatcher instance.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Raises</strong></p> <ul><li><code>ValueError</code>: If an illegal exclusion pattern is provided.</li></ul> <!> <!> <p>Returns True if this pattern matcher allows safe early directory pruning.</p> <p>Directory pruning is safe when matching directories can be skipped entirely
without missing any files that should be included. This is for example not
safe when we have inverted/negated ignore patterns (e.g. ”!*<em>/</em>.py”).</p> <!> <!> <p>Initialize a new FilePatternMatcher instance from a file.</p> <p>The patterns in the file will be read lazily when the matcher is first used.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Usage</strong></p> <!>`,1);function v(e,m){let h=r(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(e,i(()=>h,()=>p,{children:(e,r)=>{var i=_(),d=a(i);l(d,{id:`filepatternmatcher`,children:(e,r)=>{s(),n(e,t(`FilePatternMatcher`))},$$slots:{default:!0}});var p=o(d,2);u(p,{code:`class%20FilePatternMatcher(modal.file_pattern_matcher._AbstractPatternMatcher)`,lang:`python`});var m=o(p,6);u(m,{code:`from%20pathlib%20import%20Path%0Afrom%20modal%20import%20FilePatternMatcher%0A%0Amatcher%20%3D%20FilePatternMatcher(%22*.py%22)%0A%0Aassert%20matcher(Path(%22foo.py%22))%0A%0A%23%20You%20can%20also%20negate%20the%20matcher.%0Anegated_matcher%20%3D%20~matcher%0A%0Aassert%20not%20negated_matcher(Path(%22foo.py%22))`,lang:`python`});var h=o(m,2);u(h,{code:`__init__(self%2C%20*pattern)`,lang:`python`});var g=o(h,6);f(g,{name:`*pattern`,type:`str`,description:`One or more pattern strings.`});var v=o(g,6);c(v,{id:`can_prune_directories`,children:(e,r)=>{s(),n(e,t(`can_prune_directories`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`can_prune_directories(self)`,lang:`python`});var b=o(y,6);c(b,{id:`from_file`,children:(e,r)=>{s(),n(e,t(`from_file`))},$$slots:{default:!0}});var x=o(b,2);u(x,{code:`from_file(cls%2C%20file_path)`,lang:`python`});var S=o(x,8);f(S,{name:`file_path`,type:`Path`,description:`The path to the file containing patterns.`}),u(o(S,4),{code:`from%20modal%20import%20FilePatternMatcher%0A%0Amatcher%20%3D%20FilePatternMatcher.from_file(%22%2Fpath%2Fto%2Fignorefile%22)`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{v as default,p as metadata};
//# sourceMappingURL=DEvY4i8o.js.map
