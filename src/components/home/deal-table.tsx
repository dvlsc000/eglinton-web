"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationSequence,
} from "motion/react";
import { RotateCcw } from "lucide-react";
import type { Image as ContentImage } from "@/content/types";
import { ease } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* The hand                                                                   */
/* -------------------------------------------------------------------------- */

type Suit = "h" | "d" | "s" | "c";
type PlayingCard = { rank: string; suit: Suit };

const HERO: PlayingCard[] = [
  { rank: "Q", suit: "h" },
  { rank: "Q", suit: "s" },
];
const BOARD: PlayingCard[] = [
  { rank: "Q", suit: "d" },
  { rank: "7", suit: "c" },
  { rank: "7", suit: "h" },
  { rank: "2", suit: "s" },
  { rank: "K", suit: "c" },
];
const RESULT = { hand: "Full house", detail: "Queens full of sevens" };
/** Board cards that make the hand (the rest dim at showdown). */
const BOARD_WINNERS = [0, 1, 2];
const POT = [40, 120, 220, 420];
const STREETS = ["Pre-flop", "Flop", "Turn", "River"];

const SUIT_NAME: Record<Suit, string> = { h: "hearts", d: "diamonds", s: "spades", c: "clubs" };
const RANK_NAME: Record<string, string> = { A: "ace", K: "king", Q: "queen", J: "jack" };
const cardName = (c: PlayingCard) => `${RANK_NAME[c.rank] ?? c.rank} of ${SUIT_NAME[c.suit]}`;
const LABEL = `A dealer deals ${HERO.map(cardName).join(" and ")}, then a board of ${BOARD.map(cardName).join(", ")}. Result: ${RESULT.hand.toLowerCase()}, ${RESULT.detail.toLowerCase()}.`;

/* -------------------------------------------------------------------------- */
/* Card artwork — drawn, no images                                            */
/* -------------------------------------------------------------------------- */

function SuitIcon({ suit, className }: { suit: Suit; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      {suit === "h" && <path d="M50 90C20 66 4 49 4 31 4 16 15 6 28 6c10 0 18 6 22 15 4-9 12-15 22-15 13 0 24 10 24 25 0 18-16 35-46 59z" />}
      {suit === "d" && <path d="M50 3l36 47-36 47-36-47z" />}
      {suit === "s" && (
        <path d="M50 4c12 18 44 36 44 56 0 14-10 22-22 22-8 0-15-4-18-10 1 10 5 18 12 24H34c7-6 11-14 12-24-3 6-10 10-18 10C16 82 6 74 6 60 6 40 38 22 50 4z" />
      )}
      {suit === "c" && (
        <>
          <circle cx="50" cy="27" r="21" />
          <circle cx="27" cy="57" r="21" />
          <circle cx="73" cy="57" r="21" />
          <path d="M45 50c0 26-5 38-15 46h40c-10-8-15-20-15-46z" />
        </>
      )}
    </svg>
  );
}

function CardInner({ card }: { card?: PlayingCard }) {
  const red = card && (card.suit === "h" || card.suit === "d");
  return (
    <>
      <div className="deal-shade" />
      <div className="deal-flip">
        {card && (
          <div className={`deal-face deal-front${red ? " is-red" : ""}`}>
            <div className="deal-corner">
              <b>{card.rank}</b>
              <SuitIcon suit={card.suit} />
            </div>
            {/[JQK]/.test(card.rank) ? <div className="deal-court">{card.rank}</div> : <SuitIcon suit={card.suit} className="deal-pip" />}
            <div className="deal-corner is-flipped">
              <b>{card.rank}</b>
              <SuitIcon suit={card.suit} />
            </div>
          </div>
        )}
        <div className="deal-face deal-back" />
      </div>
    </>
  );
}

const hidden = (vars: Record<string, number | string> = {}) => ({ ...vars, opacity: 0 }) as React.CSSProperties;

/* -------------------------------------------------------------------------- */
/* DealTable                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A full hand of hold'em, dealt the way a dealer does it: burn cards, the
 * flop landing as one stack and spreading, a held beat before the river.
 * One Motion sequence; positions are measured from the CSS layout, so the
 * table re-flows with its container (see `.deal-*` in globals.css).
 */
export function DealTable({ image, startDelay = 0.9 }: { image?: ContentImage; startDelay?: number }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);

  const pot = useMotionValue(0);
  const potText = useTransform(pot, (v) => `€${Math.round(v)}`);
  const street = useMotionValue(0);
  const streetText = useTransform(street, (v) => STREETS[Math.max(0, Math.min(3, Math.round(v)))]);

  // Gentle table tilt toward the pointer (mouse only).
  const tiltX = useSpring(0, { stiffness: 120, damping: 20 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 20 });

  const run = useCallback(
    (instant: boolean, lead = 0.6) => {
      const stage = stageRef.current;
      if (!stage) return;
      controls.current?.stop();
      setDone(false);

      const q = (s: string) => Array.from(stage.querySelectorAll<HTMLElement>(s));
      const deck = q("[data-deck]");
      const burns = q("[data-burn]");
      const board = q("[data-board]");
      const hero = q("[data-hero]");
      const chips = q("[data-chip]");
      const button = q("[data-dealer]");
      const resBar = q("[data-result-bar]");
      const resTxt = q("[data-result-text]");
      const shade = (el: HTMLElement) => el.querySelector<HTMLElement>(".deal-shade")!;
      const flipEl = (el: HTMLElement) => el.querySelector<HTMLElement>(".deal-flip")!;

      const top = deck[deck.length - 1];
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const origin = (el: HTMLElement) => ({ x: top.offsetLeft - el.offsetLeft, y: top.offsetTop - el.offsetTop });

      const seq: AnimationSequence = [];
      const t0 = instant ? 0 : lead;

      /** Card leaves the deck, overshoots its angle, settles. */
      const deal = (el: HTMLElement, at: number, rot: number, tx = 0, dur = 0.55) => {
        const o = origin(el);
        const over = rot + rnd(3, 6) * (Math.random() < 0.5 ? -1 : 1);
        seq.push(
          [el, { opacity: [0, 1] }, { at, duration: 0.01 }],
          [el, { x: [o.x, tx], y: [o.y, 0], rotate: [0.4, over] }, { at, duration: dur, ease: ease.expo }],
          [el, { rotate: [over, rot] }, { at: at + dur, duration: 0.4, ease: "backOut" }],
          [shade(el), { y: [12, 0], opacity: [0.5, 1] }, { at, duration: dur, ease: ease.out }]
        );
      };

      /** Lift, turn over on the Y axis, set down. The shadow narrows edge-on. */
      const flip = (el: HTMLElement, at: number, { lift = 10, scale = 1.06, dur = 0.5 } = {}) => {
        const up = dur * 0.42;
        seq.push(
          [el, { y: [0, -lift], scale: [1, scale] }, { at, duration: up, ease: ease.out }],
          [el, { y: [-lift, 0], scale: [scale, 1] }, { at: at + up, duration: dur - up + 0.08, ease: ease.inOut }],
          [flipEl(el), { rotateY: [0, 180] }, { at, duration: dur, ease: ease.inOut }],
          [shade(el), { y: [0, lift * 1.5], opacity: [1, 0.5] }, { at, duration: up, ease: ease.out }],
          [shade(el), { y: [lift * 1.5, 0], opacity: [0.5, 1] }, { at: at + up, duration: dur - up + 0.08, ease: ease.inOut }],
          [shade(el), { scaleX: [1, 0.12, 1] }, { at, duration: dur, ease: "easeInOut" }]
        );
      };

      const potTo = (from: number, to: number, at: number) => seq.push([pot, [from, to], { at, duration: 0.7, ease: ease.out }]);
      const streetTo = (i: number, at: number) => seq.push([street, [i - 1, i], { at, duration: 0.01 }]);

      const deckRot = [-1.6, 0.9, -0.5, 1.3, -0.9, 0.4];
      const boardRot = [-0.6, 0.5, -0.3, 0.8, -0.4];
      const burnRot = [-9, 4, 13];
      const heroRot = [-7, 6];
      const stackX = W * 0.22 - W * 0.5;
      const stackY = H * 0.74 - H * 0.54;

      // Table set: deck drops in, chips and dealer button appear.
      deck.forEach((el, k) =>
        seq.push([el, { opacity: [0, 1], y: [-30, 0], rotate: [deckRot[k] + 8, deckRot[k]] }, { at: Math.max(0, t0 - 0.6) + k * 0.045, duration: 0.6, ease: ease.expo }])
      );
      chips.forEach((el, k) =>
        seq.push([el, { opacity: [0, 1], x: [stackX, stackX], y: [stackY - 14, stackY] }, { at: Math.max(0, t0 - 0.45) + k * 0.035, duration: 0.4, ease: ease.out }])
      );
      seq.push([button, { opacity: [0, 1], scale: [0.8, 1] }, { at: Math.max(0, t0 - 0.35), duration: 0.4, ease: "backOut" }]);
      seq.push([pot, [0, 0], { at: 0, duration: 0.01 }], [street, [0, 0], { at: 0, duration: 0.01 }]);
      seq.push([resBar, { scaleX: [0, 0] }, { at: 0, duration: 0.01 }], [resTxt, { opacity: [0, 0], y: ["100%", "100%"] }, { at: 0, duration: 0.01 }]);

      // Pre-flop: two hole cards, a peek, a bet.
      let t = Math.max(t0, 0.6);
      deal(hero[0], t, heroRot[0]);
      deal(hero[1], t + 0.24, heroRot[1]);
      t += 0.95;
      flip(hero[0], t, { lift: 8 });
      flip(hero[1], t + 0.12, { lift: 8 });
      t += 0.85;
      chips.forEach((el, k) => seq.push([el, { x: [stackX, 0], y: [stackY, 0] }, { at: t + k * 0.045, duration: 0.62, ease: ease.inOut }]));
      potTo(0, POT[0], t + 0.45);

      // Flop: burn, three cards as one stack, turn together, spread.
      t += 1.15;
      deal(burns[0], t, burnRot[0], 0, 0.45);
      t += 0.4;
      streetTo(1, t);
      const s0 = board[0].offsetLeft;
      deal(board[0], t, boardRot[0]);
      deal(board[1], t + 0.05, boardRot[0], s0 - board[1].offsetLeft);
      deal(board[2], t + 0.1, boardRot[0], s0 - board[2].offsetLeft);
      t += 0.95;
      [0, 1, 2].forEach((i) => flip(board[i], t, { lift: 10, dur: 0.55 }));
      t += 0.7;
      [1, 2].forEach((i, k) =>
        seq.push([board[i], { x: [s0 - board[i].offsetLeft, 0], rotate: [boardRot[0], boardRot[i]] }, { at: t + k * 0.06, duration: 0.55, ease: ease.expo }])
      );
      potTo(POT[0], POT[1], t + 0.3);

      // Turn.
      t += 1.0;
      deal(burns[1], t, burnRot[1], 0, 0.45);
      t += 0.4;
      streetTo(2, t);
      deal(board[3], t, boardRot[3]);
      t += 0.95;
      flip(board[3], t);
      potTo(POT[1], POT[2], t + 0.5);

      // River: a held beat, a higher, slower turn.
      t += 1.0;
      deal(burns[2], t, burnRot[2], 0, 0.45);
      t += 0.4;
      streetTo(3, t);
      deal(board[4], t, boardRot[4]);
      t += 1.35;
      flip(board[4], t, { lift: 18, scale: 1.1, dur: 0.8 });

      // Showdown.
      t += 1.0;
      potTo(POT[2], POT[3], t - 0.3);
      const winners = [...hero, ...BOARD_WINNERS.map((i) => board[i])];
      board.forEach((el, i) => {
        if (!BOARD_WINNERS.includes(i)) seq.push([el, { opacity: [1, 0.3] }, { at: t, duration: 0.5, ease: ease.out }]);
      });
      winners.forEach((el, k) => seq.push([el, { y: [0, -10] }, { at: t + k * 0.05, duration: 0.5, ease: "backOut" }]));
      seq.push(
        [resBar, { scaleX: [0, 1] }, { at: t + 0.1, duration: 0.55, ease: ease.inOut }],
        [resTxt, { opacity: [0, 1], y: ["100%", "0%"] }, { at: t + 0.4, duration: 0.5, ease: ease.expo }]
      );

      const c = animate(seq);
      controls.current = c;
      if (instant) c.complete();
      c.then(() => setDone(true));
    },
    [pot, street]
  );

  // Deal once the table is on screen (on phones it sits below the fold).
  // Building the sequence is a one-off ~25ms task, so it waits until the
  // hero's own intro has settled; the deck starts falling as it is built.
  const inView = useInView(stageRef, { once: true, amount: 0.4 });
  useEffect(() => {
    if (!inView) return;
    const wait = reduce ? 0 : Math.max(0, startDelay - 0.6) * 1000;
    const id = window.setTimeout(() => run(!!reduce, 0.6), wait);
    return () => {
      window.clearTimeout(id);
      controls.current?.stop();
    };
  }, [inView, run, reduce, startDelay]);

  // Layout changed mid-deal: jump to the finished hand (final positions are layout-relative).
  useEffect(() => {
    const onResize = () => controls.current?.complete();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={stageRef}
      className="deal-stage"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !stageRef.current) return;
        const r = stageRef.current.getBoundingClientRect();
        tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 6);
        tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
      }}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
    >
      {image?.src && <Image src={image.src} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover opacity-20" />}

      <motion.div role="img" aria-label={LABEL} className="deal-tilt" style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400 }}>
        <div aria-hidden className="deal-rail" />
        {Array.from({ length: 6 }, (_, k) => (
          <div key={`d${k}`} data-deck className="deal-card deal-deck" style={hidden({ "--k": k })}>
            <CardInner />
          </div>
        ))}
        {Array.from({ length: 3 }, (_, k) => (
          <div key={`b${k}`} data-burn className="deal-card deal-muck" style={hidden()}>
            <CardInner />
          </div>
        ))}
        {BOARD.map((card, i) => (
          <div key={`board${i}`} data-board className="deal-card deal-board" style={hidden({ "--i": i })}>
            <CardInner card={card} />
          </div>
        ))}
        {HERO.map((card, i) => (
          <div key={`hero${i}`} data-hero className="deal-card deal-hero" style={hidden({ "--i": i })}>
            <CardInner card={card} />
          </div>
        ))}
        {Array.from({ length: 6 }, (_, k) => (
          <div key={`c${k}`} data-chip className="deal-chip" style={hidden({ "--k": k, "--cx": `${[0, 1, -1, 2, 0, -1][k]}px` })} />
        ))}
        <div data-dealer className="deal-dealer" style={hidden()}>
          Dealer
        </div>
      </motion.div>

      {/* Scoreboard readout */}
      <div aria-hidden className="deal-readout">
        <span className="deal-readout-label">Pot</span>
        <motion.b className="nums">{potText}</motion.b>
        <motion.span className="deal-readout-label">{streetText}</motion.span>
      </div>

      <div className="deal-result-row">
        <span aria-hidden className="deal-result">
          <span data-result-bar className="deal-result-bar" style={{ transform: "scaleX(0)" }} />
          <span data-result-text className="deal-result-text" style={{ opacity: 0 }}>
            {RESULT.hand} <i>· {RESULT.detail}</i>
          </span>
        </span>
        <motion.button
          type="button"
          onClick={() => run(!!reduce)}
          className="deal-again"
          initial={false}
          animate={{ opacity: done ? 1 : 0, x: done ? 0 : -8 }}
          transition={{ duration: 0.4, ease: ease.expo }}
          tabIndex={done ? 0 : -1}
          aria-hidden={!done}
        >
          <RotateCcw aria-hidden className="size-3.5" strokeWidth={2.25} />
          Deal again
        </motion.button>
      </div>
    </div>
  );
}
