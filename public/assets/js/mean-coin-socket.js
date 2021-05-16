const socket = io();


socket.on('connect', () => {
    socket.emit('client');
});

socket.on('BLOCK', (data) => {
    const myAddress = $('#myAddress').val();
    const myBalance = $('#myBalance');
    const myHistoryTxTable = $('#myHistoryTxTable tbody');
    const latestBlockView = $('#latestBlockTable tbody')
    const latestTxTable = $('#latestTxTable tbody');
    let amount = 0;
    let isHaveMyTransaction = false;
    const needAppendTxTb = window.location.pathname === '/wallet';
    const needAppendLatestBlockTb = window.location.pathname === '/';



    data.transactions.forEach(transaction => {
        transaction.timestamp = data.timestamp;

        if (myAddress && transaction.fromAddress === myAddress) {
            amount -= +transaction.amount;
            isHaveMyTransaction = true;

            if (needAppendTxTb) {
                transaction.index = myHistoryTxTable.children().length + 1;
                myHistoryTxTable.prepend(newRecordTableMyHsTx(transaction));
            }
        } else if (myAddress && transaction.toAddress === myAddress) {
            amount += +transaction.amount;
            isHaveMyTransaction = true;
            if (needAppendTxTb) {
                transaction.timestamp = data.timestamp;
                transaction.index = myHistoryTxTable.children().length + 1;
                myHistoryTxTable.prepend(newRecordTableMyHsTx(transaction));
            }
        }

        if (needAppendLatestBlockTb) {
            if (latestTxTable.children().length > 9) {
                latestTxTable.children().last().remove();
            }

            latestTxTable.prepend(newRecordLatestTxTb(transaction));
        }
    });

    if (needAppendTxTb) {
        const totalAmount = parseInt(myBalance.html().split(' ')[0]) + amount;
        myBalance.html(totalAmount + ' MEC');
    }

    if (isHaveMyTransaction) {
        showToast('success', 'Have new your transaction is verified!');
    }

    if (needAppendLatestBlockTb) {
        if (latestBlockView.children().length > 9) {
            latestBlockView.children().last().remove();
        }

        latestBlockView.prepend(newRecordLatestBlockTable(data));
    }
});