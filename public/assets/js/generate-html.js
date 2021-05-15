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