// This file is auto-generated by @hey-api/openapi-ts

export type CrawlResponse = {
  success?: boolean;
  id?: string;
  url?: string;
};

export type CrawlStatusResponseObj = {
  /**
   * Markdown content of the page if the `markdown` format was specified (default)
   */
  markdown?: string | null;
  /**
   * HTML version of the content on page if the `html` format was specified
   */
  html?: string | null;
  /**
   * Raw HTML content of the page if the `rawHtml` format was specified
   */
  rawHtml?: string | null;
  /**
   * Links on the page if the `links` format was specified
   */
  links?: Array<string> | null;
  /**
   * URL of the screenshot of the page if the `screenshot` or `screenshot@fullSize` format was specified
   */
  screenshot?: string | null;
  metadata?: {
    title?: string;
    description?: string;
    language?: string | null;
    sourceURL?: string;
    '<any other metadata> '?: string;
    /**
     * The status code of the page
     */
    statusCode?: number;
    /**
     * The error message of the page
     */
    error?: string | null;
  };
};

export type ScrapeResponse = {
  success?: boolean;
  /**
   * Warning message to let you know of any issues.
   */
  warning?: string | null;
  data?: {
    /**
     * Markdown content of the page if the `markdown` format was specified (default)
     */
    markdown?: string | null;
    /**
     * HTML version of the content on page if the `html` format was specified
     */
    html?: string | null;
    /**
     * Raw HTML content of the page if the `rawHtml` format was specified
     */
    rawHtml?: string | null;
    /**
     * Links on the page if the `links` format was specified
     */
    links?: Array<string> | null;
    /**
     * URL of the screenshot of the page if the `screenshot` or `screenshot@fullSize` format was specified
     */
    screenshot?: string | null;
    metadata?: {
      title?: string;
      description?: string;
      language?: string | null;
      sourceURL?: string;
      '<any other metadata> '?: string;
      /**
       * The status code of the page
       */
      statusCode?: number;
      /**
       * The error message of the page
       */
      error?: string | null;
    };
  };
};

export type SearchResponse = {
  success?: boolean;
  data?: Array<unknown>;
};

export type ScrapeData = {
  body: {
    /**
     * The URL to scrape
     */
    url: string;
    /**
     * Specific formats to return.
     *
     * - markdown: The page in Markdown format.
     * - html: The page's HTML, trimmed to include only meaningful content.
     * - rawHtml: The page's original HTML.
     * - links: The links on the page.
     * - screenshot: A screenshot of the top of the page.
     * - screenshot@fullPage: A screenshot of the full page. (overridden by screenshot if present)
     */
    formats?: Array<'markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'screenshot@fullPage'>;
    /**
     * Headers to send with the request. Can be used to send cookies, user-agent, etc.
     */
    headers?: {
      [key: string]: unknown;
    };
    /**
     * Only include tags, classes and ids from the page in the final output. Use comma separated values. Example: 'script, .ad, #footer'
     */
    includeTags?: Array<string>;
    /**
     * Tags, classes and ids to remove from the page. Use comma separated values. Example: 'script, .ad, #footer'
     */
    excludeTags?: Array<string>;
    /**
     * Only return the main content of the page excluding headers, navs, footers, etc.
     */
    onlyMainContent?: boolean;
    /**
     * Timeout in milliseconds for the request
     */
    timeout?: number;
    /**
     * Wait x amount of milliseconds for the page to load to fetch content
     */
    waitFor?: number;
  };
};

export type ScrapeResponse2 = ScrapeResponse;

export type ScrapeError = {
  error?: string;
};

export type CrawlUrlsData = {
  body: {
    /**
     * The base URL to start crawling from
     */
    url: string;
    crawlerOptions?: {
      /**
       * URL patterns to include
       */
      includes?: Array<string>;
      /**
       * URL patterns to exclude
       */
      excludes?: Array<string>;
      /**
       * Generate alt text for images using LLMs (must have a paid plan)
       */
      generateImgAltText?: boolean;
      /**
       * If true, returns only the URLs as a list on the crawl status. Attention: the return response will be a list of URLs inside the data, not a list of documents.
       */
      returnOnlyUrls?: boolean;
      /**
       * Maximum depth to crawl relative to the entered URL. A maxDepth of 0 scrapes only the entered URL. A maxDepth of 1 scrapes the entered URL and all pages one level deep. A maxDepth of 2 scrapes the entered URL and all pages up to two levels deep. Higher values follow the same pattern.
       */
      maxDepth?: number;
      /**
       * The crawling mode to use. Fast mode crawls 4x faster websites without sitemap, but may not be as accurate and shouldn't be used in heavy js-rendered websites.
       */
      mode?: 'default' | 'fast';
      /**
       * Ignore the website sitemap when crawling
       */
      ignoreSitemap?: boolean;
      /**
       * Maximum number of pages to crawl
       */
      limit?: number;
      /**
       * Enables the crawler to navigate from a specific URL to previously linked pages. For instance, from 'example.com/product/123' back to 'example.com/product'
       */
      allowBackwardCrawling?: boolean;
      /**
       * Allows the crawler to follow links to external websites.
       */
      allowExternalContentLinks?: boolean;
    };
    pageOptions?: {
      /**
       * Headers to send with the request. Can be used to send cookies, user-agent, etc.
       */
      headers?: {
        [key: string]: unknown;
      };
      /**
       * Include the HTML version of the content on page. Will output a html key in the response.
       */
      includeHtml?: boolean;
      /**
       * Include the raw HTML content of the page. Will output a rawHtml key in the response.
       */
      includeRawHtml?: boolean;
      /**
       * Only include tags, classes and ids from the page in the final output. Use comma separated values. Example: 'script, .ad, #footer'
       */
      onlyIncludeTags?: Array<string>;
      /**
       * Only return the main content of the page excluding headers, navs, footers, etc.
       */
      onlyMainContent?: boolean;
      /**
       * Tags, classes and ids to remove from the page. Use comma separated values. Example: 'script, .ad, #footer'
       */
      removeTags?: Array<string>;
      /**
       * Replace all relative paths with absolute paths for images and links
       */
      replaceAllPathsWithAbsolutePaths?: boolean;
      /**
       * Include a screenshot of the top of the page that you are scraping.
       */
      screenshot?: boolean;
      /**
       * Include a full page screenshot of the page that you are scraping.
       */
      fullPageScreenshot?: boolean;
      /**
       * Wait x amount of milliseconds for the page to load to fetch content
       */
      waitFor?: number;
    };
  };
};

export type CrawlUrlsResponse = CrawlResponse;

export type CrawlUrlsError = {
  error?: string;
};

export type SearchGoogleData = {
  body: {
    /**
     * The query to search for
     */
    query: string;
    pageOptions?: {
      /**
       * Only return the main content of the page excluding headers, navs, footers, etc.
       */
      onlyMainContent?: boolean;
      /**
       * Fetch the content of each page. If false, defaults to a basic fast serp API.
       */
      fetchPageContent?: boolean;
      /**
       * Include the HTML version of the content on page. Will output a html key in the response.
       */
      includeHtml?: boolean;
      /**
       * Include the raw HTML content of the page. Will output a rawHtml key in the response.
       */
      includeRawHtml?: boolean;
    };
    searchOptions?: {
      /**
       * Maximum number of results. Max is 20 during beta.
       */
      limit?: number;
    };
  };
};

export type SearchGoogleResponse = SearchResponse;

export type SearchGoogleError = {
  error?: string;
};

export type GetCrawlStatusData = {
  path: {
    /**
     * ID of the crawl job
     */
    jobId: string;
  };
};

export type GetCrawlStatusResponse = {
  /**
   * Status of the job (completed, active, failed, paused)
   */
  status?: string;
  /**
   * Current page number
   */
  current?: number;
  /**
   * Total number of pages
   */
  total?: number;
  /**
   * Data returned from the job (null when it is in progress)
   */
  data?: Array<CrawlStatusResponseObj>;
  /**
   * Partial documents returned as it is being crawled (streaming). **This feature is currently in alpha - expect breaking changes** When a page is ready, it will append to the partial_data array, so there is no need to wait for the entire website to be crawled. When the crawl is done, partial_data will become empty and the result will be available in `data`. There is a max of 50 items in the array response. The oldest item (top of the array) will be removed when the new item is added to the array.
   */
  partial_data?: Array<CrawlStatusResponseObj>;
};

export type GetCrawlStatusError = {
  error?: string;
};

export type CancelCrawlJobData = {
  path: {
    /**
     * ID of the crawl job
     */
    jobId: string;
  };
};

export type CancelCrawlJobResponse = {
  /**
   * Returns cancelled.
   */
  status?: string;
};

export type CancelCrawlJobError = {
  error?: string;
};