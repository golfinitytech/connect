-- Drop unique indexes on code fields so tournaments can be archived without code collisions across tournaments
-- (codes are now unique per tournamentId + code)

-- DropIndex
DROP INDEX `TournamentGroup_code_key` ON `TournamentGroup`;

-- DropIndex
DROP INDEX `TournamentPlayer_code_key` ON `TournamentPlayer`;

-- CreateIndex
CREATE UNIQUE INDEX `TournamentGroup_tournamentId_code_key` ON `TournamentGroup`(`tournamentId`, `code`);
CREATE INDEX `TournamentGroup_code_idx` ON `TournamentGroup`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `TournamentPlayer_tournamentId_code_key` ON `TournamentPlayer`(`tournamentId`, `code`);
CREATE INDEX `TournamentPlayer_code_idx` ON `TournamentPlayer`(`code`);

