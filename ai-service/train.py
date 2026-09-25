import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "data",
    "problems_dataset.csv"
)

MODELS_DIR = os.path.join(
    BASE_DIR,
    "models"
)


# ============================================================
# CREATE MODELS DIRECTORY
# ============================================================

os.makedirs(MODELS_DIR, exist_ok=True)


# ============================================================
# LOAD DATASET
# ============================================================

print("\n==============================================")
print("SIH AI MODEL TRAINING")
print("==============================================")

print("\nLoading dataset...")
print(f"Dataset: {DATASET_PATH}")

if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATASET_PATH}"
    )

df = pd.read_csv(DATASET_PATH)


# ============================================================
# CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "title",
    "description",
    "domain",
    "subDomain",
    "sector",
    "severity"
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        "Missing columns in dataset: "
        + ", ".join(missing_columns)
    )


# ============================================================
# CLEAN DATA
# ============================================================

print("\nCleaning dataset...")

df = df[required_columns].copy()

for column in required_columns:
    df[column] = df[column].fillna("").astype(str).str.strip()


# Remove rows where title or description is empty
df = df[
    (df["title"] != "") &
    (df["description"] != "")
].copy()


# Remove rows where target labels are empty
df = df[
    (df["domain"] != "") &
    (df["subDomain"] != "") &
    (df["sector"] != "") &
    (df["severity"] != "")
].copy()


# Remove exact duplicate rows
df = df.drop_duplicates().reset_index(drop=True)


print(f"\nTotal usable records: {len(df)}")


# ============================================================
# DATASET VALIDATION
# ============================================================

if len(df) < 20:
    raise ValueError(
        "\nThe dataset currently contains fewer than 20 usable "
        "records.\n"
        "Please add more labelled examples before training."
    )


# ============================================================
# CREATE INPUT TEXT
# ============================================================

# The model receives both title and description.
#
# Example:
#
# title:
# Dengue Fever
#
# description:
# Many residents are affected by dengue...
#
# Combined:
# Dengue Fever Many residents are affected by dengue...

df["text"] = (
    df["title"]
    + " "
    + df["description"]
)


# ============================================================
# DISPLAY DATASET INFORMATION
# ============================================================

print("\n==============================================")
print("DATASET INFORMATION")
print("==============================================")

print(f"Records: {len(df)}")

print("\nDomain distribution:")
print(df["domain"].value_counts())

print("\nSub-domain distribution:")
print(df["subDomain"].value_counts())

print("\nSector distribution:")
print(df["sector"].value_counts())

print("\nSeverity distribution:")
print(df["severity"].value_counts())


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_model(target_column, model_filename):
    """
    Train one text classification model.

    Input:
        title + description

    Output:
        target_column

    Example:
        domain
        subDomain
        sector
        severity
    """

    print("\n")
    print("==============================================")
    print(f"TRAINING MODEL: {target_column}")
    print("==============================================")

    X = df["text"]
    y = df[target_column]

    print("\nNumber of classes:", y.nunique())
    print("Classes:")

    for class_name, count in y.value_counts().items():
        print(f"  {class_name}: {count}")

    # --------------------------------------------------------
    # Check whether there are enough samples per class
    # --------------------------------------------------------

    class_counts = y.value_counts()

    if class_counts.min() < 2:
        raise ValueError(
            f"\nCannot train {target_column} model.\n"
            f"Every class needs at least 2 examples.\n"
            f"Current class distribution:\n{class_counts}"
        )

    # --------------------------------------------------------
    # Train/Test split
    # --------------------------------------------------------

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y
        )

    except ValueError as error:
        print(
            "\nWARNING: Stratified split could not be performed."
        )
        print(error)
        print(
            "\nUsing a normal train/test split instead."
        )

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42
        )

    # --------------------------------------------------------
    # Create ML pipeline
    # --------------------------------------------------------

    model = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                strip_accents="unicode",
                ngram_range=(1, 2),
                min_df=1,
                max_df=0.95,
                sublinear_tf=True
            )
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=2000,
                class_weight="balanced"
            )
        )
    ])

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------

    print("\nTraining...")

    model.fit(
        X_train,
        y_train
    )

    # --------------------------------------------------------
    # Test
    # --------------------------------------------------------

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print("\n----------------------------------------------")
    print(f"Accuracy: {accuracy:.4f}")
    print("----------------------------------------------")

    print("\nClassification report:")

    try:
        print(
            classification_report(
                y_test,
                predictions,
                zero_division=0
            )
        )
    except Exception:
        print("Classification report unavailable.")

    # --------------------------------------------------------
    # Save model
    # --------------------------------------------------------

    model_path = os.path.join(
        MODELS_DIR,
        model_filename
    )

    joblib.dump(
        model,
        model_path
    )

    print(f"\nModel saved:")
    print(model_path)

    return {
        "model": model,
        "accuracy": accuracy
    }


# ============================================================
# TRAIN FOUR MODELS
# ============================================================

domain_result = train_model(
    "domain",
    "domain_model.pkl"
)

subdomain_result = train_model(
    "subDomain",
    "subdomain_model.pkl"
)

sector_result = train_model(
    "sector",
    "sector_model.pkl"
)

severity_result = train_model(
    "severity",
    "severity_model.pkl"
)


# ============================================================
# SAVE TRAINING INFORMATION
# ============================================================

training_info = {
    "dataset_records": len(df),

    "domain_accuracy": domain_result["accuracy"],

    "subdomain_accuracy": subdomain_result["accuracy"],

    "sector_accuracy": sector_result["accuracy"],

    "severity_accuracy": severity_result["accuracy"]
}


training_info_path = os.path.join(
    MODELS_DIR,
    "training_info.pkl"
)

joblib.dump(
    training_info,
    training_info_path
)


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n")
print("==============================================")
print("TRAINING COMPLETED")
print("==============================================")

print(
    f"\nDataset records: "
    f"{training_info['dataset_records']}"
)

print(
    f"Domain accuracy: "
    f"{training_info['domain_accuracy']:.4f}"
)

print(
    f"Sub-domain accuracy: "
    f"{training_info['subdomain_accuracy']:.4f}"
)

print(
    f"Sector accuracy: "
    f"{training_info['sector_accuracy']:.4f}"
)

print(
    f"Severity accuracy: "
    f"{training_info['severity_accuracy']:.4f}"
)

print("\nGenerated model files:")

print("  models/domain_model.pkl")
print("  models/subdomain_model.pkl")
print("  models/sector_model.pkl")
print("  models/severity_model.pkl")
print("  models/training_info.pkl")

print("\nAI model training is complete.")