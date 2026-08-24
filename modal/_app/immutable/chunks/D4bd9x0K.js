(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c1794e3e-e699-4975-9bdd-4b44b9dbc8f8`,e._sentryDebugIdIdentifier=`sentry-dbid-c1794e3e-e699-4975-9bdd-4b44b9dbc8f8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u,t as d}from"./JPsrybyr.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Top embedding models on the MTEB leaderboard`,description:`Overview of the top-ranking embedding models on the MTEB leaderboard`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-10-30T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Embedding Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is the MTEB leaderboard?`,id:`what-is-the-mteb-leaderboard`},{depth:2,value:`How to Choose a Model`,id:`how-to-choose-a-model`,children:[{depth:3,value:`Task Relevance`,id:`task-relevance`},{depth:3,value:`Computational Requirements`,id:`computational-requirements`},{depth:3,value:`Domain Relevance`,id:`domain-relevance`},{depth:3,value:`Licensing and Deployment`,id:`licensing-and-deployment`},{depth:3,value:`Evaluation of Your Data`,id:`evaluation-of-your-data`}]},{depth:2,value:`Top 6 Models on the MTEB Leaderboard`,id:`top-6-models-on-the-mteb-leaderboard`,children:[{depth:3,value:`1. Qwen3-Embedding-8B`,id:`1-qwen3-embedding-8b`},{depth:3,value:`2. llama-embed-nemotron-8b`,id:`2-llama-embed-nemotron-8b`},{depth:3,value:`3. bge-m3`,id:`3-bge-m3`},{depth:3,value:`4. stella_en_1.5B_v5`,id:`4-stella_en_15b_v5`},{depth:3,value:`5. embeddinggemma-300m`,id:`5-embeddinggemma-300m`}]},{depth:2,value:`Domain-Specific Embedding Models`,id:`domain-specific-embedding-models`},{depth:2,value:`Closing Thoughts`,id:`closing-thoughts`}],rawContent:`The Hugging Face [MTEB leaderboard](https://huggingface.co/spaces/mteb/leaderboard) has become a standard way to compare embedding models. But the rankings are volatile. New submissions constantly reshuffle the order, and the overall score often hides which models are actually strongest for a given task (i.e., classification, semantic similarity).

As a team building scalable and serverless AI infrastructure, we wanted to create a guide that helps cut through that noise. We’ll break down how to read MTEB scores, highlight which open-weight models stand out today, and show where domain-specific models like those tuned for finance or law deliver better results than general-purpose ones.

## What is the MTEB leaderboard?

The Massive Text Embedding Benchmark or MTEB evaluates models across eight categories:

1. Classification
2. Clustering
3. Pair classification
4. Reranking
5. Retrieval
6. Semantic textual similarity (STS)
7. Summarization
8. Bitext Mining

Each model gets a score for every category plus an overall average. The overall score is a useful headline number, but should not be thought of as the whole story.

For example, a model tuned for retrieval and semantic textual similarity (the two categories most correlated with production performance in RAG and search) may underperform on clustering or classification, which brings down the average. Conversely, a model that performs steadily across all tasks (but not exceptionally) can end up with a higher average while being weaker at retrieval.

In other words, the best overall model is not always the top choice for _your_ workload. A team that builds retrieval pipelines _should_ focus on retrieval and semantic textual similarity over the global average.

The next section goes over the factors that matter most when choosing a model.

## How to Choose a Model

Selecting an embedding model should be driven by context. The following factors matter far more than what the leaderboard highlights.

### Task Relevance

Not all models are trained with the same end use case in mind. A model that clusters documents cleanly might fail miserably at ranking passages for retrieval, and a model that excels at pair classification could still struggle when used for unsupervised grouping.

The danger of relying on the overall score is that it blends these strengths and weaknesses, which conceals the trade-offs that matter in practice. By aligning model choice with the category that matches your workload, you give the embeddings the best chance of capturing the relevant information.

The table below shows which factors are most important across different MTEB task categories and how they map to common use cases.

| **Task Category**                 | **What Matters Most for Models**                                        | **Example Use Cases**                                                      |
| --------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Classification                    | Discriminative features, stable margins between classes                 | Sentiment analysis, spam detection, topic tagging                          |
| Clustering                        | Global structure, ability to group related items without labels         | Customer segmentation, document deduplication, theme discovery             |
| Pair classification               | Capturing entailment and contradiction relationships                    | Duplicate bug reports, Q&A pair matching, natural language inference (NLI) |
| Reranking                         | Sensitivity to fine differences in candidate orderings                  | Search pipelines with candidate filtering before cross-encoder re-ranking  |
| Retrieval                         | Fine-grained semantic similarity, context handling, ranking consistency | RAG, semantic search, question answering                                   |
| Semantic textual similarity (STS) | Sentence-level meaning preservation, robust to phrasing variations      | Duplicate detection, paraphrase identification                             |
| Summarization                     | Preserving long-form semantics, capturing discourse-level relationships | Abstractive QA pipelines, document summarization, report generation        |

### Computational Requirements

Larger models often produce higher-quality embeddings. However, that quality comes with higher costs in the form of GPU memory, slower inference, and infrastructure expenses.

Smaller models, especially those with compression techniques like [Matryoshka representation learning](https://huggingface.co/blog/matryoshka), can offer a better balance. By producing embeddings at multiple dimensionalities, they allow teams to trade vector size for speed and memory savings (without having to retrain from scratch).

For workloads constrained by hardware or operating over very large indexes, it’s worth weighing model size and throughput first, before worrying about a gap on the leaderboard.

### Domain Relevance

![domain embed diagram](https://modal-cdn.com/blog/images/domain-embed-diagram.png)

When the workload involves specialized languages like biomedical text, financial filings, or source code, domain-specific models almost always outperform general-purpose ones.

The reason is simple. They are fine-tuned on terminology, structures, and conventions that generalist models can’t capture. A biomedical model will understand MeSH terms and clinical shorthand. A code model will encode syntax into its responses.

General-purpose embeddings are strong baselines, but when accuracy in a specific domain is a goal, in-domain training is the only way to deliver truly relevant results.

### Licensing and Deployment

Not all open-weight models can be used commercially. Some are released under research-only licenses (i.e., CC-BY-NC-4.0) while others are available under permissive licenses (i.e., Apache 2.0).

Similarly, deployment constraints can also vary. Some models are designed for GPU inference at scale, while others are optimized for CPU environments or variable embedding dimensions to fit tighter hardware budgets.

Before embedding sensitive data, verify both the license terms and the deployment requirements of the model you’re choosing.

### Evaluation of Your Data

No benchmark can fully capture the nuances of a specific dataset. Document style, query phrasing, and domain vocabulary all interact in ways that shape retrieval quality. The MTEB leaderboards are a solid starting point, but the decisive factor should always be how a model performs on _your_ corpus.

Running small-scale evaluations with metrics like Mean Reciprocal Rank (MRR) and NDCG provides real data on how a model fits your use case. These metrics reveal not only if a model retrieves the right documents, but also whether it can consistently do so.

With these factors in mind, we can now look at the models that consistently performed well in the MTEB leaderboard as of 2025.

## Top 6 Models on the MTEB Leaderboard

As of 2025, here are some of the top open-weight models on the MTEB leaderboard and their backgrounds.

### 1. [Qwen3-Embedding-8B](https://huggingface.co/Qwen/Qwen3-Embedding-8B)

**What is it?**

The largest of a family of new embedding models built on top of Qwen3. Also available in 4B and 0.6B. Outperforms the previous generation of Qwen embedding models (i.e. gte-Qwen2-7B-instruct) on MTEB benchmarks. It ranks high on both the multi-lingual and English-only MTEB leaderboards.

**What is its license?**

Apache-2.0 (commercial use permitted).

**Who should use it?**

Teams that require strong multi-lingual support or state-of-the-art performance on retrieval, classification, or semantic similarity tasks. The model is particularly strong at long-text understanding.

**What are the trade-offs?**

VRAM-heavy at 8B parameters and therefore more costly and slow to run. However, smaller versions with 4B and 0.6B parameters exist.

### 2. [llama-embed-nemotron-8b](https://huggingface.co/nvidia/llama-embed-nemotron-8b)

**What is it?**

Released in October 2025, this is the latest embedding model from NVIDIA. It is fine-tuned from Llama-3.1-8B and is particularly powerful at understanding multilingual text.

**What is its license?**

Customized-nscl-v1 (non-commercial only).

**Who should use it?**

Researchers building applications that need text understanding, especially multilingual RAG systems.

**What are the trade-offs?**

It cannot be used commercially.

### 3. [bge-m3](https://huggingface.co/BAAI/bge-m3)

**What is it?**

A versatile text embedding model released in 2024 by the Beijing Academy of Artificial Intelligence (BAAI). It is multilingual, supports long inputs, and supports multiple retrieval methods (dense, sparse, multi-vector).

**What is its license?**

MIT License (also permissive for commercial use).

**Who should use it?**

Teams that want a production-ready, open-weight model for retrieval/search pipelines.

**What are the trade-offs?**

Since this model was released in 2024, there may be newer models that have better performance for your tasks.

### 4. [stella_en_1.5B_v5](https://huggingface.co/dunzhang/stella_en_1.5B_v5)

**What is it?**

A compact, English-only embedding model (~1.5B parameters) built on top of the\xA0\`Alibaba-NLP/gte-large-en-v1.5\`\xA0and\xA0\`Alibaba-NLP/gte-Qwen2-1.5B-instruct\`\xA0models. It produces 1,024-d embeddings by default, but supports Matryoshka for other dimensions.

**What is its license?**

MIT License.

**Who should use it?**

Teams with limited GPU resources or CPU-only environments that still need strong English retrieval.

**What are the trade-offs?**

Not being multilingual and having a smaller capacity means it lags behind 7B models in raw accuracy.

### 5. [embeddinggemma-300m](https://huggingface.co/google/embeddinggemma-300m)

**What is it?**

A 300M-parameter open embedding model from Google, built on Gemma 3 and T5Gemma, designed for search, retrieval, and semantic similarity across 100+ languages. Its smaller size makes it suitable for resource-limited hardware like phones or laptops.

**What is its license?**

Apache-2.0.

**Who should use it?**

Companies who want to balance cost and performance.

**What are the tradeoffs?**

The smaller size of this model means that it will be less accurate than the largest state-of-the-art embedding models.

## Domain-Specific Embedding Models

While the MTEB leaderboard is dominated by general-purpose models, specialized domains benefit from embeddings tuned on in-domain corpora. Here are some of the top ones.

- **Medicine**:\xA0[PubMedBERT](https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext)\xA0is fine-tuned on medical literature and clinical notes, making it well-suited for tasks in healthcare and biomedical research. Additionally,\xA0[BioLORD](https://huggingface.co/FremyCompany/BioLORD-2023)\xA0is another model tailored for similar applications.
- **Finance**:\xA0[Finance Embeddings from Investopedia](https://huggingface.co/FinLang/finance-embeddings-investopedia),\xA0[Voyage Finance](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/), and\xA0[BGE Base Financial Matryoshka](https://huggingface.co/philschmid/bge-base-financial-matryoshka)\xA0are examples of models fine-tuned on financial datasets, offering improved performance for tasks such as sentiment analysis of financial news or SEC filings.
- **Law**: For legal applications, consider exploring the\xA0[Domain-Specific Embeddings and Retrieval: Legal Edition](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/), which discusses models fine-tuned on legal documents, enhancing their utility for legal research, contract analysis, and other law-related NLP tasks.
- **Code**:\xA0[CodeBERT](https://huggingface.co/microsoft/codebert-base)\xA0and\xA0[GraphCodeBERT](https://huggingface.co/microsoft/graphcodebert-base)\xA0are designed specifically for programming language understanding, making them useful for code search, code completion, and bug detection tasks.
- **Math**:\xA0[Math Similarity Model](https://huggingface.co/math-similarity/Bert-MLM_arXiv-MP-class_zbMath)\xA0is tailored for formula-aware embeddings and captures mathematical structure in LaTeX (or other symbolic formats). This can be useful for research search engines and technical Q&A systems.
- **Language-Specific**: Beyond English, strong monolingual models exist, such as [RoSEtta-base-ja](https://huggingface.co/pkshatech/RoSEtta-base-ja) (Japanese), [KoSimCSE-roberta](https://huggingface.co/BM-K/KoSimCSE-roberta) (Korean), [GTE-Qwen2-7B-instruct](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct) (Chinese), [Sentence-Camembert-large](https://huggingface.co/dangvantuan/sentence-camembert-large) (French), and [Arabic-STS-Matryoshka](https://huggingface.co/omarelshehy/Arabic-STS-Matryoshka) (Arabic).

## Closing Thoughts

The MTEB leaderboard has grown into the most comprehensive benchmark for models, covering classification, clustering, retrieval, and more. Its overall score is a useful signal, but production systems succeed when engineers look deeper. Which tasks matter? What cost constraints do you have? Does it make sense to look into a domain-specific model? The right approach is to use MTEB to narrow your options, and then benchmark on your own dataset.

Looking for an easy way to deploy open-source text embedding models on GPUs? Check out Modal’s text embedding tutorial [here](/docs/examples/amazon_embeddings).
`,meta:{description:`Overview of the top-ranking embedding models on the MTEB leaderboard`}},{title:h,description:g,authors:_,date:v,length:y,category:b,subcategory:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=m,D=t(`<thead><tr><th><strong>Task Category</strong></th><th><strong>What Matters Most for Models</strong></th><th><strong>Example Use Cases</strong></th></tr></thead> <tbody><tr><td>Classification</td><td>Discriminative features, stable margins between classes</td><td>Sentiment analysis, spam detection, topic tagging</td></tr><tr><td>Clustering</td><td>Global structure, ability to group related items without labels</td><td>Customer segmentation, document deduplication, theme discovery</td></tr><tr><td>Pair classification</td><td>Capturing entailment and contradiction relationships</td><td>Duplicate bug reports, Q&A pair matching, natural language inference (NLI)</td></tr><tr><td>Reranking</td><td>Sensitivity to fine differences in candidate orderings</td><td>Search pipelines with candidate filtering before cross-encoder re-ranking</td></tr><tr><td>Retrieval</td><td>Fine-grained semantic similarity, context handling, ranking consistency</td><td>RAG, semantic search, question answering</td></tr><tr><td>Semantic textual similarity (STS)</td><td>Sentence-level meaning preservation, robust to phrasing variations</td><td>Duplicate detection, paraphrase identification</td></tr><tr><td>Summarization</td><td>Preserving long-form semantics, capturing discourse-level relationships</td><td>Abstractive QA pipelines, document summarization, report generation</td></tr></tbody>`,1),O=t(`<p>The Hugging Face <!> has become a standard way to compare embedding models. But the rankings are volatile. New submissions constantly reshuffle the order, and the overall score often hides which models are actually strongest for a given task (i.e., classification, semantic similarity).</p> <p>As a team building scalable and serverless AI infrastructure, we wanted to create a guide that helps cut through that noise. We’ll break down how to read MTEB scores, highlight which open-weight models stand out today, and show where domain-specific models like those tuned for finance or law deliver better results than general-purpose ones.</p> <h2 id="what-is-the-mteb-leaderboard">What is the MTEB leaderboard?</h2> <p>The Massive Text Embedding Benchmark or MTEB evaluates models across eight categories:</p> <ol><li>Classification</li> <li>Clustering</li> <li>Pair classification</li> <li>Reranking</li> <li>Retrieval</li> <li>Semantic textual similarity (STS)</li> <li>Summarization</li> <li>Bitext Mining</li></ol> <p>Each model gets a score for every category plus an overall average. The overall score is a useful headline number, but should not be thought of as the whole story.</p> <p>For example, a model tuned for retrieval and semantic textual similarity (the two categories most correlated with production performance in RAG and search) may underperform on clustering or classification, which brings down the average. Conversely, a model that performs steadily across all tasks (but not exceptionally) can end up with a higher average while being weaker at retrieval.</p> <p>In other words, the best overall model is not always the top choice for <em>your</em> workload. A team that builds retrieval pipelines <em>should</em> focus on retrieval and semantic textual similarity over the global average.</p> <p>The next section goes over the factors that matter most when choosing a model.</p> <h2 id="how-to-choose-a-model">How to Choose a Model</h2> <p>Selecting an embedding model should be driven by context. The following factors matter far more than what the leaderboard highlights.</p> <h3 id="task-relevance">Task Relevance</h3> <p>Not all models are trained with the same end use case in mind. A model that clusters documents cleanly might fail miserably at ranking passages for retrieval, and a model that excels at pair classification could still struggle when used for unsupervised grouping.</p> <p>The danger of relying on the overall score is that it blends these strengths and weaknesses, which conceals the trade-offs that matter in practice. By aligning model choice with the category that matches your workload, you give the embeddings the best chance of capturing the relevant information.</p> <p>The table below shows which factors are most important across different MTEB task categories and how they map to common use cases.</p> <!> <h3 id="computational-requirements">Computational Requirements</h3> <p>Larger models often produce higher-quality embeddings. However, that quality comes with higher costs in the form of GPU memory, slower inference, and infrastructure expenses.</p> <p>Smaller models, especially those with compression techniques like <!>, can offer a better balance. By producing embeddings at multiple dimensionalities, they allow teams to trade vector size for speed and memory savings (without having to retrain from scratch).</p> <p>For workloads constrained by hardware or operating over very large indexes, it’s worth weighing model size and throughput first, before worrying about a gap on the leaderboard.</p> <h3 id="domain-relevance">Domain Relevance</h3> <p><!></p> <p>When the workload involves specialized languages like biomedical text, financial filings, or source code, domain-specific models almost always outperform general-purpose ones.</p> <p>The reason is simple. They are fine-tuned on terminology, structures, and conventions that generalist models can’t capture. A biomedical model will understand MeSH terms and clinical shorthand. A code model will encode syntax into its responses.</p> <p>General-purpose embeddings are strong baselines, but when accuracy in a specific domain is a goal, in-domain training is the only way to deliver truly relevant results.</p> <h3 id="licensing-and-deployment">Licensing and Deployment</h3> <p>Not all open-weight models can be used commercially. Some are released under research-only licenses (i.e., CC-BY-NC-4.0) while others are available under permissive licenses (i.e., Apache 2.0).</p> <p>Similarly, deployment constraints can also vary. Some models are designed for GPU inference at scale, while others are optimized for CPU environments or variable embedding dimensions to fit tighter hardware budgets.</p> <p>Before embedding sensitive data, verify both the license terms and the deployment requirements of the model you’re choosing.</p> <h3 id="evaluation-of-your-data">Evaluation of Your Data</h3> <p>No benchmark can fully capture the nuances of a specific dataset. Document style, query phrasing, and domain vocabulary all interact in ways that shape retrieval quality. The MTEB leaderboards are a solid starting point, but the decisive factor should always be how a model performs on <em>your</em> corpus.</p> <p>Running small-scale evaluations with metrics like Mean Reciprocal Rank (MRR) and NDCG provides real data on how a model fits your use case. These metrics reveal not only if a model retrieves the right documents, but also whether it can consistently do so.</p> <p>With these factors in mind, we can now look at the models that consistently performed well in the MTEB leaderboard as of 2025.</p> <h2 id="top-6-models-on-the-mteb-leaderboard">Top 6 Models on the MTEB Leaderboard</h2> <p>As of 2025, here are some of the top open-weight models on the MTEB leaderboard and their backgrounds.</p> <h3 id="1-qwen3-embedding-8b">1. <!></h3> <p><strong>What is it?</strong></p> <p>The largest of a family of new embedding models built on top of Qwen3. Also available in 4B and 0.6B. Outperforms the previous generation of Qwen embedding models (i.e. gte-Qwen2-7B-instruct) on MTEB benchmarks. It ranks high on both the multi-lingual and English-only MTEB leaderboards.</p> <p><strong>What is its license?</strong></p> <p>Apache-2.0 (commercial use permitted).</p> <p><strong>Who should use it?</strong></p> <p>Teams that require strong multi-lingual support or state-of-the-art performance on retrieval, classification, or semantic similarity tasks. The model is particularly strong at long-text understanding.</p> <p><strong>What are the trade-offs?</strong></p> <p>VRAM-heavy at 8B parameters and therefore more costly and slow to run. However, smaller versions with 4B and 0.6B parameters exist.</p> <h3 id="2-llama-embed-nemotron-8b">2. <!></h3> <p><strong>What is it?</strong></p> <p>Released in October 2025, this is the latest embedding model from NVIDIA. It is fine-tuned from Llama-3.1-8B and is particularly powerful at understanding multilingual text.</p> <p><strong>What is its license?</strong></p> <p>Customized-nscl-v1 (non-commercial only).</p> <p><strong>Who should use it?</strong></p> <p>Researchers building applications that need text understanding, especially multilingual RAG systems.</p> <p><strong>What are the trade-offs?</strong></p> <p>It cannot be used commercially.</p> <h3 id="3-bge-m3">3. <!></h3> <p><strong>What is it?</strong></p> <p>A versatile text embedding model released in 2024 by the Beijing Academy of Artificial Intelligence (BAAI). It is multilingual, supports long inputs, and supports multiple retrieval methods (dense, sparse, multi-vector).</p> <p><strong>What is its license?</strong></p> <p>MIT License (also permissive for commercial use).</p> <p><strong>Who should use it?</strong></p> <p>Teams that want a production-ready, open-weight model for retrieval/search pipelines.</p> <p><strong>What are the trade-offs?</strong></p> <p>Since this model was released in 2024, there may be newer models that have better performance for your tasks.</p> <h3 id="4-stella_en_15b_v5">4. <!></h3> <p><strong>What is it?</strong></p> <p>A compact, English-only embedding model (~1.5B parameters) built on top of the\xA0<code>Alibaba-NLP/gte-large-en-v1.5</code>\xA0and\xA0<code>Alibaba-NLP/gte-Qwen2-1.5B-instruct</code>\xA0models. It produces 1,024-d embeddings by default, but supports Matryoshka for other dimensions.</p> <p><strong>What is its license?</strong></p> <p>MIT License.</p> <p><strong>Who should use it?</strong></p> <p>Teams with limited GPU resources or CPU-only environments that still need strong English retrieval.</p> <p><strong>What are the trade-offs?</strong></p> <p>Not being multilingual and having a smaller capacity means it lags behind 7B models in raw accuracy.</p> <h3 id="5-embeddinggemma-300m">5. <!></h3> <p><strong>What is it?</strong></p> <p>A 300M-parameter open embedding model from Google, built on Gemma 3 and T5Gemma, designed for search, retrieval, and semantic similarity across 100+ languages. Its smaller size makes it suitable for resource-limited hardware like phones or laptops.</p> <p><strong>What is its license?</strong></p> <p>Apache-2.0.</p> <p><strong>Who should use it?</strong></p> <p>Companies who want to balance cost and performance.</p> <p><strong>What are the tradeoffs?</strong></p> <p>The smaller size of this model means that it will be less accurate than the largest state-of-the-art embedding models.</p> <h2 id="domain-specific-embedding-models">Domain-Specific Embedding Models</h2> <p>While the MTEB leaderboard is dominated by general-purpose models, specialized domains benefit from embeddings tuned on in-domain corpora. Here are some of the top ones.</p> <ul><li><strong>Medicine</strong>:\xA0<!>\xA0is fine-tuned on medical literature and clinical notes, making it well-suited for tasks in healthcare and biomedical research. Additionally,\xA0<!>\xA0is another model tailored for similar applications.</li> <li><strong>Finance</strong>:\xA0<!>,\xA0<!>, and\xA0<!>\xA0are examples of models fine-tuned on financial datasets, offering improved performance for tasks such as sentiment analysis of financial news or SEC filings.</li> <li><strong>Law</strong>: For legal applications, consider exploring the\xA0<!>, which discusses models fine-tuned on legal documents, enhancing their utility for legal research, contract analysis, and other law-related NLP tasks.</li> <li><strong>Code</strong>:\xA0<!>\xA0and\xA0<!>\xA0are designed specifically for programming language understanding, making them useful for code search, code completion, and bug detection tasks.</li> <li><strong>Math</strong>:\xA0<!>\xA0is tailored for formula-aware embeddings and captures mathematical structure in LaTeX (or other symbolic formats). This can be useful for research search engines and technical Q&A systems.</li> <li><strong>Language-Specific</strong>: Beyond English, strong monolingual models exist, such as <!> (Japanese), <!> (Korean), <!> (Chinese), <!> (French), and <!> (Arabic).</li></ul> <h2 id="closing-thoughts">Closing Thoughts</h2> <p>The MTEB leaderboard has grown into the most comprehensive benchmark for models, covering classification, clustering, retrieval, and more. Its overall score is a useful signal, but production systems succeed when engineers look deeper. Which tasks matter? What cost constraints do you have? Does it make sense to look into a domain-specific model? The right approach is to use MTEB to narrow your options, and then benchmark on your own dataset.</p> <p>Looking for an easy way to deploy open-source text embedding models on GPUs? Check out Modal’s text embedding tutorial <!>.</p>`,1);function k(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=O(),p=s(o);f(c(e(p)),{href:`https://huggingface.co/spaces/mteb/leaderboard`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`MTEB leaderboard`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,30);u(m,{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}});var h=c(m,6);f(c(e(h)),{href:`https://huggingface.co/blog/matryoshka`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Matryoshka representation learning`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,6);d(e(g),{src:`https://modal-cdn.com/blog/images/domain-embed-diagram.png`,alt:`domain embed diagram`}),n(g);var _=c(g,28);f(c(e(_)),{href:`https://huggingface.co/Qwen/Qwen3-Embedding-8B`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Qwen3-Embedding-8B`))},$$slots:{default:!0}}),n(_);var v=c(_,18);f(c(e(v)),{href:`https://huggingface.co/nvidia/llama-embed-nemotron-8b`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`llama-embed-nemotron-8b`))},$$slots:{default:!0}}),n(v);var y=c(v,18);f(c(e(y)),{href:`https://huggingface.co/BAAI/bge-m3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`bge-m3`))},$$slots:{default:!0}}),n(y);var b=c(y,18);f(c(e(b)),{href:`https://huggingface.co/dunzhang/stella_en_1.5B_v5`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`stella_en_1.5B_v5`))},$$slots:{default:!0}}),n(b);var x=c(b,18);f(c(e(x)),{href:`https://huggingface.co/google/embeddinggemma-300m`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`embeddinggemma-300m`))},$$slots:{default:!0}}),n(x);var S=c(x,22),C=e(S),w=c(e(C),2);f(w,{href:`https://huggingface.co/microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`PubMedBERT`))},$$slots:{default:!0}}),f(c(w,2),{href:`https://huggingface.co/FremyCompany/BioLORD-2023`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`BioLORD`))},$$slots:{default:!0}}),l(),n(C);var T=c(C,2),E=c(e(T),2);f(E,{href:`https://huggingface.co/FinLang/finance-embeddings-investopedia`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Finance Embeddings from Investopedia`))},$$slots:{default:!0}});var k=c(E,2);f(k,{href:`https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Voyage Finance`))},$$slots:{default:!0}}),f(c(k,2),{href:`https://huggingface.co/philschmid/bge-base-financial-matryoshka`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`BGE Base Financial Matryoshka`))},$$slots:{default:!0}}),l(),n(T);var A=c(T,2);f(c(e(A),2),{href:`https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Domain-Specific Embeddings and Retrieval: Legal Edition`))},$$slots:{default:!0}}),l(),n(A);var j=c(A,2),M=c(e(j),2);f(M,{href:`https://huggingface.co/microsoft/codebert-base`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`CodeBERT`))},$$slots:{default:!0}}),f(c(M,2),{href:`https://huggingface.co/microsoft/graphcodebert-base`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GraphCodeBERT`))},$$slots:{default:!0}}),l(),n(j);var N=c(j,2);f(c(e(N),2),{href:`https://huggingface.co/math-similarity/Bert-MLM_arXiv-MP-class_zbMath`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Math Similarity Model`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2),F=c(e(P),2);f(F,{href:`https://huggingface.co/pkshatech/RoSEtta-base-ja`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RoSEtta-base-ja`))},$$slots:{default:!0}});var I=c(F,2);f(I,{href:`https://huggingface.co/BM-K/KoSimCSE-roberta`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`KoSimCSE-roberta`))},$$slots:{default:!0}});var L=c(I,2);f(L,{href:`https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GTE-Qwen2-7B-instruct`))},$$slots:{default:!0}});var R=c(L,2);f(R,{href:`https://huggingface.co/dangvantuan/sentence-camembert-large`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sentence-Camembert-large`))},$$slots:{default:!0}}),f(c(R,2),{href:`https://huggingface.co/omarelshehy/Arabic-STS-Matryoshka`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Arabic-STS-Matryoshka`))},$$slots:{default:!0}}),l(),n(P),n(S);var z=c(S,6);f(c(e(z)),{href:`/docs/examples/amazon_embeddings`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(z),i(t,o)},$$slots:{default:!0}}))}export{k as default,m as metadata};
//# sourceMappingURL=D4bd9x0K.js.map
