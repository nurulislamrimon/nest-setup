-- CreateTable
CREATE TABLE `Administrator` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('user', 'manager', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
    `password` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `login_ip` VARCHAR(191) NULL,
    `failed_attemp_ip` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Administrator_email_key`(`email`),
    INDEX `Administrator_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Help_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('new', 'open', 'cancelled', 'reopened', 'waiting_feedback', 'on_hold', 'successful_conversion') NOT NULL DEFAULT 'new',
    `type` ENUM('general', 'quick') NOT NULL DEFAULT 'general',
    `platform_name` VARCHAR(191) NULL,
    `client_name` VARCHAR(191) NULL,
    `service_required` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `budget_min` INTEGER NULL,
    `budget_max` INTEGER NULL,
    `project_description` VARCHAR(191) NULL,
    `referral_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mail_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_name` VARCHAR(191) NOT NULL,
    `template_type` VARCHAR(191) NOT NULL,
    `template_path` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mail_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `platform_name` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 465,
    `host` VARCHAR(191) NOT NULL,
    `pass` VARCHAR(191) NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mailing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiver_mail` VARCHAR(191) NULL,
    `receiver_mails` JSON NULL,
    `receiver_mails_count` INTEGER NULL,
    `sender` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `template_path` VARCHAR(191) NOT NULL,
    `mail_config_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `Mailing_receiver_mail_idx`(`receiver_mail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parcel_statistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(191) NOT NULL,
    `courierData` JSON NOT NULL,
    `reports` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Parcel_statistics_phone_key`(`phone`),
    INDEX `Parcel_statistics_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mailing` ADD CONSTRAINT `Mailing_mail_config_id_fkey` FOREIGN KEY (`mail_config_id`) REFERENCES `Mail_config`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
