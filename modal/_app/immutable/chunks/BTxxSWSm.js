(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`574a6154-25a7-4cd0-9564-48ee422d174f`,e._sentryDebugIdIdentifier=`sentry-dbid-574a6154-25a7-4cd0-9564-48ee422d174f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:2,value:`Demo Streamlit application.`,id:`demo-streamlit-application`}],rawContent:`## Demo Streamlit application.

This application is the example from https://docs.streamlit.io/library/get-started/create-an-app.

Streamlit is designed to run its apps as Python scripts, not functions, so we separate the Streamlit
code into this module, away from the Modal application code.

\`\`\`python
def main():
    import numpy as np
    import pandas as pd
    import streamlit as st

    st.title("Uber pickups in NYC!")

    DATE_COLUMN = "date/time"
    DATA_URL = (
        "https://s3-us-west-2.amazonaws.com/"
        "streamlit-demo-data/uber-raw-data-sep14.csv.gz"
    )

    @st.cache_data
    def load_data(nrows):
        data = pd.read_csv(DATA_URL, nrows=nrows)

        def lowercase(x):
            return str(x).lower()

        data.rename(lowercase, axis="columns", inplace=True)
        data[DATE_COLUMN] = pd.to_datetime(data[DATE_COLUMN])
        return data

    data_load_state = st.text("Loading data...")
    data = load_data(10000)
    data_load_state.text("Done! (using st.cache_data)")

    if st.checkbox("Show raw data"):
        st.subheader("Raw data")
        st.write(data)

    st.subheader("Number of pickups by hour")
    hist_values = np.histogram(data[DATE_COLUMN].dt.hour, bins=24, range=(0, 24))[0]
    st.bar_chart(hist_values)

    # Some number in the range 0-23
    hour_to_filter = st.slider("hour", 0, 23, 17)
    filtered_data = data[data[DATE_COLUMN].dt.hour == hour_to_filter]

    st.subheader("Map of all pickups at %s:00" % hour_to_filter)
    st.map(filtered_data)


if __name__ == "__main__":
    main()

\`\`\`
`,meta:{description:`This application is the example from https://docs.streamlit.io/library/get-started/create-an-app.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This application is the example from <!>.</p> <p>Streamlit is designed to run its apps as Python scripts, not functions, so we separate the Streamlit
code into this module, away from the Modal application code.</p> <!>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`demo-streamlit-application`,children:(e,t)=>{l(),i(e,r(`Demo Streamlit application.`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://docs.streamlit.io/library/get-started/create-an-app`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://docs.streamlit.io/library/get-started/create-an-app`))},$$slots:{default:!0}}),l(),n(m),d(c(m,4),{code:`def%20main()%3A%0A%20%20%20%20import%20numpy%20as%20np%0A%20%20%20%20import%20pandas%20as%20pd%0A%20%20%20%20import%20streamlit%20as%20st%0A%0A%20%20%20%20st.title(%22Uber%20pickups%20in%20NYC!%22)%0A%0A%20%20%20%20DATE_COLUMN%20%3D%20%22date%2Ftime%22%0A%20%20%20%20DATA_URL%20%3D%20(%0A%20%20%20%20%20%20%20%20%22https%3A%2F%2Fs3-us-west-2.amazonaws.com%2F%22%0A%20%20%20%20%20%20%20%20%22streamlit-demo-data%2Fuber-raw-data-sep14.csv.gz%22%0A%20%20%20%20)%0A%0A%20%20%20%20%40st.cache_data%0A%20%20%20%20def%20load_data(nrows)%3A%0A%20%20%20%20%20%20%20%20data%20%3D%20pd.read_csv(DATA_URL%2C%20nrows%3Dnrows)%0A%0A%20%20%20%20%20%20%20%20def%20lowercase(x)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20str(x).lower()%0A%0A%20%20%20%20%20%20%20%20data.rename(lowercase%2C%20axis%3D%22columns%22%2C%20inplace%3DTrue)%0A%20%20%20%20%20%20%20%20data%5BDATE_COLUMN%5D%20%3D%20pd.to_datetime(data%5BDATE_COLUMN%5D)%0A%20%20%20%20%20%20%20%20return%20data%0A%0A%20%20%20%20data_load_state%20%3D%20st.text(%22Loading%20data...%22)%0A%20%20%20%20data%20%3D%20load_data(10000)%0A%20%20%20%20data_load_state.text(%22Done!%20(using%20st.cache_data)%22)%0A%0A%20%20%20%20if%20st.checkbox(%22Show%20raw%20data%22)%3A%0A%20%20%20%20%20%20%20%20st.subheader(%22Raw%20data%22)%0A%20%20%20%20%20%20%20%20st.write(data)%0A%0A%20%20%20%20st.subheader(%22Number%20of%20pickups%20by%20hour%22)%0A%20%20%20%20hist_values%20%3D%20np.histogram(data%5BDATE_COLUMN%5D.dt.hour%2C%20bins%3D24%2C%20range%3D(0%2C%2024))%5B0%5D%0A%20%20%20%20st.bar_chart(hist_values)%0A%0A%20%20%20%20%23%20Some%20number%20in%20the%20range%200-23%0A%20%20%20%20hour_to_filter%20%3D%20st.slider(%22hour%22%2C%200%2C%2023%2C%2017)%0A%20%20%20%20filtered_data%20%3D%20data%5Bdata%5BDATE_COLUMN%5D.dt.hour%20%3D%3D%20hour_to_filter%5D%0A%0A%20%20%20%20st.subheader(%22Map%20of%20all%20pickups%20at%20%25s%3A00%22%20%25%20hour_to_filter)%0A%20%20%20%20st.map(filtered_data)%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20main()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=BTxxSWSm.js.map
