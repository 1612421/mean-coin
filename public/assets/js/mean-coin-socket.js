const socket = io();


socket.on('connect', () => {
    socket.emit('client');
});

socket.on('TRANSACTION', (data) => {
    console.log(data);
    const myAddress = $('#myAddress').val(); 
    

    if (myAddress) {
        const myBalance = $('#myBalance');
        const myHistoryTxTable = $('#myHistoryTxTable tbody');
        let amount = 0;
        let isHaveMyTransaction = false;
        const needAppendTxTb = window.location.pathname === '/wallet';


        data.transactions.forEach(transaction => {
            if (transaction.fromAddress === myAddress) {
                amount -= +transaction.amount;
                isHaveMyTransaction = true;

                if (needAppendTxTb) {
                    transaction.timestamp = data.timestamp;
                    transaction.index = myHistoryTxTable.children().length + 1;
                    myHistoryTxTable.prepend(newRecordTableMyHsTx(transaction));
                }
            } else if (transaction.toAddress === myAddress) {
                amount += +transaction.amount;
                if (needAppendTxTb) {
                    transaction.timestamp = data.timestamp;
                    transaction.index = myHistoryTxTable.children().length + 1;
                    myHistoryTxTable.prepend(newRecordTableMyHsTx(transaction));
                }
            }
        });

        if (myBalance) {
            const totalAmount = parseInt(myBalance.html().split(' ')[0]) + amount;
            myBalance.html(totalAmount + ' MEC');
            isHaveMyTransaction = true;
        }

        if (isHaveMyTransaction) {
            showToast('success', 'Have new your transaction is verified!');
        }
    } 
});