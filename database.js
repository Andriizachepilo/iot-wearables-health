const AWS = require('aws-sdk');
require('dotenv').config({ path: './.env.local' });
AWS.config.update({ region: process.env.AWS_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

const addHealthData = async (deviceId, timestamp, heartRate) => {
    const params = {
        TableName: 'HealthData',
        Item: {
            DeviceID: deviceId,
            Timestamp: timestamp,
            HeartRate: heartRate
        }
    };

    try {
        await dynamodb.put(params).promise();
        console.log('Data added:', params.Item);
    } catch (error) {
        console.error('Error adding data:', error);
    }
};


addHealthData('heart_monitor_1', Date.now(), 85);


const getHealthData = async (deviceId) => {
    const params = {
        TableName: 'HealthData',
        KeyConditionExpression: 'DeviceID = :deviceId',
        ExpressionAttributeValues: {
            ':deviceId': deviceId
        }
    };

    try {
        const data = await dynamodb.query(params).promise();
        console.log('Query succeeded:', data.Items);
    } catch (error) {
        console.error('Error querying data:', error);
    }
};


getHealthData('heart_monitor_1');


module.exports = {getHealthData, addHealthData}