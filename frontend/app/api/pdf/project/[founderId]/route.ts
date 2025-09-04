import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getFrontendUrl } from '@/lib/config';
import api from '@/lib/api';
import ProjectDetails from '@/components/ProjectDetails';

export async function GET(
  request: NextRequest,
  context: { params: { founderId: string } }
) {
  try {
    const params = await context.params;
    const founderId = params.founderId;

    if (!founderId) {
      return NextResponse.json({ error: 'founder ID is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const frontendUrl = getFrontendUrl();
    const exportUrl = `${frontendUrl}/projects/export-pdf/${founderId}`;
    
    console.log(`Navigating to: ${exportUrl}`);
    await page.goto(exportUrl, { waitUntil: 'networkidle0' });

    // Attendre que le contenu soit chargé (que le loading disparaisse)
    await page.waitForFunction(
      'document.querySelector(".flex.justify-center.items-center.h-screen") === null || !document.querySelector(".flex.justify-center.items-center.h-screen").textContent.includes("Chargement")',
      { timeout: 10000 }
    );

    // Attendre spécifiquement que les graphiques soient rendus
    await page.waitForFunction(
      'document.querySelectorAll(".recharts-surface").length > 0',
      { timeout: 10000 }
    ).catch(err => console.log('Les graphiques ne sont peut-être pas chargés, mais on continue:', err));

    // Attendre un délai plus long pour s'assurer que tout le contenu est bien rendu
    await new Promise(resolve => setTimeout(resolve, 3000));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="project-report-${founderId}.pdf"`,
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
