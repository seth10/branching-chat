const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    docClient.scan({TableName:"branching.chat"}, (err, data) => {
        let chats = data.Items.filter(chat => chat.Participants.values.includes(event.queryStringParameters.name));
        callback(null, chats);
    });
};
