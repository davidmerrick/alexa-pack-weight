Lambda function for recording backpack weight to Google Spreadsheet.

* Includes gulp config for deployment 

## Usage:

1. Set up an IAM role or user with Lambda access using the "AWSLambdaFullAccess" policy.
2. Create a conf/lambda-config.js file with the following contents:
```javascript
module.exports = {
    accessKeyId: null, // AWS access key here
    secretAccessKey: null, // AWS secret here
    region: null, // Region here (will probably be 'us-east-1')
    handler: 'index.handler',
    functionName: null, // Lambda function name here>
    timeout: 10,
    memorySize: 128,
    publish: true, // default: false,
    runtime: 'nodejs4.3'
}
```
3. Get an auth token using the code at https://github.com/davidmerrick/node-speed-test-uploader/blob/master/index.js.
4. Deploy your code to your Lambda function:
```
gulp deploy
```