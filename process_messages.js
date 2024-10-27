const AWS = require('aws-sdk');
const { SQS, DynamoDB } = require('aws-sdk');

require('dotenv').config({ path: './.env.local' });
AWS.config.update({ region: process.env.AWS_REGION });

const sqs = new SQS();
const dynamoDB = new DynamoDB.DocumentClient();

const queueUrl = `${ process.env.QUEUE_URL }`; 
const tableName = `${ process.env.TABLE_NAME }`; 

async function processMessages() {
    const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
    };

    try {
        const data = await sqs.receiveMessage(params).promise();
        console.log('Data received from SQS:', JSON.stringify(data, null, 2));

        if (data.Messages && data.Messages.length > 0) {
            console.log('Messages received:', data.Messages);

            for (const message of data.Messages) {
                const body = JSON.parse(message.Body);
                const messageContent = JSON.parse(body.Message);

                const deviceID = '123'; 
                const timestamp = new Date(body.Timestamp).getTime();

                const dbParams = {
                    TableName: tableName,
                    Item: {
                        DeviceID: deviceID,
                        Timestamp: timestamp,
                        HeartRate: messageContent.heartRate,
                        StepCount: messageContent.stepCount,
                    },
                };

                try {
                    await dynamoDB.put(dbParams).promise();
                    console.log('Data stored in DynamoDB:', JSON.stringify(dbParams.Item, null, 2));
                } catch (dbError) {
                    console.error('Error storing data in DynamoDB:', JSON.stringify(dbError, null, 2));
                }

                const deleteParams = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle,
                };
                
                try {
                    await sqs.deleteMessage(deleteParams).promise();
                    console.log('Message deleted from queue:', message.MessageId);
                } catch (deleteError) {
                    console.error('Error deleting message from queue:', JSON.stringify(deleteError, null, 2));
                }
            }
        } else {
            console.log('No messages to process'); 
        }
    } catch (error) {
        console.error('Error receiving messages:', JSON.stringify(error, null, 2));
    }
}


module.exports = {
    processMessages,
};
