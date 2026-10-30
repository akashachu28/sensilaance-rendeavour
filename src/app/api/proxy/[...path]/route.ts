import { NextRequest, NextResponse } from 'next/server';

// Server-side only — never exposed to the browser
const BACKEND_URL = process.env.BACKEND_URL || 'http://192.168.20.160:8090';

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
    const backendResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    });

    const responseBody = await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      // Don't forward encoding headers — Next.js handles this
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[Proxy Error]', targetUrl, err);
    return NextResponse.json(
      { error: 'Failed to reach backend', target: targetUrl },
      { status: 502 }
    );
  }
}
