import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getFrontendUrl } from '@/lib/config';

export async function GET(
  request: NextRequest
) {
  try {
    // Extract the token from the URL path instead of context.params
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];

    if (!token) {
      return NextResponse.json({ error: 'Authentication token is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setCookie({
      name: 'authToken',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    });

    const frontendUrl = getFrontendUrl();
    const exportUrl = `${frontendUrl}/projects/export-pdf/${token}`;

    console.log(`Navigating to: ${exportUrl}`);
    await page.goto(exportUrl, { waitUntil: 'networkidle0' });

    await page.waitForFunction(
      'document.querySelector(".flex.justify-center.items-center.h-screen") === null || !document.querySelector(".flex.justify-center.items-center.h-screen").textContent.includes("Chargement")',
      { timeout: 10000 }
    );

    await page.waitForFunction(
      'document.querySelectorAll(".recharts-surface").length > 0',
      { timeout: 15000 }
    ).catch(err => console.log('Les graphiques ne sont peut-être pas chargés, mais on continue:', err));

    await new Promise(resolve => setTimeout(resolve, 4000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
      scale: 0.7
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="project-report.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
