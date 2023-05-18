const express = require("express");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "us-east-1",
});

const tableName = "payments";

const ddb = new AWS.DynamoDB.DocumentClient();
const app = express();
app.use(bodyParser.json());

app.get("/payments", async (req, res) => {
  const params = {
    TableName: tableName, // Replace with your actual DynamoDB table name
  };

  try {
    const data = await ddb.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/userPayments", async (req, res) => {
  const userId = req.query.userId;

  const params = {
    TableName: "PaymentTable", // Replace with your actual DynamoDB table name
    FilterExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    const data = await ddb.scan(params).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/paymentReserveId", async (req, res) => {
  const reserveId = req.query.reserveId;

  const params = {
    TableName: tableName, // Replace with your actual DynamoDB table name
    FilterExpression: "#reserveId = :reserveId",
    ExpressionAttributeNames: {
      "#reserveId": "reserveId",
    },
    ExpressionAttributeValues: {
      ":reserveId": reserveId,
    },
  };

  try {
    const data = await ddb.scan(params).promise();
    res.json(data.Items[0]); // Assuming that reserveId is unique
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.get("/paymentBorrowId", async (req, res) => {
  const borrowId = req.query.borrowId;

  const params = {
    TableName: tableName, // Replace with your actual DynamoDB table name
    FilterExpression: "#borrowId = :borrowId",
    ExpressionAttributeNames: {
      "#borrowId": "borrowId",
    },
    ExpressionAttributeValues: {
      ":borrowId": borrowId,
    },
  };

  try {
    const data = await ddb.scan(params).promise();
    res.json(data.Items[0]); // Assuming that borrowId is unique
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.post("/payment", async (req, res) => {
  const params = {
    TableName: tableName,
    Item: {
      id: uuidv4(),
      userId: req.body.userId,
      reserveId: req.body.reserveId,
      status: req.body.status,
      timestamp: req.body.timestamp,
      price: req.body.price,
      borrowId: req.body.borrowId,
    },
  };

  try {
    await ddb.put(params).promise();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.put("/payment", async (req, res) => {
  const params = {
    TableName: tableName,
    Key: {
      id: req.body.id,
    },
    UpdateExpression:
      "set userId = :u, reserveId = :r, status = :s, timestamp = :t, price = :p, borrowId = :b",
    ExpressionAttributeValues: {
      ":u": req.body.userId,
      ":r": req.body.reserveId,
      ":s": req.body.status,
      ":t": req.body.timestamp,
      ":p": req.body.price,
      ":b": req.body.borrowId,
    },
  };

  try {
    await ddb.update(params).promise();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.delete("/payment/:id", async (req, res) => {
  const params = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };

  try {
    await ddb.delete(params).promise();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
