export const signs = "Aries Taurus Gemini Cancer Leo Virgo Libra Scorpio Sagittarius Capricorn Aquarius Pisces".split(" ");
export type Answers = {name: string; age: string; job: string; love: string; sign: string; dob: string};
export type Reading = {title: string; career: string; connection: string; invitation: string};

export function validate(input: unknown): Answers | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const answers = {} as Answers;
  for (const field of ["name","age","job","love","sign","dob"] as const) {
    const value = raw[field];
    if (typeof value !== "string" || !value.trim() || value.trim().length > 120) return null;
    answers[field] = value.trim();
  }
  const date = new Date(answers.dob + "T00:00:00Z");
  if (!/^\d{1,3}$/.test(answers.age) || Number(answers.age) > 125 ||
      !signs.includes(answers.sign) || !/^\d{4}-\d{2}-\d{2}$/.test(answers.dob) ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== answers.dob ||
      answers.dob > new Date().toISOString().slice(0,10)) return null;
  return answers;
}

export function forecast(a: Answers): Reading {
  let seed = 2166136261;
  for (const ch of [a.name,a.age,a.job,a.love,a.sign,a.dob].join("|")) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  seed >>>= 0;
  const career = [
    `Someone may ask what you would make if you could work as a ${a.job} for one day. Keep your answer close. It could become your first project.`,
    `Your path toward your dream job of ${a.job} may start with a small favor. Someone who sees how you work could remember you for a bigger opportunity.`,
    `An unfinished idea could draw you closer to your dream of becoming a ${a.job}. This month, look for a chance to show someone an early version.`
  ];
  const connection = [
    `A familiar song may give you a reason to reach out to ${a.love}. A simple hello could lead to a conversation you remember.`,
    `You and ${a.love} may discover an interest you never knew you shared. Leave room for a conversation to wander.`,
    `A small kindness could change the tone of your next encounter with ${a.love}. Listen for a detail worth remembering.`
  ];
  const invitation = ["Take the scenic route this week. A change of scenery may give an old idea a new ending.","Write down the question you keep coming back to. The next person you meet might help you answer it.","Say yes to learning one small thing. An unexpected hobby could become part of your next chapter."];
  return { title: ["The open door","A new constellation","The turning tide","The first light"][seed % 4],
    career: career[(seed >>> 4) % 3], connection: connection[(seed >>> 9) % 3], invitation: invitation[(seed >>> 15) % 3] };
}
