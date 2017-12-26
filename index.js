var AWS = require('aws-sdk');

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    docClient.scan(
        {
            TableName: "branching.chat",
            ProjectionExpression: "Id, Participants"
        },
        (err, data) => {
            if (err) console.log(err);
            let chatIds = data.Items.filter(chat => chat.Participants.includes(event.queryStringParameters.name)).map(chat => chat.Id);
            callback(null, JSON.stringify({chatIds: chatIds}));
        }
    );
    callback(null, JSON.stringify({}));
};
