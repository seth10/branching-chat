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
    			let participantHashes = Array.from(new Set(
    			        data.Items.map(chat => chat.Participants.values)
    			                  .reduce((acc,cur) => acc.concat(cur), [])));
                getNames(participantHashes).then(data => {
                    let participants = data.reduce((acc,cur)=>{acc[cur.hash.S]=cur.name.S;return acc}, {});
    				response.chats.forEach(chat => {
        				chat.Chat.forEach(message => {
        					if (message.n) {
        						message.n = participants[message.n];
        					}
        				});
    				});
    				callback(response);
                });
            });
        } else if (event.queryStringParameters.name) {
			addUsername().then(() => callback({name: event.queryStringParameters.name, 'new': true}));
		} else {
			callback({unknown: true});
		}
    });

	function getNames(participantHashes) {
		return new Promise(function(resolve, reject) {
		    dynamodb.batchGetItem({
				RequestItems: {
					'branching.chat_users': {
						Keys: participantHashes.map(hash=>({hash: {S: hash}}))
					}
				}
			}, (err, data) => {
                if (err) reject();
				else resolve(data.Responses['branching.chat_users']);
			});
		});
	}

	function addUsername(name) {
        return new Promise(function(resolve, reject) {
			dynamodb.putItem({
                TableName: 'branching.chat_users',
                Item: {
                    hash: {S: event.queryStringParameters.hash},
                    name: {S: event.queryStringParameters.name},
                }
            }, (err, data) => {
                if (err) reject();
				else resolve(data);
            });
        });
    }

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
