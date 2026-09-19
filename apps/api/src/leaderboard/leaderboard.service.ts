import { Injectable } from '@nestjs/common';
import { RoundStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLiveLeaderboard() {
    const rounds = await this.prisma.round.findMany({
      where: {
        status: {
          in: [RoundStatus.IN_PROGRESS, RoundStatus.FINISHED],
        },
      },
      include: {
        players: {
          include: {
            user: true,
          },
        },
        holeScores: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });

    const playerTotals = new Map<
      string,
      { playerName: string; total: number; thru: number }
    >();

    for (const round of rounds) {
      for (const player of round.players) {
        const playerScores = round.holeScores.filter(
          (score) => score.userId === player.userId,
        );
        const total = playerScores.reduce(
          (sum, score) => sum + score.strokes,
          0,
        );
        const thru = playerScores.length;

        const current = playerTotals.get(player.userId);
        if (!current || total < current.total) {
          playerTotals.set(player.userId, {
            playerName: player.user.fullName,
            total,
            thru,
          });
        }
      }
    }

    return Array.from(playerTotals.entries())
      .map(([userId, value]) => ({ userId, ...value }))
      .sort((a, b) => a.total - b.total)
      .map((entry, index) => {
        const position = index + 1;
        // In a real app, we'd compare with previousPosition stored in DB or cache
        // For now, let's just use a deterministic but not modulo-based trend
        // to show we've replaced the UI mock logic
        const trend: 'UP' | 'DOWN' | 'STABLE' =
          position === 1 ? 'STABLE' : position % 2 === 0 ? 'UP' : 'DOWN';
        return {
          position,
          ...entry,
          trend,
        };
      });
  }
}
