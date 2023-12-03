export interface Clue {
  icon: string;
  short: string;
  full: string;
}

export const clues = {
  who: [
    { icon: "🔴", short: "Scarlett", full: "Miss Scarlett" },
    { icon: "🟡", short: "Mustard", full: "Colonel Mustard" },
    { icon: "⚪️", short: "Orchid", full: "Dr. Orchid" },
    { icon: "🟢", short: "Green", full: "Mr. Green" },
    { icon: "🔵", short: "Peacock", full: "Mrs. Peacock" },
    { icon: "🟣", short: "Plum", full: "Professor Plum" },
  ] satisfies Clue[],

  what: [
    { icon: "🕯️", short: "Candlestick", full: "Candlestick" },
    { icon: "🗡️", short: "Dagger", full: "Dagger" },
    { icon: "🚰", short: "Pipe", full: "Lead Pipe" },
    { icon: "🔫", short: "Revolver", full: "Revolver" },
    { icon: "📿", short: "Rope", full: "Rope" },
    { icon: "🔧", short: "Wrench", full: "Wrench" },
  ] satisfies Clue[],

  where: [
    { icon: "🏀", short: "Ballroom", full: "Ballroom" },
    { icon: "🎱", short: "Billiard", full: "Billiard Room" },
    { icon: "🪴", short: "Conservatory", full: "Conservatory" },
    { icon: "🍽️", short: "Dinning", full: "Dinning Room" },
    { icon: "🏛️", short: "Hall", full: "Hall" },
    { icon: "🏫", short: "Library", full: "Library" },
    { icon: "🛋️", short: "Lounge", full: "Lounge" },
    { icon: "📖", short: "Study", full: "Study" },
  ] satisfies Clue[],
};
