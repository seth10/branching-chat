const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, realCallback) => {
    dynamodb.getItem({
        TableName: "branching.chat_users",
        Key: {
            "hash": {S: event.queryStringParameters.hash}
        }
    }, (err, data) => {
        if (data.Item) {
            callback(data.Item.name.S);
        } else {
            if (event.queryStringParameters.name) {
                dynamodb.putItem({
                    TableName: "branching.chat_users",
                    Item: {
                        hash: {S: event.queryStringParameters.hash},
                        name: {S: event.queryStringParameters.name},
                    }
                }, (err, data) => {
                    callback("added:"+event.queryStringParameters.name);
                });
            } else {
                callback("unknown");
            }
        }
    });

    function callback(body) {
        realCallback(null, {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
            },
            'body': body
        });
    }
};
