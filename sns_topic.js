const { SNSClient, CreateTopicCommand, PublishCommand } = require('@aws-sdk/client-sns');
require('dotenv').config({ path: './.env.local' });

const snsClient = new SNSClient({ region:`${process.env.AWS_REGION}`});

const createSnsTopic = async () => {
    const params = {
        Name: `${process.env.SNS_TOPIC_NAME}`, 
    };
    try {
        const command = new CreateTopicCommand(params);
        const result = await snsClient.send(command);
        console.log('SNS Topic ARN:', result.TopicArn);
        return result.TopicArn;
    } catch (error) {
        console.error('Error creating SNS topic:', error);
    }
};

const publishMessage = async (topicArn, message) => {
    const params = {
        Message: message,
        TopicArn: topicArn,
    };
    try {
        const command = new PublishCommand(params);
        const result = await snsClient.send(command);
        console.log('Message published:', result.MessageId);
    } catch (error) {
        console.error('Error publishing message:', error);
    }
};

createSnsTopic();

module.exports = {
    createSnsTopic,
    publishMessage,
};
