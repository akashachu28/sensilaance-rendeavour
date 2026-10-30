import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

const BACKEND_URL = (process.env.BACKEND_URL || '').replace(/\/$/, '');

if (!BACKEND_URL) {
  console.error('[Proxy] BACKEND_URL is not set — all requests will return fallback data');
}

/** Empty fallback responses so the UI renders when the backend is unreachable */
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

async function proxyRequest(request: NextRequest, params: { path: string[] }): Promise<NextResponse> {
  const path = params.path.join('/');

  if (!BACKEND_URL) {
    return NextResponse.json(getFallbackResponse(path), { status: 200 });
  }

  const targetUrl = `${BACKEND_URL}/${path}${request.nextUrl.search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (key !== 'host' && key !== 'connection') {
      forwardHeaders.set(key, value);
    }
  });

  const method = request.method;
  const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.text();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(targetUrl, { method, headers: forwardHeaders, body, signal: controller.signal });
    clearTimeout(timer);

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      if (key !== 'content-encoding' && key !== 'transfer-encoding') {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(await res.arrayBuffer(), { status: res.status, headers: responseHeaders });
  } catch {
    clearTimeout(timer);
    console.warn(`[Proxy] Unreachable: ${targetUrl} — returning fallback`);
    return NextResponse.json(getFallbackResponse(path), { status: 200 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
