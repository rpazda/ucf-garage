# ucf-garage

## Scraper

The scraper gathers parking data and stores it in the MongoDB database. It "scrapes" the HTML/CSS content of the public parking data page every 5 minutes, loads the page data into a jQuery object, and pulls the desired count data out of the page using CSS selectors in jQuery. The scraping is performed by scheduled calling of a scraping function using node-schedule. The data is then formatted with time/date/garage information and then stored in the database.

The scraper also servers as the visualization's interface to the data and provides functions for getting the data through simple express routing. The scraper is intended to always be collecting new data.

## Visualization

Still very much in development