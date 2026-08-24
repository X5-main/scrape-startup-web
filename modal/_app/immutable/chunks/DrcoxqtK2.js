(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f51ed102-5739-44f8-8b6e-5ca673682571`,e._sentryDebugIdIdentifier=`sentry-dbid-f51ed102-5739-44f8-8b6e-5ca673682571`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`How to deploy code in AWS Lambda: the easy way for beginners`,description:`Deploying your first Lambda function using AWS SAM`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-14T12:00:00.000Z`,length:`10 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`Enter AWS Serverless Application Model (SAM)`,id:`enter-aws-serverless-application-model-sam`},{depth:2,value:`Step 1: Install the AWS CLI`,id:`step-1-install-the-aws-cli`},{depth:2,value:`Step 2: Install AWS SAM CLI`,id:`step-2-install-aws-sam-cli`},{depth:2,value:`Step 3: Initialize a SAM Project`,id:`step-3-initialize-a-sam-project`},{depth:2,value:`Step 4: Explore and Modify the Code`,id:`step-4-explore-and-modify-the-code`},{depth:2,value:`Step 5: Deploy Your Function`,id:`step-5-deploy-your-function`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`When you're new to AWS Lambda, you might be tempted to follow [the official documentation's](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html) suggestion to create and deploy functions using the AWS Management Console's graphical user interface (GUI). While this method is straightforward for simple functions, it makes it difficult to track changes and do version control. As your project grows, you'll find it challenging to manage dependencies and scale your application.

## Enter AWS Serverless Application Model (SAM)

Given these limitations, we recommend instead using the [AWS Serverless Application Model](https://aws.amazon.com/serverless/sam/) (SAM) for deploying Lambda functions. AWS SAM is an open-source framework allows you to use a single YAML file to define your entire serverless stack, including Amazon API Gateway APIs, AWS Lambda functions, and Amazon DynamoDB tables.

SAM offers several advantages:

1. **Infrastructure as Code**: Your entire application, including Lambda functions, API Gateway, and other resources, can be defined in a single YAML file.
2. **Local Testing**: SAM allows you to test your functions locally before deploying.
3. **Simplified Deployment**: One command to package and deploy your entire application.
4. **Version Control Friendly**: SAM templates and function code can be easily version controlled.
5. **CI/CD Integration**: Easily integrate with CI/CD pipelines for automated testing and deployment.

## Step 1: Install the AWS CLI

Before we start with SAM, you need to have the AWS CLI installed. This will allow you to interact with AWS services from your command line.

1. Install the AWS CLI by following the instructions for your operating system:
   [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

2. After installation, configure your AWS credentials:
   \`\`\`
   aws configure
   \`\`\`
   You'll need to enter your AWS Access Key ID, Secret Access Key, default region, and output format.

## Step 2: Install AWS SAM CLI

Next, we'll install the AWS SAM CLI, which is the main tool we'll use for deploying our Lambda function.

1. Follow the installation instructions for your operating system:
   [AWS SAM CLI Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

2. Verify the installation by running:
   \`\`\`
   sam --version
   \`\`\`

## Step 3: Initialize a SAM Project

Now that we have SAM installed, let's create a new project.

1. Open your terminal and navigate to a directory where you want to create your project.

2. Run the following command:

   \`\`\`
   sam init
   \`\`\`

3. You'll be prompted with several options. Here's a typical selection for a beginner:
   - Choose an AWS Quick Start Template
   - AWS Quick Start Template: Hello World Example
   - Use the most popular runtime and package type? (Python and zip): Y
   - Would you like to enable X-Ray tracing?: N
   - Would you like to enable monitoring?: Y
   - Project name: hello-world-sam (or any name you prefer)

This will create a new directory with your project name, containing a basic Lambda function and SAM template.

## Step 4: Explore and Modify the Code

Let's take a look at the generated code and make a small modification.

1. Navigate into your project directory:

   \`\`\`
   cd hello-world-sam
   \`\`\`

2. Open the \`hello_world/app.py\` file in your favorite text editor. You'll see a basic Lambda function that returns a JSON response.

3. Let's modify the message. Change the \`message\` variable to something like:

   \`\`\`python
   message = f'Hello {event["name"]}! Welcome to AWS Lambda with SAM!'
   \`\`\`

4. Save the file.

## Step 5: Deploy Your Function

Now it's time to deploy your Lambda function to AWS.

1. In your project directory, run:

   \`\`\`
   sam deploy --guided
   \`\`\`

2. You'll be prompted to provide some information:
   - Stack Name: Choose a name for your CloudFormation stack
   - AWS Region: Choose your preferred region
   - Confirm changes before deploy: Y
   - Allow SAM CLI IAM role creation: Y
   - Disable rollback: N
   - Save arguments to samconfig.toml: Y

3. SAM will now package and deploy your application. This process may take a few minutes.

4. Once completed, you'll see outputs including the API Gateway endpoint URL where you can invoke your function.

Congratulations! You've just deployed your first Lambda function using AWS SAM.

## Conclusion

You've now successfully deployed a Lambda function using AWS SAM. This method provides a straightforward, repeatable process for deploying serverless applications. As you become more comfortable with SAM, you can explore more advanced features like local testing, adding more resources to your template, and setting up CI/CD pipelines.

Remember, while AWS Lambda is a powerful tool, you might find that Modal's platform offers even simpler deployment processes with additional benefits. We encourage you to explore how Modal can further streamline your serverless development and deployment workflows.
`,meta:{description:`Deploying your first Lambda function using AWS SAM`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<p>When you’re new to AWS Lambda, you might be tempted to follow <!> suggestion to create and deploy functions using the AWS Management Console’s graphical user interface (GUI). While this method is straightforward for simple functions, it makes it difficult to track changes and do version control. As your project grows, you’ll find it challenging to manage dependencies and scale your application.</p> <h2 id="enter-aws-serverless-application-model-sam">Enter AWS Serverless Application Model (SAM)</h2> <p>Given these limitations, we recommend instead using the <!> (SAM) for deploying Lambda functions. AWS SAM is an open-source framework allows you to use a single YAML file to define your entire serverless stack, including Amazon API Gateway APIs, AWS Lambda functions, and Amazon DynamoDB tables.</p> <p>SAM offers several advantages:</p> <ol><li><strong>Infrastructure as Code</strong>: Your entire application, including Lambda functions, API Gateway, and other resources, can be defined in a single YAML file.</li> <li><strong>Local Testing</strong>: SAM allows you to test your functions locally before deploying.</li> <li><strong>Simplified Deployment</strong>: One command to package and deploy your entire application.</li> <li><strong>Version Control Friendly</strong>: SAM templates and function code can be easily version controlled.</li> <li><strong>CI/CD Integration</strong>: Easily integrate with CI/CD pipelines for automated testing and deployment.</li></ol> <h2 id="step-1-install-the-aws-cli">Step 1: Install the AWS CLI</h2> <p>Before we start with SAM, you need to have the AWS CLI installed. This will allow you to interact with AWS services from your command line.</p> <ol><li><p>Install the AWS CLI by following the instructions for your operating system: <!></p></li> <li><p>After installation, configure your AWS credentials:</p> <!> <p>You’ll need to enter your AWS Access Key ID, Secret Access Key, default region, and output format.</p></li></ol> <h2 id="step-2-install-aws-sam-cli">Step 2: Install AWS SAM CLI</h2> <p>Next, we’ll install the AWS SAM CLI, which is the main tool we’ll use for deploying our Lambda function.</p> <ol><li><p>Follow the installation instructions for your operating system: <!></p></li> <li><p>Verify the installation by running:</p> <!></li></ol> <h2 id="step-3-initialize-a-sam-project">Step 3: Initialize a SAM Project</h2> <p>Now that we have SAM installed, let’s create a new project.</p> <ol><li><p>Open your terminal and navigate to a directory where you want to create your project.</p></li> <li><p>Run the following command:</p> <!></li> <li><p>You’ll be prompted with several options. Here’s a typical selection for a beginner:</p> <ul><li>Choose an AWS Quick Start Template</li> <li>AWS Quick Start Template: Hello World Example</li> <li>Use the most popular runtime and package type? (Python and zip): Y</li> <li>Would you like to enable X-Ray tracing?: N</li> <li>Would you like to enable monitoring?: Y</li> <li>Project name: hello-world-sam (or any name you prefer)</li></ul></li></ol> <p>This will create a new directory with your project name, containing a basic Lambda function and SAM template.</p> <h2 id="step-4-explore-and-modify-the-code">Step 4: Explore and Modify the Code</h2> <p>Let’s take a look at the generated code and make a small modification.</p> <ol><li><p>Navigate into your project directory:</p> <!></li> <li><p>Open the <code>hello_world/app.py</code> file in your favorite text editor. You’ll see a basic Lambda function that returns a JSON response.</p></li> <li><p>Let’s modify the message. Change the <code>message</code> variable to something like:</p> <!></li> <li><p>Save the file.</p></li></ol> <h2 id="step-5-deploy-your-function">Step 5: Deploy Your Function</h2> <p>Now it’s time to deploy your Lambda function to AWS.</p> <ol><li><p>In your project directory, run:</p> <!></li> <li><p>You’ll be prompted to provide some information:</p> <ul><li>Stack Name: Choose a name for your CloudFormation stack</li> <li>AWS Region: Choose your preferred region</li> <li>Confirm changes before deploy: Y</li> <li>Allow SAM CLI IAM role creation: Y</li> <li>Disable rollback: N</li> <li>Save arguments to samconfig.toml: Y</li></ul></li> <li><p>SAM will now package and deploy your application. This process may take a few minutes.</p></li> <li><p>Once completed, you’ll see outputs including the API Gateway endpoint URL where you can invoke your function.</p></li></ol> <p>Congratulations! You’ve just deployed your first Lambda function using AWS SAM.</p> <h2 id="conclusion">Conclusion</h2> <p>You’ve now successfully deployed a Lambda function using AWS SAM. This method provides a straightforward, repeatable process for deploying serverless applications. As you become more comfortable with SAM, you can explore more advanced features like local testing, adding more resources to your template, and setting up CI/CD pipelines.</p> <p>Remember, while AWS Lambda is a powerful tool, you might find that Modal’s platform offers even simpler deployment processes with additional benefits. We encourage you to explore how Modal can further streamline your serverless development and deployment workflows.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=s(o);d(c(e(f)),{href:`https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the official documentation’s`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,4);d(c(e(p)),{href:`https://aws.amazon.com/serverless/sam/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS Serverless Application Model`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,10),h=e(m),g=e(h);d(c(e(g)),{href:`https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS CLI Installation Guide`))},$$slots:{default:!0}}),n(g),n(h);var _=c(h,2);u(c(e(_),2),{code:`aws%20configure`,lang:`text`}),l(2),n(_),n(m);var v=c(m,6),y=e(v),b=e(y);d(c(e(b)),{href:`https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS SAM CLI Installation Guide`))},$$slots:{default:!0}}),n(b),n(y);var x=c(y,2);u(c(e(x),2),{code:`sam%20--version`,lang:`text`}),n(x),n(v);var S=c(v,6),C=c(e(S),2);u(c(e(C),2),{code:`sam%20init`,lang:`text`}),n(C),l(2),n(S);var w=c(S,8),T=e(w);u(c(e(T),2),{code:`cd%20hello-world-sam`,lang:`text`}),n(T);var D=c(T,4);u(c(e(D),2),{code:`message%20%3D%20f'Hello%20%7Bevent%5B%22name%22%5D%7D!%20Welcome%20to%20AWS%20Lambda%20with%20SAM!'`,lang:`python`}),n(D),l(2),n(w);var O=c(w,6),k=e(O);u(c(e(k),2),{code:`sam%20deploy%20--guided`,lang:`text`}),n(k),l(6),n(O),l(8),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=DrcoxqtK2.js.map
