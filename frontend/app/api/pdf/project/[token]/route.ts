import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getFrontendUrl } from '@/lib/config';

const getPuppeteerConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDocker = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.DOCKER_ENV;
  
  if (isProduction && isDocker) {
    // Configuration pour Docker/Alpine en production
    return {
      executablePath: '/usr/bin/chromium-browser',
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
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Optionnel : désactive les images pour plus de rapidité
        '--run-all-compositor-stages-before-draw',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows'
      ],
      headless: true
    };
  }
  
  // Configuration pour développement local
  return {
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage' // Utile même en dev pour éviter les problèmes de mémoire
    ]
  };
};

// Helper pour configurer les cookies selon l'environnement
const getCookieConfig = (token: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = getFrontendUrl();
  
  // Extraire le domaine de l'URL frontend
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
    secure: isProduction, // HTTPS en production, HTTP en dev
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

    console.log('Launching browser with config:', getPuppeteerConfig());
    browser = await puppeteer.launch(getPuppeteerConfig());

    const page = await browser.newPage();

    // Configuration de la page pour de meilleures performances
    await page.setViewport({ width: 1200, height: 800 });
    
    // Désactiver les ressources non nécessaires en production
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

    // Configuration du cookie selon l'environnement
    const cookieConfig = getCookieConfig(token);
    await page.setCookie(cookieConfig);

    const frontendUrl = getFrontendUrl();
    const exportUrl = `${frontendUrl}/projects/export-pdf/${token}`;
    
    console.log('Navigating to:', exportUrl);

    await page.goto(exportUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 // Timeout plus long pour Docker
    });

    // Attendre que le chargement soit terminé
    await page.waitForFunction(
      'document.querySelector(".flex.justify-center.items-center.h-screen") === null || !document.querySelector(".flex.justify-center.items-center.h-screen").textContent.includes("Chargement")',
      { timeout: 15000 }
    );

    // Attendre les graphiques avec un timeout plus long
    await page.waitForFunction(
      'document.querySelectorAll(".recharts-surface").length > 0',
      { timeout: 20000 }
    ).catch(err => {
      console.warn('Les graphiques ne sont peut-être pas chargés, mais on continue:', err.message);
    });

    // Délai supplémentaire pour s'assurer que tout est rendu
    const additionalDelay = process.env.NODE_ENV === 'production' ? 6000 : 4000;
    await new Promise(resolve => setTimeout(resolve, additionalDelay));

    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
      scale: 0.7,
      timeout: 30000 // Timeout pour la génération PDF
    });

    await browser.close();
    browser = null;

    console.log('PDF generated successfully, size:', pdfBuffer.length);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="project-report.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    
    // S'assurer que le browser est fermé en cas d'erreur
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('Timeout');
    
    return NextResponse.json(
      { 
        error: 'PDF generation failed', 
        details: errorMessage,
        suggestion: isTimeoutError ? 'The page took too long to load. Please try again.' : 'Please check the logs for more details.'
      },
      { status: 500 }
    );
  }
}