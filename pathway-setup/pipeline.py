from features import build_features


def build_pipeline(transactions):
    """Build the Pathway computation graph for transactions.

    For now we only construct the feature view; Pathway will execute
    it when `pw.run()` is called in app.py. The previous
    `features.print()` call was invalid because Pathway tables don't
    expose a `.print()` method and was causing the runtime error.
    """

    features = build_features(transactions)
    # If you want to inspect the live stream, you can later plug this
    # into a proper sink (e.g. pw.io.csv.write, pw.io.jsonlines.write,
    # or a custom connector). For now, just return the features table.
    return features
