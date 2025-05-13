const Event = require('../models/Event');
const { scrapeEvents } = require('../utils/scraper');
const logger = require('../utils/logger');

/**
 * Get all events from the database
 * @returns {Promise<Array>} Array of event objects
 */
const getAllEvents = async () => {
  try {
    return await Event.find({}).sort({ date: 1 });
  } catch (error) {
    logger.error('Error getting all events:', error);
    throw error;
  }
};

/**
 * Get event by ID
 * @param {string} eventId Event ID
 * @returns {Promise<Object>} Event object
 */
const getEventById = async (eventId) => {
  try {
    return await Event.findOne({ id: eventId });
  } catch (error) {
    logger.error(`Error getting event with ID ${eventId}:`, error);
    throw error;
  }
};

/**
 * Update events in the database with newly scraped events
 * @param {Object} io Socket.IO instance
 * @returns {Promise<Array>} Array of updated event objects
 */
const updateEvents = async (io) => {
  try {
    // Scrape new events
    const freshEvents = await scrapeEvents();
    
    if (freshEvents.length === 0) {
      logger.warn('No events were scraped, skipping database update');
      return [];
    }
    
    // Delete all existing events and insert new ones
    await Event.deleteMany({});
    logger.info('Deleted existing events from database');
    
    const insertedEvents = await Event.insertMany(freshEvents);
    logger.info(`Inserted ${insertedEvents.length} events into database`);
    
    // Emit socket event if io is provided
    if (io) {
      io.emit('eventsUpdated', { count: insertedEvents.length });
      logger.info('Emitted eventsUpdated socket event');
    }
    
    return insertedEvents;
  } catch (error) {
    logger.error('Error updating events:', error);
    throw error;
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  updateEvents
};