import { test,  Page } from '@playwright/test';

test('test', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://playwright.dev/');

  await page.setViewportSize({ width: 1920, height: 920 });
  await page.waitForTimeout(1000);

  // Function to collect all links on the page
  async function getAllLinksFromPage(page: Page) {
    const links = await page.locator('a'); // Locate all anchor tags
    const allLinks = await links.all();
    const allHrefs = await Promise.all(
      allLinks.map(async (link) => {
        const href = await link.getAttribute('href');
        return href; // Return the href attribute of each link
      })
    );
    return allHrefs.filter(href => href); // Filter out any null or undefined hrefs
  }

  // Collect all links from the page
  const linkUrls = await getAllLinksFromPage(page);
  console.log('Collected Links:', linkUrls);

  // Function to check link status 
  const checkLinkStatus = (url: string) => {
    if (!url) {
      return { link: 'Invalid URL', status: 'Error: No URL' };
    }

    // Log the URL 
    console.log(`Checking link: ${url}`);

    // Handle relative URLs and ensure they are properly formatted
    let formattedUrl;
    try {
      // If it's a relative URL, combine it with the base URL
      formattedUrl = new URL(url, page.url()).toString();
    } catch (error) {
      console.log(`Invalid URL: ${url}`);
      return { link: url, status: 'Error: Invalid URL format' };
    }

    // Check the link status using fetch
    return page.context().request.fetch(formattedUrl).then((response) => {
      if (response.ok()) {
        return { link: formattedUrl, status: 'OK' };
      } else {
        return { link: formattedUrl, status: `Error: ${response.status()}` };
      }
    }).catch((error) => {
      console.log(`Error fetching: ${formattedUrl}`);
      return { link: formattedUrl, status: 'Error: Unable to fetch' };
    });
  };

  // Check the status of each link and log the result
  for (let link of linkUrls) {
    // Skip empty or invalid links
    if (!link || typeof link !== 'string') {
      console.log('Skipping invalid link:', link);
      continue;
    }

    const result = await checkLinkStatus(link);
    console.log(`${result.link} - ${result.status}`);
  }
});