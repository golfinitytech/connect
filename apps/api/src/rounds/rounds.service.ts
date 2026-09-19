import { Injectable, NotFoundException } from '@nestjs/common';
import { RoundStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoundDto } from './dto/create-round.dto';
import { UpdateHoleScoreDto } from './dto/update-hole-score.dto';

@Injectable()
export class RoundsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.round.findMany({
      include: {
        course: true,
        teeBox: true,
        players: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    });
  }

  async create(dto: CreateRoundDto) {
    return this.prisma.round.create({
      data: {
        courseId: dto.courseId,
        teeBoxId: dto.teeBoxId,
        gameMode: dto.gameMode,
        status: RoundStatus.IN_PROGRESS,
        startedAt: new Date(),
        players: {
          create: dto.playerIds.map((playerId, index) => ({
            userId: playerId,
            isOwner: index === 0,
          })),
        },
      },
      include: {
        course: true,
        teeBox: true,
        players: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const round = await this.prisma.round.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            holes: {
              orderBy: {
                number: 'asc',
              },
            },
          },
        },
        teeBox: true,
        players: {
          include: { user: true },
        },
        holeScores: {
          include: { hole: true, user: true },
          orderBy: [{ hole: { number: 'asc' } }, { user: { fullName: 'asc' } }],
        },
      },
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    return round;
  }

  async finish(id: string) {
    return this.prisma.round.update({
      where: { id },
      data: {
        status: RoundStatus.FINISHED,
        finishedAt: new Date(),
      },
    });
  }

  async updateHoleScore(
    roundId: string,
    holeNumber: number,
    dto: UpdateHoleScoreDto,
  ) {
    const hole = await this.prisma.hole.findFirst({
      where: {
        course: {
          rounds: {
            some: {
              id: roundId,
            },
          },
        },
        number: holeNumber,
      },
    });

    if (!hole) {
      throw new NotFoundException('Hole not found for round');
    }

    return this.prisma.holeScore.upsert({
      where: {
        roundId_holeId_userId: {
          roundId,
          holeId: hole.id,
          userId: dto.userId,
        },
      },
      update: {
        strokes: dto.strokes,
        putts: dto.putts,
        fairwayHit: dto.fairwayHit,
        gir: dto.gir,
      },
      create: {
        roundId,
        holeId: hole.id,
        userId: dto.userId,
        strokes: dto.strokes,
        putts: dto.putts,
        fairwayHit: dto.fairwayHit,
        gir: dto.gir,
      },
    });
  }
}
