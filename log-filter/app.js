let cloudwatch = require('./cloudwatch.js');

exports.handler = async (event, context, callback) => {
    await cloudwatch.init();

    let errorRecords = [];

    /* Process the list of records and transform them */
    const output = event.records.map((record) => {
        // Kinesis data is base64 encoded so decode here
        const payload = new Buffer.from(record.data, 'base64').toString('ascii');
        //console.log('Decoded payload:', payload);

        let object = JSON.parse(payload);
        if(object.level === "ERROR") {
            errorRecords.push(payload);
        }

        return {
            recordId: record.recordId,
            result: 'Ok',
            data: record.data,
        };

        /* Failed event, notify the error and leave the record intact */
        //    failure++;
        //    return {
        //        recordId: record.recordId,
        //        result: 'ProcessingFailed',
        //        data: record.data,
        //    };
        //}
    });

    //put errorlog
    if(errorRecords.length > 0) {
        await cloudwatch.logs(errorRecords);
    }

    //console.log(`Processing completed.  Successful records ${success}, Failed records ${failure}`);
    callback(null, { records: output });
};

