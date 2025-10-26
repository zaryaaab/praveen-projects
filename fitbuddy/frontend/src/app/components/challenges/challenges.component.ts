import { Component, type OnInit } from "@angular/core"

@Component({
  selector: "app-challenges",
  templateUrl: "./challenges.component.html",
  styleUrls: ["./challenges.component.scss"],
})
export class ChallengesComponent implements OnInit {
  activeChallenges = [
    {
      title: "10,000 Steps Daily",
      description: "Walk 10,000 steps every day for a week",
      participants: 248,
      progress: 75,
      daysLeft: 3,
      category: "Steps",
    },
    {
      title: "30-Day Plank Challenge",
      description: "Increase your plank time each day",
      participants: 156,
      progress: 40,
      daysLeft: 18,
      category: "Strength",
    },
    {
      title: "Hydration Hero",
      description: "Drink 3L of water daily for 2 weeks",
      participants: 312,
      progress: 60,
      daysLeft: 6,
      category: "Wellness",
    },
  ]

  leaderboardUsers = [
    { name: "Sarah J.", position: 1, score: "12,456 steps", avatar: null },
    { name: "Mike T.", position: 2, score: "11,872 steps", avatar: null },
    { name: "Alex W.", position: 3, score: "11,234 steps", avatar: null },
    { name: "Jamie L.", position: 4, score: "10,987 steps", avatar: null },
    { name: "Taylor R.", position: 5, score: "10,543 steps", avatar: null },
  ]

  achievements = [
    { name: "Step Master", description: "Reach 10,000 steps for 7 days", unlocked: true },
    { name: "Workout Warrior", description: "Complete 10 workouts", unlocked: true },
    { name: "Hydration Hero", description: "Track water intake for 14 days", unlocked: false },
    { name: "Sleep Expert", description: "7+ hours sleep for 10 days", unlocked: false },
    { name: "Challenge Champion", description: "Win a weekly challenge", unlocked: false },
  ]

  constructor() {}

  ngOnInit(): void {
  }



   joinChallenge(challenge:any) {
    alert(`You have successfully enrolled in ${challenge.title}!`);
  }

  
}

