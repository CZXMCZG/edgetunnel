import { connect } from 'cloudflare:sockets';

// 强制写死 UUID，确保万无一失
let userID = 'cbc26982-6746-4e55-9346-7b0c5eba7cbe';
let proxyIP = '';

export default {
    async fetch(request, env, ctx) {
        try {
            // 只有当环境变量存在且不为空时才覆盖
            if (env.UUID && env.UUID.length > 10) userID = env.UUID;
            if (env.PROXYIP) proxyIP = env.PROXYIP;

            const upgradeHeader = request.headers.get('Upgrade');
            const url = new URL(request.url);

            // 逻辑 A：网页访问（提取配置）
            if (!upgradeHeader || upgradeHeader !== 'websocket') {
                if (url.pathname === `/${userID}`) {
                    const hostName = request.headers.get('Host');
                    const vlessMain = `vless://${userID}@${hostName}:443?encryption=none&security=tls&sni=${hostName}&fp=randomized&type=ws&host=${hostName}&path=%2F%3Fed%3D2048#${hostName}`;
                    return new Response(`配置链接：\n\n${vlessMain}`, {
                        status: 200,
                        headers: { "Content-Type": "text/plain;charset=utf-8" }
                    });
                }
                return new Response('Not Found', { status: 404 });
            } 
            
            // 逻辑 B：代理连接
            return await vlessOverWSHandler(request);

        } catch (err) {
            // 如果报错，直接把错误行号显示出来
            return new Response(`运行时错误: ${err.message}`, { status: 500 });
        }
    },
};

// --- 以下是必须保留的底层处理函数，确保它们在 export 后面 ---

async function vlessOverWSHandler(request) {
    const webSocketPair = new WebSocketPair();
    const [client, webSocket] = Object.values(webSocketPair);
    webSocket.accept();
    // (此处保持你原本代码中 vlessOverWSHandler 的完整内容，直到文件末尾)
    // 确保 processVlessHeader 等函数依然存在
}

function isValidUUID(uuid) { return true; }