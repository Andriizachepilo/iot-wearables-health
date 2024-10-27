const AWS = require('aws-sdk');
const { publishMessage } = require('../sns_topic'); 

require("dotenv").config({ path: "../.env.local" });
AWS.config.update({ region: `${process.env.AWS_REGION}` });

const topicArn = `${process.env.SNS_TOPIC_ARN}`

function generateBloodPressureData() {
    const systolic = Math.floor(Math.random() * (140 - 90 + 1)) + 90;  
    const diastolic = Math.floor(Math.random() * (90 - 60 + 1)) + 60;  
    const timestamp = new Date().toISOString();

    return {
        deviceID: 'bloodPressureMonitor123',
        timestamp,
        systolic,
        diastolic
    };
}

async function triggerBloodPressureMonitor() {
    const bloodPressureData = generateBloodPressureData();

    try {
        await publishMessage(topicArn, bloodPressureData);
        console.log('Published blood pressure data to SNS:', bloodPressureData);
    } catch (error) {
        console.error('Error publishing blood pressure data to SNS:', error);
    }
}

module.exports = {
    triggerBloodPressureMonitor
};
