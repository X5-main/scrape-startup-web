import{j as e}from"./index-DKDbF_0U.js";import{L as n}from"./LegalPage-DiEYh9as.js";import"./index-DNghuaNn.js";import"./index.dom-DdL1y947.js";import"./index-D3y3hsVt.js";const t=`# AVELIN Data Policy: Prompts, Completions, and Logging

**Last modified: August 6, 2026**

This page states, in plain terms, what happens to the content you send to the AVELIN API. It applies to all inference traffic: direct API customers and traffic arriving through distribution partners such as OpenRouter. It supplements our [API Privacy Policy](/legal/api-privacy) and [API Terms of Service](/legal/api-terms); in case of any conflict, those documents control.

## No training

We do not use your prompts or completions to train, fine-tune, or improve any model by default. This covers our generative models, our routing and classification models, and any derived artifacts such as embeddings. The only exception is your explicit consent: enabling the optional model-improvement setting described below (off by default) in your account settings or through a consent dialog. Consent may be withdrawn at any time.

## Optional model-improvement setting (off by default)

Your account includes a model-improvement setting. It is **off by default** and takes effect only if you explicitly enable it, in your account settings at platform.avelin.ai or through a consent dialog. If you enable it, we may derive de-identified (anonymized) vector representations (embeddings) from your prompts and store those vectors to train, evaluate, and improve our models, such as the routing and classification models that select the best expert for each request. Vectors are derived after removal of account identifiers, stored under access controls, and never used to reconstruct your content; raw prompt and completion content is still handled exactly as described on this page. You can turn the setting off at any time: we immediately stop deriving new vectors. Stored vectors are de-identified and are not linked to your account, and models already trained are not rolled back. Traffic from distribution partners, including OpenRouter, is never enrolled in this setting.

## No content logging by default

We do not store prompt or completion content in the normal operation of the Services. Requests are processed in memory; transient buffers needed to serve a request, including streaming and prompt-cache serving, are deleted within 5 minutes of request completion. Input and output content is not written to disk by default.

## Debugging and security capture

We may log a small portion of requests, including inputs and outputs, when necessary for debugging, incident response, or abuse prevention. Such captures are limited in scope, access-controlled, retained for no longer than 30 days, then permanently deleted, and never used for training.

## What we do retain

To bill you and keep the service secure, we retain operational metadata only: timestamps, model identifier, token counts (including cached-token counts), latency, status codes, and the API key used. Security and network logs (including IP addresses) are kept for up to 30 days for abuse prevention. None of this includes the content of your requests.

## Subprocessors

Where requests are served through vetted infrastructure subprocessors, those subprocessors are bound by data processing agreements to no-training and limited-retention obligations consistent with this policy. A current subprocessor list is available on request at hello@avelin.ai.

## Where inference runs

Inference is served from the United States, the European Union, the United Arab Emirates, and Singapore. Enterprise customers with data-residency requirements can contact us about region pinning or on-premises deployment.

## Questions

hello@avelin.ai · AVELIN AI, Inc., Delaware, United States
`;function d(){return e.jsx(n,{content:t})}export{d as component};
