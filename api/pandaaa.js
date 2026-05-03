function validateGalleryItem(item) {
  const errors = [];

  if (!item.src || typeof item.src !== "string" || !item.src.startsWith("https://"))
    errors.push({ field: "src", issue: "Must be a valid HTTPS URL" });

  if (!item.description || typeof item.description !== "string")
    errors.push({ field: "description", issue: "Must be a non-empty string" });

  if (!item.alt || typeof item.alt !== "string")
    errors.push({ field: "alt", issue: "Must be a non-empty string" });

  if (!item.thumbnailWidth || !/^\d+px$/.test(item.thumbnailWidth))
    errors.push({ field: "thumbnailWidth", issue: "Must be a pixel value e.g. '200px'" });

  return errors;
}

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
]);

function sendJSON(callback, statusCode, body) {
  const response = new Twilio.Response();
  response.setStatusCode(statusCode);
  response.setBody(JSON.stringify(body));
  response.appendHeader("Content-Type", "application/json");
  response.appendHeader("Access-Control-Allow-Origin", "*");
  return callback(null, response);
}

exports.handler = async function (context, event, callback) {
  if (!context.TWILIO_NUM) {
    return callback({
      error: {
        code: "CONFIG_ERROR",
        message: "TWILIO_NUM environment variable is not set",
      },
    });
  }

  try {
    const client = context.getTwilioClient();
    const gallery = [];
    const skipped = [];
    
    const [inbound, outbound] = await Promise.all([
  client.messages.list({ to: context.TWILIO_NUM }),
  client.messages.list({ from: context.TWILIO_NUM }),
]);
const messages = [...inbound,...outbound];


    for (const message of messages) {
      if (!message.sid || message.body === undefined) {
        skipped.push({ reason: "Missing message fields", sid: message.sid });
        continue;
      }

      const pics = await message.media().list();

      for (const pic of pics) {
        if (!ALLOWED_CONTENT_TYPES.has(pic.contentType)) {
          skipped.push({
            reason: `Skipped non-image media: ${pic.contentType}`,
            sid: pic.sid,
          });
          continue;
        }

        if (!pic.uri || typeof pic.uri !== "string") {
          skipped.push({ reason: "Invalid media URI", sid: pic.sid });
          continue;
        }

        const item = {
          src: "https://api.twilio.com" + pic.uri.replace(".json", ""),
          description: message.body?.trim() || "No caption",
          alt: message.body?.trim() || "Photo",
          thumbnailWidth: "200px",
        };

        const errors = validateGalleryItem(item);
        if (errors.length > 0) {
          skipped.push({ reason: "Schema validation failed", errors, sid: pic.sid });
          continue;
        }

        gallery.push(item);
      }
    }

    return callback(null, {
      ok: true,
      data: gallery,
      meta: {
        total: gallery.length,
        skipped: skipped.length,
      },
    });

  } catch (err) {
    return callback(null, {
      ok: false,
      error: {
        code: "TWILIO_ERROR",
        message: err.message || "Failed to fetch media from Twilio",
      },
      data: [],
      meta: { total: 0, skipped: 0 },
    });
  }
};
