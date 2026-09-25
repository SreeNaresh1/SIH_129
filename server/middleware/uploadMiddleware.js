const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true
  });
}

// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    const extension =
      path.extname(file.originalname) || "";

    const safeName =
      path
        .basename(
          file.originalname,
          extension
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );

    const filename =
      `${Date.now()}-${safeName}${extension}`;

    console.log(
      "Saving file as:",
      filename
    );

    cb(null, filename);
  }
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = function (
  req,
  file,
  cb
) {
  console.log(
    "================================="
  );

  console.log(
    "FILE RECEIVED"
  );

  console.log(
    "Field:",
    file.fieldname
  );

  console.log(
    "Original name:",
    file.originalname
  );

  console.log(
    "MIME type:",
    file.mimetype
  );

  console.log(
    "================================="
  );

  // ---------------------------------------------------
  // ACCEPT ALL IMAGE TYPES
  // ---------------------------------------------------

  if (
    file.mimetype &&
    file.mimetype.toLowerCase().startsWith("image/")
  ) {
    console.log(
      "IMAGE ACCEPTED"
    );

    cb(null, true);

    return;
  }

  // ---------------------------------------------------
  // ACCEPT ALL VIDEO TYPES
  // ---------------------------------------------------

  if (
    file.mimetype &&
    file.mimetype.toLowerCase().startsWith("video/")
  ) {
    console.log(
      "VIDEO ACCEPTED"
    );

    cb(null, true);

    return;
  }

  // ---------------------------------------------------
  // ALSO ACCEPT COMMON VIDEO EXTENSIONS
  // ---------------------------------------------------

  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
    ".mov",
    ".mpeg",
    ".mpg",
    ".m4v"
  ];

  if (
    allowedExtensions.includes(
      extension
    )
  ) {
    console.log(
      "FILE ACCEPTED BY EXTENSION:",
      extension
    );

    cb(null, true);

    return;
  }

  // ---------------------------------------------------
  // REJECT
  // ---------------------------------------------------

  console.log(
    "FILE REJECTED:"
  );

  console.log(
    "Name:",
    file.originalname
  );

  console.log(
    "MIME:",
    file.mimetype
  );

  console.log(
    "Extension:",
    extension
  );

  cb(
    new Error(
      `File type not allowed. Name: ${file.originalname}, MIME: ${file.mimetype}`
    ),
    false
  );
};

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize:
      50 * 1024 * 1024
  }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = upload;