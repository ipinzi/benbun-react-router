import { URLPattern } from 'urlpattern-polyfill';
import { routes } from './routeMap.ts';

class Node {
  isEnd: boolean;
  handler: Handler | null;
  children: Map<string, Node>;
  params: Map<string, Node>;

  constructor() {
    this.isEnd = false;
    this.handler = null;
    this.children = new Map<string, Node>();
    this.params = new Map<string, Node>();
  }
}

export class Router {
  root: Node;
  private routeList: Route[] = [];
  constructor() {
    this.root = new Node();
    // Add routes from routeMap to routeList
    for (const routesKey in routes) {
      if (routesKey === undefined) continue;

      this.add('GET', routesKey, async req => {
        const stream = await routes[routesKey].GetStream();

        return new Response(stream, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      });
    }
  }

  add(method: string, path: string, handler: Handler): void {
    let node = this.root;
    let parts = path.split("/");
    parts.shift(); // Remove the first empty string from the parts array

    for (let part of parts) {
      if (part.startsWith(":")) {
        // This is a URL parameter
        if (!node.params.has(part)) {
          node.params.set(part, new Node());
        }
        node = node.params.get(part)!;
      } else {
        // This is a normal part of the path
        if (!node.children.has("/"+part)) {
          node.children.set("/"+part, new Node());
        }
        node = node.children.get("/"+part)!;
      }
    }

    node.isEnd = true;
    node.handler = handler;
  }

  public async route(req: Request, headers: { 'Set-Cookie': string; 'Content-Type': string }) {
    // Use routeList for all routes
    const response = await this.match(req);
    if (response) {
      response.headers.append('Set-Cookie', headers['Set-Cookie']);
      return response;
    }

    const path = new URL(req.url).pathname;
    const filepath = path.slice(1);

    if (path.startsWith('/public/')) {
      return new Response(Bun.file(filepath));
    }
    return new Response('404 page not found.', { headers, status: 404 });
  }
  match(req: Request): Promise<Response> | Response {
    let node = this.root;
    let parts = req.url.split("/");
    parts.shift(); // Remove the first empty string from the parts array
    parts.shift();
    parts.shift();
    let params: URLPatternResultParams = {};

    for (let part of parts) {
      if (node.children.has("/"+part)) {
        node = node.children.get("/"+part)!;
      } else {
        // Check if there's a matching URL parameter
        let paramNode = Array.from(node.params.values())[0];
        if (paramNode) {
          params[paramNode.params.keys().next().value.slice(1)] = part;
          node = paramNode;
        }
      }
    }

    if (node.isEnd && node.handler) {
      return node.handler(req, params, {pathname: req.url});
    }
  }
}

export type URLPatternResultParams = { [key: string]: string | undefined };
type Handler = (
    request: Request,
    params: URLPatternResultParams,
    urlPatternResult: URLPatternResult,
) => Response | Promise<Response>;

class Route {
  constructor(public method: string, public urlPattern: URLPattern, public handler: Handler) {}
}
