exports.handler = async function(context, event, callback) {
  try {
    const numMedia = parseInt(event.NumMedia || "0", 10);

    console.log(`Incoming message from ${event.From} — media count: ${numMedia}`);

    const twiml = new Twilio.twiml.MessagingResponse();

    if (numMedia === 0) {
      // They sent a text with no photo
      twiml.message("Please send a photo to add it to the gallery! 📸");
    } else {
      // They sent at least one photo
      twiml.message(`Got it! Your ${numMedia > 1 ? `${numMedia} photos` : "photo"} has been added to the gallery 🥒`);
    }

    return callback(null, twiml);

  } catch (err) {
    console.error("Webhook handler error:", err.message);
    const twiml = new Twilio.twiml.MessagingResponse();
    twiml.message("Something went wrong. Please try again.");
    return callback(null, twiml);
  }
};
