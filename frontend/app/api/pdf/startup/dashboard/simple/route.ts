import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '1';
    
    // Configuration pour Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    
    // Configuration de la page
    await page.setViewport({ 
      width: 1200, 
      height: 800,
      deviceScaleFactor: 2
    });

    // URL de la page d'export
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'
      : 'http://localhost:3000';
    
    const exportUrl = `${baseUrl}/startup/export-pdf?userId=${userId}`;
    
    console.log('Navigating to:', exportUrl);
    
    // Naviguer vers la page d'export avec timeout plus long
    await page.goto(exportUrl, { 
      waitUntil: 'domcontentloaded', // Plus permissif que networkidle0
      timeout: 60000
    });

    // Attendre que le DOM soit prêt
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
          // Fallback après 10 secondes
          setTimeout(() => resolve(true), 10000);
        }
      });
    });
    
    // Attendre un peu pour les composants React
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('Generating PDF...');

    // Générer le PDF avec des options robustes
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true,
      timeout: 30000
    });

    await browser.close();

    // Retourner le PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="startup-dashboard-simple-${userId}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF simple:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
