import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Validation Service using AJV for request/response validation
 * Ensures data integrity and proper format for forecast API
 */

class ValidationService {
  constructor() {
    // Initialize AJV with additional format validators
    this.ajv = new Ajv({ 
      allErrors: true,
      removeAdditional: true, // Remove additional properties not in schema
      useDefaults: true       // Apply default values from schema
    });
    
    // Add format validators (date, email, etc.)
    addFormats(this.ajv);
    
    // Compile schemas for better performance
    this.validateRequestSchema = this.ajv.compile(this.getRequestSchema());
    this.validateResponseSchema = this.ajv.compile(this.getResponseSchema());
    
    console.log('ValidationService initialized with AJV schemas');
  }

  /**
   * JSON Schema for incoming forecast requests
   * Validates the structure of data sent to /api/forecast endpoint
   * @returns {Object} - AJV schema object
   */
  getRequestSchema() {
    return {
      type: "object",
      required: ["store", "city", "records"],
      additionalProperties: false,
      properties: {
        store: {
          type: "string",
          minLength: 1,
          maxLength: 100,
          description: "Store name (e.g., 'Cafe Cyber')"
        },
        city: {
          type: "string",
          enum: ["Cyberjaya"],
          description: "City must be Cyberjaya for this demo"
        },
        records: {
          type: "array",
          minItems: 7,   // Minimum 1 week of data
          maxItems: 365, // Maximum 1 year of data
          description: "Historical sales records",
          items: {
            type: "object",
            required: ["date", "customers", "sales_rm"],
            additionalProperties: false,
            properties: {
              date: {
                type: "string",
                format: "date",
                description: "Date in YYYY-MM-DD format"
              },
              customers: {
                type: "integer",
                minimum: 0,
                maximum: 10000,
                description: "Number of customers on this date"
              },
              sales_rm: {
                type: "number",
                minimum: 0,
                maximum: 1000000,
                description: "Sales amount in RM (Malaysian Ringgit)"
              }
            }
          }
        }
      }
    };
  }

  /**
   * JSON Schema for OpenAI forecast responses
   * Validates the structure of AI-generated forecast data
   * @returns {Object} - AJV schema object
   */
  getResponseSchema() {
    return {
      type: "object",
      required: ["store", "city", "forecast_horizon_days", "forecast", "summary"],
      additionalProperties: false,
      properties: {
        store: {
          type: "string",
          minLength: 1,
          maxLength: 100
        },
        city: {
          type: "string",
          enum: ["Cyberjaya"]
        },
        forecast_horizon_days: {
          type: "integer",
          minimum: 1,
          maximum: 30,
          description: "Number of forecast days (should be 14)"
        },
        forecast: {
          type: "array",
          minItems: 14,
          maxItems: 14,
          description: "Exactly 14 days of forecast data",
          items: {
            type: "object",
            required: ["date", "predicted_sales", "predicted_customers", "confidence", "short_insight"],
            additionalProperties: false,
            properties: {
              date: {
                type: "string",
                format: "date",
                description: "Forecast date in YYYY-MM-DD format"
              },
              predicted_sales: {
                type: "number",
                minimum: 0,
                maximum: 1000000,
                description: "Predicted sales amount in RM"
              },
              predicted_customers: {
                type: "integer",
                minimum: 0,
                maximum: 10000,
                description: "Predicted number of customers"
              },
              confidence: {
                type: "integer",
                minimum: 0,
                maximum: 100,
                description: "Confidence score (0-100%)"
              },
              short_insight: {
                type: "string",
                minLength: 5,
                maxLength: 100,
                description: "Brief insight about this day's prediction"
              }
            }
          }
        },
        summary: {
          type: "string",
          minLength: 50,
          maxLength: 1000,
          description: "Summary with actionable recommendations"
        }
      }
    };
  }

  /**
   * Validates incoming forecast request data
   * @param {Object} requestData - Request body to validate
   * @returns {Object} - { valid: boolean, errors: array, data: object }
   */
  validateRequest(requestData) {
    try {
      // Create a deep copy to avoid mutating original data
      const dataCopy = JSON.parse(JSON.stringify(requestData));
      
      const valid = this.validateRequestSchema(dataCopy);
      
      if (!valid) {
        const errors = this.validateRequestSchema.errors.map(error => ({
          field: error.instancePath || error.schemaPath,
          message: error.message,
          rejectedValue: error.data
        }));
        
        console.log('Request validation failed:', errors);
        return { valid: false, errors, data: null };
      }
      
      // Additional business logic validation
      const businessValidation = this.validateBusinessRules(dataCopy);
      if (!businessValidation.valid) {
        return businessValidation;
      }
      
      console.log(`Request validation passed: ${dataCopy.records.length} records for ${dataCopy.store}`);
      return { valid: true, errors: [], data: dataCopy };
      
    } catch (error) {
      console.error('Request validation error:', error);
      return {
        valid: false,
        errors: [{ field: 'general', message: 'Invalid JSON format or structure' }],
        data: null
      };
    }
  }

  /**
   * Validates OpenAI response data against expected schema
   * @param {Object} responseData - AI response to validate
   * @returns {Object} - { valid: boolean, errors: array, data: object }
   */
  validateResponse(responseData) {
    try {
      // Create a deep copy to avoid mutating original data
      const dataCopy = JSON.parse(JSON.stringify(responseData));
      
      const valid = this.validateResponseSchema(dataCopy);
      
      if (!valid) {
        const errors = this.validateResponseSchema.errors.map(error => ({
          field: error.instancePath || error.schemaPath,
          message: error.message,
          rejectedValue: error.data
        }));
        
        console.log('Response validation failed:', errors);
        return { valid: false, errors, data: null };
      }
      
      // Additional forecast-specific validation
      const forecastValidation = this.validateForecastDates(dataCopy.forecast);
      if (!forecastValidation.valid) {
        return forecastValidation;
      }
      
      console.log(`Response validation passed: ${dataCopy.forecast.length} forecast entries`);
      return { valid: true, errors: [], data: dataCopy };
      
    } catch (error) {
      console.error('Response validation error:', error);
      return {
        valid: false,
        errors: [{ field: 'general', message: 'Invalid response format from AI service' }],
        data: null
      };
    }
  }

  /**
   * Additional business logic validation for request data
   * @param {Object} data - Request data to validate
   * @returns {Object} - Validation result
   */
  validateBusinessRules(data) {
    const errors = [];
    
    // Check for duplicate dates in records
    const dates = data.records.map(r => r.date);
    const uniqueDates = new Set(dates);
    if (dates.length !== uniqueDates.size) {
      errors.push({ field: 'records', message: 'Duplicate dates found in records' });
    }
    
    // Check date range (not too old, not in future)
    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setFullYear(today.getFullYear() - 2); // Max 2 years old
    
    for (const record of data.records) {
      const recordDate = new Date(record.date);
      if (recordDate > today) {
        errors.push({ field: 'records', message: `Future date found: ${record.date}` });
      }
      if (recordDate < maxPastDate) {
        errors.push({ field: 'records', message: `Date too old: ${record.date}` });
      }
    }
    
    return errors.length > 0 
      ? { valid: false, errors, data: null }
      : { valid: true, errors: [], data };
  }

  /**
   * Validates forecast dates are consecutive and start from tomorrow
   * @param {Array} forecast - Forecast array to validate
   * @returns {Object} - Validation result
   */
  validateForecastDates(forecast) {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      for (let i = 0; i < forecast.length; i++) {
        const expectedDate = new Date(tomorrow);
        expectedDate.setDate(tomorrow.getDate() + i);
        
        const actualDate = new Date(forecast[i].date);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (forecast[i].date !== expectedDateStr) {
          return {
            valid: false,
            errors: [{
              field: `forecast[${i}].date`,
              message: `Expected ${expectedDateStr}, got ${forecast[i].date}`
            }],
            data: null
          };
        }
      }
      
      return { valid: true, errors: [], data: forecast };
      
    } catch (error) {
      return {
        valid: false,
        errors: [{ field: 'forecast', message: 'Error validating forecast dates' }],
        data: null
      };
    }
  }

  /**
   * Formats validation errors for API response
   * @param {Array} errors - Array of validation errors
   * @returns {Object} - Formatted error response
   */
  formatValidationErrors(errors) {
    return {
      error: 'Validation Error',
      message: 'The provided data does not meet the required format',
      details: errors,
      timestamp: new Date().toISOString()
    };
  }
}

export default ValidationService;