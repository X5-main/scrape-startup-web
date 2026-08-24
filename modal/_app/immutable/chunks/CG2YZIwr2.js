(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6ef32fdb-823e-40fb-9bc7-7c4eee8a549d`,e._sentryDebugIdIdentifier=`sentry-dbid-6ef32fdb-823e-40fb-9bc7-7c4eee8a549d`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as s}from"./BILrvr3I.js";import{t as c}from"./CdZDxCfO2.js";var l={title:`Upload files to S3 with AWS Lambda and AWS API Gateway in TypeScript: A Step-by-Step Guide`,description:`Learn how to create a serverless solution for uploading JPEG images to Amazon S3 using AWS API Gateway and Lambda with TypeScript`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-04T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Step 1: Set Up the Project`,id:`step-1-set-up-the-project`},{depth:2,value:`Step 2: Create the Lambda Function`,id:`step-2-create-the-lambda-function`},{depth:2,value:`Step 3: Create the SAM Template`,id:`step-3-create-the-sam-template`},{depth:2,value:`Step 4: Build and Deploy`,id:`step-4-build-and-deploy`},{depth:2,value:`Step 5: Test Your API`,id:`step-5-test-your-api`},{depth:2,value:`Conclusion`,id:`conclusion`}],rawContent:`Are you looking to create a serverless solution for uploading JPEG images to Amazon S3 using AWS API Gateway and Lambda? This guide will walk you through creating an API Gateway endpoint that uploads JPEG images to an S3 bucket using AWS Lambda, with the added feature of using a "filename" parameter to name the S3 object. We'll be using TypeScript to write our Lambda function, ensuring type safety and improved developer experience.

## Prerequisites

Before we begin, make sure you have:

1. An AWS account
2. AWS CLI installed and configured
3. Node.js and npm installed
4. TypeScript installed globally (\`npm install -g typescript\`)
5. AWS SAM CLI installed

## Step 1: Set Up the Project

First, let's create a new directory for our project and initialize it:

\`\`\`bash
mkdir aws-image-upload
cd aws-image-upload
npm init -y
npm install aws-sdk @types/aws-lambda @types/node typescript
npm install --save-dev @types/aws-sdk
\`\`\`

Create a \`tsconfig.json\` file in the root directory:

\`\`\`json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
\`\`\`

## Step 2: Create the Lambda Function

Create a new file \`src/index.ts\` and add the following code:

\`\`\`javascript
import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";

const s3 = new S3();

export const handler: APIGatewayProxyHandler = async (event) => {
  if (!event.body || !event.queryStringParameters?.filename) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing file or filename parameter" }),
    };
  }

  const filename = event.queryStringParameters.filename;
  const fileContent = Buffer.from(event.body, "base64");

  if (
    !filename.toLowerCase().endsWith(".jpg") &&
    !filename.toLowerCase().endsWith(".jpeg")
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "File must be a JPEG image" }),
    };
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: filename,
    Body: fileContent,
    ContentType: "image/jpeg",
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File uploaded successfully",
        fileUrl: result.Location,
      }),
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error uploading file" }),
    };
  }
};
\`\`\`

This Lambda function does the following:

1. Checks for the presence of the file content and filename parameter
2. Verifies that the file is a JPEG image
3. Uploads the file to S3 using the provided filename
4. Returns a success message with the file URL or an error message

## Step 3: Create the SAM Template

Create a \`template.yaml\` file in the root directory:

\`\`\`yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: API Gateway for uploading JPEG images to S3

Resources:
  ImageUploadFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/index.handler
      Runtime: nodejs20.x
      CodeUri: ./
      Environment:
        Variables:
          S3_BUCKET_NAME: !Ref UploadBucket
      Policies:
        - S3CrudPolicy:
            BucketName: !Ref UploadBucket
      Events:
        UploadAPI:
          Type: Api
          Properties:
            Path: /upload
            Method: post

  UploadBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub \${AWS::StackName}-uploads
      AccessControl: Private

Outputs:
  ApiUrl:
    Description: URL of the API endpoint
    Value: !Sub "https://\${ServerlessRestApi}.execute-api.\${AWS::Region}.amazonaws.com/Prod/upload"
\`\`\`

This SAM template sets up:

1. A Lambda function with the necessary permissions
2. An S3 bucket for storing the uploaded images
3. An API Gateway endpoint that triggers the Lambda function

## Step 4: Build and Deploy

First, compile your TypeScript code:

\`\`\`bash
npx tsc
\`\`\`

Then, use SAM CLI to build and deploy your application:

\`\`\`bash
sam build
sam deploy --guided
\`\`\`

Follow the prompts to complete the deployment. Once finished, you'll receive an API endpoint URL.

## Step 5: Test Your API

You can test your new API using cURL. Replace \`YOUR_API_ENDPOINT\` with the URL provided after deployment:

\`\`\`bash
curl -X POST \\
  'YOUR_API_ENDPOINT?filename=test-image.jpg' \\
  --data-binary '@/path/to/your/image.jpg' \\
  -H 'Content-Type: image/jpeg'
\`\`\`

This command sends a POST request to your API with the image file and the filename parameter.

## Conclusion

Congratulations! You've successfully created an AWS API Gateway endpoint that uploads JPEG images to an S3 bucket using AWS Lambda and TypeScript. This serverless solution provides a scalable and efficient way to handle image uploads in your applications.

Remember to implement additional security measures such as authentication and input validation based on your specific use case.
`,meta:{description:`Learn how to create a serverless solution for uploading JPEG images to Amazon S3 using AWS API Gateway and Lambda with TypeScript`}},{title:u,description:d,authors:f,date:p,length:m,category:h,subcategory:g,published:_,layout:v,toc:y,rawContent:b,meta:x}=l,S=e(`<p>Are you looking to create a serverless solution for uploading JPEG images to Amazon S3 using AWS API Gateway and Lambda? This guide will walk you through creating an API Gateway endpoint that uploads JPEG images to an S3 bucket using AWS Lambda, with the added feature of using a “filename” parameter to name the S3 object. We’ll be using TypeScript to write our Lambda function, ensuring type safety and improved developer experience.</p> <h2 id="prerequisites">Prerequisites</h2> <p>Before we begin, make sure you have:</p> <ol><li>An AWS account</li> <li>AWS CLI installed and configured</li> <li>Node.js and npm installed</li> <li>TypeScript installed globally (<code>npm install -g typescript</code>)</li> <li>AWS SAM CLI installed</li></ol> <h2 id="step-1-set-up-the-project">Step 1: Set Up the Project</h2> <p>First, let’s create a new directory for our project and initialize it:</p> <!> <p>Create a <code>tsconfig.json</code> file in the root directory:</p> <!> <h2 id="step-2-create-the-lambda-function">Step 2: Create the Lambda Function</h2> <p>Create a new file <code>src/index.ts</code> and add the following code:</p> <!> <p>This Lambda function does the following:</p> <ol><li>Checks for the presence of the file content and filename parameter</li> <li>Verifies that the file is a JPEG image</li> <li>Uploads the file to S3 using the provided filename</li> <li>Returns a success message with the file URL or an error message</li></ol> <h2 id="step-3-create-the-sam-template">Step 3: Create the SAM Template</h2> <p>Create a <code>template.yaml</code> file in the root directory:</p> <!> <p>This SAM template sets up:</p> <ol><li>A Lambda function with the necessary permissions</li> <li>An S3 bucket for storing the uploaded images</li> <li>An API Gateway endpoint that triggers the Lambda function</li></ol> <h2 id="step-4-build-and-deploy">Step 4: Build and Deploy</h2> <p>First, compile your TypeScript code:</p> <!> <p>Then, use SAM CLI to build and deploy your application:</p> <!> <p>Follow the prompts to complete the deployment. Once finished, you’ll receive an API endpoint URL.</p> <h2 id="step-5-test-your-api">Step 5: Test Your API</h2> <p>You can test your new API using cURL. Replace <code>YOUR_API_ENDPOINT</code> with the URL provided after deployment:</p> <!> <p>This command sends a POST request to your API with the image file and the filename parameter.</p> <h2 id="conclusion">Conclusion</h2> <p>Congratulations! You’ve successfully created an AWS API Gateway endpoint that uploads JPEG images to an S3 bucket using AWS Lambda and TypeScript. This serverless solution provides a scalable and efficient way to handle image uploads in your applications.</p> <p>Remember to implement additional security measures such as authentication and input validation based on your specific use case.</p>`,1);function C(e,u){let d=n(u,[`children`,`$$slots`,`$$events`,`$$legacy`]);c(e,r(()=>d,()=>l,{children:(e,n)=>{var r=S(),c=a(i(r),12);s(c,{code:`mkdir%20aws-image-upload%0Acd%20aws-image-upload%0Anpm%20init%20-y%0Anpm%20install%20aws-sdk%20%40types%2Faws-lambda%20%40types%2Fnode%20typescript%0Anpm%20install%20--save-dev%20%40types%2Faws-sdk`,lang:`bash`});var l=a(c,4);s(l,{code:`%7B%0A%20%20%22compilerOptions%22%3A%20%7B%0A%20%20%20%20%22target%22%3A%20%22es2018%22%2C%0A%20%20%20%20%22module%22%3A%20%22commonjs%22%2C%0A%20%20%20%20%22strict%22%3A%20true%2C%0A%20%20%20%20%22esModuleInterop%22%3A%20true%2C%0A%20%20%20%20%22outDir%22%3A%20%22.%2Fdist%22%0A%20%20%7D%2C%0A%20%20%22include%22%3A%20%5B%22src%2F**%2F*%22%5D%2C%0A%20%20%22exclude%22%3A%20%5B%22node_modules%22%5D%0A%7D`,lang:`json`});var u=a(l,6);s(u,{code:`import%20%7B%20APIGatewayProxyHandler%20%7D%20from%20%22aws-lambda%22%3B%0Aimport%20%7B%20S3%20%7D%20from%20%22aws-sdk%22%3B%0A%0Aconst%20s3%20%3D%20new%20S3()%3B%0A%0Aexport%20const%20handler%3A%20APIGatewayProxyHandler%20%3D%20async%20(event)%20%3D%3E%20%7B%0A%20%20if%20(!event.body%20%7C%7C%20!event.queryStringParameters%3F.filename)%20%7B%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20statusCode%3A%20400%2C%0A%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20message%3A%20%22Missing%20file%20or%20filename%20parameter%22%20%7D)%2C%0A%20%20%20%20%7D%3B%0A%20%20%7D%0A%0A%20%20const%20filename%20%3D%20event.queryStringParameters.filename%3B%0A%20%20const%20fileContent%20%3D%20Buffer.from(event.body%2C%20%22base64%22)%3B%0A%0A%20%20if%20(%0A%20%20%20%20!filename.toLowerCase().endsWith(%22.jpg%22)%20%26%26%0A%20%20%20%20!filename.toLowerCase().endsWith(%22.jpeg%22)%0A%20%20)%20%7B%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20statusCode%3A%20400%2C%0A%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20message%3A%20%22File%20must%20be%20a%20JPEG%20image%22%20%7D)%2C%0A%20%20%20%20%7D%3B%0A%20%20%7D%0A%0A%20%20const%20params%20%3D%20%7B%0A%20%20%20%20Bucket%3A%20process.env.S3_BUCKET_NAME!%2C%0A%20%20%20%20Key%3A%20filename%2C%0A%20%20%20%20Body%3A%20fileContent%2C%0A%20%20%20%20ContentType%3A%20%22image%2Fjpeg%22%2C%0A%20%20%7D%3B%0A%0A%20%20try%20%7B%0A%20%20%20%20const%20result%20%3D%20await%20s3.upload(params).promise()%3B%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20statusCode%3A%20200%2C%0A%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%0A%20%20%20%20%20%20%20%20message%3A%20%22File%20uploaded%20successfully%22%2C%0A%20%20%20%20%20%20%20%20fileUrl%3A%20result.Location%2C%0A%20%20%20%20%20%20%7D)%2C%0A%20%20%20%20%7D%3B%0A%20%20%7D%20catch%20(error)%20%7B%0A%20%20%20%20console.error(%22Error%20uploading%20file%3A%22%2C%20error)%3B%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20statusCode%3A%20500%2C%0A%20%20%20%20%20%20body%3A%20JSON.stringify(%7B%20message%3A%20%22Error%20uploading%20file%22%20%7D)%2C%0A%20%20%20%20%7D%3B%0A%20%20%7D%0A%7D%3B`,lang:`javascript`});var d=a(u,10);s(d,{code:`AWSTemplateFormatVersion%3A%20%222010-09-09%22%0ATransform%3A%20AWS%3A%3AServerless-2016-10-31%0ADescription%3A%20API%20Gateway%20for%20uploading%20JPEG%20images%20to%20S3%0A%0AResources%3A%0A%20%20ImageUploadFunction%3A%0A%20%20%20%20Type%3A%20AWS%3A%3AServerless%3A%3AFunction%0A%20%20%20%20Properties%3A%0A%20%20%20%20%20%20Handler%3A%20dist%2Findex.handler%0A%20%20%20%20%20%20Runtime%3A%20nodejs20.x%0A%20%20%20%20%20%20CodeUri%3A%20.%2F%0A%20%20%20%20%20%20Environment%3A%0A%20%20%20%20%20%20%20%20Variables%3A%0A%20%20%20%20%20%20%20%20%20%20S3_BUCKET_NAME%3A%20!Ref%20UploadBucket%0A%20%20%20%20%20%20Policies%3A%0A%20%20%20%20%20%20%20%20-%20S3CrudPolicy%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20BucketName%3A%20!Ref%20UploadBucket%0A%20%20%20%20%20%20Events%3A%0A%20%20%20%20%20%20%20%20UploadAPI%3A%0A%20%20%20%20%20%20%20%20%20%20Type%3A%20Api%0A%20%20%20%20%20%20%20%20%20%20Properties%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20Path%3A%20%2Fupload%0A%20%20%20%20%20%20%20%20%20%20%20%20Method%3A%20post%0A%0A%20%20UploadBucket%3A%0A%20%20%20%20Type%3A%20AWS%3A%3AS3%3A%3ABucket%0A%20%20%20%20Properties%3A%0A%20%20%20%20%20%20BucketName%3A%20!Sub%20%24%7BAWS%3A%3AStackName%7D-uploads%0A%20%20%20%20%20%20AccessControl%3A%20Private%0A%0AOutputs%3A%0A%20%20ApiUrl%3A%0A%20%20%20%20Description%3A%20URL%20of%20the%20API%20endpoint%0A%20%20%20%20Value%3A%20!Sub%20%22https%3A%2F%2F%24%7BServerlessRestApi%7D.execute-api.%24%7BAWS%3A%3ARegion%7D.amazonaws.com%2FProd%2Fupload%22`,lang:`yaml`});var f=a(d,10);s(f,{code:`npx%20tsc`,lang:`bash`});var p=a(f,4);s(p,{code:`sam%20build%0Asam%20deploy%20--guided`,lang:`bash`}),s(a(p,8),{code:`curl%20-X%20POST%20%5C%0A%20%20'YOUR_API_ENDPOINT%3Ffilename%3Dtest-image.jpg'%20%5C%0A%20%20--data-binary%20'%40%2Fpath%2Fto%2Fyour%2Fimage.jpg'%20%5C%0A%20%20-H%20'Content-Type%3A%20image%2Fjpeg'`,lang:`bash`}),o(8),t(e,r)},$$slots:{default:!0}}))}export{C as default,l as metadata};
//# sourceMappingURL=CG2YZIwr2.js.map
