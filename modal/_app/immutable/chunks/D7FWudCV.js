(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`cdf5ef75-6aef-45bb-a10b-ca67a76e5802`,e._sentryDebugIdIdentifier=`sentry-dbid-cdf5ef75-6aef-45bb-a10b-ca67a76e5802`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{n as u}from"./JPsrybyr.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Batch processing vs. stream processing by example`,description:`Understand the crucial differences between batch processing and stream processing by example`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-04T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Data Infrastructure`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is batch processing?`,id:`what-is-batch-processing`,children:[{depth:3,value:`Examples`,id:`examples`},{depth:3,value:`Technologies`,id:`technologies`}]},{depth:2,value:`What is stream processing?`,id:`what-is-stream-processing`,children:[{depth:3,value:`Examples`,id:`examples-1`},{depth:3,value:`Technologies`,id:`technologies-1`,children:[{depth:4,value:`Message brokers`,id:`message-brokers`},{depth:4,value:`Streaming frameworks`,id:`streaming-frameworks`},{depth:4,value:`Streaming databases`,id:`streaming-databases`}]}]},{depth:2,value:`Use cases`,id:`use-cases`}],rawContent:`Batch processing and stream processing are two different approaches to data processing. Batch processing involves collecting data over time and processing it in large chunks at scheduled intevals. Stream processing, on the other hand, processes data in real time as it arrives. In this blog post, we'll illustrate them both with examples.

|                           | Batch Processing                                                                             | Stream Processing                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Implementation difficulty | Traditionally easier to implement and to handle failures, since there is built-in slack time | More complex, often requires specialized infrastructure, difficult to handle failures and recovery |
| Latency                   | Higher latency (minutes to hours)                                                            | Low latency (seconds or less)                                                                      |
| Cost                      | Generally more cost effective, especially because you can run batch jobs in off-peak hours   | Can be more expensive due to constant processing                                                   |

## What is batch processing?

Batch processing involves collecting data over time and processing it in large chunks at scheduled intervals. This method is ideal for handling large volumes of data where immediate results are not critical.

### Examples

- Web scraping scripts that collect data from PDF files on a fixed hourly schedule
- Processing new files from a file store every 10 minutes or hour
- Scheduled reading of messages from a queue (e.g., every 10 minutes)
- Manually initiated processes for handling accumulated data
- Hourly data transfers from OLTP storage or NoSQL databases to data lakes/warehouses

### Technologies

Batch processing is traditionally how data warehouses and ETL pipelines operate, going back to the days of "big data" and Hadoop. Many of the orchestrators and frameworks below, then, were built in the batch processing paradigm.

- [Hadoop](https://hadoop.apache.org/)
- [Spark](https://spark.apache.org/)
- [Airflow](https://airflow.apache.org/)
- [Luigi](https://github.com/spotify/luigi)

## What is stream processing?

Stream processing, in contrast, handles each data item in real-time as it arrives. This method is perfect for scenarios requiring immediate data processing and analysis. Anything labeled "real-time" or "live" likely involves stream processing.

It's important to note that stream processing isn't just short-interval batch processing! Batch processing processes data in discrete chunks even if those chunks are small!

### Examples

- Real-time event processing through APIs and message queues
- Continuous data processing from IoT devices like cars or weather stations
- Instant processing of social media posts for immediate timeline updates
- Trigger-based processing when new data appears (e.g., file uploads)

### Technologies

Traditionally, stream processing has been more complex to implement than batch processing. In stream processing, one has to deal with things like state management, consistency, and ensuring that each event is processed exactly once. There are a number of frameworks that have been developed to enable this and make it easier.

#### Message brokers

- [Kafka](https://kafka.apache.org/)
- [AWS SQS](https://aws.amazon.com/sqs/)
- [RabbitMQ](https://www.rabbitmq.com/)

Message brokers like Apache Kafka and Amazon SQS (Simple Queue Service) play a crucial role in enabling stream processing. They ingest and buffer streaming data, ensure reliable delivery of messages/events, and allow multiple consumers to read from the same stream of data.

#### Streaming frameworks

- [Flink](https://flink.apache.org/)
- [Kafka Streams](https://kafka.apache.org/documentation/streams/)

Streaming frameworks like Apache Flink and Kafka Streams provide the tools to process and analyze streaming data in real-time. They offer features like windowing, state management, and fault tolerance to handle the complexities of stream processing.

#### Streaming databases

- [Materialize](https://materialize.com/)
- [Apache Pinot](https://pinot.apache.org/)
- [Apache Kinesis](https://aws.amazon.com/kinesis/)

Streaming databases are a new category of databases designed to handle real-time data processing and analytics. They provide low-latency access to streaming data, enabling real-time dashboards, analytics, and decision-making.

## Use cases

**Feature engineering for rec sys:** use batch processing (okay for models to train on data lag)

**Fraud detection:** use stream processing (can't wait a day for fraud)

**BI / Analytics:** use batch processing (easier to manage, generally okay with 1 day of data lag)

**Trading desk:** use stream processing (need to be able to react to real time news / data)
`,meta:{description:`Understand the crucial differences between batch processing and stream processing by example`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<thead><tr><th></th><th>Batch Processing</th><th>Stream Processing</th></tr></thead> <tbody><tr><td>Implementation difficulty</td><td>Traditionally easier to implement and to handle failures, since there is built-in slack time</td><td>More complex, often requires specialized infrastructure, difficult to handle failures and recovery</td></tr><tr><td>Latency</td><td>Higher latency (minutes to hours)</td><td>Low latency (seconds or less)</td></tr><tr><td>Cost</td><td>Generally more cost effective, especially because you can run batch jobs in off-peak hours</td><td>Can be more expensive due to constant processing</td></tr></tbody>`,1),D=t(`<p>Batch processing and stream processing are two different approaches to data processing. Batch processing involves collecting data over time and processing it in large chunks at scheduled intevals. Stream processing, on the other hand, processes data in real time as it arrives. In this blog post, we’ll illustrate them both with examples.</p> <!> <h2 id="what-is-batch-processing">What is batch processing?</h2> <p>Batch processing involves collecting data over time and processing it in large chunks at scheduled intervals. This method is ideal for handling large volumes of data where immediate results are not critical.</p> <h3 id="examples">Examples</h3> <ul><li>Web scraping scripts that collect data from PDF files on a fixed hourly schedule</li> <li>Processing new files from a file store every 10 minutes or hour</li> <li>Scheduled reading of messages from a queue (e.g., every 10 minutes)</li> <li>Manually initiated processes for handling accumulated data</li> <li>Hourly data transfers from OLTP storage or NoSQL databases to data lakes/warehouses</li></ul> <h3 id="technologies">Technologies</h3> <p>Batch processing is traditionally how data warehouses and ETL pipelines operate, going back to the days of “big data” and Hadoop. Many of the orchestrators and frameworks below, then, were built in the batch processing paradigm.</p> <ul><li><!></li> <li><!></li> <li><!></li> <li><!></li></ul> <h2 id="what-is-stream-processing">What is stream processing?</h2> <p>Stream processing, in contrast, handles each data item in real-time as it arrives. This method is perfect for scenarios requiring immediate data processing and analysis. Anything labeled “real-time” or “live” likely involves stream processing.</p> <p>It’s important to note that stream processing isn’t just short-interval batch processing! Batch processing processes data in discrete chunks even if those chunks are small!</p> <h3 id="examples-1">Examples</h3> <ul><li>Real-time event processing through APIs and message queues</li> <li>Continuous data processing from IoT devices like cars or weather stations</li> <li>Instant processing of social media posts for immediate timeline updates</li> <li>Trigger-based processing when new data appears (e.g., file uploads)</li></ul> <h3 id="technologies-1">Technologies</h3> <p>Traditionally, stream processing has been more complex to implement than batch processing. In stream processing, one has to deal with things like state management, consistency, and ensuring that each event is processed exactly once. There are a number of frameworks that have been developed to enable this and make it easier.</p> <h4 id="message-brokers">Message brokers</h4> <ul><li><!></li> <li><!></li> <li><!></li></ul> <p>Message brokers like Apache Kafka and Amazon SQS (Simple Queue Service) play a crucial role in enabling stream processing. They ingest and buffer streaming data, ensure reliable delivery of messages/events, and allow multiple consumers to read from the same stream of data.</p> <h4 id="streaming-frameworks">Streaming frameworks</h4> <ul><li><!></li> <li><!></li></ul> <p>Streaming frameworks like Apache Flink and Kafka Streams provide the tools to process and analyze streaming data in real-time. They offer features like windowing, state management, and fault tolerance to handle the complexities of stream processing.</p> <h4 id="streaming-databases">Streaming databases</h4> <ul><li><!></li> <li><!></li> <li><!></li></ul> <p>Streaming databases are a new category of databases designed to handle real-time data processing and analytics. They provide low-latency access to streaming data, enabling real-time dashboards, analytics, and decision-making.</p> <h2 id="use-cases">Use cases</h2> <p><strong>Feature engineering for rec sys:</strong> use batch processing (okay for models to train on data lag)</p> <p><strong>Fraud detection:</strong> use stream processing (can’t wait a day for fraud)</p> <p><strong>BI / Analytics:</strong> use batch processing (easier to manage, generally okay with 1 day of data lag)</p> <p><strong>Trading desk:</strong> use stream processing (need to be able to react to real time news / data)</p>`,1);function O(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=D(),f=c(s(o),2);u(f,{children:(e,t)=>{var n=E();l(2),i(e,n)},$$slots:{default:!0}});var p=c(f,14),m=e(p);d(e(m),{href:`https://hadoop.apache.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Hadoop`))},$$slots:{default:!0}}),n(m);var h=c(m,2);d(e(h),{href:`https://spark.apache.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Spark`))},$$slots:{default:!0}}),n(h);var g=c(h,2);d(e(g),{href:`https://airflow.apache.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Airflow`))},$$slots:{default:!0}}),n(g);var _=c(g,2);d(e(_),{href:`https://github.com/spotify/luigi`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Luigi`))},$$slots:{default:!0}}),n(_),n(p);var v=c(p,18),y=e(v);d(e(y),{href:`https://kafka.apache.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kafka`))},$$slots:{default:!0}}),n(y);var b=c(y,2);d(e(b),{href:`https://aws.amazon.com/sqs/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS SQS`))},$$slots:{default:!0}}),n(b);var x=c(b,2);d(e(x),{href:`https://www.rabbitmq.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RabbitMQ`))},$$slots:{default:!0}}),n(x),n(v);var S=c(v,6),C=e(S);d(e(C),{href:`https://flink.apache.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Flink`))},$$slots:{default:!0}}),n(C);var w=c(C,2);d(e(w),{href:`https://kafka.apache.org/documentation/streams/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Kafka Streams`))},$$slots:{default:!0}}),n(w),n(S);var T=c(S,6),O=e(T);d(e(O),{href:`https://materialize.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Materialize`))},$$slots:{default:!0}}),n(O);var k=c(O,2);d(e(k),{href:`https://pinot.apache.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Apache Pinot`))},$$slots:{default:!0}}),n(k);var A=c(k,2);d(e(A),{href:`https://aws.amazon.com/kinesis/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Apache Kinesis`))},$$slots:{default:!0}}),n(A),n(T),l(12),i(t,o)},$$slots:{default:!0}}))}export{O as default,p as metadata};
//# sourceMappingURL=D7FWudCV.js.map
