exports.run = async () => {
  return [{
    type: 'Headers',
    message: 'No CSP detected',
    file: 'next.config.js',
    details: 'Content-Security-Policy header is missing.',
    severity: 2,
    doc: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP'
  }];
};