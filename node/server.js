import http from 'node:http';
import mysql from 'mysql2/promise';

const port = Number(process.env.PORT || 8080);
const pool = mysql.createPool({ uri: process.env.DATABASE_URL, connectionLimit: 5, waitForConnections: true });

const schema = `CREATE TABLE IF NOT EXISTS stock (
    sku        VARCHAR(64) NOT NULL PRIMARY KEY,
    qty        INT         NOT NULL,
    updated_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

class Invalid extends Error {}

async function migrate () {

    for (let attempt = 1; ; attempt++) {

        try {

            await pool.query(schema);
            return;

        } catch (error) {

            if (attempt === 30) throw error;

            console.warn(`database not ready (${attempt}): ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, 2000));

        }

    }

}

async function json (req) {

    let raw = '';

    for await (const chunk of req) {

        raw += chunk;
        if (raw.length > 65536) throw new Invalid('body too large');

    }

    try { return JSON.parse(raw || '{}'); } catch { throw new Invalid('invalid json'); }

}

const routes = {

    'GET /health': async () => [200, { status: 'ok' }],

    'GET /mesh': async () => [200, { service: 'node', runtime: 'node', calls: {} }],

    'GET /stock': async () => {

        const [rows] = await pool.query('SELECT sku, qty, updated_at FROM stock ORDER BY sku LIMIT 100');

        return [200, { stock: rows, count: rows.length }];

    },

    'POST /stock': async (req) => {

        const { sku, qty } = await json(req);

        if (typeof sku !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(sku) || !Number.isInteger(qty) || qty < 0) {

            return [422, { error: 'sku (1-64 of A-Z a-z 0-9 _ -) and qty (integer >= 0) are required' }];

        }

        await pool.execute('INSERT INTO stock (sku, qty) VALUES (?, ?) AS new ON DUPLICATE KEY UPDATE qty = new.qty', [sku, qty]);

        return [201, { sku, qty }];

    },

    'GET /stock/:sku': async (_req, sku) => {

        const [rows] = await pool.execute('SELECT sku, qty, updated_at FROM stock WHERE sku = ?', [sku]);

        return rows.length ? [200, rows[0]] : [404, { error: 'no such sku' }];

    },

};

async function handle (req) {

    const { pathname } = new URL(req.url, 'http://node');
    const [, resource = '', param, extra] = pathname.split('/');
    const route = extra === undefined ? routes[`${req.method} /${resource}${param ? '/:sku' : ''}`] : undefined;

    if (!route) return [404, { error: 'not found' }];

    return route(req, param ? decodeURIComponent(param) : '');

}

const server = http.createServer(async (req, res) => {

    let status = 500;
    let body = { error: 'internal error' };

    try {

        [status, body] = await handle(req);

    } catch (error) {

        if (error instanceof Invalid) [status, body] = [400, { error: error.message }];
        else console.error(error);

    }

    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));

});

await migrate();

server.listen(port, () => console.log(`node listening on :${port}`));

for (const signal of ['SIGTERM', 'SIGINT']) {

    process.on(signal, () => server.close(() => pool.end().finally(() => process.exit(0))));

}
