const Contact = require("../models/Contact.model");

const createContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Create contact
    const newContact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newContact
    });

  } catch (error) {
    next(error); // pass to central error handler
  }
};

module.exports = {
  createContact
};
