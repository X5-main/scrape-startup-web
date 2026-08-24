(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`55484ab0-5336-48f6-8002-2a3bb6a8d251`,e._sentryDebugIdIdentifier=`sentry-dbid-55484ab0-5336-48f6-8002-2a3bb6a8d251`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";import{t as g}from"./B6UiYoTw.js";var _={toc:[{depth:1,value:`config`,id:`config`,children:[{depth:2,value:`.modal.toml`,id:`modaltoml`},{depth:2,value:`Setting tokens using the CLI`,id:`setting-tokens-using-the-cli`},{depth:2,value:`Other configuration options`,id:`other-configuration-options`},{depth:2,value:`Meta-configuration`,id:`meta-configuration`},{depth:2,value:`Config`,id:`config-1`,children:[{depth:3,value:`get`,id:`get`},{depth:3,value:`override_locally`,id:`override_locally`},{depth:3,value:`to_dict`,id:`to_dict`}]},{depth:2,value:`config_profiles`,id:`config_profiles`},{depth:2,value:`config_set_active_profile`,id:`config_set_active_profile`}]}],rawContent:`# config

Modal intentionally keeps configurability to a minimum.

The main configuration options are the API tokens: the token id and the token secret.
These can be configured in two ways:

1. By running the \`modal token set\` command.
   This writes the tokens to \`.modal.toml\` file in your home directory.
2. By setting the environment variables \`MODAL_TOKEN_ID\` and \`MODAL_TOKEN_SECRET\`.
   This takes precedence over the previous method.

.modal.toml
---------------

The \`.modal.toml\` file is generally stored in your home directory.
It should look like this::

\`\`\`toml
[default]
token_id = "ak-12345..."
token_secret = "as-12345..."
\`\`\`

You can create this file manually, or you can run the \`modal token set ...\`
command (see below).

Setting tokens using the CLI
----------------------------

You can set a token by running the command::

\`\`\`
modal token set \\
  --token-id <token id> \\
  --token-secret <token secret>
\`\`\`

This will write the token id and secret to \`.modal.toml\`.

If the token id or secret is provided as the string \`-\` (a single dash),
then it will be read in a secret way from stdin instead.

Other configuration options
---------------------------

Other possible configuration options are:

* \`loglevel\` (in the .toml file) / \`MODAL_LOGLEVEL\` (as an env var).
  Defaults to \`WARNING\`. Set this to \`DEBUG\` to see internal messages.
* \`logs_timeout\` (in the .toml file) / \`MODAL_LOGS_TIMEOUT\` (as an env var).
  Defaults to 10.
  Number of seconds to wait for logs to drain when closing the session,
  before giving up.
* \`max_throttle_wait\` (in the .toml file) / \`MODAL_MAX_THROTTLE_WAIT\` (as an env var).
  Defaults to None (no limit).
  Maximum number of seconds to wait when requests are being throttled (i.e., due
  to rate limiting or other cases that can normally be resolved through backoff).
* \`force_build\` (in the .toml file) / \`MODAL_FORCE_BUILD\` (as an env var).
  Defaults to False.
  When set, ignores the Image cache and builds all Image layers. Note that this
  will break the cache for all images based on the rebuilt layers, so other images
  may rebuild on subsequent runs / deploys even if the config is reverted.
* \`ignore_cache\` (in the .toml file) / \`MODAL_IGNORE_CACHE\` (as an env var).
  Defaults to False.
  When set, ignores the Image cache and builds all Image layers. Unlike \`force_build\`,
  this will not overwrite the cache for other images that have the same recipe.
  Subsequent runs that do not use this option will pull the *previous* Image from
  the cache, if one exists. It can be useful for testing an App's robustness to
  Image rebuilds without clobbering Images used by other Apps.
* \`traceback\` (in the .toml file) / \`MODAL_TRACEBACK\` (as an env var).
  Defaults to False. Enables printing full tracebacks on unexpected CLI
  errors, which can be useful for debugging client issues.
* \`log_pattern\` (in the .toml file) / \`MODAL_LOG_PATTERN\` (as an env var).
  Defaults to \`"[modal-client] %(asctime)s %(message)s"\`
  The log formatting pattern that will be used by the modal client itself.
  See https://docs.python.org/3/library/logging.html#logrecord-attributes for available
  log attributes.
* \`dev_suffix\` (in the .toml file) / \`MODAL_DEV_SUFFIX\` (as an env var).
  Overrides the default \`-dev\` suffix added to URLs generated for Web Functions
  when the App is ephemeral (i.e., created via \`modal serve\`). Must be a short
  alphanumeric string.

Meta-configuration
------------------

Some "meta-options" are set using environment variables only:

* \`MODAL_CONFIG_PATH\` lets you override the location of the .toml file,
  by default \`~/.modal.toml\`.
* \`MODAL_PROFILE\` lets you use multiple sections in the .toml file
  and switch between them. It defaults to "default".

## Config


\`\`\`python
class Config(object)
\`\`\`

Singleton that holds configuration used by Modal internally.

\`\`\`python
__init__(self)
\`\`\`


### get

\`\`\`python
get(self, key, *, profile=None, use_env=True)
\`\`\`
Look up a configuration value.

Resolution order (highest priority first):

1. Environment variable \`\`MODAL_<KEY>\`\` (underscore-separated, uppercased), when \`\`use_env\`\` is True.
2. The named profile in \`\`.modal.toml\`\`.
3. The built-in default for that setting.

**Parameters**

<Parameter name="key" type="str" description="Setting name (for example \`\`&quot;loglevel&quot;\`\` or \`\`&quot;server_url&quot;\`\`); see the \`\`modal.config\`\` module docs." />
<Parameter name="profile" type="str | None" defaultValue="None" description="Profile section to read from the TOML file; defaults to the active profile." />
<Parameter name="use_env" type="bool" defaultValue="True" description="When False, skip environment variables and read only from the file or defaults." />

**Returns**

The transformed configuration value (type depends on the setting).

### override_locally

\`\`\`python
override_locally(self, key, value)
\`\`\`


### to_dict

\`\`\`python
to_dict(self)
\`\`\`

## config_profiles

\`\`\`python
config_profiles()
\`\`\`
List the available Modal profiles in the \`\`.modal.toml\`\` file.

**Returns**

Profile section names present in the configuration file.
## config_set_active_profile

\`\`\`python
config_set_active_profile(profile)
\`\`\`
Set the user's active Modal profile by writing it to the \`\`.modal.toml\`\` file.

**Parameters**

<Parameter name="profile" type="str" description="Name of an existing profile section to mark as active." />
`,meta:{title:`config`,description:`Modal intentionally keeps configurability to a minimum.`}},{toc:v,rawContent:y,meta:b}=_,x=t(`<!> <p>Modal intentionally keeps configurability to a minimum.</p> <p>The main configuration options are the API tokens: the token id and the token secret.
These can be configured in two ways:</p> <ol><li>By running the <code>modal token set</code> command.
This writes the tokens to <code>.modal.toml</code> file in your home directory.</li> <li>By setting the environment variables <code>MODAL_TOKEN_ID</code> and <code>MODAL_TOKEN_SECRET</code>.
This takes precedence over the previous method.</li></ol> <!> <p>The <code>.modal.toml</code> file is generally stored in your home directory.
It should look like this::</p> <!> <p>You can create this file manually, or you can run the <code>modal token set ...</code> command (see below).</p> <!> <p>You can set a token by running the command::</p> <!> <p>This will write the token id and secret to <code>.modal.toml</code>.</p> <p>If the token id or secret is provided as the string <code>-</code> (a single dash),
then it will be read in a secret way from stdin instead.</p> <!> <p>Other possible configuration options are:</p> <ul><li><code>loglevel</code> (in the .toml file) / <code>MODAL_LOGLEVEL</code> (as an env var).
Defaults to <code>WARNING</code>. Set this to <code>DEBUG</code> to see internal messages.</li> <li><code>logs_timeout</code> (in the .toml file) / <code>MODAL_LOGS_TIMEOUT</code> (as an env var).
Defaults to 10.
Number of seconds to wait for logs to drain when closing the session,
before giving up.</li> <li><code>max_throttle_wait</code> (in the .toml file) / <code>MODAL_MAX_THROTTLE_WAIT</code> (as an env var).
Defaults to None (no limit).
Maximum number of seconds to wait when requests are being throttled (i.e., due
to rate limiting or other cases that can normally be resolved through backoff).</li> <li><code>force_build</code> (in the .toml file) / <code>MODAL_FORCE_BUILD</code> (as an env var).
Defaults to False.
When set, ignores the Image cache and builds all Image layers. Note that this
will break the cache for all images based on the rebuilt layers, so other images
may rebuild on subsequent runs / deploys even if the config is reverted.</li> <li><code>ignore_cache</code> (in the .toml file) / <code>MODAL_IGNORE_CACHE</code> (as an env var).
Defaults to False.
When set, ignores the Image cache and builds all Image layers. Unlike <code>force_build</code>,
this will not overwrite the cache for other images that have the same recipe.
Subsequent runs that do not use this option will pull the <em>previous</em> Image from
the cache, if one exists. It can be useful for testing an App’s robustness to
Image rebuilds without clobbering Images used by other Apps.</li> <li><code>traceback</code> (in the .toml file) / <code>MODAL_TRACEBACK</code> (as an env var).
Defaults to False. Enables printing full tracebacks on unexpected CLI
errors, which can be useful for debugging client issues.</li> <li><code>log_pattern</code> (in the .toml file) / <code>MODAL_LOG_PATTERN</code> (as an env var).
Defaults to <code>"[modal-client] %(asctime)s %(message)s"</code> The log formatting pattern that will be used by the modal client itself.
See <!> for available
log attributes.</li> <li><code>dev_suffix</code> (in the .toml file) / <code>MODAL_DEV_SUFFIX</code> (as an env var).
Overrides the default <code>-dev</code> suffix added to URLs generated for Web Functions
when the App is ephemeral (i.e., created via <code>modal serve</code>). Must be a short
alphanumeric string.</li></ul> <!> <p>Some “meta-options” are set using environment variables only:</p> <ul><li><code>MODAL_CONFIG_PATH</code> lets you override the location of the .toml file,
by default <code>~/.modal.toml</code>.</li> <li><code>MODAL_PROFILE</code> lets you use multiple sections in the .toml file
and switch between them. It defaults to “default”.</li></ul> <!> <!> <p>Singleton that holds configuration used by Modal internally.</p> <!> <!> <!> <p>Look up a configuration value.</p> <p>Resolution order (highest priority first):</p> <ol><li>Environment variable <code>MODAL_&lt;KEY&gt;</code> (underscore-separated, uppercased), when <code>use_env</code> is True.</li> <li>The named profile in <code>.modal.toml</code>.</li> <li>The built-in default for that setting.</li></ol> <p><strong>Parameters</strong></p> <!> <!> <!> <p><strong>Returns</strong></p> <p>The transformed configuration value (type depends on the setting).</p> <!> <!> <!> <!> <!> <!> <p>List the available Modal profiles in the <code>.modal.toml</code> file.</p> <p><strong>Returns</strong></p> <p>Profile section names present in the configuration file.</p> <!> <!> <p>Set the user’s active Modal profile by writing it to the <code>.modal.toml</code> file.</p> <p><strong>Parameters</strong></p> <!>`,1);function S(t,v){let y=a(v,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>y,()=>_,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`config`,children:(e,t)=>{l(),i(e,r(`config`))},$$slots:{default:!0}});var _=c(m,8);u(_,{id:`modaltoml`,children:(e,t)=>{l(),i(e,r(`.modal.toml`))},$$slots:{default:!0}});var v=c(_,4);p(v,{code:`%5Bdefault%5D%0Atoken_id%20%3D%20%22ak-12345...%22%0Atoken_secret%20%3D%20%22as-12345...%22`,lang:`toml`});var y=c(v,4);u(y,{id:`setting-tokens-using-the-cli`,children:(e,t)=>{l(),i(e,r(`Setting tokens using the CLI`))},$$slots:{default:!0}});var b=c(y,4);p(b,{code:`modal%20token%20set%20%5C%0A%20%20--token-id%20%3Ctoken%20id%3E%20%5C%0A%20%20--token-secret%20%3Ctoken%20secret%3E`,lang:`text`});var S=c(b,6);u(S,{id:`other-configuration-options`,children:(e,t)=>{l(),i(e,r(`Other configuration options`))},$$slots:{default:!0}});var C=c(S,4),w=c(e(C),12);h(c(e(w),6),{href:`https://docs.python.org/3/library/logging.html#logrecord-attributes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://docs.python.org/3/library/logging.html#logrecord-attributes`))},$$slots:{default:!0}}),l(),n(w),l(2),n(C);var T=c(C,2);u(T,{id:`meta-configuration`,children:(e,t)=>{l(),i(e,r(`Meta-configuration`))},$$slots:{default:!0}});var E=c(T,6);u(E,{id:`config-1`,children:(e,t)=>{l(),i(e,r(`Config`))},$$slots:{default:!0}});var D=c(E,2);p(D,{code:`class%20Config(object)`,lang:`python`});var O=c(D,4);p(O,{code:`__init__(self)`,lang:`python`});var k=c(O,2);d(k,{id:`get`,children:(e,t)=>{l(),i(e,r(`get`))},$$slots:{default:!0}});var A=c(k,2);p(A,{code:`get(self%2C%20key%2C%20*%2C%20profile%3DNone%2C%20use_env%3DTrue)`,lang:`python`});var j=c(A,10);g(j,{name:`key`,type:`str`,description:'Setting name (for example ``"loglevel"`` or ``"server_url"``); see the ``modal.config`` module docs.'});var M=c(j,2);g(M,{name:`profile`,type:`str | None`,defaultValue:`None`,description:`Profile section to read from the TOML file; defaults to the active profile.`});var N=c(M,2);g(N,{name:`use_env`,type:`bool`,defaultValue:`True`,description:`When False, skip environment variables and read only from the file or defaults.`});var P=c(N,6);d(P,{id:`override_locally`,children:(e,t)=>{l(),i(e,r(`override_locally`))},$$slots:{default:!0}});var F=c(P,2);p(F,{code:`override_locally(self%2C%20key%2C%20value)`,lang:`python`});var I=c(F,2);d(I,{id:`to_dict`,children:(e,t)=>{l(),i(e,r(`to_dict`))},$$slots:{default:!0}});var L=c(I,2);p(L,{code:`to_dict(self)`,lang:`python`});var R=c(L,2);u(R,{id:`config_profiles`,children:(e,t)=>{l(),i(e,r(`config_profiles`))},$$slots:{default:!0}});var z=c(R,2);p(z,{code:`config_profiles()`,lang:`python`});var B=c(z,8);u(B,{id:`config_set_active_profile`,children:(e,t)=>{l(),i(e,r(`config_set_active_profile`))},$$slots:{default:!0}});var V=c(B,2);p(V,{code:`config_set_active_profile(profile)`,lang:`python`}),g(c(V,6),{name:`profile`,type:`str`,description:`Name of an existing profile section to mark as active.`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,_ as metadata};
//# sourceMappingURL=CHxQDI_A2.js.map
