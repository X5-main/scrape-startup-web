(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1bec3902-2fad-416b-84a9-57af9957cc14`,e._sentryDebugIdIdentifier=`sentry-dbid-1bec3902-2fad-416b-84a9-57af9957cc14`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BWkHjgsf.js";import{t as d}from"./JPsrybyr.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How a top tier European soccer team sped up their data processing and reduced costs by 50%`,description:`Find out how a top tier European soccer team uses Modal for computer vision on game data`,date:`2024-12-04T12:00:00.000Z`,length:`4 minute read`,category:`Customer Stories`,published:!0,layout:`blog`,toc:[{depth:2,value:`The problem: Processing spatio-temporal match data efficiently`,id:`the-problem-processing-spatio-temporal-match-data-efficiently`},{depth:2,value:`Modal’s solution: serverless batch processing on GPUs`,id:`modals-solution-serverless-batch-processing-on-gpus`},{depth:2,value:`Bonus: Semantic search with embeddings`,id:`bonus-semantic-search-with-embeddings`}],rawContent:`Since the advent of [Moneyball](https://en.wikipedia.org/wiki/Moneyball:_The_Art_of_Winning_an_Unfair_Game),
sports teams around the world have incorporated data analysis into their decision making. At Modal, we’re fortunate to
partner with one of the world’s best soccer teams in their quest to win their championship. To honor their request for anonymity,
we will be referring to them as [AFC Richmond](https://ted-lasso.fandom.com/wiki/AFC_Richmond).

![Computer Vision Soccer](https://modal-cdn.com/cdnbot/soccer-cv0vsttzny_8f133f35.webp)

<modal-img-caption>
Image taken from <a href="https://medium.com/@amritangshu.mukherjee/tracking-football-players-with-yolov5-bytetrack-efa317c9aaa4">Amritangshu Mukherjee’s medium post on tracking soccer players </a>
</modal-img-caption>

## The problem: Processing spatio-temporal match data efficiently

In every match, computer vision systems are deployed to produce large amounts of tracking data for every player. Typical tracking data contains x/y positions
for each of the 22 players and the ball at 25 frames-per-second, resulting in ~3.5 million observations per game. AFC Richmond was looking for a solution to ingest
their tracking data for each frame of a match, run inference on it, and write the results to cloud storage. AFC Richmond uses a custom transformer-based model that takes
as input the unstructured spatio-temporal data from sequences of play, and produces structured outputs and high-dimensional embeddings. These outputs and embeddings are
used for analyzing the performance of the players in different situations: was it the right time to take a shot? How effective was the positioning of the players during a
particular moment? How do other teams handle such situations?

Before Modal, AFC Richmond tried using a GPU cluster on a major cloud provider, but it was not well set up for this workflow and required them to choose from a
limited set of instance types. This limitation meant that AFC Richmond had to pay for larger and more powerful configurations than they needed. Furthermore, long
cluster warmup times (6-8 minutes) added to their costs and made horizontal scaling trickier than they had hoped.

## Modal's solution: serverless batch processing on GPUs

![Workflow diagram](https://modal-cdn.com/cdnbot/soccer-workflow5azt_811_d8df8d28.webp)

AFC Richmond decided to switch over to Modal so that their infrastructure would be more flexible to build on. They didn’t have to worry about underutilization, and containers started up
in a matter of seconds. The usage-based pricing and serverless nature of the product resulted in a 50% cost reduction for processing a full season of games.

Modal is also well set up to scale automatically based on the volume of data inputs. Using Airflow on Modal, AFC Richmond was able to achieve high parallelization,
processing data for games in a matter of minutes rather than hours.

Furthermore, the team loved the smooth developer experience; they were able to get set up and run their first job within hours:

<Quote authorName="Led Tasso" authorTitle="Data Scientist at AFC Richmond">
    <span>
        Modal made it easy to install a minimal set of libraries needed for the specific workflow and provided an easy way to read/write from cloud storage.
        The ability to switch quickly between CPUs and different GPU types made testing and iterating incredibly straightforward, and the smooth web interface made it easy
        for our team to share logs and debug together.
    </span>
</Quote>

## Bonus: Semantic search with embeddings

AFC Richmond also built a lightweight in-memory vector DB on top of Modal, as this turned out to be cheaper than using managed vector DB solutions. This allowed them to make queries
based on the semantic similarity of embeddings generated in the previous steps. As an example: coaching staff can take a particular moment of a match and query for similar situations
that showed up in a different match to determine the best course of action for the players.

We’re excited to partner with AFC Richmond to develop more use cases and are honored that we can indirectly deliver joy to millions of soccer fans around the world.
`,meta:{description:`Find out how a top tier European soccer team uses Modal for computer vision on game data`}},{title:h,description:g,date:_,length:v,category:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<span>Modal made it easy to install a minimal set of libraries needed for the specific workflow and provided an easy way to read/write from cloud storage.
        The ability to switch quickly between CPUs and different GPU types made testing and iterating incredibly straightforward, and the smooth web interface made it easy
        for our team to share logs and debug together.</span>`),E=t(`<p>Since the advent of <!>,
sports teams around the world have incorporated data analysis into their decision making. At Modal, we’re fortunate to
partner with one of the world’s best soccer teams in their quest to win their championship. To honor their request for anonymity,
we will be referring to them as <!>.</p> <p><!></p> <modal-img-caption>Image taken from <a href="https://medium.com/@amritangshu.mukherjee/tracking-football-players-with-yolov5-bytetrack-efa317c9aaa4">Amritangshu Mukherjee’s medium post on tracking soccer players</a></modal-img-caption> <h2 id="the-problem-processing-spatio-temporal-match-data-efficiently">The problem: Processing spatio-temporal match data efficiently</h2> <p>In every match, computer vision systems are deployed to produce large amounts of tracking data for every player. Typical tracking data contains x/y positions
for each of the 22 players and the ball at 25 frames-per-second, resulting in ~3.5 million observations per game. AFC Richmond was looking for a solution to ingest
their tracking data for each frame of a match, run inference on it, and write the results to cloud storage. AFC Richmond uses a custom transformer-based model that takes
as input the unstructured spatio-temporal data from sequences of play, and produces structured outputs and high-dimensional embeddings. These outputs and embeddings are
used for analyzing the performance of the players in different situations: was it the right time to take a shot? How effective was the positioning of the players during a
particular moment? How do other teams handle such situations?</p> <p>Before Modal, AFC Richmond tried using a GPU cluster on a major cloud provider, but it was not well set up for this workflow and required them to choose from a
limited set of instance types. This limitation meant that AFC Richmond had to pay for larger and more powerful configurations than they needed. Furthermore, long
cluster warmup times (6-8 minutes) added to their costs and made horizontal scaling trickier than they had hoped.</p> <h2 id="modals-solution-serverless-batch-processing-on-gpus">Modal’s solution: serverless batch processing on GPUs</h2> <p><!></p> <p>AFC Richmond decided to switch over to Modal so that their infrastructure would be more flexible to build on. They didn’t have to worry about underutilization, and containers started up
in a matter of seconds. The usage-based pricing and serverless nature of the product resulted in a 50% cost reduction for processing a full season of games.</p> <p>Modal is also well set up to scale automatically based on the volume of data inputs. Using Airflow on Modal, AFC Richmond was able to achieve high parallelization,
processing data for games in a matter of minutes rather than hours.</p> <p>Furthermore, the team loved the smooth developer experience; they were able to get set up and run their first job within hours:</p> <!> <h2 id="bonus-semantic-search-with-embeddings">Bonus: Semantic search with embeddings</h2> <p>AFC Richmond also built a lightweight in-memory vector DB on top of Modal, as this turned out to be cheaper than using managed vector DB solutions. This allowed them to make queries
based on the semantic similarity of embeddings generated in the previous steps. As an example: coaching staff can take a particular moment of a match and query for similar situations
that showed up in a different match to determine the best course of action for the players.</p> <p>We’re excited to partner with AFC Richmond to develop more use cases and are honored that we can indirectly deliver joy to millions of soccer fans around the world.</p>`,3);function D(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=E(),p=s(o),m=c(e(p));f(m,{href:`https://en.wikipedia.org/wiki/Moneyball:_The_Art_of_Winning_an_Unfair_Game`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Moneyball`))},$$slots:{default:!0}}),f(c(m,2),{href:`https://ted-lasso.fandom.com/wiki/AFC_Richmond`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AFC Richmond`))},$$slots:{default:!0}}),l(),n(p);var h=c(p,2);d(e(h),{src:`https://modal-cdn.com/cdnbot/soccer-cv0vsttzny_8f133f35.webp`,alt:`Computer Vision Soccer`}),n(h);var g=c(c(h,2),10);d(e(g),{src:`https://modal-cdn.com/cdnbot/soccer-workflow5azt_811_d8df8d28.webp`,alt:`Workflow diagram`}),n(g),u(c(g,8),{authorName:`Led Tasso`,authorTitle:`Data Scientist at AFC Richmond`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(6),i(t,o)},$$slots:{default:!0}}))}export{D as default,m as metadata};
//# sourceMappingURL=CPAOzMmS.js.map
