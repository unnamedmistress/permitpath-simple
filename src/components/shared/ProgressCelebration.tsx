import { useEffect, useState } from 'react';
import { Sparkles, Trophy, Star, PartyPopper } from 'lucide-react';

interface ProgressCelebrationProps {
  progress: number;
  previousProgress?: number;
}

const MILESTONES = [
  { threshold: 25, message: "Great start! 🎉", icon: Star, color: "text-yellow-500" },
  { threshold: 50, message: "Halfway there! 🌟", icon: Sparkles, color: "text-blue-500" },
  { threshold: 75, message: "Almost done! 🚀", icon: Trophy, color: "text-purple-500" },
  { threshold: 100, message: "All set! Ready to submit! 🎊", icon: PartyPopper, color: "text-green-500" },
];

export default function ProgressCelebration({ progress, previousProgress = 0 }: ProgressCelebrationProps) {
  const [showing, setShowing] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<typeof MILESTONES[0] | null>(null);

  useEffect(() => {
    // Check if we crossed a milestone
    const crossedMilestone = MILESTONES.find(m => 
      previousProgress < m.threshold && progress >= m.threshold
    );

    if (crossedMilestone) {
      setCurrentMilestone(crossedMilestone);
      setShowing(true);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowing(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [progress, previousProgress]);

  if (!showing || !currentMilestone) return null;

  const Icon = currentMilestone.icon;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 animate-in fade-in duration-300" />
      
      {/* Celebration Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm animate-in zoom-in-95 duration-300 pointer-events-auto">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 ${currentMilestone.color}`}>
          <Icon size={32} className={currentMilestone.color} />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">{currentMilestone.message}</h3>
        <p className="text-center text-muted-foreground text-sm">
          {progress === 100 
            ? "You've completed all requirements. Time to submit to the county!"
            : `You're ${progress}% done. Keep up the great work!`
          }
        </p>
        
        {/* Confetti effect using CSS */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399'][i % 4],
                left: `${10 + (i * 8)}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
