import { NextRequest, NextResponse } from 'next/server';

// Tell Vercel this function has a max of 10s (default is also 10, but explicit is safer)
export const maxDuration = 10;

// Server-side only — never exposed to the browser.
const BACKEND_URL = (process.env.BACKEND_URL || 'http://192.168.20.160:8090').replace(/\/$/, '');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params);
}

/** Minimal empty responses per endpoint so the UI renders when the backend is unreachable */
function getFallbackResponse(path: string): unknown {
  if (path.startsWith('api/logs')) {
    return { total: 0, page: 1, limit: 10, total_pages: 0, items: [] };
  }
  if (path.startsWith('api/stats')) {
    return { total_logs: 0, total_workers: 0, full_gear: 0, half_gear: 0, no_ppe: 0, compliance_rate: 0, total_images: 0 };
  }
  if (path.startsWith('api/cameras')) {
    return [];
  }
  return {};
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] }
) {
  const path = params.path.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${search}`;

  // Forward relevant headers, strip host
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  let body: BodyInit | undefined;
  const method = request.method;
  if (!['GET', 'HEAD'].includes(method)) {
    body = await request.text();
  }

  try {
    // Use a manual AbortController with setTimeout for broader runtime compatibility
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000); // 5s max

    let backendResponse: Response;
    try {
      backendResponse = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const responseBody = await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    // Backend unreachable (LAN IP not reachable from Vercel, or timed out)
    console.warn(`[Proxy] Backend unreachable at ${targetUrl} — returning fallback`);
    return NextResponse.json(getFallbackResponse(path), { status: 200 });
  }
}
