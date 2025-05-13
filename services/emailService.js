const Email = require('../models/Email');
const Event = require('../models/Event');
const logger = require('../utils/logger');

/**
 * Register an email for an event
 * @param {string} email User's email address
 * @param {string} eventId Event ID
 * @returns {Promise<Object>} Created email registration
 */
const registerEmail = async (email, eventId) => {
  try {
    // Validate inputs
    if (!email || !eventId) {
      throw new Error('Email and eventId are required');
    }
    
    // Find the event
    const event = await Event.findOne({ id: eventId });
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    
    // Create the email registration
    const emailRegistration = new Email({
      email,
      eventId,
      ticketUrl: event.ticketUrl
    });
    
    // Save to database
    await emailRegistration.save();
    logger.info(`Registered email ${email} for event ${eventId}`);
    
    return emailRegistration;
  } catch (error) {
    logger.error('Error registering email:', error);
    throw error;
  }
};

module.exports = {
  registerEmail
};