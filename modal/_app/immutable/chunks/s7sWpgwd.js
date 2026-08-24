(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7437db68-cb7b-4966-9e0a-2fd9eb142ff9`,e._sentryDebugIdIdentifier=`sentry-dbid-7437db68-cb7b-4966-9e0a-2fd9eb142ff9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`LoRA vs. QLoRA: Efficient fine-tuning techniques for LLMs`,description:`Learn the differences between LoRA and QLoRA, two different efficient fine-tuning techniques for large language models.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-08-22T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Table of contents`,id:`table-of-contents`},{depth:2,value:`Overview of LoRA and QLoRA`,id:`overview-of-lora-and-qlora`},{depth:2,value:`The problems with full fine-tuning`,id:`the-problems-with-full-fine-tuning`},{depth:2,value:`What is LoRA?`,id:`what-is-lora`,children:[{depth:3,value:`Upshot`,id:`upshot`}]},{depth:2,value:`What is QLoRA?`,id:`what-is-qlora`,children:[{depth:3,value:`Upshot`,id:`upshot-1`}]},{depth:2,value:`Which one should you use?`,id:`which-one-should-you-use`}],rawContent:`Fine-tuning LLMs can be a computationally expensive and time-consuming process, especially when dealing with models containing billions of parameters. However, new fine-tuning techniques have made it possible to more efficiently fine-tune LLMs by reducing the number of parameters to update. In this blog post, we'll explore two such techniques: LoRA and QLoRA and discuss their differences and pros and cons.

## Table of contents

- [Overview of LoRA and QLoRA](#overview-of-lora-and-qlora)
- [The problems with full fine-tuning](#the-problems-with-full-fine-tuning)
- [What is LoRA?](#what-is-lora)
- [What is QLoRA?](#what-is-qlora)
- [Which one should you use?](#which-one-should-you-use)

## Overview of LoRA and QLoRA

|                                         | Full FT     | LoRA                | QLoRA                     |
| --------------------------------------- | ----------- | ------------------- | ------------------------- |
| GB VRAM\\* (Memory needed per 1GB model) | 16+         | 2+                  | 0.5+                      |
| % Params trained                        | ~100%       | 0.5-5%              | 0.5-5%                    |
| Speed                                   | Slow        | Fast                | Slightly slower than LoRA |
| Quality                                 | Can overfit | Stable and accurate | Can lose accuracy         |

## The problems with full fine-tuning

Before diving into the efficient techniques, let's briefly review the challenges of traditional full fine-tuning:

- Updates every single parameter in the base model
- Because of the large number of parameters that need to be updated, requires significant computational resources, typically 60GB+ of VRAM for a 7B parameter model
- Slow
- Prone to overfitting, especially when working with smaller datasets

## What is LoRA?

LoRA, short for Low-Rank Adaptation, is a fine-tuning technique introduced by Microsoft researchers in their paper [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685).

The main idea behind LoRA is that instead of updating all the pre-trained weights, you freeze them and train smaller "adapter" matrices that represent the update to the base model.

In a standard neural network layer, we have:

\`\`\`
Y = WX + b
\`\`\`

Where:

- W is the weight matrix
- X is the input
- b is the bias
- Y is the output

LoRA modifies this as follows:

\`\`\`
Y = (W + BA)X + b
\`\`\`

Where:

- W is the frozen pre-trained weight matrix
- B and A are low-rank matrices, which means that they are "smaller" than the original W matrix and can be stored more efficiently
- BA is the product of these matrices, representing the update to W

### Upshot

- Only a small number of parameters (in A and B) need to be trained
- Uses way less VRAM, and most of the VRAM requirement is for loading the base model, not for training
- Can result in less overfitting compared to full fine-tuning
- Can be applied selectively to certain layers or components of the model
- Multiple LoRA modules can be trained for different tasks and swapped out as needed
- Can use a higher learning rate due to the smaller number of parameters

## What is QLoRA?

QLoRA, or Quantized LoRA, is an extension of the LoRA technique that further reduces the memory footprint of fine-tuning by quantizing the low-rank matrices. Introduced in the paper [QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314), QLoRA applies post-training quantization to the A and B matrices, converting them from 32-bit floating-point numbers to lower-precision representations, such as 8-bit integers.

By quantizing the low-rank matrices, QLoRA achieves a 4x reduction in memory usage compared to standard LoRA, making it possible to fine-tune even larger models on resource-constrained devices.

### Upshot

- Further reduces the memory footprint of fine-tuning
- Can lead to a loss of knowledge and a lower-quality fine-tune, but not necessarily. Sometimes the quantization actually reduces overfitting.
- The loss of knowledge is also mitigated because the adapters are generally not quantized - it's the base model that will suffer in performance

## Which one should you use?

- If you have access to hardware with enough space, **use LoRA**. Refer the table below for a rough estimate of the memory requirements for different model sizes.

| Method | Bits | 7B    | 13B   | 30B   | 70B    | 110B   | 8x7B  | 8x22B  |
| ------ | ---- | ----- | ----- | ----- | ------ | ------ | ----- | ------ |
| Full   | Amp  | 120GB | 240GB | 600GB | 1200GB | 2000GB | 900GB | 2400GB |
| Full   | 16   | 60GB  | 120GB | 300GB | 600GB  | 900GB  | 400GB | 1200GB |
| LoRA   | 16   | 16GB  | 32GB  | 64GB  | 160GB  | 240GB  | 120GB | 320GB  |
| QLoRA  | 8    | 10GB  | 20GB  | 40GB  | 80GB   | 140GB  | 60GB  | 160GB  |
| QLoRA  | 4    | 6GB   | 12GB  | 24GB  | 48GB   | 72GB   | 30GB  | 96GB   |
| QLoRA  | 2    | 4GB   | 8GB   | 16GB  | 24GB   | 48GB   | 18GB  | 48GB   |

- If you don't have enough space, for example, if you only have access to a free T4 on Google Colab, **try qLoRA**.
`,meta:{description:`Learn the differences between LoRA and QLoRA, two different efficient fine-tuning techniques for large language models.`}},{title:h,description:g,authors:_,date:v,length:y,category:b,subcategory:x,published:S,layout:C,toc:w,rawContent:T,meta:E}=m,D=t(`<thead><tr><th></th><th>Full FT</th><th>LoRA</th><th>QLoRA</th></tr></thead> <tbody><tr><td>GB VRAM* (Memory needed per 1GB model)</td><td>16+</td><td>2+</td><td>0.5+</td></tr><tr><td>% Params trained</td><td>~100%</td><td>0.5-5%</td><td>0.5-5%</td></tr><tr><td>Speed</td><td>Slow</td><td>Fast</td><td>Slightly slower than LoRA</td></tr><tr><td>Quality</td><td>Can overfit</td><td>Stable and accurate</td><td>Can lose accuracy</td></tr></tbody>`,1),O=t(`<thead><tr><th>Method</th><th>Bits</th><th>7B</th><th>13B</th><th>30B</th><th>70B</th><th>110B</th><th>8x7B</th><th>8x22B</th></tr></thead> <tbody><tr><td>Full</td><td>Amp</td><td>120GB</td><td>240GB</td><td>600GB</td><td>1200GB</td><td>2000GB</td><td>900GB</td><td>2400GB</td></tr><tr><td>Full</td><td>16</td><td>60GB</td><td>120GB</td><td>300GB</td><td>600GB</td><td>900GB</td><td>400GB</td><td>1200GB</td></tr><tr><td>LoRA</td><td>16</td><td>16GB</td><td>32GB</td><td>64GB</td><td>160GB</td><td>240GB</td><td>120GB</td><td>320GB</td></tr><tr><td>QLoRA</td><td>8</td><td>10GB</td><td>20GB</td><td>40GB</td><td>80GB</td><td>140GB</td><td>60GB</td><td>160GB</td></tr><tr><td>QLoRA</td><td>4</td><td>6GB</td><td>12GB</td><td>24GB</td><td>48GB</td><td>72GB</td><td>30GB</td><td>96GB</td></tr><tr><td>QLoRA</td><td>2</td><td>4GB</td><td>8GB</td><td>16GB</td><td>24GB</td><td>48GB</td><td>18GB</td><td>48GB</td></tr></tbody>`,1),k=t(`<p>Fine-tuning LLMs can be a computationally expensive and time-consuming process, especially when dealing with models containing billions of parameters. However, new fine-tuning techniques have made it possible to more efficiently fine-tune LLMs by reducing the number of parameters to update. In this blog post, we’ll explore two such techniques: LoRA and QLoRA and discuss their differences and pros and cons.</p> <h2 id="table-of-contents">Table of contents</h2> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <h2 id="overview-of-lora-and-qlora">Overview of LoRA and QLoRA</h2> <!> <h2 id="the-problems-with-full-fine-tuning">The problems with full fine-tuning</h2> <p>Before diving into the efficient techniques, let’s briefly review the challenges of traditional full fine-tuning:</p> <ul><li>Updates every single parameter in the base model</li> <li>Because of the large number of parameters that need to be updated, requires significant computational resources, typically 60GB+ of VRAM for a 7B parameter model</li> <li>Slow</li> <li>Prone to overfitting, especially when working with smaller datasets</li></ul> <h2 id="what-is-lora">What is LoRA?</h2> <p>LoRA, short for Low-Rank Adaptation, is a fine-tuning technique introduced by Microsoft researchers in their paper <!>.</p> <p>The main idea behind LoRA is that instead of updating all the pre-trained weights, you freeze them and train smaller “adapter” matrices that represent the update to the base model.</p> <p>In a standard neural network layer, we have:</p> <!> <p>Where:</p> <ul><li>W is the weight matrix</li> <li>X is the input</li> <li>b is the bias</li> <li>Y is the output</li></ul> <p>LoRA modifies this as follows:</p> <!> <p>Where:</p> <ul><li>W is the frozen pre-trained weight matrix</li> <li>B and A are low-rank matrices, which means that they are “smaller” than the original W matrix and can be stored more efficiently</li> <li>BA is the product of these matrices, representing the update to W</li></ul> <h3 id="upshot">Upshot</h3> <ul><li>Only a small number of parameters (in A and B) need to be trained</li> <li>Uses way less VRAM, and most of the VRAM requirement is for loading the base model, not for training</li> <li>Can result in less overfitting compared to full fine-tuning</li> <li>Can be applied selectively to certain layers or components of the model</li> <li>Multiple LoRA modules can be trained for different tasks and swapped out as needed</li> <li>Can use a higher learning rate due to the smaller number of parameters</li></ul> <h2 id="what-is-qlora">What is QLoRA?</h2> <p>QLoRA, or Quantized LoRA, is an extension of the LoRA technique that further reduces the memory footprint of fine-tuning by quantizing the low-rank matrices. Introduced in the paper <!>, QLoRA applies post-training quantization to the A and B matrices, converting them from 32-bit floating-point numbers to lower-precision representations, such as 8-bit integers.</p> <p>By quantizing the low-rank matrices, QLoRA achieves a 4x reduction in memory usage compared to standard LoRA, making it possible to fine-tune even larger models on resource-constrained devices.</p> <h3 id="upshot-1">Upshot</h3> <ul><li>Further reduces the memory footprint of fine-tuning</li> <li>Can lead to a loss of knowledge and a lower-quality fine-tune, but not necessarily. Sometimes the quantization actually reduces overfitting.</li> <li>The loss of knowledge is also mitigated because the adapters are generally not quantized - it’s the base model that will suffer in performance</li></ul> <h2 id="which-one-should-you-use">Which one should you use?</h2> <ul><li>If you have access to hardware with enough space, <strong>use LoRA</strong>. Refer the table below for a rough estimate of the memory requirements for different model sizes.</li></ul> <!> <ul><li>If you don’t have enough space, for example, if you only have access to a free T4 on Google Colab, <strong>try qLoRA</strong>.</li></ul>`,1);function A(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=k(),p=c(s(o),4),m=e(p);f(e(m),{href:`#overview-of-lora-and-qlora`,children:(e,t)=>{l(),i(e,r(`Overview of LoRA and QLoRA`))},$$slots:{default:!0}}),n(m);var h=c(m,2);f(e(h),{href:`#the-problems-with-full-fine-tuning`,children:(e,t)=>{l(),i(e,r(`The problems with full fine-tuning`))},$$slots:{default:!0}}),n(h);var g=c(h,2);f(e(g),{href:`#what-is-lora`,children:(e,t)=>{l(),i(e,r(`What is LoRA?`))},$$slots:{default:!0}}),n(g);var _=c(g,2);f(e(_),{href:`#what-is-qlora`,children:(e,t)=>{l(),i(e,r(`What is QLoRA?`))},$$slots:{default:!0}}),n(_);var v=c(_,2);f(e(v),{href:`#which-one-should-you-use`,children:(e,t)=>{l(),i(e,r(`Which one should you use?`))},$$slots:{default:!0}}),n(v),n(p);var y=c(p,4);u(y,{children:(e,t)=>{var n=D();l(2),i(e,n)},$$slots:{default:!0}});var b=c(y,10);f(c(e(b)),{href:`https://arxiv.org/abs/2106.09685`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`LoRA: Low-Rank Adaptation of Large Language Models`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,6);d(x,{code:`Y%20%3D%20WX%20%2B%20b`,lang:`text`});var S=c(x,8);d(S,{code:`Y%20%3D%20(W%20%2B%20BA)X%20%2B%20b`,lang:`text`});var C=c(S,12);f(c(e(C)),{href:`https://arxiv.org/abs/2305.14314`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`QLoRA: Efficient Finetuning of Quantized LLMs`))},$$slots:{default:!0}}),l(),n(C),u(c(C,12),{children:(e,t)=>{var n=O();l(2),i(e,n)},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{A as default,m as metadata};
//# sourceMappingURL=s7sWpgwd.js.map
