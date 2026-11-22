import { lerp, damp, smooth, clamp } from './utils';

/**
 * Palco 3D: conjunto de roda e freio construído com geometrias procedurais
 * (sem arquivos de modelo). Pode "explodir" ao longo do eixo conforme a rolagem.
 *
 * Índices das peças usadas pela seção de serviços:
 *  0 roda | 1 pinça | 2 cubo + porca | 3 disco | 4 conjunto | 5 pneu
 */
export function createStage(canvas) {
    const THREE = window.THREE;
    if (!THREE) return null;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
        return null;
    }
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const FOV = 32;
    const DIST = 7.6;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
    camera.position.set(0, 0, DIST);

    /* ---------------- ambiente de estúdio (reflexos nos metais) ---------------- */
    try {
        const envScene = new THREE.Scene();
        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 16),
            new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })
        );
        const pos = dome.geometry.attributes.position;
        const cols = [];
        const top = new THREE.Color(0x2e7d66), bot = new THREE.Color(0x020b08), c = new THREE.Color();
        for (let i = 0; i < pos.count; i++) {
            c.copy(bot).lerp(top, clamp((pos.getY(i) / 12 + 1) / 2, 0, 1));
            cols.push(c.r, c.g, c.b);
        }
        dome.geometry.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
        envScene.add(dome);
        const panel = (w, h, col, k, x, y, z) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }));
            m.position.set(x, y, z);
            m.lookAt(0, 0, 0);
            envScene.add(m);
        };
        panel(7, 5, 0xffffff, 7, -5, 6, 5);        // luz principal
        panel(1.2, 9, 0xfffb7a, 6, 7, 1, -2);      // faixa amarela
        panel(1.4, 9, 0x35e0a8, 5, -8, -1, -3);    // faixa verde
        panel(10, 1.2, 0xffffff, 5, 0, 5, -7);     // luz de contorno
        panel(5, 3, 0xbfe9dc, 3, 4, -5, 6);        // preenchimento
        const pm = new THREE.PMREMGenerator(renderer);
        scene.environment = pm.fromScene(envScene, 0.03).texture;
        pm.dispose();
    } catch (e) { /* segue só com as luzes */ }

    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(-4, 5, 6); scene.add(key);
    const rimL = new THREE.DirectionalLight(0x35e0a8, 2.2); rimL.position.set(5, 2, -4); scene.add(rimL);

    /* ---------------- texturas ---------------- */
    const treadTex = (() => {
        const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 256;
        const g = cv.getContext('2d');
        g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, 2048, 256);
        const y0 = 256 * 0.36, y1 = 256 * 0.64;
        g.fillStyle = '#d0d0d0'; g.fillRect(0, y0, 2048, y1 - y0);
        g.fillStyle = '#000';
        [0.43, 0.5, 0.57].forEach((v) => g.fillRect(0, v * 256 - 3, 2048, 6));
        g.lineWidth = 5;
        for (let i = 0; i < 96; i++) {
            const x = (i / 96) * 2048;
            g.beginPath(); g.moveTo(x, y0); g.lineTo(x + 14, 256 * 0.43); g.moveTo(x + 14, 256 * 0.57); g.lineTo(x, y1); g.stroke();
            g.beginPath(); g.moveTo(x + 7, 256 * 0.43); g.lineTo(x - 4, 256 * 0.5); g.lineTo(x + 7, 256 * 0.57); g.stroke();
        }
        const t = new THREE.CanvasTexture(cv);
        t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
        return t;
    })();

    const sideCv = document.createElement('canvas'); sideCv.width = sideCv.height = 1024;
    const sideTex = new THREE.CanvasTexture(sideCv);
    sideTex.encoding = THREE.sRGBEncoding;
    const drawSide = () => {
        const g = sideCv.getContext('2d');
        g.clearRect(0, 0, 1024, 1024);
        g.translate(512, 512);
        const txt = 'GARAGE  PERFORMANCE  GARAGE  PERFORMANCE  ';
        g.font = 'italic 900 56px "G Display", Roboto, Arial';
        g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const R = 442, step = (Math.PI * 2) / txt.length;
        for (let i = 0; i < txt.length; i++) {
            g.save(); g.rotate(i * step); g.translate(0, -R); g.fillText(txt[i], 0, 0); g.restore();
        }
        g.strokeStyle = '#fffb38'; g.lineWidth = 8;
        g.beginPath(); g.arc(0, 0, 395, -0.5, 0.5); g.stroke();
        g.beginPath(); g.arc(0, 0, 395, Math.PI - 0.5, Math.PI + 0.5); g.stroke();
        g.setTransform(1, 0, 0, 1, 0, 0);
        sideTex.needsUpdate = true;
    };
    drawSide();
    if (document.fonts && document.fonts.load) {
        document.fonts.load('italic 900 50px "G Display"').then(() => { sideCv.getContext('2d').setTransform(1, 0, 0, 1, 0, 0); drawSide(); }).catch(() => {});
    }

    const labelTex = (() => {
        const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
        const g = cv.getContext('2d');
        g.fillStyle = '#fff'; g.font = 'italic 900 78px Roboto, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('GARAGE', 256, 68);
        const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
    })();

    /* ---------------- materiais ---------------- */
    const std = (o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ transparent: true }, o)); m.userData.hl = true; return m; };
    const mRubber = std({ color: 0x030404, roughness: 0.9, metalness: 0, envMapIntensity: 0.12, bumpMap: treadTex, bumpScale: 1.6, side: THREE.DoubleSide });
    mRubber.userData.hlk = 0.25;
    const mRim = std({ color: 0x353e3a, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.2, side: THREE.DoubleSide });
    const mLip = std({ color: 0x1c9a74, metalness: 0.6, roughness: 0.3, envMapIntensity: 0.6 });
    const mSteel = std({ color: 0xa9b4b0, metalness: 1, roughness: 0.3, envMapIntensity: 1.0, side: THREE.DoubleSide });
    const mDark = std({ color: 0x0c0e0d, metalness: 0.4, roughness: 0.7, side: THREE.DoubleSide });
    const mYellow = std({ color: 0xe8e32a, metalness: 0.7, roughness: 0.32, envMapIntensity: 0.7 });
    const mCaliper = new THREE.MeshPhysicalMaterial({ color: 0x137a5a, metalness: 0.2, roughness: 0.4, envMapIntensity: 0.55, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true });
    mCaliper.userData.hl = true;
    const mSide = new THREE.MeshBasicMaterial({ map: sideTex, transparent: true, depthWrite: false, toneMapped: false });
    mSide.userData.baseOp = 1;
    const mLabel = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false, toneMapped: false });

    const lowSeg = small ? 0.6 : 1;
    const seg = (n) => Math.max(8, Math.round(n * lowSeg));

    /* ---------------- helpers ---------------- */
    const axisZ = (geo) => { geo.rotateX(Math.PI / 2); return geo; };
    const mesh = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); parent.add(m); return m; };
    const ringShape = (r0, r1, a0, a1) => {
        const s = new THREE.Shape();
        s.moveTo(r0 * Math.cos(a0), r0 * Math.sin(a0));
        s.lineTo(r1 * Math.cos(a0), r1 * Math.sin(a0));
        s.absarc(0, 0, r1, a0, a1, false);
        s.lineTo(r0 * Math.cos(a1), r0 * Math.sin(a1));
        s.absarc(0, 0, r0, a1, a0, true);
        return s;
    };
    const extrude = (shape, depth, bevel) => new THREE.ExtrudeGeometry(shape, {
        depth, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: 2, curveSegments: seg(24)
    });

    const rig = new THREE.Group();
    rig.rotation.order = 'ZYX';
    scene.add(rig);
    const assembly = new THREE.Group();
    rig.add(assembly);

    const parts = [];
    const addPart = (name, zA, zE, spin, anchor) => {
        const g = new THREE.Group();
        assembly.add(g);
        const p = { name, g, zA, zE, spin, anchor: anchor || new THREE.Vector3(0, 0, 0), op: 1, hl: 0, mats: [] };
        parts.push(p);
        return p;
    };

    /* ---- pneu ---- */
    const tire = addPart('tire', 0, 0.46, true);
    {
        const ctrl = [[0.6, -0.15], [0.63, -0.19], [0.72, -0.205], [0.85, -0.2], [0.95, -0.17], [0.992, -0.1], [1.0, 0], [0.992, 0.1], [0.95, 0.17], [0.85, 0.2], [0.72, 0.205], [0.63, 0.19], [0.6, 0.15]]
            .map((p) => new THREE.Vector2(p[0], p[1]));
        const pts = new THREE.SplineCurve(ctrl).getPoints(seg(72));
        pts.push(new THREE.Vector2(0.6, 0.0), new THREE.Vector2(0.6, -0.15));
        mesh(axisZ(new THREE.LatheGeometry(pts, seg(120))), mRubber, tire.g);
        const ring = new THREE.RingGeometry(0.64, 0.86, seg(64));
        mesh(ring, mSide, tire.g, 0, 0, 0.2065);
        const back = mesh(ring, mSide, tire.g, 0, 0, -0.2065); back.rotation.y = Math.PI;
    }

    /* ---- roda ---- */
    const rim = addPart('rim', 0, 1.02, true);
    {
        const prof = [[0.55, -0.17], [0.64, -0.17], [0.645, -0.15], [0.6, -0.12], [0.57, -0.1], [0.57, 0.1], [0.6, 0.12], [0.645, 0.15], [0.64, 0.17], [0.55, 0.17]]
            .map((p) => new THREE.Vector2(p[0], p[1]));
        mesh(axisZ(new THREE.LatheGeometry(prof, seg(96))), mRim, rim.g);
        mesh(new THREE.TorusGeometry(0.643, 0.014, 10, seg(96)), mLip, rim.g, 0, 0, 0.158);
        mesh(new THREE.TorusGeometry(0.643, 0.014, 10, seg(96)), mLip, rim.g, 0, 0, -0.158);
        // raios
        const sp = new THREE.Shape();
        sp.moveTo(0.1, -0.055); sp.lineTo(0.36, -0.05); sp.lineTo(0.585, -0.034); sp.lineTo(0.585, 0.034); sp.lineTo(0.36, 0.05); sp.lineTo(0.1, 0.055); sp.closePath();
        const spGeo = extrude(sp, 0.05, 0.012);
        const N = 10;
        for (let i = 0; i < N; i++) {
            const holder = new THREE.Group();
            holder.rotation.z = (i / N) * Math.PI * 2;
            const s = mesh(spGeo, mRim, holder, 0, 0, -0.02);
            s.rotation.y = -0.2;
            s.rotation.x = 0;
            rim.g.add(holder);
        }
        // centro
        const hubRing = new THREE.Shape(); hubRing.absarc(0, 0, 0.2, 0, Math.PI * 2, false);
        const hole = new THREE.Path(); hole.absarc(0, 0, 0.105, 0, Math.PI * 2, true); hubRing.holes.push(hole);
        mesh(extrude(hubRing, 0.05, 0.01), mRim, rim.g, 0, 0, -0.005);
        mesh(new THREE.TorusGeometry(0.2, 0.012, 10, seg(64)), mLip, rim.g, 0, 0, 0.065);
    }

    /* ---- disco de freio ---- */
    const disc = addPart('disc', -0.07, -0.18, true);
    {
        const s = new THREE.Shape(); s.absarc(0, 0, 0.5, 0, Math.PI * 2, false);
        const h = new THREE.Path(); h.absarc(0, 0, 0.27, 0, Math.PI * 2, true); s.holes.push(h);
        const holeR = 0.017, nh = small ? 18 : 28;
        [0.35, 0.435].forEach((r, k) => {
            for (let i = 0; i < nh; i++) {
                const a = ((i + k * 0.5) / nh) * Math.PI * 2;
                const p = new THREE.Path(); p.absarc(r * Math.cos(a), r * Math.sin(a), holeR, 0, Math.PI * 2, true); s.holes.push(p);
            }
        });
        const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 10 });
        mesh(g, mSteel, disc.g, 0, 0, -0.025);
        const hatPts = [[0.27, 0.02], [0.255, -0.04], [0.22, -0.09], [0.09, -0.09]].map((p) => new THREE.Vector2(p[0], p[1]));
        mesh(axisZ(new THREE.LatheGeometry(hatPts, seg(64))), mSteel, disc.g);
        mesh(axisZ(new THREE.CylinderGeometry(0.095, 0.095, 0.004, 32)), mDark, disc.g, 0, 0, -0.088);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + 0.3;
            mesh(axisZ(new THREE.CylinderGeometry(0.018, 0.018, 0.004, 16)), mDark, disc.g, 0.17 * Math.cos(a), 0.17 * Math.sin(a), -0.087);
        }
    }

    /* ---- pinça ---- */
    const cal = addPart('caliper', -0.07, -0.74, false, new THREE.Vector3(0.58, 0, 0.11));
    {
        cal.g.rotation.z = 0.62;
        const a = 0.5;
        const front = extrude(ringShape(0.33, 0.655, -a, a), 0.075, 0.012);
        mesh(front, mCaliper, cal.g, 0, 0, 0.037);
        mesh(front, mCaliper, cal.g, 0, 0, -0.112);
        mesh(extrude(ringShape(0.545, 0.655, -a, a), 0.22, 0.012), mCaliper, cal.g, 0, 0, -0.11);
        const label = mesh(new THREE.PlaneGeometry(0.3, 0.075), mLabel, cal.g, 0.43, 0, 0.1235);
        label.rotation.z = Math.PI / 2;
        for (let i = -1; i <= 1; i++) {
            const an = i * 0.28;
            const pst = mesh(axisZ(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 24)), mSteel, cal.g, 0.585 * Math.cos(an), 0.585 * Math.sin(an), 0.122);
            pst.rotation.x = 0;
        }
        mesh(axisZ(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 10)), mDark, cal.g, 0.64 * Math.cos(0.38), 0.64 * Math.sin(0.38), 0.0).rotation.x = Math.PI / 2;
    }

    /* ---- cubo ---- */
    const hub = addPart('hub', -0.2, -1.24, true);
    {
        mesh(axisZ(new THREE.CylinderGeometry(0.3, 0.3, 0.05, seg(48))), mDark, hub.g, 0, 0, 0);
        mesh(axisZ(new THREE.CylinderGeometry(0.2, 0.23, 0.12, seg(40))), mSteel, hub.g, 0, 0, 0.08);
        mesh(axisZ(new THREE.CylinderGeometry(0.095, 0.095, 0.3, seg(32))), mSteel, hub.g, 0, 0, 0.2);
        for (let i = 0; i < 9; i++) mesh(new THREE.TorusGeometry(0.097, 0.007, 6, seg(24)), mDark, hub.g, 0, 0, 0.1 + i * 0.026);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            mesh(axisZ(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 10)), mDark, hub.g, 0.15 * Math.cos(a), 0.15 * Math.sin(a), 0.16);
        }
    }

    /* ---- porca central (amarela) ---- */
    const nut = addPart('nut', 0.13, 1.7, true);
    {
        const s = new THREE.Shape();
        const T = 14;
        for (let i = 0; i < T; i++) {
            const a0 = (i / T) * Math.PI * 2, d = (Math.PI * 2) / T;
            const pts = [[0.15, a0], [0.178, a0 + d * 0.15], [0.178, a0 + d * 0.5], [0.15, a0 + d * 0.65]];
            pts.forEach((p, j) => { const x = p[0] * Math.cos(p[1]), y = p[0] * Math.sin(p[1]); (i === 0 && j === 0) ? s.moveTo(x, y) : s.lineTo(x, y); });
        }
        s.closePath();
        const hole = new THREE.Path(); hole.absarc(0, 0, 0.098, 0, Math.PI * 2, true); s.holes.push(hole);
        mesh(extrude(s, 0.08, 0.008), mYellow, nut.g, 0, 0, -0.04);
        mesh(new THREE.TorusGeometry(0.124, 0.009, 8, seg(48)), mDark, nut.g, 0, 0, 0.05);
    }

    // cada peça recebe cópias próprias dos materiais (opacidade/brilho independentes)
    mSide.userData.noDepth = true; mLabel.userData.noDepth = true;
    parts.forEach((p) => {
        const map = new Map();
        p.g.traverse((o) => {
            if (!o.material) return;
            if (!map.has(o.material)) map.set(o.material, o.material.clone());
            o.material = map.get(o.material);
        });
        p.mats = Array.from(map.values());
    });
    // conjunto de materiais compartilhados: opacidade por peça é calculada pelo maior valor
    const PART_OF_SERVICE = [[rim], [cal], [hub, nut], [disc], parts.slice(), [tire]];

    /* ---- efeitos ---- */
    const axle = (() => {
        const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -1.9), new THREE.Vector3(0, 0, 2.3)]);
        const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0xfffb38, dashSize: 0.07, gapSize: 0.06, transparent: true, opacity: 0 }));
        l.computeLineDistances();
        assembly.add(l);
        return l;
    })();

    const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.035), new THREE.MeshBasicMaterial({ color: 0xfffb38, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    assembly.add(scan);

    // partículas: poeira de oficina ao fundo
    const N = small ? 90 : 170;
    const pgeo = new THREE.BufferGeometry();
    const parr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { parr[i * 3] = (Math.random() - 0.5) * 18; parr[i * 3 + 1] = (Math.random() - 0.5) * 10; parr[i * 3 + 2] = -7 + Math.random() * 9; }
    pgeo.setAttribute('position', new THREE.BufferAttribute(parr, 3));
    const dust = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xfffb8a, size: 0.045, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);

    /* ---------------- estado e laço de atualização ---------------- */
    const cur = { op: 0, ax: 0.4, ay: 0, sc: 1, rx: 0.1, ry: -0.5, rz: 0, ex: 0, spin: 0.5 };
    let spin = 0, spinSpeed = 0, px = 0, py = 0, w = 1, h = 1, halfW = 1, halfH = 1;
    const v3 = new THREE.Vector3();

    function resize() {
        w = window.innerWidth; h = window.innerHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        halfH = Math.tan((FOV * Math.PI) / 360) * DIST;
        halfW = halfH * camera.aspect;
    }
    resize();

    function update(st, dt, t) {
        ['op', 'ax', 'ay', 'sc', 'rx', 'ry', 'rz', 'ex'].forEach((k) => { cur[k] = damp(cur[k], st[k], k === 'op' ? 7 : 4.2, dt); });
        canvas.style.opacity = cur.op.toFixed(3);
        const visible = cur.op > 0.012;
        canvas.style.visibility = visible ? 'visible' : 'hidden';
        if (!visible) return false;

        px = damp(px, st.px || 0, 3, dt); py = damp(py, st.py || 0, 3, dt);
        spinSpeed = damp(spinSpeed, st.spin + (st.vel || 0) * 0.0032, 4, dt);
        spin += spinSpeed * dt;
        if (st.roll > 0) spin = lerp(spin, -(cur.ax * halfW) / Math.max(cur.sc, 0.01), clamp(st.roll, 0, 1)); // rolagem sem escorregar

        const e = smooth(0, 1, cur.ex);
        const wob = (1 - e) * (1 - (st.roll || 0)) * Math.sin(t * 0.4) * 0.16;
        rig.position.set(cur.ax * halfW, cur.ay * halfH, 0);
        rig.scale.setScalar(cur.sc);
        rig.rotation.set(cur.rx + py * -0.08, cur.ry + wob + px * 0.14, cur.rz);

        // destaque por serviço
        const act = st.active;
        parts.forEach((p) => {
            let tgtOp = 1, tgtHl = 0;
            if (st.ghost > 0.001 && act >= 0) {
                const on = PART_OF_SERVICE[act].indexOf(p) >= 0;
                const all = act === 4;
                tgtOp = lerp(1, on || all ? 1 : 0.14, st.ghost);
                tgtHl = on && !all ? st.ghost : 0;
            }
            p.op = damp(p.op, tgtOp, 7, dt);
            p.hl = damp(p.hl, tgtHl, 7, dt);
            const pulse = 0.75 + 0.25 * Math.sin(t * 4.5);
            p.mats.forEach((m) => {
                m.opacity = p.op * (m.userData.baseOp || 1);
                m.depthWrite = p.op > 0.6 && !m.userData.noDepth;
                if (m.userData.hl) { m.emissive.setHex(0x2fe0a6); m.emissiveIntensity = p.hl * 0.11 * (m.userData.hlk == null ? 1 : m.userData.hlk) * pulse; }
            });
            p.g.position.z = lerp(p.zA, p.zE, e);
            p.g.rotation.z = p.spin ? spin : p.g.rotation.z;
        });

        axle.material.opacity = smooth(0.25, 0.9, cur.ex) * 0.7;
        const dh = disc.hl;
        scan.material.opacity = dh * 0.85;
        scan.position.set(0, Math.sin(t * 2.2) * 0.5, disc.g.position.z + 0.045);
        scan.visible = dh > 0.02;

        // partículas
        const dp = dust.geometry.attributes.position;
        for (let i = 0; i < N; i++) {
            let y = dp.getY(i) + (0.05 + (i % 7) * 0.012 - (st.vel || 0) * 0.0009) * dt * 10;
            if (y > 5) y = -5; if (y < -5) y = 5;
            dp.setY(i, y);
        }
        dp.needsUpdate = true;
        dust.rotation.y = px * 0.05;

        renderer.render(scene, camera);
        return true;
    }

    // posição na tela (px) do ponto de destaque de um serviço
    function markerAt(serviceIndex) {
        const list = PART_OF_SERVICE[serviceIndex];
        const p = serviceIndex === 4 ? parts[0] : list[0];
        const anchor = serviceIndex === 4 ? new THREE.Vector3(0, 0, 0) : p.anchor;
        rig.updateMatrixWorld(true);
        v3.copy(anchor);
        p.g.localToWorld(v3);
        v3.project(camera);
        return { x: (v3.x * 0.5 + 0.5) * w, y: (-v3.y * 0.5 + 0.5) * h };
    }

    renderer.domElement.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); document.documentElement.classList.add('no-webgl'); });

    return { update, resize, markerAt };
}
