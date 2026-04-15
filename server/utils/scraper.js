const axios = require('axios');
const cheerio = require('cheerio');

const scrapeJobFromURL = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    // Remove unwanted tags
    $('script, style, nav, footer, header, iframe').remove();

    // Try to extract job title
    let jobTitle =
      $('h1').first().text().trim() ||
      $('[class*="job-title"]').first().text().trim() ||
      $('[class*="jobtitle"]').first().text().trim() ||
      $('title').text().trim() ||
      'Not found';

    // Try to extract company name
    let companyName =
      $('[class*="company"]').first().text().trim() ||
      $('[class*="employer"]').first().text().trim() ||
      $('[class*="organization"]').first().text().trim() ||
      'Not found';

    // Try to extract description
    let description =
      $('[class*="description"]').first().text().trim() ||
      $('[class*="job-detail"]').first().text().trim() ||
      $('[class*="jobdetail"]').first().text().trim() ||
      $('main').first().text().trim() ||
      $('body').text().trim();

    // Clean up description
    description = description
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 2000);

    // Try to extract salary
    let salary = '';
    const salaryPattern = /(\$[\d,]+|\d+[\s]*LPA|\d+[\s]*lpa|\d+[\s]*per[\s]*month|\d+[\s]*\/month|\d+[\s]*k[\s]*per|\₹[\d,]+)/i;

    $('*').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length < 80) {
        const match = text.match(salaryPattern);
        if (match && !salary) {
          salary = match[0].trim();
        }
      }
    });

    // Clean up extracted text
    jobTitle = jobTitle.substring(0, 100);
    companyName = companyName.substring(0, 100);
    salary = salary.substring(0, 100);

    return {
      success: true,
      jobTitle,
      companyName,
      description,
      salary
    };

  } catch (err) {
    return {
      success: false,
      error: 'Could not fetch job details from this URL. Please enter details manually.'
    };
  }
};

module.exports = scrapeJobFromURL;