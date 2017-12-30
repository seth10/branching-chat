const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, realCallback) => {
    dynamodb.getItem({
        TableName: 'branching.chat_users',
        Key: {
            'hash': {S: event.queryStringParameters.hash}
        }
    }, (err, data) => {
        if (data.Item) {
            let response = {name: data.Item.name.S};
            docClient.scan({TableName:'branching.chat'}, (err, data) => {
                response.chats = data.Items.filter(chat => chat.Participants.values.includes(event.queryStringParameters.hash));
                response.chats.forEach(chat => {
                    let participants = chat.Participants.values;
                    dynamodb.batchGetItem({
                        RequestItems: {
                            'branching.chat_users': {
                                Keys: participants.map(hash=>({hash: {S: hash}}))
                            }
                        }
                    }, (err, data) => {
                        participants = data.Responses['branching.chat_users'].reduce((acc,cur)=>{acc[cur.hash.S]=cur.name.S;return acc}, {});
                        chat.Chat.forEach(message => {
                            if (message.n) {
                                message.n = participants[message.n];
                            }
                        });
                    });
                });
                setTimeout(()=>{callback(response)}, 1000);
            });
        } else if (event.queryStringParameters.name) {
            dynamodb.putItem({
                TableName: 'branching.chat_users',
                Item: {
                    hash: {S: event.queryStringParameters.hash},
                    name: {S: event.queryStringParameters.name},
                }
            }, (err, data) => {
                callback({name: event.queryStringParameters.name, 'new': true});
            });
        } else {
            callback({unknown: true});
        }
    });

    function callback(body) {
        realCallback(null, {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
            },
            'body': JSON.stringify(body)
        });
    }
};
