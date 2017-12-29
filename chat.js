const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    dynamodb.getItem({
        TableName: "branching.chat",
        Key: {
            "Id": {N: event.queryStringParameters.id.toString()}
        }
    }, (err, data) => {
        //console.log(data.Item.Chat.L);
        data.Item.Chat.L.push({S:event.queryStringParameters.name+": "+event.queryStringParameters.message});
        //console.log(data.Item.Chat.L);
        dynamodb.putItem({
            TableName: "branching.chat",
            Item: data.Item
        }, (err, data) => {
            console.log(err);
            console.log(data);
        });
    });
};
