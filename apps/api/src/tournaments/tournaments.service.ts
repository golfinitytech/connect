import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  private chatMessagesByTournamentId = new Map<string, any[]>();

  private async getActiveTournamentId(course?: string) {
    const activeTournament = await this.prisma.tournament.findFirst({
      where: { 
        publishedAt: { not: null },
        ...(course && { course })
      },
      orderBy: { publishedAt: 'desc' },
      select: { id: true },
    });
    return activeTournament?.id || null;
  }

  async create(data: any) {
    try {
      const info = data?.info || {};
      const groups = Array.isArray(data?.groups) ? data.groups : [];
      const players = Array.isArray(data?.players) ? data.players : [];
      console.log('--- START TOURNAMENT CREATION ---');
      console.log('Tournament Info:', JSON.stringify(info));
      console.log('Number of Groups:', groups?.length);

      const archivePrevious = !!data?.archivePrevious;

      // 1. Either archive the previously published tournament (keep as history),
      // or replace it (delete the active one) for normal edits/republish.
      if (archivePrevious) {
        await this.prisma.tournament.updateMany({
          where: { publishedAt: { not: null } },
          data: { publishedAt: null },
        });
        console.log('1. Existing published tournament archived.');
      } else {
        await this.prisma.tournament.deleteMany({
          where: { publishedAt: { not: null } },
        });
        console.log('1. Existing published tournament replaced (deleted active).');
      }

      // 2. Prepare the tournament creation
      // We create the tournament first so we can link players to it
      const createdTournament = await this.prisma.tournament.create({
        data: {
          name: info.name || 'Tournament Participants',
          date: new Date(info.date || new Date()),
          course: info.course || 'Default Course',
          teeBox: info.tee || info.teeBox || 'White',
          teeTime: info.teeTime || '07:00',
          rules: info.rules || 'Stroke Play',
          scoringMethod: info.scoringMethod || 'System 36',
          publishedAt: new Date(),
        },
      });

      const tournamentSuffix = (createdTournament?.id || '').slice(-6).toUpperCase();
      console.log('2. Base tournament created:', createdTournament.id);

      // 3. Create groups and players nested under the tournament (or players without groups)
      let playerCounter = 1;
      const currentYear = new Date().getFullYear();

      if (groups.length > 0) {
        for (const g of groups) {
          await this.prisma.tournamentGroup.create({
            data: {
              tournament: { connect: { id: createdTournament.id } },
              code: tournamentSuffix ? `${g.code}-${tournamentSuffix}` : g.code,
              flightType: g.flightType,
              caddieData: g.caddie ? g.caddie : undefined,
              players: {
                create: (g.players || []).map((p: any) => {
                  const playerCode = `GF-PLY-${currentYear}-${tournamentSuffix}-${(playerCounter++).toString().padStart(4, '0')}`;
                  const hcp = parseInt(p.handicap) || 0;
                  let flight = p.flight;
                  if (!flight) {
                    if (hcp >= 1 && hcp <= 13) flight = 'A';
                    else if (hcp >= 14 && hcp <= 21) flight = 'B';
                    else flight = 'C';
                  }
                  return {
                    tournament: { connect: { id: createdTournament.id } },
                    code: playerCode,
                    name: p.name,
                    dob: p.dob || '',
                    shirtSize: p.shirtSize || 'L',
                    phone: p.phone || '',
                    email: p.email || '',
                    handicap: hcp,
                    flight,
                  };
                }),
              },
            },
          });
        }
      } else if (players.length > 0) {
        for (const p of players) {
          const playerCode = `GF-PLY-${currentYear}-${tournamentSuffix}-${(playerCounter++).toString().padStart(4, '0')}`;
          const hcp = parseInt(p.handicap) || 0;
          let flight = p.flight;
          if (!flight) {
            if (hcp >= 1 && hcp <= 13) flight = 'A';
            else if (hcp >= 14 && hcp <= 21) flight = 'B';
            else flight = 'C';
          }
          await this.prisma.tournamentPlayer.create({
            data: {
              tournament: { connect: { id: createdTournament.id } },
              code: playerCode,
              name: p.name,
              dob: p.dob || '',
              shirtSize: p.shirtSize || 'L',
              phone: p.phone || '',
              email: p.email || '',
              handicap: hcp,
              flight,
            },
          });
        }
      }

      console.log('3. Groups and players created successfully');

      // 4. Return the full tournament data
      const result = await this.prisma.tournament.findUnique({
        where: { id: createdTournament.id },
        include: {
          players: true,
          groups: {
            include: {
              players: true,
            },
          },
        },
      });

      console.log('--- END TOURNAMENT CREATION ---');
      return result;
    } catch (error) {
      console.error('CRITICAL ERROR in TournamentsService.create:');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      if (error.code) console.error('Prisma Error Code:', error.code);
      if (error.meta) console.error('Error Metadata:', JSON.stringify(error.meta));
      throw error;
    }
  }

  async findAll(course?: string) {
    return this.prisma.tournament.findMany({
      where: course ? { course } : undefined,
      include: {
        players: true,
        groups: {
          include: {
            players: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActive(course?: string) {
    const tournament = await this.prisma.tournament.findFirst({
      where: {
        publishedAt: { not: null },
        ...(course && { course })
      },
      include: {
        players: true,
        groups: {
          include: {
            players: true
          }
        },
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    if (tournament) {
      // Map JSON data back to properties so frontend can use it directly
      tournament.groups = tournament.groups.map(g => ({
        ...g,
        caddie: g.caddieData ? (g.caddieData as any) : undefined,
        players: g.scoresData ? (g.scoresData as any) : g.players
      }));
    }

    return tournament;
  }

  async syncScores(flightCode: string, players: any[], caddie?: any, course?: string) {
    const activeTournamentId = await this.getActiveTournamentId(course);
    if (!activeTournamentId) return null;

    const group = await this.prisma.tournamentGroup.findFirst({
      where: {
        tournamentId: activeTournamentId,
        code: flightCode,
      },
      select: { id: true },
    });

    if (!group) return null;

    return await this.prisma.tournamentGroup.update({
      where: { id: group.id },
      data: {
        scoresData: players,
        ...(caddie ? { caddieData: caddie } : {}),
      },
    });
  }

  async appendChatMessage(data: { to: 'control' | 'all' | 'marshal', fromRole: 'caddie' | 'admin' | 'marshal', from: string, text: string, course?: string }) {
    const activeTournamentId = await this.getActiveTournamentId(data.course);
    if (!activeTournamentId) return null;

    const text = (data?.text || '').toString().trim();
    if (!text) return null;

    const msg = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ts: Date.now(),
      to: data.to,
      fromRole: data.fromRole,
      from: (data.from || '').toString(),
      text,
    };

    const existing = this.chatMessagesByTournamentId.get(activeTournamentId) || [];
    const next = [...existing, msg].slice(-500);
    this.chatMessagesByTournamentId.set(activeTournamentId, next);
    return msg;
  }

  async getChatMessages(since?: number, course?: string) {
    const activeTournamentId = await this.getActiveTournamentId(course);
    if (!activeTournamentId) return [];
    const existing = this.chatMessagesByTournamentId.get(activeTournamentId) || [];
    if (!since) return existing;
    return existing.filter((m: any) => (m?.ts || 0) > since);
  }

  async deleteAll() {
    try {
      // With Cascade Delete set up in schema, deleting from Tournament 
      // will automatically clean up Players and Groups.
      // We only need to delete the main Tournament entries.
      return await this.prisma.tournament.deleteMany();
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  }

  // Record Caddie Mode Round
  async recordCaddieRound(data: any) {
    return { success: true, message: 'Caddie round recorded (mock implementation)' };
  }
}
