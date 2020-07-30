let AWS = require('aws-sdk');
const moment = require('moment');

//Cloudwatch Logs
const cloudwatchlogs = new AWS.CloudWatchLogs({
  apiVersion: '2014-03-28',
  region: process.env.AWS_DEFAULT_REGION
});
const logGroupName = process.env.ERRORLOG_GROUP_NAME;
let logStreamName = null;
let nextSequence = null;

async function init() {
  //await initLogGroup();
  if(logStreamName === null) {
    await initLogStream();
  }
}

async function initLogGroup() {
  var params = {
    logGroupName: logGroupName
  };
  try {
    await cloudwatchlogs.createLogGroup(params).promise();
  } catch(err) {
    if(err.code !== 'ResourceAlreadyExistsException') {
      console.error(err);
      throw err;
    }
  }
  return;
}

async function initLogStream() {
  //log stream
  let streamName = moment().format("YYYY-MM-DD-x-") + Math.floor((Math.random() * 1000000));
  var params = {
    logGroupName: logGroupName,
    logStreamName: streamName
  };
  try {
    await cloudwatchlogs.createLogStream(params).promise();
    logStreamName = streamName;
  } catch(err) {
    console.error(err);
    throw err;
  }
  return;
}

async function CloudwatchLog(input) {
  let logEvents = [];
  class Event {
    constructor(msg) {
      this.message = msg;
      this.timestamp = Date.now();
    }
  }
  
  if(Array.isArray(input)) {
    logEvents = input.map(e => new Event(e));
  } else {
    let e = new Event(input);
    logEvents.push(e);
  }

  var params = {
    logEvents: logEvents,
    logGroupName: logGroupName, /* required */
    logStreamName: logStreamName, /* required */
    sequenceToken: nextSequence
  };

  try {
    let data = await cloudwatchlogs.putLogEvents(params).promise();
    nextSequence = data.nextSequenceToken;
  } catch(err) {
    console.error(err);
  }
}

exports.init = init;
exports.logs = CloudwatchLog;