const AWS = require('aws-sdk');
const { createSnsTopic, publishMessage } = require('./sns_topic');
const { processMessages } = require('./process_messages'); 
require('dotenv').config({ path: './.env.local' });
AWS.config.update({ region: process.env.AWS_REGION });

const sns = new AWS.SNS(); 
const sqs = new AWS.SQS();

const createQueue = async () => {
    const params = {
        QueueName: 'HealthDataQueue'
    };
    try {
        const result = await sqs.createQueue(params).promise();
        console.log('SQS Queue created:', result.QueueUrl);
        return result.QueueUrl;
    } catch (error) {
        console.error('Error creating SQS queue:', error);
    }
};

const subscribeQueue = async (topicArn, queueUrl) => {
    try {
        const queueAttributes = await sqs.getQueueAttributes({
            QueueUrl: queueUrl,
            AttributeNames: ['QueueArn']
        }).promise();
        const queueArn = queueAttributes.Attributes.QueueArn;

        const params = {
            Protocol: 'sqs',
            TopicArn: topicArn,
            Endpoint: queueArn 
        };
        
        const result = await sns.subscribe(params).promise(); 
        console.log('SQS Queue subscribed to SNS Topic:', result.SubscriptionArn);
    } catch (error) {
        console.error('Error subscribing SQS queue to SNS topic:', error);
    }
};


const run = async () => {
    const topicArn = await createSnsTopic(); 
    if (topicArn) {
        const queueUrl = await createQueue();
        await subscribeQueue(topicArn, queueUrl);
        
        const message = JSON.stringify({
            heartRate: 120,
            stepCount: 1000,
            Timestamp: new Date().toISOString()
        });
        console.log('Publishing message:', message); 
        await publishMessage(topicArn, message);
        
        await processMessages();
    }
};

run();
