(() => {
    const TILE_SIZE = 32;
    const SPRITE_PATH = './Sprites/';
    const TICK_MS = 200;

    const SPRITES = {
        border: 'tile_border.png',
        normal: 'tile_background_normal.png',
        grass: 'tile_background_grass.png',
        apple: 'tile_food.png',

        // Snake
        head_left: 'tile_snake_head_left.png',
        head_right: 'tile_snake_head_right.png',
        tail_left: 'tile_snake_tail_left.png',
        tail_right: 'tile_snake_tail_right.png',
        turn_left: 'tile_snake_turn_left.png',
        turn_right: 'tile_snake_turn_right.png',
        body: 'tile_snake_body.png',
    };

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function loadSprites() {
        const [border, normal, grass, apple,
            head_left, head_right,
            tail_left, tail_right,
            turn_left, turn_right,
            body
        ] = await Promise.all([
            loadImage(SPRITE_PATH + SPRITES.border),
            loadImage(SPRITE_PATH + SPRITES.normal),
            loadImage(SPRITE_PATH + SPRITES.grass),
            loadImage(SPRITE_PATH + SPRITES.apple),

            loadImage(SPRITE_PATH + SPRITES.head_left),
            loadImage(SPRITE_PATH + SPRITES.head_right),
            loadImage(SPRITE_PATH + SPRITES.tail_left),
            loadImage(SPRITE_PATH + SPRITES.tail_right),
            loadImage(SPRITE_PATH + SPRITES.turn_left),
            loadImage(SPRITE_PATH + SPRITES.turn_right),
            loadImage(SPRITE_PATH + SPRITES.body),
        ]);
        return {border, normal, grass, apple,
            head_left, head_right,
            tail_left, tail_right,
            turn_left, turn_right,
            body
        };
    }

    function generateBackground(cols, rows, grassChance) {
        const grid = Array.from({length: rows}, () => Array(cols).fill('normal'))

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <cols; c++) {
                if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) { // äärte kontroll
                    grid[r][c] = 'border';
                } else {
                    if (Math.random() < grassChance) grid[r][c] = 'grass' // tasutale hein
                }
            }
        }
        return grid;
    }

    function drawGrid(ctx, tiles, images) {
        const rows = tiles.length;
        const cols = tiles[0].length

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * TILE_SIZE;
                const y = r*TILE_SIZE;
                const kind = tiles[r][c];

                switch (kind) {
                    case 'border':
                        ctx.drawImage(images.border, x, y, TILE_SIZE, TILE_SIZE);
                        break;
                    case 'grass':
                        ctx.drawImage(images.normal, x, y, TILE_SIZE, TILE_SIZE);
                        ctx.drawImage(images.grass, x, y, TILE_SIZE, TILE_SIZE);
                        break;
                    default:
                        ctx.drawImage(images.normal, x, y, TILE_SIZE, TILE_SIZE);
                        break;
                }
            }
        }
    }

    function dir(a, b) { return {dx: b.c - a.c, dy: b.r - a.r}; }

    function segmentSprite(images, prev, cur, next) {
        if (prev && !next) {
            const d = dir (prev, cur);
            if (d.dx === 1 && d.dy === 0) return {img: images.head_right, rot: 0};
            if (d.dx === -1 && d.dy === 0) return {img: images.head_left, rot: 0};
            if (d.dx === 0 && d.dy === -1) return {img: images.head_right, rot: -Math.PI/2}
            if (d.dx === 0 && d.dy === 1) return {img: images.head_left, rot: -Math.PI/2}
        }

        if (!prev && next) {
            const d = dir(cur, next);
            if (d.dx === 1 && d.dy === 0) return {img: images.tail_right, rot: 0};
            if (d.dx === -1 && d.dy === 0) return {img: images.tail_left, rot: 0};
            if (d.dx === 0 && d.dy === -1) return {img: images.tail_right, rot: -Math.PI/2}
            if (d.dx === 0 && d.dy === 1) return {img: images.tail_left, rot: -Math.PI/2}
        }

        if (prev && next) {
            const a = dir(prev, cur);
            const b = dir(cur, next);
            
            if (a.dx === b.dx && a.dy === b.dy) {
                if (a.dx !== 0) return {img: images.body, rot:0};
                else return {img: images.body, rot: Math.PI/2};
            }

            const key = `${a.dx},${a.dy}|${b.dx},${b.dy}`;

            const cornerMap = {
                '-1,0|0,-1': { img: images.turn_left, rot:0},
                '-1,0|0,1': {img: images.turn_right, rot: Math.PI},
                
                '1,0|0,-1': {img: images.turn_right, rot: 0},
                '1,0|0,1': {img: images.turn_left, rot: Math.PI},

                '0,-1|1,0': {img: images.turn_right, rot: -Math.PI},
                '0,-1|-1,0': {img: images.turn_right, rot: -Math.PI/2},

                '0,1|1,0': {img: images.turn_right, rot: Math.PI/2},
                '0,1|-1,0': {img: images.turn_right, rot: 0},
            };

            const m = cornerMap[key];
            if (m) return m;
            return {img: images.body, rot: 0};
        }
        return {img: images.body, rot: 0};
    }

    function drawRotated(ctx, img, x, y, rotRad) {
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE /2;
        ctx.save()
        ctx.translate(cx, cy);
        ctx.rotate(rotRad);
        ctx.drawImage(img, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        ctx.restore();
    }

    function drawSnake(ctx, images, snake) {
        for (let i = 0; i < snake.length; i++) {
            const prev = i > 0 ? snake[i-1] : null;
            const cur = snake[i];
            const next = i < snake.length - 1 ? snake[i + 1] : null;

            const {img, rot} = segmentSprite(images, prev, cur, next);
            const x = cur.c * TILE_SIZE;
            const y = cur.r * TILE_SIZE;
            drawRotated(ctx, img, x, y, rot || 0)
        }
    }

    function getRandomplayableTile(cols, rows) {
        const c = Math.floor(Math.random() * (cols - 2)) + 1;
        const r = Math.floor(Math.random() * (rows - 2)) + 1;
        return { c, r};
    }

    function spawnAppleAvoidingSnake(cols, rows, snake) {
        const occupied = new Set(snake.map(p => `${p.c}, ${p.r}`));
        let pos;
        do {
            pos = getRandomplayableTile(cols, rows);
        } while (occupied.has(`${pos.c},${pos.r}`));
        return pos;
    }

    function drawApple(ctx, images, pos) {
        ctx.drawImage(
            images.apple,
            pos.c * TILE_SIZE,
            pos.r * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        );
    }

    function isOpposite(a, b) {
        return a && b && a.dx === -b.dx&& a.dy === -b.dy;
    }

    const keyToDir = {
        ArrowUp: {dx:0, dy:-1}, KeyW: {dx:0, dy:-1},
        ArrowDown: {dx:0, dy:1}, KeyS: {dx:0, dy: 1},
        ArrowLeft: {dx:-1, dy:0}, KeyA: {dx:-1, dy: 0},
        ArrowRight: {dx:1, dy:0}, KeyD: {dx:1, dy: 0},
    };

    function hitsSelf(nextHead, snake) {
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].c === nextHead.c && snake[i].r === nextHead.r) return true;
        }
        return false;
    }

    window.addEventListener('DOMContentLoaded', async () => {
        const canvas = document.getElementById("snake-canvas");
        //const button = document.getElementById("respawn-apple");
        
        const cols = parseInt(canvas.dataset.cols, 10);
        const rows = parseInt(canvas.dataset.rows, 10);

        canvas.width = cols * TILE_SIZE
        canvas.height = rows * TILE_SIZE

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const images = await loadSprites();
        const background = generateBackground(cols, rows, 0.1);
        
        const midR = Math.floor(rows / 2);
        const midC = Math.floor(cols / 2);
        const snake = [
            {c: midC-2, r: midR}, //saba
            {c: midC-1, r: midR}, //keha
            {c: midC, r:midR}, //pea
        ];

        let dir = {dx: 1, dy: 0};
        let queuedDir = dir;
        let timer = null;
        let gameOver = false;

        let applePos = getRandomplayableTile(cols, rows, snake);

        window.addEventListener('keydown', (e) => {
            const cand = keyToDir[e.code];
            if (!cand) return;
            if (!isOpposite(cand, dir)) queuedDir = cand;
        })

        function isBorderCell(pos) {
            return (
                pos.c <= 0 || pos.c >= cols - 1 ||
                pos.r <= 0 || pos.r >= rows -1
            );
        }

        function step() {
            if (gameOver) return;

            if (!isOpposite(queuedDir, dir)) dir = queuedDir;
            const head = snake[snake.length-1];
            const newHead = {c: head.c + dir.dx, r: head.r + dir.dy};

            // äär?
            if (isBorderCell(newHead)) {
                gameOver = true;
                clearInterval(timer);
                redrawAll();
                return;
            }

            if (hitsSelf(newHead, snake)) {
                gameOver = true
                clearInterval(timer)
                redrawAll();
                return;
            }


            snake.push(newHead);

            if (newHead.c === applePos.c && newHead.r === applePos.r) {
                applePos = spawnAppleAvoidingSnake(cols, rows, snake);
            } else {
                snake.shift();
            }

            redrawAll();
        }

        function redrawAll () {
            drawGrid(ctx, background, images);
            drawSnake(ctx, images, snake);
            drawApple(ctx, images, applePos);
        }

        redrawAll();

        timer = setInterval(step, TICK_MS);

        window.SnakeBoard = {
            TILE_SIZE,
            cols,
            rows,
            images,
            background,
            applePos,
            redrawAll,
            snake,
            get dir(){return dir;},
            setSpeed(ms){
                clearInterval(timer);
                timer = setInterval(step, ms);
            },
            stop(){
                clearInterval(timer);
            },
            step,
        };
    });
})();