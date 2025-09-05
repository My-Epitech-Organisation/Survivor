import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { getFrontendUrl } from '@/lib/config';
import { execSync } from 'child_process';

const findChromiumPath = () => {
  try {
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    if (process.env.NODE_ENV === 'production') {
      try {
        const chromiumPath = '/usr/bin/chromium-browser';
        execSync(`test -f ${chromiumPath}`);
        return chromiumPath;
      } catch (e) {
        console.warn(`Chromium not found a the default location: ${e}`);
      }

      try {
        const chromePath = '/usr/bin/chrome';
        execSync(`test -f ${chromePath}`);
        return chromePath;
      } catch (e) {
        console.warn(`Chromium not found a the second default location: ${e}`);
      }
    }

    return '/bin/google-chrome';
  } catch (error) {
    console.error('Error while Chromium search:', error);
    return undefined;
  }
};

const getPuppeteerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDocker = process.env.DOCKER_ENV === 'true';
  const chromiumPath = findChromiumPath();

  if (isProduction || isDocker) {
    return {
      executablePath: chromiumPath,
      ignoreHTTPSErrors: true,
      headless: true,
      dumpio: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-features=site-per-process,TranslateUI,BlinkGenPropertyTrees',
        '--disable-hang-monitor',
        '--in-process-gpu',
        '--mute-audio'
      ]
    };
  }
  return {
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ]
  };
};

const getCookieConfig = (token: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = getFrontendUrl();
  let domain: string;
  try {
    const url = new URL(frontendUrl);
    domain = url.hostname;
  } catch {
    domain = 'localhost';
  }

  return {
    name: 'authToken',
    value: token,
    domain: domain,
    path: '/',
    httpOnly: false,
    secure: isProduction,
  };
};

export async function GET(request: NextRequest) {
  let browser = null;

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication token is required' }, { status: 400 });
    }

    try {
      browser = await puppeteer.launch(getPuppeteerConfig());
    } catch (error: unknown) {
      console.error('Error launching browser:', error);
      return NextResponse.json({
        error: 'Failed to launch browser',
        details: error instanceof Error ? error.message : String(error),
        config: getPuppeteerConfig()
      }, { status: 500 });
    }

    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 800 });

    if (process.env.NODE_ENV === 'production') {
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'image'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    const cookieConfig = getCookieConfig(token);
    await page.setCookie(cookieConfig);

    const frontendUrl = getFrontendUrl();
    const exportUrl = `${frontendUrl}/projects/export-pdf/${token}`;

    await page.evaluateOnNewDocument(`
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          console.log('Fetch request:', args[0]);
          const response = await originalFetch(...args);

          const clone = response.clone();
          if (clone.headers.get('content-type')?.includes('application/json')) {
            try {
              const data = await clone.json();
              console.log('Fetch response:', data);
            } catch (e) {
              console.error('Error parsing JSON response:', e);
            }
          }
          return response;
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        }
      };

      window.getAPIUrlOverride = function() {
        return 'http://backend:8000/api';
      };

      window.getBackendUrlOverride = function() {
        return 'http://backend:8000';
      };
    `);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      await page.goto(exportUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
    } catch (navError) {
      console.error('Navigation error:', navError);
      throw new Error(`Navigation failed: ${navError instanceof Error ? navError.message : String(navError)}`);
    }

    await new Promise(resolve => setTimeout(resolve, 10000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
      scale: 0.8,
      timeout: 60000,
      preferCSSPageSize: false
    });

    await browser.close();
    browser = null;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="project-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);

    if (browser) {
      try {
        const page = (await browser.pages())[0];
        if (page) {
          await page.screenshot({ fullPage: true });
        }
      } catch (screenshotError) {
        console.error('Error capturing screenshot:', screenshotError);
      }

      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('Timeout');
    const isNavigationError = errorMessage.includes('Navigation') || errorMessage.includes('net::');

    return NextResponse.json(
      {
        error: 'PDF generation failed',
        details: errorMessage,
        suggestion: isTimeoutError
          ? 'The page took too long to load. Please try again or check network connectivity.'
          : isNavigationError
            ? 'Failed to navigate to the export page. Please check if the service is accessible.'
            : 'Please check the logs for more details.'
      },
      { status: 500 }
    );
  }
}