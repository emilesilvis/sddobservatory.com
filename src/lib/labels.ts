export type Tone = 'ok' | 'info' | 'warn' | 'bad' | 'neutral' | 'special';

export function maturityTone(maturity: string): Tone {
  switch (maturity) {
    case 'experimental':
      return 'warn';
    case 'emerging':
      return 'info';
    case 'established':
      return 'ok';
    case 'mature':
      return 'special';
    default:
      return 'neutral';
  }
}

export function driftTone(drift: string): Tone {
  switch (drift) {
    case 'none':
      return 'ok';
    case 'low':
      return 'info';
    case 'moderate':
      return 'warn';
    case 'high':
      return 'bad';
    default:
      return 'neutral';
  }
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'active':
      return 'ok';
    case 'paused':
      return 'warn';
    default:
      return 'neutral';
  }
}
