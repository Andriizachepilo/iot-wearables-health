# 🌟 Health Wearables IoT System

## Project Overview

The **Health Wearables IoT System** is an interconnected platform designed to facilitate communication between health wearables and a centralized monitoring system. This system monitors users' heart rates and triggers interactions between various health-related devices based on predefined conditions.

### High-Level Desired Outcome

The goal is to create an ecosystem where health wearables seamlessly communicate with each other and a centralized monitoring system. For instance, if a heart rate monitor detects an abnormal heart rate, it can trigger a smartwatch to notify the user and may also prompt a blood pressure monitor to take additional readings. 

---

## Minimum Viable Product Requirements

Your project encompasses an IoT platform featuring:

- **Event Bus Mechanism**: A robust event bus that enables communication between connected health wearables and the monitoring system, including functionalities for event publishing, subscription, and notification.
  
- **Database Implementation**: A database to store information about connected health wearables, their current statuses, and historical data (e.g., heart rate readings).
  
- **Integration of Health Wearables**: At least two health wearables capable of connecting and disconnecting from the system. One should publish health-related events, while the other should consume them via the event bus. 

---

## Non-Functional Requirements

- The implementation language is flexible, allowing the use of any programming language deemed suitable for the project.
  
- The system must prioritize **resilience** and **scalability**, ensuring uninterrupted functionality despite failures and accommodating an increasing number of connected health wearables.
  
- **Logging mechanisms** should be integrated for comprehensive auditing and debugging purposes, facilitating system maintenance and troubleshooting.
  
- The code should be **well-tested**. 🛠️

---

## Project Structure

```
/HealthWearablesIoTSystem
|-- blood_pressure_monitor.js
|-- device_simulation.js
|-- database.js
|-- dynamodb_setup.js
|-- index.js
|-- process_messages.js
|-- sns_topic.js
|-- sqs_topic.js
```

### File Descriptions

- **`blood_pressure_monitor.js`**: 
  Simulates a blood pressure monitoring device. This file generates blood pressure readings and publishes them to the event bus. 💉

- **`device_simulation.js`**: 
  Simulates the health wearables, including the heart rate monitor and the blood pressure monitor. It triggers events based on the simulated device data. 🩺

- **`database.js`**: 
  Contains functions to interact with the DynamoDB database, allowing for data storage and retrieval of health readings. 📊

- **`dynamodb_setup.js`**: 
  Sets up the DynamoDB tables necessary for storing health wearable data. 🗄️

- **`index.js`**: 
  The main entry point for the application, orchestrating the various components and initializing the event bus. 🎬

- **`process_messages.js`**: 
  Contains logic for processing incoming messages from the event bus, such as notifications or health alerts. 📬

- **`sns_topic.js`**: 
  Manages the setup and interaction with the AWS SNS (Simple Notification Service) for sending notifications. 📢

- **`sqs_topic.js`**: 
  Handles the setup and interaction with the AWS SQS (Simple Queue Service) for receiving messages. 📥

---

## AWS Lambda Integration

### Creating AWS Lambda Functions

1. Log in to the AWS Management Console.
2. Navigate to the **Lambda** service.
3. Click on "Create function" and select "Author from scratch".
4. Name your function (e.g., `ProcessHealthData`), choose **Node.js** as the runtime, and set permissions.
5. Click "Create function".

### Adding the Lambda Code

In the **Function code** section, remove any default code present in the editor.

Copy and paste the following code into the editor:

```javascript
const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

exports.handler = async (event) => {
    for (const record of event.Records) {
        const message = JSON.parse(record.Sns.Message);
        console.log('Received message:', message);

        // Here you can add logic based on the message content
        if (message.heartRate > 100) {
            // If the heart rate is above 100, send a notification
            const params = {
                Message: 'High heart rate detected!',
                TopicArn: 'arn:aws:sns:eu-west-2:311141551180:HealthEventTopic', // Use your actual SNS topic ARN
            };
            await sns.publish(params).promise();
        }
    }
    return { statusCode: 200, body: 'Processed successfully' };
};
```

Scroll down and click on the **Deploy** button to save your changes. ✅

### Adding the Trigger

In the Lambda function configuration, scroll down to **Function triggers**. 

1. Click on "Add trigger" and select **SNS** from the dropdown.
2. Choose the SNS topic you want to connect (e.g., `HealthEventTopic`).
3. Click on "Add". 🔗

---

## Dependencies

To run this project, you will need the following dependencies:

- **Node.js**: Ensure you have Node.js installed on your machine. 🌐
  
- **AWS SDK for JavaScript**: This is required for interacting with AWS services. It is included by default in the AWS Lambda environment.

---

## Usage of the Health Wearables IoT System

### AWS Services Involved

- **AWS Lambda**: Executes the code in response to triggers from SNS (Simple Notification Service). It's used for processing health data from wearables.
  
- **Amazon SNS**: Serves as the event bus for sending messages. It allows devices to publish health-related events that can be consumed by the monitoring system.
  
- **Amazon SQS**: (If used) Queue service that can hold messages from devices before processing. Not explicitly required in the current setup but can be added for additional message handling. 📬
  
- **Amazon DynamoDB**: NoSQL database that stores information about connected health wearables and their health readings.

---

## Scripts Overview

### 1. `dynamodb_setup.js`

**Usage**: Set up the DynamoDB tables needed to store data.

- **How to Use**:
    ```bash
    node dynamodb_setup.js
    ```
    The script will create a table (e.g., `HealthWearables`) with the necessary attributes for storing device readings. 🗄️

---

### 2. `device_simulation.js` (located in the `mock_wearables` folder)

**Usage**: Simulates health data being sent from wearables to the monitoring system.

- **How to Use**:
    ```bash
    node mock_wearables/device_simulation.js
    ```
    The script publishes messages to the SNS topic (e.g., `HealthEventTopic`) with simulated health readings. 📊

---

### 3. `blood_pressure_monitor.js` (located in the `mock_wearables` folder)

**Usage**: Mock implementation of a blood pressure monitor that simulates sending data to the monitoring system.

- **How to Use**:
    ```bash
    node mock_wearables/blood_pressure_monitor.js
    ```

---

### 4. `database.js`

**Usage**: Contains functions to interact with the DynamoDB database.

- **How to Use**: This script is called internally by other scripts to store health readings or device statuses.

---

### 5. `index.js`

**Usage**: Main entry point for the project, orchestrating the interactions between different components.

- **How to Use**:
    ```bash
    node index.js
    ```

---

### 6. `process_messages.js`

**Usage**: Contains logic to process incoming messages from SNS.

- **How to Use**: This script is invoked by the Lambda function whenever a message is received from SNS. You can test the logic independently by providing sample messages.

---

### 7. `sns_topic.js`

**Usage**: Configures the SNS topic for publishing health events.

- **How to Use**: This script sets up the SNS topic. It should be run once during the setup phase to ensure that the topic is created. 📢

---

### 8. `sqs_topic.js` (Optional)

**Usage**: If using SQS, this script sets up the SQS queue for holding messages.

- **How to Use**: Similar to `sns_topic.js`, this script should be executed to create the SQS queue if you want to incorporate message queuing in your system. 📥

---

## Step-by-Step Integration of AWS Services

1. **Set Up DynamoDB**:
   - Run `dynamodb_setup.js` to create necessary tables. 🗄️

2. **Create SNS Topic**:
   - Execute `sns_topic.js` to create the SNS topic where health events will be published. 📢

3. **Create SQS Queue** (if applicable):
   - Run `sqs_topic.js` to set up the SQS queue (optional). 📥

4. **Deploy Lambda Functions**:
   - Create a Lambda function in AWS and add the provided code.
   - Set up the trigger for SNS to invoke the Lambda function upon receiving messages. 🔗

5. **Run Device Simulation**:
   - Execute `device_simulation.js` to start sending simulated health data to SNS. 📊

6. **Monitor DynamoDB**:
   - Check your DynamoDB tables to see the stored health

Conclusion
This project not only enhances understanding of IoT architecture but also provides practical experience in integrating AWS services for real-time health monitoring. It showcases the potential of health wearables in improving patient care through efficient data handling and notification mechanisms. 🌐✨