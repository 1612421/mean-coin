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