import { existsSync, readFileSync, writeFileSync } from "node:fs";

const source = "node_modules/@phosphor-icons/core/assets";
const crafted = "scripts/icons";

const map = {

    home: "house",
    search: "magnifying-glass",
    sections: "squares-four",
    orders: "suitcase-simple",
    account: "user",
    tabHome: "house",
    tabChat: "chat-circle-dots",
    tabOrders: "suitcase-simple",
    tabAccount: "user-circle",
    tabFavorites: "heart",

    back: "caret-left",
    forward: "caret-right",
    arrowBack: "arrow-left",
    arrowForward: "arrow-right",
    down: "caret-down",
    close: "x",
    menu: "dots-three",
    more: "dots-three-vertical",
    plus: "plus",
    minus: "minus",

    mail: "envelope-simple",
    lock: "lock",
    user: "user",
    phone: "phone",
    eye: "eye",
    eyeOff: "eye-slash",
    key: "key",
    shield: "shield-check",
    verified: "seal-check",

    check: "check",
    checkCircle: "check-circle",
    xCircle: "x-circle",
    prohibit: "prohibit",
    hand: "hand-palm",
    alert: "warning-circle",
    info: "info",
    warning: "warning",

    support: "headset",
    bell: "bell",
    bellSlash: "bell-slash",
    chat: "chat-circle",
    messages: "chats-circle",
    profile: "user-circle",
    heart: "heart",
    heartSolid: "heart",
    star: "star",
    ratingStar: "star",
    ratingStarHalf: "star-half",
    ratingStarEmpty: "star",
    archive: "archive",
    archiveBox: "package",
    pin: "push-pin",
    muted: "speaker-slash",
    smile: "smiley",
    attachment: "paperclip",
    microphone: "microphone",
    play: "play",
    pause: "pause",
    download: "download-simple",
    file: "file",
    video: "video-camera",
    reply: "arrow-bend-up-left",
    send: "paper-plane-tilt",
    circle: "circle",

    globe: "globe",
    language: "translate",
    wallet: "wallet",
    card: "credit-card",
    cart: "shopping-cart",
    cartFull: "shopping-cart",
    gift: "gift",
    coupon: "seal-percent",
    ticket: "ticket",
    settings: "gear-six",
    logout: "sign-out",
    trash: "trash",
    copy: "copy",
    edit: "pencil-simple",
    share: "share-network",
    refresh: "arrows-clockwise",
    filter: "sliders-horizontal",
    sort: "arrows-down-up",
    calendar: "calendar-dots",
    location: "map-pin",
    moon: "moon",
    sun: "sun",
    device: "device-mobile",
    android: "android-logo",
    apple: "apple-logo",
    windows: "windows-logo",
    linux: "linux-logo",
    chrome: "google-chrome-logo",
    browser: "browser",
    desktop: "desktop",
    help: "question",
    history: "clock-counter-clockwise",

    visa: "stamp",
    passport: "identification-card",
    travel: "airplane-tilt",
    mosque: "mosque",
    tree: "tree",
    firstAid: "first-aid",
    graduation: "graduation-cap",
    museum: "bank",
    landmark: "castle-turret",
    beach: "umbrella-simple",
    stay: "building-apartment",
    tour: "binoculars",
    map: "map-trifold",
    product: "shopping-bag",
    service: "wrench",
    event: "calendar-star",
    bus: "bus",
    train: "train",
    ship: "boat",
    car: "car",
    building: "buildings",
    award: "medal",
    compass: "compass",
    locate: "crosshair",
    luggage: "suitcase-rolling",
    doc: "file-text",
    docCheck: "seal-check",

    wifi: "wifi-high",
    parking: "letter-circle-p",
    breakfast: "fork-knife",
    pool: "swimming-pool",
    bed: "bed",
    bath: "shower",
    clock: "clock",
    users: "users",
    smoking: "cigarette",
    pets: "paw-print",
    party: "confetti",
    baby: "baby",
    smokeDetector: "siren",
    camera: "camera",
    image: "image",
    tv: "television-simple",
    gym: "barbell",
    ac: "snowflake",
    door: "door-open",

    level: "trophy",
    rank: "medal",
    points: "sparkle",
    reward: "hand-coins",
    percent: "percent",
    deposit: "arrow-down-left",
    withdraw: "arrow-up-right",
    transfer: "arrows-left-right",
    receipt: "receipt",
    invite: "user-plus",
    link: "link",
    qr: "qr-code",
    bolt: "lightning",
    gem: "diamond",

};

const mirrored = [ "reply", "send", "logout", "deposit", "withdraw", "transfer", "cart", "cartFull" ];

const filled = [ "heartSolid", "cartFull", "ratingStar", "ratingStarHalf", "play", "pause" ];

const solids = [ "tabHome", "tabChat", "tabOrders", "tabFavorites", "tabAccount", "heart", "star", "bell", "bellSlash", "prohibit", "chat", "archiveBox", "warning", "device", "android", "apple", "windows", "linux", "chrome", "browser", "desktop", "pin" ];

const round = value => Math.round( value * 1000 ) / 1000;

const attrs = tag => Object.fromEntries(
    [ ...tag.matchAll( /([a-zA-Z][\w-]*)="([^"]*)"/g ) ].map( ( [ , key, value ] ) => [ key, value ] ),
);

const arcs = ( cx, cy, rx, ry ) =>
    `M${ round( cx - rx ) } ${ round( cy ) }a${ round( rx ) } ${ round( ry ) } 0 1 0 ${ round( rx * 2 ) } 0a${ round( rx ) } ${ round( ry ) } 0 1 0 ${ round( -rx * 2 ) } 0`;

const box = ( x, y, w, h, r ) => r > 0
    ? `M${ round( x + r ) } ${ round( y ) }h${ round( w - r * 2 ) }a${ r } ${ r } 0 0 1 ${ r } ${ r }v${ round( h - r * 2 ) }a${ r } ${ r } 0 0 1 ${ -r } ${ r }h${ round( -( w - r * 2 ) ) }a${ r } ${ r } 0 0 1 ${ -r } ${ -r }v${ round( -( h - r * 2 ) ) }a${ r } ${ r } 0 0 1 ${ r } ${ -r }z`
    : `M${ round( x ) } ${ round( y ) }h${ round( w ) }v${ round( h ) }h${ round( -w ) }z`;

const chain = ( points, close ) => {

    const pairs = points.trim().split( /[\s,]+/ ).map( Number );
    const steps = [];

    for ( let index = 0; index < pairs.length; index += 2 ) steps.push( `${ round( pairs[index] ) } ${ round( pairs[index + 1] ) }` );

    return `M${ steps.join( "L" ) }${ close ? "z" : "" }`;

};

const fileOf = ( name, weight ) => {

    const own = `${ crafted }/${ name }${ weight === "fill" ? "-fill" : "" }.svg`;

    return existsSync( own ) ? own : `${ source }/${ weight }/${ name }${ weight === "fill" ? "-fill" : "" }.svg`;

};

const paths = ( name, weight ) => {

    const svg = readFileSync( fileOf( name, weight ), "utf8" );
    const out = [];

    for ( const [ , tag, body ] of svg.matchAll( /<(path|circle|rect|line|ellipse|polyline|polygon)\s([^>]*?)\/?>/g ) ) {

        const a = attrs( body );

        if ( a.fill === "none" ) continue;

        if ( tag === "path" ) out.push( a.d );
        if ( tag === "circle" ) out.push( arcs( +a.cx, +a.cy, +a.r, +a.r ) );
        if ( tag === "ellipse" ) out.push( arcs( +a.cx, +a.cy, +a.rx, +a.ry ) );
        if ( tag === "rect" ) out.push( box( +( a.x ?? 0 ), +( a.y ?? 0 ), +a.width, +a.height, +( a.rx ?? a.ry ?? 0 ) ) );
        if ( tag === "line" ) out.push( `M${ round( +a.x1 ) } ${ round( +a.y1 ) }L${ round( +a.x2 ) } ${ round( +a.y2 ) }` );
        if ( tag === "polyline" ) out.push( chain( a.points, false ) );
        if ( tag === "polygon" ) out.push( chain( a.points, true ) );

    }

    if ( !out.length ) throw new Error( `no geometry in ${ name } (${ weight })` );

    return out;

};

const weightOf = key => filled.includes( key ) ? "fill" : "regular";

const local = ( file, weight ) => `${ file.replace( /-([a-z0-9])/g, ( _, char ) => char.toUpperCase() ) }${ weight === "fill" ? "Fill" : "" }Icon`;

const shapes = new Map();

const shape = ( file, weight ) => {

    const id = local( file, weight );

    if ( !shapes.has( id ) ) shapes.set( id, paths( file, weight ) );

    return id;

};

const entries = Object.entries( map ).map( ( [ key, file ] ) => `    ${ key }: ${ shape( file, weightOf( key ) ) },` );

const solidEntries = solids.map( key => `    ${ key }: ${ shape( map[key], "fill" ) },` );

const list = names => names.map( name => `"${ name }"` ).join( ", " );

const generated = `${ [ ...shapes ].sort( ( [ a ], [ b ] ) => a.localeCompare( b ) ).map( ( [ id, found ] ) => `const ${ id } = [ ${ found.map( d => `"${ d }"` ).join( ", " ) } ] as const;` ).join( "\n" ) }

export const iconPaths = {

${ entries.join( "\n" ) }

} as const;

export type IconName = keyof typeof iconPaths;

export const solidPaths: Partial<Record<IconName, readonly string[]>> = {

${ solidEntries.join( "\n" ) }

};

export const mirroredIcons: ReadonlySet<IconName> = new Set([ ${ list( mirrored ) } ]);

export const filledIcons: ReadonlySet<IconName> = new Set([ ${ list( filled ) } ]);
`;

writeFileSync( "src/elements/icon/paths.ts", generated );

console.warn( `paths.ts: ${ Object.keys( map ).length } names, ${ shapes.size } shapes` );
