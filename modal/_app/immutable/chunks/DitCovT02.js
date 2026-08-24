(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`d3cb5215-d839-428b-b3f1-555d4681b160`,e._sentryDebugIdIdentifier=`sentry-dbid-d3cb5215-d839-428b-b3f1-555d4681b160`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Deploy Flask app with streaming results with Modal`,id:`deploy-flask-app-with-streaming-results-with-modal`}],rawContent:`# Deploy Flask app with streaming results with Modal

This example shows how you can deploy a [Flask](https://flask.palletsprojects.com/en/3.0.x/) app with Modal that streams results back to the client.

\`\`\`python
import modal

app = modal.App(
    "example-flask-streaming",
    image=modal.Image.debian_slim().uv_pip_install("flask"),
)


@app.function()
def generate_rows():
    """
    This creates a large CSV file, about 10MB, which will be streaming downloaded
    by a web client.
    """
    for i in range(10_000):
        line = ",".join(str((j + i) * i) for j in range(128))
        yield f"{line}\\n"


@app.function()
@modal.wsgi_app()
def flask_app():
    from flask import Flask

    web_app = Flask(__name__)

    # These web handlers follow the example from
    # https://flask.palletsprojects.com/en/2.2.x/patterns/streaming/

    @web_app.route("/")
    def generate_large_csv():
        # Run the function locally in the web app's container.
        return generate_rows.local(), {"Content-Type": "text/csv"}

    @web_app.route("/remote")
    def generate_large_csv_in_container():
        # Run the function remotely in a separate container,
        # which will stream back results to the web app container,
        # which will stream back to the web client.
        #
        # This is less efficient, but demonstrates how web serving
        # containers can be separated from and cooperate with other
        # containers.
        return generate_rows.remote(), {"Content-Type": "text/csv"}

    return web_app

\`\`\`
`,meta:{title:`Deploy Flask app with streaming results with Modal`,description:`This example shows how you can deploy a Flask app with Modal that streams results back to the client.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This example shows how you can deploy a <!> app with Modal that streams results back to the client.</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`deploy-flask-app-with-streaming-results-with-modal`,children:(e,t)=>{l(),i(e,r(`Deploy Flask app with streaming results with Modal`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://flask.palletsprojects.com/en/3.0.x/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flask`))},$$slots:{default:!0}}),l(),n(m),d(c(m,2),{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20%22example-flask-streaming%22%2C%0A%20%20%20%20image%3Dmodal.Image.debian_slim().uv_pip_install(%22flask%22)%2C%0A)%0A%0A%0A%40app.function()%0Adef%20generate_rows()%3A%0A%20%20%20%20%22%22%22%0A%20%20%20%20This%20creates%20a%20large%20CSV%20file%2C%20about%2010MB%2C%20which%20will%20be%20streaming%20downloaded%0A%20%20%20%20by%20a%20web%20client.%0A%20%20%20%20%22%22%22%0A%20%20%20%20for%20i%20in%20range(10_000)%3A%0A%20%20%20%20%20%20%20%20line%20%3D%20%22%2C%22.join(str((j%20%2B%20i)%20*%20i)%20for%20j%20in%20range(128))%0A%20%20%20%20%20%20%20%20yield%20f%22%7Bline%7D%5Cn%22%0A%0A%0A%40app.function()%0A%40modal.wsgi_app()%0Adef%20flask_app()%3A%0A%20%20%20%20from%20flask%20import%20Flask%0A%0A%20%20%20%20web_app%20%3D%20Flask(__name__)%0A%0A%20%20%20%20%23%20These%20web%20handlers%20follow%20the%20example%20from%0A%20%20%20%20%23%20https%3A%2F%2Fflask.palletsprojects.com%2Fen%2F2.2.x%2Fpatterns%2Fstreaming%2F%0A%0A%20%20%20%20%40web_app.route(%22%2F%22)%0A%20%20%20%20def%20generate_large_csv()%3A%0A%20%20%20%20%20%20%20%20%23%20Run%20the%20function%20locally%20in%20the%20web%20app's%20container.%0A%20%20%20%20%20%20%20%20return%20generate_rows.local()%2C%20%7B%22Content-Type%22%3A%20%22text%2Fcsv%22%7D%0A%0A%20%20%20%20%40web_app.route(%22%2Fremote%22)%0A%20%20%20%20def%20generate_large_csv_in_container()%3A%0A%20%20%20%20%20%20%20%20%23%20Run%20the%20function%20remotely%20in%20a%20separate%20container%2C%0A%20%20%20%20%20%20%20%20%23%20which%20will%20stream%20back%20results%20to%20the%20web%20app%20container%2C%0A%20%20%20%20%20%20%20%20%23%20which%20will%20stream%20back%20to%20the%20web%20client.%0A%20%20%20%20%20%20%20%20%23%0A%20%20%20%20%20%20%20%20%23%20This%20is%20less%20efficient%2C%20but%20demonstrates%20how%20web%20serving%0A%20%20%20%20%20%20%20%20%23%20containers%20can%20be%20separated%20from%20and%20cooperate%20with%20other%0A%20%20%20%20%20%20%20%20%23%20containers.%0A%20%20%20%20%20%20%20%20return%20generate_rows.remote()%2C%20%7B%22Content-Type%22%3A%20%22text%2Fcsv%22%7D%0A%0A%20%20%20%20return%20web_app%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=DitCovT02.js.map
