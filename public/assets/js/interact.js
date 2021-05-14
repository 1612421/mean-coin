// Notify result of process buy coin
$('#formBuy')
    .ajaxForm({
        url : '/wallet/buy',
        type: 'POST',
        dataType : 'json',
        success : function (response) {
            $('#toastContainer').append(arrayToastHtml([
                {
                    type: 'success',
                    content: response.data.message
                }
            ]));

            $('#buyAmount').val('');
            $('#closeBuyModal').click();
            let toast = $('.toast');
            toast.toast('show')
                .on('hidden.bs.toast', () => {
                    toast.remove();
                });
        },
        error: function (response) {
            const data = response.responseJSON;
            $('#toastContainer').append(arrayToastHtml([
                {
                    type: 'error',
                    content: data.message
                }
            ]));

            $('#buyAmount').val('');
            $('#closeBuyModal').click();
            let toast = $('.toast');
            toast.toast('show')
                .on('hidden.bs.toast', () => {
                    toast.remove();
                });
        },
    })
;


// Notify result of process send coin
$('#formSend')
    .ajaxForm({
        url : '/wallet/send',
        type: 'POST',
        dataType : 'json',
        success : function (response) {
            $('#toastContainer').append(arrayToastHtml([
                {
                    type: 'success',
                    content: response.data.message
                }
            ]));

            $('#sendAmount').val('');
            $('#closeSendCoinModal').click();
            let toast = $('.toast');
            toast.toast('show')
                .on('hidden.bs.toast', () => {
                    toast.remove();
                });
        },
        error: function (response) {
            const data = response.responseJSON;
            $('#toastContainer').append(arrayToastHtml([
                {
                    type: 'error',
                    content: data.message
                }
            ]));

            $('#toAddress').val('');
            $('#sendAmount').val('');
            $('#closeSendCoinModal').click();
            let toast = $('.toast');
            toast.toast('show')
                .on('hidden.bs.toast', () => {
                    toast.remove();
                });
        },
    })
;