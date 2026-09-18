export function getResultMessage(score: number, total: number): string {
  if (score >= total) {
    return "WHAT!?! YOU GOT THE PERFECT SCORE 🎉🎉🎉 22/22. HOW IS THAT POSSIBLE???? 🤯🤯 Congratulations! 🥳 The prizes are already taken, but wow — you really know me. Thank you for playing!";
  }

  if (score >= 16) {
    return `You got ${score}/${total}. Woah, that's a high score! You know me well. 😮 Thank you for your participation!`;
  }

  if (score >= 11) {
    return `You got ${score}/${total}. That's great! You know me a lot. 😂 Thank you for your participation~`;
  }

  if (score >= 6) {
    return `You got ${score}/${total}. Nice try! I appreciate your participation. 😁`;
  }

  return `You got ${score}/${total}. Thank you for trying! 🥹`;
}
