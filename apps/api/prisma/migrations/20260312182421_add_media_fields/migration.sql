-- AlterTable
ALTER TABLE `Course` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `subtitle` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarUrl` VARCHAR(191) NULL;
