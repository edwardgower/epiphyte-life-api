"use strict";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  // validation
  if (typeof data.text !== "string" || typeof data.checked !== "boolean") {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't update the todo item.",
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_CASES,
    Key: {
      CaseId: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      "#todo_text": "text",
    },
    ExpressionAttributeValues: {
      ":Text": data.text,
      ":Checked": data.checked,
      ":UpdatedAt": timestamp,
    },
    UpdateExpression:
      "SET #todo_text = :Text, Checked = :checked, UpdatedAt = :updatedAt",
    ReturnValues: "ALL_NEW",
  };

  // update the todo in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't fetch the todo item.",
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
