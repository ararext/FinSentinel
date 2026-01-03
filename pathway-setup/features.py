def build_features(tx):
    return tx.select(
        tx.step,
        tx.type,
        tx.amount,
        tx.nameOrig,
        tx.nameDest,
        balance_diff = tx.oldbalanceOrg - tx.newbalanceOrig,
        is_large_tx = tx.amount > 200000
    )
