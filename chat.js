const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    dynamodb.getItem({
        TableName: "branching.chat",
        Key: {
            "Id": {N: event.queryStringParameters.id.toString()}
        }
    }, (err, data) => {
        data.Item.Chat.L.push({S:event.queryStringParameters.name+": "+event.queryStringParameters.message});
        dynamodb.putItem({
            TableName: "branching.chat",
            Item: data.Item
        }, (e,d)=>{});
    });
};
