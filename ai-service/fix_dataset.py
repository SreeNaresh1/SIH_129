import csv
from pathlib import Path

INPUT_FILE = Path("data/problems_dataset.csv")
OUTPUT_FILE = Path("data/problems_dataset_fixed.csv")

EXPECTED_COLUMNS = [
    "title",
    "description",
    "domain",
    "subDomain",
    "sector",
    "severity",
]

print("=" * 60)
print("SIH DATASET FORMAT REPAIR")
print("=" * 60)

print(f"\nReading:")
print(INPUT_FILE)

if not INPUT_FILE.exists():
    raise FileNotFoundError(
        f"Dataset not found: {INPUT_FILE}"
    )

# ---------------------------------------------------------
# READ RAW FILE
# ---------------------------------------------------------

with open(
    INPUT_FILE,
    "r",
    encoding="utf-8-sig",
    newline=""
) as f:
    lines = f.read().splitlines()

print(f"\nTotal lines found: {len(lines)}")

if len(lines) < 2:
    raise ValueError("Dataset does not contain enough rows.")

# ---------------------------------------------------------
# DETECT HEADER
# ---------------------------------------------------------

header_line = lines[0]

print("\nHeader:")
print(header_line)

if "\t" in header_line:
    delimiter = "\t"
    print("\nDetected delimiter: TAB")
else:
    delimiter = ","
    print("\nDetected delimiter: COMMA")

# ---------------------------------------------------------
# PARSE ROWS
# ---------------------------------------------------------

rows = []

for line_number, line in enumerate(lines[1:], start=2):

    if not line.strip():
        continue

    try:

        # If tabs are present, use tabs.
        # This protects commas inside descriptions.
        if "\t" in line:
            parts = line.split("\t")

        else:
            reader = csv.reader([line])
            parts = next(reader)

        # Remove accidental whitespace
        parts = [x.strip() for x in parts]

        # -------------------------------------------------
        # EXPECT 6 COLUMNS
        # -------------------------------------------------

        if len(parts) != 6:

            print(
                f"WARNING: Line {line_number} has "
                f"{len(parts)} columns instead of 6"
            )

            print("CONTENT:")
            print(line)

            # Try comma parsing as fallback
            reader = csv.reader([line])
            comma_parts = next(reader)

            comma_parts = [x.strip() for x in comma_parts]

            if len(comma_parts) == 6:
                parts = comma_parts

            else:
                raise ValueError(
                    f"Cannot repair line {line_number}. "
                    f"Found {len(parts)} columns."
                )

        rows.append(parts)

    except Exception as e:
        raise ValueError(
            f"Error processing line {line_number}: {e}"
        )

# ---------------------------------------------------------
# VALIDATE
# ---------------------------------------------------------

print("\nRows successfully parsed:", len(rows))

if len(rows) != 144:
    print(
        f"\nWARNING: Expected 144 data rows, "
        f"but found {len(rows)}."
    )

# ---------------------------------------------------------
# WRITE PROPER CSV
# ---------------------------------------------------------

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
    newline=""
) as f:

    writer = csv.writer(
        f,
        quoting=csv.QUOTE_MINIMAL
    )

    writer.writerow(EXPECTED_COLUMNS)

    writer.writerows(rows)

print("\n" + "=" * 60)
print("DATASET REPAIR COMPLETED")
print("=" * 60)

print("\nCreated:")
print(OUTPUT_FILE)

print("\nColumns:")
for column in EXPECTED_COLUMNS:
    print(" -", column)

print("\nRows:", len(rows))

print("\nNext step:")
print("Replace problems_dataset.csv with problems_dataset_fixed.csv")