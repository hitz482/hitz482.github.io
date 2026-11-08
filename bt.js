// The Warden's behavior tree in the #ai app frame: the client's own debugger view, stepping
// through one run (the attack branch fails, the selector falls back to cover). One loop of
// about 3.4 s, the kit's pause button, still on a phone and under reduced motion, only on screen.
import { pausable } from './assets/ui/ui.js';

const pane = document.querySelector('[data-bt]');
if (pane) {
  const status = pane.querySelector('[data-bt-status]');
  const steps = [
    ['sel', 'run'], ['seqL', 'run'], ['eqsL', 'ok'], ['mvL', 'fail'], ['seqL', 'fail'],
    ['seqR', 'run'], ['eqsR', 'ok'], ['mvR', 'ok'], ['seqR', 'ok'], ['sel', 'ok'],
  ];
  const names = {
    sel: 'Selector', seqL: 'Attack', seqR: 'Cover', eqsL: 'EQS query, find target',
    mvL: 'Move to target', eqsR: 'EQS query, find cover', mvR: 'Move to cover',
  };
  const word = { run: 'Running', ok: 'Succeeded', fail: 'Failed' };
  const STEP = 300, HOLD = 450;
  const still = matchMedia('(prefers-reduced-motion: reduce), (max-width: 639px)');

  const set = (id, state) => {
    pane.querySelectorAll(`[data-n="${id}"]`).forEach(n => {
      n.classList.remove('is-run', 'is-ok', 'is-fail');
      n.classList.add(`is-${state}`);
    });
    status.textContent = `${word[state]}: ${names[id]}`;
  };
  const clear = () => pane.querySelectorAll('[data-n]').forEach(n => n.classList.remove('is-run', 'is-ok', 'is-fail'));
  const finished = () => { clear(); steps.forEach(([id, s]) => set(id, s)); };

  let i = 0, timer = 0, paused = false, visible = false;
  const tick = () => {
    if (i === 0) clear();
    set(...steps[i]);
    i = (i + 1) % steps.length;
    timer = setTimeout(tick, i === 0 ? HOLD + STEP : STEP);
  };
  const stop = () => { clearTimeout(timer); timer = 0; };
  const go = () => { if (!timer && visible && !paused && !still.matches) tick(); };

  finished();
  if (!still.matches) {
    pausable(pane.closest('[data-ui-pause-host]'), {
      pause() { paused = true; stop(); },
      resume() { paused = false; go(); },
    });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? go() : stop(); }).observe(pane);
    pane.closest('.app').addEventListener('pointerenter', () => { if (paused) return; stop(); i = 0; go(); });
  }
}
