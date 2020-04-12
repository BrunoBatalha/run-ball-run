let canvas;
let ctx;
let frames = 0;
let estadoAtual;
let record;
let img;
const CONST = {
    ALTURA: null,
    LARGURA: null,
    MAX_PULO: 3,
    VELOCIDADE: 6,
    ESTADOS: {
        jogar: 0,
        jogando: 1,
        perdeu: 2
    }
};
const chao = {
    altura: 50,
    y: null,
    cor: '#ffdf70',
    desenha: function () {
        ctx.fillStyle = this.cor;
        ctx.fillRect(0, this.y, CONST.LARGURA, this.altura)
    }
};
const bloco = {
    x: 50,
    y: 0,
    altura: spriteBoneco.altura,
    largura: spriteBoneco.largura,
    cor: '#ff4e4e',
    gravidade: 1.5,
    velocidade: 0,
    forcaDoPulo: 25,
    qntPulos: 0,
    score: 0,
    rotacao: 0,
    atualiza: function () {
        this.velocidade += this.gravidade;
        this.y += this.velocidade;

        this.rotacao += Math.PI / 180 * CONST.VELOCIDADE;

        if (this.y > chao.y - this.altura && estadoAtual != CONST.ESTADOS.perdeu) {
            this.y = chao.y - this.altura;
            this.qntPulos = 0;
            this.velocidade = 0;
        }
    },

    pula: function () {
        if (this.qntPulos < 3) {
            this.velocidade = -this.forcaDoPulo;
            this.qntPulos++;
        }
    },

    desenha: function () {
        ctx.save();
        ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
        ctx.rotate(this.rotacao);
        spriteBoneco.desenha(-this.largura / 2, -this.altura / 2);
        ctx.restore();
    },
    reset: function () {
        this.velocidade = 0;
        this.y = 0;
        record = (this.score > record) ? this.score : record;
        sessionStorage.setItem('record', record);
        this.score = 0;
    }
}
const obstaculos = {
    _obs: [],
    cores: ['pink', 'green', 'black', 'orange', 'blue'],
    tempoInsere: 0,
    insere: function () {
        this._obs.push({
            //largura: 30 + Math.floor(21 * Math.random()),
            largura: 50,
            altura: 30 + Math.floor(120 * Math.random()),
            x: CONST.LARGURA,
            cor: this.cores[Math.floor(Math.random() * this.cores.length)]
        });
        this.tempoInsere = (45 + Math.floor(Math.random() * 21));
    },
    atualiza: function () {
        if (this.tempoInsere === 0) this.insere();
        else this.tempoInsere--;

        this._obs.forEach((obstaculo, i) => {
            obstaculo.x -= CONST.VELOCIDADE;
            if (bloco.x < obstaculo.x + obstaculo.largura &&
                bloco.x + bloco.largura >= obstaculo.x &&
                bloco.y + bloco.altura >= chao.y - obstaculo.altura)
                estadoAtual = CONST.ESTADOS.perdeu;
            else if (obstaculo.x == 0)
                bloco.score++;
            else if (obstaculo.x <= -obstaculo.largura) {
                this._obs.splice(i, 1);
            }
        });
    },
    limpa: function () {
        this._obs = [];
    },
    desenha: function () {
        this._obs.forEach(obstaculo => {
            ctx.fillStyle = obstaculo.cor;
            ctx.fillRect(obstaculo.x, (chao.y - obstaculo.altura), obstaculo.largura, obstaculo.altura);
        });
    }
}

function clique(e) {
    if (estadoAtual === CONST.ESTADOS.jogando)
        bloco.pula();
    else if (estadoAtual === CONST.ESTADOS.jogar)
        estadoAtual = CONST.ESTADOS.jogando;
    else if (estadoAtual === CONST.ESTADOS.perdeu) {
        obstaculos.limpa();
        estadoAtual = CONST.ESTADOS.jogar;
        bloco.reset();
    }
}

function main() {
    CONST.ALTURA = window.innerHeight;
    CONST.LARGURA = window.innerWidth;
    if (CONST.LARGURA >= 500) {
        CONST.ALTURA = 600;
        CONST.LARGURA = 600;
    }
    chao.y = CONST.ALTURA - chao.altura;

    canvas = document.createElement('canvas');
    canvas.width = CONST.LARGURA;
    canvas.height = CONST.LARGURA;
    canvas.style.border = '1px solid #000';

    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    document.addEventListener('mousedown', clique);

    estadoAtual = CONST.ESTADOS.jogar;

    record = sessionStorage.getItem('record') || 0;

    img = new Image();
    img.src = 'img/sheet.png'

    roda();
}

function roda() {
    atualiza();
    desenha();

    window.requestAnimationFrame(roda);
}

function atualiza() {
    //    frames++;
    bloco.atualiza();
    if (estadoAtual === CONST.ESTADOS.jogando) obstaculos.atualiza();

}

function desenha() {
    // ctx.fillStyle = '#2d4873'
    // ctx.fillRect(0, 0, CONST.LARGURA, CONST.ALTURA);

    bg.desenha(0, 0);

    ctx.fillStyle = '#000';
    ctx.font = '50px Arial';
    ctx.fillText(bloco.score, 50, 80);

    switch (estadoAtual) {
        case CONST.ESTADOS.jogar: {
            ctx.fillStyle = 'green';
            ctx.fillRect(CONST.LARGURA / 2 - 50, CONST.ALTURA / 2 - 50, 100, 100);
            break;
        }
        case CONST.ESTADOS.perdeu: {
            ctx.fillStyle = 'red';
            ctx.fillRect(CONST.LARGURA / 2 - 50, CONST.ALTURA / 2 - 50, 100, 100);

            ctx.save();
            ctx.translate(CONST.LARGURA / 2, CONST.ALTURA / 2);
            ctx.fillStyle = '#000';

            if (bloco.score > record) ctx.fillText('Novo Record!', -150, -65);
            else if (record < 10) ctx.fillText('Record ' + record, -99, -65);
            else if (record >= 10 && record < 100) ctx.fillText('Record ' + record, -112, -65);
            else ctx.fillText('Record ' + record, -125, -65);

            if (bloco.score < 10)
                ctx.fillText(bloco.score, -13, 19);
            else if (bloco.score >= 10 && bloco.score < 100)
                ctx.fillText(bloco.score, -26, 19);
            else
                ctx.fillText(bloco.score, -39, 19);
            ctx.restore();

            break;
        }
        case CONST.ESTADOS.jogando: {
            obstaculos.desenha();
            break;
        }
        default:
            break;
    }
    chao.desenha();
    bloco.desenha();
}

main();
