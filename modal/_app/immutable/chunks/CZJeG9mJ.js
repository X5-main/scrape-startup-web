(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`28c57caf-8e3a-419c-b658-266b869eda9e`,e._sentryDebugIdIdentifier=`sentry-dbid-28c57caf-8e3a-419c-b658-266b869eda9e`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`Example (cbx_locustfile.py)`,id:`example-cbx_locustfilepy`}],rawContent:`# Example (cbx_locustfile.py)

This is the source code for **07_web.fasthtml-checkboxes.cbx_locustfile**.

\`\`\`python
import random

from bs4 import BeautifulSoup
from constants import N_CHECKBOXES
from locust import HttpUser, between, task


class CheckboxesUser(HttpUser):
    wait_time = between(0.01, 0.1)  # Simulates a wait time between requests

    def load_homepage(self):
        """
        Simulates a user loading the homepage and fetching the state of the checkboxes.
        """
        response = self.client.get("/")
        soup = BeautifulSoup(response.text, "lxml")
        main_div = soup.find("main")
        self.id = main_div["hx-get"].split("/")[-1]

    @task(10)
    def toggle_random_checkboxes(self):
        """
        Simulates a user toggling a random checkbox.
        """
        n_checkboxes = random.binomialvariate(  # approximately poisson at 10
            n=100,
            p=0.1,
        )
        for _ in range(min(n_checkboxes, 1)):
            checkbox_id = int(
                N_CHECKBOXES * random.random() ** 2
            )  # Choose a random checkbox between 0 and 9999, more likely to be closer to 0
            self.client.post(
                f"/checkbox/toggle/{checkbox_id}",
                name="/checkbox/toggle",
            )

    @task(1)
    def poll_for_diffs(self):
        """
        Simulates a user polling for any outstanding diffs.
        """
        self.client.get(f"/diffs/{self.id}", name="/diffs")

    def on_start(self):
        """
        Called when a simulated user starts, typically used to initialize or login a user.
        """
        self.id = str(random.randint(1, 9999))
        self.load_homepage()

\`\`\`
`,meta:{title:`Example (cbx_locustfile.py)`,description:`This is the source code for 07_web.fasthtml-checkboxes.cbx_locustfile.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <p>This is the source code for <strong>07_web.fasthtml-checkboxes.cbx_locustfile</strong>.</p> <!>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`example-cbx_locustfilepy`,children:(e,r)=>{s(),n(e,t(`Example (cbx_locustfile.py)`))},$$slots:{default:!0}}),l(o(u,4),{code:`import%20random%0A%0Afrom%20bs4%20import%20BeautifulSoup%0Afrom%20constants%20import%20N_CHECKBOXES%0Afrom%20locust%20import%20HttpUser%2C%20between%2C%20task%0A%0A%0Aclass%20CheckboxesUser(HttpUser)%3A%0A%20%20%20%20wait_time%20%3D%20between(0.01%2C%200.1)%20%20%23%20Simulates%20a%20wait%20time%20between%20requests%0A%0A%20%20%20%20def%20load_homepage(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Simulates%20a%20user%20loading%20the%20homepage%20and%20fetching%20the%20state%20of%20the%20checkboxes.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20response%20%3D%20self.client.get(%22%2F%22)%0A%20%20%20%20%20%20%20%20soup%20%3D%20BeautifulSoup(response.text%2C%20%22lxml%22)%0A%20%20%20%20%20%20%20%20main_div%20%3D%20soup.find(%22main%22)%0A%20%20%20%20%20%20%20%20self.id%20%3D%20main_div%5B%22hx-get%22%5D.split(%22%2F%22)%5B-1%5D%0A%0A%20%20%20%20%40task(10)%0A%20%20%20%20def%20toggle_random_checkboxes(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Simulates%20a%20user%20toggling%20a%20random%20checkbox.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20n_checkboxes%20%3D%20random.binomialvariate(%20%20%23%20approximately%20poisson%20at%2010%0A%20%20%20%20%20%20%20%20%20%20%20%20n%3D100%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20p%3D0.1%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20for%20_%20in%20range(min(n_checkboxes%2C%201))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20checkbox_id%20%3D%20int(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20N_CHECKBOXES%20*%20random.random()%20**%202%0A%20%20%20%20%20%20%20%20%20%20%20%20)%20%20%23%20Choose%20a%20random%20checkbox%20between%200%20and%209999%2C%20more%20likely%20to%20be%20closer%20to%200%0A%20%20%20%20%20%20%20%20%20%20%20%20self.client.post(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%2Fcheckbox%2Ftoggle%2F%7Bcheckbox_id%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20name%3D%22%2Fcheckbox%2Ftoggle%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%40task(1)%0A%20%20%20%20def%20poll_for_diffs(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Simulates%20a%20user%20polling%20for%20any%20outstanding%20diffs.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.client.get(f%22%2Fdiffs%2F%7Bself.id%7D%22%2C%20name%3D%22%2Fdiffs%22)%0A%0A%20%20%20%20def%20on_start(self)%3A%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20Called%20when%20a%20simulated%20user%20starts%2C%20typically%20used%20to%20initialize%20or%20login%20a%20user.%0A%20%20%20%20%20%20%20%20%22%22%22%0A%20%20%20%20%20%20%20%20self.id%20%3D%20str(random.randint(1%2C%209999))%0A%20%20%20%20%20%20%20%20self.load_homepage()%0A`,lang:`python`}),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=CZJeG9mJ.js.map
