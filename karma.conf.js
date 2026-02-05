// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  // Detectar Chromium de puppeteer o Chrome del sistema
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  function findPuppeteerChrome() {
    const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
    if (fs.existsSync(cacheDir)) {
      const versions = fs.readdirSync(cacheDir).filter(d => d.startsWith('linux-'));
      if (versions.length > 0) {
        const chromePath = path.join(cacheDir, versions[0], 'chrome-linux64', 'chrome');
        if (fs.existsSync(chromePath)) return chromePath;
      }
    }
    return null;
  }

  const chromePath = process.env.CHROME_BIN || findPuppeteerChrome();

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-translate',
          '--disable-extensions',
          '--disable-dev-shm-usage',
          '--headless',
          '--remote-debugging-port=9222'
        ]
      }
    },
    singleRun: false
  });

  // Si se detectó una ruta de Chrome, usarla
  if (chromePath) {
    process.env.CHROME_BIN = chromePath;
  }
};
