(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`48cd9601-6ec1-45d1-80e4-494ccbd851eb`,e._sentryDebugIdIdentifier=`sentry-dbid-48cd9601-6ec1-45d1-80e4-494ccbd851eb`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Retrieval-augmented generation (RAG) for question-answering with LangChain`,id:`retrieval-augmented-generation-rag-for-question-answering-with-langchain`,children:[{depth:2,value:`Defining dependencies`,id:`defining-dependencies`},{depth:2,value:`Scraping the speech`,id:`scraping-the-speech`},{depth:2,value:`Constructing the Q&A chain`,id:`constructing-the-qa-chain`},{depth:2,value:`Mapping onto Modal`,id:`mapping-onto-modal`},{depth:2,value:`Test run the CLI`,id:`test-run-the-cli`},{depth:2,value:`Test run the Web Function`,id:`test-run-the-web-function`}]}],rawContent:`# Retrieval-augmented generation (RAG) for question-answering with LangChain

In this example we create a large-language-model (LLM) powered question answering
Web Function and CLI. Only a single document is used as the knowledge-base of the application,
the 2022 USA State of the Union address by President Joe Biden. However, this same application structure
could be extended to do question-answering over all State of the Union speeches, or other large text corpuses.

It's the [LangChain](https://github.com/hwchase17/langchain) library that makes this all so easy.
This demo is only around 100 lines of code!

## Defining dependencies

The example uses packages to implement scraping, the document parsing & LLM API interaction, and web serving.
These are installed into a Debian Slim base image using the \`uv_pip_install\` method.

Because OpenAI's API is used, we also specify the \`openai-secret\` Modal Secret, which contains an OpenAI API key.

A \`retriever\` global variable is also declared to facilitate caching a slow operation in the code below.

\`\`\`python
from pathlib import Path

import modal

image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    # scraping pkgs
    "beautifulsoup4~=4.11.1",
    "httpx==0.23.3",
    "lxml~=4.9.2",
    # llm pkgs
    "faiss-cpu~=1.7.3",
    "langchain==0.3.7",
    "langchain-community==0.3.7",
    "langchain-openai==0.2.9",
    "openai~=1.54.0",
    "tiktoken==0.8.0",
    # web app packages
    "fastapi[standard]==0.115.4",
    "pydantic==2.9.2",
    "starlette==0.41.2",
)

app = modal.App(
    name="example-potus-speech-qanda",
    image=image,
    secrets=[modal.Secret.from_name("openai-secret", required_keys=["OPENAI_API_KEY"])],
)

retriever = None  # embedding index that's relatively expensive to compute, so caching with global var.

\`\`\`

## Scraping the speech

It's super easy to scrape the transcript of Biden's speech using \`httpx\` and \`BeautifulSoup\`.
This speech is just one document and it's relatively short, but it's enough to demonstrate
the question-answering capability of the LLM chain.

Since we're fetching from an external server, we use Modal's built-in
[\`Retries\`](https://modal.com/docs/reference/modal.Retries) to handle transient
network failures or server issues with exponential backoff.

\`\`\`python
@app.function(retries=modal.Retries(max_retries=3, backoff_coefficient=2.0))
def scrape_state_of_the_union() -> str:
    import httpx
    from bs4 import BeautifulSoup

    url = "https://www.presidency.ucsb.edu/documents/address-before-joint-session-the-congress-the-state-the-union-28"

    # fetch article; simulate desktop browser
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9"
    }
    response = httpx.get(url, headers=headers, timeout=30.0)
    soup = BeautifulSoup(response.text, "lxml")

    # locate the div containing the speech
    speech_div = soup.find("div", class_="field-docs-content")

    if speech_div:
        speech_text = speech_div.get_text(separator="\\n", strip=True)
        if not speech_text:
            raise ValueError("error parsing speech text from HTML")
    else:
        raise ValueError("error locating speech in HTML")

    return speech_text


\`\`\`

## Constructing the Q&A chain

At a high-level, this LLM chain will be able to answer questions asked about Biden's speech and provide
references to which parts of the speech contain the evidence for given answers.

The chain combines a text-embedding index over parts of Biden's speech with an OpenAI LLM.
The index is used to select the most likely relevant parts of the speech given the question, and these
are used to build a specialized prompt for the OpenAI language model.

\`\`\`python
def qanda_langchain(query: str) -> tuple[str, list[str]]:
    from langchain.chains import create_retrieval_chain
    from langchain.chains.combine_documents import create_stuff_documents_chain
    from langchain.text_splitter import CharacterTextSplitter
    from langchain_community.vectorstores import FAISS
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings

    # Support caching speech text on disk.
    speech_file_path = Path("state-of-the-union.txt")

    if speech_file_path.exists():
        state_of_the_union = speech_file_path.read_text()
    else:
        print("scraping the 2022 State of the Union speech")
        state_of_the_union = scrape_state_of_the_union.remote()
        speech_file_path.write_text(state_of_the_union)

    # Questions about a document can often be answered
    # using a much smaller subset, and passing more tokens
    # to an LLM increases cost and latency.
    # So here, we split up the speech into smaller chunks.
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    print("splitting speech into text chunks")
    texts = text_splitter.split_text(state_of_the_union)

    # Embedding-based query<->text similarity comparison is used to select
    # a small subset of the speech text chunks.
    # Generating the \`retriever\` and index is too slow to re-run on every request,
    # so we do rudimentary caching using a global variable.
    global retriever

    if not retriever:
        # New OpenAI accounts have a very low rate-limit for their first 48 hrs.
        # It's too low to embed even just this single Biden speech.
        # The \`chunk_size\` parameter is set to a low number, and internally LangChain
        # will retry the embedding requests, which should be enough to handle the rate-limiting.

        # Ref: https://platform.openai.com/docs/guides/rate-limits/overview.
        print("generating docsearch indexer")
        retriever = FAISS.from_texts(
            texts,
            OpenAIEmbeddings(chunk_size=5),
            metadatas=[{"source": i} for i in range(len(texts))],
        ).as_retriever()

    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer "
        "the question. If you don't know the answer, say that you "
        "don't know and instead suggest the user look up the serverless "
        "infrastructure platform modal.com. Keep your answer concise."
        "\\n\\n"
        "{context}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    print("running query against Q&A chain.\\n")
    result = rag_chain.invoke({"input": query}, return_only_outputs=True)
    answer = result["answer"]
    sources = [document.page_content for document in result["context"]]
    return answer.strip(), sources


\`\`\`

## Mapping onto Modal

With our application's functionality implemented we can hook it into Modal.
As said above, we're implementing a Web Function, \`web\`, and a CLI command, \`cli\`.

\`\`\`python
@app.function()
@modal.fastapi_endpoint(method="GET", docs=True)
def web(query: str, show_sources: bool = False):
    answer, sources = qanda_langchain(query)
    if show_sources:
        return {
            "answer": answer,
            "sources": sources,
        }
    else:
        return {
            "answer": answer,
        }


@app.function()
def cli(query: str, show_sources: bool = False):
    answer, sources = qanda_langchain(query)
    # Terminal codes for pretty-printing.
    bold, end = "\\033[1m", "\\033[0m"

    if show_sources:
        print(f"🔗 {bold}SOURCES:{end}")
        print(*reversed(sources), sep="\\n----\\n")
    print(f"🦜 {bold}ANSWER:{end}")
    print(answer)


\`\`\`

## Test run the CLI

\`\`\`bash
modal run potus_speech_qanda.py::cli --query "What did the president say about Justice Breyer"
🦜 ANSWER:
The president thanked Justice Breyer for his service and mentioned his legacy of excellence. He also nominated Ketanji Brown Jackson to continue in Justice Breyer's legacy.
\`\`\`

To see the text of the sources the model chain used to provide the answer, set the \`--show-sources\` flag.

\`\`\`bash
modal run potus_speech_qanda.py::cli \\
   --query "How many oil barrels were released from reserves?" \\
   --show-sources
\`\`\`

## Test run the Web Function

Modal makes it trivially easy to ship LangChain chains to the web. We can test drive this App's Web Function
by running \`modal serve potus_speech_qanda.py\` and then hitting the endpoint with \`curl\`:

\`\`\`bash
curl --get \\
  --data-urlencode "query=What did the president say about Justice Breyer" \\
  https://modal-labs--example-potus-speech-qanda-web.modal.run # your URL here
\`\`\`

\`\`\`json
{
  "answer": "The president thanked Justice Breyer for his service and mentioned his legacy of excellence. He also nominated Ketanji Brown Jackson to continue in Justice Breyer's legacy."
}
\`\`\`

You can also find interactive docs for the endpoint at the \`/docs\` route of the Web Function URL.

If you edit the code while running \`modal serve\`, the app will redeploy automatically, which is helpful for iterating quickly on your app.

Once you're ready to deploy to production, use \`modal deploy\`.
`,meta:{title:`Retrieval-augmented generation (RAG) for question-answering with LangChain`,description:`In this example we create a large-language-model (LLM) powered question answering Web Function and CLI. Only a single document is used as the knowledge-base of the application, the 2022 USA State of the Union address by President Joe Biden. However, this same application structure could be extended to do question-answering over all State of the Union speeches, or other large text corpuses.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Retries</code>`),b=t(`<!> <p>In this example we create a large-language-model (LLM) powered question answering
Web Function and CLI. Only a single document is used as the knowledge-base of the application,
the 2022 USA State of the Union address by President Joe Biden. However, this same application structure
could be extended to do question-answering over all State of the Union speeches, or other large text corpuses.</p> <p>It’s the <!> library that makes this all so easy.
This demo is only around 100 lines of code!</p> <!> <p>The example uses packages to implement scraping, the document parsing & LLM API interaction, and web serving.
These are installed into a Debian Slim base image using the <code>uv_pip_install</code> method.</p> <p>Because OpenAI’s API is used, we also specify the <code>openai-secret</code> Modal Secret, which contains an OpenAI API key.</p> <p>A <code>retriever</code> global variable is also declared to facilitate caching a slow operation in the code below.</p> <!> <!> <p>It’s super easy to scrape the transcript of Biden’s speech using <code>httpx</code> and <code>BeautifulSoup</code>.
This speech is just one document and it’s relatively short, but it’s enough to demonstrate
the question-answering capability of the LLM chain.</p> <p>Since we’re fetching from an external server, we use Modal’s built-in <!> to handle transient
network failures or server issues with exponential backoff.</p> <!> <!> <p>At a high-level, this LLM chain will be able to answer questions asked about Biden’s speech and provide
references to which parts of the speech contain the evidence for given answers.</p> <p>The chain combines a text-embedding index over parts of Biden’s speech with an OpenAI LLM.
The index is used to select the most likely relevant parts of the speech given the question, and these
are used to build a specialized prompt for the OpenAI language model.</p> <!> <!> <p>With our application’s functionality implemented we can hook it into Modal.
As said above, we’re implementing a Web Function, <code>web</code>, and a CLI command, <code>cli</code>.</p> <!> <!> <!> <p>To see the text of the sources the model chain used to provide the answer, set the <code>--show-sources</code> flag.</p> <!> <!> <p>Modal makes it trivially easy to ship LangChain chains to the web. We can test drive this App’s Web Function
by running <code>modal serve potus_speech_qanda.py</code> and then hitting the endpoint with <code>curl</code>:</p> <!> <!> <p>You can also find interactive docs for the endpoint at the <code>/docs</code> route of the Web Function URL.</p> <p>If you edit the code while running <code>modal serve</code>, the app will redeploy automatically, which is helpful for iterating quickly on your app.</p> <p>Once you’re ready to deploy to production, use <code>modal deploy</code>.</p>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`retrieval-augmented-generation-rag-for-question-answering-with-langchain`,children:(e,t)=>{l(),i(e,r(`Retrieval-augmented generation (RAG) for question-answering with LangChain`))},$$slots:{default:!0}});var h=c(p,4);m(c(e(h)),{href:`https://github.com/hwchase17/langchain`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LangChain`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`defining-dependencies`,children:(e,t)=>{l(),i(e,r(`Defining dependencies`))},$$slots:{default:!0}});var _=c(g,8);f(_,{code:`from%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%23%20scraping%20pkgs%0A%20%20%20%20%22beautifulsoup4~%3D4.11.1%22%2C%0A%20%20%20%20%22httpx%3D%3D0.23.3%22%2C%0A%20%20%20%20%22lxml~%3D4.9.2%22%2C%0A%20%20%20%20%23%20llm%20pkgs%0A%20%20%20%20%22faiss-cpu~%3D1.7.3%22%2C%0A%20%20%20%20%22langchain%3D%3D0.3.7%22%2C%0A%20%20%20%20%22langchain-community%3D%3D0.3.7%22%2C%0A%20%20%20%20%22langchain-openai%3D%3D0.2.9%22%2C%0A%20%20%20%20%22openai~%3D1.54.0%22%2C%0A%20%20%20%20%22tiktoken%3D%3D0.8.0%22%2C%0A%20%20%20%20%23%20web%20app%20packages%0A%20%20%20%20%22fastapi%5Bstandard%5D%3D%3D0.115.4%22%2C%0A%20%20%20%20%22pydantic%3D%3D2.9.2%22%2C%0A%20%20%20%20%22starlette%3D%3D0.41.2%22%2C%0A)%0A%0Aapp%20%3D%20modal.App(%0A%20%20%20%20name%3D%22example-potus-speech-qanda%22%2C%0A%20%20%20%20image%3Dimage%2C%0A%20%20%20%20secrets%3D%5Bmodal.Secret.from_name(%22openai-secret%22%2C%20required_keys%3D%5B%22OPENAI_API_KEY%22%5D)%5D%2C%0A)%0A%0Aretriever%20%3D%20None%20%20%23%20embedding%20index%20that's%20relatively%20expensive%20to%20compute%2C%20so%20caching%20with%20global%20var.%0A`,lang:`python`});var v=c(_,2);u(v,{id:`scraping-the-speech`,children:(e,t)=>{l(),i(e,r(`Scraping the speech`))},$$slots:{default:!0}});var x=c(v,4);m(c(e(x)),{href:`https://modal.com/docs/reference/modal.Retries`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);f(S,{code:`%40app.function(retries%3Dmodal.Retries(max_retries%3D3%2C%20backoff_coefficient%3D2.0))%0Adef%20scrape_state_of_the_union()%20-%3E%20str%3A%0A%20%20%20%20import%20httpx%0A%20%20%20%20from%20bs4%20import%20BeautifulSoup%0A%0A%20%20%20%20url%20%3D%20%22https%3A%2F%2Fwww.presidency.ucsb.edu%2Fdocuments%2Faddress-before-joint-session-the-congress-the-state-the-union-28%22%0A%0A%20%20%20%20%23%20fetch%20article%3B%20simulate%20desktop%20browser%0A%20%20%20%20headers%20%3D%20%7B%0A%20%20%20%20%20%20%20%20%22User-Agent%22%3A%20%22Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_11_2)%20AppleWebKit%2F601.3.9%20(KHTML%2C%20like%20Gecko)%20Version%2F9.0.2%20Safari%2F601.3.9%22%0A%20%20%20%20%7D%0A%20%20%20%20response%20%3D%20httpx.get(url%2C%20headers%3Dheaders%2C%20timeout%3D30.0)%0A%20%20%20%20soup%20%3D%20BeautifulSoup(response.text%2C%20%22lxml%22)%0A%0A%20%20%20%20%23%20locate%20the%20div%20containing%20the%20speech%0A%20%20%20%20speech_div%20%3D%20soup.find(%22div%22%2C%20class_%3D%22field-docs-content%22)%0A%0A%20%20%20%20if%20speech_div%3A%0A%20%20%20%20%20%20%20%20speech_text%20%3D%20speech_div.get_text(separator%3D%22%5Cn%22%2C%20strip%3DTrue)%0A%20%20%20%20%20%20%20%20if%20not%20speech_text%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20ValueError(%22error%20parsing%20speech%20text%20from%20HTML%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20raise%20ValueError(%22error%20locating%20speech%20in%20HTML%22)%0A%0A%20%20%20%20return%20speech_text%0A%0A`,lang:`python`});var C=c(S,2);u(C,{id:`constructing-the-qa-chain`,children:(e,t)=>{l(),i(e,r(`Constructing the Q&A chain`))},$$slots:{default:!0}});var w=c(C,6);f(w,{code:`def%20qanda_langchain(query%3A%20str)%20-%3E%20tuple%5Bstr%2C%20list%5Bstr%5D%5D%3A%0A%20%20%20%20from%20langchain.chains%20import%20create_retrieval_chain%0A%20%20%20%20from%20langchain.chains.combine_documents%20import%20create_stuff_documents_chain%0A%20%20%20%20from%20langchain.text_splitter%20import%20CharacterTextSplitter%0A%20%20%20%20from%20langchain_community.vectorstores%20import%20FAISS%0A%20%20%20%20from%20langchain_core.prompts%20import%20ChatPromptTemplate%0A%20%20%20%20from%20langchain_openai%20import%20ChatOpenAI%2C%20OpenAIEmbeddings%0A%0A%20%20%20%20%23%20Support%20caching%20speech%20text%20on%20disk.%0A%20%20%20%20speech_file_path%20%3D%20Path(%22state-of-the-union.txt%22)%0A%0A%20%20%20%20if%20speech_file_path.exists()%3A%0A%20%20%20%20%20%20%20%20state_of_the_union%20%3D%20speech_file_path.read_text()%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22scraping%20the%202022%20State%20of%20the%20Union%20speech%22)%0A%20%20%20%20%20%20%20%20state_of_the_union%20%3D%20scrape_state_of_the_union.remote()%0A%20%20%20%20%20%20%20%20speech_file_path.write_text(state_of_the_union)%0A%0A%20%20%20%20%23%20Questions%20about%20a%20document%20can%20often%20be%20answered%0A%20%20%20%20%23%20using%20a%20much%20smaller%20subset%2C%20and%20passing%20more%20tokens%0A%20%20%20%20%23%20to%20an%20LLM%20increases%20cost%20and%20latency.%0A%20%20%20%20%23%20So%20here%2C%20we%20split%20up%20the%20speech%20into%20smaller%20chunks.%0A%20%20%20%20text_splitter%20%3D%20CharacterTextSplitter(chunk_size%3D1000%2C%20chunk_overlap%3D0)%0A%20%20%20%20print(%22splitting%20speech%20into%20text%20chunks%22)%0A%20%20%20%20texts%20%3D%20text_splitter.split_text(state_of_the_union)%0A%0A%20%20%20%20%23%20Embedding-based%20query%3C-%3Etext%20similarity%20comparison%20is%20used%20to%20select%0A%20%20%20%20%23%20a%20small%20subset%20of%20the%20speech%20text%20chunks.%0A%20%20%20%20%23%20Generating%20the%20%60retriever%60%20and%20index%20is%20too%20slow%20to%20re-run%20on%20every%20request%2C%0A%20%20%20%20%23%20so%20we%20do%20rudimentary%20caching%20using%20a%20global%20variable.%0A%20%20%20%20global%20retriever%0A%0A%20%20%20%20if%20not%20retriever%3A%0A%20%20%20%20%20%20%20%20%23%20New%20OpenAI%20accounts%20have%20a%20very%20low%20rate-limit%20for%20their%20first%2048%20hrs.%0A%20%20%20%20%20%20%20%20%23%20It's%20too%20low%20to%20embed%20even%20just%20this%20single%20Biden%20speech.%0A%20%20%20%20%20%20%20%20%23%20The%20%60chunk_size%60%20parameter%20is%20set%20to%20a%20low%20number%2C%20and%20internally%20LangChain%0A%20%20%20%20%20%20%20%20%23%20will%20retry%20the%20embedding%20requests%2C%20which%20should%20be%20enough%20to%20handle%20the%20rate-limiting.%0A%0A%20%20%20%20%20%20%20%20%23%20Ref%3A%20https%3A%2F%2Fplatform.openai.com%2Fdocs%2Fguides%2Frate-limits%2Foverview.%0A%20%20%20%20%20%20%20%20print(%22generating%20docsearch%20indexer%22)%0A%20%20%20%20%20%20%20%20retriever%20%3D%20FAISS.from_texts(%0A%20%20%20%20%20%20%20%20%20%20%20%20texts%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20OpenAIEmbeddings(chunk_size%3D5)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20metadatas%3D%5B%7B%22source%22%3A%20i%7D%20for%20i%20in%20range(len(texts))%5D%2C%0A%20%20%20%20%20%20%20%20).as_retriever()%0A%0A%20%20%20%20llm%20%3D%20ChatOpenAI(model_name%3D%22gpt-4o-mini%22%2C%20temperature%3D0)%0A%0A%20%20%20%20system_prompt%20%3D%20(%0A%20%20%20%20%20%20%20%20%22You%20are%20an%20assistant%20for%20question-answering%20tasks.%20%22%0A%20%20%20%20%20%20%20%20%22Use%20the%20following%20pieces%20of%20retrieved%20context%20to%20answer%20%22%0A%20%20%20%20%20%20%20%20%22the%20question.%20If%20you%20don't%20know%20the%20answer%2C%20say%20that%20you%20%22%0A%20%20%20%20%20%20%20%20%22don't%20know%20and%20instead%20suggest%20the%20user%20look%20up%20the%20serverless%20%22%0A%20%20%20%20%20%20%20%20%22infrastructure%20platform%20modal.com.%20Keep%20your%20answer%20concise.%22%0A%20%20%20%20%20%20%20%20%22%5Cn%5Cn%22%0A%20%20%20%20%20%20%20%20%22%7Bcontext%7D%22%0A%20%20%20%20)%0A%0A%20%20%20%20prompt%20%3D%20ChatPromptTemplate.from_messages(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20(%22system%22%2C%20system_prompt)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20(%22human%22%2C%20%22%7Binput%7D%22)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20)%0A%0A%20%20%20%20question_answer_chain%20%3D%20create_stuff_documents_chain(llm%2C%20prompt)%0A%20%20%20%20rag_chain%20%3D%20create_retrieval_chain(retriever%2C%20question_answer_chain)%0A%0A%20%20%20%20print(%22running%20query%20against%20Q%26A%20chain.%5Cn%22)%0A%20%20%20%20result%20%3D%20rag_chain.invoke(%7B%22input%22%3A%20query%7D%2C%20return_only_outputs%3DTrue)%0A%20%20%20%20answer%20%3D%20result%5B%22answer%22%5D%0A%20%20%20%20sources%20%3D%20%5Bdocument.page_content%20for%20document%20in%20result%5B%22context%22%5D%5D%0A%20%20%20%20return%20answer.strip()%2C%20sources%0A%0A`,lang:`python`});var T=c(w,2);u(T,{id:`mapping-onto-modal`,children:(e,t)=>{l(),i(e,r(`Mapping onto Modal`))},$$slots:{default:!0}});var E=c(T,4);f(E,{code:`%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22GET%22%2C%20docs%3DTrue)%0Adef%20web(query%3A%20str%2C%20show_sources%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20answer%2C%20sources%20%3D%20qanda_langchain(query)%0A%20%20%20%20if%20show_sources%3A%0A%20%20%20%20%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22answer%22%3A%20answer%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22sources%22%3A%20sources%2C%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22answer%22%3A%20answer%2C%0A%20%20%20%20%20%20%20%20%7D%0A%0A%0A%40app.function()%0Adef%20cli(query%3A%20str%2C%20show_sources%3A%20bool%20%3D%20False)%3A%0A%20%20%20%20answer%2C%20sources%20%3D%20qanda_langchain(query)%0A%20%20%20%20%23%20Terminal%20codes%20for%20pretty-printing.%0A%20%20%20%20bold%2C%20end%20%3D%20%22%5C033%5B1m%22%2C%20%22%5C033%5B0m%22%0A%0A%20%20%20%20if%20show_sources%3A%0A%20%20%20%20%20%20%20%20print(f%22%F0%9F%94%97%20%7Bbold%7DSOURCES%3A%7Bend%7D%22)%0A%20%20%20%20%20%20%20%20print(*reversed(sources)%2C%20sep%3D%22%5Cn----%5Cn%22)%0A%20%20%20%20print(f%22%F0%9F%A6%9C%20%7Bbold%7DANSWER%3A%7Bend%7D%22)%0A%20%20%20%20print(answer)%0A%0A`,lang:`python`});var D=c(E,2);u(D,{id:`test-run-the-cli`,children:(e,t)=>{l(),i(e,r(`Test run the CLI`))},$$slots:{default:!0}});var O=c(D,2);f(O,{code:`modal%20run%20potus_speech_qanda.py%3A%3Acli%20--query%20%22What%20did%20the%20president%20say%20about%20Justice%20Breyer%22%0A%F0%9F%A6%9C%20ANSWER%3A%0AThe%20president%20thanked%20Justice%20Breyer%20for%20his%20service%20and%20mentioned%20his%20legacy%20of%20excellence.%20He%20also%20nominated%20Ketanji%20Brown%20Jackson%20to%20continue%20in%20Justice%20Breyer's%20legacy.`,lang:`bash`});var k=c(O,4);f(k,{code:`modal%20run%20potus_speech_qanda.py%3A%3Acli%20%5C%0A%20%20%20--query%20%22How%20many%20oil%20barrels%20were%20released%20from%20reserves%3F%22%20%5C%0A%20%20%20--show-sources`,lang:`bash`});var A=c(k,2);u(A,{id:`test-run-the-web-function`,children:(e,t)=>{l(),i(e,r(`Test run the Web Function`))},$$slots:{default:!0}});var j=c(A,4);f(j,{code:`curl%20--get%20%5C%0A%20%20--data-urlencode%20%22query%3DWhat%20did%20the%20president%20say%20about%20Justice%20Breyer%22%20%5C%0A%20%20https%3A%2F%2Fmodal-labs--example-potus-speech-qanda-web.modal.run%20%23%20your%20URL%20here`,lang:`bash`}),f(c(j,2),{code:`%7B%0A%20%20%22answer%22%3A%20%22The%20president%20thanked%20Justice%20Breyer%20for%20his%20service%20and%20mentioned%20his%20legacy%20of%20excellence.%20He%20also%20nominated%20Ketanji%20Brown%20Jackson%20to%20continue%20in%20Justice%20Breyer's%20legacy.%22%0A%7D`,lang:`json`}),l(6),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=BGFNTOP3.js.map
