const AWS = require('aws-sdk');
require('dotenv').config({ path: './.env.local' });
AWS.config.update({ region: process.env.AWS_REGION });

const sqs = new AWS.SQS();
const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const queueName = `${process.env.QUEUE_NAME}`; 
const snsTopicArn = `${process.env.SNS_TOPIC_ARN}`

const createQueue = async () => {
    const params = {
        QueueName: queueName,
    };
    try {
        const data = await sqs.createQueue(params).promise();
        console.log('SQS Queue created:', data.QueueUrl);
        return data.QueueUrl;
    } catch (error) {
        console.error('Error creating SQS queue:', error);
    }
};


const getQueueArn = async (queueUrl) => {
    const params = {
        QueueUrl: queueUrl,
        AttributeNames: ['QueueArn']
    };
    try {
        const data = await sqs.getQueueAttributes(params).promise();
        return data.Attributes.QueueArn;
    } catch (error) {
        console.error('Error getting Queue ARN:', error);
    }
};

const subscribeQueueToTopic = async (queueArn, topicArn) => {
    const params = {
        Protocol: 'sqs',
        TopicArn: topicArn,
        Endpoint: queueArn
    };
    try {
        const data = await sns.subscribe(params).promise();
        console.log('SQS subscribed to SNS topic:', data.SubscriptionArn);
    } catch (error) {
        console.error('Error subscribing SQS to SNS:', error);
    }
};


const processMessage = async (message) => {
    const data = JSON.parse(message.Body); 
    const deviceId = 'heart_monitor_1'; 
    const timestamp = Date.now();
    const heartRate = data.HeartRate || 0;

    const params = {
        TableName: `${process.env.TABLE_NAME}`,
        Item: {
            DeviceID: deviceId,
            Timestamp: timestamp,
            HeartRate: heartRate
        }
    };

    try {
        await dynamodb.put(params).promise();
        console.log('Data stored in DynamoDB:', params.Item);
    } catch (error) {
        console.error('Error storing data in DynamoDB:', error);
    }
};


const receiveMessages = async (queueUrl) => {
    const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 10
    };
    try {
        const data = await sqs.receiveMessage(params).promise();
        return data.Messages || [];
    } catch (error) {
        console.error('Error receiving messages:', error);
        return []; 
    }
};


const runSqs = async () => {
    const queueUrl = await createQueue();
    if (queueUrl) {
        const queueArn = await getQueueArn(queueUrl);
        if (queueArn) {
            await subscribeQueueToTopic(queueArn, snsTopicArn);
            setInterval(() => {
                receiveMessages(queueUrl);
            }, 5000); 
        }
    }
};


module.exports = {
    createQueue: createQueue, 
    getQueueArn,
    subscribeQueueToTopic,
    receiveMessages,
    runSqs
};
