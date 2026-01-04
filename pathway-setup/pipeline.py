import pathway as pw

from features import build_features


def build_pipeline(transactions):
    """Build the Pathway computation graph for transactions.

    We construct a feature view and attach a simple sink that writes
    the live stream of features to a JSONL file. When ``pw.run()`` is
    called in ``app.py``, Pathway will continuously watch the
    ``transactions.csv`` file for new rows and append the corresponding
    feature rows to ``pathway_output.jsonl``.
    """

    features = build_features(transactions)

    # Persist the live feature stream so you can inspect it and wire it
    # into the backend/frontend later.
    pw.io.jsonlines.write(features, "pathway_output.jsonl")

    return features
