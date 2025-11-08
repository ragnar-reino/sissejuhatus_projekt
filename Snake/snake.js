(() => {
    const TILE_SIZE = 32;
    const SPRITE_PATH = './Sprites/';

    const SPRITES = {
        border: 'tile_border.png',
        normal: 'tile_background_normal.png',
        grass: 'tile_background_grass.png',
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
        const [border, normal, grass] = await Promise.all([
            loadImage(SPRITE_PATH + SPRITES.border),
            loadImage(SPRITE_PATH + SPRITES.normal),
            loadImage(SPRITE_PATH + SPRITES.grass),
        ]);
        return {border, normal, grass}
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


    window.addEventListener('DOMContentLoaded', async () => {
        const canvas = document.getElementById("snake-canvas");
        
        const cols = parseInt(canvas.dataset.cols || '20', 10);
        const rows = parseInt(canvas.dataset.rows, 10);

        canvas.width = cols * TILE_SIZE
        canvas.height = rows * TILE_SIZE

        const ctx = canvas.getContext('2d');
        const images = await loadSprites();

        const background = generateBackground(cols, rows, 0.1)
        drawGrid(ctx, background, images);

        window.SnakeBoard = {
            TILE_SIZE,
            cols,
            rows,
            images,
            background,
            redraw: () => drawGrid(ctx, background, images)
        };
    });
})();