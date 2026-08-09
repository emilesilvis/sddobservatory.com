import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PACKET_DIR = resolve(ROOT, 'docs/research/drift-evidence-v3');
const [leftPath, rightPath] = process.argv.slice(2);
if (!leftPath || !rightPath) throw new Error('Usage: tsx scripts/compare-drift-assessments-v3.ts <run-1.json> <run-2.json>');

const index = JSON.parse(readFileSync(resolve(PACKET_DIR, 'index.json'), 'utf8'));
const left = JSON.parse(readFileSync(resolve(ROOT, leftPath), 'utf8'));
const right = JSON.parse(readFileSync(resolve(ROOT, rightPath), 'utf8'));
if (!Array.isArray(left) || !Array.isArray(right) || left.length !== 22 || right.length !== 22) throw new Error('Both runs must contain 22 results');

const levels = ['unknown', 'none', 'low', 'moderate', 'high'];
const rows = index.packets.map((packet: any, position: number) => {
  const a = left[position];
  const b = right[position];
  if (a.packet_id !== packet.packet_id || b.packet_id !== packet.packet_id) throw new Error(`${packet.slug}: packet order mismatch`);
  const leftLevel = levels.indexOf(a.drift_rating);
  const rightLevel = levels.indexOf(b.drift_rating);
  if (leftLevel < 0 || rightLevel < 0) throw new Error(`${packet.slug}: invalid rating`);
  return {
    slug: packet.slug,
    run_1: a.drift_rating,
    run_2: b.drift_rating,
    exact: a.drift_rating === b.drift_rating,
    level_distance: Math.abs(leftLevel - rightLevel),
  };
});
const exact = rows.filter((row: any) => row.exact).length;
const swings = rows.filter((row: any) => row.level_distance >= 2).length;
const distribution = (run: any[]) => Object.fromEntries(levels.map((level) => [level, run.filter((result) => result.drift_rating === level).length]));
console.log(JSON.stringify({
  exact,
  total: 22,
  exact_percentage: Math.round((exact / 22) * 1000) / 10,
  two_level_or_greater_swings: swings,
  accepted: exact >= 18 && swings === 0,
  run_1_distribution: distribution(left),
  run_2_distribution: distribution(right),
  rows,
}, null, 2));
