const AWS = require('aws-sdk');
require('dotenv').config({ path: './.env.local' });
AWS.config.update({ region: process.env.AWS_REGION });

const dynamodb = new AWS.DynamoDB();


const createTable = async () => {
    const params = {
        TableName: 'HealthData',
        KeySchema: [
            { AttributeName: 'DeviceID', KeyType: 'HASH' },
            { AttributeName: 'Timestamp', KeyType: 'RANGE' } 
        ],
        AttributeDefinitions: [
            { AttributeName: 'DeviceID', AttributeType: 'S' },
            { AttributeName: 'Timestamp', AttributeType: 'N' } 
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        const data = await dynamodb.createTable(params).promise();
        console.log('Table Created:', data.TableDescription.TableName);
    } catch (error) {
        if (error.code === 'ResourceInUseException') {
            console.log('Table already exists');
        } else {
            console.error('Error creating table:', error);
        }
    }
};

createTable();
