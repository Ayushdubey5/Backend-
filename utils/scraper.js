const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate a unique ID for an event
 * @param {string} title - Event title
 * @param {string} date - Event date
 * @returns {string} - Unique ID
 */
const generateEventId = (title, date) => {
  const data = `${title}-${date}`;
  return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Scrape events from Concrete Playground Sydney
 * @returns {Promise<Array>} - Array of event objects
 */
const scrapeEvents = async () => {
  const events = [];
  const url = 'https://concreteplayground.com/sydney/event';
  
  try {
    logger.info(`Starting to scrape events from ${url}`);
    
    // Configure axios with timeout and retry options
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch data from ${url}, status: ${response.status}`);
    }
    
    const $ = cheerio.load(response.data);
    
    // Find event elements
    const eventElements = $('.card');
    
    logger.info(`Found ${eventElements.length} events on the page`);
    
    eventElements.each((i, element) => {
      try {
        const $element = $(element);
        
        // Extract event data
        const title = $element.find('.card__title').text().trim();
        const imageEl = $element.find('.card__image');
        let image = '';
        
        // Try to get image URL from background-image style
        if (imageEl.length > 0) {
          const style = imageEl.attr('style');
          if (style) {
            const match = style.match(/background-image:url\(['"]?(.*?)['"]?\)/);
            if (match && match[1]) {
              image = match[1];
            }
          }
        }
        
        // Fallback image if we couldn't extract one
        if (!image) {
          image = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg';
        }
        
        // Extract other data
        const date = $element.find('.card__date').text().trim() || new Date().toISOString().split('T')[0];
        const ticketUrl = $element.find('a').attr('href') || 'https://concreteplayground.com/sydney/event';
        
        // Generate a unique ID
        const id = generateEventId(title, date);
        
        // Create event object
        const event = {
          id,
          title,
          image,
          date,
          ticketUrl,
          description: 'Check website for more details.',
        };
        
        events.push(event);
      } catch (error) {
        logger.error(`Error processing event element ${i}:`, error);
      }
    });
    
    logger.info(`Successfully scraped ${events.length} events`);
    return events;
    
  } catch (error) {
    logger.error('Error scraping events:', error);
    throw error;
  }
};

module.exports = {
  scrapeEvents
};