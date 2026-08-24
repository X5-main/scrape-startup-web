(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1325629e-408f-43ca-918f-3e9b481564a3`,e._sentryDebugIdIdentifier=`sentry-dbid-1325629e-408f-43ca-918f-3e9b481564a3`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`8 Top Open-Source OCR Models Compared: A Complete Guide`,description:`Compare the best open-source OCR models for document processing, including traditional ML and LLM-based approaches`,date:`2025-03-31T12:00:00.000Z`,length:`12 minute read`,category:`Article`,subcategory:`Image and Video Models`,published:!0,layout:`blog`,toc:[{depth:2,value:`Traditional ML vs LLM-Based OCR`,id:`traditional-ml-vs-llm-based-ocr`},{depth:2,value:`Traditional ML-Based OCR Models`,id:`traditional-ml-based-ocr-models`,children:[{depth:3,value:`PaddleOCR`,id:`paddleocr`,children:[{depth:4,value:`Key Features`,id:`key-features`},{depth:4,value:`Best For`,id:`best-for`},{depth:4,value:`Limits`,id:`limits`}]},{depth:3,value:`Tesseract`,id:`tesseract`,children:[{depth:4,value:`Key Features`,id:`key-features-1`},{depth:4,value:`Best For`,id:`best-for-1`},{depth:4,value:`Limits`,id:`limits-1`}]}]},{depth:2,value:`LLM-Based OCR Models`,id:`llm-based-ocr-models`,children:[{depth:3,value:`Datalab Marker`,id:`datalab-marker`,children:[{depth:4,value:`Key Features`,id:`key-features-2`},{depth:4,value:`Best For`,id:`best-for-2`},{depth:4,value:`Limits`,id:`limits-2`}]},{depth:3,value:`DeepSeek-OCR`,id:`deepseek-ocr`,children:[{depth:4,value:`Key Features`,id:`key-features-3`},{depth:4,value:`Best For`,id:`best-for-3`},{depth:4,value:`Limits`,id:`limits-3`}]},{depth:3,value:`GOT-OCR 2.0`,id:`got-ocr-20`,children:[{depth:4,value:`Key Features`,id:`key-features-4`},{depth:4,value:`Best For`,id:`best-for-4`},{depth:4,value:`Limits`,id:`limits-4`}]},{depth:3,value:`Qwen2.5-VL`,id:`qwen25-vl`,children:[{depth:4,value:`Key Features`,id:`key-features-5`},{depth:4,value:`Best For`,id:`best-for-5`},{depth:4,value:`Limits`,id:`limits-5`}]},{depth:3,value:`InternVL 2.5`,id:`internvl-25`,children:[{depth:4,value:`Key Features`,id:`key-features-6`},{depth:4,value:`Best For`,id:`best-for-6`},{depth:4,value:`Limits`,id:`limits-6`}]},{depth:3,value:`RolmOCR`,id:`rolmocr`,children:[{depth:4,value:`Key Features`,id:`key-features-7`},{depth:4,value:`Best For`,id:`best-for-7`},{depth:4,value:`Limits`,id:`limits-7`}]}]},{depth:2,value:`Running OCR Models at Scale`,id:`running-ocr-models-at-scale`}],rawContent:`_Updated: 2025-11-05_

Despite being one of the oldest applied areas in machine learning, Optical Character Recognition (OCR) hasn’t faded into the background. Today, the reality is that large volumes of information are still locked in scanned PDFs and other textual archives. Teams continue to depend on OCR to turn those into searchable, structured data that can drive workflows.

Put simply, the demands have not gone away. Instead, they’ve multiplied:

- **Compliance**: Financial, healthcare, and government records often can’t leave controlled infrastructure because of HIPAA, GDPR, or other regulatory guardrails.
- **Digitization**: Enterprises are still scanning books, contracts, and historical archives that live on the web at scale.
- **Process Automation**: Invoices, KYC documents, and shipping labels flow through OCR pipelines to avoid manual entry.
- **Knowledge Extraction**: Users mine PDFs (and other documents) for insights without having to read line by line.
- **Accessibility**: Screen readers and translation tools use OCR to produce text inside images.

Hosted APIs such as [Azure Computer Vision](https://azure.microsoft.com/products/ai-services/ai-vision)\xA0and\xA0[Mistral OCR](https://mistral.ai/solutions/document-ai) cover many of these needs, but they route sensitive documents through vendor infrastructure and often bill per page (or per token). For teams facing strict compliance rules and cost ceilings or need tight operational control, self-hosted open-source OCR models remain the most viable option.

This brings us to the models themselves. In 2025, open-source OCR spans two broad approaches: traditional ML engines designed for text recognition and multimodal LLMs that treat OCR as part of broader visual understanding.

In this first section, we will go over each approach to show how they differ. Later, we will list our top open-source OCR models and directly compare each one. Here's a brief overview:

| Model                             | License                   | Key Features                                                                  | Best For                                                          | Limits                                                    |
| --------------------------------- | ------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| [PaddleOCR](#paddleocr)           | Apache-2.0                | Multilingual OCR, handwriting + layout, PP-StructureV3 tables + reading order | Structured documents, invoices, multilingual enterprise use       | Requires tuning; optimal accuracy needs GPU               |
| [Tesseract](#tesseract)           | Apache-2.0                | CPU-first, 100+ languages, mature ecosystem                                   | Bulk printed text, digitization pipelines                         | Weak on handwriting and layouts; GPU support experimental |
| [Datalab Marker](#datalab-marker) | OpenRAIL                  | End-to-end OCR → Markdown/JSON, Surya backend, optional LLM post-processing   | Digitization + RAG pipelines, scalable GPU workloads (e.g. Modal) | LLM mode adds latency + cost; depends on Surya accuracy   |
| [DeepSeek-OCR](#deepseek-ocr)     | MIT                       | End-to-end OCR-free transformer (text, charts, formulas)                      | Large-scale GPU OCR, high-throughput pipelines                    | Occasional hallucinations; GPU-only practical             |
| [GOT-OCR 2.0](#got-ocr-20)        | MIT                       | Vision-language OCR with grounding (boxes + points)                           | Mixed visual/text docs, scientific papers + slides                | High GPU load; limited layout customization               |
| [Qwen2.5-VL](#qwen25-vl)          | Apache-2.0 / Qwen license | Multi modal OCR, grounding (boxes, points), high benchmark scores             | Complex layouts, charts, scientific docs                          | Heavy VRAM needs; license varies by checkpoint            |
| [InternVL 2.5](#internvl-25)      | MIT (for select variants) | Multimodal doc understanding, 1B–78B sizes, high DocVQA scores                | General OCR + reasoning, PDF summarization + charts               | Large models demand GPUs; small ones need prompt tuning   |
| [RolmOCR (Reducto)](#rolmocr)     | Apache-2.0                | Qwen 2.5-VL 7B fine-tune, low-VRAM OCR, fast inference                        | Lightweight OCR deployments, on-prem or GPU-limited setups        | No bounding boxes; limited layout awareness               |

## Traditional ML vs LLM-Based OCR

Traditional OCR engines are purpose-built for text extraction. Using specialized computer vision architectures, they detect regions, recognize characters, and then return outputs with confidence scores. These pipelines are tuned for efficiency. They run well on CPUs and can handle large batches of data predictably.

LLM-based models have a different approach. They treat OCR as part of a broader visual-language problem. Text extraction is fused with layout reasoning and question answering. So instead of only producing raw characters, they can output structured JSON or interpret a diagram. As expected, this can lead to higher GPU costs, larger memory requirements, and more variable latency.

Generally speaking, you should start with more traditional OCR models, which are fast, cheap, and often very accurate, even for structured data like tables (you may need to fiddle around with some configuration options). For complex diagrams or other tricky use cases, you may need to use an LLM-based OCR model (but keep in mind the higher latency/cost).

Now that we know the differences, let’s take a look at some of the top OCR models.

## Traditional ML-Based OCR Models

### PaddleOCR

[PaddleOCR](https://github.com/paddlepaddle/paddle), developed by the PaddlePaddle team, remains one of the most advanced OCR toolkits.

#### Key Features

- High accuracy on Chinese, English, and multilingual text
- PP-StructureV3 for table recognition, formulas, and handwriting
- Deployable across CUDA 12, ONNX Runtime, and Windows environments
- Official Docker images for GPU deployment
- Apache-2.0 license

#### Best For

PaddleOCR’s advanced features are needed for complex, structured documents where simple character recognition is not enough. It is particularly effective for workflows like invoices, where both text and layout extraction is required. Also, its strong performance in Chinese and English is great for enterprise environments operating across multilingual datasets.

#### Limits

With all of these advanced capabilities comes added complexity. PaddleOCR requires more configuration and tuning than lighter libraries. Achieving top performance generally means running on GPUs.

### **Tesseract**

[Tesseract](https://github.com/tesseract-ocr/tesseract) is the most established open-source OCR engine. It was originally developed by Hewlett-Packard and later maintained by Google. While primarily CPU-based, experimental GPU/OpenCL support exists but is not considered production-ready.

#### Key Features

- Support for over 100 languages
- LSTM-based neural recognition since v4
- Mature ecosystem, community support, and integration libraries
- Apache-2.0 license

#### Best For

Tesseract is well-suited for high-volume processing of printed text, especially in large scanned archives. Its CPU-first design makes it reliable for deployments where GPUs are unavailable (or too expensive).

#### Limits

Tesseract struggles with handling handwriting, complex layouts, and structured data such as tables. These gaps require post-processing layers, and GPU support remains limited.

## **LLM-Based OCR Models**

### Datalab Marker

[Datalab Marker](https://github.com/datalab-to/marker) is a full end-to-end OCR pipeline that converts PDFs and images into structured formats (i.e., JSON, Markdown, HTML). It builds on Surya (developed by Datalab) as its core recognition engine and adds deterministic layout parsing for tables, equations, and code blocks.

#### Key Features

- Converts scanned documents directly into Markdown, JSON, or HTML
- Built on Surya for OCR and layout detection
- Handles tables, equations, code, and multi-column layouts
- Optional \`-use_llm\` flag adds language-model refinement for structure and error correction
- Runs efficiently on CPUs or GPUs and is container-friendly
- OpenRAIL License

#### Best For

Marker is best for teams that want to turn unstructured document data into formats that are easily read by machines without having to build a pipeline from scratch. It’s great for digitization workflows and knowledge pipelines since the end goal is structured outputs. Also, Marker’s design makes it a strong fit for [serverless GPU platforms like Modal](https://modal.com/docs/examples/doc_ocr_jobs), where it can scale automatically based on job volume.

#### Limits

Since Marker relies on Surya as its OCR backbone, its core text recognition accuracy mirrors Surya’s performance. The optional LLM enhancement does make a big difference in output fidelity, but adds latency and cost. As with any multi-stage pipeline, the key is to find the right balance between OCR and LLM to achieve a sustainable throughput.

### **DeepSeek-OCR**

[DeepSeek-OCR](https://github.com/deepseek-ai/DeepSeek-OCR) is a new generation open-source model that integrates optical character recognition into a multimodal transformer framework. Its design uses an innovative token compression mechanism to reduce the number of visual tokens required for inference. The result is a faster, more memory-efficient OCR on GPUs.

#### Key Features

- Transformer-based architecture optimized for OCR
- Token compression for faster inference and lower memory use
- Strong layout and text recognition performance on diverse document types
- Compatible with vLLM and Hugging Face pipelines
- MIT license

#### Best For

DeepSeek-OCR works well for teams that need to process large volumes of data from complex documents. Also, its compatibility with popular inference frameworks such as vLLM makes it attractive for applications where throughput and parallelism is a must (i.e., serverless GPU inference, on-demand OCR microservices).

#### Limits

Like most multimodal language models, DeepSeek-OCR can occasionally hallucinate, especially in documents with overlapping elements. It also requires GPU acceleration to achieve speeds that are practical, making it unsuitable for CPU-only environments.

### GOT-OCR 2.0

Developed as part of the General OCR Transformer (GOT) series, [GOT-OCR 2.0](https://github.com/Ucas-HaoranWei/GOT-OCR2.0) treats OCR as a holistic vision-language task. It unifies document parsing, formula reading, scene text detection, and chart interpretation under a single architecture, which allows it to handle a wide range of visual content in a single pass.

#### Key Features

- Unified transformer architecture for text, charts, formulas, and tables
- OCR-free design (no separate text detector or recognizer required)
- Robust performance across scanned documents and natural scenes
- Apache-2.0 license with pre-trained weights available on Hugging Face

#### Best For

GOT-OCR 2.0 is best used for document understanding workloads that mix structured text with visual elements (such as scientific papers or presentation slides). Its end-to-end design makes it particularly effective for this use case, where traditional OCR pipelines struggle to segment overlapping elements.

#### Limits

The model’s unified approach comes at the cost of compute efficiency. GOT-OCR 2.0 requires GPUs to reach real-time performance. In most cases, its inference latency is higher than modular pipelines like PaddleOCR. It also lacks in-depth control for layout customization, which can be important for enterprises processing high volumes of data.

### **Qwen2.5-VL**

[Qwen2.5-VL](https://github.com/QwenLM/Qwen3-VL) is Alibaba’s multimodal vision-language model and is an extension of the Qwen2.5 series with strong document parsing capabilities. It has proven top-tier performance on benchmarks such as OCRBench_v2 and DocVQA, and has features like bounding boxes and point detection baked into its design.

#### Key Features

- Multimodal vision-language transformer
- Strong accuracy on OCR-heavy benchmarks (OCRBench_v2, DocVQA)
- Supports structured extraction and grounding (boxes and points)
- Multiple checkpoints with varying licenses (Apache-2.0 for some, Qwen license for others)

#### Best For

Qwen2.5-VL works well for complex documents that mix text with diagrams, charts, or other unconventional layouts. Its ability to output structure makes it valuable for use cases such as mapping values to table cells or extracting regions of interest in scientific papers.

#### Limits

The model is computationally intensive with its large memory footprint making it less practical for smaller-scale deployments. Also, licensing varies by checkpoint which can complicate commercial adoption.

### InternVL 2.5

[InternVL 2.5](https://internvl.github.io/blog/2024-12-05-InternVL-2.5/) is a large-scale vision-language model family which has been optimized for general-purpose document understanding and multimodal reasoning. This 2.5 release refines the model’s ability to interpret structured text while also maintaining strong general reasoning performance. Another plus is that it has checkpoints ranging from 1B to 78B parameter. This makes it one of the most flexible models in this list.

#### Key Features

- Multimodal transformer trained for document and image understanding
- High accuracy on OCRBench, DocVQA, and ChartQA benchmarks
- Supports multiple model sizes (1B to 78B) for performance tuning
- Active development community
- Several variants released under permissive MIT licenses

#### Best For

InternVL 2.5 is best for general multimodal tasks that combine OCR and natural-language reasoning. Its smaller variants (1B-7B) are great for fine-tuning and edge deployment, while its larger models (26B-78B) score high on structured document understanding benchmarks.

#### Limits

As a general-purpose model, InternVL 2.5 is not a specialized OCR engine. While its extraction capabilities are strong, they can be inconsistent for dense (or low-quality) scans. Also, it is difficult to find the right balance with its largest models requiring significant GPU resources and smaller models requiring careful prompt design to achieve outputs that are stable.

### **RolmOCR**

[RolmOCR](https://huggingface.co/reducto/RolmOCR), developed by Reducto, is a specialized fine-tune of Qwen 2.5-VL 7B that focuses entirely on OCR performance. Put simply, it streamlines the broader Qwen vision-language model into a lighter checkpoint that is optimized for document transcription. By doing this, RolmOCR achieves strong recognition accuracy at a fraction fo the computational cost of larger multimodal systems.

#### Key Features

- Fine-tuned variant of Qwen 2.5-VL 7B
- Optimized for OCR throughput and reduced latency
- Compatible with vLLM and other lightweight inference frameworks
- Apache-2.0 license for commercial use

#### Best For

RolmOCR is best suited for lightweight OCR deployments where teams need VLM-level text recognition without the resource demands of 30B+ models. Its smaller size makes it practical for most GPU-constrained environments (even local deployments).

#### Limits

As a focused fine-tune, RolmOCR lacks the layout-awareness features found in the other models. While it is faster and easier to serve, its narrower scope usually means that teams will need other post-processing tools to reach the same level of structured extraction that a model like DeepSeek-OCR offers.

## Running OCR Models at Scale

Running OCR in production is as much an infrastructure problem as it is a modeling one. It requires careful thinking about managing throughput, costs, and latency.

Traditional engines like Tesseract can run efficiently on CPUs, but transformer-based and multimodal models such as DeepSeek-OCR generally require GPUs to deliver practical inference speeds. This shapes how teams design their pipelines.

[Modal](https://modal.com/)\xA0provides serverless GPU infrastructure ideal for running OCR workloads at scale. With Modal, you can:

1. Deploy any open-source OCR model
2. Automatically scale based on demand
3. Pay only for actual processing time
4. Access the latest GPU hardware

Ready to start processing documents at scale?\xA0Try deploying Datalab Marker with [our OCR example](/docs/examples/doc_ocr_jobs).
`,meta:{description:`Compare the best open-source OCR models for document processing, including traditional ML and LLM-based approaches`}},{title:m,description:h,date:g,length:_,category:v,subcategory:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=p,T=t(`<thead><tr><th>Model</th><th>License</th><th>Key Features</th><th>Best For</th><th>Limits</th></tr></thead> <tbody><tr><td><!></td><td>Apache-2.0</td><td>Multilingual OCR, handwriting + layout, PP-StructureV3 tables + reading order</td><td>Structured documents, invoices, multilingual enterprise use</td><td>Requires tuning; optimal accuracy needs GPU</td></tr><tr><td><!></td><td>Apache-2.0</td><td>CPU-first, 100+ languages, mature ecosystem</td><td>Bulk printed text, digitization pipelines</td><td>Weak on handwriting and layouts; GPU support experimental</td></tr><tr><td><!></td><td>OpenRAIL</td><td>End-to-end OCR → Markdown/JSON, Surya backend, optional LLM post-processing</td><td>Digitization + RAG pipelines, scalable GPU workloads (e.g. Modal)</td><td>LLM mode adds latency + cost; depends on Surya accuracy</td></tr><tr><td><!></td><td>MIT</td><td>End-to-end OCR-free transformer (text, charts, formulas)</td><td>Large-scale GPU OCR, high-throughput pipelines</td><td>Occasional hallucinations; GPU-only practical</td></tr><tr><td><!></td><td>MIT</td><td>Vision-language OCR with grounding (boxes + points)</td><td>Mixed visual/text docs, scientific papers + slides</td><td>High GPU load; limited layout customization</td></tr><tr><td><!></td><td>Apache-2.0 / Qwen license</td><td>Multi modal OCR, grounding (boxes, points), high benchmark scores</td><td>Complex layouts, charts, scientific docs</td><td>Heavy VRAM needs; license varies by checkpoint</td></tr><tr><td><!></td><td>MIT (for select variants)</td><td>Multimodal doc understanding, 1B–78B sizes, high DocVQA scores</td><td>General OCR + reasoning, PDF summarization + charts</td><td>Large models demand GPUs; small ones need prompt tuning</td></tr><tr><td><!></td><td>Apache-2.0</td><td>Qwen 2.5-VL 7B fine-tune, low-VRAM OCR, fast inference</td><td>Lightweight OCR deployments, on-prem or GPU-limited setups</td><td>No bounding boxes; limited layout awareness</td></tr></tbody>`,1),E=t(`<p><em>Updated: 2025-11-05</em></p> <p>Despite being one of the oldest applied areas in machine learning, Optical Character Recognition (OCR) hasn’t faded into the background. Today, the reality is that large volumes of information are still locked in scanned PDFs and other textual archives. Teams continue to depend on OCR to turn those into searchable, structured data that can drive workflows.</p> <p>Put simply, the demands have not gone away. Instead, they’ve multiplied:</p> <ul><li><strong>Compliance</strong>: Financial, healthcare, and government records often can’t leave controlled infrastructure because of HIPAA, GDPR, or other regulatory guardrails.</li> <li><strong>Digitization</strong>: Enterprises are still scanning books, contracts, and historical archives that live on the web at scale.</li> <li><strong>Process Automation</strong>: Invoices, KYC documents, and shipping labels flow through OCR pipelines to avoid manual entry.</li> <li><strong>Knowledge Extraction</strong>: Users mine PDFs (and other documents) for insights without having to read line by line.</li> <li><strong>Accessibility</strong>: Screen readers and translation tools use OCR to produce text inside images.</li></ul> <p>Hosted APIs such as <!>\xA0and\xA0<!> cover many of these needs, but they route sensitive documents through vendor infrastructure and often bill per page (or per token). For teams facing strict compliance rules and cost ceilings or need tight operational control, self-hosted open-source OCR models remain the most viable option.</p> <p>This brings us to the models themselves. In 2025, open-source OCR spans two broad approaches: traditional ML engines designed for text recognition and multimodal LLMs that treat OCR as part of broader visual understanding.</p> <p>In this first section, we will go over each approach to show how they differ. Later, we will list our top open-source OCR models and directly compare each one. Here’s a brief overview:</p> <!> <h2 id="traditional-ml-vs-llm-based-ocr">Traditional ML vs LLM-Based OCR</h2> <p>Traditional OCR engines are purpose-built for text extraction. Using specialized computer vision architectures, they detect regions, recognize characters, and then return outputs with confidence scores. These pipelines are tuned for efficiency. They run well on CPUs and can handle large batches of data predictably.</p> <p>LLM-based models have a different approach. They treat OCR as part of a broader visual-language problem. Text extraction is fused with layout reasoning and question answering. So instead of only producing raw characters, they can output structured JSON or interpret a diagram. As expected, this can lead to higher GPU costs, larger memory requirements, and more variable latency.</p> <p>Generally speaking, you should start with more traditional OCR models, which are fast, cheap, and often very accurate, even for structured data like tables (you may need to fiddle around with some configuration options). For complex diagrams or other tricky use cases, you may need to use an LLM-based OCR model (but keep in mind the higher latency/cost).</p> <p>Now that we know the differences, let’s take a look at some of the top OCR models.</p> <h2 id="traditional-ml-based-ocr-models">Traditional ML-Based OCR Models</h2> <h3 id="paddleocr">PaddleOCR</h3> <p><!>, developed by the PaddlePaddle team, remains one of the most advanced OCR toolkits.</p> <h4 id="key-features">Key Features</h4> <ul><li>High accuracy on Chinese, English, and multilingual text</li> <li>PP-StructureV3 for table recognition, formulas, and handwriting</li> <li>Deployable across CUDA 12, ONNX Runtime, and Windows environments</li> <li>Official Docker images for GPU deployment</li> <li>Apache-2.0 license</li></ul> <h4 id="best-for">Best For</h4> <p>PaddleOCR’s advanced features are needed for complex, structured documents where simple character recognition is not enough. It is particularly effective for workflows like invoices, where both text and layout extraction is required. Also, its strong performance in Chinese and English is great for enterprise environments operating across multilingual datasets.</p> <h4 id="limits">Limits</h4> <p>With all of these advanced capabilities comes added complexity. PaddleOCR requires more configuration and tuning than lighter libraries. Achieving top performance generally means running on GPUs.</p> <h3 id="tesseract"><strong>Tesseract</strong></h3> <p><!> is the most established open-source OCR engine. It was originally developed by Hewlett-Packard and later maintained by Google. While primarily CPU-based, experimental GPU/OpenCL support exists but is not considered production-ready.</p> <h4 id="key-features-1">Key Features</h4> <ul><li>Support for over 100 languages</li> <li>LSTM-based neural recognition since v4</li> <li>Mature ecosystem, community support, and integration libraries</li> <li>Apache-2.0 license</li></ul> <h4 id="best-for-1">Best For</h4> <p>Tesseract is well-suited for high-volume processing of printed text, especially in large scanned archives. Its CPU-first design makes it reliable for deployments where GPUs are unavailable (or too expensive).</p> <h4 id="limits-1">Limits</h4> <p>Tesseract struggles with handling handwriting, complex layouts, and structured data such as tables. These gaps require post-processing layers, and GPU support remains limited.</p> <h2 id="llm-based-ocr-models"><strong>LLM-Based OCR Models</strong></h2> <h3 id="datalab-marker">Datalab Marker</h3> <p><!> is a full end-to-end OCR pipeline that converts PDFs and images into structured formats (i.e., JSON, Markdown, HTML). It builds on Surya (developed by Datalab) as its core recognition engine and adds deterministic layout parsing for tables, equations, and code blocks.</p> <h4 id="key-features-2">Key Features</h4> <ul><li>Converts scanned documents directly into Markdown, JSON, or HTML</li> <li>Built on Surya for OCR and layout detection</li> <li>Handles tables, equations, code, and multi-column layouts</li> <li>Optional <code>-use_llm</code> flag adds language-model refinement for structure and error correction</li> <li>Runs efficiently on CPUs or GPUs and is container-friendly</li> <li>OpenRAIL License</li></ul> <h4 id="best-for-2">Best For</h4> <p>Marker is best for teams that want to turn unstructured document data into formats that are easily read by machines without having to build a pipeline from scratch. It’s great for digitization workflows and knowledge pipelines since the end goal is structured outputs. Also, Marker’s design makes it a strong fit for <!>, where it can scale automatically based on job volume.</p> <h4 id="limits-2">Limits</h4> <p>Since Marker relies on Surya as its OCR backbone, its core text recognition accuracy mirrors Surya’s performance. The optional LLM enhancement does make a big difference in output fidelity, but adds latency and cost. As with any multi-stage pipeline, the key is to find the right balance between OCR and LLM to achieve a sustainable throughput.</p> <h3 id="deepseek-ocr"><strong>DeepSeek-OCR</strong></h3> <p><!> is a new generation open-source model that integrates optical character recognition into a multimodal transformer framework. Its design uses an innovative token compression mechanism to reduce the number of visual tokens required for inference. The result is a faster, more memory-efficient OCR on GPUs.</p> <h4 id="key-features-3">Key Features</h4> <ul><li>Transformer-based architecture optimized for OCR</li> <li>Token compression for faster inference and lower memory use</li> <li>Strong layout and text recognition performance on diverse document types</li> <li>Compatible with vLLM and Hugging Face pipelines</li> <li>MIT license</li></ul> <h4 id="best-for-3">Best For</h4> <p>DeepSeek-OCR works well for teams that need to process large volumes of data from complex documents. Also, its compatibility with popular inference frameworks such as vLLM makes it attractive for applications where throughput and parallelism is a must (i.e., serverless GPU inference, on-demand OCR microservices).</p> <h4 id="limits-3">Limits</h4> <p>Like most multimodal language models, DeepSeek-OCR can occasionally hallucinate, especially in documents with overlapping elements. It also requires GPU acceleration to achieve speeds that are practical, making it unsuitable for CPU-only environments.</p> <h3 id="got-ocr-20">GOT-OCR 2.0</h3> <p>Developed as part of the General OCR Transformer (GOT) series, <!> treats OCR as a holistic vision-language task. It unifies document parsing, formula reading, scene text detection, and chart interpretation under a single architecture, which allows it to handle a wide range of visual content in a single pass.</p> <h4 id="key-features-4">Key Features</h4> <ul><li>Unified transformer architecture for text, charts, formulas, and tables</li> <li>OCR-free design (no separate text detector or recognizer required)</li> <li>Robust performance across scanned documents and natural scenes</li> <li>Apache-2.0 license with pre-trained weights available on Hugging Face</li></ul> <h4 id="best-for-4">Best For</h4> <p>GOT-OCR 2.0 is best used for document understanding workloads that mix structured text with visual elements (such as scientific papers or presentation slides). Its end-to-end design makes it particularly effective for this use case, where traditional OCR pipelines struggle to segment overlapping elements.</p> <h4 id="limits-4">Limits</h4> <p>The model’s unified approach comes at the cost of compute efficiency. GOT-OCR 2.0 requires GPUs to reach real-time performance. In most cases, its inference latency is higher than modular pipelines like PaddleOCR. It also lacks in-depth control for layout customization, which can be important for enterprises processing high volumes of data.</p> <h3 id="qwen25-vl"><strong>Qwen2.5-VL</strong></h3> <p><!> is Alibaba’s multimodal vision-language model and is an extension of the Qwen2.5 series with strong document parsing capabilities. It has proven top-tier performance on benchmarks such as OCRBench_v2 and DocVQA, and has features like bounding boxes and point detection baked into its design.</p> <h4 id="key-features-5">Key Features</h4> <ul><li>Multimodal vision-language transformer</li> <li>Strong accuracy on OCR-heavy benchmarks (OCRBench_v2, DocVQA)</li> <li>Supports structured extraction and grounding (boxes and points)</li> <li>Multiple checkpoints with varying licenses (Apache-2.0 for some, Qwen license for others)</li></ul> <h4 id="best-for-5">Best For</h4> <p>Qwen2.5-VL works well for complex documents that mix text with diagrams, charts, or other unconventional layouts. Its ability to output structure makes it valuable for use cases such as mapping values to table cells or extracting regions of interest in scientific papers.</p> <h4 id="limits-5">Limits</h4> <p>The model is computationally intensive with its large memory footprint making it less practical for smaller-scale deployments. Also, licensing varies by checkpoint which can complicate commercial adoption.</p> <h3 id="internvl-25">InternVL 2.5</h3> <p><!> is a large-scale vision-language model family which has been optimized for general-purpose document understanding and multimodal reasoning. This 2.5 release refines the model’s ability to interpret structured text while also maintaining strong general reasoning performance. Another plus is that it has checkpoints ranging from 1B to 78B parameter. This makes it one of the most flexible models in this list.</p> <h4 id="key-features-6">Key Features</h4> <ul><li>Multimodal transformer trained for document and image understanding</li> <li>High accuracy on OCRBench, DocVQA, and ChartQA benchmarks</li> <li>Supports multiple model sizes (1B to 78B) for performance tuning</li> <li>Active development community</li> <li>Several variants released under permissive MIT licenses</li></ul> <h4 id="best-for-6">Best For</h4> <p>InternVL 2.5 is best for general multimodal tasks that combine OCR and natural-language reasoning. Its smaller variants (1B-7B) are great for fine-tuning and edge deployment, while its larger models (26B-78B) score high on structured document understanding benchmarks.</p> <h4 id="limits-6">Limits</h4> <p>As a general-purpose model, InternVL 2.5 is not a specialized OCR engine. While its extraction capabilities are strong, they can be inconsistent for dense (or low-quality) scans. Also, it is difficult to find the right balance with its largest models requiring significant GPU resources and smaller models requiring careful prompt design to achieve outputs that are stable.</p> <h3 id="rolmocr"><strong>RolmOCR</strong></h3> <p><!>, developed by Reducto, is a specialized fine-tune of Qwen 2.5-VL 7B that focuses entirely on OCR performance. Put simply, it streamlines the broader Qwen vision-language model into a lighter checkpoint that is optimized for document transcription. By doing this, RolmOCR achieves strong recognition accuracy at a fraction fo the computational cost of larger multimodal systems.</p> <h4 id="key-features-7">Key Features</h4> <ul><li>Fine-tuned variant of Qwen 2.5-VL 7B</li> <li>Optimized for OCR throughput and reduced latency</li> <li>Compatible with vLLM and other lightweight inference frameworks</li> <li>Apache-2.0 license for commercial use</li></ul> <h4 id="best-for-7">Best For</h4> <p>RolmOCR is best suited for lightweight OCR deployments where teams need VLM-level text recognition without the resource demands of 30B+ models. Its smaller size makes it practical for most GPU-constrained environments (even local deployments).</p> <h4 id="limits-7">Limits</h4> <p>As a focused fine-tune, RolmOCR lacks the layout-awareness features found in the other models. While it is faster and easier to serve, its narrower scope usually means that teams will need other post-processing tools to reach the same level of structured extraction that a model like DeepSeek-OCR offers.</p> <h2 id="running-ocr-models-at-scale">Running OCR Models at Scale</h2> <p>Running OCR in production is as much an infrastructure problem as it is a modeling one. It requires careful thinking about managing throughput, costs, and latency.</p> <p>Traditional engines like Tesseract can run efficiently on CPUs, but transformer-based and multimodal models such as DeepSeek-OCR generally require GPUs to deliver practical inference speeds. This shapes how teams design their pipelines.</p> <p><!>\xA0provides serverless GPU infrastructure ideal for running OCR workloads at scale. With Modal, you can:</p> <ol><li>Deploy any open-source OCR model</li> <li>Automatically scale based on demand</li> <li>Pay only for actual processing time</li> <li>Access the latest GPU hardware</li></ol> <p>Ready to start processing documents at scale?\xA0Try deploying Datalab Marker with <!>.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),8),p=c(e(f));d(p,{href:`https://azure.microsoft.com/products/ai-services/ai-vision`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Azure Computer Vision`))},$$slots:{default:!0}}),d(c(p,2),{href:`https://mistral.ai/solutions/document-ai`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Mistral OCR`))},$$slots:{default:!0}}),l(),n(f);var m=c(f,6);u(m,{children:(t,a)=>{var o=T(),u=c(s(o),2),f=e(u),p=e(f);d(e(p),{href:`#paddleocr`,children:(e,t)=>{l(),i(e,r(`PaddleOCR`))},$$slots:{default:!0}}),n(p),l(4),n(f);var m=c(f),h=e(m);d(e(h),{href:`#tesseract`,children:(e,t)=>{l(),i(e,r(`Tesseract`))},$$slots:{default:!0}}),n(h),l(4),n(m);var g=c(m),_=e(g);d(e(_),{href:`#datalab-marker`,children:(e,t)=>{l(),i(e,r(`Datalab Marker`))},$$slots:{default:!0}}),n(_),l(4),n(g);var v=c(g),y=e(v);d(e(y),{href:`#deepseek-ocr`,children:(e,t)=>{l(),i(e,r(`DeepSeek-OCR`))},$$slots:{default:!0}}),n(y),l(4),n(v);var b=c(v),x=e(b);d(e(x),{href:`#got-ocr-20`,children:(e,t)=>{l(),i(e,r(`GOT-OCR 2.0`))},$$slots:{default:!0}}),n(x),l(4),n(b);var S=c(b),C=e(S);d(e(C),{href:`#qwen25-vl`,children:(e,t)=>{l(),i(e,r(`Qwen2.5-VL`))},$$slots:{default:!0}}),n(C),l(4),n(S);var w=c(S),E=e(w);d(e(E),{href:`#internvl-25`,children:(e,t)=>{l(),i(e,r(`InternVL 2.5`))},$$slots:{default:!0}}),n(E),l(4),n(w);var D=c(w),O=e(D);d(e(O),{href:`#rolmocr`,children:(e,t)=>{l(),i(e,r(`RolmOCR (Reducto)`))},$$slots:{default:!0}}),n(O),l(4),n(D),n(u),i(t,o)},$$slots:{default:!0}});var h=c(m,16);d(e(h),{href:`https://github.com/paddlepaddle/paddle`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`PaddleOCR`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,16);d(e(g),{href:`https://github.com/tesseract-ocr/tesseract`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Tesseract`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,18);d(e(_),{href:`https://github.com/datalab-to/marker`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Datalab Marker`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,8);d(c(e(v)),{href:`https://modal.com/docs/examples/doc_ocr_jobs`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`serverless GPU platforms like Modal`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,8);d(e(y),{href:`https://github.com/deepseek-ai/DeepSeek-OCR`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`DeepSeek-OCR`))},$$slots:{default:!0}}),l(),n(y);var b=c(y,16);d(c(e(b)),{href:`https://github.com/Ucas-HaoranWei/GOT-OCR2.0`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`GOT-OCR 2.0`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,16);d(e(x),{href:`https://github.com/QwenLM/Qwen3-VL`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Qwen2.5-VL`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,16);d(e(S),{href:`https://internvl.github.io/blog/2024-12-05-InternVL-2.5/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`InternVL 2.5`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,16);d(e(C),{href:`https://huggingface.co/reducto/RolmOCR`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RolmOCR`))},$$slots:{default:!0}}),l(),n(C);var w=c(C,20);d(e(w),{href:`https://modal.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(w);var D=c(w,4);d(c(e(D)),{href:`/docs/examples/doc_ocr_jobs`,children:(e,t)=>{l(),i(e,r(`our OCR example`))},$$slots:{default:!0}}),l(),n(D),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=B57QDaoT2.js.map
