import {renderScopedFrame} from '../../lib/render.mjs';
export const prerender = true;
export function GET(){return new Response(renderScopedFrame(import.meta.env.BASE_URL),{headers:{'Content-Type':'text/html; charset=utf-8'}});}
