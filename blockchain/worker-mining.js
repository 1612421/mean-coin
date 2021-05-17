const workerFarm = require('worker-farm');
const service = workerFarm(require.resolve('./mining-script.js'));

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
       service(workerData, (err, output) => {
            if (err) {
                reject(err);
            }

            resolve(output);
       });
    });
}

module.exports = {
    runWorker
};