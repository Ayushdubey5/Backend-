const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * GET /api/events
 * Get all events
 */
router.get('/events', async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    logger.info(`Retrieved ${events.length} events`);
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    logger.error('Error in GET /api/events:', error);
    next(error);
  }
});

/**
 * GET /api/events/:id
 * Get a single event by ID
 */
router.get('/events/:id', async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    
    if (!event) {
      logger.warn(`Event with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    logger.info(`Retrieved event with ID ${req.params.id}`);
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error(`Error in GET /api/events/${req.params.id}:`, error);
    next(error);
  }
});

/**
 * POST /api/email
 * Register an email for an event
 */
router.post('/email', async (req, res, next) => {
  try {
    const { email, eventId } = req.body;
    
    // Validate request
    if (!email || !eventId) {
      logger.warn('Missing required fields in POST /api/email');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and eventId'
      });
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`Invalid email format: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Register email
    const emailRegistration = await emailService.registerEmail(email, eventId);
    
    logger.info(`Email registered successfully for event ${eventId}`);
    res.status(201).json({
      success: true,
      message: 'Email registered successfully',
      data: {
        email: emailRegistration.email,
        eventId: emailRegistration.eventId,
        ticketUrl: emailRegistration.ticketUrl,
        createdAt: emailRegistration.createdAt
      }
    });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes('not found')) {
      logger.warn(error.message);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    logger.error('Error in POST /api/email:', error);
    next(error);
  }
});

/**
 * POST /api/scrape
 * Manually trigger a scrape and update of events
 */
router.post('/scrape', async (req, res, next) => {
  try {
    const io = req.app.get('io');
    logger.info('Manual scraping triggered');
    
    const events = await eventService.updateEvents(io);
    
    res.status(200).json({
      success: true,
      message: 'Events scraped and updated successfully',
      count: events.length
    });
  } catch (error) {
    logger.error('Error in POST /api/scrape:', error);
    next(error);
  }
});

module.exports = router;