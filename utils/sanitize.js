const sanitizeHtml = require('sanitize-html');

function sanitizeInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [], // tidak izinkan HTML tag sama sekali
    allowedAttributes: {},
  });
}

module.exports = { sanitizeInput };
