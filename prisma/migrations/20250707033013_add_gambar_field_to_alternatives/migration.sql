-- CreateTable
CREATE TABLE `alternatives` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaPerumahan` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `harga` DOUBLE NOT NULL,
    `jarak` DOUBLE NOT NULL,
    `fasilitas` INTEGER NOT NULL,
    `transportasi` INTEGER NOT NULL,
    `gambar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `criterias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `bobot` DOUBLE NOT NULL,
    `tipe` ENUM('benefit', 'cost') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `hasil` JSON NOT NULL,
    `alternatifTerbaik` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
