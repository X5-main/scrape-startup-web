(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9c616401-da6f-401d-b442-b29acbeffa69`,e._sentryDebugIdIdentifier=`sentry-dbid-9c616401-da6f-401d-b442-b29acbeffa69`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Deploy a remote, stateless MCP server on Modal with FastMCP`,id:`deploy-a-remote-stateless-mcp-server-on-modal-with-fastmcp`,children:[{depth:2,value:`Building the MCP server`,id:`building-the-mcp-server`},{depth:2,value:`Testing the MCP server`,id:`testing-the-mcp-server`},{depth:2,value:`Deploying the MCP server`,id:`deploying-the-mcp-server`}]}],rawContent:`# Deploy a remote, stateless MCP server on Modal with FastMCP

This example demonstrates how to deploy a simple
[MCP server](https://modelcontextprotocol.io/)
on Modal.

The server provides a tool to get the current date and time in a given timezone.
It is a stateless MCP server, meaning that it does not store any state between requests,
which is important for mapping onto Modal's serverless Functions.
It uses the "streamable HTTP" transport type.

## Building the MCP server

First, we define our dependencies.

We use the [FastMCP library](https://github.com/jlowin/fastmcp) to create the MCP
server. We wrap with a FastAPI server to expose it to the Internet.

\`\`\`python
import modal

app = modal.App("example-mcp-server-stateless")

image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "fastapi==0.115.14",
    "fastmcp==2.10.6",
    "pydantic==2.11.10",
)


\`\`\`

Next, we create the MCP server itself using FastMCP and add a tool to it that
allows LLMs to get the current date and time in a given timezone.

\`\`\`python
def make_mcp_server():
    from fastmcp import FastMCP

    mcp = FastMCP("Date and Time MCP Server")

    @mcp.tool()
    async def current_date_and_time(timezone: str = "UTC") -> str:
        """Get the current date and time.

        Args:
            timezone: The timezone to get the date and time in (optional). Defaults to UTC.

        Returns:
            The current date and time in the given timezone, in ISO 8601 format.
        """
        from datetime import datetime
        from zoneinfo import ZoneInfo

        try:
            tz = ZoneInfo(timezone)
        except Exception:
            raise ValueError(
                f"Invalid timezone '{timezone}'. Please use a valid timezone like 'UTC', "
                "'America/New_York', or 'Europe/Stockholm'."
            )
        return datetime.now(tz).isoformat()

    return mcp


\`\`\`

We then use FastMCP to create a Starlette app with \`streamable-http\` as transport
type, and set \`stateless_http=True\` to make it stateless.

This will be mounted by the FastAPI app, which we deploy as a
[Modal Web Function](https://modal.com/docs/guide/webhooks)
using [the \`asgi_app\` decorator](https://modal.com/docs/reference/modal.asgi_app):

\`\`\`python
@app.function(image=image)
@modal.asgi_app()
def web():
    """Web gateway for the MCP server"""
    from fastapi import FastAPI

    mcp = make_mcp_server()
    mcp_app = mcp.http_app(transport="streamable-http", stateless_http=True)

    fastapi_app = FastAPI(lifespan=mcp_app.router.lifespan_context)
    fastapi_app.mount("/", mcp_app, "mcp")

    return fastapi_app


\`\`\`

And we're done!

## Testing the MCP server

Now you can [serve](https://modal.com/docs/reference/cli/serve#modal-serve) the MCP
server by running:

\`\`\`bash
modal serve mcp_server_stateless.py
\`\`\`

Then open the [MCP inspector](https://github.com/modelcontextprotocol/inspector):

\`\`\`bash
npx @modelcontextprotocol/inspector
\`\`\`

Enter the URL of the MCP server that was printed by the \`modal serve\` command above,
suffixed with \`/mcp/\` (so for example
\`https://modal-labs-examples--datetime-mcp-server-web-dev.modal.run/mcp/\`). Also
make sure to select "Streamable HTTP" as the "Transport Type".

After connecting and clicking "List Tools" in the "Tools" tab you should see your
\`current_date_and_time\` tool listed, and if you "Run Tool" it should give you the
current date and time in UTC!

To automatically test the MCP server, we spin up a client and have it list the tools.

\`\`\`python
@app.function(image=image)
async def test_tool(tool_name: str | None = None):
    from fastmcp import Client
    from fastmcp.client.transports import StreamableHttpTransport

    if tool_name is None:
        tool_name = "current_date_and_time"

    transport = StreamableHttpTransport(url=f"{web.get_web_url()}/mcp/")
    client = Client(transport)

    async with client:
        tools = await client.list_tools()

        for tool in tools:
            print(tool)
            if tool.name == tool_name:
                result = await client.call_tool(tool_name)
                print(result.data)
                return

    raise Exception(f"could not find tool {tool_name}")


\`\`\`

This test is executed by running the script with \`modal run\`:

\`\`\`bash
modal run mcp_server_stateless::test_tool
\`\`\`

## Deploying the MCP server

\`modal serve\` creates an ephemeral, hot-reloading server,
which is useful for testing and development.

When it's time to move to production,
you can deploy the server with

\`\`\`bash
modal deploy mcp_server_stateless
\`\`\`
`,meta:{title:`Deploy a remote, stateless MCP server on Modal with FastMCP`,description:`This example demonstrates how to deploy a simple MCP server on Modal.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`the <code>asgi_app</code> decorator`,1),b=t(`<!> <p>This example demonstrates how to deploy a simple <!> on Modal.</p> <p>The server provides a tool to get the current date and time in a given timezone.
It is a stateless MCP server, meaning that it does not store any state between requests,
which is important for mapping onto Modal’s serverless Functions.
It uses the “streamable HTTP” transport type.</p> <!> <p>First, we define our dependencies.</p> <p>We use the <!> to create the MCP
server. We wrap with a FastAPI server to expose it to the Internet.</p> <!> <p>Next, we create the MCP server itself using FastMCP and add a tool to it that
allows LLMs to get the current date and time in a given timezone.</p> <!> <p>We then use FastMCP to create a Starlette app with <code>streamable-http</code> as transport
type, and set <code>stateless_http=True</code> to make it stateless.</p> <p>This will be mounted by the FastAPI app, which we deploy as a <!> using <!>:</p> <!> <p>And we’re done!</p> <!> <p>Now you can <!> the MCP
server by running:</p> <!> <p>Then open the <!>:</p> <!> <p>Enter the URL of the MCP server that was printed by the <code>modal serve</code> command above,
suffixed with <code>/mcp/</code> (so for example <code>https://modal-labs-examples--datetime-mcp-server-web-dev.modal.run/mcp/</code>). Also
make sure to select “Streamable HTTP” as the “Transport Type”.</p> <p>After connecting and clicking “List Tools” in the “Tools” tab you should see your <code>current_date_and_time</code> tool listed, and if you “Run Tool” it should give you the
current date and time in UTC!</p> <p>To automatically test the MCP server, we spin up a client and have it list the tools.</p> <!> <p>This test is executed by running the script with <code>modal run</code>:</p> <!> <!> <p><code>modal serve</code> creates an ephemeral, hot-reloading server,
which is useful for testing and development.</p> <p>When it’s time to move to production,
you can deploy the server with</p> <!>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`deploy-a-remote-stateless-mcp-server-on-modal-with-fastmcp`,children:(e,t)=>{l(),i(e,r(`Deploy a remote, stateless MCP server on Modal with FastMCP`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modelcontextprotocol.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MCP server`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);u(g,{id:`building-the-mcp-server`,children:(e,t)=>{l(),i(e,r(`Building the MCP server`))},$$slots:{default:!0}});var _=c(g,4);m(c(e(_)),{href:`https://github.com/jlowin/fastmcp`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastMCP library`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);f(v,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22example-mcp-server-stateless%22)%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%0A%20%20%20%20%22fastapi%3D%3D0.115.14%22%2C%0A%20%20%20%20%22fastmcp%3D%3D2.10.6%22%2C%0A%20%20%20%20%22pydantic%3D%3D2.11.10%22%2C%0A)%0A%0A`,lang:`python`});var x=c(v,4);f(x,{code:`def%20make_mcp_server()%3A%0A%20%20%20%20from%20fastmcp%20import%20FastMCP%0A%0A%20%20%20%20mcp%20%3D%20FastMCP(%22Date%20and%20Time%20MCP%20Server%22)%0A%0A%20%20%20%20%40mcp.tool()%0A%20%20%20%20async%20def%20current_date_and_time(timezone%3A%20str%20%3D%20%22UTC%22)%20-%3E%20str%3A%0A%20%20%20%20%20%20%20%20%22%22%22Get%20the%20current%20date%20and%20time.%0A%0A%20%20%20%20%20%20%20%20Args%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20timezone%3A%20The%20timezone%20to%20get%20the%20date%20and%20time%20in%20(optional).%20Defaults%20to%20UTC.%0A%0A%20%20%20%20%20%20%20%20Returns%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20The%20current%20date%20and%20time%20in%20the%20given%20timezone%2C%20in%20ISO%208601%20format.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20from%20datetime%20import%20datetime%0A%20%20%20%20%20%20%20%20from%20zoneinfo%20import%20ZoneInfo%0A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20tz%20%3D%20ZoneInfo(timezone)%0A%20%20%20%20%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22Invalid%20timezone%20'%7Btimezone%7D'.%20Please%20use%20a%20valid%20timezone%20like%20'UTC'%2C%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22'America%2FNew_York'%2C%20or%20'Europe%2FStockholm'.%22%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20return%20datetime.now(tz).isoformat()%0A%0A%20%20%20%20return%20mcp%0A%0A`,lang:`python`});var S=c(x,4),C=c(e(S));m(C,{href:`https://modal.com/docs/guide/webhooks`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Web Function`))},$$slots:{default:!0}}),m(c(C,2),{href:`https://modal.com/docs/reference/modal.asgi_app`,rel:`nofollow`,children:(e,t)=>{l();var n=y();l(2),i(e,n)},$$slots:{default:!0}}),l(),n(S);var w=c(S,2);f(w,{code:`%40app.function(image%3Dimage)%0A%40modal.asgi_app()%0Adef%20web()%3A%0A%20%20%20%20%22%22%22Web%20gateway%20for%20the%20MCP%20server%22%22%22%0A%20%20%20%20from%20fastapi%20import%20FastAPI%0A%0A%20%20%20%20mcp%20%3D%20make_mcp_server()%0A%20%20%20%20mcp_app%20%3D%20mcp.http_app(transport%3D%22streamable-http%22%2C%20stateless_http%3DTrue)%0A%0A%20%20%20%20fastapi_app%20%3D%20FastAPI(lifespan%3Dmcp_app.router.lifespan_context)%0A%20%20%20%20fastapi_app.mount(%22%2F%22%2C%20mcp_app%2C%20%22mcp%22)%0A%0A%20%20%20%20return%20fastapi_app%0A%0A`,lang:`python`});var T=c(w,4);u(T,{id:`testing-the-mcp-server`,children:(e,t)=>{l(),i(e,r(`Testing the MCP server`))},$$slots:{default:!0}});var E=c(T,2);m(c(e(E)),{href:`https://modal.com/docs/reference/cli/serve#modal-serve`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`serve`))},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);f(D,{code:`modal%20serve%20mcp_server_stateless.py`,lang:`bash`});var O=c(D,2);m(c(e(O)),{href:`https://github.com/modelcontextprotocol/inspector`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MCP inspector`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,2);f(k,{code:`npx%20%40modelcontextprotocol%2Finspector`,lang:`bash`});var A=c(k,8);f(A,{code:`%40app.function(image%3Dimage)%0Aasync%20def%20test_tool(tool_name%3A%20str%20%7C%20None%20%3D%20None)%3A%0A%20%20%20%20from%20fastmcp%20import%20Client%0A%20%20%20%20from%20fastmcp.client.transports%20import%20StreamableHttpTransport%0A%0A%20%20%20%20if%20tool_name%20is%20None%3A%0A%20%20%20%20%20%20%20%20tool_name%20%3D%20%22current_date_and_time%22%0A%0A%20%20%20%20transport%20%3D%20StreamableHttpTransport(url%3Df%22%7Bweb.get_web_url()%7D%2Fmcp%2F%22)%0A%20%20%20%20client%20%3D%20Client(transport)%0A%0A%20%20%20%20async%20with%20client%3A%0A%20%20%20%20%20%20%20%20tools%20%3D%20await%20client.list_tools()%0A%0A%20%20%20%20%20%20%20%20for%20tool%20in%20tools%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(tool)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20tool.name%20%3D%3D%20tool_name%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20await%20client.call_tool(tool_name)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(result.data)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20raise%20Exception(f%22could%20not%20find%20tool%20%7Btool_name%7D%22)%0A%0A`,lang:`python`});var j=c(A,4);f(j,{code:`modal%20run%20mcp_server_stateless%3A%3Atest_tool`,lang:`bash`});var M=c(j,2);u(M,{id:`deploying-the-mcp-server`,children:(e,t)=>{l(),i(e,r(`Deploying the MCP server`))},$$slots:{default:!0}}),f(c(M,6),{code:`modal%20deploy%20mcp_server_stateless`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=CLOGhFBB.js.map
