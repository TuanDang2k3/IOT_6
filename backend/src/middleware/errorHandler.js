const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorHandler;