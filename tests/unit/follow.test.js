import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createFollower } from '../../assets/js/lib/follow.js';

/** Avance jusqu'à la cible et rend toutes les positions intermédiaires. */
function run(follower, limit = 500) {
  const positions = [];
  for (let frame = 0; frame < limit; frame += 1) {
    const position = follower.step();
    positions.push(position);
    if (position.settled) return positions;
  }
  assert.fail(`cible non atteinte en ${limit} images`);
}

describe('createFollower', () => {
  it('parcourt à chaque image la même part de l’écart (0,2 par défaut)', () => {
    const follower = createFollower({ x: 0, y: 0 });
    follower.setTarget(100, 50);

    assert.deepEqual(follower.step(), { x: 20, y: 10, settled: false });
    assert.deepEqual(follower.step(), { x: 36, y: 18, settled: false });
  });

  it('respecte une autre part de l’écart', () => {
    const follower = createFollower({ x: 10, y: 10 }, { ease: 0.5 });
    follower.setTarget(30, -10);
    assert.deepEqual(follower.step(), { x: 20, y: 0, settled: false });
  });

  it('atteint la cible sans jamais la dépasser, puis s’y pose exactement', () => {
    const follower = createFollower({ x: 0, y: 0 });
    follower.setTarget(300, -120);

    const positions = run(follower);
    for (let index = 1; index < positions.length; index += 1) {
      assert.ok(positions[index].x >= positions[index - 1].x && positions[index].x <= 300);
      assert.ok(positions[index].y <= positions[index - 1].y && positions[index].y >= -120);
    }
    assert.deepEqual(positions.at(-1), { x: 300, y: -120, settled: true });
  });

  it('est immédiatement posé quand il part de sa cible', () => {
    assert.deepEqual(createFollower({ x: 4, y: 2 }).step(), { x: 4, y: 2, settled: true });
  });

  it('ne se pose que si les deux axes ont rejoint la cible', () => {
    const follower = createFollower({ x: 0, y: 0 });
    follower.setTarget(0.05, 100);
    assert.equal(follower.step().settled, false);
  });

  it('se pose dès que l’écart passe sous la précision demandée, sur chaque axe', () => {
    // Écarts restants : 20, puis 10 (égal à la précision : pas encore posé), puis 5.
    for (const [x, y] of [
      [40, 0],
      [0, 40],
    ]) {
      const follower = createFollower({ x: 0, y: 0 }, { ease: 0.5, precision: 10 });
      follower.setTarget(x, y);
      assert.equal(run(follower).length, 3, `cible (${x}, ${y})`);
    }
  });

  it('rejoint la cible en une image avec ease = 1', () => {
    const follower = createFollower({ x: 0, y: 0 }, { ease: 1 });
    follower.setTarget(-7, 9);
    assert.deepEqual(follower.step(), { x: -7, y: 9, settled: true });
  });

  it('refuse une part de l’écart hors de ]0, 1]', () => {
    for (const ease of [0, -0.1, 1.5, Number.NaN]) {
      assert.throws(() => createFollower({ x: 0, y: 0 }, { ease }), {
        name: 'RangeError',
        message: `ease doit être compris dans ]0, 1] (reçu : ${ease})`,
      });
    }
  });
});
