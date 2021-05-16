function toastHtml(message, delay = 5000) {
    let typeToast = "";
    const type = message.type.toUpperCase();
    switch (type) {
        case 'ERROR':
            typeToast = 'alert-danger';
            break;
    
        case 'SUCCESS':
            typeToast = 'alert-success';
            break;
    }

    return `
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
        <div class="toast-header">
            <strong class="me-auto">MeanCoin - ${type}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body ${typeToast}">
            ${message.content}
        </div>
    </div>
    `;
}


function arrayToastHtml(messages) {

    let content = '';

    messages.forEach(message => {
        content += toastHtml(message, 5000);
    });

    return content;
}

function showToast(type, message) {
    $('#toastContainer').append(arrayToastHtml([
        {
            type: type,
            content: message
        }
    ]));

    let toast = $('.toast');
    toast.toast('show')
        .on('hidden.bs.toast', () => {
            toast.remove();
        });
}

function newRecordTableMyHsTx(transaction) {
    const timestamp = moment(+transaction.timestamp).format('MM-DD-YYYY H:mm:ss');
    
    return `
    <tr>
        <th scope="row">${transaction.index}</th>
        <td class="text-truncate" style="max-width: 300px;">
            <a class="text-decoration-none  " href="/tx/${transaction.hash}">${transaction.hash}</a>
        </td>
        <td>${transaction.method}</td>
        <td>${timestamp}</td>
        <td class="text-truncate" style="max-width: 300px;">
            <a class="text-decoration-none  " href="/address/${transaction.fromAddress}">
                ${transaction.fromAddress}
            </a>
        </td>
        <td class="text-truncate" style="max-width: 300px;">
            <a class="text-decoration-none  " href="/address/${transaction.toAddress}">
                ${transaction.toAddress}
            </a>
        </td>
        <td class="text-truncate" style="max-width: 300px;">${transaction.amount} MEC</td>
    </tr>
    `
}

function newRecordLatestBlockTable(block) {
    const timestamp = moment(+block.timestamp).format('MM-DD-YYYY H:mm:ss');

    return `
    <tr>
        <td>
            <div class="d-flex" style="margin-bottom: -10px;">
                <div class="form-group me-5">
                    <label class="form-label text-truncate " for="adr" style="width: 200px;">
                        <i class="fas fa-hashtag"></i>
                        <a class="text-decoration-none" href="/block/${block.hash}">${block.hash}</a>
                    </label>
                    <div class="form-label text-muted" style="margin-top: -10px; font-size: 17px;">
                        <i class="far fa-clock"></i>
                        ${timestamp}
                    </div>
                </div>
                <div class="form-group" style="width: 200px;">
                    <label class="form-label text-truncate" style="width: 100%;">
                        <i class="fas fa-gift"></i>
                        <a class="text-decoration-none  " href="/address/${block.miner}">${block.miner}</a>
                    </label>
                    <div class="form-label text-muted text-truncate" style="margin-top: -10px; width: 100%;">
                        <a class="text-decoration-none" href="/txns/${block.hash}">${block.transactions.length} txns</a>
                    </div>
                </div>
                <div class="form-group mt-2" style="width: 150px; margin-left: auto;">
                    <div class="d-flex justify-content-end">
                        <span class="badge bg-info text-dark text-truncate" style="line-height: 35px;">
                            ${block.reward} MEC
                        </span>
                    </div>
                </div>
            </div>
        </td>
    </tr>
    `;
}

function newRecordLatestTxTb(transaction) {
    const timestamp = moment(+transaction.timestamp).format('MM-DD-YYYY H:mm:ss');

    return `
    <tr>
        <td>
            <div class="d-flex" style="margin-bottom: -10px;">
                <div class="form-group me-5">
                    <label class="form-label text-truncate " for="adr" style="width: 200px;">
                        <i class="fas fa-hashtag"></i>
                        <a class="text-decoration-none" href="/tx/${transaction.hash}">${transaction.hash}</a>
                    </label>
                    <div class="form-label text-muted" style="margin-top: -10px; font-size: 17px;">
                        <i class="far fa-clock"></i>
                        ${timestamp}
                    </div>
                </div>
                <div class="form-group" style="width: 200px;">
                    <label class="form-label text-truncate" style="width: 100%;">
                        From
                        <a class="text-decoration-none  " href="/address/${transaction.fromAddress}">${transaction.fromAddress}</a>
                    </label>
                    <div class="form-label text-truncate" style="margin-top: -10px; width: 100%;">
                        To
                        <a class="text-decoration-none" href="/address/${transaction.toAddress}">${transaction.toAddress}</a>
                    </div>
                </div>
                <div class="form-group mt-2" style="width: 150px; margin-left: auto;">
                    <div class="d-flex justify-content-end">
                        <span class="badge bg-info text-dark text-truncate" style="line-height: 35px;">
                            ${transaction.amount} MEC
                        </span>
                    </div>
                </div>
            </div>
        </td>
    </tr>
    `;
}