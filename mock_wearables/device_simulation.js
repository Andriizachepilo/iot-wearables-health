const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { triggerBloodPressureMonitor } = require('./blood_pressure_monitor'); 
require('dotenv').config({ path: '../.env.local' });


const snsClient = new SNSClient({ region: process.env.AWS_REGION });

const topicArn = process.env.SNS_TOPIC_ARN;

console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('SNS_TOPIC_ARN:', topicArn);

function generateHealthData() {
    const heartRate = Math.floor(Math.random() * (120 - 60 + 1)) + 60; 
    const stepCount = Math.floor(Math.random() * 500);
    const timestamp = new Date().toISOString();

    return {
        deviceID: 'device123',
        timestamp,
        heartRate,
        stepCount
    };
}

async function publishMessage(topicArn, message) {
    const params = {
        Message: JSON.stringify(message),
        TopicArn: topicArn,
    };
    try {
        const command = new PublishCommand(params);
        const result = await snsClient.send(command);
        console.log('Message published:', result.MessageId);
    } catch (error) {
        console.error('Error publishing message:', error);
    }
}

async function sendMockData() {
    setInterval(async () => {
        const healthData = generateHealthData();

        try {
            await publishMessage(topicArn, healthData);
            console.log('Published to SNS:', healthData);

            if (healthData.heartRate > 100) {  
                console.log('High heart rate detected, triggering blood pressure monitor.');
                await triggerBloodPressureMonitor();
            }
        } catch (error) {
            console.error('Error publishing to SNS:', error);
        }
    }, 10000); 
}

sendMockData();
