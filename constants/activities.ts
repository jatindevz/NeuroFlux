// path: /home/jatin/Documents/RN/bep/constants/activities.ts
import Colors from "@/constants/colors";
import { Activity } from "@/types/brain";

export const ACTIVITIES: Activity[] = [
  {
    id: "doom-scroll",
    label: "Doom Scroll",
    icon: "Smartphone",
    energyDelta: -8,
    volatilityDelta: 12,
    color: Colors.activityScroll,
    isAddictive: true,
  },
  {
    id: "deep-work",
    label: "Deep Work",
    icon: "BookOpen",
    energyDelta: 10,
    volatilityDelta: -8,
    color: Colors.activityStudy,
  },
  {
    id: "walk",
    label: "Walk",
    icon: "Footprints",
    energyDelta: 7,
    volatilityDelta: -6,
    color: Colors.activityWalk,
  },
  {
    id: "meditate",
    label: "Meditate",
    icon: "Wind",
    energyDelta: 4,
    volatilityDelta: -12,
    color: Colors.activityMeditate,
  },
  {
    id: "coffee",
    label: "Coffee",
    icon: "Coffee",
    energyDelta: 5,
    volatilityDelta: 6,
    color: Colors.activityCoffee,
  },
  {
    id: "sleep",
    label: "Good Sleep",
    icon: "Moon",
    energyDelta: 12,
    volatilityDelta: -10,
    color: Colors.activitySleep,
  },
  {
    id: "junk-food",
    label: "Junk Food",
    icon: "Pizza",
    energyDelta: -5,
    volatilityDelta: 8,
    color: Colors.activityJunk,
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: "Gamepad2",
    energyDelta: -3,
    volatilityDelta: 7,
    color: Colors.activityGaming,
  },
];
