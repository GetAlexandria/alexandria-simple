export function formatTrackerTime(value: string | null | undefined): string {
  if (value == null || value.length === 0) {
    return "an unknown time";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function failureSentence(
  step: string,
  why: string,
  when: string | null | undefined,
): string {
  return `${step} failed - ${why} - at ${formatTrackerTime(when)}.`;
}

export function doubleBackSentence(
  step: string,
  when: string | null | undefined,
  why: string,
): string {
  return `Doubled back to ${step} at ${formatTrackerTime(when)} because ${why}.`;
}

export function stuckSentence(step: string, count: number): string {
  return `Stuck - tried ${step} ${count}x without getting past it; needs a human.`;
}

export function blockedSentence(step: string): string {
  return `Waiting on you - ${step} needs input.`;
}

export function factorySentence(reason: string): string {
  return `The factory hit a problem running this play - ${reason}. This is not a problem with the play itself; retry once the factory is back.`;
}
