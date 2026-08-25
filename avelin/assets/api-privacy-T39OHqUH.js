import{j as e}from"./index-DKDbF_0U.js";import{L as o}from"./LegalPage-DiEYh9as.js";import"./index-DNghuaNn.js";import"./index.dom-DdL1y947.js";import"./index-D3y3hsVt.js";const n=`# AVELIN Privacy Policy

**Last modified: August 6, 2026**

## Introduction

This privacy policy ("Privacy Policy") outlines the rules for using data collected when you ("you" or "your") use the AVELIN platform: your personal account and our web console at platform.avelin.ai, our API at api.avelin.ai, together with any regional or cluster-specific API endpoints under our domains that are provided in your personal account, and the related services we provide (collectively, the "Services"). The Services are provided by AVELIN AI, Inc., a Delaware corporation ("AVELIN", "Company", "we", "our", "us"), which is the data controller for the personal information described here. Visits to our public marketing website avelin.ai are covered separately by our [Website Privacy Policy](/legal/privacy); other AVELIN products (such as AVELIN App and AVELIN MCP) have their own privacy policies.

This Privacy Policy describes the types of information we may collect from you or that you may provide when you use our Services, and our practices for collecting, using, maintaining, protecting, and disclosing that information. Capitalized terms not defined here are defined in our [API Terms of Service](/legal/api-terms).

By accessing or using our Services, you acknowledge this Privacy Policy. We will notify you of significant updates as described in the Changes section below.

## Data Submitted to and Returned by Our Inference Service

We understand that the inputs you provide to our API and the outputs it generates may contain your personal or confidential information, and that they are your private data.

We will not store or sell this data, and we will not use it to train, fine-tune, or improve any model (generative, routing, or otherwise) without your explicit consent; this includes derived artifacts such as embeddings. The only exception to the no-training default is your explicit consent: enabling the optional model-improvement setting, which is **off by default** and may be enabled in your account settings or through a consent dialog. In that case, we may derive de-identified (anonymized) vector representations (embeddings) from your prompts and use those vectors to train, evaluate, and improve our models, including our routing and classification models, as described in our Data Policy. Vectors are derived after removal of account identifiers and are never used to reconstruct your content. You may disable the setting at any time, and we will immediately stop deriving new vectors; because stored vectors are de-identified, models already trained are not rolled back. Traffic from distribution partners (including OpenRouter) is never enrolled in this setting.

In the normal operation of the Services, content is processed in memory and is not written to disk; transient buffers needed to serve a request, including streaming and prompt-cache serving, are deleted within 5 minutes of request completion. We might sometimes retain a small portion of requests, including inputs and outputs, for a limited period not exceeding 30 days, when necessary for debugging, incident response, or abuse prevention; such captures are limited in scope and access-controlled, are permanently deleted at the end of that period, and are never used for training.

Where requests are served through vetted infrastructure subprocessors, those subprocessors are bound by data processing agreements to no-training and limited-retention obligations consistent with this Privacy Policy. A current subprocessor list is available on request at hello@avelin.ai.

We have created a dedicated page with further information about how we process and treat the data supplied to or returned by our Services: [https://avelin.ai/legal/data-policy](/legal/data-policy).

## Information We Collect About You and How We Collect It

We collect several types of information from and about users of our Services:

**Personal Information.**

*Account information.* When you create an account with us, we collect personal information such as your name and email address.

*Communication information.* We may collect other information you provide through your interactions with us, for example if you request information about our services, contact support, provide feedback, or participate in an event or survey. We may keep a record of these communications.

*Transaction information.* Details of transactions you carry out through our Services. Payments are handled by our payment processor; we do not store full card numbers.

**Other information collected automatically.**

*Device and usage information.* Your internet connection, the device and browser you use to access our Services, and usage details such as pages visited and time on page. We collect this to operate, secure, and improve the Services.

*Log data.* Information automatically sent by your browser or device, including IP address, date and time of requests, and how you interact with our Services. Security and network logs (including IP addresses) are retained for up to 30 days for abuse prevention.

*API usage metadata.* For each API request we record operational metadata only (timestamps, model identifier, token counts, latency, status codes, and the API key used), never the content of your requests (content handling is described in the section above).

We collect this information directly from you when you provide it, and automatically as you navigate the Services (including through cookies). We may tie information collected automatically to the personal information you provide. We use functional and analytical cookies only; we do not use targeting or advertising cookies, and we do not respond to Do Not Track signals because we do not track users across third-party websites. We do not use automated decision-making, including profiling, that produces legal or similarly significant effects concerning you.

## How We Use Your Information

We use information that we collect about you or that you provide to us, including any personal information:

1. To present, operate, and provide our Services and their contents to you, and to meter usage.
2. To provide you with information, products, or services you request from us, and to respond to support requests.
3. To provide you with notices about your account and billing, and to carry out our obligations and enforce our rights arising from contracts between you and us, including billing and collection.
4. To secure the Services and prevent fraud and abuse.
5. To notify you about changes to our Services.
6. For statistics and improvement of the Services (never using the content of your API requests).
7. In any other way we describe when you provide the information, or for any other purpose with your consent.

For users in the European Union and United Kingdom, our legal bases under the GDPR are: performance of a contract (account administration, providing and billing the Services); legitimate interests (securing the Services, preventing abuse, improving the Services, never by using the content of your API requests); legal obligation (accounting, tax, and compliance records); and consent (optional communications, which you may withdraw at any time).

## Disclosure of Your Information

We may disclose aggregated information that does not identify any individual without restriction.

We disclose personal information only as described in this Privacy Policy:

1. To members of our organization who reasonably need access to achieve the purposes set out here, and who are bound by confidentiality obligations.
2. To service providers who help us operate the Services: infrastructure and inference subprocessors (bound by data processing agreements with no-training and limited-retention obligations) and our payment processor.
3. To comply with any court order, law, or legal process, including responding to government or regulatory requests.
4. To enforce or apply our Terms of Service and other agreements, including for billing and collection.
5. If we believe disclosure is necessary to protect the rights, property, or safety of AVELIN, our customers, or others, including for fraud protection.
6. To a buyer or prospective buyer in the event of a merger, acquisition, or sale of all or substantially all of our assets.

We do not sell or share personal information (as those terms are defined under the California Consumer Privacy Act), we have not done so in the preceding twelve (12) months, and we will not do so in the future. We do not use personal information for targeted advertising.

If you follow links from our Services to third-party sites, their privacy policies, not ours, govern.

## Choices About How We Use and Disclose Your Information

*Tracking technologies.* You can set your browser to refuse all or some cookies or to alert you when cookies are being sent; some parts of the Services may then not function properly.

*Marketing communications.* You may opt out of marketing emails by following the unsubscribe instructions in any such email or by contacting hello@avelin.ai. We may still send you service-related communications about your account, billing, or security.

*API content.* Your prompts and completions are not used for training by default, and are not stored in the normal operation of the Services (bounded debugging and security captures are described above), so no training opt-out is required. If you have enabled the optional model-improvement setting (off by default), you may disable it at any time in your account settings, and we will immediately stop deriving new vectors from your prompts.

## Accessing and Correcting Your Information

You can review, correct, update, or delete your personal information by logging into the Services and visiting your account settings, or by emailing hello@avelin.ai to request access to, correction, restriction, transfer, or deletion of personal information you have provided. We cannot delete your personal information except by also deleting your account, and we may decline changes that would violate a legal requirement or make information incorrect. When the legal basis for processing is consent, you may withdraw consent at any time without affecting the lawfulness of processing before withdrawal.

## Your US State Privacy Rights

State consumer privacy laws, including those of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Montana, Oregon, Tennessee, Texas, Utah, and Virginia, may provide their residents with rights to: confirm whether we process their personal information; access, correct, or delete certain personal information; data portability; and opt out of processing for targeted advertising, sales, or profiling in furtherance of decisions that produce legal or similarly significant effects. The exact scope varies by state. To exercise any of these rights, or to appeal a decision regarding a rights request, contact us at hello@avelin.ai. We do not collect protected classification characteristics, biometric information, or precise geolocation, and, as stated above, we do not sell or share personal information.

## EU and UK Users (GDPR)

For users in the European Union we adhere to Regulation (EU) 2016/679 (the "GDPR"), and for users in the United Kingdom, to the UK GDPR as supplemented by the Data Protection Act 2018. Under the GDPR you have the rights to be informed, of access, to rectification, to erasure, to restrict processing, to data portability, and to object. To exercise them, contact hello@avelin.ai. You also have the right to lodge a complaint with a supervisory authority, including directly and without contacting us first. We have not appointed a Data Protection Officer, as we do not fall within the categories of controllers required to do so under Article 37 of the GDPR.

**International transfers.** We operate and serve inference in the United States, the European Union, the United Arab Emirates, and Singapore, and your data may be transferred to, stored, and processed in these jurisdictions. Where personal data of EU or UK users is transferred internationally, we do so only to countries deemed adequate by the European Commission or UK adequacy regulations, or subject to appropriate safeguards such as standard contractual clauses.

## Data Retention

We retain the personal information described in this Privacy Policy for as long as you use our Services, as required by law (for example, tax and accounting requirements), or as otherwise communicated to you. Specifically: prompt and completion content is not stored in normal operation (transient buffers deleted within 5 minutes; bounded debugging or security captures retained no longer than 30 days); security and network logs are kept up to 30 days; API usage metadata and billing records are kept for the life of the account and thereafter as required by law. After an account is deleted, your personal information is removed within thirty (30) days (a limited fraud-prevention hold), subject to legal retention requirements.

## Data Security

We use TLS encryption in transit, encryption at rest for stored metadata, role-based access controls, and network isolation between serving environments. We have implemented measures designed to protect your personal information from accidental loss and unauthorized access, use, alteration, and disclosure, and our staff access data only as needed under confidentiality obligations. However, no security measures are perfect or impenetrable, and we cannot guarantee the security of your information. The safety of your account also depends on you: keep your password and API keys confidential.

## Children Under the Age of 18

Our Services are not intended for children under 18, and we do not knowingly collect their personal information. If you are under 18, do not use the Services or provide any information to us. If we discover we have collected personal information from a child under 18, we will delete it; if you believe we have such information, contact us at hello@avelin.ai.

## Changes to Our Privacy Policy

If we make significant changes to how we handle your personal information, we will notify you by email to the address listed in your account or through a notice on the Services. The date this Privacy Policy was last updated appears at the top of this page. You are responsible for keeping a current, deliverable email address on file and for periodically reviewing this Privacy Policy.

## Contact Information

To ask questions or comment about this Privacy Policy and our privacy practices, or to make a complaint, contact our privacy officer, Yury Akinin, at:

hello@avelin.ai
AVELIN AI, Inc., Delaware, United States
`;function c(){return e.jsx(o,{content:n})}export{c as component};
